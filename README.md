VISION CARE - Hệ thống quản lý phòng khám chuyên khoa mắt
1. Giới thiệu chung (Project Overview)
Mô tả ngắn gọn về dự án.

Mục tiêu: Quản lý toàn diện quy trình từ tiếp nhận bệnh nhân, đo mắt, kê đơn kính đến gia công tròng kính và thanh toán.

Đối tượng sử dụng: Lễ tân, Bác sĩ, Kỹ thuật viên mài kính, Thu ngân, Admin và Khách hàng.

2. Công nghệ sử dụng (Tech Stack)

Backend: Java 21, Spring Boot 3.x, Spring Security (JWT), JPA/Hibernate.

Frontend: Next.js 16 (App Router), Tailwind CSS, Shadcn UI, TanStack Query (React Query), Lucide Icons.

Database: Oracle Database (Hệ quản trị dữ liệu quy mô doanh nghiệp).

Tools: Podman, Docker, Figma, Git.

3. Cấu trúc thư mục (Project Structure)
Phần này cực kỳ ăn điểm vì nó thể hiện m quản lý code khoa học.

Plaintext
VisionCare/
├── vision-care-backend/      # Spring Boot Project
│   ├── src/main/java/com/kada/da/modules/
│   │   ├── auth/             # Xử lý Security & JWT
│   │   ├── customer/         # Module khách hàng
│   │   └── clinic/           # Module chuyên môn (Khám, Đơn thuốc)
│   └── src/main/resources/   # Config Oracle & Liquibase/Flyway
└── vision-care-frontend/     # Next.js Project
    ├── src/app/              # App Router (Staff & Customer)
    ├── src/hooks/            # Custom Hooks (React Query)
    └── src/components/ui/    # Shadcn UI Components
4. Hướng dẫn cài đặt (Installation & Setup)
Đây là phần quan trọng nhất để giảng viên có thể chạy thử project của m.

Bước 1: Cấu hình Database (Oracle)
Tạo User và phân quyền trong Oracle.

Chạy script SQL (đính kèm trong thư mục /docs/sql) để tạo bảng và dữ liệu mẫu.

Bước 2: Chạy Backend
Mở file application.yml hoặc application.properties.

Cập nhật url, username, password của Oracle.

Chạy lệnh: ./mvnw spring-boot:run

Bước 3: Chạy Frontend
Tạo file .env.local với nội dung: NEXT_PUBLIC_API_URL=http://localhost:8080.

Cài đặt thư viện: npm install hoặc pnpm install.

Chạy dev: npm run dev.

5. Các tính năng chính (Core Features)
Liệt kê theo luồng nghiệp vụ (Workflow):

Hệ thống Auth: Phân quyền đa tầng (RBAC) bằng JWT.

Tiếp nhận & Đặt lịch: Quản lý hàng chờ thông minh.

Khám khúc xạ: Ghi nhận chỉ số SPH, PD theo thời gian thực.

Kê đơn & Xưởng kính: Quy trình mài lắp kính chuyên nghiệp.

Báo cáo: Thống kê doanh thu và lượt khám qua Dashboard.
