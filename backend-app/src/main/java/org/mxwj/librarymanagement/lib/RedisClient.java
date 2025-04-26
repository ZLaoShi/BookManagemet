package org.mxwj.librarymanagement.lib;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import io.vertx.core.Future;
import io.vertx.core.Vertx;
import io.vertx.redis.client.*;

public class RedisClient {
    private static final Logger logger = LoggerFactory.getLogger(RedisClient.class);
    
    private final Redis redis;
    private RedisConnection connection;
    private RedisAPI redisAPI;


    public RedisClient(Vertx vertx) {
        // --- 从环境变量读取配置 ---
        // 读取 HOST，如果环境变量缺失，则默认为 "localhost"
        String redisHost = System.getenv().getOrDefault("REDIS_HOST", "localhost");
        int redisPort;
        try {
            // 读取 PORT，如果环境变量缺失或无效，则默认为 6379
            redisPort = Integer.parseInt(System.getenv().getOrDefault("REDIS_PORT", "6379"));
        } catch (NumberFormatException e) {
            logger.warn("无效的 REDIS_PORT 环境变量，将使用默认值 6379。", e);
            redisPort = 6379;
        }
        // 如果你的 Redis 需要密码，考虑在这里添加密码处理（例如从 REDIS_PASSWORD 环境变量读取）
        // String redisPassword = System.getenv("REDIS_PASSWORD");

        // 使用从环境变量读取的值构建连接字符串
        String connectionString = "redis://" + redisHost + ":" + redisPort;
        // 记录正在使用的连接字符串，便于调试
        logger.info("正在使用连接字符串初始化 Redis 客户端: {}", connectionString);

        RedisOptions options = new RedisOptions()
                .setConnectionString(connectionString) // 使用动态构建的连接字符串
                .setMaxPoolSize(8) // 保留连接池设置
                .setMaxWaitingHandlers(32); // 可选：限制等待请求的数量

        // 使用从环境变量派生的选项创建客户端实例
        this.redis = Redis.createClient(vertx, options);

        // 可选：尝试执行一个初始命令（如 PING）以尽早验证连接性
        // 这有助于在 Redis 无法访问时快速失败
        getRedisAPI().onFailure(err -> {
             logger.error("初始 Redis 连接检查失败: {}", err.getMessage(), err);
        });
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


