-- ============================================================
-- FILE   : V1__Initial_Setup.sql
-- FLYWAY : Version 1 - Initial Schema
-- PROJECT: Hệ Thống Quản Lý Dịch Vụ Thị Lực & Thiết Bị Y Tế
-- STACK  : Oracle SQL + Spring Boot + React.js
-- ------------------------------------------------------------
-- CHANGELOG v2 (fixes):
--   [FIX-1] KHACH_HANG   — thêm dấu phẩy sau DIEMTICHLUY DEFAULT 0
--   [FIX-2] SP_NHAP_KHO  — xóa UPDATE TONGTIEN thủ công (trùng TRG_LO_HANG)
--   [FIX-3] SP_NHAP_KHO  — đổi tên tham số p_ngayhethane → p_ngayhethan
--   [FIX-4] SP_NHAP_KHO  — xóa SOLUONGTON khỏi INSERT (trigger tự set)
--   [FIX-5] TRG_THANH_TOAN — xóa logic tạo PHIEU_XUAT (đã có trong SP)
--   [FIX-6] SP_LUU_HOSO  — thêm tham số p_docong_trai/phai cho DOCONG_ADD
-- ============================================================


-- ============================================================
-- PHẦN I: TẠO BẢNG (DDL)
-- ============================================================

-- =====================================================
-- I.1 QUẢN LÝ QUYỀN TRUY CẬP (RBAC) & NHÂN SỰ
-- =====================================================

CREATE TABLE NHOM (
    MANHOM   VARCHAR2(10)  PRIMARY KEY,
    TENNHOM  NVARCHAR2(100)
);

CREATE TABLE VAITRO (
    MAVAITRO  VARCHAR2(10)  PRIMARY KEY,
    TENVAITRO NVARCHAR2(100)
);

CREATE TABLE NHOM_VAITRO (
    MANHOM   VARCHAR2(10),
    MAVAITRO VARCHAR2(10),
    CONSTRAINT PK_NHOM_VAITRO PRIMARY KEY (MANHOM, MAVAITRO),
    CONSTRAINT FK_NVT_NHOM    FOREIGN KEY (MANHOM)   REFERENCES NHOM(MANHOM),
    CONSTRAINT FK_NVT_VAITRO  FOREIGN KEY (MAVAITRO) REFERENCES VAITRO(MAVAITRO)
);

CREATE TABLE TAI_KHOAN (
    MATK      VARCHAR2(10)  PRIMARY KEY,
    MANHOM    VARCHAR2(10),
    USERNAME  VARCHAR2(50)  UNIQUE,
    PASSWORD  VARCHAR2(255),
    TRANGTHAI NUMBER(1),
    CONSTRAINT FK_TK_NHOM FOREIGN KEY (MANHOM) REFERENCES NHOM(MANHOM)
);

CREATE TABLE CHUC_VU (
    MACV  VARCHAR2(10)  PRIMARY KEY,
    TENCV NVARCHAR2(100)
);

CREATE TABLE NHAN_SU (
    MANS       VARCHAR2(10)  PRIMARY KEY,
    MATK       VARCHAR2(10)  UNIQUE,
    MACV       VARCHAR2(10),
    CCCD       VARCHAR2(12),
    HOTEN      NVARCHAR2(100),
    NGAYSINH   DATE,
    GIOITINH   NVARCHAR2(10),
    SDT        VARCHAR2(15),
    DIACHI     NVARCHAR2(255),
    CHUYENKHOA NVARCHAR2(100) NULL,
    CONSTRAINT FK_NS_TK FOREIGN KEY (MATK) REFERENCES TAI_KHOAN(MATK),
    CONSTRAINT FK_NS_CV FOREIGN KEY (MACV) REFERENCES CHUC_VU(MACV)
);

-- =====================================================
-- I.2 QUẢN LÝ KHÁCH HÀNG & Y KHOA
-- =====================================================

CREATE TABLE KHACH_HANG (
    MAKH        VARCHAR2(10)  PRIMARY KEY,
    MATK        VARCHAR2(10)  UNIQUE NULL,
    CCCD        VARCHAR2(12),
    HOTEN       NVARCHAR2(100),
    NGAYSINH    DATE,
    GIOITINH    NVARCHAR2(10),
    SDT         VARCHAR2(15)  UNIQUE,
    DIACHI      NVARCHAR2(255),
    DIEMTICHLUY NUMBER        DEFAULT 0,     -- [FIX-1] dấu phẩy đã thêm
    CONSTRAINT FK_KH_TK FOREIGN KEY (MATK) REFERENCES TAI_KHOAN(MATK)
);

CREATE TABLE LICH_HEN (
    MALH      VARCHAR2(10)  PRIMARY KEY,
    MAKH      VARCHAR2(10),
    MANS      VARCHAR2(10),
    NGAYHEN   TIMESTAMP,
    TRANGTHAI NVARCHAR2(50),
    CONSTRAINT FK_LH_KH FOREIGN KEY (MAKH) REFERENCES KHACH_HANG(MAKH),
    CONSTRAINT FK_LH_NS FOREIGN KEY (MANS) REFERENCES NHAN_SU(MANS)
);

CREATE TABLE HO_SO_THI_LUC (
    MAHOSO   VARCHAR2(10)  PRIMARY KEY,
    MAKH     VARCHAR2(10),
    MANS     VARCHAR2(10),
    NGAYKHAM TIMESTAMP,
    KETLUAN  NVARCHAR2(255),
    CONSTRAINT FK_HS_KH FOREIGN KEY (MAKH) REFERENCES KHACH_HANG(MAKH),
    CONSTRAINT FK_HS_NS FOREIGN KEY (MANS) REFERENCES NHAN_SU(MANS)
);

CREATE TABLE CHI_TIET_THI_LUC (
    MAHOSO        VARCHAR2(10),
    MAT           CHAR(1),
    DOCAU_SPH     NUMBER(4,2),
    DOTRU_CYL     NUMBER(4,2),
    TRUC_AX       NUMBER(3),
    KHOANGCACH_PD NUMBER(3,1),
    DOCONG_ADD    NUMBER(4,2),               -- Độ cộng lão thị, NULL nếu không cần
    CONSTRAINT PK_CTTTL    PRIMARY KEY (MAHOSO, MAT),
    CONSTRAINT FK_CTTTL_HS FOREIGN KEY (MAHOSO) REFERENCES HO_SO_THI_LUC(MAHOSO)
);

CREATE TABLE DON_THUOC (
    MADONTHUOC VARCHAR2(10)  PRIMARY KEY,
    MAHOSO     VARCHAR2(10),
    MANS       VARCHAR2(10),
    NGAYKEDON  DATE,
    LOIDAN     NVARCHAR2(255),
    CONSTRAINT FK_DT_HS FOREIGN KEY (MAHOSO) REFERENCES HO_SO_THI_LUC(MAHOSO),
    CONSTRAINT FK_DT_NS FOREIGN KEY (MANS)   REFERENCES NHAN_SU(MANS)
);

CREATE TABLE AUDIT_HOSO_THILUC (
    MAAUDIT         VARCHAR2(20)  PRIMARY KEY,
    MAHOSO          VARCHAR2(10),
    OLD_KETLUAN     NVARCHAR2(255),
    NEW_KETLUAN     NVARCHAR2(255),
    THOI_GIAN       TIMESTAMP     DEFAULT SYSTIMESTAMP,
    NGUOI_THUC_HIEN VARCHAR2(50)
);

-- =====================================================
-- I.3 QUẢN LÝ SẢN PHẨM & KÊ ĐƠN
-- =====================================================

CREATE TABLE LOAI_SAN_PHAM (
    MALOAI  VARCHAR2(10)  PRIMARY KEY,
    TENLOAI NVARCHAR2(100)
);

CREATE TABLE SAN_PHAM (
    MASP      VARCHAR2(10)  PRIMARY KEY,
    MALOAI    VARCHAR2(10),
    TENSP     NVARCHAR2(100),
    DONVITINH NVARCHAR2(20),
    LATHUOC   NUMBER(1),
    GIABAN    NUMBER(15,2),
    CONSTRAINT FK_SP_LOAI FOREIGN KEY (MALOAI) REFERENCES LOAI_SAN_PHAM(MALOAI)
);

CREATE TABLE PHIEU_KE_DON (
    MADON     VARCHAR2(10)  PRIMARY KEY,
    MAHOSO    VARCHAR2(10),
    MANS      VARCHAR2(10),
    NGAYKEDON DATE,
    LOIDAN    NVARCHAR2(255),
    CONSTRAINT FK_PKD_HS FOREIGN KEY (MAHOSO) REFERENCES HO_SO_THI_LUC(MAHOSO),
    CONSTRAINT FK_PKD_NS FOREIGN KEY (MANS)   REFERENCES NHAN_SU(MANS)
);

CREATE TABLE CT_KE_DON (
    MADON    VARCHAR2(10),
    MASP     VARCHAR2(10),
    SOLUONG  NUMBER,
    LIEUDUNG NVARCHAR2(100) NULL,
    CACHDUNG NVARCHAR2(100) NULL,
    CONSTRAINT PK_CTKD     PRIMARY KEY (MADON, MASP),
    CONSTRAINT FK_CTKD_PKD FOREIGN KEY (MADON) REFERENCES PHIEU_KE_DON(MADON),
    CONSTRAINT FK_CTKD_SP  FOREIGN KEY (MASP)  REFERENCES SAN_PHAM(MASP)
);

-- =====================================================
-- I.4 QUẢN LÝ NHẬP KHO & LÔ HÀNG
-- =====================================================

CREATE TABLE NHA_CUNG_CAP (
    MANCC  VARCHAR2(10)  PRIMARY KEY,
    TENNCC NVARCHAR2(100),
    SDT    VARCHAR2(15),
    DIACHI NVARCHAR2(255)
);

CREATE TABLE PHIEU_NHAP (
    MAPN     VARCHAR2(10)  PRIMARY KEY,
    MANCC    VARCHAR2(10),
    MANS     VARCHAR2(10),
    NGAYNHAP TIMESTAMP,
    TONGTIEN NUMBER(15,2),
    CONSTRAINT FK_PN_NCC FOREIGN KEY (MANCC) REFERENCES NHA_CUNG_CAP(MANCC),
    CONSTRAINT FK_PN_NS  FOREIGN KEY (MANS)  REFERENCES NHAN_SU(MANS)
);

CREATE TABLE LO_HANG (
    MALO        VARCHAR2(10)  PRIMARY KEY,
    MASP        VARCHAR2(10),
    MAPN        VARCHAR2(10),
    NGAYSANXUAT DATE,
    NGAYHETHAN  DATE,
    SOLUONGNHAP NUMBER,
    SOLUONGTON  NUMBER,
    GIANHAP     NUMBER(15,2),
    CONSTRAINT FK_LO_SP FOREIGN KEY (MASP) REFERENCES SAN_PHAM(MASP),
    CONSTRAINT FK_LO_PN FOREIGN KEY (MAPN) REFERENCES PHIEU_NHAP(MAPN)
);

-- =====================================================
-- I.5 QUẢN LÝ BÁN HÀNG & XUẤT KHO
-- =====================================================

CREATE TABLE HOA_DON (
    MAHD       VARCHAR2(10)  PRIMARY KEY,
    MAKH       VARCHAR2(10),
    MANS       VARCHAR2(10),
    MAHOSO     VARCHAR2(10)  NULL,
    MADONTHUOC VARCHAR2(10)  NULL,
    NGAYLAP    TIMESTAMP,
    TONGTIEN   NUMBER(15,2),
    TRANGTHAI  NVARCHAR2(50),
    CONSTRAINT FK_HD_KH FOREIGN KEY (MAKH)       REFERENCES KHACH_HANG(MAKH),
    CONSTRAINT FK_HD_NS FOREIGN KEY (MANS)       REFERENCES NHAN_SU(MANS),
    CONSTRAINT FK_HD_HS FOREIGN KEY (MAHOSO)     REFERENCES HO_SO_THI_LUC(MAHOSO),
    CONSTRAINT FK_HD_DT FOREIGN KEY (MADONTHUOC) REFERENCES DON_THUOC(MADONTHUOC)
);

CREATE TABLE CT_HOA_DON (
    MAHD    VARCHAR2(10),
    MALO    VARCHAR2(10),
    SOLUONG NUMBER,
    DONGIA  NUMBER(15,2),
    CONSTRAINT PK_CTHD    PRIMARY KEY (MAHD, MALO),
    CONSTRAINT FK_CTHD_HD FOREIGN KEY (MAHD) REFERENCES HOA_DON(MAHD),
    CONSTRAINT FK_CTHD_LO FOREIGN KEY (MALO) REFERENCES LO_HANG(MALO)
);

CREATE TABLE THANH_TOAN (
    MATT          VARCHAR2(10)  PRIMARY KEY,
    MAHD          VARCHAR2(10),
    NGAYTHANHTOAN TIMESTAMP,
    SOTIEN        NUMBER(15,2),
    PHUONGTHUC    NVARCHAR2(50),
    TRANGTHAI     NVARCHAR2(50),
    CONSTRAINT FK_TT_HD FOREIGN KEY (MAHD) REFERENCES HOA_DON(MAHD)
);

CREATE TABLE PHIEU_XUAT (
    MAPX     VARCHAR2(10)  PRIMARY KEY,
    MAHD     VARCHAR2(10),
    MANS     VARCHAR2(10),
    NGAYXUAT TIMESTAMP,
    CONSTRAINT FK_PX_HD FOREIGN KEY (MAHD) REFERENCES HOA_DON(MAHD),
    CONSTRAINT FK_PX_NS FOREIGN KEY (MANS) REFERENCES NHAN_SU(MANS)
);

CREATE TABLE CT_PHIEU_XUAT (
    MAPX        VARCHAR2(10),
    MALO        VARCHAR2(10),
    SOLUONGXUAT NUMBER,
    CONSTRAINT PK_CTPX    PRIMARY KEY (MAPX, MALO),
    CONSTRAINT FK_CTPX_PX FOREIGN KEY (MAPX) REFERENCES PHIEU_XUAT(MAPX),
    CONSTRAINT FK_CTPX_LO FOREIGN KEY (MALO) REFERENCES LO_HANG(MALO)
);


-- ============================================================
-- PHẦN II: TRIGGERS
-- ============================================================

-- TRIGGER 1: Nhân Sự
CREATE OR REPLACE TRIGGER TRG_VALIDATE_NHAN_SU
BEFORE INSERT OR UPDATE ON NHAN_SU
FOR EACH ROW
DECLARE
    v_tuoi  NUMBER;
    v_count NUMBER;
BEGIN
    v_tuoi := MONTHS_BETWEEN(SYSDATE, :NEW.NGAYSINH) / 12;
    IF v_tuoi < 18 THEN
        RAISE_APPLICATION_ERROR(-20010,
            'LỖI: Nhân viên [' || :NEW.HOTEN || '] chưa đủ 18 tuổi!');
    END IF;

    IF INSERTING THEN
        SELECT COUNT(*) INTO v_count FROM NHAN_SU WHERE MATK = :NEW.MATK;
        IF v_count > 0 THEN
            RAISE_APPLICATION_ERROR(-20009,
                'LỖI: Tài khoản này đã được gán cho người khác!');
        END IF;
    END IF;
END;
/

-- TRIGGER 2: Khách Hàng
CREATE OR REPLACE TRIGGER TRG_VALIDATE_KHACH_HANG
BEFORE INSERT OR UPDATE OR DELETE ON KHACH_HANG
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    IF INSERTING OR UPDATING THEN
        IF NOT REGEXP_LIKE(:NEW.SDT, '^[0-9]{9,11}$') THEN
            RAISE_APPLICATION_ERROR(-20013, 'LỖI: Số điện thoại không hợp lệ!');
        END IF;
    END IF;

    IF DELETING THEN
        SELECT COUNT(*) INTO v_count
        FROM   LICH_HEN
        WHERE  MAKH = :OLD.MAKH AND TRANGTHAI = N'Mới';
        IF v_count > 0 THEN
            RAISE_APPLICATION_ERROR(-20011,
                'LỖI: Không thể xóa khách hàng đang có lịch hẹn chờ!');
        END IF;
    END IF;
END;
/

-- TRIGGER 3: Hồ Sơ Thị Lực
CREATE OR REPLACE TRIGGER TRG_VALIDATE_HO_SO
BEFORE INSERT OR UPDATE ON HO_SO_THI_LUC
FOR EACH ROW
DECLARE
    v_tencv CHUC_VU.TENCV%TYPE;
BEGIN
    SELECT cv.TENCV INTO v_tencv
    FROM   NHAN_SU ns JOIN CHUC_VU cv ON ns.MACV = cv.MACV
    WHERE  ns.MANS = :NEW.MANS;

    IF v_tencv != N'Bác sĩ' THEN
        RAISE_APPLICATION_ERROR(-20001,
            'LỖI: Chỉ nhân sự có chức vụ "Bác sĩ" mới được lập Hồ Sơ Khám!');
    END IF;
END;
/

-- TRIGGER 4: Hóa Đơn
CREATE OR REPLACE TRIGGER TRG_VALIDATE_HOA_DON
BEFORE INSERT OR UPDATE OR DELETE ON HOA_DON
FOR EACH ROW
DECLARE
    v_tencv CHUC_VU.TENCV%TYPE;
BEGIN
    IF INSERTING OR UPDATING THEN
        SELECT cv.TENCV INTO v_tencv
        FROM   NHAN_SU ns JOIN CHUC_VU cv ON ns.MACV = cv.MACV
        WHERE  ns.MANS = :NEW.MANS;

        IF v_tencv NOT IN (N'Thu ngân', N'Quản lý') THEN
            RAISE_APPLICATION_ERROR(-20003,
                'LỖI: Chỉ Thu ngân hoặc Quản lý mới được tạo Hóa Đơn!');
        END IF;
    END IF;

    IF UPDATING OR DELETING THEN
        IF :OLD.TRANGTHAI = N'Đã thanh toán' THEN
            RAISE_APPLICATION_ERROR(-20007,
                'LỖI: Hóa đơn đã thanh toán, không thể can thiệp!');
        END IF;
    END IF;
END;
/

-- TRIGGER 5: Chi Tiết Hóa Đơn
CREATE OR REPLACE TRIGGER TRG_CT_HOA_DON
FOR INSERT OR UPDATE OR DELETE ON CT_HOA_DON
COMPOUND TRIGGER

    v_ton LO_HANG.SOLUONGTON%TYPE;
    v_hsd LO_HANG.NGAYHETHAN%TYPE;

    BEFORE EACH ROW IS
    BEGIN
        FOR rec IN (SELECT TRANGTHAI FROM HOA_DON
                    WHERE MAHD = NVL(:NEW.MAHD, :OLD.MAHD)) LOOP
            IF rec.TRANGTHAI IN (N'Đã thanh toán', N'Đã hủy') THEN
                RAISE_APPLICATION_ERROR(-20033,
                    'CTHD: Hóa đơn đã đóng, không thể thay đổi!');
            END IF;
        END LOOP;

        IF INSERTING OR UPDATING THEN
            SELECT SOLUONGTON, NGAYHETHAN
            INTO   v_ton, v_hsd
            FROM   LO_HANG WHERE MALO = :NEW.MALO;

            IF v_hsd < SYSDATE THEN
                RAISE_APPLICATION_ERROR(-20006, 'CTHD: Lô hàng đã hết hạn sử dụng!');
            END IF;

            IF :NEW.SOLUONG <= 0 THEN
                RAISE_APPLICATION_ERROR(-20014, 'CTHD: Số lượng phải lớn hơn 0.');
            END IF;

            IF :NEW.SOLUONG > (CASE WHEN UPDATING
                                    THEN v_ton + :OLD.SOLUONG
                                    ELSE v_ton END) THEN
                RAISE_APPLICATION_ERROR(-20005, 'CTHD: Không đủ hàng trong kho!');
            END IF;
        END IF;
    END BEFORE EACH ROW;

    AFTER EACH ROW IS
    BEGIN
        IF INSERTING THEN
            UPDATE LO_HANG
            SET    SOLUONGTON = SOLUONGTON - :NEW.SOLUONG
            WHERE  MALO = :NEW.MALO;
            UPDATE HOA_DON
            SET    TONGTIEN = NVL(TONGTIEN, 0) + (:NEW.SOLUONG * :NEW.DONGIA)
            WHERE  MAHD = :NEW.MAHD;
        ELSIF UPDATING THEN
            UPDATE LO_HANG
            SET    SOLUONGTON = SOLUONGTON + :OLD.SOLUONG - :NEW.SOLUONG
            WHERE  MALO = :NEW.MALO;
            UPDATE HOA_DON
            SET    TONGTIEN = NVL(TONGTIEN, 0)
                              - (:OLD.SOLUONG * :OLD.DONGIA)
                              + (:NEW.SOLUONG * :NEW.DONGIA)
            WHERE  MAHD = :NEW.MAHD;
        ELSIF DELETING THEN
            UPDATE LO_HANG
            SET    SOLUONGTON = SOLUONGTON + :OLD.SOLUONG
            WHERE  MALO = :OLD.MALO;
            UPDATE HOA_DON
            SET    TONGTIEN = NVL(TONGTIEN, 0) - (:OLD.SOLUONG * :OLD.DONGIA)
            WHERE  MAHD = :OLD.MAHD;
        END IF;
    END AFTER EACH ROW;

END TRG_CT_HOA_DON;
/

-- TRIGGER 6: Phiếu Nhập
CREATE OR REPLACE TRIGGER TRG_PHIEU_NHAP
BEFORE INSERT OR UPDATE ON PHIEU_NHAP
FOR EACH ROW
DECLARE
    v_tencv    CHUC_VU.TENCV%TYPE;
    v_lo_daban NUMBER;
BEGIN
    SELECT cv.TENCV INTO v_tencv
    FROM   NHAN_SU ns JOIN CHUC_VU cv ON ns.MACV = cv.MACV
    WHERE  ns.MANS = :NEW.MANS;

    IF v_tencv NOT IN (N'Thủ kho', N'Quản lý') THEN
        RAISE_APPLICATION_ERROR(-20004,
            'PN: Chỉ Thủ kho hoặc Quản lý mới được lập phiếu nhập.');
    END IF;

    IF UPDATING THEN
        SELECT COUNT(*) INTO v_lo_daban
        FROM   LO_HANG
        WHERE  MAPN = :OLD.MAPN AND SOLUONGTON < SOLUONGNHAP;
        IF v_lo_daban > 0 THEN
            RAISE_APPLICATION_ERROR(-20015,
                'PN: Phiếu nhập đã có lô hàng được bán, không thể sửa.');
        END IF;
    END IF;
END;
/

-- TRIGGER 7: Thanh Toán
-- [FIX-5] Xóa toàn bộ logic tạo PHIEU_XUAT — SP_CHOT_THANH_TOAN xử lý việc đó
--         Trigger chỉ: validate → chốt HOA_DON → tích điểm loyalty
CREATE OR REPLACE TRIGGER TRG_THANH_TOAN
FOR INSERT OR UPDATE ON THANH_TOAN
COMPOUND TRIGGER

    v_tong_hd   NUMBER;
    v_trang_thai HOA_DON.TRANGTHAI%TYPE;
    v_makh      VARCHAR2(10);
    v_da_tt     NUMBER;

    BEFORE EACH ROW IS
    BEGIN
        SELECT TONGTIEN, TRANGTHAI, MAKH
        INTO   v_tong_hd, v_trang_thai, v_makh
        FROM   HOA_DON WHERE MAHD = :NEW.MAHD;

        IF v_trang_thai != N'Chưa thanh toán' THEN
            RAISE_APPLICATION_ERROR(-20016,
                'TT: Hóa đơn không ở trạng thái "Chưa thanh toán".');
        END IF;

        IF :NEW.SOTIEN <= 0 OR :NEW.SOTIEN > v_tong_hd THEN
            RAISE_APPLICATION_ERROR(-20018,
                'TT: Số tiền thanh toán không hợp lệ.');
        END IF;
    END BEFORE EACH ROW;

    -- AFTER STATEMENT tránh mutating table khi SELECT SUM trên THANH_TOAN
    AFTER STATEMENT IS
    BEGIN
        FOR rec IN (
            SELECT MAHD FROM THANH_TOAN
            WHERE  TRANGTHAI = N'Thành công'
            GROUP  BY MAHD
        ) LOOP
            SELECT NVL(SUM(SOTIEN), 0)
            INTO   v_da_tt
            FROM   THANH_TOAN
            WHERE  MAHD = rec.MAHD AND TRANGTHAI = N'Thành công';

            SELECT TONGTIEN, MAKH
            INTO   v_tong_hd, v_makh
            FROM   HOA_DON WHERE MAHD = rec.MAHD;

            IF v_da_tt >= v_tong_hd THEN
                -- Chốt hóa đơn
                UPDATE HOA_DON
                SET    TRANGTHAI = N'Đã thanh toán'
                WHERE  MAHD = rec.MAHD;

                -- Tích điểm loyalty (1 điểm / 100,000 VNĐ)
                UPDATE KHACH_HANG
                SET    DIEMTICHLUY = NVL(DIEMTICHLUY, 0) + FLOOR(v_tong_hd / 100000)
                WHERE  MAKH = v_makh;

                -- PHIEU_XUAT tạo bởi SP_CHOT_THANH_TOAN_HOA_DON — không tạo ở đây
            END IF;
        END LOOP;
    END AFTER STATEMENT;

END TRG_THANH_TOAN;
/

-- TRIGGER 8: Audit Kết Luận
CREATE OR REPLACE TRIGGER TRG_AUDIT_HO_SO
AFTER UPDATE OF KETLUAN ON HO_SO_THI_LUC
FOR EACH ROW
BEGIN
    IF NVL(:OLD.KETLUAN, '~~NULL~~') != NVL(:NEW.KETLUAN, '~~NULL~~') THEN
        INSERT INTO AUDIT_HOSO_THILUC
               (MAAUDIT, MAHOSO, OLD_KETLUAN, NEW_KETLUAN, NGUOI_THUC_HIEN)
        VALUES ('AUD_' || TO_CHAR(SYSTIMESTAMP, 'MMDDHH24MISSFF3'),
                :OLD.MAHOSO, :OLD.KETLUAN, :NEW.KETLUAN, USER);
    END IF;
END;
/

-- TRIGGER 9: Lô Hàng
-- [FIX-4] Trigger này set SOLUONGTON — SP không cần truyền SOLUONGTON nữa
CREATE OR REPLACE TRIGGER TRG_LO_HANG
FOR INSERT OR UPDATE ON LO_HANG
COMPOUND TRIGGER

    BEFORE EACH ROW IS
    BEGIN
        IF INSERTING THEN
            :NEW.SOLUONGTON := :NEW.SOLUONGNHAP;  -- [FIX-4] trigger tự set
        END IF;

        IF :NEW.NGAYHETHAN <= SYSDATE THEN
            RAISE_APPLICATION_ERROR(-20029,
                'LH: Không được nhập lô hàng đã hết hạn!');
        END IF;
    END BEFORE EACH ROW;

    AFTER EACH ROW IS
    BEGIN
        -- [FIX-2] Chỉ trigger cộng TONGTIEN — SP không làm nữa để tránh cộng đôi
        IF INSERTING THEN
            UPDATE PHIEU_NHAP
            SET    TONGTIEN = NVL(TONGTIEN, 0) + (:NEW.SOLUONGNHAP * :NEW.GIANHAP)
            WHERE  MAPN = :NEW.MAPN;
        ELSIF UPDATING THEN
            UPDATE PHIEU_NHAP
            SET    TONGTIEN = NVL(TONGTIEN, 0)
                              - (:OLD.SOLUONGNHAP * :OLD.GIANHAP)
                              + (:NEW.SOLUONGNHAP * :NEW.GIANHAP)
            WHERE  MAPN = :NEW.MAPN;
        END IF;
    END AFTER EACH ROW;

END TRG_LO_HANG;
/

-- TRIGGER 10: Phân quyền Kê Đơn
CREATE OR REPLACE TRIGGER TRG_VALIDATE_KE_DON
BEFORE INSERT OR UPDATE ON PHIEU_KE_DON
FOR EACH ROW
DECLARE
    v_tencv CHUC_VU.TENCV%TYPE;
BEGIN
    SELECT cv.TENCV INTO v_tencv
    FROM   NHAN_SU ns JOIN CHUC_VU cv ON ns.MACV = cv.MACV
    WHERE  ns.MANS = :NEW.MANS;

    IF v_tencv != N'Bác sĩ' THEN
        RAISE_APPLICATION_ERROR(-20025,
            'LỖI: Chỉ nhân sự có chức vụ "Bác sĩ" mới được quyền Kê Đơn Thuốc!');
    END IF;
END;
/


-- ============================================================
-- PHẦN III: STORED PROCEDURES
-- ============================================================

-- SP 1: Lưu Hồ Sơ Khám Bệnh
-- [FIX-6] Thêm p_docong_trai / p_docong_phai (DEFAULT NULL cho bệnh nhân thường)
CREATE OR REPLACE PROCEDURE SP_LUU_HOSO_KHAM_BENH (
    p_mahoso       IN  VARCHAR2,
    p_makh         IN  VARCHAR2,
    p_mans         IN  VARCHAR2,
    p_ketluan      IN  NVARCHAR2,
    p_mat_trai_sph IN  NUMBER,
    p_mat_trai_cyl IN  NUMBER,
    p_mat_trai_ax  IN  NUMBER,
    p_docong_trai  IN  NUMBER DEFAULT NULL,   -- [FIX-6] độ cộng mắt Trái (lão thị)
    p_mat_phai_sph IN  NUMBER,
    p_mat_phai_cyl IN  NUMBER,
    p_mat_phai_ax  IN  NUMBER,
    p_docong_phai  IN  NUMBER DEFAULT NULL,   -- [FIX-6] độ cộng mắt Phải (lão thị)
    p_pd           IN  NUMBER,
    p_madon_out    OUT VARCHAR2
) AS
    v_madon VARCHAR2(20);
BEGIN
    INSERT INTO HO_SO_THI_LUC (MAHOSO, MAKH, MANS, NGAYKHAM, KETLUAN)
    VALUES (p_mahoso, p_makh, p_mans, SYSTIMESTAMP, p_ketluan);

    -- [FIX-6] Truyền DOCONG_ADD vào chi tiết từng mắt
    INSERT INTO CHI_TIET_THI_LUC
           (MAHOSO, MAT, DOCAU_SPH, DOTRU_CYL, TRUC_AX, KHOANGCACH_PD, DOCONG_ADD)
    VALUES (p_mahoso, 'T',
            p_mat_trai_sph, p_mat_trai_cyl, p_mat_trai_ax, p_pd, p_docong_trai);

    INSERT INTO CHI_TIET_THI_LUC
           (MAHOSO, MAT, DOCAU_SPH, DOTRU_CYL, TRUC_AX, KHOANGCACH_PD, DOCONG_ADD)
    VALUES (p_mahoso, 'P',
            p_mat_phai_sph, p_mat_phai_cyl, p_mat_phai_ax, p_pd, p_docong_phai);

    v_madon := 'KD_' || p_mahoso;
    INSERT INTO PHIEU_KE_DON (MADON, MAHOSO, MANS, NGAYKEDON)
    VALUES (v_madon, p_mahoso, p_mans, SYSDATE);

    p_madon_out := v_madon;
    COMMIT;
EXCEPTION
    WHEN OTHERS THEN ROLLBACK; RAISE;
END SP_LUU_HOSO_KHAM_BENH;
/

-- SP 2: Chốt Thanh Toán & Xuất Kho
-- Đơn giản hóa: bỏ tham số p_mans_xuat — lấy MANS trực tiếp từ HOA_DON
CREATE OR REPLACE PROCEDURE SP_CHOT_THANH_TOAN_HOA_DON (
    p_mahd       IN VARCHAR2,
    p_matt       IN VARCHAR2,
    p_phuongthuc IN NVARCHAR2
) AS
    v_tongtien NUMBER;
    v_mans     VARCHAR2(10);
    v_mapx     VARCHAR2(20);
BEGIN
    SELECT TONGTIEN, MANS INTO v_tongtien, v_mans
    FROM   HOA_DON WHERE MAHD = p_mahd;

    -- INSERT THANH_TOAN → TRG_THANH_TOAN tự chốt HOA_DON + tích điểm
    INSERT INTO THANH_TOAN (MATT, MAHD, NGAYTHANHTOAN, SOTIEN, PHUONGTHUC, TRANGTHAI)
    VALUES (p_matt, p_mahd, SYSTIMESTAMP, v_tongtien, p_phuongthuc, N'Thành công');

    -- Tạo Phiếu Xuất (chỉ SP làm, trigger không làm nữa — [FIX-5])
    v_mapx := 'PX_' || p_mahd;
    INSERT INTO PHIEU_XUAT (MAPX, MAHD, MANS, NGAYXUAT)
    VALUES (v_mapx, p_mahd, v_mans, SYSTIMESTAMP);

    INSERT INTO CT_PHIEU_XUAT (MAPX, MALO, SOLUONGXUAT)
    SELECT v_mapx, MALO, SOLUONG FROM CT_HOA_DON WHERE MAHD = p_mahd;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN ROLLBACK; RAISE;
END SP_CHOT_THANH_TOAN_HOA_DON;
/

-- SP 3: Nhập Kho Lô Hàng
-- [FIX-2] Xóa UPDATE PHIEU_NHAP.TONGTIEN thủ công (TRG_LO_HANG đã làm)
-- [FIX-3] Đổi tên p_ngayhethane → p_ngayhethan
-- [FIX-4] Xóa SOLUONGTON khỏi INSERT LO_HANG (TRG_LO_HANG BEFORE tự set)
CREATE OR REPLACE PROCEDURE SP_NHAP_KHO_LO_HANG (
    p_mapn         IN  VARCHAR2,
    p_mancc        IN  VARCHAR2,
    p_mans         IN  VARCHAR2,
    p_malo         IN  VARCHAR2,
    p_masp         IN  VARCHAR2,
    p_ngaysx       IN  DATE,
    p_ngayhethan   IN  DATE,         -- [FIX-3] đổi từ p_ngayhethane
    p_soluongnhap  IN  NUMBER,
    p_gianhap      IN  NUMBER,
    p_tongtien_out OUT NUMBER
) AS
    v_existing NUMBER;
    v_tongtien NUMBER;
BEGIN
    -- Tạo Phiếu Nhập nếu chưa có (idempotent)
    SELECT COUNT(*) INTO v_existing FROM PHIEU_NHAP WHERE MAPN = p_mapn;
    IF v_existing = 0 THEN
        INSERT INTO PHIEU_NHAP (MAPN, MANCC, MANS, NGAYNHAP, TONGTIEN)
        VALUES (p_mapn, p_mancc, p_mans, SYSTIMESTAMP, 0);
    END IF;

    -- Validate hạn sử dụng
    IF p_ngayhethan <= p_ngaysx THEN
        RAISE_APPLICATION_ERROR(-20020, 'LỖI: Ngày hết hạn phải sau ngày sản xuất!');
    END IF;
    IF p_ngayhethan <= SYSDATE THEN
        RAISE_APPLICATION_ERROR(-20021, 'LỖI: Không thể nhập lô hàng đã hết hạn!');
    END IF;

    -- [FIX-4] Không truyền SOLUONGTON — TRG_LO_HANG BEFORE EACH ROW tự set
    -- [FIX-2] Không UPDATE PHIEU_NHAP — TRG_LO_HANG AFTER EACH ROW tự cộng
    INSERT INTO LO_HANG (MALO, MASP, MAPN, NGAYSANXUAT, NGAYHETHAN, SOLUONGNHAP, GIANHAP)
    VALUES (p_malo, p_masp, p_mapn, p_ngaysx, p_ngayhethan, p_soluongnhap, p_gianhap);

    SELECT TONGTIEN INTO v_tongtien FROM PHIEU_NHAP WHERE MAPN = p_mapn;
    p_tongtien_out := v_tongtien;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN ROLLBACK; RAISE;
END SP_NHAP_KHO_LO_HANG;
/

-- SP 4: Cảnh Báo Hàng Sắp Hết Hạn
CREATE OR REPLACE PROCEDURE SP_CANH_BAO_HANG_HET_HAN (
    p_so_ngay IN  NUMBER,
    c_result  OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN c_result FOR
        SELECT l.MALO                                AS MA_LO,
               s.MASP                                AS MA_SP,
               s.TENSP                               AS TEN_SAN_PHAM,
               s.DONVITINH                           AS DON_VI,
               l.NGAYHETHAN                          AS NGAY_HET_HAN,
               ROUND(l.NGAYHETHAN - SYSDATE)         AS SO_NGAY_CON_LAI,
               l.SOLUONGTON                          AS TON_KHO,
               CASE
                   WHEN ROUND(l.NGAYHETHAN - SYSDATE) <=  7 THEN N'Nguy hiểm'
                   WHEN ROUND(l.NGAYHETHAN - SYSDATE) <= 30 THEN N'Cảnh báo'
                   ELSE N'Chú ý'
               END                                   AS MUC_DO_CANH_BAO,
               ncc.TENNCC                            AS NHA_CUNG_CAP
        FROM   LO_HANG       l
        JOIN   SAN_PHAM      s   ON l.MASP  = s.MASP
        JOIN   PHIEU_NHAP    pn  ON l.MAPN  = pn.MAPN
        JOIN   NHA_CUNG_CAP  ncc ON pn.MANCC = ncc.MANCC
        WHERE  l.SOLUONGTON > 0
          AND  l.NGAYHETHAN > SYSDATE
          AND  (l.NGAYHETHAN - SYSDATE) <= p_so_ngay
        ORDER  BY l.NGAYHETHAN ASC;
END SP_CANH_BAO_HANG_HET_HAN;
/

-- SP 5: Thống Kê Doanh Thu Theo Tháng
CREATE OR REPLACE PROCEDURE SP_THONG_KE_DOANH_THU_THANG (
    p_thang IN  NUMBER,
    p_nam   IN  NUMBER,
    c_data  OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN c_data FOR
        SELECT TO_CHAR(NGAYTHANHTOAN, 'DD/MM/YYYY') AS NGAY,
               COUNT(MATT)                          AS SO_LUONG_DON,
               SUM(SOTIEN)                          AS DOANH_THU_NGAY
        FROM   THANH_TOAN
        WHERE  TRANGTHAI = N'Thành công'
          AND  EXTRACT(MONTH FROM NGAYTHANHTOAN) = p_thang
          AND  EXTRACT(YEAR  FROM NGAYTHANHTOAN) = p_nam
        GROUP  BY TO_CHAR(NGAYTHANHTOAN, 'DD/MM/YYYY')
        ORDER  BY NGAY ASC;
END SP_THONG_KE_DOANH_THU_THANG;
/


-- ============================================================
-- PHẦN IV: SEQUENCES
-- ============================================================

CREATE SEQUENCE SEQ_HOA_DON    START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE SEQ_LO_HANG    START WITH 1 INCREMENT BY 1 CACHE 20 NOCYCLE;
CREATE SEQUENCE SEQ_PHIEU_NHAP START WITH 1 INCREMENT BY 1 CACHE 10 NOCYCLE;
CREATE SEQUENCE SEQ_PHIEU_XUAT START WITH 1 INCREMENT BY 1 CACHE 10 NOCYCLE;
CREATE SEQUENCE SEQ_THANH_TOAN START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
CREATE SEQUENCE SEQ_LICH_HEN   START WITH 1 INCREMENT BY 1 CACHE 10 NOCYCLE;
CREATE SEQUENCE SEQ_AUDIT      START WITH 1 INCREMENT BY 1 CACHE 50 NOCYCLE;


-- ============================================================
-- PHẦN V: INDEXES
-- ============================================================

CREATE INDEX IDX_CTHD_MAHD  ON CT_HOA_DON (MAHD);
CREATE INDEX IDX_CTHD_MALO  ON CT_HOA_DON (MALO);
CREATE INDEX IDX_LO_MASP    ON LO_HANG (MASP);
CREATE INDEX IDX_LO_MAPN    ON LO_HANG (MAPN);
CREATE INDEX IDX_LO_HSD     ON LO_HANG (NGAYHETHAN);
CREATE INDEX IDX_LO_TON     ON LO_HANG (SOLUONGTON);
CREATE INDEX IDX_HD_MAKH    ON HOA_DON (MAKH);
CREATE INDEX IDX_HD_MANS    ON HOA_DON (MANS);
CREATE INDEX IDX_HD_TRANG   ON HOA_DON (TRANGTHAI);
CREATE INDEX IDX_HD_NGAY    ON HOA_DON (NGAYLAP);
CREATE INDEX IDX_TT_MAHD    ON THANH_TOAN (MAHD);
CREATE INDEX IDX_TT_NGAY    ON THANH_TOAN (NGAYTHANHTOAN);
CREATE INDEX IDX_TT_TRANG   ON THANH_TOAN (TRANGTHAI);
CREATE INDEX IDX_TT_THONGKE ON THANH_TOAN (TRANGTHAI, NGAYTHANHTOAN, SOTIEN);
CREATE INDEX IDX_HS_MAKH    ON HO_SO_THI_LUC (MAKH);
CREATE INDEX IDX_HS_MANS    ON HO_SO_THI_LUC (MANS);
CREATE INDEX IDX_HS_NGAY    ON HO_SO_THI_LUC (NGAYKHAM);
CREATE INDEX IDX_LH_MAKH    ON LICH_HEN (MAKH);
CREATE INDEX IDX_LH_TRANG   ON LICH_HEN (TRANGTHAI);
CREATE INDEX IDX_LH_NGAY    ON LICH_HEN (NGAYHEN);
CREATE INDEX IDX_CTKD_MADON ON CT_KE_DON (MADON);
CREATE INDEX IDX_CTKD_MASP  ON CT_KE_DON (MASP);
CREATE INDEX IDX_PN_MANCC   ON PHIEU_NHAP (MANCC);
CREATE INDEX IDX_PN_MANS    ON PHIEU_NHAP (MANS);
CREATE INDEX IDX_PX_MAHD    ON PHIEU_XUAT (MAHD);
CREATE INDEX IDX_NS_MACV    ON NHAN_SU (MACV);
CREATE INDEX IDX_NS_MATK    ON NHAN_SU (MATK);


-- ============================================================
-- END OF V1__Initial_Setup.sql
-- ============================================================