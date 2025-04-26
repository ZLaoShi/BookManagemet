package org.mxwj.librarymanagement.graphql;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.mxwj.librarymanagement.model.Account;
import org.mxwj.librarymanagement.model.AccountPage;
import org.mxwj.librarymanagement.model.dto.UpdateAccountStatusDTO;
import org.mxwj.librarymanagement.service.AccountService;
import org.mxwj.librarymanagement.utils.ContextHelper;

import graphql.schema.DataFetcher;

public class AccountFetcher {
    private final AccountService accountService;

    public AccountFetcher(AccountService accountService) {
        this.accountService = accountService;
    }

    // 查询单个账户
    public DataFetcher<CompletableFuture<Account>> getAccountById() {
        return env -> {
            Long id = Long.parseLong(env.getArgument("id"));

            return accountService.findById(id).subscribeAsCompletionStage();
        };
    }

    // 分页查询账户列表
    public DataFetcher<CompletableFuture<AccountPage>> getAccounts() {
        return env -> {
            int page = env.getArgumentOrDefault("page", 1);
            int size = env.getArgumentOrDefault("size", 10);
            String orderBy = env.getArgumentOrDefault("orderBy", "id");

            return accountService.findAllPaged(page, size, orderBy).subscribeAsCompletionStage();
        };
    }

    // 更新账户状态(启用/禁用)
    public DataFetcher<CompletableFuture<Account>> updateAccountStatus() {
        return env -> {
            UpdateAccountStatusDTO updateAccountStatusDTO = new UpdateAccountStatusDTO();
            updateAccountStatusDTO.setId(Long.parseLong(env.getArgument("id")));
            updateAccountStatusDTO.setStatus(env.getArgumentOrDefault("status", 0));

            return accountService.updateStatus(updateAccountStatusDTO).subscribeAsCompletionStage();
        };
    }

    //更改账户类型(普通用户/管理员)
    public DataFetcher<CompletableFuture<Account>> updateAccountType() {
        return env -> {
            Map<String, Object> input = env.getArgument("input");
            Long id = (Long) input.get("id");
            Integer userType = (Integer) input.get("userType");
            // 确保当前管理员不能修改自己的账户类型
            Long currentUserId = ContextHelper.getAccountId(env);
            if (currentUserId.equals(id)) {
                throw new IllegalArgumentException("不能修改自己的账户类型");
            }
            System.out.println("this updata Type" + id + userType);
            return accountService.updateUserType(id, userType).subscribeAsCompletionStage();
        };
    }

    // 重置密码
    public DataFetcher<CompletableFuture<Boolean>> resetPassword() {
        return env -> {
            Long id = Long.parseLong(env.getArgument("id"));
            String newPassword = env.getArgument("newPassword");

            return accountService.resetPassword(id, newPassword).subscribeAsCompletionStage();
        };
    }

    // 搜索账户
    public DataFetcher<CompletableFuture<AccountPage>> searchAccounts() {
        return env -> {
            String keyword = env.getArgument("keyword");
            int page = env.getArgumentOrDefault("page", 1);
            int size = env.getArgumentOrDefault("size", 10);
            
            return accountService.searchAccounts(keyword, page, size).subscribeAsCompletionStage();
        };
    }
}
