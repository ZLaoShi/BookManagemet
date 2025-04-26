package org.mxwj.librarymanagement.lib;

import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.redis.client.*;

public class RedisClient {
    private final Redis redis;
    private RedisConnection connection;
    private RedisAPI redisAPI;

    public RedisClient(Vertx vertx) {
        this.redis = Redis.createClient(
            vertx,
            new RedisOptions()
                .setConnectionString("redis://localhost:6379")
                .setMaxPoolSize(8)
        );
    }

    public Future<RedisAPI> getRedisAPI() {
        if (redisAPI != null && connection != null) {
            return Future.succeededFuture(redisAPI);
        }

        return redis.connect()
            .onSuccess(conn -> {
                this.connection = conn;
                this.redisAPI = RedisAPI.api(conn);
                
                conn.exceptionHandler(err -> {
                    System.err.println("Redis connection error: " + err.getMessage());
                    this.connection = null;
                    this.redisAPI = null;
                });
            })
            .map(conn -> redisAPI);
    }
}


