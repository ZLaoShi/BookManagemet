package org.mxwj.librarymanagement.utils;

import java.util.List;

import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.core.json.JsonObject;
import io.vertx.ext.auth.JWTOptions;
import io.vertx.ext.auth.PubSecKeyOptions;
import io.vertx.ext.auth.User;
import io.vertx.ext.auth.authentication.TokenCredentials;
import io.vertx.ext.auth.jwt.JWTAuth;
import io.vertx.ext.auth.jwt.JWTAuthOptions;

import org.mxwj.librarymanagement.lib.RedisClient;

public class JWTUtils {
    private final JWTAuth jwtAuth;
    private final RedisClient redisClient;
    private static final int TOKEN_EXPIRES = 3600 * 24; // 24小时过期
    private static final String SECRET = "dhiauwyhdiuahwiduhaiuwd";

    public JWTUtils(Vertx vertx) {
        // 配置JWT
        JWTAuthOptions config = new JWTAuthOptions()
            .addPubSecKey(new PubSecKeyOptions()
                .setAlgorithm("HS256")
                .setBuffer(SECRET));

        this.jwtAuth = JWTAuth.create(vertx, config);
        this.redisClient = new RedisClient(vertx);
    }

    public Future<String> generateToken(String userId, String role) {
        String token = jwtAuth.generateToken(
            new JsonObject()
                .put("sub", userId)
                .put("role", role),
            new JWTOptions()
                .setExpiresInSeconds(TOKEN_EXPIRES)
        );

        // 将token存入Redis，使用userId作为key
        return redisClient.getRedisAPI()
            .compose(redis -> redis.setex("token:" + userId, String.valueOf(TOKEN_EXPIRES), token)
            .map(res -> token));
    }

    public Future<User> validateToken(String token) {
        TokenCredentials credentials = new TokenCredentials(token);

        return Future.future(promise ->
            jwtAuth.authenticate(credentials)
                .onSuccess(user -> {
                    String userId = user.principal().getString("sub");

                    // 检查Redis中是否存在该token
                    redisClient.getRedisAPI()
                        .compose(redis -> redis.get("token:" + userId))
                        .onSuccess(storedToken -> {
                            if (token.equals(storedToken.toString())) {
                                promise.complete(user);
                            } else {
                                promise.fail("Invalid token");
                            }
                        })
                        .onFailure(promise::fail);
                })
                .onFailure(promise::fail)
        );
    }

    public Future<Void> revokeToken(String token) {
        TokenCredentials credentials = new TokenCredentials(token);

        return Future.future(promise ->
            jwtAuth.authenticate(credentials)
                .onSuccess(user -> {
                    String userId = user.principal().getString("sub");
                    // 删除 Redis 中的 token
                    redisClient.getRedisAPI()
                        .compose(redis -> redis.del(List.of("token:" + userId)))
                        .onSuccess(res -> promise.complete())
                        .onFailure(err -> {
                            System.err.println("删除token失败: " + err.getMessage());
                            promise.fail(err);
                        });
                })
                .onFailure(err -> {
                    System.err.println("token验证失败: " + err.getMessage());
                    promise.fail(err);
                })
        );
    }

}
