package org.mxwj.librarymanagement.graphql;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.mxwj.librarymanagement.model.BorrowRecord;
import org.mxwj.librarymanagement.model.BorrowRecordsPage;
import org.mxwj.librarymanagement.service.BorrowService;
import org.mxwj.librarymanagement.utils.ContextHelper;

import graphql.schema.DataFetcher;
import io.smallrye.mutiny.Uni;

public class BorrowFetcher {
    private final BorrowService borrowService;

    public BorrowFetcher(BorrowService borrowService) {
        this.borrowService = borrowService;
    }

    // 借书
    public DataFetcher<CompletableFuture<BorrowRecord>> borrowBook() {
        return env -> {
            // 获取当前用户ID(已经过身份验证)
            Long accountId = ContextHelper.getAccountId(env);
            Map<String, Object> input = env.getArgument("input");
            Long bookId = Long.parseLong((String) input.get("bookId"));
            String remarks = (String) input.get("remarks");

            return borrowService.borrowBook(accountId, bookId, remarks)
                .subscribeAsCompletionStage();
        };
    }

    // 还书
    public DataFetcher<CompletableFuture<BorrowRecord>> returnBook() {
        return env -> {
            // 获取当前用户ID(已经过身份验证)
            Long accountId = ContextHelper.getAccountId(env);
            Map<String, Object> input = env.getArgument("input");
            Long recordId = Long.parseLong((String) input.get("recordId"));
            String remarks = (String) input.get("remarks");

            // 先查询借阅记录确认权限
            return borrowService.findBorrowRecordById(recordId)
                .onItem().ifNull().failWith(() -> 
                    new IllegalArgumentException("借阅记录不存在"))
                .flatMap(record -> {
                    // 检查是否是本人的借阅记录
                    if (!record.getAccount().getId().equals(accountId)) {
                        return Uni.createFrom().failure(
                            new IllegalStateException("无权操作此借阅记录")
                        );
                    }
                    return borrowService.returnBook(recordId, remarks);
                })
                .subscribeAsCompletionStage();
        };
    }

    // 查询用户的借阅记录
    public DataFetcher<CompletableFuture<BorrowRecordsPage>> getMyBorrowRecords() {
        return env -> {
            int page = env.getArgumentOrDefault("page", 1);
            int size = env.getArgumentOrDefault("size", 10);
            Long accountId = ContextHelper.getAccountId(env);

            return borrowService.findUserBorrowRecords(accountId, page, size)
                .subscribeAsCompletionStage();
        };
    }

    // 管理员代替用户借书
    public DataFetcher<CompletableFuture<BorrowRecord>> adminBorrowBook() {
        return env -> {
            Long accountId = Long.parseLong(env.getArgument("userId"));
            Map<String, Object> input = env.getArgument("input");
            Long bookId = Long.parseLong((String) input.get("bookId"));
            String remarks = (String) input.get("remarks") + " (由管理员操作)";

            return borrowService.borrowBook(accountId, bookId, remarks)
                .subscribeAsCompletionStage();
        };
    }

    // 管理员代替用户还书
    public DataFetcher<CompletableFuture<BorrowRecord>> adminReturnBook() {
        return env -> {
            Long accountId = Long.parseLong(env.getArgument("userId"));
            Map<String, Object> input = env.getArgument("input");
            Long recordId = Long.parseLong((String) input.get("recordId"));
            String remarks = (String) input.get("remarks") + " (由管理员操作)";

            // 先查询借阅记录确认归属
            return borrowService.findBorrowRecordById(recordId)
                .onItem().ifNull().failWith(() -> 
                    new IllegalArgumentException("借阅记录不存在"))
                .flatMap(record -> {
                    // 检查是否是目标用户的借阅记录
                    if (!record.getAccount().getId().equals(accountId)) {
                        return Uni.createFrom().failure(
                            new IllegalStateException("借阅记录与用户不匹配")
                        );
                    }
                    return borrowService.returnBook(recordId, remarks);
                })
                .subscribeAsCompletionStage();
        };
    }

    // 管理员强制归还图书
    public DataFetcher<CompletableFuture<BorrowRecord>> adminForceReturn() {
        return env -> {
            Long recordId = Long.parseLong(env.getArgument("recordId"));
            Short status = ((Integer) env.getArgument("status")).shortValue();
            String remarks = env.getArgumentOrDefault("remarks", "") + " (管理员强制归还)";

            return borrowService.forceReturn(recordId, status, remarks)
                .subscribeAsCompletionStage();
        };
    }
    
    // 查询所有借阅记录(管理员)
    public DataFetcher<CompletableFuture<BorrowRecordsPage>> getAllBorrowRecords() {
        return env -> {
            int page = env.getArgumentOrDefault("page", 1);
            int size = env.getArgumentOrDefault("size", 10);
            int status = env.getArgumentOrDefault("status", -1);   // -1表示全部状态
            String keyword = env.getArgumentOrDefault("keyword", "");  // 关键字搜索
            
            return borrowService.findAllBorrowRecords(page, size, status, keyword)
                .subscribeAsCompletionStage();
        };
    }
}