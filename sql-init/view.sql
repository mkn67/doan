-- ============================================================
-- XÓA TOÀN BỘ VIEW CŨ
-- ============================================================
BEGIN
    FOR v IN (SELECT VIEW_NAME FROM USER_VIEWS WHERE VIEW_NAME LIKE 'V_%') LOOP
        EXECUTE IMMEDIATE 'DROP VIEW ' || v.VIEW_NAME;
    END LOOP;
END;
/

-- ============================================================
-- V_LICH_HEN_TRIEU_CHUNG
-- ============================================================
CREATE OR REPLACE VIEW V_LICH_HEN_TRIEU_CHUNG AS
SELECT 
    lh.MALH, 
    lh.NGAYHEN, 
    lh.MAKH,
    kh.HOTEN AS TEN_KHACH, 
    lh.TRANGTHAI,
    tc.MA_TC, 
    tc.TEN_TC, 
    lhtc.MO_TA_TU_DO
FROM LICH_HEN lh
INNER JOIN LICH_HEN_TRIEU_CHUNG lhtc ON lh.MALH = lhtc.MALH
INNER JOIN TRIEU_CHUNG tc ON lhtc.MA_TC = tc.MA_TC
LEFT JOIN KHACH_HANG kh ON lh.MAKH = kh.MAKH;

-- ============================================================
-- V_RATING_BAC_SI
-- ============================================================
CREATE OR REPLACE VIEW V_RATING_BAC_SI AS
SELECT
    ns.MANS, 
    ns.HOTEN, 
    ns.CHUYENKHOA,
    COUNT(DISTINCT hs.MAHOSO) AS TONG_LUOT_KHAM,
    COUNT(dg.MADG) AS TONG_DANH_GIA,
    ROUND(COALESCE(AVG(dg.SO_SAO), 0), 1) AS RATING_TRUNG_BINH,
    COALESCE(SUM(CASE WHEN tt.TRANGTHAI = N'HOAN_THANH' THEN tt.SOTIEN ELSE 0 END), 0) AS TONG_DOANH_THU
FROM NHAN_SU ns
LEFT JOIN HO_SO_THI_LUC hs ON ns.MANS = hs.MANS
LEFT JOIN DANH_GIA dg ON ns.MANS = dg.MANS AND dg.IS_HIDDEN = 0
LEFT JOIN HOA_DON hd ON hs.MAHOSO = hd.MAHOSO AND hd.TRANGTHAI != N'DA_HUY'
LEFT JOIN THANH_TOAN tt ON hd.MAHD = tt.MAHD
WHERE ns.IS_DELETED = 0
GROUP BY ns.MANS, ns.HOTEN, ns.CHUYENKHOA;

-- ============================================================
-- V_HIEU_SUAT_BAC_SI
-- ============================================================
CREATE OR REPLACE VIEW V_HIEU_SUAT_BAC_SI AS
SELECT
    ns.MANS, 
    ns.HOTEN, 
    ns.CHUYENKHOA,
    TO_CHAR(hs.NGAYKHAM, 'YYYY-MM') AS THANG,
    COUNT(DISTINCT hs.MAHOSO) AS SO_LUOT_KHAM,
    ROUND(COALESCE(AVG(dg.SO_SAO), 0), 1) AS RATING_THANG,
    COALESCE(SUM(CASE WHEN tt.TRANGTHAI = N'HOAN_THANH' THEN tt.SOTIEN ELSE 0 END), 0) AS DOANH_THU_THANG,
    COUNT(DISTINCT CASE WHEN dg.SO_SAO >= 4 THEN dg.MADG END) AS DANH_GIA_TOT,
    COUNT(DISTINCT CASE WHEN dg.SO_SAO <= 2 THEN dg.MADG END) AS DANH_GIA_XAU
FROM NHAN_SU ns
INNER JOIN HO_SO_THI_LUC hs ON ns.MANS = hs.MANS
LEFT JOIN DANH_GIA dg ON hs.MAHOSO = dg.MAHOSO AND dg.IS_HIDDEN = 0
LEFT JOIN HOA_DON hd ON hs.MAHOSO = hd.MAHOSO AND hd.TRANGTHAI != N'DA_HUY'
LEFT JOIN THANH_TOAN tt ON hd.MAHD = tt.MAHD
WHERE ns.IS_DELETED = 0
GROUP BY ns.MANS, ns.HOTEN, ns.CHUYENKHOA, TO_CHAR(hs.NGAYKHAM, 'YYYY-MM');

-- ============================================================
-- V_SLOT_TRONG
-- ============================================================
CREATE OR REPLACE VIEW V_SLOT_TRONG AS
SELECT
    llv.MANS, 
    ns.HOTEN AS TEN_BAC_SI, 
    ns.CHUYENKHOA,
    llv.NGAY_LAM, 
    llv.GIO_BAT_DAU, 
    llv.GIO_KET_THUC,
    (SELECT COUNT(*) 
     FROM LICH_HEN lh
     WHERE lh.MANS = llv.MANS 
       AND TRUNC(lh.GIO_HEN) = llv.NGAY_LAM 
       AND lh.TRANGTHAI NOT IN (N'DA_HUY', N'Đã hủy')
       AND EXTRACT(HOUR FROM lh.GIO_HEN) + EXTRACT(MINUTE FROM lh.GIO_HEN)/60.0 
           BETWEEN llv.GIO_BAT_DAU AND llv.GIO_KET_THUC
    ) AS SO_LICH_DA_DAT,
    CASE 
        WHEN EXISTS (SELECT 1 FROM LICH_HEN lh
                     WHERE lh.MANS = llv.MANS 
                       AND TRUNC(lh.GIO_HEN) = llv.NGAY_LAM 
                       AND lh.TRANGTHAI NOT IN (N'DA_HUY', N'Đã hủy')
                       AND EXTRACT(HOUR FROM lh.GIO_HEN) + EXTRACT(MINUTE FROM lh.GIO_HEN)/60.0 
                           BETWEEN llv.GIO_BAT_DAU AND llv.GIO_KET_THUC)
        THEN N'Đã đặt' 
        ELSE N'Còn trống'
    END AS TRANG_THAI_SLOT
FROM LICH_LAM_VIEC llv
INNER JOIN NHAN_SU ns ON llv.MANS = ns.MANS
WHERE llv.IS_NGHI = 0 
  AND llv.NGAY_LAM >= TRUNC(SYSDATE) 
  AND ns.IS_DELETED = 0;

-- ============================================================
-- V_HANG_CHO_HOM_NAY
-- ============================================================
CREATE OR REPLACE VIEW V_HANG_CHO_HOM_NAY AS
SELECT
    hc.MAHC, 
    hc.SO_THU_TU, 
    hc.LOAI_KHACH,
    COALESCE(kh.HOTEN, hc.TEN_KHACH) AS TEN_KHACH, 
    kh.SDT, 
    kh.DIEMTICHLUY,
    ns.HOTEN AS TEN_BAC_SI,
    gk.TENGOI AS GOI_KHAM,
    hc.TRANG_THAI, 
    hc.GIO_DANG_KY, 
    hc.GIO_VAO_KHAM,
    ROUND(EXTRACT(HOUR FROM (COALESCE(hc.GIO_VAO_KHAM, SYSTIMESTAMP) - hc.GIO_DANG_KY)) * 60 +
          EXTRACT(MINUTE FROM (COALESCE(hc.GIO_VAO_KHAM, SYSTIMESTAMP) - hc.GIO_DANG_KY))) AS PHUT_CHO,
    CASE
        WHEN EXTRACT(HOUR FROM (COALESCE(hc.GIO_VAO_KHAM, SYSTIMESTAMP) - hc.GIO_DANG_KY)) * 60 +
             EXTRACT(MINUTE FROM (COALESCE(hc.GIO_VAO_KHAM, SYSTIMESTAMP) - hc.GIO_DANG_KY)) > 45 THEN N'Quá lâu'
        WHEN EXTRACT(HOUR FROM (COALESCE(hc.GIO_VAO_KHAM, SYSTIMESTAMP) - hc.GIO_DANG_KY)) * 60 +
             EXTRACT(MINUTE FROM (COALESCE(hc.GIO_VAO_KHAM, SYSTIMESTAMP) - hc.GIO_DANG_KY)) > 20 THEN N'Chờ lâu'
        ELSE N'Bình thường'
    END AS MUC_DO_CHO
FROM HANG_CHO hc
LEFT JOIN KHACH_HANG kh ON hc.MAKH = kh.MAKH
LEFT JOIN NHAN_SU ns ON hc.MANS_PHAN_CONG = ns.MANS
LEFT JOIN LICH_HEN lh ON hc.MALH = lh.MALH
LEFT JOIN GOI_KHAM gk ON lh.MAGOI = gk.MAGOI
WHERE TRUNC(hc.GIO_DANG_KY) = TRUNC(SYSDATE) 
  AND hc.TRANG_THAI NOT IN (N'HOAN_THANH', N'Bỏ về')
ORDER BY CASE WHEN hc.LOAI_KHACH = N'Walk-in' THEN 0 ELSE 1 END, hc.SO_THU_TU;

-- ============================================================
-- V_THONG_KE_CHO
-- ============================================================
CREATE OR REPLACE VIEW V_THONG_KE_CHO AS
SELECT
    TRUNC(hc.GIO_DANG_KY) AS NGAY,
    ns.MANS, 
    ns.HOTEN AS TEN_BAC_SI, 
    COUNT(*) AS SO_LUOT,
    ROUND(AVG(EXTRACT(HOUR FROM (COALESCE(hc.GIO_VAO_KHAM, SYSTIMESTAMP) - hc.GIO_DANG_KY)) * 60 +
              EXTRACT(MINUTE FROM (COALESCE(hc.GIO_VAO_KHAM, SYSTIMESTAMP) - hc.GIO_DANG_KY))), 1) AS PHUT_CHO_TB,
    MAX(EXTRACT(HOUR FROM (COALESCE(hc.GIO_VAO_KHAM, SYSTIMESTAMP) - hc.GIO_DANG_KY)) * 60 +
        EXTRACT(MINUTE FROM (COALESCE(hc.GIO_VAO_KHAM, SYSTIMESTAMP) - hc.GIO_DANG_KY))) AS PHUT_CHO_MAX
FROM HANG_CHO hc
LEFT JOIN NHAN_SU ns ON hc.MANS_PHAN_CONG = ns.MANS
WHERE hc.TRANG_THAI NOT IN (N'HOAN_THANH', N'Bỏ về')
GROUP BY TRUNC(hc.GIO_DANG_KY), ns.MANS, ns.HOTEN;

-- ============================================================
-- V_CANH_BAO_TON_KHO
-- ============================================================
CREATE OR REPLACE VIEW V_CANH_BAO_TON_KHO AS
SELECT
    sp.MASP, 
    sp.TENSP, 
    sp.DONVITINH,
    COALESCE(SUM(lh.SOLUONGTON), 0) AS TONG_TON,
    sp.TON_KHO_TOI_THIEU,
    COALESCE(SUM(lh.SOLUONGTON * lh.GIANHAP), 0) AS GIA_TRI_TON_KHO,
    MIN(lh.NGAYHETHAN) AS HAN_GAN_NHAT,
    CASE
        WHEN COALESCE(SUM(lh.SOLUONGTON), 0) = 0 THEN N'Hết hàng'
        WHEN COALESCE(SUM(lh.SOLUONGTON), 0) <= sp.TON_KHO_TOI_THIEU THEN N'Sắp hết'
        WHEN COALESCE(SUM(lh.SOLUONGTON), 0) <= sp.TON_KHO_TOI_THIEU * 2 THEN N'Cảnh báo'
        ELSE N'Ổn định'
    END AS MUC_DO
FROM SAN_PHAM sp
LEFT JOIN LO_HANG lh ON sp.MASP = lh.MASP AND lh.NGAYHETHAN > SYSDATE AND lh.SOLUONGTON > 0
GROUP BY sp.MASP, sp.TENSP, sp.DONVITINH, sp.TON_KHO_TOI_THIEU
HAVING COALESCE(SUM(lh.SOLUONGTON), 0) <= sp.TON_KHO_TOI_THIEU * 2 
   OR COALESCE(SUM(lh.SOLUONGTON), 0) = 0;

-- ============================================================
-- V_LO_HANG_SAP_HET_HAN
-- ============================================================
CREATE OR REPLACE VIEW V_LO_HANG_SAP_HET_HAN AS
SELECT
    lh.MALO, 
    sp.MASP, 
    sp.TENSP, 
    lh.SOLUONGTON, 
    lh.NGAYHETHAN,
    TRUNC(lh.NGAYHETHAN - SYSDATE) AS NGAY_CON_LAI,
    lh.GIANHAP,
    lh.SOLUONGTON * lh.GIANHAP AS GIA_TRI_CO_NGUY_CO,
    CASE
        WHEN TRUNC(lh.NGAYHETHAN - SYSDATE) <= 0 THEN N'Đã hết hạn'
        WHEN TRUNC(lh.NGAYHETHAN - SYSDATE) <= 30 THEN N'Nguy hiểm'
        ELSE N'Cảnh báo'
    END AS MUC_DO
FROM LO_HANG lh
INNER JOIN SAN_PHAM sp ON lh.MASP = sp.MASP
WHERE lh.NGAYHETHAN <= SYSDATE + 60 
  AND lh.SOLUONGTON > 0
ORDER BY lh.NGAYHETHAN;

-- ============================================================
-- V_DOANH_THU_THANG
-- ============================================================
CREATE OR REPLACE VIEW V_DOANH_THU_THANG AS
SELECT
    TO_CHAR(tt.NGAYTHANHTOAN, 'YYYY-MM') AS THANG,
    COUNT(DISTINCT hd.MAHD) AS SO_HOA_DON,
    COUNT(DISTINCT hd.MAKH) AS SO_KHACH,
    SUM(tt.SOTIEN) AS TONG_DOANH_THU,
    ROUND(AVG(tt.SOTIEN), 0) AS DOANH_THU_TB_HOA_DON,
    SUM(CASE WHEN UPPER(tt.PHUONGTHUC) = 'TIEN_MAT' THEN tt.SOTIEN ELSE 0 END) AS TIEN_MAT,
    SUM(CASE WHEN UPPER(tt.PHUONGTHUC) = 'CHUYEN_KHOAN' THEN tt.SOTIEN ELSE 0 END) AS CHUYEN_KHOAN,
    SUM(CASE WHEN UPPER(tt.PHUONGTHUC) = 'THE_TIN_DUNG' THEN tt.SOTIEN ELSE 0 END) AS THE_TIN_DUNG
FROM THANH_TOAN tt
INNER JOIN HOA_DON hd ON tt.MAHD = hd.MAHD
WHERE UPPER(tt.TRANGTHAI) = 'HOAN_THANH'
  AND UPPER(hd.TRANGTHAI) != 'DA_HUY'
GROUP BY TO_CHAR(tt.NGAYTHANHTOAN, 'YYYY-MM')
ORDER BY THANG DESC;

-- ============================================================
-- V_TOP_DICH_VU
-- ============================================================
CREATE OR REPLACE VIEW V_TOP_DICH_VU AS
SELECT
    dv.MADV, 
    dv.TENDV,
    dv.GIA AS DON_GIA_NIEM_YET,
    COALESCE(SUM(ct.SOLUONG), 0) AS TONG_SO_LUONG,
    COALESCE(SUM(ct.SOLUONG * ct.DONGIA), 0) AS TONG_DOANH_THU,
    COUNT(DISTINCT ct.MAHD) AS SO_HOA_DON_CO,
    ROUND(AVG(ct.DONGIA), 0) AS GIA_TRUNG_BINH_THUC_TE
FROM DICH_VU_KHAM dv
LEFT JOIN CT_HOA_DON_DV ct ON dv.MADV = ct.MADV
LEFT JOIN HOA_DON hd ON ct.MAHD = hd.MAHD AND UPPER(hd.TRANGTHAI) != 'DA_HUY'
WHERE dv.IS_ACTIVE = 1
GROUP BY dv.MADV, dv.TENDV, dv.GIA
ORDER BY TONG_DOANH_THU DESC;

-- ============================================================
-- V_TOP_SAN_PHAM
-- ============================================================
CREATE OR REPLACE VIEW V_TOP_SAN_PHAM AS
SELECT
    sp.MASP, 
    sp.TENSP, 
    lsp.TENLOAI, 
    sp.GIABAN,
    COALESCE(SUM(ct.SOLUONG), 0) AS TONG_BAN,
    COALESCE(SUM(ct.SOLUONG * ct.DONGIA), 0) AS TONG_DOANH_THU,
    COALESCE(SUM(ct.SOLUONG * lh.GIANHAP), 0) AS TONG_GIA_VON,
    COALESCE(SUM(ct.SOLUONG * (ct.DONGIA - lh.GIANHAP)), 0) AS TONG_LOI_NHUAN
FROM SAN_PHAM sp
INNER JOIN LOAI_SAN_PHAM lsp ON sp.MALOAI = lsp.MALOAI
LEFT JOIN CT_HOA_DON ct ON sp.MASP = ct.MASP
LEFT JOIN LO_HANG lh ON ct.MALO = lh.MALO
LEFT JOIN HOA_DON hd ON ct.MAHD = hd.MAHD AND UPPER(hd.TRANGTHAI) != 'DA_HUY'
GROUP BY sp.MASP, sp.TENSP, lsp.TENLOAI, sp.GIABAN
ORDER BY TONG_DOANH_THU DESC;

-- ============================================================
-- V_PHAN_TICH_DIEM
-- ============================================================
CREATE OR REPLACE VIEW V_PHAN_TICH_DIEM AS
SELECT
    kh.MAKH, 
    kh.HOTEN, 
    kh.DIEMTICHLUY AS DIEM_HIEN_TAI,
    COALESCE(SUM(CASE WHEN lsd.LOAI = N'Cong' THEN lsd.SO_DIEM ELSE 0 END), 0) AS TONG_TICH_LUY,
    COALESCE(SUM(CASE WHEN lsd.LOAI IN (N'Tru', N'Quy_doi') THEN lsd.SO_DIEM ELSE 0 END), 0) AS TONG_DA_DUNG,
    COUNT(lsd.MALSD) AS SO_GIAO_DICH_DIEM,
    MAX(lsd.THOI_GIAN) AS LAN_BIEN_DONG_CUOI
FROM KHACH_HANG kh
LEFT JOIN LICH_SU_DIEM lsd ON kh.MAKH = lsd.MAKH
WHERE kh.IS_DELETED = 0
GROUP BY kh.MAKH, kh.HOTEN, kh.DIEMTICHLUY;

-- ============================================================
-- V_KHUYEN_MAI_HIEU_QUA
-- ============================================================
CREATE OR REPLACE VIEW V_KHUYEN_MAI_HIEU_QUA AS
SELECT
    km.MAKM, 
    km.TENKM, 
    km.LOAI, 
    km.GIA_TRI, 
    km.MA_CODE,
    km.NGAY_BD, 
    km.NGAY_KT, 
    km.SO_LUONG AS HAN_MUC, 
    km.DA_DUNG AS DA_SU_DUNG,
    COUNT(kkm.MAKH) AS LUOT_KH_DUNG,
    COALESCE(SUM(tt.SOTIEN), 0) AS TONG_DOANH_THU_KEM,
    ROUND(km.DA_DUNG * 100.0 / NULLIF(km.SO_LUONG, 0), 1) AS TY_LE_SU_DUNG_PCT,
    CASE
        WHEN km.NGAY_KT < TRUNC(SYSDATE) THEN N'Đã kết thúc'
        WHEN km.NGAY_BD > TRUNC(SYSDATE) THEN N'Chưa bắt đầu'
        WHEN km.DA_DUNG >= km.SO_LUONG THEN N'Hết lượt'
        WHEN km.IS_ACTIVE = 0 THEN N'Tạm dừng'
        ELSE N'Đang chạy'
    END AS TRANG_THAI
FROM KHUYEN_MAI km
LEFT JOIN KH_KHUYEN_MAI kkm ON km.MAKM = kkm.MAKM
LEFT JOIN HOA_DON hd ON kkm.MAHD = hd.MAHD
LEFT JOIN THANH_TOAN tt ON hd.MAHD = tt.MAHD AND UPPER(tt.TRANGTHAI) = 'HOAN_THANH'
GROUP BY km.MAKM, km.TENKM, km.LOAI, km.GIA_TRI, km.MA_CODE, 
         km.NGAY_BD, km.NGAY_KT, km.SO_LUONG, km.DA_DUNG, km.IS_ACTIVE;

-- ============================================================
-- V_TOAN_CANH_HO_SO
-- ============================================================
CREATE OR REPLACE VIEW V_TOAN_CANH_HO_SO AS
SELECT
    hs.MAHOSO, 
    hs.NGAYKHAM, 
    kh.MAKH, 
    kh.HOTEN AS TEN_KHACH, 
    kh.SDT,
    ns.HOTEN AS TEN_BAC_SI, 
    ns.CHUYENKHOA, 
    hs.KETLUAN,
    pkd.MADON, 
    pkd.LOIDAN, 
    xl.TRANG_THAI AS TRANG_THAI_KINH,
    hd.MAHD, 
    hd.TONGTIEN, 
    hd.TRANGTHAI AS TRANG_THAI_HOA_DON,
    dg.SO_SAO, 
    dg.NOI_DUNG AS NOI_DUNG_DANH_GIA
FROM HO_SO_THI_LUC hs
INNER JOIN KHACH_HANG kh ON hs.MAKH = kh.MAKH
INNER JOIN NHAN_SU ns ON hs.MANS = ns.MANS
LEFT JOIN PHIEU_KE_DON pkd ON hs.MAHOSO = pkd.MAHOSO
LEFT JOIN XU_LY_KINH xl ON pkd.MADON = xl.MADON
LEFT JOIN HOA_DON hd ON hs.MAHOSO = hd.MAHOSO
LEFT JOIN DANH_GIA dg ON hs.MAHOSO = dg.MAHOSO AND dg.IS_HIDDEN = 0;

-- ============================================================
-- V_THONG_KE_SAN_PHAM_THEO_LOAI
-- ============================================================
CREATE OR REPLACE VIEW V_THONG_KE_SAN_PHAM_THEO_LOAI AS
SELECT
    lsp.MALOAI,
    lsp.TENLOAI,
    COUNT(DISTINCT sp.MASP) AS SO_SAN_PHAM,
    COALESCE(SUM(ct.SOLUONG), 0) AS TONG_SO_LUONG_BAN,
    COALESCE(SUM(ct.SOLUONG * ct.DONGIA), 0) AS TONG_DOANH_THU,
    COALESCE(SUM(ct.SOLUONG * lh.GIANHAP), 0) AS TONG_GIA_VON,
    COALESCE(SUM(ct.SOLUONG * (ct.DONGIA - lh.GIANHAP)), 0) AS TONG_LOI_NHUAN
FROM LOAI_SAN_PHAM lsp
LEFT JOIN SAN_PHAM sp ON lsp.MALOAI = sp.MALOAI
LEFT JOIN CT_HOA_DON ct ON sp.MASP = ct.MASP
LEFT JOIN LO_HANG lh ON ct.MALO = lh.MALO
LEFT JOIN HOA_DON hd ON ct.MAHD = hd.MAHD AND UPPER(hd.TRANGTHAI) != 'DA_HUY'
GROUP BY lsp.MALOAI, lsp.TENLOAI
ORDER BY TONG_DOANH_THU DESC;

-- ============================================================
-- V_THONG_KE_KHACH_HANG_VIP
-- ============================================================
CREATE OR REPLACE VIEW V_THONG_KE_KHACH_HANG_VIP AS
SELECT
    kh.MAKH,
    kh.HOTEN,
    kh.SDT,
    kh.DIEMTICHLUY,
    COUNT(DISTINCT hd.MAHD) AS SO_HOA_DON,
    SUM(hd.TONGTIEN) AS TONG_CHI_TIEU,
    MAX(hd.NGAYLAP) AS LAN_CUOI_MUA,
    CASE 
        WHEN SUM(hd.TONGTIEN) >= 10000000 THEN N'VIP Kim Cương'
        WHEN SUM(hd.TONGTIEN) >= 5000000 THEN N'VIP Vàng'
        WHEN SUM(hd.TONGTIEN) >= 2000000 THEN N'VIP Bạc'
        WHEN COUNT(DISTINCT hd.MAHD) >= 5 THEN N'Thân thiết'
        ELSE N'Bình thường'
    END AS HANG_THANH_VIEN
FROM KHACH_HANG kh
LEFT JOIN HOA_DON hd ON kh.MAKH = hd.MAKH AND UPPER(hd.TRANGTHAI) != 'DA_HUY'
WHERE kh.IS_DELETED = 0
GROUP BY kh.MAKH, kh.HOTEN, kh.SDT, kh.DIEMTICHLUY
ORDER BY TONG_CHI_TIEU DESC;


COMMIT;