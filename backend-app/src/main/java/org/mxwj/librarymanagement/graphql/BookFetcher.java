package org.mxwj.librarymanagement.graphql;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.mxwj.librarymanagement.model.Book;
import org.mxwj.librarymanagement.model.BooksPage;
import org.mxwj.librarymanagement.model.dto.CreateBookDTO;
import org.mxwj.librarymanagement.service.BookService;
import org.mxwj.librarymanagement.utils.DTOMapper;

import graphql.schema.DataFetcher;

public class BookFetcher {
    private final BookService bookService;

    public BookFetcher(BookService bookService) {
        this.bookService = bookService;
    }

    // 查询单本书籍
    public DataFetcher<CompletableFuture<Book>> getBookById() {
        return env -> {
            Long id = Long.parseLong(env.getArgument("id"));
            return bookService.findById(id).subscribeAsCompletionStage();
        };
    }

    // 分页查询书籍列表
    public DataFetcher<CompletableFuture<BooksPage>> getBooks() {
        return env -> {
            int page = env.getArgumentOrDefault("page", 1);
            int size = env.getArgumentOrDefault("size", 10);
            return bookService.findAllPaged(page, size).subscribeAsCompletionStage();
        };
    }

    // 搜索书籍
    public DataFetcher<CompletableFuture<BooksPage>> searchBooks() {
        return env -> {
            String keyword = env.getArgument("keyword");
            int page = env.getArgumentOrDefault("page", 1);
            int size = env.getArgumentOrDefault("size", 10);
            return bookService.searchBooks(keyword, page, size).subscribeAsCompletionStage();
        };
    }

    // 创建书籍
    public DataFetcher<CompletableFuture<Book>> createBook() {
        return env -> {
            Map<String, Object> input = env.getArgument("input");
            CreateBookDTO createBookDTO = DTOMapper.mapToDTO(input, CreateBookDTO.class);

            return bookService.createBook(createBookDTO).subscribeAsCompletionStage();
        };
    }
    
    // 更新书籍
    public DataFetcher<CompletableFuture<Book>> updateBook() {
        return env -> {
            Long id = Long.parseLong(env.getArgument("id"));
            Map<String, Object> input = env.getArgument("input");
            CreateBookDTO updateBookDTO = DTOMapper.mapToDTO(input, CreateBookDTO.class);

            return bookService.updateBook(id, updateBookDTO).subscribeAsCompletionStage();
        };
    }

    // 删除书籍
    public DataFetcher<CompletableFuture<Boolean>> deleteBook() {
        return env -> {
            Long id = Long.parseLong(env.getArgument("id"));
            return bookService.deleteBook(id).subscribeAsCompletionStage();
        };
    }
}
