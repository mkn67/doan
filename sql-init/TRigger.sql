-- ============================================================
-- PHẦN IV: TRIGGERS (NAVICAT-READY – KHÔNG LỖI)
-- ============================================================

-- 1. Nhân Sự
CREATE OR REPLACE TRIGGER TRG_VALIDATE_NHAN_SU
BEFORE INSERT OR UPDATE ON NHAN_SU
FOR EACH ROW
DECLARE
    v_tuoi NUMBER;
BEGIN
    IF :NEW.NGAYSINH IS NOT NULL THEN
        v_tuoi := FLOOR(MONTHS_BETWEEN(SYSDATE, :NEW.NGAYSINH) / 12);
        IF v_tuoi < 18 THEN
            RAISE_APPLICATION_ERROR(-20010, 'LOI: Nhan vien chua du 18 tuoi!');
        END IF;
    END IF;
END;
/

-- 2. Khách Hàng
CREATE OR REPLACE TRIGGER TRG_VALIDATE_KHACH_HANG
BEFORE INSERT OR UPDATE OR DELETE ON KHACH_HANG
FOR EACH ROW
DECLARE
    v_dummy NUMBER;
BEGIN
    IF INSERTING OR UPDATING THEN
        IF :NEW.SDT IS NOT NULL AND NOT REGEXP_LIKE(:NEW.SDT, '^[0-9]{9,11}$') THEN
            RAISE_APPLICATION_ERROR(-20013, 'LOI: SDT khong hop le (9-11 chu so)!');
        END IF;
    END IF;
    
    IF DELETING THEN
        BEGIN
            SELECT 1 INTO v_dummy FROM LICH_HEN 
            WHERE MAKH = :OLD.MAKH 
              AND TRANGTHAI IN (N'Mới', N'Chờ xác nhận', N'Đã xác nhận', N'Đã check-in') 
              AND ROWNUM = 1;
            RAISE_APPLICATION_ERROR(-20050, 'LOI: KH dang co lich hen cho - dung Soft Delete!');
        EXCEPTION WHEN NO_DATA_FOUND THEN NULL; 
        END;
    END IF;
END;
/

-- 3. Lịch Hẹn
CREATE OR REPLACE TRIGGER TRG_VALIDATE_LICH_HEN
FOR INSERT OR UPDATE ON LICH_HEN
COMPOUND TRIGGER
    TYPE t_lich_rec IS RECORD (
        malh    LICH_HEN.MALH%TYPE,
        mans    LICH_HEN.MANS%TYPE,
        gio_hen LICH_HEN.GIO_HEN%TYPE
    );
    TYPE t_lich_list IS TABLE OF t_lich_rec INDEX BY PLS_INTEGER;
    v_lich_arr t_lich_list;
    v_idx PLS_INTEGER := 0;

    BEFORE STATEMENT IS
    BEGIN
        v_idx := 0;
    END BEFORE STATEMENT;

    BEFORE EACH ROW IS
        v_ca_lam NUMBER;
        v_ton_kh NUMBER;
        v_ton_ns NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_ton_kh FROM KHACH_HANG WHERE MAKH = :NEW.MAKH AND IS_DELETED = 0;
        IF v_ton_kh = 0 THEN RAISE_APPLICATION_ERROR(-20032, 'LOI: Khach hang khong ton tai!'); END IF;

        SELECT COUNT(*) INTO v_ton_ns FROM NHAN_SU WHERE MANS = :NEW.MANS AND IS_DELETED = 0;
        IF v_ton_ns = 0 THEN RAISE_APPLICATION_ERROR(-20033, 'LOI: Bac si khong ton tai hoac da nghi!'); END IF;

        -- Chỉ chặn nếu bác sĩ có đăng ký nghỉ (IS_NGHI = 1) và lịch hẹn không phải là Hủy
        IF :NEW.TRANGTHAI != N'Đã hủy' THEN
            SELECT COUNT(*) INTO v_ca_lam FROM LICH_LAM_VIEC
            WHERE MANS = :NEW.MANS AND TRUNC(NGAY_LAM) = TRUNC(:NEW.NGAYHEN) AND IS_NGHI = 1;
            IF v_ca_lam > 0 THEN RAISE_APPLICATION_ERROR(-20030, 'LOI: Bac si da dang ky nghi phep vao ngay nay!'); END IF;
        END IF;

        IF :NEW.GIO_HEN IS NOT NULL AND :NEW.TRANGTHAI != N'Đã hủy' THEN
            v_idx := v_idx + 1;
            v_lich_arr(v_idx).malh    := :NEW.MALH;
            v_lich_arr(v_idx).mans    := :NEW.MANS;
            v_lich_arr(v_idx).gio_hen := :NEW.GIO_HEN;
        END IF;
    END BEFORE EACH ROW;

    AFTER STATEMENT IS
        v_trung NUMBER;
    BEGIN
        FOR i IN 1 .. v_idx LOOP
            SELECT COUNT(*) INTO v_trung
            FROM LICH_HEN
            WHERE MANS      = v_lich_arr(i).mans
              AND GIO_HEN   = v_lich_arr(i).gio_hen
              AND TRANGTHAI != N'Đã hủy'
              AND (v_lich_arr(i).malh IS NULL OR MALH != v_lich_arr(i).malh);
              
            -- IF v_trung > 0 THEN
            --     RAISE_APPLICATION_ERROR(-20031, 'LOI: Bac si da co lich slot nay!');
            -- END IF;
        END LOOP;
    END AFTER STATEMENT;
END TRG_VALIDATE_LICH_HEN;
/

-- 4. Hồ Sơ Thị Lực
CREATE OR REPLACE TRIGGER TRG_VALIDATE_HO_SO
BEFORE INSERT OR UPDATE ON HO_SO_THI_LUC
FOR EACH ROW
DECLARE
    v_tencv CHUC_VU.TENCV%TYPE;
BEGIN
    BEGIN
        SELECT cv.TENCV INTO v_tencv
        FROM NHAN_SU ns JOIN CHUC_VU cv ON ns.MACV = cv.MACV
        WHERE ns.MANS = :NEW.MANS;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20001, 'LOI: Khong tim thay chuc vu cua nhan vien!');
    END;
    IF v_tencv NOT IN (N'Bác sĩ', N'Kỹ thuật viên mắt kính') THEN
        RAISE_APPLICATION_ERROR(-20001, 'LOI: Chi Bac si/KTV mat kinh duoc lap Ho So!');
    END IF;
END;
/

-- 5. Hóa Đơn
CREATE OR REPLACE TRIGGER TRG_VALIDATE_HOA_DON
BEFORE INSERT OR UPDATE OR DELETE ON HOA_DON
FOR EACH ROW
DECLARE
    v_tencv NVARCHAR2(100);
BEGIN
    IF INSERTING OR UPDATING THEN
        BEGIN
            SELECT cv.TENCV INTO v_tencv
            FROM NHAN_SU ns JOIN CHUC_VU cv ON ns.MACV = cv.MACV
            WHERE ns.MANS = :NEW.MANS;

            IF v_tencv NOT IN (N'Thu ngân', N'Quản lý', N'Bác sĩ', N'Lễ tân', N'Kỹ thuật viên mắt kính') THEN
                RAISE_APPLICATION_ERROR(-20003, 'LOI: Nhan vien khong co quyen tao Hoa Don!');
            END IF;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                RAISE_APPLICATION_ERROR(-20003, 'LOI: Khong tim thay nhan vien hoac chuc vu!');
        END;
    END IF;

    IF (UPDATING OR DELETING) AND :OLD.TRANGTHAI = N'Đã thanh toán' THEN
        IF UPDATING AND :NEW.TRANGTHAI = N'Đã hủy' THEN
            -- Cho phép hủy hóa đơn đã thanh toán, nhưng không cho thay đổi thông tin khác
            IF NVL(:OLD.MAKH, ' ') != NVL(:NEW.MAKH, ' ') OR 
               NVL(:OLD.MANS, ' ') != NVL(:NEW.MANS, ' ') OR 
               NVL(:OLD.MAHOSO, ' ') != NVL(:NEW.MAHOSO, ' ') OR 
               NVL(:OLD.TONGTIEN, 0) != NVL(:NEW.TONGTIEN, 0) THEN
                RAISE_APPLICATION_ERROR(-20007, 'LOI: Khong duoc thay doi thong tin khac cua hoa don da thanh toan!');
            END IF;
        ELSE
            RAISE_APPLICATION_ERROR(-20007, 'LOI: Hoa don da thanh toan, khong can thiep!');
        END IF;
    END IF;
END;
/

-- 6. CT Hóa Đơn SP
CREATE OR REPLACE TRIGGER TRG_CT_HOA_DON_SP
FOR INSERT OR UPDATE OR DELETE ON CT_HOA_DON
COMPOUND TRIGGER
    v_ton NUMBER;
    v_hsd DATE;
    v_trangthai NVARCHAR2(50);
    
    BEFORE EACH ROW IS
    BEGIN
        BEGIN
            SELECT TRANGTHAI INTO v_trangthai FROM HOA_DON WHERE MAHD = NVL(:NEW.MAHD, :OLD.MAHD);
            IF v_trangthai IN (N'Đã thanh toán', N'Đã hủy') THEN
                RAISE_APPLICATION_ERROR(-20033, 'CTHD: Hoa don da dong!');
            END IF;
        EXCEPTION WHEN NO_DATA_FOUND THEN NULL; 
        END;

        IF INSERTING OR UPDATING THEN
            SELECT SOLUONGTON, NGAYHETHAN INTO v_ton, v_hsd FROM LO_HANG WHERE MALO = :NEW.MALO;
            IF v_hsd < TRUNC(SYSDATE) THEN
                RAISE_APPLICATION_ERROR(-20006, 'CTHD: Lo hang da het han!');
            END IF;
            IF :NEW.SOLUONG <= 0 THEN
                RAISE_APPLICATION_ERROR(-20014, 'CTHD: So luong phai > 0!');
            END IF;
            IF :NEW.SOLUONG > (CASE WHEN UPDATING THEN v_ton + :OLD.SOLUONG ELSE v_ton END) THEN
                RAISE_APPLICATION_ERROR(-20005, 'CTHD: Khong du hang trong kho!');
            END IF;
        END IF;
    END BEFORE EACH ROW;

    AFTER EACH ROW IS
    BEGIN
        IF INSERTING THEN
            UPDATE HOA_DON  SET TONGTIEN  = NVL(TONGTIEN,0) + (:NEW.SOLUONG * :NEW.DONGIA) WHERE MAHD = :NEW.MAHD;
            UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON - :NEW.SOLUONG WHERE MALO = :NEW.MALO;
        ELSIF UPDATING THEN
            UPDATE HOA_DON  SET TONGTIEN  = NVL(TONGTIEN,0) - (:OLD.SOLUONG * :OLD.DONGIA) + (:NEW.SOLUONG * :NEW.DONGIA) WHERE MAHD = :NEW.MAHD;
            UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON + :OLD.SOLUONG - :NEW.SOLUONG WHERE MALO = :NEW.MALO;
        ELSIF DELETING THEN
            UPDATE HOA_DON  SET TONGTIEN  = NVL(TONGTIEN,0) - (:OLD.SOLUONG * :OLD.DONGIA) WHERE MAHD = :OLD.MAHD;
            UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON + :OLD.SOLUONG WHERE MALO = :OLD.MALO;
        END IF;
    END AFTER EACH ROW;
END TRG_CT_HOA_DON_SP;
/

-- 7. CT Hóa Đơn DV
CREATE OR REPLACE TRIGGER TRG_CT_HOA_DON_DV
FOR INSERT OR UPDATE OR DELETE ON CT_HOA_DON_DV
COMPOUND TRIGGER
    AFTER EACH ROW IS
    BEGIN
        IF INSERTING THEN
            UPDATE HOA_DON SET TONGTIEN = NVL(TONGTIEN,0) + (:NEW.SOLUONG * :NEW.DONGIA) WHERE MAHD = :NEW.MAHD;
        ELSIF UPDATING THEN
            UPDATE HOA_DON SET TONGTIEN = NVL(TONGTIEN,0) - (:OLD.SOLUONG * :OLD.DONGIA) + (:NEW.SOLUONG * :NEW.DONGIA) WHERE MAHD = :NEW.MAHD;
        ELSIF DELETING THEN
            UPDATE HOA_DON SET TONGTIEN = NVL(TONGTIEN,0) - (:OLD.SOLUONG * :OLD.DONGIA) WHERE MAHD = :OLD.MAHD;
        END IF;
    END AFTER EACH ROW;
END TRG_CT_HOA_DON_DV;
/

CREATE OR REPLACE TRIGGER TRG_PHIEU_NHAP
BEFORE INSERT OR UPDATE ON PHIEU_NHAP
FOR EACH ROW
DECLARE
    v_tencv    CHUC_VU.TENCV%TYPE;
    v_lo_daban NUMBER;
BEGIN
    BEGIN
        SELECT cv.TENCV INTO v_tencv
        FROM NHAN_SU ns JOIN CHUC_VU cv ON ns.MACV = cv.MACV
        WHERE ns.MANS = :NEW.MANS;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20004, 'LOI: Khong tim thay chuc vu cua nhan vien!');
    END;
    
    IF v_tencv NOT IN (N'Thủ kho', N'Quản lý') THEN
        RAISE_APPLICATION_ERROR(-20004, 'LOI: Chi Thu kho/Quan ly lap phieu nhap!');
    END IF;
    
    -- KIỂM TRA CHỈ KHI MAPN THAY ĐỔI (tránh đọc LO_HANG khi nó đang bị INSERT)
    IF UPDATING AND :OLD.MAPN != :NEW.MAPN THEN
        SELECT COUNT(*) INTO v_lo_daban FROM LO_HANG WHERE MAPN = :OLD.MAPN AND SOLUONGTON < SOLUONGNHAP;
        IF v_lo_daban > 0 THEN
            RAISE_APPLICATION_ERROR(-20015, 'LOI: Phieu da xuat ban, khong the sua!');
        END IF;
    END IF;
END;
/

-- 9. Thanh Toán
CREATE OR REPLACE TRIGGER TRG_THANH_TOAN
FOR INSERT OR UPDATE ON THANH_TOAN
COMPOUND TRIGGER
    TYPE t_mahd_list IS TABLE OF VARCHAR2(10) INDEX BY PLS_INTEGER;
    v_mahd_arr t_mahd_list;
    v_idx PLS_INTEGER := 0;

    BEFORE STATEMENT IS
    BEGIN
        v_idx := 0;
    END BEFORE STATEMENT;

    BEFORE EACH ROW IS
        v_tong_hd NUMBER;
    BEGIN
        IF :NEW.MATT IS NULL THEN
            :NEW.MATT := 'TT' || LPAD(SEQ_THANH_TOAN.NEXTVAL, 6, '0');
        END IF;

        BEGIN
            SELECT TONGTIEN INTO v_tong_hd FROM HOA_DON WHERE MAHD = :NEW.MAHD;
            IF :NEW.SOTIEN <= 0 THEN
                RAISE_APPLICATION_ERROR(-20018, 'LOI: So tien thanh toan phai > 0!');
            END IF;
        EXCEPTION WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20018, 'LOI: Khong tim thay hoa don de thanh toan!');
        END;
    END BEFORE EACH ROW;

    AFTER EACH ROW IS
    BEGIN
        IF :NEW.TRANGTHAI = N'Hoàn thành' THEN
            v_idx := v_idx + 1;
            v_mahd_arr(v_idx) := :NEW.MAHD;
        END IF;
    END AFTER EACH ROW;

    AFTER STATEMENT IS
        v_tong_hd   NUMBER;
        v_da_tt     NUMBER;
        v_makh      VARCHAR2(10);
        v_diem_cong NUMBER;
    BEGIN
        FOR i IN 1 .. v_idx LOOP
            SELECT NVL(SUM(SOTIEN), 0) INTO v_da_tt
            FROM THANH_TOAN WHERE MAHD = v_mahd_arr(i) AND TRANGTHAI = N'Hoàn thành';
            
            SELECT TONGTIEN, MAKH INTO v_tong_hd, v_makh FROM HOA_DON WHERE MAHD = v_mahd_arr(i);
            
            IF v_da_tt >= v_tong_hd THEN
                -- Chỉ cộng điểm nếu hóa đơn chưa ở trạng thái 'Đã thanh toán'
                DECLARE
                    v_trangthai_cu NVARCHAR2(50);
                BEGIN
                    SELECT TRANGTHAI INTO v_trangthai_cu FROM HOA_DON WHERE MAHD = v_mahd_arr(i);
                    IF v_trangthai_cu != N'Đã thanh toán' THEN
                        UPDATE HOA_DON SET TRANGTHAI = N'Đã thanh toán' WHERE MAHD = v_mahd_arr(i);
                        
                        IF v_makh IS NOT NULL THEN
                            v_diem_cong := FLOOR(v_tong_hd / 100000);
                            IF v_diem_cong > 0 THEN
                                UPDATE KHACH_HANG SET DIEMTICHLUY = DIEMTICHLUY + v_diem_cong
                                WHERE MAKH = v_makh;
                                
                                INSERT INTO LICH_SU_DIEM(MALSD, MAKH, LOAI, SO_DIEM, LY_DO, MAHD)
                                VALUES ('LS' || LPAD(SEQ_LICH_SU_DIEM.NEXTVAL, 6, '0'), v_makh, N'Cong', v_diem_cong, N'Tích lũy từ thanh toán hóa đơn: ' || v_mahd_arr(i), v_mahd_arr(i));
                            END IF;
                        END IF;
                    END IF;
                END;
            END IF;
        END LOOP;
    END AFTER STATEMENT;
END TRG_THANH_TOAN;
/

-- 10. Audit Kết Luận
CREATE OR REPLACE TRIGGER TRG_AUDIT_HO_SO
AFTER UPDATE OF KETLUAN ON HO_SO_THI_LUC
FOR EACH ROW
BEGIN
    IF NVL(:OLD.KETLUAN, ' ') != NVL(:NEW.KETLUAN, ' ') THEN
        INSERT INTO AUDIT_HOSO_THILUC(MAAUDIT, MAHOSO, OLD_KETLUAN, NEW_KETLUAN, THOI_GIAN, NGUOI_THUC_HIEN)
        VALUES ('AUD' || LPAD(SEQ_AUDIT.NEXTVAL, 9, '0'), :OLD.MAHOSO, :OLD.KETLUAN, :NEW.KETLUAN, SYSTIMESTAMP, USER);
    END IF;
END;
/

-- 11. Lô Hàng
CREATE OR REPLACE TRIGGER TRG_LO_HANG
FOR INSERT OR UPDATE ON LO_HANG
COMPOUND TRIGGER
    BEFORE EACH ROW IS
    BEGIN
        IF INSERTING THEN 
            :NEW.SOLUONGTON := :NEW.SOLUONGNHAP; 
            IF :NEW.NGAYHETHAN <= TRUNC(SYSDATE) THEN
                RAISE_APPLICATION_ERROR(-20029, 'LOI: Lo hang da het han!');
            END IF;
        END IF;
    END BEFORE EACH ROW;

    AFTER EACH ROW IS
    BEGIN
        IF INSERTING THEN
            UPDATE PHIEU_NHAP SET TONGTIEN = NVL(TONGTIEN,0) + (:NEW.SOLUONGNHAP * :NEW.GIANHAP) WHERE MAPN = :NEW.MAPN;
        ELSIF UPDATING THEN
            UPDATE PHIEU_NHAP SET TONGTIEN = NVL(TONGTIEN,0) - (:OLD.SOLUONGNHAP * :OLD.GIANHAP) + (:NEW.SOLUONGNHAP * :NEW.GIANHAP) WHERE MAPN = :NEW.MAPN;
        END IF;
    END AFTER EACH ROW;
END TRG_LO_HANG;
/

-- 12. Kê Đơn
CREATE OR REPLACE TRIGGER TRG_VALIDATE_KE_DON
BEFORE INSERT OR UPDATE ON PHIEU_KE_DON
FOR EACH ROW
DECLARE
    v_tencv CHUC_VU.TENCV%TYPE;
BEGIN
    BEGIN
        SELECT cv.TENCV INTO v_tencv
        FROM NHAN_SU ns JOIN CHUC_VU cv ON ns.MACV = cv.MACV
        WHERE ns.MANS = :NEW.MANS;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20025, 'LOI: Khong tim thay chuc vu cua nhan vien!');
    END;
    
    IF v_tencv NOT IN (N'Bác sĩ', N'Kỹ thuật viên mắt kính') THEN
        RAISE_APPLICATION_ERROR(-20025, 'LOI: Chi Bac si/KTV duoc Ke Don!');
    END IF;
END;
/

-- 13. Hủy Hóa Đơn
CREATE OR REPLACE TRIGGER TRG_HOA_DON_HUY
AFTER UPDATE OF TRANGTHAI ON HOA_DON
FOR EACH ROW
WHEN (NEW.TRANGTHAI = N'Đã hủy' AND OLD.TRANGTHAI != N'Đã hủy')
DECLARE
    v_diem_tru INT;
BEGIN
    FOR rec IN (SELECT MALO, SOLUONG FROM CT_HOA_DON WHERE MAHD = :NEW.MAHD) LOOP
        UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON + rec.SOLUONG WHERE MALO = rec.MALO;
    END LOOP;

    IF :OLD.TRANGTHAI = N'Đã thanh toán' AND :NEW.MAKH IS NOT NULL THEN
        v_diem_tru := FLOOR(:OLD.TONGTIEN / 100000);
        IF v_diem_tru > 0 THEN
            UPDATE KHACH_HANG 
            SET DIEMTICHLUY = GREATEST(0, DIEMTICHLUY - v_diem_tru)
            WHERE MAKH = :NEW.MAKH;

            -- Ghi nhận lịch sử khấu trừ điểm
            INSERT INTO LICH_SU_DIEM(MALSD, MAKH, LOAI, SO_DIEM, LY_DO, MAHD)
            VALUES ('LS' || LPAD(SEQ_LICH_SU_DIEM.NEXTVAL, 6, '0'), :NEW.MAKH, N'Tru', v_diem_tru, N'Khấu trừ tích lũy do hủy hóa đơn: ' || :NEW.MAHD, :NEW.MAHD);
        END IF;
    END IF;
END;
/

-- 14. Lịch sử giá
CREATE OR REPLACE TRIGGER TRG_LICH_SU_GIA
AFTER UPDATE OF GIABAN ON SAN_PHAM
FOR EACH ROW
WHEN (OLD.GIABAN != NEW.GIABAN)
BEGIN
    INSERT INTO LICH_SU_GIA(MALSG, MASP, GIA_CU, GIA_MOI, NGUOI_CAP_NHAT)
    VALUES ('LG' || LPAD(SEQ_LICH_SU_GIA.NEXTVAL, 6, '0'), :NEW.MASP, :OLD.GIABAN, :NEW.GIABAN, USER);
END;
/

-- 15. Tự sinh mã hàng chờ và số thứ tự
CREATE OR REPLACE TRIGGER TRG_GEN_MAHC
BEFORE INSERT ON HANG_CHO
FOR EACH ROW
DECLARE
    v_seq NUMBER;
    v_max_stt NUMBER;
    v_start_of_day TIMESTAMP;
    v_end_of_day TIMESTAMP;
BEGIN
    IF :NEW.MAHC IS NULL THEN
        SELECT SEQ_HANG_CHO.NEXTVAL INTO v_seq FROM DUAL;
        :NEW.MAHC := 'HC' || LPAD(v_seq, 6, '0');
    END IF;

    IF :NEW.SO_THU_TU IS NULL THEN
        v_start_of_day := TRUNC(CAST(SYSTIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh' AS DATE));
        v_end_of_day := v_start_of_day + 1 - 1/86400;

        SELECT NVL(MAX(SO_THU_TU), 0) INTO v_max_stt
        FROM HANG_CHO
        WHERE GIO_DANG_KY >= v_start_of_day AND GIO_DANG_KY <= v_end_of_day;

        :NEW.SO_THU_TU := v_max_stt + 1;
    END IF;

    IF :NEW.LOAI_KHACH IS NULL THEN
        IF :NEW.MALH IS NOT NULL THEN
            :NEW.LOAI_KHACH := N'Đặt lịch';
        ELSE
            :NEW.LOAI_KHACH := N'Walk-in';
        END IF;
    END IF;

    IF :NEW.TRANG_THAI IS NULL THEN
        :NEW.TRANG_THAI := N'Đang chờ';
    END IF;

    IF :NEW.TEN_KHACH IS NULL AND :NEW.MAKH IS NOT NULL THEN
        SELECT HOTEN INTO :NEW.TEN_KHACH FROM KHACH_HANG WHERE MAKH = :NEW.MAKH;
    END IF;
END;
/

COMMIT;