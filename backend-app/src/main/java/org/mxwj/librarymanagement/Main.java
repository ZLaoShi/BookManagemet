package org.mxwj.librarymanagement;

import io.vertx.core.Vertx;

public class Main {
    public static void main(String[] args) {
        Vertx vertx = Vertx.vertx();
        vertx.deployVerticle(new MainVerticle())
            .onSuccess(id -> System.out.println("部署成功: " + id))
            .onFailure(err -> {
                System.err.println("部署失败: " + err.getMessage());
                err.printStackTrace();
            });
    }
}
