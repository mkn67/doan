-- ============================================================
-- 2. STORED PROCEDURES (ĐÃ LOẠI BỎ TRIGGER SINH MÃ, DÙNG SEQUENCE)
-- ============================================================

-- SP 1: Lưu hồ sơ khám bệnh
CREATE OR REPLACE PROCEDURE SP_LUU_HOSO_KHAM_BENH (
    p_mahoso       IN OUT VARCHAR2,
    p_makh         IN VARCHAR2,
    p_mans         IN VARCHAR2,
    p_ketluan      IN NVARCHAR2,
    p_mat_trai_sph IN NUMBER,
    p_mat_trai_cyl IN NUMBER,
    p_mat_trai_ax  IN NUMBER,
    p_docong_trai  IN NUMBER DEFAULT NULL,
    p_mat_phai_sph IN NUMBER,
    p_mat_phai_cyl IN NUMBER,
    p_mat_phai_ax  IN NUMBER,
    p_docong_phai  IN NUMBER DEFAULT NULL,
    p_pd           IN NUMBER,
    p_madon_out    OUT VARCHAR2
) AS
    v_mahoso VARCHAR2(10);
    v_madon  VARCHAR2(20);
BEGIN
    -- Tự sinh mã hồ sơ nếu chưa có
    IF p_mahoso IS NULL THEN
        v_mahoso := 'HS' || LPAD(SEQ_HO_SO.NEXTVAL, 6, '0');
        p_mahoso := v_mahoso;
    ELSE
        v_mahoso := p_mahoso;
    END IF;

    INSERT INTO HO_SO_THI_LUC(MAHOSO, MAKH, MANS, NGAYKHAM, KETLUAN)
    VALUES (v_mahoso, p_makh, p_mans, SYSTIMESTAMP, p_ketluan);

    INSERT INTO CHI_TIET_THI_LUC(MAHOSO, MAT, DOCAU_SPH, DOTRU_CYL, TRUC_AX, KHOANGCACH_PD, DOCONG_ADD)
    VALUES (v_mahoso, 'T', p_mat_trai_sph, p_mat_trai_cyl, p_mat_trai_ax, p_pd, p_docong_trai);
    INSERT INTO CHI_TIET_THI_LUC(MAHOSO, MAT, DOCAU_SPH, DOTRU_CYL, TRUC_AX, KHOANGCACH_PD, DOCONG_ADD)
    VALUES (v_mahoso, 'P', p_mat_phai_sph, p_mat_phai_cyl, p_mat_phai_ax, p_pd, p_docong_phai);

    v_madon := 'KD_' || v_mahoso;
    INSERT INTO PHIEU_KE_DON(MADON, MAHOSO, MANS, NGAYKEDON)
    VALUES (v_madon, v_mahoso, p_mans, SYSDATE);

    p_madon_out := v_madon;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END SP_LUU_HOSO_KHAM_BENH;
/

-- SP 2: Chốt thanh toán
CREATE OR REPLACE PROCEDURE SP_CHOT_THANH_TOAN_HOA_DON (
    p_mahd       IN  VARCHAR2,
    p_mans       IN  VARCHAR2,
    p_phuongthuc IN  NVARCHAR2,
    p_matt_out   OUT VARCHAR2
) AS
    v_tongtien NUMBER;
    v_matt     VARCHAR2(10);
    v_trangthai NVARCHAR2(50);
BEGIN
    BEGIN
        SELECT TONGTIEN, TRANGTHAI INTO v_tongtien, v_trangthai FROM HOA_DON WHERE MAHD = p_mahd;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20002, 'Hóa đơn không tồn tại');
    END;

    IF v_trangthai = N'Đã thanh toán' THEN
        RAISE_APPLICATION_ERROR(-20019, 'Hóa đơn đã được thanh toán trước đó!');
    ELSIF v_trangthai = N'Đã hủy' THEN
        RAISE_APPLICATION_ERROR(-20019, 'Không thể thanh toán hóa đơn đã hủy!');
    END IF;

    -- Tự sinh mã thanh toán
    v_matt := 'TT' || LPAD(SEQ_THANH_TOAN.NEXTVAL, 6, '0');

    INSERT INTO THANH_TOAN(MATT, MAHD, MANS, NGAYTHANHTOAN, SOTIEN, PHUONGTHUC, TRANGTHAI)
    VALUES (v_matt, p_mahd, p_mans, SYSTIMESTAMP, v_tongtien, p_phuongthuc, N'Hoàn thành');

    p_matt_out := v_matt;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END SP_CHOT_THANH_TOAN_HOA_DON;
/

-- SP 3: Nhập kho lô hàng
CREATE OR REPLACE PROCEDURE SP_NHAP_KHO_LO_HANG (
    p_mapn         IN OUT VARCHAR2,
    p_mancc        IN     VARCHAR2,
    p_mans         IN     VARCHAR2,
    p_malo         IN OUT VARCHAR2,
    p_masp         IN     VARCHAR2,
    p_ngaysx       IN     DATE,
    p_ngayhethan   IN     DATE,
    p_soluongnhap  IN     NUMBER,
    p_gianhap      IN     NUMBER,
    p_tongtien_out OUT    NUMBER
) AS
    v_existing NUMBER;
    v_tongtien NUMBER;
BEGIN
    -- Nếu chưa có mã phiếu nhập -> tạo mới
    IF p_mapn IS NULL THEN
        p_mapn := 'PN' || LPAD(SEQ_PHIEU_NHAP.NEXTVAL, 6, '0');
        INSERT INTO PHIEU_NHAP(MAPN, MANCC, MANS, NGAYNHAP, TONGTIEN)
        VALUES (p_mapn, p_mancc, p_mans, SYSTIMESTAMP, 0);
    ELSE
        BEGIN
            SELECT 1 INTO v_existing FROM PHIEU_NHAP WHERE MAPN = p_mapn AND ROWNUM = 1;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                INSERT INTO PHIEU_NHAP(MAPN, MANCC, MANS, NGAYNHAP, TONGTIEN)
                VALUES (p_mapn, p_mancc, p_mans, SYSTIMESTAMP, 0);
        END;
    END IF;

    IF p_ngayhethan <= p_ngaysx THEN
        RAISE_APPLICATION_ERROR(-20020, 'LỖI: HSD phải sau NSX!');
    END IF;
    IF p_ngayhethan <= SYSDATE THEN
        RAISE_APPLICATION_ERROR(-20021, 'LỖI: Không nhập hàng hết hạn!');
    END IF;

    -- Tự sinh mã lô hàng nếu chưa có
    IF p_malo IS NULL THEN
        p_malo := 'LO' || LPAD(SEQ_LO_HANG.NEXTVAL, 6, '0');
    END IF;

    INSERT INTO LO_HANG(MALO, MASP, MAPN, NGAYSANXUAT, NGAYHETHAN, SOLUONGNHAP, GIANHAP)
    VALUES (p_malo, p_masp, p_mapn, p_ngaysx, p_ngayhethan, p_soluongnhap, p_gianhap);

    -- Lấy tổng tiền sau khi Trigger TRG_LO_HANG đã chạy xong để trả về (Bỏ lệnh UPDATE để tránh nhân đôi tiền)
    SELECT TONGTIEN INTO v_tongtien FROM PHIEU_NHAP WHERE MAPN = p_mapn;
    p_tongtien_out := v_tongtien;

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END SP_NHAP_KHO_LO_HANG;
/

-- SP 4: Cảnh báo hàng hết hạn
CREATE OR REPLACE PROCEDURE SP_CANH_BAO_HANG_HET_HAN (
    p_so_ngay IN  NUMBER,
    c_result  OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN c_result FOR
        SELECT l.MALO, s.MASP, s.TENSP, s.DONVITINH, l.NGAYHETHAN,
               ROUND(l.NGAYHETHAN - SYSDATE) AS SO_NGAY_CON_LAI,
               l.SOLUONGTON AS TON_KHO,
               CASE WHEN ROUND(l.NGAYHETHAN - SYSDATE) <= 7  THEN N'Nguy hiểm'
                    WHEN ROUND(l.NGAYHETHAN - SYSDATE) <= 30 THEN N'Cảnh báo'
                    ELSE N'Chú ý' END AS MUC_DO,
               ncc.TENNCC AS NHA_CUNG_CAP
        FROM   LO_HANG l
        JOIN   SAN_PHAM     s   ON l.MASP  = s.MASP
        JOIN   PHIEU_NHAP   pn  ON l.MAPN  = pn.MAPN
        JOIN   NHA_CUNG_CAP ncc ON pn.MANCC = ncc.MANCC
        WHERE  l.SOLUONGTON > 0
          AND  l.NGAYHETHAN > SYSDATE
          AND  (l.NGAYHETHAN - SYSDATE) <= p_so_ngay
        ORDER BY l.NGAYHETHAN ASC;
END SP_CANH_BAO_HANG_HET_HAN;
/

-- SP 5: Thống kê doanh thu tháng
CREATE OR REPLACE PROCEDURE SP_THONG_KE_DOANH_THU_THANG (
    p_thang IN  NUMBER,
    p_nam   IN  NUMBER,
    c_data  OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN c_data FOR
        SELECT TO_CHAR(NGAYTHANHTOAN, 'DD/MM/YYYY') AS NGAY,
               COUNT(MATT)  AS SO_LUONG_DON,
               SUM(SOTIEN)  AS DOANH_THU_NGAY
        FROM   THANH_TOAN
        WHERE  TRANGTHAI = N'Hoàn thành'
          AND  EXTRACT(MONTH FROM NGAYTHANHTOAN) = p_thang
          AND  EXTRACT(YEAR  FROM NGAYTHANHTOAN) = p_nam
        GROUP BY TO_CHAR(NGAYTHANHTOAN, 'DD/MM/YYYY')
        ORDER BY TO_CHAR(NGAYTHANHTOAN, 'DD/MM/YYYY') ASC;
END SP_THONG_KE_DOANH_THU_THANG;
/

-- SP 6: Đặt lịch hẹn (tự sinh MALH)
CREATE OR REPLACE PROCEDURE SP_DAT_LICH_HEN (
    p_makh      IN  VARCHAR2,
    p_mans      IN  VARCHAR2,
    p_magoi     IN  VARCHAR2,
    p_ngayhen   IN  DATE,
    p_giohen    IN  TIMESTAMP,
    p_malh_out  OUT VARCHAR2
) AS
    v_ca_lam NUMBER;
    v_trung  NUMBER;
    v_malh   VARCHAR2(20);
BEGIN
    SELECT COUNT(*) INTO v_ca_lam FROM LICH_LAM_VIEC
    WHERE MANS = p_mans AND NGAY_LAM = TRUNC(p_ngayhen) AND IS_NGHI = 0;
    
    IF v_ca_lam = 0 THEN
        RAISE_APPLICATION_ERROR(-20035, 'Bác sĩ không làm việc ngày này!');
    END IF;

    SELECT COUNT(*) INTO v_trung FROM LICH_HEN
    WHERE MANS = p_mans AND GIO_HEN = p_giohen AND TRANGTHAI != N'Đã hủy';
    
    IF v_trung > 0 THEN
        RAISE_APPLICATION_ERROR(-20036, 'Slot đã được đặt!');
    END IF;

    -- Tự sinh mã lịch hẹn
    v_malh := 'LH' || LPAD(SEQ_LICH_HEN.NEXTVAL, 6, '0');

    INSERT INTO LICH_HEN(MALH, MAKH, MANS, MAGOI, NGAYHEN, GIO_HEN, LOAI_LICH, TRANGTHAI)
    VALUES (v_malh, p_makh, p_mans, p_magoi, p_ngayhen, p_giohen, N'Online', N'Mới');

    p_malh_out := v_malh;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END SP_DAT_LICH_HEN;
/

-- SP 7: Tạo lịch làm việc (tự sinh MALLV)
CREATE OR REPLACE PROCEDURE SP_TAO_LICH_LAM_VIEC (
    p_mans         IN VARCHAR2,
    p_ngay_lam     IN DATE,
    p_gio_bat_dau  IN NUMBER,
    p_gio_ket_thuc IN NUMBER,
    p_is_nghi      IN NUMBER DEFAULT 0
) AS
    v_dummy NUMBER;
    v_mallv VARCHAR2(10);
BEGIN
    BEGIN
        SELECT 1 INTO v_dummy FROM NHAN_SU WHERE MANS = p_mans AND IS_DELETED = 0 AND ROWNUM = 1;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20080, 'Nhân sự không tồn tại hoặc đã nghỉ!');
    END;

    IF p_gio_bat_dau >= p_gio_ket_thuc THEN
        RAISE_APPLICATION_ERROR(-20081, 'Giờ kết thúc phải > giờ bắt đầu!');
    END IF;

    BEGIN
        SELECT 1 INTO v_dummy FROM LICH_LAM_VIEC
        WHERE MANS = p_mans AND NGAY_LAM = p_ngay_lam AND IS_NGHI = 0
          AND (p_gio_bat_dau < GIO_KET_THUC AND p_gio_ket_thuc > GIO_BAT_DAU)
        AND ROWNUM = 1;
        RAISE_APPLICATION_ERROR(-20083, 'Khung giờ bị trùng lịch!');
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            NULL;
    END;

    -- Tự sinh mã lịch làm việc
    v_mallv := 'LV' || LPAD(SEQ_LICH_LAM_VIEC.NEXTVAL, 6, '0');

    INSERT INTO LICH_LAM_VIEC(MALLV, MANS, NGAY_LAM, GIO_BAT_DAU, GIO_KET_THUC, IS_NGHI)
    VALUES (v_mallv, p_mans, p_ngay_lam, p_gio_bat_dau, p_gio_ket_thuc, p_is_nghi);
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END SP_TAO_LICH_LAM_VIEC;
/

-- SP 8: Cập nhật hàng chờ (không sinh mã mới)
CREATE OR REPLACE PROCEDURE SP_CAP_NHAT_HANG_CHO (
    p_mahc         IN VARCHAR2,
    p_trang_thai   IN NVARCHAR2,
    p_gio_vao_kham IN TIMESTAMP DEFAULT NULL
) AS
    v_current_state NVARCHAR2(30);
    v_malh          VARCHAR2(10);
BEGIN
    BEGIN
        SELECT TRANG_THAI, MALH INTO v_current_state, v_malh
        FROM HANG_CHO WHERE MAHC = p_mahc;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20072, 'Mã hàng chờ không tồn tại');
    END;

    IF p_trang_thai NOT IN (N'Đang khám', N'Hoàn thành', N'Bỏ về') THEN
        RAISE_APPLICATION_ERROR(-20070, 'Trạng thái không hợp lệ');
    END IF;

    IF v_current_state = N'Đang chờ' AND p_trang_thai = N'Đang khám' THEN
        UPDATE HANG_CHO SET TRANG_THAI = p_trang_thai,
            GIO_VAO_KHAM = NVL(p_gio_vao_kham, SYSTIMESTAMP)
        WHERE MAHC = p_mahc;
    ELSIF v_current_state = N'Đang khám' AND p_trang_thai IN (N'Hoàn thành', N'Bỏ về') THEN
        UPDATE HANG_CHO SET TRANG_THAI = p_trang_thai WHERE MAHC = p_mahc;
        IF v_malh IS NOT NULL THEN
            UPDATE LICH_HEN SET TRANGTHAI = N'Đã khám'
            WHERE MALH = v_malh AND TRANGTHAI = N'Mới';
        END IF;
    ELSE
        RAISE_APPLICATION_ERROR(-20071, 'Không thể chuyển từ ' || v_current_state || ' sang ' || p_trang_thai);
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END SP_CAP_NHAT_HANG_CHO;
/

-- SP 9: Giao xử lý kính (tự sinh MAXL)
CREATE OR REPLACE PROCEDURE SP_GIAO_XU_LY_KINH (
   p_madon         IN  VARCHAR2,
   p_mans_ky_thuat IN  VARCHAR2,
   p_thong_so_kinh IN  CLOB,
   p_maxl_out      OUT VARCHAR2
) AS
   v_tencv  CHUC_VU.TENCV%TYPE;
   v_maxl   VARCHAR2(10);
BEGIN
   BEGIN
      SELECT 1 INTO v_tencv
      FROM PHIEU_KE_DON
      WHERE MADON = p_madon AND ROWNUM = 1;
   EXCEPTION
      WHEN NO_DATA_FOUND THEN
         RAISE_APPLICATION_ERROR(-20090, 'Phiếu kê đơn không tồn tại!');
   END;

   BEGIN
      SELECT cv.TENCV INTO v_tencv
      FROM NHAN_SU ns
      JOIN CHUC_VU cv ON ns.MACV = cv.MACV
      WHERE ns.MANS = p_mans_ky_thuat
        AND ns.IS_DELETED = 0;
   EXCEPTION
      WHEN NO_DATA_FOUND THEN
         RAISE_APPLICATION_ERROR(-20091, 'Nhân sự không hợp lệ hoặc đã bị xóa!');
   END;

   IF TRIM(v_tencv) != N'Kỹ thuật viên mắt kính' THEN
      RAISE_APPLICATION_ERROR(-20091, 'Chỉ KTV mắt kính mới nhận việc cắt kính!');
   END IF;

   -- Tự sinh mã xử lý kính
   v_maxl := 'XL' || LPAD(SEQ_XU_LY_KINH.NEXTVAL, 6, '0');

   INSERT INTO XU_LY_KINH (
      MAXL,
      MADON,
      THONG_SO_KINH,
      TRANG_THAI,
      NGAY_BAT_DAU,
      MANS_KY_THUAT
   )
   VALUES (
      v_maxl,
      p_madon,
      p_thong_so_kinh,
      N'Đang cắt',
      SYSTIMESTAMP,
      p_mans_ky_thuat
   );

   p_maxl_out := v_maxl;
EXCEPTION
   WHEN OTHERS THEN
      RAISE;
END SP_GIAO_XU_LY_KINH;
/

-- SP 10: Tạo hóa đơn qua JSON (tự sinh MAHD)
CREATE OR REPLACE PROCEDURE SP_TAO_HOA_DON (
    p_makh     IN  VARCHAR2,
    p_mans     IN  VARCHAR2,
    p_mahoso   IN  VARCHAR2,
    p_madon    IN  VARCHAR2,
    p_json_sp  IN  CLOB,
    p_json_dv  IN  CLOB,
    p_mahd_out OUT VARCHAR2
) AS
    v_mahd VARCHAR2(20);
BEGIN
    -- Tự sinh mã hóa đơn
    v_mahd := 'HD' || LPAD(SEQ_HOA_DON.NEXTVAL, 6, '0');

    INSERT INTO HOA_DON(MAHD, MAKH, MANS, MAHOSO, MADON, NGAYLAP, TONGTIEN, TRANGTHAI, IS_DELETED)
    VALUES (v_mahd, p_makh, p_mans, p_mahoso, p_madon, SYSTIMESTAMP, 0, N'Chưa thanh toán', 0);

    IF p_json_sp IS NOT NULL THEN
        INSERT INTO CT_HOA_DON(MAHD, MALO, SOLUONG, DONGIA)
        SELECT v_mahd, j.malo, j.sl, j.gia
        FROM JSON_TABLE(p_json_sp, '$[*]' COLUMNS (malo VARCHAR2(20) PATH '$.malo', sl NUMBER PATH '$.sl', gia NUMBER PATH '$.gia')) j;
    END IF;

    IF p_json_dv IS NOT NULL THEN
        INSERT INTO CT_HOA_DON_DV(MAHD, MADV, SOLUONG, DONGIA)
        SELECT v_mahd, j.madv, j.sl, j.gia
        FROM JSON_TABLE(p_json_dv, '$[*]' COLUMNS (madv VARCHAR2(20) PATH '$.madv', sl NUMBER PATH '$.sl', gia NUMBER PATH '$.gia')) j;
    END IF;

    p_mahd_out := v_mahd;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END SP_TAO_HOA_DON;
/

-- SP 11: Hủy hóa đơn
CREATE OR REPLACE PROCEDURE SP_HUY_HOA_DON (
    p_mahd IN VARCHAR2
) AS
    v_trang_thai NVARCHAR2(50);
BEGIN
    BEGIN
        SELECT TRANGTHAI INTO v_trang_thai FROM HOA_DON WHERE MAHD = p_mahd;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20094, 'Mã hóa đơn không tồn tại');
    END;

    IF v_trang_thai = N'Đã thanh toán' THEN
        RAISE_APPLICATION_ERROR(-20095, 'Không thể hủy hóa đơn đã thanh toán');
    ELSIF v_trang_thai = N'Đã hủy' THEN
        RAISE_APPLICATION_ERROR(-20096, 'Hóa đơn này đã được hủy trước đó');
    END IF;

    UPDATE HOA_DON SET TRANGTHAI = N'Đã hủy' WHERE MAHD = p_mahd;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END SP_HUY_HOA_DON;
/

-- SP 12: Hủy lịch hẹn
CREATE OR REPLACE PROCEDURE SP_HUY_LICH_HEN (
    p_malh IN VARCHAR2
) AS
    v_trang_thai NVARCHAR2(50);
BEGIN
    BEGIN
        SELECT TRANGTHAI INTO v_trang_thai FROM LICH_HEN WHERE MALH = p_malh;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20097, 'Mã lịch hẹn không tồn tại');
    END;

    IF v_trang_thai IN (N'Đã khám', N'Đang khám') THEN
        RAISE_APPLICATION_ERROR(-20098, 'Lịch hẹn đang diễn ra hoặc đã kết thúc, không thể hủy');
    END IF;

    UPDATE LICH_HEN SET TRANGTHAI = N'Đã hủy' WHERE MALH = p_malh;
    UPDATE HANG_CHO SET TRANG_THAI = N'Bỏ về'
    WHERE MALH = p_malh AND TRANG_THAI = N'Đang chờ';
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END SP_HUY_LICH_HEN;
/

-- SP 13: Cộng điểm thủ công (tự sinh MALSD)
CREATE OR REPLACE PROCEDURE SP_CONG_DIEM (
    p_makh    IN VARCHAR2,
    p_so_diem IN NUMBER,
    p_ly_do   IN NVARCHAR2,
    p_mahd    IN VARCHAR2 DEFAULT NULL
) AS
    v_dummy NUMBER;
    v_malsd VARCHAR2(10);
BEGIN
    IF p_so_diem <= 0 THEN
        RAISE_APPLICATION_ERROR(-20100, 'Số điểm cộng phải lớn hơn 0');
    END IF;

    BEGIN
        SELECT 1 INTO v_dummy FROM KHACH_HANG WHERE MAKH = p_makh AND ROWNUM = 1;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20101, 'Khách hàng không tồn tại');
    END;

    -- Tự sinh mã lịch sử điểm
    v_malsd := 'LS' || LPAD(SEQ_LICH_SU_DIEM.NEXTVAL, 6, '0');

    UPDATE KHACH_HANG SET DIEMTICHLUY = DIEMTICHLUY + p_so_diem WHERE MAKH = p_makh;

    INSERT INTO LICH_SU_DIEM(MALSD, MAKH, LOAI, SO_DIEM, LY_DO, MAHD)
    VALUES (v_malsd, p_makh, N'Cong', p_so_diem, p_ly_do, p_mahd);
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END SP_CONG_DIEM;
/
-- SP 14: Thống kê doanh thu theo khoảng ngày
CREATE OR REPLACE PROCEDURE SP_THONG_KE_DOANH_THU_THEO_NGAY (
    p_tu_ngay IN DATE,
    p_den_ngay IN DATE,
    c_result OUT SYS_REFCURSOR
) AS
BEGIN
    -- Check lỗi logic ngày tháng
    IF p_tu_ngay > p_den_ngay THEN
        RAISE_APPLICATION_ERROR(-20102, 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc!');
    END IF;

    OPEN c_result FOR
        SELECT 
            TRUNC(NGAYTHANHTOAN) AS NGAY_GIAO_DICH,
            SUM(SOTIEN) AS TONG_DOANH_THU,
            COUNT(MATT) AS SO_LUONG_DON
        FROM THANH_TOAN
        WHERE TRANGTHAI = N'Hoàn thành'
          AND TRUNC(NGAYTHANHTOAN) BETWEEN p_tu_ngay AND p_den_ngay
        GROUP BY TRUNC(NGAYTHANHTOAN)
        ORDER BY NGAY_GIAO_DICH ASC;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END SP_THONG_KE_DOANH_THU_THEO_NGAY;
/
-- ============================================================
-- 3. FUNCTION
-- ============================================================

CREATE OR REPLACE FUNCTION FN_GET_MALO_FEFO (
    p_masp        IN VARCHAR2,
    p_soluong_can IN NUMBER
) RETURN VARCHAR2
IS
    v_malo VARCHAR2(50);
BEGIN
    SELECT MALO
    INTO v_malo
    FROM (
        SELECT MALO
        FROM LO_HANG
        WHERE MASP = p_masp
          AND SOLUONGTON >= p_soluong_can
          AND NGAYHETHAN >= TRUNC(SYSDATE)
        ORDER BY NGAYHETHAN ASC,
                 SOLUONGTON DESC
    )
    WHERE ROWNUM = 1;
    RETURN v_malo;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN NULL;
END FN_GET_MALO_FEFO;
/

CREATE OR REPLACE FUNCTION FN_LAY_LICH_SU_KHAM_CUOI (
    p_makh IN VARCHAR2
) RETURN VARCHAR2
IS
    v_ketluan  HO_SO_THI_LUC.KETLUAN%TYPE;
    v_ngaykham DATE;
BEGIN
    SELECT KETLUAN, TRUNC(NGAYKHAM)
    INTO v_ketluan, v_ngaykham
    FROM (
        SELECT KETLUAN, NGAYKHAM
        FROM HO_SO_THI_LUC
        WHERE MAKH = p_makh
        ORDER BY NGAYKHAM DESC
    )
    WHERE ROWNUM = 1;

    RETURN 'Ngày khám gần nhất: ' || TO_CHAR(v_ngaykham, 'DD/MM/YYYY') 
           || ' | Kết luận: ' || v_ketluan;

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RETURN 'Khách hàng chưa có lịch sử khám.';
END;
/
