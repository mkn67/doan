FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
# Chạy với --host để thông mạng ra ngoài Docker
CMD ["npm", "run", "dev", "--", "--host"]