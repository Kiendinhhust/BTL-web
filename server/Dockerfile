# Sử dụng Node.js base image - chọn version LTS ổn định và Alpine cho nhẹ
FROM node:18-alpine AS builder

# Đặt thư mục làm việc
WORKDIR /usr/src/app

# Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt dependencies production (quan trọng: --only=production)
# Sử dụng npm ci để cài đặt chính xác từ package-lock.json, nhanh hơn và an toàn hơn cho build
RUN npm ci --only=production

# Copy toàn bộ source code ứng dụng vào thư mục làm việc
# Sử dụng AS builder ở trên để không copy devDependencies vào image cuối
COPY . .

# ------- Image cuối cùng cho Production -------
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy dependencies đã cài đặt từ stage builder
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy source code ứng dụng từ stage builder
COPY --from=builder /usr/src/app .

# Expose cổng mà ứng dụng Node.js lắng nghe (bạn cần đặt giá trị này trong .env)
# Giá trị mặc định là 3000 nếu PORT không được đặt trong .env
# ENV PORT=3000 # Không cần nếu bạn set trong docker-compose
EXPOSE ${PORT:-3000}

# Lệnh chạy ứng dụng khi container khởi động
# Sử dụng 'node app.js' trực tiếp, KHÔNG dùng 'npm start' vì nó gọi nodemon
CMD [ "node", "app.js" ]