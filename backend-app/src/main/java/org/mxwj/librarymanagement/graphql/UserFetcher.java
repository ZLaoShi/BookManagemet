package org.mxwj.librarymanagement.graphql;

import graphql.schema.DataFetcher;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

import org.mxwj.librarymanagement.model.User;
import org.mxwj.librarymanagement.model.UsersPage;
import org.mxwj.librarymanagement.service.UserService;

public class UserFetcher {
    private final UserService userService;

    public UserFetcher(UserService userService) {
        this.userService = userService;
    }

    public DataFetcher<CompletableFuture<User>> getUserById() {
        return env -> {
            Integer id = Integer.parseInt(env.getArgument("id"));

            return  userService.findById(id).subscribeAsCompletionStage();
        };
    }

    public DataFetcher<CompletableFuture<UsersPage>> getUsers() {
        return env -> {
            int page = env.getArgumentOrDefault("page", 1);
            int size = env.getArgumentOrDefault("size", 10);
            String orderBy = env.getArgumentOrDefault("orderBy", "id");
            System.out.println("分页查询成功");
            return userService.findAllPaged(page, size, orderBy).subscribeAsCompletionStage();
        };
    }

    public DataFetcher<CompletableFuture<User>> createUser() {
        return env -> {
            Map<String, Object> input = env.getArgument("input");
            User user = new User();
            user.setName((String) input.get("name"));
            user.setEmail((String) input.get("email"));
            return userService.createUser(user).subscribeAsCompletionStage();
        };
    }

    public DataFetcher<CompletableFuture<User>> updateUser() {
        return env -> {
            Integer id = Integer.parseInt(env.getArgument("id"));
            Map<String, Object> input = env.getArgument("input");
            User user = new User();
            user.setName((String) input.get("name"));
            user.setEmail((String) input.get("email"));
            return userService.updateUser(id, user).subscribeAsCompletionStage();
        };
    }

    public DataFetcher<CompletableFuture<Boolean>> deleteUser() {
        return env -> {
            Integer id = Integer.parseInt(env.getArgument("id"));
            return userService.deleteUser(id).subscribeAsCompletionStage();
        };
    }
}
