# Sử dụng image Nginx Alpine chính thức
FROM nginx:stable-alpine

# Xóa file cấu hình mặc định
RUN rm /etc/nginx/conf.d/default.conf

# Copy file cấu hình tùy chỉnh của bạn vào thư mục cấu hình của Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf