# 👁️ VISION CARE - Hệ Thống Quản Lý Phòng Khám Chuyên Khoa Mắt

## 📖 1. Giới Thiệu Chung (Project Overview)

**Vision Care** là giải pháp phần mềm quản lý toàn diện dành riêng cho phòng khám và bệnh viện chuyên khoa mắt. Hệ thống được thiết kế để số hóa và tối ưu hóa toàn bộ quy trình vận hành: từ khâu tiếp nhận bệnh nhân, đo khám khúc xạ, soi đáy mắt, kê đơn thuốc/kính, cho đến quy trình mài lắp tròng kính tại xưởng và thanh toán viện phí.

**👥 Đối tượng người dùng:**
* **Lễ tân:** Quản lý lịch hẹn, tiếp đón và phân luồng hàng chờ.
* **Bác sĩ:** Thăm khám, cập nhật hồ sơ thị lực và kê đơn.
* **Kỹ thuật viên mài kính:** Nhận lệnh gia công và cập nhật trạng thái xuất xưởng.
* **Thu ngân:** Lập hóa đơn và xử lý thanh toán (Tiền mặt/Chuyển khoản).
* **Quản lý / Admin:** Theo dõi báo cáo thống kê, quản lý nhân sự và kho vật tư.
* **Khách hàng:** Đặt lịch khám trực tuyến, xem lịch sử khám và hóa đơn cá nhân.

---

## 💻 2. Công Nghệ Sử Dụng (Tech Stack)

Hệ thống được phát triển dựa trên kiến trúc Microservices cơ bản, tách biệt hoàn toàn Frontend và Backend.

* **Backend:** Java 21, Spring Boot 3.x, Spring Security (JWT), Spring Data JPA / Hibernate.
* **Frontend:** Next.js 16 (App Router), Tailwind CSS, Shadcn UI, TanStack Query (React Query), Lucide Icons.
* **Database:** Oracle Database (Hệ quản trị CSDL quy mô doanh nghiệp, đảm bảo ACID và bảo mật cao).
* **DevOps & Tools:** Podman / Docker, Git, Figma.

---

## 📂 3. Cấu Trúc Thư Mục (Project Structure)

Dự án được phân chia module rõ ràng theo nghiệp vụ (Domain-Driven Design):

```text
VisionCare/
├── vision-care-backend/      # Spring Boot Project
│   ├── src/main/java/com/kada/da/modules/
│   │   ├── auth/             # Xử lý xác thực, phân quyền & JWT
│   │   ├── customer/         # Quản lý thông tin & lịch sử khách hàng
│   │   ├── clinic/           # Nghiệp vụ y tế (Lịch hẹn, Khám bệnh, Kê đơn)
│   │   ├── inventory/        # Quản lý kho (Vật tư, Kính, Thuốc)
│   │   ├── workshop/         # Quản lý xưởng mài lắp kính
│   │   └── billing/          # Thu ngân, Hóa đơn & Báo cáo doanh thu
│   └── src/main/resources/   # Cấu hình application.yml & Database Scripts
│
└── vision-care-frontend/     # Next.js Project
    ├── src/app/              
    │   ├── (customer)/       # Giao diện dành cho Khách hàng vãng lai
    │   └── (staff)/          # Dashboard quản trị dành cho Nhân viên
    ├── src/hooks/            # Custom Hooks call API (React Query)
    ├── src/lib/api/          # Axios instances & API routes
    └── src/components/ui/    # Tái sử dụng Component từ Shadcn UI