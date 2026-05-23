# 👁️ VISION CARE - Hệ Thống Quản Lý Phòng Khám Chuyên Khoa Mắt

**Vision Care** là giải pháp phần mềm quản lý toàn diện dành riêng cho phòng khám và bệnh viện chuyên khoa mắt. Hệ thống được thiết kế để số hóa và tối ưu hóa toàn bộ quy trình vận hành: từ khâu tiếp nhận bệnh nhân, đo khám khúc xạ, soi đáy mắt, kê đơn thuốc/kính, cho đến quy trình mài lắp tròng kính tại xưởng và thanh toán viện phí.

---

## 🚀 1. Các Tính Năng Nổi Bật (Key Features)

### 👤 Phân hệ Tiếp đón & Lễ tân
*   **Bảng Hàng chờ Kanban (`/staff/clinic/queue`):** Giao diện kéo thả (Drag & Drop) mượt mà để điều phối bệnh nhân: *Đang chờ $\rightarrow$ Đang khám $\rightarrow$ Kết thúc / Bỏ khám*. Tự động lưu trạng thái xuống Oracle DB.
*   **Màn hình TV Hàng chờ Phòng khám (`/staff/clinic/queue/tv`):** Giao diện full-screen lớn không viền dành riêng cho tivi phòng chờ.
    *   Tự động đồng bộ thời gian thực mỗi 5 giây.
    *   **Hệ thống loa gọi số tự động:** Tích hợp công nghệ Text-to-Speech phát ra giọng đọc tiếng Việt gọi tên bệnh nhân vào phòng khám khi bác sĩ gọi số.

### 👤 Phân hệ Bác sĩ nhãn khoa
*   **Sơ đồ Khúc xạ Nhãn Khoa SVG:** Bản đồ hình ảnh hai con mắt OD (Phải) và OS (Trái) trực quan. Màu sắc đồng tử tự động thay đổi (Teal: Bình thường, Xanh: Cận thị, Cam/Đỏ: Viễn thị) và co giãn theo thông số độ đo thực tế nhập trên form.
*   **Nạp dữ liệu từ tệp đo máy tự động:** Cho phép kéo thả hoặc tải lên tệp kết quả khúc xạ (.txt) xuất ra từ máy đo để tự động điền nhanh các trường dữ liệu trên form khám.
*   **Nhật ký lịch sử bệnh án (Audit Trail - `/staff/clinic/audit`):** Giao diện so sánh các phiên bản bệnh án cũ và mới song song (dạng Đỏ/Xanh như git diff), truy xuất trực tiếp từ Oracle Audit Log.

### 👤 Phân hệ Mài lắp tròng kính (Workshop)
*   **Bảng điều khiển Mài kính Kanban (`/staff/workshop/glasses`):** Theo dõi đơn gia công qua 4 cột: *Chờ gia công $\rightarrow$ Đang mài lắp $\rightarrow$ Lỗi kỹ thuật $\rightarrow$ Đã hoàn thành*.
*   Tự động gán kỹ thuật viên chịu trách nhiệm khi kéo thả.
*   Hỗ trợ Drawer nhập thủ công và hộp thoại popup ghi lý do hỏng tròng kính để tự sinh yêu cầu xuất tròng kính thay thế trong kho.

### 👤 Phân hệ Thu ngân & Kho hàng
*   **Lập hóa đơn & Chốt thanh toán:** Tự động gom phí khám, thuốc kê đơn và phí mài lắp kính thành một hóa đơn thanh toán duy nhất.
*   **Thanh toán VietQR động:** Hiển thị mã QR ngân hàng MBBank chứa số tiền lẻ và nội dung chuyển khoản tự động dựa trên hóa đơn hiện tại để khách hàng quét nhanh.
*   **Quản lý phiếu nhập & Kho hàng:** Hỗ trợ cảnh báo tồn kho dưới ngưỡng an toàn, cảnh báo lô thuốc sắp hết hạn sử dụng và in ấn hóa đơn chuẩn hóa.

---

## 💻 2. Công Nghệ Sử Dụng (Tech Stack)

Dự án được xây dựng dựa trên kiến trúc phân tầng độc lập (Decoupled Services) bảo mật cao:
*   **Backend:** Java 21, Spring Boot 3.x, Spring Security (JWT), Spring Data JPA.
*   **Frontend:** Next.js 16 (App Router), Tailwind CSS, Shadcn UI, TanStack Query (React Query).
*   **Database (Oracle Database):** Đảm bảo ACID và tính toàn vẹn dữ liệu ở mức cao nhất.
    *   **Stored Procedures (14 SPs):** Xử lý nghiệp vụ phức tạp ngay dưới database (Trừ kho, tạo đơn mài kính, thanh toán).
    *   **Triggers (14 Triggers):** Tự động validate chéo dữ liệu, ghi nhật ký thay đổi hồ sơ (Audit Trail), và lưu vết lịch sử giá sản phẩm.
    *   **Views (16 Views):** Phục vụ truy xuất thống kê phân tích doanh thu và KPI nhanh chóng.

---

## 📂 3. Cấu Trúc Thư Mục (Project Structure)

```text
VisionCare/
├── backend/                  # Spring Boot Project
│   ├── src/main/java/com/kada/da/modules/
│   │   ├── auth/             # Xác thực JWT & Phân quyền người dùng
│   │   ├── booking/          # Đặt lịch hẹn khám & quản lý hàng chờ
│   │   ├── examination/      # Kết quả đo khám thị lực & hồ sơ bệnh án
│   │   ├── prescription/     # Kê đơn thuốc & đơn tròng kính
│   │   ├── inventory/        # Quản lý kho hàng, nhập lô & hạn dùng
│   │   ├── workshop/         # Quản lý mài lắp tròng kính
│   │   └── billing/          # Thu ngân, thanh toán & điểm tích lũy VIP
│   └── src/main/resources/   # Cấu hình file ứng dụng
│
├── sql-init/                 # Tài nguyên CSDL Oracle
│   ├── 01_V1__Initial_Setup.sql  # Cấu trúc bảng & khóa ngoại
│   ├── SPandfunction.sql         # Stored Procedures & Functions
│   ├── TRigger.sql               # Triggers tự động hóa nghiệp vụ
│   ├── view.sql                  # Views phân tích & báo cáo
│   └── dataseed.sql              # Bộ dữ liệu mẫu phong phú
│
└── vision-care-frontend/     # Next.js Frontend Project
    ├── src/app/              # App Router (staff dashboards & customer pages)
    ├── src/hooks/            # React Query hooks đồng bộ APIs
    └── src/lib/api/          # Axios cấu hình kết nối Endpoint
```

---

## ⚙️ 4. Hướng Dẫn Cài Đặt & Chạy Thử (Setup & Execution)

### Khởi tạo Cơ sở dữ liệu (Oracle DB)
1. Đảm bảo bạn đã có một cơ sở dữ liệu Oracle đang chạy.
2. Chạy tuần tự các tệp SQL trong thư mục `/sql-init` theo thứ tự:
   1. `01_V1__Initial_Setup.sql`
   2. `sequences.sql`
   3. `view.sql`
   4. `SPandfunction.sql`
   5. `TRigger.sql`
   6. `dataseed.sql`

### Chạy Backend (Spring Boot)
1. Truy cập vào thư mục `backend/`.
2. Mở tệp `src/main/resources/application.yml` và cấu hình tài khoản kết nối Oracle DB của bạn.
3. Chạy lệnh biên dịch và khởi chạy:
   ```powershell
   .\mvnw.cmd clean spring-boot:run
   ```

### Chạy Frontend (Next.js)
1. Truy cập vào thư mục `vision-care-frontend/`.
2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```
3. Khởi chạy máy chủ phát triển cục bộ:
   ```bash
   npm run dev
   ```
4. Truy cập ứng dụng tại địa chỉ: `http://localhost:3000`.

---

## 🔒 5. Tài Khoản Thử Nghiệm (Internal Staff Accounts)
Các tài khoản được đính kèm sẵn trong tệp dữ liệu mẫu `dataseed.sql` với mật khẩu mặc định là `123456`:
*   **Lễ tân:** Tài khoản `le_tan_1` (Mã nhóm: `NH01`)
*   **Bác sĩ:** Tài khoản `bac_si_1` (Mã nhóm: `NH02`)
*   **Thu ngân:** Tài khoản `thu_ngan_1` (Mã nhóm: `NH03`)
*   **Quản trị viên:** Tài khoản `admin_1` (Mã nhóm: `NH04`)
*   **Kỹ thuật viên mài lắp:** Tài khoản `ktv_1` (Mã nhóm: `NH05`)