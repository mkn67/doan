-- ============================================================
-- PHẦN IV: TRIGGERS (ĐÃ SỬA LỖI, TỰ SINH MÃ)
-- ============================================================

-- 1. Nhân Sự
CREATE OR REPLACE TRIGGER TRG_VALIDATE_NHAN_SU
BEFORE INSERT OR UPDATE ON NHAN_SU
FOR EACH ROW
DECLARE
    v_tuoi  NUMBER;
BEGIN
    IF :NEW.NGAYSINH IS NOT NULL THEN
        v_tuoi := FLOOR(MONTHS_BETWEEN(SYSDATE, :NEW.NGAYSINH) / 12);
        IF v_tuoi < 18 THEN
            RAISE_APPLICATION_ERROR(-20010, 'LỖI: Nhân viên [' || :NEW.HOTEN || '] chưa đủ 18 tuổi!');
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
            RAISE_APPLICATION_ERROR(-20013, 'LỖI: SĐT không hợp lệ (9-11 chữ số)!');
        END IF;
    END IF;
    
    IF DELETING THEN
        BEGIN
            SELECT 1 INTO v_dummy FROM LICH_HEN WHERE MAKH = :OLD.MAKH AND TRANGTHAI = N'Mới' AND ROWNUM = 1;
            RAISE_APPLICATION_ERROR(-20050, 'LỖI: KH đang có lịch hẹn chờ — dùng Soft Delete!');
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
        v_lich_arr.DELETE;
        v_idx := 0;
    END BEFORE STATEMENT;

    BEFORE EACH ROW IS
        v_ca_lam NUMBER;
        v_ton_kh NUMBER;
        v_ton_ns NUMBER;
    BEGIN
        SELECT COUNT(*) INTO v_ton_kh FROM KHACH_HANG WHERE MAKH = :NEW.MAKH AND IS_DELETED = 0;
        IF v_ton_kh = 0 THEN RAISE_APPLICATION_ERROR(-20032, 'LỖI: Khách hàng không tồn tại!'); END IF;

        SELECT COUNT(*) INTO v_ton_ns FROM NHAN_SU WHERE MANS = :NEW.MANS AND IS_DELETED = 0;
        IF v_ton_ns = 0 THEN RAISE_APPLICATION_ERROR(-20033, 'LỖI: Bác sĩ không tồn tại hoặc đã nghỉ!'); END IF;

        SELECT COUNT(*) INTO v_ca_lam FROM LICH_LAM_VIEC
        WHERE MANS = :NEW.MANS AND TRUNC(NGAY_LAM) = TRUNC(:NEW.NGAYHEN) AND IS_NGHI = 0;
        IF v_ca_lam = 0 THEN RAISE_APPLICATION_ERROR(-20030, 'LỖI: Bác sĩ không có lịch làm việc ngày này!'); END IF;

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
        FOR i IN 1 .. v_lich_arr.COUNT LOOP
            SELECT COUNT(*) INTO v_trung
            FROM LICH_HEN
            WHERE MANS      = v_lich_arr(i).mans
              AND GIO_HEN   = v_lich_arr(i).gio_hen
              AND TRANGTHAI != N'Đã hủy'
              AND (v_lich_arr(i).malh IS NULL OR MALH != v_lich_arr(i).malh);
              
            IF v_trung > 0 THEN
                RAISE_APPLICATION_ERROR(-20031, 'LỖI: Bác sĩ đã có lịch slot này!');
            END IF;
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
            RAISE_APPLICATION_ERROR(-20001, 'LỖI: Không tìm thấy chức vụ của nhân viên!');
    END;
    IF v_tencv NOT IN (N'Bác sĩ', N'Kỹ thuật viên mắt kính') THEN
        RAISE_APPLICATION_ERROR(-20001, 'LỖI: Chỉ Bác sĩ/KTV mắt kính được lập Hồ Sơ!');
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

            IF v_tencv NOT IN (N'Thu ngân', N'Quản lý') THEN
                RAISE_APPLICATION_ERROR(-20003, 'LỖI: Nhân viên ['|| :NEW.MANS ||'] không có quyền tạo Hóa Đơn!');
            END IF;
        EXCEPTION
            WHEN NO_DATA_FOUND THEN
                RAISE_APPLICATION_ERROR(-20003, 'LỖI: Không tìm thấy nhân viên hoặc chức vụ!');
        END;
    END IF;

    IF (UPDATING OR DELETING) AND :OLD.TRANGTHAI = N'Đã thanh toán' THEN
        RAISE_APPLICATION_ERROR(-20007, 'LỖI: Hóa đơn đã thanh toán, không can thiệp!');
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
                RAISE_APPLICATION_ERROR(-20033, 'CTHD: Hóa đơn đã đóng (' || v_trangthai || ')!');
            END IF;
        EXCEPTION WHEN NO_DATA_FOUND THEN NULL; 
        END;

        IF INSERTING OR UPDATING THEN
            SELECT SOLUONGTON, NGAYHETHAN INTO v_ton, v_hsd FROM LO_HANG WHERE MALO = :NEW.MALO;
            IF v_hsd < TRUNC(SYSDATE) THEN
                RAISE_APPLICATION_ERROR(-20006, 'CTHD: Lô hàng đã hết hạn!');
            END IF;
            IF :NEW.SOLUONG <= 0 THEN
                RAISE_APPLICATION_ERROR(-20014, 'CTHD: Số lượng phải > 0!');
            END IF;
            IF :NEW.SOLUONG > (CASE WHEN UPDATING THEN v_ton + :OLD.SOLUONG ELSE v_ton END) THEN
                RAISE_APPLICATION_ERROR(-20005, 'CTHD: Không đủ hàng trong kho!');
            END IF;
        END IF;
    END BEFORE EACH ROW;

    AFTER EACH ROW IS
    BEGIN
        IF INSERTING THEN
            UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON - :NEW.SOLUONG WHERE MALO = :NEW.MALO;
            UPDATE HOA_DON  SET TONGTIEN  = NVL(TONGTIEN,0) + (:NEW.SOLUONG * :NEW.DONGIA) WHERE MAHD = :NEW.MAHD;
        ELSIF UPDATING THEN
            UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON + :OLD.SOLUONG - :NEW.SOLUONG WHERE MALO = :NEW.MALO;
            UPDATE HOA_DON  SET TONGTIEN  = NVL(TONGTIEN,0) - (:OLD.SOLUONG * :OLD.DONGIA) + (:NEW.SOLUONG * :NEW.DONGIA) WHERE MAHD = :NEW.MAHD;
        ELSIF DELETING THEN
            UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON + :OLD.SOLUONG WHERE MALO = :OLD.MALO;
            UPDATE HOA_DON  SET TONGTIEN  = NVL(TONGTIEN,0) - (:OLD.SOLUONG * :OLD.DONGIA) WHERE MAHD = :OLD.MAHD;
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

-- 8. Phiếu Nhập
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
            RAISE_APPLICATION_ERROR(-20004, 'LỖI: Không tìm thấy chức vụ của nhân viên!');
    END;
    
    IF v_tencv NOT IN (N'Thủ kho', N'Quản lý') THEN
        RAISE_APPLICATION_ERROR(-20004, 'LỖI: Chỉ Thủ kho/Quản lý lập phiếu nhập!');
    END IF;
    
    IF UPDATING THEN
        SELECT COUNT(*) INTO v_lo_daban FROM LO_HANG WHERE MAPN = :OLD.MAPN AND SOLUONGTON < SOLUONGNHAP;
        IF v_lo_daban > 0 THEN
            RAISE_APPLICATION_ERROR(-20015, 'LỖI: Phiếu đã xuất bán, không thể sửa!');
        END IF;
    END IF;
END;
/

-- 9. Thanh Toán (Compound)
CREATE OR REPLACE TRIGGER TRG_THANH_TOAN
FOR INSERT OR UPDATE ON THANH_TOAN
COMPOUND TRIGGER
    TYPE t_mahd_list IS TABLE OF VARCHAR2(10) INDEX BY PLS_INTEGER;
    v_mahd_arr t_mahd_list;
    v_idx PLS_INTEGER := 0;

    BEFORE STATEMENT IS
    BEGIN
        v_mahd_arr.DELETE;
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
                RAISE_APPLICATION_ERROR(-20018, 'LỖI: Số tiền thanh toán phải > 0!');
            END IF;
        EXCEPTION WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20018, 'LỖI: Không tìm thấy hóa đơn để thanh toán!');
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
        v_tong_hd NUMBER;
        v_da_tt   NUMBER;
        v_makh    VARCHAR2(10);
    BEGIN
        FOR i IN 1 .. v_mahd_arr.COUNT LOOP
            SELECT NVL(SUM(SOTIEN), 0) INTO v_da_tt
            FROM THANH_TOAN WHERE MAHD = v_mahd_arr(i) AND TRANGTHAI = N'Hoàn thành';
            
            SELECT TONGTIEN, MAKH INTO v_tong_hd, v_makh FROM HOA_DON WHERE MAHD = v_mahd_arr(i);
            
            IF v_da_tt >= v_tong_hd THEN
                UPDATE HOA_DON SET TRANGTHAI = N'Đã thanh toán' WHERE MAHD = v_mahd_arr(i);
                
                IF v_makh IS NOT NULL THEN
                    UPDATE KHACH_HANG SET DIEMTICHLUY = DIEMTICHLUY + FLOOR(v_tong_hd / 100000)
                    WHERE MAKH = v_makh;
                END IF;
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
        INSERT INTO AUDIT_HOSO_THILUC(MAAUDIT, MAHOSO, OLD_KETLUAN, NEW_KETLUAN, NGUOI_THUC_HIEN)
        VALUES ('AUD' || LPAD(SEQ_AUDIT.NEXTVAL, 9, '0'), :OLD.MAHOSO, :OLD.KETLUAN, :NEW.KETLUAN, USER);
    END IF;
END;
/

-- 11. Lô Hàng
CREATE OR REPLACE TRIGGER TRG_LO_HANG
FOR INSERT OR UPDATE ON LO_HANG
COMPOUND TRIGGER
    BEFORE EACH ROW IS
    BEGIN
        IF INSERTING THEN :NEW.SOLUONGTON := :NEW.SOLUONGNHAP; END IF;
        IF :NEW.NGAYHETHAN <= TRUNC(SYSDATE) THEN
            RAISE_APPLICATION_ERROR(-20029, 'LỖI: Lô hàng đã hết hạn!');
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
            RAISE_APPLICATION_ERROR(-20025, 'LỖI: Không tìm thấy chức vụ của nhân viên!');
    END;
    
    IF v_tencv NOT IN (N'Bác sĩ', N'Kỹ thuật viên mắt kính') THEN
        RAISE_APPLICATION_ERROR(-20025, 'LỖI: Chỉ Bác sĩ/KTV được Kê Đơn!');
    END IF;
END;
/

-- 13. Hủy Hóa Đơn
CREATE OR REPLACE TRIGGER TRG_HOA_DON_HUY
AFTER UPDATE OF TRANGTHAI ON HOA_DON
FOR EACH ROW
WHEN (NEW.TRANGTHAI = N'Đã hủy' AND OLD.TRANGTHAI != N'Đã hủy')
BEGIN
    FOR rec IN (SELECT MALO, SOLUONG FROM CT_HOA_DON WHERE MAHD = :NEW.MAHD) LOOP
        UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON + rec.SOLUONG WHERE MALO = rec.MALO;
    END LOOP;
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
commit;