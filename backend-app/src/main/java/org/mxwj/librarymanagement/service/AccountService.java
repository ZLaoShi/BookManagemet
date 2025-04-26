package org.mxwj.librarymanagement.service;

import io.smallrye.mutiny.Uni;
import org.hibernate.reactive.mutiny.Mutiny;
import org.mxwj.librarymanagement.lib.DatabaseManager;
import org.mxwj.librarymanagement.model.Account;
import org.mxwj.librarymanagement.model.AccountPage;
import org.mxwj.librarymanagement.model.dto.LoginDTO;
import org.mxwj.librarymanagement.model.dto.RegisterDTO;
import org.mxwj.librarymanagement.model.dto.UpdateAccountStatusDTO;
import org.mxwj.librarymanagement.model.vo.LoginVO;
import org.mxwj.librarymanagement.utils.JWTUtils;
import org.mxwj.librarymanagement.model.PageInfo;

import io.vertx.core.Future;
import io.vertx.core.Vertx;
import jakarta.persistence.NoResultException;

import org.mindrot.jbcrypt.BCrypt;
import java.time.OffsetDateTime;

public class AccountService {
    private final Mutiny.SessionFactory factory;
    private final JWTUtils jwtUtils;

    public AccountService(Vertx vertx) {
        factory = DatabaseManager.getSessionFactory();
        this.jwtUtils = new JWTUtils(vertx);
    }

    public Uni<LoginVO> login(LoginDTO loginDTO) {
        return factory.withSession(session -> {
            // 先获取查询结果
            return session.createQuery("FROM Account WHERE username = :username", Account.class)
                .setParameter("username", loginDTO.getUsername())
                .getSingleResultOrNull()
                .onItem().ifNull().failWith(() ->
                    new NoResultException("用户不存在"))
                .onItem().transformToUni(account -> {
                    // 密码验证
                    if (!BCrypt.checkpw(loginDTO.getPassword(), account.getPassword())) {
                        return Uni.createFrom().failure(
                            new NoResultException("密码错误"));
                    }

                    // 更新最后登录时间
                    account.setLastLogin(OffsetDateTime.now());

                    // 合并更新并生成 token
                    return session.merge(account)
                        .call(session::flush)
                        .chain(() -> {
                            Future<String> tokenFuture = jwtUtils.generateToken(account.getId().toString(), account.getUserType().toString());
                            // 将 Vert.x Future 转换为 Mutiny Uni
                            return Uni.createFrom().completionStage(tokenFuture.toCompletionStage());
                        })
                        .map(token -> LoginVO.builder()
                            .token(token)
                            .username(account.getUsername())
                            .build());
                });
        });
    }
    // 登录时未检测账户是否被禁用

    public Uni<Account> register(RegisterDTO registerDTO) {
        return factory.withSession(session -> {
            return session.createQuery("FROM Account WHERE username = :username", Account.class)
                .setParameter("username", registerDTO.getUsername())
                .getSingleResultOrNull()
                .onItem().ifNotNull().failWith(() ->
                    new IllegalArgumentException("用户名已存在"))
                .onItem().transformToUni(v -> {

                    Account account = new Account();
                    account.setUsername(registerDTO.getUsername());
                    account.setPassword(BCrypt.hashpw(registerDTO.getPassword(), BCrypt.gensalt()));
                    account.setEmail(registerDTO.getEmail());
                    account.setCreatedAt(OffsetDateTime.now());
                    account.setUserType((Integer) 0);
                    account.setStatus((Integer) 1);

                    return session.persist(account)
                        .call(session::flush)
                        .replaceWith(account);
                });
        });
    }

    public Uni<Void> logout(String token) {
        return Uni.createFrom().completionStage(
            jwtUtils.revokeToken(token).toCompletionStage()
        ).onFailure().invoke(error -> {
            System.err.println("注销失败: " + error.getMessage());
            error.printStackTrace();
        });
    }

    // 根据ID查询账户
    public Uni<Account> findById(Long id) {
        return factory.withSession(session ->
            session.find(Account.class, id)
                .onItem().ifNull().failWith(() -> 
                    new NoResultException("未找到ID为 " + id + " 的账户"))
        ).onFailure().invoke(error -> {
            System.err.println("查询账户失败: " + error.getMessage());
            error.printStackTrace();
        });
    }

    // 分页查询账户列表
    public Uni<AccountPage> findAllPaged(int page, int size, String orderBy) {
        return factory.withSession(session -> 
             session.createQuery("SELECT COUNT(a) FROM Account a", Long.class)
                .getSingleResult()
                .chain(total -> {
                    String query = String.format("FROM Account a ORDER BY a.%s", orderBy);
                    return session.createQuery(query, Account.class)
                        .setFirstResult((page - 1) * size)
                        .setMaxResults(size)
                        .getResultList()
                        .map(accounts -> {
                            int totalPages = (int) Math.ceil((double) total / size);
                            PageInfo pageInfo = PageInfo.builder()
                                .currentPage(page)
                                .pageSize(size)
                                .totalPages(totalPages)
                                .totalElements(total.intValue())
                                .hasNext(page < totalPages)
                                .build();

                            return AccountPage.builder()
                                .content(accounts)
                                .pageInfo(pageInfo)
                                .build();
                        });
                })
        ).onFailure().invoke(error -> {
            System.err.println("分页查询账户失败: " + error.getMessage());
            error.printStackTrace();
        });
    }

    // 更新账户状态
    public Uni<Account> updateStatus(UpdateAccountStatusDTO updateAccountStatusDTO) {
        return factory.withSession(session ->
            session.find(Account.class, updateAccountStatusDTO.getId())
                .onItem().ifNull().failWith(() -> 
                    new NoResultException("未找到ID为 " + updateAccountStatusDTO.getId() + " 的账户"))
                .flatMap(account -> {
                    account.setStatus(updateAccountStatusDTO.getStatus());
                    return session.flush()
                        .replaceWith(account);
                })
        ).onFailure().invoke(error -> {
            System.err.println("更新账户状态失败: " + error.getMessage());
            error.printStackTrace();
        });
    }

    // 更新账户类型
    public Uni<Account> updateUserType(Long id, Integer userType) {
        return factory.withSession(session ->
            session.find(Account.class, id)
                .onItem().ifNull().failWith(() -> 
                    new NoResultException("未找到ID为 " + id + " 的账户"))
                .flatMap(account -> {
                    account.setUserType(userType);
                    return session.flush()
                        .replaceWith(account);
                })
        ).onFailure().invoke(error -> {
            System.err.println("更新账户类型失败: " + error.getMessage());
            error.printStackTrace();
        });
    }

    // 重置密码
    public Uni<Boolean> resetPassword(Long id, String newPassword) {
        return factory.withSession(session ->
            session.find(Account.class, id)
                .onItem().ifNull().failWith(() -> 
                    new NoResultException("未找到ID为 " + id + " 的账户"))
                .flatMap(account -> {
                    account.setPassword(BCrypt.hashpw(newPassword, BCrypt.gensalt()));
                    return session.flush()
                        .replaceWith(true);
                })
        ).onFailure().invoke(error -> {
            System.err.println("重置密码失败: " + error.getMessage());
            error.printStackTrace();
        });
    }

    // 搜索账户
    public Uni<AccountPage> searchAccounts(String keyword, int page, int size) {
        return factory.withSession(session -> {
            String baseQuery = "FROM Account a WHERE " +
                "LOWER(a.username) LIKE LOWER(:keyword) OR " +
                "LOWER(a.email) LIKE LOWER(:keyword)";
            
            return session.createQuery("SELECT COUNT(a) " + baseQuery, Long.class)
                .setParameter("keyword", "%" + keyword + "%")
                .getSingleResult()
                .chain(total -> {
                    return session.createQuery(baseQuery, Account.class)
                        .setParameter("keyword", "%" + keyword + "%")
                        .setFirstResult((page - 1) * size)
                        .setMaxResults(size)
                        .getResultList()
                        .map(accounts -> {
                            int totalPages = (int) Math.ceil((double) total / size);
                            PageInfo pageInfo = PageInfo.builder()
                                .currentPage(page)
                                .pageSize(size)
                                .totalPages(totalPages)
                                .totalElements(total.intValue())
                                .hasNext(page < totalPages)
                                .build();

                            return AccountPage.builder()
                                .content(accounts)
                                .pageInfo(pageInfo)
                                .build();
                        });
                });
        }).onFailure().invoke(error -> {
            System.err.println("搜索账户失败: " + error.getMessage());
            error.printStackTrace();
        });
    }
}
