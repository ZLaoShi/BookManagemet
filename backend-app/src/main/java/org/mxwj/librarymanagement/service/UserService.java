package org.mxwj.librarymanagement.service;

import io.smallrye.mutiny.Uni;

import org.hibernate.reactive.mutiny.Mutiny;
import org.mxwj.librarymanagement.lib.DatabaseManager;
import org.mxwj.librarymanagement.model.PageInfo;
import org.mxwj.librarymanagement.model.User;
import org.mxwj.librarymanagement.model.UsersPage;

import java.util.List;

public class UserService {
    private final Mutiny.SessionFactory factory;

    public UserService() {
        factory = DatabaseManager.getSessionFactory();
    }

    public Uni<User> findById(Integer id) {
        return factory.withSession(session ->
            session.find(User.class, id)
        ).onFailure().invoke(error -> {
            System.err.println("数据库查询错误: " + error.getMessage());
            error.printStackTrace();
        });
    }

    public Uni<List<User>> findAll() {
        return factory.withSession(session ->
            session.createQuery("FROM User", User.class).getResultList()
        ).onFailure().invoke(error -> {
            System.err.println("查询所有用户失败: " + error.getMessage());
            error.printStackTrace();
        });
    }

    public Uni<UsersPage> findAllPaged(int page, int size, String orderBy) {
        return factory.withSession(session ->
            // 先执行计数查询
            session.createQuery("SELECT COUNT(u) FROM User u", Long.class)
                .getSingleResult()
                // 然后执行分页查询
                .chain(total -> {
                    String query = String.format("FROM User u ORDER BY u.%s", orderBy);
                    return session.createQuery(query, User.class)
                        .setFirstResult((page - 1) * size)
                        .setMaxResults(size)
                        .getResultList()
                        .map(users -> {
                            int totalPages = (int) Math.ceil((double) total / size);
                            PageInfo pageInfo = PageInfo.builder()
                                .currentPage(page)
                                .pageSize(size)
                                .totalPages(totalPages)
                                .totalElements(total.intValue())
                                .hasNext(page < totalPages)
                                .build();

                            return UsersPage.builder()
                                .content(users)
                                .pageInfo(pageInfo)
                                .build();
                        });
                })
        );
    }

    public Uni<User> createUser(User user) {
        return factory.withSession(session ->
            session.persist(user)
                .call(session::flush)  // 使用 call 替代 chain
                .replaceWith(user)     // 使用 replaceWith 替代 map
                .onFailure().invoke(error -> {
                    System.err.println("创建用户失败");
                    error.printStackTrace();
                })
        );
    }

    public Uni<User> updateUser(Integer id, User updatedUser) {
        return factory.withSession(session ->
            session.find(User.class, id)
                .onItem().ifNotNull().transform(existingUser -> {
                    existingUser.setName(updatedUser.getName());
                    existingUser.setEmail(updatedUser.getEmail());
                    return existingUser;
                })
                .call(() -> session.flush())
        );
    }

    public Uni<Boolean> deleteUser(Integer id) {
        return factory.withSession(session ->
            session.find(User.class, id)
                .onItem().ifNotNull().transformToUni(user ->
                    session.remove(user)
                        .call(session::flush)
                        .replaceWith(true)
                )
                .onItem().ifNull().continueWith(false)
        );
    }
}
