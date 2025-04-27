package org.mxwj.librarymanagement;

import io.vertx.core.Vertx;
import io.vertx.core.VertxOptions; 
import io.vertx.micrometer.MicrometerMetricsOptions; 
import io.vertx.micrometer.VertxPrometheusOptions; 
import org.slf4j.Logger; 
import org.slf4j.LoggerFactory; 

public class Main {

    private static final Logger logger = LoggerFactory.getLogger(Main.class); 

    public static void main(String[] args) {
        logger.info("应用程序启动...");

        // 1. 配置 Micrometer 指标选项
        MicrometerMetricsOptions metricsOptions = new MicrometerMetricsOptions()
            .setPrometheusOptions(new VertxPrometheusOptions().setEnabled(true)) // 启用 Prometheus 支持
            .setEnabled(true); // 启用 Micrometer 指标

        // 2. 创建包含指标选项的 VertxOptions
        VertxOptions vertxOptions = new VertxOptions()
            .setMetricsOptions(metricsOptions);

        // 3. 使用配置好的选项创建 Vertx 实例
        logger.info("创建配置了 Micrometer 指标的 Vertx 实例...");
        Vertx vertx = Vertx.vertx(vertxOptions); // 使用带选项的构造函数

        // 4. 部署 MainVerticle
        logger.info("部署 MainVerticle...");
        vertx.deployVerticle(new MainVerticle())
            .onSuccess(id -> {
                logger.info("MainVerticle 部署成功, ID: {}", id);
                logger.info("指标端点 /metrics 应该已准备就绪");
            })
            .onFailure(err -> {
                logger.error("MainVerticle 部署失败", err); 
                // err.printStackTrace();
            });

        logger.info("Vert.x 启动流程完成.");
    }
}
