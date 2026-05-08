-- ===============================================================
-- FILE : V2_Seed_Data_Fixed_Final.sql
-- Tối ưu: Thêm tài khoản thiếu, dùng Explicit ID để tránh lỗi Subquery
-- ===============================================================

SET DEFINE OFF;

-- ============================================================
-- BƯỚC 0: BỔ SUNG CHỨC VỤ 
-- ============================================================
-- Dùng MERGE để tránh lỗi nếu đã có data
MERGE INTO CHUC_VU target USING (
    SELECT 'CV06' MACV, N'Bác sĩ' TENCV FROM DUAL UNION ALL
    SELECT 'CV07', N'Kỹ thuật viên mắt kính' FROM DUAL UNION ALL
    SELECT 'CV08', N'Thu ngân' FROM DUAL UNION ALL
    SELECT 'CV09', N'Thủ kho' FROM DUAL UNION ALL
    SELECT 'CV10', N'Quản lý' FROM DUAL UNION ALL
    SELECT 'CV11', N'Lễ tân' FROM DUAL
) source ON (target.MACV = source.MACV)
WHEN NOT MATCHED THEN INSERT (MACV, TENCV) VALUES (source.MACV, source.TENCV);

-- ============================================================
-- BƯỚC 1: TÀI KHOẢN BỔ SUNG (ĐÃ VÁ TK005 VÀ TK006)
-- ============================================================
INSERT INTO TAI_KHOAN (MATK, USERNAME, PASSWORD, LOAI_TK, TRANGTHAI) VALUES ('TK005', 'thukho1',  '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DM99I1YvI8Y6', 'INTERNAL', 1);
INSERT INTO TAI_KHOAN (MATK, USERNAME, PASSWORD, LOAI_TK, TRANGTHAI) VALUES ('TK006', 'kythuat1', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DM99I1YvI8Y6', 'INTERNAL', 1);
INSERT INTO TAI_KHOAN (MATK, USERNAME, PASSWORD, LOAI_TK, TRANGTHAI) VALUES ('TK008', 'bacsi2',   '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DM99I1YvI8Y6', 'INTERNAL', 1);
INSERT INTO TAI_KHOAN (MATK, USERNAME, PASSWORD, LOAI_TK, TRANGTHAI) VALUES ('TK009', 'kythuat2', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DM99I1YvI8Y6', 'INTERNAL', 1);
INSERT INTO TAI_KHOAN (MATK, USERNAME, PASSWORD, LOAI_TK, TRANGTHAI) VALUES ('TK010', 'thukho2',  '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DM99I1YvI8Y6', 'INTERNAL', 1);
INSERT INTO TAI_KHOAN (MATK, USERNAME, PASSWORD, LOAI_TK, TRANGTHAI) VALUES ('TK011', 'kh002',    '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DM99I1YvI8Y6', 'EXTERNAL', 1);
INSERT INTO TAI_KHOAN (MATK, USERNAME, PASSWORD, LOAI_TK, TRANGTHAI) VALUES ('TK012', 'kh003',    '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DM99I1YvI8Y6', 'EXTERNAL', 1);
INSERT INTO TAI_KHOAN (MATK, USERNAME, PASSWORD, LOAI_TK, TRANGTHAI) VALUES ('TK013', 'kh004',    '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DM99I1YvI8Y6', 'EXTERNAL', 1);
INSERT INTO TAI_KHOAN (MATK, USERNAME, PASSWORD, LOAI_TK, TRANGTHAI) VALUES ('TK014', 'thungan2', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DM99I1YvI8Y6', 'INTERNAL', 1);

INSERT INTO TAIKHOAN_NHOM (MATK, MANHOM) VALUES ('TK005', 'NH03');
INSERT INTO TAIKHOAN_NHOM (MATK, MANHOM) VALUES ('TK006', 'NH05');
INSERT INTO TAIKHOAN_NHOM (MATK, MANHOM) VALUES ('TK008', 'NH01');
INSERT INTO TAIKHOAN_NHOM (MATK, MANHOM) VALUES ('TK009', 'NH05');
INSERT INTO TAIKHOAN_NHOM (MATK, MANHOM) VALUES ('TK010', 'NH03');
INSERT INTO TAIKHOAN_NHOM (MATK, MANHOM) VALUES ('TK011', 'NH07');
INSERT INTO TAIKHOAN_NHOM (MATK, MANHOM) VALUES ('TK012', 'NH07');
INSERT INTO TAIKHOAN_NHOM (MATK, MANHOM) VALUES ('TK013', 'NH07');
INSERT INTO TAIKHOAN_NHOM (MATK, MANHOM) VALUES ('TK014', 'NH02');

-- ============================================================
-- BƯỚC 2: NHÂN SỰ BỔ SUNG 
-- ============================================================
UPDATE NHAN_SU SET MACV = 'CV06' WHERE MANS = 'NS002';
UPDATE NHAN_SU SET MACV = 'CV11' WHERE MANS = 'NS003';
UPDATE NHAN_SU SET MACV = 'CV08' WHERE MANS = 'NS004';
UPDATE NHAN_SU SET MACV = 'CV10' WHERE MANS = 'NS001';

INSERT INTO NHAN_SU (MANS, MATK, MACV, HOTEN, NGAYSINH, SDT, GIOITINH, CHUYENKHOA, IS_DELETED) VALUES ('NS005', 'TK008', 'CV06', N'Nguyễn Thị Hương', DATE '1988-03-15', '0912345678', N'Nữ', N'Nhãn khoa nhi', 0);
INSERT INTO NHAN_SU (MANS, MATK, MACV, HOTEN, NGAYSINH, SDT, GIOITINH, IS_DELETED) VALUES ('NS006', 'TK006', 'CV07', N'Đỗ Minh Quân', DATE '1995-07-20', '0923456789', N'Nam', 0);
INSERT INTO NHAN_SU (MANS, MATK, MACV, HOTEN, NGAYSINH, SDT, GIOITINH, IS_DELETED) VALUES ('NS007', 'TK009', 'CV07', N'Lê Thị Bảo Châu', DATE '1997-11-05', '0934567890', N'Nữ', 0);
INSERT INTO NHAN_SU (MANS, MATK, MACV, HOTEN, NGAYSINH, SDT, GIOITINH, IS_DELETED) VALUES ('NS008', 'TK005', 'CV09', N'Vũ Đức Mạnh', DATE '1990-04-10', '0945678901', N'Nam', 0);
INSERT INTO NHAN_SU (MANS, MATK, MACV, HOTEN, NGAYSINH, SDT, GIOITINH, IS_DELETED) VALUES ('NS009', 'TK010', 'CV09', N'Hoàng Thị Lan', DATE '1993-08-22', '0956789012', N'Nữ', 0);
INSERT INTO NHAN_SU (MANS, MATK, MACV, HOTEN, NGAYSINH, SDT, GIOITINH, IS_DELETED) VALUES ('NS010', 'TK014', 'CV08', N'Trần Quốc Bảo', DATE '1992-12-30', '0967890123', N'Nam', 0);

-- ============================================================
-- BƯỚC 3,4,5,6,7,8,9: GIỮ NGUYÊN (Không có lỗi)
-- ============================================================
-- (Ông giáo giữ nguyên các đoạn Insert từ Khách Hàng đến Lô Hàng nhé, tớ chỉ sửa đoạn dưới)

-- ============================================================
-- BƯỚC 10: LỊCH HẸN (Dùng ID cứng LH_S01, LH_S02... để tái sử dụng)
-- ============================================================
INSERT INTO LICH_HEN (MALH, MAKH, MANS, MAGOI, NGAYHEN, GIO_HEN, LOAI_LICH, TRANGTHAI) VALUES ('LH_S01', 'KH001', 'NS002', 'GK01', TRUNC(SYSDATE) - 2, TRUNC(SYSDATE) - 2 + INTERVAL '9' HOUR, N'Online', N'Đã khám');
INSERT INTO LICH_HEN (MALH, MAKH, MANS, MAGOI, NGAYHEN, GIO_HEN, LOAI_LICH, TRANGTHAI) VALUES ('LH_S02', 'KH002', 'NS002', 'GK02', TRUNC(SYSDATE) - 1, TRUNC(SYSDATE) - 1 + INTERVAL '10' HOUR, N'Online', N'Đã khám');
INSERT INTO LICH_HEN (MALH, MAKH, MANS, MAGOI, NGAYHEN, GIO_HEN, LOAI_LICH, TRANGTHAI) VALUES ('LH_S03', 'KH004', 'NS002', 'GK02', TRUNC(SYSDATE), TRUNC(SYSDATE) + INTERVAL '8' HOUR + INTERVAL '30' MINUTE, N'Online', N'Đang chờ');
INSERT INTO LICH_HEN (MALH, MAKH, MANS, MAGOI, NGAYHEN, GIO_HEN, LOAI_LICH, TRANGTHAI) VALUES ('LH_S04', 'KH005', 'NS005', 'GK04', TRUNC(SYSDATE), TRUNC(SYSDATE) + INTERVAL '15' HOUR, N'Tại chỗ', N'Đang chờ');

-- ============================================================
-- BƯỚC 11: HÀNG CHỜ (Tái sử dụng ID lịch hẹn)
-- ============================================================
INSERT INTO HANG_CHO (MAHC, MAKH, TEN_KHACH, SO_THU_TU, LOAI_KHACH, MALH, MANS_PHAN_CONG, TRANG_THAI, GIO_DANG_KY)
VALUES (NULL, 'KH004', N'Phạm Hoàng Long', 1, N'Online', 'LH_S03', 'NS002', N'Đang chờ', SYSTIMESTAMP - INTERVAL '20' MINUTE);
INSERT INTO HANG_CHO (MAHC, MAKH, TEN_KHACH, SO_THU_TU, LOAI_KHACH, MALH, MANS_PHAN_CONG, TRANG_THAI, GIO_DANG_KY)
VALUES (NULL, 'KH005', N'Lê Ngọc Hân', 2, N'Online', 'LH_S04', 'NS005', N'Đang chờ', SYSTIMESTAMP - INTERVAL '10' MINUTE);

-- ============================================================
-- BƯỚC 12: HỒ SƠ THỊ LỰC & TRIỆU CHỨNG (Dùng ID cứng HS_S01...)
-- ============================================================
INSERT INTO HO_SO_THI_LUC (MAHOSO, MAKH, MANS, NGAYKHAM, KETLUAN) VALUES ('HS_S01', 'KH001', 'NS002', SYSTIMESTAMP - INTERVAL '2' DAY, N'Cận thị hai mắt. Khuyến nghị đeo kính.');
INSERT INTO HO_SO_THI_LUC (MAHOSO, MAKH, MANS, NGAYKHAM, KETLUAN) VALUES ('HS_S02', 'KH002', 'NS002', SYSTIMESTAMP - INTERVAL '1' DAY, N'Loạn thị mắt phải. Theo dõi định kỳ.');
INSERT INTO HO_SO_THI_LUC (MAHOSO, MAKH, MANS, NGAYKHAM, KETLUAN) VALUES ('HS_S04', 'KH004', 'NS002', SYSTIMESTAMP - INTERVAL '5' DAY, N'Cận thị nặng. Loạn thị nhẹ.');

INSERT INTO CHI_TIET_THI_LUC (MAHOSO, MAT, DOCAU_SPH, DOTRU_CYL, TRUC_AX, KHOANGCACH_PD) VALUES ('HS_S01', 'R', -2.50, -0.25, 180, 31.5);
INSERT INTO CHI_TIET_THI_LUC (MAHOSO, MAT, DOCAU_SPH, DOTRU_CYL, TRUC_AX, KHOANGCACH_PD) VALUES ('HS_S01', 'L', -3.00, 0.00, 0, 32.0);
INSERT INTO CHI_TIET_THI_LUC (MAHOSO, MAT, DOCAU_SPH, DOTRU_CYL, TRUC_AX, KHOANGCACH_PD) VALUES ('HS_S04', 'R', -5.00, -0.75, 175, 32.5);

INSERT INTO LICH_HEN_TRIEU_CHUNG (MALH, MA_TC, MO_TA_TU_DO) VALUES ('LH_S01', 'TC01', N'Nhìn mờ khi đọc sách từ khoảng cách gần');
INSERT INTO LICH_HEN_TRIEU_CHUNG (MALH, MA_TC, MO_TA_TU_DO) VALUES ('LH_S02', 'TC02', N'Nhức mắt kéo dài');

-- ============================================================
-- BƯỚC 13: PHIẾU KÊ ĐƠN & CHI TIẾT (Dùng ID cứng KD_S01...)
-- ============================================================
INSERT INTO PHIEU_KE_DON (MADON, MAHOSO, MANS, NGAYKEDON, LOIDAN) VALUES ('KD_S01', 'HS_S01', 'NS002', TRUNC(SYSDATE) - 2, N'Đeo kính thường xuyên');
INSERT INTO PHIEU_KE_DON (MADON, MAHOSO, MANS, NGAYKEDON, LOIDAN) VALUES ('KD_S04', 'HS_S04', 'NS002', TRUNC(SYSDATE) - 5, N'Nhỏ thuốc Rohto 2 lần/ngày');

INSERT INTO CT_KE_DON (MADON, MASP, SOLUONG, LIEUDUNG, CACHDUNG) VALUES ('KD_S01', 'SP001', 1, N'1 cặp tròng', N'Lắp vào gọng kính');
INSERT INTO CT_KE_DON (MADON, MASP, SOLUONG, LIEUDUNG, CACHDUNG) VALUES ('KD_S01', 'SP006', 1, N'1 gọng', N'Chọn gọng phù hợp khuôn mặt');

-- ============================================================
-- BƯỚC 14: XỬ LÝ KÍNH
-- ============================================================
INSERT INTO XU_LY_KINH (MAXL, MADON, THONG_SO_KINH, TRANG_THAI, NGAY_BAT_DAU, NGAY_HOAN_THANH, MANS_KY_THUAT)
VALUES (NULL, 'KD_S01', '{"sph_r": -2.50, "cyl_r": -0.25, "ax_r": 180, "pd": 63.5}', N'Hoàn thành', SYSTIMESTAMP - INTERVAL '1' DAY - INTERVAL '2' HOUR, SYSTIMESTAMP - INTERVAL '1' DAY, 'NS006');

-- ============================================================
-- BƯỚC 15: HÓA ĐƠN & THANH TOÁN (Dùng ID cứng HD_S01...)
-- ============================================================
INSERT INTO HOA_DON (MAHD, MAKH, MANS, MAHOSO, MADON, NGAYLAP, TRANGTHAI) VALUES ('HD_S01', 'KH001', 'NS004', 'HS_S01', 'KD_S01', SYSTIMESTAMP - INTERVAL '2' DAY, N'Chưa thanh toán');
INSERT INTO HOA_DON (MAHD, MAKH, MANS, MAHOSO, NGAYLAP, TRANGTHAI) VALUES ('HD_S02', 'KH002', 'NS004', 'HS_S02', SYSTIMESTAMP - INTERVAL '1' DAY, N'Chưa thanh toán');

INSERT INTO CT_HOA_DON_DV (MAHD, MADV, SOLUONG, DONGIA) VALUES ('HD_S01', 'DV01', 1, 150000);
INSERT INTO CT_HOA_DON_DV (MAHD, MADV, SOLUONG, DONGIA) VALUES ('HD_S01', 'DV06', 1, 200000);

-- Trigger TRG_THANH_TOAN sẽ tự động chốt đơn và cộng điểm
INSERT INTO THANH_TOAN (MATT, MAHD, MANS, SOTIEN, PHUONGTHUC, TRANGTHAI, GHICHU) VALUES (NULL, 'HD_S01', 'NS004', 350000, N'Tiền mặt', N'Thành công', N'KH thanh toán đủ');

-- ============================================================
-- BƯỚC 16,17,18: Bổ sung tương tự...
-- ============================================================
INSERT INTO DANH_GIA (MADG, MAHOSO, MAKH, MANS, SO_SAO, NOI_DUNG) VALUES (NULL, 'HS_S01', 'KH001', 'NS002', 5, N'Bác sĩ rất tận tâm!');
INSERT INTO KH_KHUYEN_MAI (MAKH, MAKM, MAHD, NGAY_SD) VALUES ('KH001', 'KM001', 'HD_S01', SYSTIMESTAMP - INTERVAL '2' DAY);

COMMIT;