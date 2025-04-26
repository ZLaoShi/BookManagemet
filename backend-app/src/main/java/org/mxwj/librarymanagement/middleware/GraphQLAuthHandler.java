package org.mxwj.librarymanagement.middleware;

import graphql.schema.DataFetcher;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class GraphQLAuthHandler {
    
    public static class AuthenticationException extends RuntimeException {
        public AuthenticationException(String message) {
            super(message);
        }
    }

    // 验证是否为管理员
    public static DataFetcher<?> requireAdmin(DataFetcher<?> fetcher) {
        return requireRole(fetcher, 1);
    }

    // 验证是否为普通用户
    public static DataFetcher<?> requireUser(DataFetcher<?> fetcher) {
        return requireRole(fetcher, 0);
    }

    public static DataFetcher<?> requireRole(DataFetcher<?> fetcher, int requiredRole) {
        return environment -> {
            // 从 DataFetchingEnvironment 获取 RoutingContext
            RoutingContext routingContext = environment.getGraphQlContext().get(RoutingContext.class);
            if (routingContext == null) {
                throw new AuthenticationException("上下文错误");
            }

            JsonObject userPrincipal = routingContext.get("userPrincipal");

            System.out.println("Context: " + routingContext);
            System.out.println("User Principal: " + userPrincipal);

            if (userPrincipal == null) {
                throw new AuthenticationException("未登录");
            }

            String roleStr = userPrincipal.getString("role");
            if (roleStr == null) {
                throw new AuthenticationException("用户角色未定义");
            }

            int userRole = Integer.parseInt(roleStr);
            if (userRole < requiredRole) {
                throw new AuthenticationException("无权限执行此操作");
            }

            return fetcher.get(environment);
        };
    }
}
