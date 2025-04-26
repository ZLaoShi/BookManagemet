package org.mxwj.librarymanagement.service;

import java.time.LocalDate;
import java.time.OffsetDateTime;

import org.hibernate.reactive.mutiny.Mutiny;
import org.mxwj.librarymanagement.lib.DatabaseManager;
import org.mxwj.librarymanagement.model.Book;
import org.mxwj.librarymanagement.model.BooksPage;
import org.mxwj.librarymanagement.model.PageInfo;
import org.mxwj.librarymanagement.model.dto.CreateBookDTO;

import io.smallrye.mutiny.Uni;

public class BookService {
    private final Mutiny.SessionFactory factory;

    public BookService() {
        factory = DatabaseManager.getSessionFactory();
    }
    
    // 查询单本图书
    public Uni<Book> findById(Long id) {
        return factory.withSession(session ->
            session.find(Book.class, id)
                .onItem().ifNull().failWith(() -> 
                    new IllegalArgumentException("未找到ID为 " + id + " 的图书"))
        ).onFailure().invoke(error -> {
            System.err.println("查询图书失败: " + error.getMessage());
            error.printStackTrace();
        });
    }

    public Uni<BooksPage> findAllPaged(int page, int size) {
        return factory.withSession(session -> 
            // 先执行计数查询获取总数
            session.createQuery("SELECT COUNT(b) FROM Book b", Long.class)
                .getSingleResult()
                // 然后执行分页查询
                .chain(total -> {
                    String query = "FROM Book b ORDER BY b.id";
                    return session.createQuery(query, Book.class)
                        .setFirstResult((page - 1) * size)
                        .setMaxResults(size)
                        .getResultList()
                        .map(books -> {
                            int totalPages = (int) Math.ceil((double) total / size);
                            PageInfo pageInfo = PageInfo.builder()
                                .currentPage(page)
                                .pageSize(size)
                                .totalPages(totalPages)
                                .totalElements(total.intValue())
                                .hasNext(page < totalPages)
                                .build();
    
                            return BooksPage.builder()
                                .content(books)
                                .pageInfo(pageInfo)
                                .build();
                        });
                })
        ).onFailure().invoke(error -> {
            System.err.println("分页查询图书失败: " + error.getMessage());
            error.printStackTrace();
        });
    }

    // 搜索图书(带分页)
    public Uni<BooksPage> searchBooks(String keyword, int page, int size) {
        return factory.withSession(session -> {
            String baseQuery = "FROM Book b WHERE " +
                "LOWER(b.title) LIKE LOWER(:keyword) OR " +
                "LOWER(b.author) LIKE LOWER(:keyword) OR " +
                "LOWER(b.isbn) LIKE LOWER(:keyword) OR " +
                "LOWER(b.publisher) LIKE LOWER(:keyword)";
            
            // 1. 先查询总数
            return session.createQuery("SELECT COUNT(b) " + baseQuery, Long.class)
                .setParameter("keyword", "%" + keyword + "%")
                .getSingleResult()
                // 2. 再执行分页查询
                .chain(total -> {
                    return session.createQuery(baseQuery, Book.class)
                        .setParameter("keyword", "%" + keyword + "%")
                        .setFirstResult((page - 1) * size)
                        .setMaxResults(size)
                        .getResultList()
                        .map(books -> {
                            // 3. 构建分页信息
                            int totalPages = (int) Math.ceil((double) total / size);
                            PageInfo pageInfo = PageInfo.builder()
                                .currentPage(page)
                                .pageSize(size)
                                .totalPages(totalPages)
                                .totalElements(total.intValue())
                                .hasNext(page < totalPages)
                                .build();

                            return BooksPage.builder()
                                .content(books)
                                .pageInfo(pageInfo)
                                .build();
                        });
                });
        }).onFailure().invoke(error -> {
            System.err.println("搜索图书失败: " + error.getMessage());
            error.printStackTrace();
        });
    }
    
    public Uni<Book> createBook(CreateBookDTO createBookDTO) {
        return factory.withSession(session -> {
            // 1. 先检查 ISBN 是否已存在
            return session.createQuery("FROM Book b WHERE b.isbn = :isbn", Book.class)
                .setParameter("isbn", createBookDTO.getIsbn())
                .getSingleResultOrNull()
                .onItem().ifNotNull().failWith(() ->
                    new IllegalArgumentException("ISBN已存在: " + createBookDTO.getIsbn()))
                .flatMap(existingBook -> {
                    // 2. 创建新书籍
                    Book newBook = new Book();
                    newBook.setIsbn(createBookDTO.getIsbn());
                    newBook.setTitle(createBookDTO.getTitle());
                    newBook.setAuthor(createBookDTO.getAuthor());
                    newBook.setPublisher(createBookDTO.getPublisher());
                    
                    // 3. 处理日期转换
                    if (createBookDTO.getPublishDate() != null) {
                        newBook.setPublishDate(LocalDate.parse(createBookDTO.getPublishDate()));
                    }
                    
                    newBook.setCategory(createBookDTO.getCategory());
                    newBook.setDescription(createBookDTO.getDescription());
                    
                    // 4. 设置库存信息
                    Integer totalCopies = createBookDTO.getTotalCopies();
                    if (totalCopies == null || totalCopies < 1) {
                        totalCopies = 1;
                    }
                    newBook.setTotalCopies(totalCopies);
                    newBook.setAvailableCopies(totalCopies); // 初始可用数量等于总数量
                    
                    newBook.setLocation(createBookDTO.getLocation());
                    
                    // 5. 设置时间戳
                    OffsetDateTime now = OffsetDateTime.now();
                    newBook.setCreatedAt(now);
                    newBook.setUpdatedAt(now);

                    // 6. 持久化并返回
                    return session.persist(newBook)
                        .chain(session::flush)
                        .replaceWith(newBook);
                });
        }).onFailure().invoke(error -> {
            System.err.println("创建图书失败: " + error.getMessage());
            error.printStackTrace();
        });
    }

    public Uni<Book> updateBook(Long id, CreateBookDTO updateBookDTO) {
        return factory.withSession(session -> {
            // 1. 先检查要更新的书是否存在
            return session.find(Book.class, id)
                .onItem().ifNull().failWith(() -> 
                    new IllegalArgumentException("未找到ID为 " + id + " 的图书"))
                .flatMap(book -> {
                    // 2. 如果 ISBN 被修改,需要检查新的 ISBN 是否与其他图书冲突
                    if (!book.getIsbn().equals(updateBookDTO.getIsbn())) {
                        return session.createQuery("FROM Book b WHERE b.isbn = :isbn AND b.id != :id", Book.class)
                            .setParameter("isbn", updateBookDTO.getIsbn())
                            .setParameter("id", id)
                            .getSingleResultOrNull()
                            .onItem().ifNotNull().failWith(() ->
                                new IllegalArgumentException("ISBN已被其他图书使用: " + updateBookDTO.getIsbn()))
                            .map(v -> book);
                    }
                    return Uni.createFrom().item(book);
                })
                .flatMap(book -> {
                    // 3. 更新图书信息
                    book.setIsbn(updateBookDTO.getIsbn());
                    book.setTitle(updateBookDTO.getTitle());
                    book.setAuthor(updateBookDTO.getAuthor());
                    book.setPublisher(updateBookDTO.getPublisher());
                    
                    // 4. 处理日期转换
                    if (updateBookDTO.getPublishDate() != null) {
                        book.setPublishDate(LocalDate.parse(updateBookDTO.getPublishDate()));
                    }
                    
                    book.setCategory(updateBookDTO.getCategory());
                    book.setDescription(updateBookDTO.getDescription());
                    
                    // 5. 更新库存信息 - 需要保持总数 >= 已借出数量
                    Integer newTotalCopies = updateBookDTO.getTotalCopies();
                    if (newTotalCopies != null && newTotalCopies >= 1) {
                        int borrowedCopies = book.getTotalCopies() - book.getAvailableCopies();
                        if (newTotalCopies < borrowedCopies) {
                            throw new IllegalArgumentException(
                                "新的总册数(" + newTotalCopies + 
                                ")不能小于已借出的册数(" + borrowedCopies + ")"
                            );
                        }
                        book.setTotalCopies(newTotalCopies);
                        book.setAvailableCopies(newTotalCopies - borrowedCopies);
                    }
                    
                    book.setLocation(updateBookDTO.getLocation());
                    book.setUpdatedAt(OffsetDateTime.now());

                    // 6. 保存更新
                    return session.flush()
                        .replaceWith(book);
                });
        }).onFailure().invoke(error -> {
            System.err.println("更新图书失败: " + error.getMessage());
            error.printStackTrace();
        });
    }

    public Uni<Boolean> deleteBook(Long id) {
        return factory.withSession(session -> {
            // 1. 先检查图书是否存在
            return session.find(Book.class, id)
                .onItem().ifNull().failWith(() -> 
                    new IllegalArgumentException("未找到ID为 " + id + " 的图书"))
                .flatMap(book -> {
                    // 2. 检查是否有未归还的借阅记录
                    if (book.getAvailableCopies() < book.getTotalCopies()) {
                        return Uni.createFrom().failure(
                            new IllegalStateException("该图书还有未归还的借阅记录，无法删除")
                        );
                    }
                    
                    // 3. 执行删除
                    return session.remove(book)
                        .chain(session::flush)
                        .replaceWith(true);
                });
        }).onFailure().invoke(error -> {
            System.err.println("删除图书失败: " + error.getMessage());
            error.printStackTrace();
        });
    }

}
