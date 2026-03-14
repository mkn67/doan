# ===== Stage 1: Build ứng dụng =====
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build

WORKDIR /build

# Copy pom trước để tận dụng Docker cache
COPY pom.xml .
RUN mvn -B -q -e -DskipTests dependency:go-offline

# Copy source code
COPY src ./src

# Build jar
RUN mvn -B -q -DskipTests package


# ===== Stage 2: Runtime =====
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Copy jar từ stage build
COPY --from=build /build/target/*.jar app.jar

# Port Spring Boot
EXPOSE 8080

# Tối ưu JVM khi chạy container
ENTRYPOINT ["java","-XX:+UseContainerSupport","-jar","app.jar"]