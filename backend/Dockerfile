# Bước 1: Build ứng dụng bằng Maven
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy file cấu hình trước để tận dụng cache của Docker (tải thư viện nhanh hơn)
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy toàn bộ code và build ra file .jar
COPY src ./src
RUN mvn clean package -DskipTests

# Bước 2: Chạy ứng dụng bằng JRE (nhẹ hơn JDK)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy file .jar từ bước build sang
COPY --from=build /app/target/*.jar app.jar

# Mở cổng 8080
EXPOSE 8080

# Lệnh chạy ứng dụng
ENTRYPOINT ["java", "-jar", "app.jar"]