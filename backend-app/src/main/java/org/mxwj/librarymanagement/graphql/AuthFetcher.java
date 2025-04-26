package org.mxwj.librarymanagement.graphql;

import graphql.schema.DataFetcher;
import io.vertx.core.json.JsonObject;

import org.mxwj.librarymanagement.model.Account;
import org.mxwj.librarymanagement.model.dto.LoginDTO;
import org.mxwj.librarymanagement.model.dto.RegisterDTO;
import org.mxwj.librarymanagement.service.AccountService;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

public class AuthFetcher {
    private final AccountService accountService;

    public AuthFetcher(AccountService accountService) {
        this.accountService = accountService;
    }

    public DataFetcher<CompletableFuture<JsonObject>> login() {
        return env -> {
            String username = env.getArgument("username");
            String password = env.getArgument("password");
            LoginDTO loginDTO = new LoginDTO(username, password);

            return accountService.login(loginDTO)
                .map(JsonObject::mapFrom)
                .subscribeAsCompletionStage();
        };
    }

    public DataFetcher<CompletableFuture<Account>> register() {
        return env -> {
            Map<String, Object> input = env.getArgument("input");
            RegisterDTO registerDTO = new RegisterDTO(
                (String) input.get("username"),
                (String) input.get("password"),
                (String) input.get("email")
            );

            return accountService.register(registerDTO)
                .subscribeAsCompletionStage();
        };
    }

    public DataFetcher<CompletableFuture<Boolean>> logout() {
        return env -> {
            String token = env.getArgument("token");
            return accountService.logout(token)
                .map(v -> true)
                .subscribeAsCompletionStage();
        };
    }
}
