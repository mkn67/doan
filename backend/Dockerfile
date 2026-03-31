# Bước 1: Build ứng dụng bằng Maven
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline

COPY src ./src
RUN mvn clean package -DskipTests

# Bước 2: Chạy ứng dụng
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

# Mở cổng 8081 (Đã đổi)
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]