---Đặt lịch
-- 1. Tạo tài khoản riêng cho NS002 (Mật khẩu: Password123@)
INSERT INTO TAI_KHOAN (MATK, USERNAME, PASSWORD, LOAI_TK, TRANGTHAI) 
VALUES ('TK002', 'bacsi_test', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DM99I1YvI8Y6', 'INTERNAL', 1);

-- 2. Cấp hộ khẩu cho bác sĩ NS002 với tài khoản mới này
INSERT INTO NHAN_SU (MANS, MATK, MACV, HOTEN, NGAYSINH, SDT, GIOITINH, CHUYENKHOA, IS_DELETED) 
VALUES ('NS002', 'TK002', 'CV06', N'Bác sĩ Trưởng Khoa', DATE '1980-01-01', '0999888777', N'Nam', N'Khúc xạ', 0);

-- 3. Bơm lịch trực ngày 09/05/2026 cho ông NS002 này
INSERT INTO LICH_LAM_VIEC (MALLV, MANS, NGAY_LAM, GIO_BAT_DAU, GIO_KET_THUC, IS_NGHI)
VALUES ('LLV' || TO_CHAR(SEQ_LICH_LAM_VIEC.NEXTVAL, 'FM000000'), 'NS002', TO_DATE('2026-05-09', 'YYYY-MM-DD'), 8.0, 17.0, 0);
--- Tạo ADmin
-- 1. Nạp lại tài khoản Admin (Mật khẩu vẫn là Password123@)
INSERT INTO TAI_KHOAN (MATK, USERNAME, PASSWORD, LOAI_TK, TRANGTHAI) 
VALUES ('TK001', 'admin', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DM99I1YvI8Y6', 'INTERNAL', 1);

-- 2. Gán Admin vào nhóm quyền lực (NH04 là nhóm Admin/Quản lý của ông giáo)
INSERT INTO TAIKHOAN_NHOM (MATK, MANHOM) VALUES ('TK001', 'NH04');

-- 3. Cấp luôn hồ sơ Nhân sự cho Admin để sau này còn đứng tên trưởng khoa
INSERT INTO NHAN_SU (MANS, MATK, MACV, HOTEN, NGAYSINH, SDT, GIOITINH, IS_DELETED) 
VALUES ('NS001', 'TK001', 'CV10', N'Nguyễn Mai Kỳ Admin', DATE '2005-10-20', '0999999999', N'Nam', 0);
SELECT * FROM TAIKHOAN_NHOM tn 
COMMIT;