package org.mxwj.librarymanagement.utils;

import graphql.schema.DataFetchingEnvironment;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.web.RoutingContext;

public class ContextHelper {

   // 获取用户信息对象
    public static JsonObject getUserPrincipal(DataFetchingEnvironment env) {
        RoutingContext routingContext = env.getGraphQlContext().get(RoutingContext.class);
        return routingContext.get("userPrincipal");
    }

    public static Long getAccountId(DataFetchingEnvironment env) {
        String _accountId = getUserPrincipal(env).getString("sub");
        return Long.parseLong(_accountId);
    }

    public static Short getUserRole(DataFetchingEnvironment env) {
        String _role = getUserPrincipal(env).getString("role");
        return Short.parseShort(_role);
    }

}
