package org.mxwj.librarymanagement;

import io.vertx.core.Vertx;
import io.vertx.junit5.VertxExtension;
import io.vertx.junit5.VertxTestContext;
import io.vertx.redis.client.Redis;
import io.vertx.redis.client.RedisAPI;
import io.vertx.redis.client.RedisOptions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@ExtendWith(VertxExtension.class)
public class RedisClientTest {

    private RedisAPI redis;

    @BeforeEach
    void setUp(Vertx vertx, VertxTestContext testContext) {
        Redis.createClient(
            vertx,
            new RedisOptions().setConnectionString("redis://localhost:6379")
        )
        .connect()
        .onSuccess(conn -> {
            redis = RedisAPI.api(conn);
            testContext.completeNow();
        })
        .onFailure(testContext::failNow);
    }

    @Test
    void testSetAndGet(VertxTestContext testContext) {
        String key = "test-key";
        String value = "test-value";

        redis.set(Arrays.asList(key, value))
            .compose(res -> redis.get(key))
            .onSuccess(response -> {
                testContext.verify(() -> {
                    assertNotNull(response);
                    assertEquals(value, response.toString());
                    testContext.completeNow();
                });
            })
            .onFailure(testContext::failNow);
    }

    @Test
    void testSetAndDel(VertxTestContext testContext) {
        String key = "test-key-del";
        String value = "test-value-del";

        redis.set(Arrays.asList(key, value))
            .compose(res -> redis.del(Arrays.asList(key)))
            .onSuccess(response -> {
                testContext.verify(() -> {
                    assertNotNull(response);
                    assertEquals(1, Integer.parseInt(response.toString()));  // del 命令返回删除的键数量
                    testContext.completeNow();
                });
            })
            .onFailure(testContext::failNow);
    }

}
