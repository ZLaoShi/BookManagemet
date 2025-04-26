# backend-app/Dockerfile
FROM maven:3.8-openjdk-17 AS builder
# 使用一个包含 Maven 和 JDK 17 的基础镜像作为构建环境

WORKDIR /app
# 设置工作目录

# 先复制 pom.xml 并下载依赖，以利用 Docker 缓存
COPY pom.xml .
RUN mvn dependency:go-offline

# 复制项目的其余源代码
COPY src ./src

# 打包应用程序，创建 fat jar。构建时跳过测试以加快速度。
RUN mvn package -DskipTests

# 阶段 2：创建最终的运行时镜像
FROM openjdk:17-jdk-slim
# 使用一个精简的 OpenJDK 17 镜像作为运行环境

WORKDIR /app
# 设置工作目录

# 从构建器阶段（builder stage）复制 fat jar 并将其重命名为 app.jar
COPY --from=builder /app/target/librarymanagement-1.0.0-SNAPSHOT-fat.jar app.jar

# 如果需要，复制日志配置文件（可选）
# COPY src/main/resources/log4j2.xml /app/log4j2.xml

# 暴露 Vert.x 应用程序监听的端口（默认为 8888，如果不同请修改）
EXPOSE 8888

# 运行 Vert.x 应用程序的命令，使用 MANIFEST.MF 中指定的 Main-Class
ENTRYPOINT ["java", "-jar", "app.jar"]

# 可选：如果配置文件或日志配置不在默认位置，你可能需要指定路径
# ENTRYPOINT ["java", "-Dlog4j.configurationFile=log4j2.xml", "-jar", "app.jar"]
