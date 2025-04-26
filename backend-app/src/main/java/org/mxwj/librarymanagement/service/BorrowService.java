package org.mxwj.librarymanagement.service;

import java.time.OffsetDateTime;
import org.hibernate.reactive.mutiny.Mutiny;
import org.mxwj.librarymanagement.lib.DatabaseManager;
import org.mxwj.librarymanagement.model.Account;
import org.mxwj.librarymanagement.model.Book;
import org.mxwj.librarymanagement.model.BorrowRecord;
import org.mxwj.librarymanagement.model.BorrowRecordsPage;
import org.mxwj.librarymanagement.model.PageInfo;
import io.smallrye.mutiny.Uni;

public class BorrowService {
    private final Mutiny.SessionFactory factory;
    private static final int DEFAULT_BORROW_DAYS = 30; // 默认借阅期限30天

    public BorrowService() {
        factory = DatabaseManager.getSessionFactory();
    }

    // 借书
    public Uni<BorrowRecord> borrowBook(Long accountId, Long bookId, String remarks) {
        return factory.withTransaction((session, tx) -> 
            // 1. 直接查找 Account
            session.find(Account.class, accountId)
                .onItem().ifNull().failWith(() -> 
                    new IllegalArgumentException("账户不存在"))
                .flatMap(account -> {
                    // 2. 检查现有借阅数量
                    return session.createQuery(
                        "SELECT COUNT(br) FROM BorrowRecord br " +
                        "WHERE br.account.id = :accountId AND br.status = 0", Long.class)
                        .setParameter("accountId", accountId)
                        .getSingleResult()
                        .flatMap(currentBorrowCount -> {
                            // 3. 通过左连接查询用户最大可借数量
                            return session.createQuery(
                                "SELECT COALESCE(ui.maxBorrowBooks, 5) FROM Account a " +
                                "LEFT JOIN UserInfo ui ON a.id = ui.account.id " +
                                "WHERE a.id = :accountId", Integer.class)
                                .setParameter("accountId", accountId)
                                .getSingleResult()
                                .flatMap(maxBorrowBooks -> {
                                    if (currentBorrowCount >= maxBorrowBooks) {
                                        return Uni.createFrom().failure(
                                            new IllegalStateException("超出最大借阅数量限制")
                                        );
                                    }

                                    // 4. 检查图书是否可借
                                    return session.find(Book.class, bookId)
                                        .onItem().ifNull().failWith(() -> 
                                            new IllegalArgumentException("图书不存在"))
                                        .flatMap(book -> {
                                            if (book.getAvailableCopies() <= 0) {
                                                return Uni.createFrom().failure(
                                                    new IllegalStateException("图书已全部借出")
                                                );
                                            }

                                            // 5. 创建借阅记录
                                            BorrowRecord record = new BorrowRecord();
                                            record.setAccount(account);
                                            record.setBook(book);
                                            record.setBorrowDate(OffsetDateTime.now());
                                            record.setDueDate(OffsetDateTime.now().plusDays(DEFAULT_BORROW_DAYS));
                                            record.setStatus((short) 0);
                                            record.setRemarks(remarks);
                                            record.setCreatedAt(OffsetDateTime.now());
                                            record.setUpdatedAt(OffsetDateTime.now());

                                            // 6. 更新图书可用数量
                                            book.setAvailableCopies(book.getAvailableCopies() - 1);

                                            return session.persist(record)
                                                .chain(() -> session.flush())
                                                .replaceWith(record);
                                        });
                                });
                        });
                })
        ).onFailure().invoke(error -> {
            System.err.println("借书失败: " + error.getMessage());
            error.printStackTrace();
        });
    }
    //TODO 比起left jion或许更优雅的做法是改外键acconut_id字段绑定userinfo表中的acconut_id字段

    // 还书
    public Uni<BorrowRecord> returnBook(Long recordId, String remarks) {
        return factory.withTransaction((session, tx) ->
            session.find(BorrowRecord.class, recordId)
                .onItem().ifNull().failWith(() -> 
                    new IllegalArgumentException("借阅记录不存在"))
                .flatMap(record -> {
                    if (record.getStatus() != 0) {
                        return Uni.createFrom().failure(
                            new IllegalStateException("该记录已完成还书")
                        );
                    }

                    // 更新借阅记录
                    record.setReturnDate(OffsetDateTime.now());
                    record.setStatus((short) 1);
                    if (remarks != null) {
                        record.setRemarks(remarks);
                    }
                    record.setUpdatedAt(OffsetDateTime.now());

                    // 更新图书可用数量
                    Book book = record.getBook();
                    book.setAvailableCopies(book.getAvailableCopies() + 1);

                    return session.flush()
                        .replaceWith(record);
                })
        ).onFailure().invoke(error -> {
            System.err.println("还书失败: " + error.getMessage());
            error.printStackTrace();
        });
    }

    // 查询用户的借阅记录
    public Uni<BorrowRecordsPage> findUserBorrowRecords(Long accountId, int page, int size) {
        return factory.withSession(session -> {
            String countQuery = "SELECT COUNT(br) FROM BorrowRecord br WHERE br.account.id = :accountId";
            String listQuery = "FROM BorrowRecord br WHERE br.account.id = :accountId ORDER BY br.createdAt DESC";
    
            return session.createQuery(countQuery, Long.class)
                .setParameter("accountId", accountId)
                .getSingleResult()
                .flatMap(total -> 
                    session.createQuery(listQuery, BorrowRecord.class)
                        .setParameter("accountId", accountId)
                        .setFirstResult((page - 1) * size)
                        .setMaxResults(size)
                        .getResultList()
                        .map(records -> {
                            int totalPages = (int) Math.ceil((double) total / size);
                            PageInfo pageInfo = PageInfo.builder()
                                .currentPage(page)
                                .pageSize(size)
                                .totalPages(totalPages)
                                .totalElements(total.intValue())
                                .hasNext(page < totalPages)
                                .build();
    
                            return BorrowRecordsPage.builder()
                                .content(records)
                                .pageInfo(pageInfo)
                                .build();
                        })
                );
        }).onFailure().invoke(error -> {
            System.err.println("查询借阅记录失败: " + error.getMessage());
            error.printStackTrace();
        });
    }

    // 根据ID查询借阅记录
    public Uni<BorrowRecord> findBorrowRecordById(Long recordId) {
        return factory.withSession(session -> 
            session.find(BorrowRecord.class, recordId)
                .onItem().ifNull().failWith(() -> 
                    new IllegalArgumentException("借阅记录不存在"))
        ).onFailure().invoke(error -> {
            System.err.println("查询借阅记录失败: " + error.getMessage());
            error.printStackTrace();
        });
    }

    // 查询所有借阅记录(管理员)，支持筛选和搜索
    public Uni<BorrowRecordsPage> findAllBorrowRecords(int page, int size, int status, String keyword) {
        return factory.withSession(session -> {
            StringBuilder queryBuilder = new StringBuilder("FROM BorrowRecord br");
            StringBuilder countBuilder = new StringBuilder("SELECT COUNT(br) FROM BorrowRecord br");
            StringBuilder whereClause = new StringBuilder();
            
            // 添加状态筛选
            if (status >= 0) {
                whereClause.append(" WHERE br.status = :status");
            }
            
            // 添加关键字搜索
            if (!keyword.trim().isEmpty()) {
                // 如果已经有WHERE子句，则使用AND连接，否则使用WHERE
                if (whereClause.length() > 0) {
                    whereClause.append(" AND");
                } else {
                    whereClause.append(" WHERE");
                }
                
                // 搜索书名或用户名包含关键字的记录
                whereClause.append(" (LOWER(br.book.title) LIKE :keyword OR")
                        .append(" LOWER(br.book.author) LIKE :keyword OR")
                        .append(" LOWER(br.account.username) LIKE :keyword)");
            }
            
            // 将WHERE子句添加到查询中
            String countQuery = countBuilder.append(whereClause).toString();
            String listQuery = queryBuilder.append(whereClause).append(" ORDER BY br.createdAt DESC").toString();
            
            // 构建查询
            var countQ = session.createQuery(countQuery, Long.class);
            var listQ = session.createQuery(listQuery, BorrowRecord.class);
            
            // 设置参数
            if (status >= 0) {
                countQ.setParameter("status", (short)status);
                listQ.setParameter("status", (short)status);
            }
            
            if (!keyword.trim().isEmpty()) {
                String keywordParam = "%" + keyword.toLowerCase() + "%";
                countQ.setParameter("keyword", keywordParam);
                listQ.setParameter("keyword", keywordParam);
            }
            
            // 执行查询
            return countQ.getSingleResult()
                .flatMap(total -> 
                    listQ.setFirstResult((page - 1) * size)
                        .setMaxResults(size)
                        .getResultList()
                        .map(records -> {
                            int totalPages = (int) Math.ceil((double) total / size);
                            PageInfo pageInfo = PageInfo.builder()
                                .currentPage(page)
                                .pageSize(size)
                                .totalPages(totalPages)
                                .totalElements(total.intValue())
                                .hasNext(page < totalPages)
                                .build();
    
                            return BorrowRecordsPage.builder()
                                .content(records)
                                .pageInfo(pageInfo)
                                .build();
                        })
                );
        }).onFailure().invoke(error -> {
            System.err.println("查询所有借阅记录失败: " + error.getMessage());
            error.printStackTrace();
        });
    }

    // 查询所有借阅记录(管理员),仅分页
    public Uni<BorrowRecordsPage> findAllBorrowRecords(int page, int size) {
        return factory.withSession(session -> {
            String countQuery = "SELECT COUNT(br) FROM BorrowRecord br";
            String listQuery = "FROM BorrowRecord br ORDER BY br.createdAt DESC";

            return session.createQuery(countQuery, Long.class)
                .getSingleResult()
                .flatMap(total -> 
                    session.createQuery(listQuery, BorrowRecord.class)
                        .setFirstResult((page - 1) * size)
                        .setMaxResults(size)
                        .getResultList()
                        .map(records -> {
                            int totalPages = (int) Math.ceil((double) total / size);
                            PageInfo pageInfo = PageInfo.builder()
                                .currentPage(page)
                                .pageSize(size)
                                .totalPages(totalPages)
                                .totalElements(total.intValue())
                                .hasNext(page < totalPages)
                                .build();

                            return BorrowRecordsPage.builder()
                                .content(records)
                                .pageInfo(pageInfo)
                                .build();
                        })
                );
        }).onFailure().invoke(error -> {
            System.err.println("查询所有借阅记录失败: " + error.getMessage());
            error.printStackTrace();
        });
    }

    public Uni<BorrowRecord> forceReturn(Long recordId, Short status, String remarks) {
        return factory.withTransaction((session, tx) ->
            session.find(BorrowRecord.class, recordId)
                .onItem().ifNull().failWith(() -> 
                    new IllegalArgumentException("借阅记录不存在"))
                .flatMap(record -> {
                    if (record.getStatus() != 0) {
                        return Uni.createFrom().failure(
                            new IllegalStateException("该记录已完成还书")
                        );
                    }
    
                    // 更新借阅记录
                    record.setReturnDate(OffsetDateTime.now());
                    record.setStatus(status); // 2:逾期未还, 3:已损坏/丢失
                    if (remarks != null) {
                        record.setRemarks(remarks);
                    }
                    record.setUpdatedAt(OffsetDateTime.now());
    
                    // 更新图书可用数量(如果是丢失/损坏,不增加可用数量)
                    if (status != 3) {
                        Book book = record.getBook();
                        book.setAvailableCopies(book.getAvailableCopies() + 1);
                    }
    
                    return session.flush()
                        .replaceWith(record);
                })
            ).onFailure().invoke(error -> {
                System.err.println("强制归还失败: " + error.getMessage());
                error.printStackTrace();
            });
    }
    
}