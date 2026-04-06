FROM node:20-alpine

# Cài thêm bash, git và các thư viện cần thiết để build node-sass hoặc các lib nặng
RUN apk update && apk add --no-cache bash git curl python3 make g++

WORKDIR /workspaces/da/frontend

# Tự động cài dependencies nếu có file package.json
# CMD này giúp container không bị tắt, và ông có thể vào terminal gõ lệnh thoải mái
CMD ["sh", "-c", "npm install && tail -f /dev/null"]