FROM eclipse-temurin:21-jdk-alpine

# Cài đặt Maven, Bash và Git
RUN apk update && apk add --no-cache bash curl git procps maven

# Thư mục làm việc mặc định
WORKDIR /workspaces

# Ép container sống sót nhưng không chạy bất cứ code Java nào
CMD ["sleep", "infinity"]