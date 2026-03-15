# ===== Stage 1: Build ứng dụng (Giữ nguyên vì m làm quá chuẩn) =====
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /build

# Tận dụng cache để tải dependency nhanh hơn
COPY pom.xml .
RUN mvn -B dependency:go-offline

# Build code
COPY src ./src
RUN mvn -B -DskipTests package

# ===== Stage 2: Runtime (Bản tối ưu cho đồ án) =====
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Cài đặt curl để có thể check health sau này (nếu cần)
RUN apk add --no-cache curl

# Copy đúng file jar chính (Tránh lấy nhầm file sources)
# Mẹo: M có thể kiểm tra tên file jar cụ thể, thường là ${artifactId}-${version}.jar
COPY --from=build /build/target/*.jar app.jar

# Port Spring Boot
EXPOSE 8080

# ENTRYPOINT nâng cao: 
# Thêm các thông số tối ưu RAM cho Container 
ENTRYPOINT ["java", \
            "-Djava.security.egd=file:/dev/./urandom", \
            "-XX:+UseContainerSupport", \
            "-XX:MaxRAMPercentage=75.0", \
            "-jar", "app.jar"]