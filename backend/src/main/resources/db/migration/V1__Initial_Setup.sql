-- ============================================================
-- FILE   : V1__Initial_Setup.sql
-- FLYWAY : Version 1 - Initial Schema
-- PROJECT: Hệ Thống Quản Lý Dịch Vụ Thị Lực & Thiết Bị Y Tế
-- STACK  : Oracle SQL + Spring Boot + React.js
-- ============================================================


-- ============================================================
-- PHẦN I: TẠO BẢNG (DDL)
-- ============================================================

-- =====================================================
-- I.1 QUẢN LÝ QUYỀN TRUY CẬP (RBAC) & NHÂN SỰ
-- =====================================================

-- Bảng Nhóm Người Dùng (ví dụ: Bác sĩ, Thu ngân, ...)
CREATE TABLE NHOM (
    MANHOM   VARCHAR2(10)  PRIMARY KEY,
    TENNHOM  NVARCHAR2(100)
);

-- Bảng Vai Trò / Quyền Hạn (ví dụ: Xem hồ sơ, Quản lý kho, ...)
CREATE TABLE VAITRO (
    MAVAITRO  VARCHAR2(10)  PRIMARY KEY,
    TENVAITRO NVARCHAR2(100)
);

-- Bảng Trung Gian: Gán Vai Trò vào Nhóm
CREATE TABLE NHOM_VAITRO (
    MANHOM   VARCHAR2(10),
    MAVAITRO VARCHAR2(10),
    CONSTRAINT PK_NHOM_VAITRO PRIMARY KEY (MANHOM, MAVAITRO),
    CONSTRAINT FK_NVT_NHOM    FOREIGN KEY (MANHOM)   REFERENCES NHOM(MANHOM),
    CONSTRAINT FK_NVT_VAITRO  FOREIGN KEY (MAVAITRO) REFERENCES VAITRO(MAVAITRO)
);

-- Bảng Tài Khoản Người Dùng Hệ Thống
CREATE TABLE TAI_KHOAN (
    MATK      VARCHAR2(10)  PRIMARY KEY,
    MANHOM    VARCHAR2(10),
    USERNAME  VARCHAR2(50)  UNIQUE,
    PASSWORD  VARCHAR2(255),
    TRANGTHAI NUMBER(1),                     -- 1: Hoạt động | 0: Bị khóa
    CONSTRAINT FK_TK_NHOM FOREIGN KEY (MANHOM) REFERENCES NHOM(MANHOM)
);

-- Bảng Chức Vụ Công Việc
CREATE TABLE CHUC_VU (
    MACV  VARCHAR2(10)  PRIMARY KEY,
    TENCV NVARCHAR2(100)
);

-- Bảng Thông Tin Chi Tiết Nhân Sự
CREATE TABLE NHAN_SU (
    MANS       VARCHAR2(10)  PRIMARY KEY,
    MATK       VARCHAR2(10)  UNIQUE,          -- Mỗi nhân sự chỉ 1 tài khoản
    MACV       VARCHAR2(10),
    CCCD       VARCHAR2(12),
    HOTEN      NVARCHAR2(100),
    NGAYSINH   DATE,
    GIOITINH   NVARCHAR2(10),
    SDT        VARCHAR2(15),
    DIACHI     NVARCHAR2(255),
    CHUYENKHOA NVARCHAR2(100) NULL,           -- Chỉ bắt buộc cho Bác sĩ
    CONSTRAINT FK_NS_TK FOREIGN KEY (MATK) REFERENCES TAI_KHOAN(MATK),
    CONSTRAINT FK_NS_CV FOREIGN KEY (MACV) REFERENCES CHUC_VU(MACV)
);

-- =====================================================
-- I.2 QUẢN LÝ KHÁCH HÀNG & Y KHOA
-- =====================================================

-- Bảng Thông Tin Khách Hàng / Bệnh Nhân
CREATE TABLE KHACH_HANG (
    MAKH     VARCHAR2(10)  PRIMARY KEY,
    CCCD     VARCHAR2(12),
    HOTEN    NVARCHAR2(100),
    NGAYSINH DATE,
    GIOITINH NVARCHAR2(10),
    SDT      VARCHAR2(15)  UNIQUE,
    DIACHI   NVARCHAR2(255),
    DIEMTICHLUY NUMBER DEFAULT 0
);

-- Bảng Lịch Hẹn Khám / Tư Vấn
CREATE TABLE LICH_HEN (
    MALH      VARCHAR2(10)  PRIMARY KEY,
    MAKH      VARCHAR2(10),
    MANS      VARCHAR2(10),
    NGAYHEN   TIMESTAMP,
    TRANGTHAI NVARCHAR2(50),                  -- Mới | Đã khám | Đã hủy
    CONSTRAINT FK_LH_KH FOREIGN KEY (MAKH) REFERENCES KHACH_HANG(MAKH),
    CONSTRAINT FK_LH_NS FOREIGN KEY (MANS) REFERENCES NHAN_SU(MANS)
);

-- Bảng Hồ Sơ Khám Thị Lực (Bác sĩ lập)
CREATE TABLE HO_SO_THI_LUC (
    MAHOSO   VARCHAR2(10)  PRIMARY KEY,
    MAKH     VARCHAR2(10),
    MANS     VARCHAR2(10),
    NGAYKHAM TIMESTAMP,
    KETLUAN  NVARCHAR2(255),
    CONSTRAINT FK_HS_KH FOREIGN KEY (MAKH) REFERENCES KHACH_HANG(MAKH),
    CONSTRAINT FK_HS_NS FOREIGN KEY (MANS) REFERENCES NHAN_SU(MANS)
);

-- Bảng Chi Tiết Thị Lực Từng Mắt
CREATE TABLE CHI_TIET_THI_LUC (
    MAHOSO        VARCHAR2(10),
    MAT           CHAR(1),                    -- P: Phải | T: Trái
    DOCAU_SPH     NUMBER(4,2),
    DOTRU_CYL     NUMBER(4,2),
    TRUC_AX       NUMBER(3),
    KHOANGCACH_PD NUMBER(3,1),
    DOCONG_ADD NUMBER(4,2),
    CONSTRAINT PK_CTTTL    PRIMARY KEY (MAHOSO, MAT),
    CONSTRAINT FK_CTTTL_HS FOREIGN KEY (MAHOSO) REFERENCES HO_SO_THI_LUC(MAHOSO)
);

-- Bảng Đơn Thuốc Gốc
CREATE TABLE DON_THUOC (
    MADONTHUOC VARCHAR2(10)  PRIMARY KEY,
    MAHOSO     VARCHAR2(10),
    MANS       VARCHAR2(10),
    NGAYKEDON  DATE,
    LOIDAN     NVARCHAR2(255),
    CONSTRAINT FK_DT_HS FOREIGN KEY (MAHOSO) REFERENCES HO_SO_THI_LUC(MAHOSO),
    CONSTRAINT FK_DT_NS FOREIGN KEY (MANS)   REFERENCES NHAN_SU(MANS)
);

-- Bảng Audit - "Hộp Đen" Lưu Vết Kết Luận Khám
-- (Tự động ghi log mỗi khi bác sĩ sửa KETLUAN)
CREATE TABLE AUDIT_HOSO_THILUC (
    MAAUDIT          VARCHAR2(20)   PRIMARY KEY,
    MAHOSO           VARCHAR2(10),
    OLD_KETLUAN      NVARCHAR2(255),
    NEW_KETLUAN      NVARCHAR2(255),
    THOI_GIAN        TIMESTAMP      DEFAULT SYSTIMESTAMP,
    NGUOI_THUC_HIEN  VARCHAR2(50)
);

-- =====================================================
-- I.3 QUẢN LÝ SẢN PHẨM & KÊ ĐƠN
-- =====================================================

-- Bảng Phân Loại Sản Phẩm
CREATE TABLE LOAI_SAN_PHAM (
    MALOAI  VARCHAR2(10)  PRIMARY KEY,
    TENLOAI NVARCHAR2(100)
);

-- Bảng Thông Tin Sản Phẩm
CREATE TABLE SAN_PHAM (
    MASP      VARCHAR2(10)  PRIMARY KEY,
    MALOAI    VARCHAR2(10),
    TENSP     NVARCHAR2(100),
    DONVITINH NVARCHAR2(20),
    LATHUOC   NUMBER(1),                      -- 1: Thuốc/TPCN | 0: Kính/Thiết bị
    GIABAN    NUMBER(15,2),
    CONSTRAINT FK_SP_LOAI FOREIGN KEY (MALOAI) REFERENCES LOAI_SAN_PHAM(MALOAI)
);

-- Bảng Phiếu Kê Đơn (Bác sĩ lập, dùng cho mọi loại SP)
CREATE TABLE PHIEU_KE_DON (
    MADON     VARCHAR2(10)  PRIMARY KEY,
    MAHOSO    VARCHAR2(10),
    MANS      VARCHAR2(10),
    NGAYKEDON DATE,
    LOIDAN    NVARCHAR2(255),
    CONSTRAINT FK_PKD_HS FOREIGN KEY (MAHOSO) REFERENCES HO_SO_THI_LUC(MAHOSO),
    CONSTRAINT FK_PKD_NS FOREIGN KEY (MANS)   REFERENCES NHAN_SU(MANS)
);

-- Bảng Chi Tiết Sản Phẩm Trong Phiếu Kê Đơn
CREATE TABLE CT_KE_DON (
    MADON    VARCHAR2(10),
    MASP     VARCHAR2(10),
    SOLUONG  NUMBER,
    LIEUDUNG NVARCHAR2(100) NULL,             -- Chỉ bắt buộc với Thuốc/TPCN
    CACHDUNG NVARCHAR2(100) NULL,             -- Chỉ bắt buộc với Thuốc/TPCN
    CONSTRAINT PK_CTKD     PRIMARY KEY (MADON, MASP),
    CONSTRAINT FK_CTKD_PKD FOREIGN KEY (MADON) REFERENCES PHIEU_KE_DON(MADON),
    CONSTRAINT FK_CTKD_SP  FOREIGN KEY (MASP)  REFERENCES SAN_PHAM(MASP)
);

-- =====================================================
-- I.4 QUẢN LÝ NHẬP KHO & LÔ HÀNG
-- =====================================================

-- Bảng Nhà Cung Cấp
CREATE TABLE NHA_CUNG_CAP (
    MANCC  VARCHAR2(10)  PRIMARY KEY,
    TENNCC NVARCHAR2(100),
    SDT    VARCHAR2(15),
    DIACHI NVARCHAR2(255)
);

-- Bảng Phiếu Nhập Kho (Thủ kho / Quản lý lập)
CREATE TABLE PHIEU_NHAP (
    MAPN      VARCHAR2(10)  PRIMARY KEY,
    MANCC     VARCHAR2(10),
    MANS      VARCHAR2(10),
    NGAYNHAP  TIMESTAMP,
    TONGTIEN  NUMBER(15,2),
    CONSTRAINT FK_PN_NCC FOREIGN KEY (MANCC) REFERENCES NHA_CUNG_CAP(MANCC),
    CONSTRAINT FK_PN_NS  FOREIGN KEY (MANS)  REFERENCES NHAN_SU(MANS)
);

-- Bảng Lô Hàng (Quản lý theo lô để theo dõi hạn sử dụng)
CREATE TABLE LO_HANG (
    MALO          VARCHAR2(10)  PRIMARY KEY,
    MASP          VARCHAR2(10),
    MAPN          VARCHAR2(10),
    NGAYSANXUAT   DATE,
    NGAYHETHAN    DATE,
    SOLUONGNHAP   NUMBER,
    SOLUONGTON    NUMBER,
    GIANHAP       NUMBER(15,2),
    CONSTRAINT FK_LO_SP FOREIGN KEY (MASP) REFERENCES SAN_PHAM(MASP),
    CONSTRAINT FK_LO_PN FOREIGN KEY (MAPN) REFERENCES PHIEU_NHAP(MAPN)
);

-- =====================================================
-- I.5 QUẢN LÝ BÁN HÀNG & XUẤT KHO
-- =====================================================

-- Bảng Hóa Đơn Bán Hàng (Thu ngân / Quản lý lập)
CREATE TABLE HOA_DON (
    MAHD        VARCHAR2(10)  PRIMARY KEY,
    MAKH        VARCHAR2(10),
    MANS        VARCHAR2(10),
    MAHOSO      VARCHAR2(10)  NULL,           -- Nếu cắt kính theo hồ sơ
    MADONTHUOC  VARCHAR2(10)  NULL,           -- Nếu mua theo đơn thuốc
    NGAYLAP     TIMESTAMP,
    TONGTIEN    NUMBER(15,2),
    TRANGTHAI   NVARCHAR2(50),                -- Chưa thanh toán | Đã thanh toán | Đã hủy
    CONSTRAINT FK_HD_KH FOREIGN KEY (MAKH)       REFERENCES KHACH_HANG(MAKH),
    CONSTRAINT FK_HD_NS FOREIGN KEY (MANS)       REFERENCES NHAN_SU(MANS),
    CONSTRAINT FK_HD_HS FOREIGN KEY (MAHOSO)     REFERENCES HO_SO_THI_LUC(MAHOSO),
    CONSTRAINT FK_HD_DT FOREIGN KEY (MADONTHUOC) REFERENCES DON_THUOC(MADONTHUOC)
);

-- Bảng Chi Tiết Hóa Đơn
CREATE TABLE CT_HOA_DON (
    MAHD    VARCHAR2(10),
    MALO    VARCHAR2(10),                     -- Lô hàng cụ thể để trừ kho chính xác
    SOLUONG NUMBER,
    DONGIA  NUMBER(15,2),
    CONSTRAINT PK_CTHD     PRIMARY KEY (MAHD, MALO),
    CONSTRAINT FK_CTHD_HD  FOREIGN KEY (MAHD) REFERENCES HOA_DON(MAHD),
    CONSTRAINT FK_CTHD_LO  FOREIGN KEY (MALO) REFERENCES LO_HANG(MALO)
);

-- Bảng Thanh Toán
CREATE TABLE THANH_TOAN (
    MATT          VARCHAR2(10)  PRIMARY KEY,
    MAHD          VARCHAR2(10),
    NGAYTHANHTOAN TIMESTAMP,
    SOTIEN        NUMBER(15,2),
    PHUONGTHUC    NVARCHAR2(50),              -- Tiền mặt | Chuyển khoản | Thẻ
    TRANGTHAI     NVARCHAR2(50),              -- Thành công | Thất bại | Đang xử lý
    CONSTRAINT FK_TT_HD FOREIGN KEY (MAHD) REFERENCES HOA_DON(MAHD)
);

-- Bảng Phiếu Xuất Kho (Tự động sinh từ Hóa đơn)
CREATE TABLE PHIEU_XUAT (
    MAPX     VARCHAR2(10)  PRIMARY KEY,
    MAHD     VARCHAR2(10),
    MANS     VARCHAR2(10),
    NGAYXUAT TIMESTAMP,
    CONSTRAINT FK_PX_HD FOREIGN KEY (MAHD) REFERENCES HOA_DON(MAHD),
    CONSTRAINT FK_PX_NS FOREIGN KEY (MANS) REFERENCES NHAN_SU(MANS)
);

-- Bảng Chi Tiết Phiếu Xuất Kho
CREATE TABLE CT_PHIEU_XUAT (
    MAPX        VARCHAR2(10),
    MALO        VARCHAR2(10),
    SOLUONGXUAT NUMBER,
    CONSTRAINT PK_CTPX     PRIMARY KEY (MAPX, MALO),
    CONSTRAINT FK_CTPX_PX  FOREIGN KEY (MAPX) REFERENCES PHIEU_XUAT(MAPX),
    CONSTRAINT FK_CTPX_LO  FOREIGN KEY (MALO) REFERENCES LO_HANG(MALO)
);


-- ============================================================
-- PHẦN II: Trigger
-- 1. Trigger nhân sự
CREATE OR REPLACE TRIGGER TRG_VALIDATE_NHAN_SU
BEFORE INSERT OR UPDATE ON NHAN_SU
FOR EACH ROW
DECLARE
    v_tuoi  NUMBER;
    v_count NUMBER;
BEGIN
    -- [1] Kiểm tra tuổi lao động tối thiểu 18
    v_tuoi := MONTHS_BETWEEN(SYSDATE, :NEW.NGAYSINH) / 12;
    IF v_tuoi < 18 THEN
        RAISE_APPLICATION_ERROR(-20010, 'LỖI: Nhân viên [' || :NEW.HOTEN || '] chưa đủ 18 tuổi!');
    END IF;

    -- [2] Khóa MATK (Chỉ kiểm tra khi tạo mới)
    IF INSERTING THEN
        SELECT COUNT(*) INTO v_count FROM NHAN_SU WHERE MATK = :NEW.MATK;
        IF v_count > 0 THEN
            RAISE_APPLICATION_ERROR(-20009, 'LỖI: Tài khoản này đã được gán cho người khác!');
        END IF;
    END IF;
END;
/
-- 2. Trigger Khách Hàng
CREATE OR REPLACE TRIGGER TRG_VALIDATE_KHACH_HANG
BEFORE INSERT OR UPDATE OR DELETE ON KHACH_HANG
FOR EACH ROW
DECLARE
    v_count NUMBER;
BEGIN
    -- [1] Validate SĐT
    IF INSERTING OR UPDATING THEN
        IF NOT REGEXP_LIKE(:NEW.SDT, '^[0-9]{9,11}$') THEN
            RAISE_APPLICATION_ERROR(-20013, 'LỖI: Số điện thoại không hợp lệ!');
        END IF;
    END IF;

    -- [2] Chặn xóa khách có lịch hẹn
    IF DELETING THEN
        SELECT COUNT(*) INTO v_count FROM LICH_HEN WHERE MAKH = :OLD.MAKH AND TRANGTHAI = N'Mới';
        IF v_count > 0 THEN
            RAISE_APPLICATION_ERROR(-20011, 'LỖI: Không thể xóa khách hàng đang có lịch hẹn chờ!');
        END IF;
    END IF;
END;
/
-- 3. Trigger Hồ Sơ Thị Lực
CREATE OR REPLACE TRIGGER TRG_VALIDATE_HO_SO
BEFORE INSERT OR UPDATE ON HO_SO_THI_LUC
FOR EACH ROW
DECLARE
    v_tencv CHUC_VU.TENCV%TYPE;
BEGIN
    -- [1] Phân quyền Bác sĩ: Chỉ Bác sĩ mới được lập/sửa Hồ Sơ Khám
    SELECT cv.TENCV INTO v_tencv 
    FROM NHAN_SU ns JOIN CHUC_VU cv ON ns.MACV = cv.MACV 
    WHERE ns.MANS = :NEW.MANS;
    
    IF v_tencv != N'Bác sĩ' THEN
        RAISE_APPLICATION_ERROR(-20001, 'LỖI: Chỉ nhân sự có chức vụ "Bác sĩ" mới được lập Hồ Sơ Khám!');
    END IF;
END;
/
-- 4.Trigger Hóa Đơn
CREATE OR REPLACE TRIGGER TRG_VALIDATE_HOA_DON
BEFORE INSERT OR UPDATE OR DELETE ON HOA_DON
FOR EACH ROW
DECLARE
    v_tencv CHUC_VU.TENCV%TYPE;
BEGIN
    -- [1] Phân quyền Thu ngân
    IF INSERTING OR UPDATING THEN
        SELECT cv.TENCV INTO v_tencv FROM NHAN_SU ns JOIN CHUC_VU cv ON ns.MACV = cv.MACV WHERE ns.MANS = :NEW.MANS;
        IF v_tencv NOT IN (N'Thu ngân', N'Quản lý') THEN
            RAISE_APPLICATION_ERROR(-20003, 'LỖI: Chỉ Thu ngân hoặc Quản lý mới được tạo Hóa Đơn!');
        END IF;
    END IF;

    -- [2] Đóng băng hóa đơn đã thanh toán
    IF UPDATING OR DELETING THEN
        IF :OLD.TRANGTHAI = N'Đã thanh toán' THEN
            RAISE_APPLICATION_ERROR(-20007, 'LỖI: Hóa đơn đã thanh toán, không thể can thiệp!');
        END IF;
    END IF;
END;
/
-- TRIGGER 5: Chi tiết hóa đơn
CREATE OR REPLACE TRIGGER TRG_CT_HOA_DON
FOR INSERT OR UPDATE OR DELETE ON CT_HOA_DON
COMPOUND TRIGGER
    v_ton  LO_HANG.SOLUONGTON%TYPE;
    v_hsd  LO_HANG.NGAYHETHAN%TYPE;

    BEFORE EACH ROW IS
    BEGIN
        -- Chặn can thiệp khi Hóa đơn đã đóng
        FOR rec IN (SELECT TRANGTHAI FROM HOA_DON WHERE MAHD = NVL(:NEW.MAHD, :OLD.MAHD)) LOOP
            IF rec.TRANGTHAI IN (N'Đã thanh toán', N'Đã hủy') THEN
                RAISE_APPLICATION_ERROR(-20033, 'CTHD: Hóa đơn đã đóng, không thể thay đổi!');
            END IF;
        END LOOP;

        IF INSERTING OR UPDATING THEN
            SELECT SOLUONGTON, NGAYHETHAN INTO v_ton, v_hsd FROM LO_HANG WHERE MALO = :NEW.MALO;

            IF v_hsd < SYSDATE THEN
                RAISE_APPLICATION_ERROR(-20006, 'CTHD: Lô hàng đã hết hạn sử dụng!');
            END IF;

            IF :NEW.SOLUONG <= 0 THEN
                RAISE_APPLICATION_ERROR(-20014, 'CTHD: Số lượng phải lớn hơn 0.');
            END IF;

            -- Kiểm tra tồn kho (Nếu Update thì cộng trả lại số cũ trước khi check)
            IF :NEW.SOLUONG > (CASE WHEN UPDATING THEN v_ton + :OLD.SOLUONG ELSE v_ton END) THEN
                RAISE_APPLICATION_ERROR(-20005, 'CTHD: Không đủ hàng trong kho!');
            END IF;
        END IF;
    END BEFORE EACH ROW;

    AFTER EACH ROW IS
    BEGIN
        -- Xử lý Tồn kho & Tổng tiền 1 lần gọn gàng
        IF INSERTING THEN
            UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON - :NEW.SOLUONG WHERE MALO = :NEW.MALO;
            UPDATE HOA_DON SET TONGTIEN = NVL(TONGTIEN, 0) + (:NEW.SOLUONG * :NEW.DONGIA) WHERE MAHD = :NEW.MAHD;
        ELSIF UPDATING THEN
            UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON + :OLD.SOLUONG - :NEW.SOLUONG WHERE MALO = :NEW.MALO;
            UPDATE HOA_DON SET TONGTIEN = NVL(TONGTIEN, 0) - (:OLD.SOLUONG * :OLD.DONGIA) + (:NEW.SOLUONG * :NEW.DONGIA) WHERE MAHD = :NEW.MAHD;
        ELSIF DELETING THEN
            UPDATE LO_HANG SET SOLUONGTON = SOLUONGTON + :OLD.SOLUONG WHERE MALO = :OLD.MALO;
            UPDATE HOA_DON SET TONGTIEN = NVL(TONGTIEN, 0) - (:OLD.SOLUONG * :OLD.DONGIA) WHERE MAHD = :OLD.MAHD;
        END IF;
    END AFTER EACH ROW;
END TRG_CT_HOA_DON;
/
-- TRIGGER 6: Phiếu Nhập
CREATE OR REPLACE TRIGGER TRG_PHIEU_NHAP
BEFORE INSERT OR UPDATE ON PHIEU_NHAP
FOR EACH ROW
DECLARE
    v_tencv CHUC_VU.TENCV%TYPE;
    v_lo_daban NUMBER;
BEGIN
    -- [1] Phân quyền
    SELECT cv.TENCV INTO v_tencv FROM NHAN_SU ns JOIN CHUC_VU cv ON ns.MACV = cv.MACV WHERE ns.MANS = :NEW.MANS;
    IF v_tencv NOT IN (N'Thủ kho', N'Quản lý') THEN
        RAISE_APPLICATION_ERROR(-20004, 'PN: Chỉ Thủ kho hoặc Quản lý mới được lập phiếu nhập.');
    END IF;

    -- [2] Không sửa phiếu đã giao dịch
    IF UPDATING THEN
        SELECT COUNT(*) INTO v_lo_daban FROM LO_HANG WHERE MAPN = :OLD.MAPN AND SOLUONGTON < SOLUONGNHAP;
        IF v_lo_daban > 0 THEN
            RAISE_APPLICATION_ERROR(-20015, 'PN: Phiếu nhập đã có lô hàng được bán, không thể sửa.');
        END IF;
    END IF;
END;
/
-- TRIGGER 7 
CREATE OR REPLACE TRIGGER TRG_THANH_TOAN
FOR INSERT OR UPDATE ON THANH_TOAN
COMPOUND TRIGGER

    v_tong_hd NUMBER;
    v_trang_thai HOA_DON.TRANGTHAI%TYPE;
    v_makh VARCHAR2(10);
    v_mans_hd VARCHAR2(10);
    v_mapx VARCHAR2(10);
    v_da_tt NUMBER;

    BEFORE EACH ROW IS
    BEGIN
        -- Lấy thông tin Hóa đơn
        SELECT TONGTIEN, TRANGTHAI, MAKH, MANS 
        INTO v_tong_hd, v_trang_thai, v_makh, v_mans_hd 
        FROM HOA_DON WHERE MAHD = :NEW.MAHD;

        IF v_trang_thai != N'Chưa thanh toán' THEN
            RAISE_APPLICATION_ERROR(-20016, 'TT: Hóa đơn không ở trạng thái "Chưa thanh toán".');
        END IF;

        IF :NEW.SOTIEN <= 0 OR :NEW.SOTIEN > v_tong_hd THEN
            RAISE_APPLICATION_ERROR(-20018, 'TT: Số tiền thanh toán không hợp lệ.');
        END IF;
    END BEFORE EACH ROW;

    -- Dùng AFTER STATEMENT để được phép SELECT SUM trên chính bảng THANH_TOAN (Né Mutating)
    -- và đảm bảo chạy chung 1 Transaction với hệ thống (All-or-nothing)
    AFTER STATEMENT IS
    BEGIN
        -- Duyệt qua những thanh toán vừa thành công (Giả định lấy hóa đơn vừa thao tác)
        -- Lưu ý: Thực tế Spring Boot gọi từng dòng nên xử lý như sau là an toàn
        FOR rec IN (
            SELECT MAHD FROM THANH_TOAN WHERE TRANGTHAI = N'Thành công' GROUP BY MAHD
        ) LOOP
            -- Tính tổng tiền ĐÃ THANH TOÁN
            SELECT NVL(SUM(SOTIEN), 0) INTO v_da_tt FROM THANH_TOAN WHERE MAHD = rec.MAHD AND TRANGTHAI = N'Thành công';
            
            -- Lấy lại tổng tiền PHẢI THANH TOÁN của hóa đơn
            SELECT TONGTIEN, MAKH, MANS INTO v_tong_hd, v_makh, v_mans_hd FROM HOA_DON WHERE MAHD = rec.MAHD;

            -- Nếu đủ tiền -> Kích hoạt dây chuyền
            IF v_da_tt >= v_tong_hd THEN
                -- 1. Chốt hóa đơn
                UPDATE HOA_DON SET TRANGTHAI = N'Đã thanh toán' WHERE MAHD = rec.MAHD;
                
                -- 2. Tích điểm Loyalty (Chỉ tính cho lần thanh toán cuối để tránh cộng lặp)
                UPDATE KHACH_HANG 
                SET DIEMTICHLUY = NVL(DIEMTICHLUY, 0) + FLOOR(v_tong_hd / 100000)
                WHERE MAKH = v_makh;

                -- 3. Tạo Phiếu Xuất (Chỉ tạo nếu chưa có)
                v_mapx := SUBSTR('PX' || rec.MAHD, 1, 10);
                
                BEGIN
                    INSERT INTO PHIEU_XUAT(MAPX, MAHD, MANS, NGAYXUAT) 
                    VALUES (v_mapx, rec.MAHD, v_mans_hd, SYSTIMESTAMP);

                    INSERT INTO CT_PHIEU_XUAT(MAPX, MALO, SOLUONGXUAT)
                    SELECT v_mapx, MALO, SOLUONG FROM CT_HOA_DON WHERE MAHD = rec.MAHD;
                EXCEPTION
                    WHEN DUP_VAL_ON_INDEX THEN NULL; -- Nếu đã có Phiếu Xuất rồi thì bỏ qua
                END;
            END IF;
        END LOOP;
    END AFTER STATEMENT;
END TRG_THANH_TOAN;
/
-- TRIGGER 8: Lưu vết Audit khi sửa Kết Luận hồ sơ
CREATE OR REPLACE TRIGGER TRG_AUDIT_HO_SO
AFTER UPDATE OF KETLUAN ON HO_SO_THI_LUC
FOR EACH ROW
BEGIN
    -- Chỉ lưu nếu kết luận thực sự bị thay đổi
    IF NVL(:OLD.KETLUAN, '~~NULL~~') != NVL(:NEW.KETLUAN, '~~NULL~~') THEN
        INSERT INTO AUDIT_HOSO_THILUC (
            MAAUDIT, MAHOSO, OLD_KETLUAN, NEW_KETLUAN, NGUOI_THUC_HIEN
        ) VALUES (
            'AUD_' || TO_CHAR(SYSTIMESTAMP, 'MMDDHH24MISSFF3'), -- Thêm FF3 (Milisec) siêu an toàn
            :OLD.MAHOSO, 
            :OLD.KETLUAN, 
            :NEW.KETLUAN, 
            USER
        );
    END IF;
END;
/
-- TRIGGER 9: Quản lý Lô Hàng (Tồn kho & Tính tiền Phiếu Nhập)
CREATE OR REPLACE TRIGGER TRG_LO_HANG
FOR INSERT OR UPDATE ON LO_HANG
COMPOUND TRIGGER

    BEFORE EACH ROW IS
    BEGIN
        -- Tự động gán Tồn = Nhập khi mới nạp hàng vào kho
        IF INSERTING THEN
            :NEW.SOLUONGTON := :NEW.SOLUONGNHAP;
        END IF;
        
        -- Chặn nhập hàng quá hạn hoặc sắp hết hạn (cảnh báo)
        IF :NEW.NGAYHETHAN <= SYSDATE THEN
            RAISE_APPLICATION_ERROR(-20029, 'LH: Không được nhập lô hàng đã hết hạn!');
        END IF;
    END BEFORE EACH ROW;

    AFTER EACH ROW IS
    BEGIN
        -- Đồng bộ tổng tiền lên Phiếu Nhập một cách mượt mà (Delta update)
        IF INSERTING THEN
            UPDATE PHIEU_NHAP 
            SET TONGTIEN = NVL(TONGTIEN, 0) + (:NEW.SOLUONGNHAP * :NEW.GIANHAP) 
            WHERE MAPN = :NEW.MAPN;
        ELSIF UPDATING THEN
            UPDATE PHIEU_NHAP 
            SET TONGTIEN = NVL(TONGTIEN, 0) - (:OLD.SOLUONGNHAP * :OLD.GIANHAP) + (:NEW.SOLUONGNHAP * :NEW.GIANHAP) 
            WHERE MAPN = :NEW.MAPN;
        END IF;
    END AFTER EACH ROW;
END TRG_LO_HANG;
/
-- TRIGGER 10: Phân quyền Bác sĩ kê Đơn thuốc (Đáp ứng R7)
CREATE OR REPLACE TRIGGER TRG_VALIDATE_KE_DON
BEFORE INSERT OR UPDATE ON PHIEU_KE_DON
FOR EACH ROW
DECLARE
    v_tencv CHUC_VU.TENCV%TYPE;
BEGIN
    -- [1] Phân quyền: Chỉ Bác sĩ mới được lập Phiếu Kê Đơn
    SELECT cv.TENCV INTO v_tencv 
    FROM NHAN_SU ns JOIN CHUC_VU cv ON ns.MACV = cv.MACV 
    WHERE ns.MANS = :NEW.MANS;
    
    IF v_tencv != N'Bác sĩ' THEN
        RAISE_APPLICATION_ERROR(-20025, 'LỖI: Chỉ nhân sự có chức vụ "Bác sĩ" mới được quyền Kê Đơn Thuốc!');
    END IF;
END;
/
-- ============================================================
-- PHẦN III: STORED PROCEDURES
-- ============================================================

-- =====================================================
-- SP 1: Lưu Hồ Sơ Khám Bệnh (Phân hệ Y khoa)
-- Tạo đồng thời: HO_SO_THI_LUC + CHI_TIET_THI_LUC (2 mắt) + PHIEU_KE_DON trống
-- Spring Boot gọi: CallableStatement -> sp(mahoso, makh, mans, ...)
-- =====================================================

CREATE OR REPLACE PROCEDURE SP_LUU_HOSO_KHAM_BENH (
    p_mahoso        IN  VARCHAR2,
    p_makh          IN  VARCHAR2,
    p_mans          IN  VARCHAR2,
    p_ketluan       IN  NVARCHAR2,
    -- Chi tiết mắt Trái
    p_mat_trai_sph  IN  NUMBER,
    p_mat_trai_cyl  IN  NUMBER,
    p_mat_trai_ax   IN  NUMBER,
    -- Chi tiết mắt Phải
    p_mat_phai_sph  IN  NUMBER,
    p_mat_phai_cyl  IN  NUMBER,
    p_mat_phai_ax   IN  NUMBER,
    -- Khoảng cách đồng tử (dùng chung 2 mắt)
    p_pd            IN  NUMBER,
    -- OUTPUT: trả về mã phiếu kê đơn vừa tạo cho Spring Boot
    p_madon_out     OUT VARCHAR2
) AS
    v_madon VARCHAR2(20);
BEGIN
    -- Bước 1: Tạo Hồ Sơ Khám
    INSERT INTO HO_SO_THI_LUC (MAHOSO, MAKH, MANS, NGAYKHAM, KETLUAN)
    VALUES (p_mahoso, p_makh, p_mans, SYSTIMESTAMP, p_ketluan);

    -- Bước 2: Lưu chi tiết mắt Trái
    INSERT INTO CHI_TIET_THI_LUC (MAHOSO, MAT, DOCAU_SPH, DOTRU_CYL, TRUC_AX, KHOANGCACH_PD)
    VALUES (p_mahoso, 'T', p_mat_trai_sph, p_mat_trai_cyl, p_mat_trai_ax, p_pd);

    -- Bước 3: Lưu chi tiết mắt Phải
    INSERT INTO CHI_TIET_THI_LUC (MAHOSO, MAT, DOCAU_SPH, DOTRU_CYL, TRUC_AX, KHOANGCACH_PD)
    VALUES (p_mahoso, 'P', p_mat_phai_sph, p_mat_phai_cyl, p_mat_phai_ax, p_pd);

    -- Bước 4: Tự động tạo Phiếu Kê Đơn trống (bác sĩ sẽ add thuốc/kính vào sau)
    v_madon := 'KD_' || p_mahoso;
    INSERT INTO PHIEU_KE_DON (MADON, MAHOSO, MANS, NGAYKEDON)
    VALUES (v_madon, p_mahoso, p_mans, SYSDATE);

    -- Trả mã phiếu kê đơn về Spring Boot để hiển thị trên form
    p_madon_out := v_madon;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK; -- Hủy toàn bộ nếu bất kỳ bước nào thất bại (kể cả trigger từ chối)
        RAISE;
END SP_LUU_HOSO_KHAM_BENH;
/

-- =====================================================
-- SP 2: Chốt Thanh Toán & Tự Động Xuất Kho (Phân hệ Bán hàng)
-- Thực hiện đồng thời: Cập nhật HOA_DON + Ghi THANH_TOAN + Tạo PHIEU_XUAT + CT_PHIEU_XUAT
-- Spring Boot gọi khi Thu ngân bấm "Xác nhận thanh toán"
-- =====================================================

CREATE OR REPLACE PROCEDURE SP_CHOT_THANH_TOAN_HOA_DON (
    p_mahd          IN VARCHAR2,
    p_matt          IN VARCHAR2,
    p_phuong_thuc   IN NVARCHAR2,
    p_mans_xuat     IN VARCHAR2
) AS
    v_tongtien NUMBER;
    v_mapx     VARCHAR2(20);
BEGIN
    -- Bước 1: Đọc tổng tiền hóa đơn
    SELECT TONGTIEN INTO v_tongtien
    FROM   HOA_DON
    WHERE  MAHD = p_mahd;

    -- Bước 2: Chỉ INSERT vào THANH_TOAN.
    --         TRG_MEGA_THANH_TOAN (AFTER EACH ROW) sẽ tự động UPDATE HOA_DON.TRANGTHAI
    --         → tránh duplicate logic giữa SP và trigger
    INSERT INTO THANH_TOAN (MATT, MAHD, NGAYTHANHTOAN, SOTIEN, PHUONGTHUC, TRANGTHAI)
    VALUES (p_matt, p_mahd, SYSTIMESTAMP, v_tongtien, p_phuong_thuc, N'Thành công');

    -- Bước 3: Sinh Phiếu Xuất Kho (trigger không cover bước này → SP vẫn cần xử lý)
    v_mapx := 'PX_' || p_mahd;
    INSERT INTO PHIEU_XUAT (MAPX, MAHD, MANS, NGAYXUAT)
    VALUES (v_mapx, p_mahd, p_mans_xuat, SYSTIMESTAMP);

    -- Bước 4: Copy CT_HOA_DON → CT_PHIEU_XUAT
    INSERT INTO CT_PHIEU_XUAT (MAPX, MALO, SOLUONGXUAT)
    SELECT v_mapx, MALO, SOLUONG
    FROM   CT_HOA_DON
    WHERE  MAHD = p_mahd;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END SP_CHOT_THANH_TOAN_HOA_DON;
/

-- =====================================================
-- SP 3: Nhập Kho Lô Hàng Mới (Phân hệ Kho bãi)  [MỚI]
-- Tạo đồng thời: PHIEU_NHAP + nhiều dòng LO_HANG
-- Spring Boot gọi khi Thủ kho submit form nhập kho
-- Input: Mã phiếu, NCC, nhân sự, và danh sách lô hàng dạng JSON -> xử lý từng lô
-- =====================================================

CREATE OR REPLACE PROCEDURE SP_NHAP_KHO_LO_HANG (
    p_mapn        IN  VARCHAR2,
    p_mancc       IN  VARCHAR2,
    p_mans        IN  VARCHAR2,
    -- Thông tin 1 lô hàng (Spring Boot gọi lặp lại SP này mỗi lô, trong cùng 1 transaction)
    p_malo        IN  VARCHAR2,
    p_masp        IN  VARCHAR2,
    p_ngaysx      IN  DATE,
    p_ngayhethane IN  DATE,
    p_soluongnhap IN  NUMBER,
    p_gianhap     IN  NUMBER,
    -- OUTPUT: tổng tiền phiếu nhập sau khi tích lũy
    p_tongtien_out OUT NUMBER
) AS
    v_existing NUMBER;
    v_tongtien NUMBER;
BEGIN
    -- Bước 1: Tạo Phiếu Nhập nếu chưa tồn tại (idempotent)
    SELECT COUNT(*) INTO v_existing FROM PHIEU_NHAP WHERE MAPN = p_mapn;
    IF v_existing = 0 THEN
        INSERT INTO PHIEU_NHAP (MAPN, MANCC, MANS, NGAYNHAP, TONGTIEN)
        VALUES (p_mapn, p_mancc, p_mans, SYSTIMESTAMP, 0);
    END IF;

    -- Bước 2: Kiểm tra hạn sử dụng hợp lệ
    IF p_ngayhethane <= p_ngaysx THEN
        RAISE_APPLICATION_ERROR(-20020, 'LỖI: Ngày hết hạn phải sau ngày sản xuất!');
    END IF;

    IF p_ngayhethane <= SYSDATE THEN
        RAISE_APPLICATION_ERROR(-20021, 'LỖI: Không thể nhập lô hàng đã hết hạn sử dụng!');
    END IF;

    -- Bước 3: Thêm Lô Hàng vào kho
    -- SOLUONGTON ban đầu bằng SOLUONGNHAP
    INSERT INTO LO_HANG (MALO, MASP, MAPN, NGAYSANXUAT, NGAYHETHAN, SOLUONGNHAP, SOLUONGTON, GIANHAP)
    VALUES (p_malo, p_masp, p_mapn, p_ngaysx, p_ngayhethane, p_soluongnhap, p_soluongnhap, p_gianhap);

    -- Bước 4: Cập nhật tổng tiền phiếu nhập
    UPDATE PHIEU_NHAP
    SET    TONGTIEN = TONGTIEN + (p_soluongnhap * p_gianhap)
    WHERE  MAPN = p_mapn;

    -- Trả tổng tiền hiện tại về Spring Boot
    SELECT TONGTIEN INTO v_tongtien FROM PHIEU_NHAP WHERE MAPN = p_mapn;
    p_tongtien_out := v_tongtien;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END SP_NHAP_KHO_LO_HANG;
/

-- =====================================================
-- SP 4: Cảnh Báo Hàng Sắp Hết Hạn (Dashboard)  [MỚI]
-- Trả về SYS_REFCURSOR -> Spring Boot map sang JSON -> React vẽ Dashboard
-- Tham số: số ngày cảnh báo trước (ví dụ: 30 = cảnh báo hàng hết hạn trong 30 ngày tới)
-- =====================================================

CREATE OR REPLACE PROCEDURE SP_CANH_BAO_HANG_HET_HAN (
    p_so_ngay  IN  NUMBER,
    c_result   OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN c_result FOR
        SELECT
            l.MALO                                      AS MA_LO,
            s.MASP                                      AS MA_SP,
            s.TENSP                                     AS TEN_SAN_PHAM,
            s.DONVITINH                                 AS DON_VI,
            l.NGAYHETHAN                                AS NGAY_HET_HAN,
            ROUND(l.NGAYHETHAN - SYSDATE)               AS SO_NGAY_CON_LAI,
            l.SOLUONGTON                                AS TON_KHO,
            CASE
                WHEN ROUND(l.NGAYHETHAN - SYSDATE) <= 7  THEN N'Nguy hiểm'
                WHEN ROUND(l.NGAYHETHAN - SYSDATE) <= 30 THEN N'Cảnh báo'
                ELSE N'Chú ý'
            END                                         AS MUC_DO_CANH_BAO,
            ncc.TENNCC                                  AS NHA_CUNG_CAP
        FROM  LO_HANG    l
        JOIN  SAN_PHAM   s   ON l.MASP  = s.MASP
        JOIN  PHIEU_NHAP pn  ON l.MAPN  = pn.MAPN
        JOIN  NHA_CUNG_CAP ncc ON pn.MANCC = ncc.MANCC
        WHERE l.SOLUONGTON > 0                           -- Chỉ lô còn hàng
          AND l.NGAYHETHAN > SYSDATE                     -- Chưa hết hạn
          AND (l.NGAYHETHAN - SYSDATE) <= p_so_ngay      -- Trong khoảng cảnh báo
        ORDER BY l.NGAYHETHAN ASC;                       -- Gần hết hạn nhất lên đầu
END SP_CANH_BAO_HANG_HET_HAN;
/

-- =====================================================
-- SP 5: Thống Kê Doanh Thu Theo Tháng (Dashboard)
-- Trả về SYS_REFCURSOR theo ngày -> React vẽ biểu đồ line chart
-- =====================================================

CREATE OR REPLACE PROCEDURE SP_THONG_KE_DOANH_THU_THANG (
    p_thang IN  NUMBER,
    p_nam   IN  NUMBER,
    c_data  OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN c_data FOR
        SELECT
            TO_CHAR(NGAYTHANHTOAN, 'DD/MM/YYYY')  AS NGAY,
            COUNT(MATT)                            AS SO_LUONG_DON,
            SUM(SOTIEN)                            AS DOANH_THU_NGAY
        FROM  THANH_TOAN
        WHERE TRANGTHAI = N'Thành công'
          AND EXTRACT(MONTH FROM NGAYTHANHTOAN) = p_thang
          AND EXTRACT(YEAR  FROM NGAYTHANHTOAN) = p_nam
        GROUP BY TO_CHAR(NGAYTHANHTOAN, 'DD/MM/YYYY')
        ORDER BY NGAY ASC;
END SP_THONG_KE_DOANH_THU_THANG;
/

-- ============================================================
-- PHẦN IV: SEQUENCES (Auto-increment Production Style)
-- ============================================================
-- Lý do dùng SEQUENCE thay vì nhập tay:
--   - Đảm bảo unique tuyệt đối trong môi trường concurrent (nhiều user cùng INSERT)
--   - Spring Boot gọi SEQ.NEXTVAL trước khi INSERT → không cần query MAX(ID)+1
--   - Flyway migrate lại từ đầu vẫn không bị trùng ID
-- Cách dùng trong Spring Boot: @SequenceGenerator(name="...", sequenceName="SEQ_HOA_DON")
-- ============================================================

-- Sequence cho HOA_DON (Thu ngân tạo nhiều hóa đơn đồng thời)
CREATE SEQUENCE SEQ_HOA_DON
    START WITH 1
    INCREMENT BY 1
    NOCACHE               -- NOCACHE: đảm bảo không có gap khi rollback (quan trọng cho hóa đơn)
    NOCYCLE;

-- Sequence cho LO_HANG (Thủ kho nhập nhiều lô cùng 1 phiếu)
CREATE SEQUENCE SEQ_LO_HANG
    START WITH 1
    INCREMENT BY 1
    CACHE 20              -- CACHE 20: nhập kho thường có batch lớn → cache tăng hiệu năng
    NOCYCLE;

-- Sequence cho PHIEU_NHAP
CREATE SEQUENCE SEQ_PHIEU_NHAP
    START WITH 1
    INCREMENT BY 1
    CACHE 10
    NOCYCLE;

-- Sequence cho PHIEU_XUAT (tự sinh từ SP → cần sequence riêng)
CREATE SEQUENCE SEQ_PHIEU_XUAT
    START WITH 1
    INCREMENT BY 1
    CACHE 10
    NOCYCLE;

-- Sequence cho THANH_TOAN
CREATE SEQUENCE SEQ_THANH_TOAN
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- Sequence cho LICH_HEN
CREATE SEQUENCE SEQ_LICH_HEN
    START WITH 1
    INCREMENT BY 1
    CACHE 10
    NOCYCLE;

-- Sequence cho AUDIT log (volume cao, gap không quan trọng)
CREATE SEQUENCE SEQ_AUDIT
    START WITH 1
    INCREMENT BY 1
    CACHE 50
    NOCYCLE;


-- ============================================================
-- PHẦN V: INDEXES (Tối ưu JOIN & WHERE cho các bảng hot)
-- ============================================================
-- Nguyên tắc đánh index:
--   (1) Tất cả FOREIGN KEY thường xuyên JOIN → index riêng
--   (2) Các cột WHERE hay dùng: TRANGTHAI, NGAYHETHAN, NGAYLAP
--   (3) Bảng "hot" nhất: CT_HOA_DON, LO_HANG, THANH_TOAN
-- ============================================================

-- ── CT_HOA_DON (bảng JOIN nhiều nhất trong hệ thống) ──────────────────────────
CREATE INDEX IDX_CTHD_MAHD  ON CT_HOA_DON (MAHD);   -- JOIN với HOA_DON
CREATE INDEX IDX_CTHD_MALO  ON CT_HOA_DON (MALO);   -- JOIN với LO_HANG

-- ── LO_HANG (bảng trigger đọc mỗi khi bán hàng) ──────────────────────────────
CREATE INDEX IDX_LO_MASP    ON LO_HANG (MASP);       -- JOIN với SAN_PHAM
CREATE INDEX IDX_LO_MAPN    ON LO_HANG (MAPN);       -- JOIN với PHIEU_NHAP
CREATE INDEX IDX_LO_HSD     ON LO_HANG (NGAYHETHAN); -- WHERE hạn sử dụng (SP cảnh báo)
CREATE INDEX IDX_LO_TON     ON LO_HANG (SOLUONGTON); -- WHERE tồn kho > 0

-- ── HOA_DON (Thu ngân truy vấn theo trạng thái và ngày) ───────────────────────
CREATE INDEX IDX_HD_MAKH    ON HOA_DON (MAKH);       -- JOIN với KHACH_HANG
CREATE INDEX IDX_HD_MANS    ON HOA_DON (MANS);       -- JOIN với NHAN_SU
CREATE INDEX IDX_HD_TRANG   ON HOA_DON (TRANGTHAI);  -- WHERE trạng thái lọc hóa đơn
CREATE INDEX IDX_HD_NGAY    ON HOA_DON (NGAYLAP);    -- WHERE/ORDER BY ngày lập

-- ── THANH_TOAN (Dashboard thống kê doanh thu GROUP BY ngày) ───────────────────
CREATE INDEX IDX_TT_MAHD    ON THANH_TOAN (MAHD);               -- JOIN với HOA_DON
CREATE INDEX IDX_TT_NGAY    ON THANH_TOAN (NGAYTHANHTOAN);      -- SP thống kê theo tháng
CREATE INDEX IDX_TT_TRANG   ON THANH_TOAN (TRANGTHAI);          -- WHERE 'Thành công'
-- Composite index: SP_THONG_KE_DOANH_THU_THANG dùng cả 3 cột này cùng lúc
CREATE INDEX IDX_TT_THONGKE ON THANH_TOAN (TRANGTHAI, NGAYTHANHTOAN, SOTIEN);

-- ── HO_SO_THI_LUC (Bác sĩ tìm hồ sơ theo bệnh nhân) ─────────────────────────
CREATE INDEX IDX_HS_MAKH    ON HO_SO_THI_LUC (MAKH);
CREATE INDEX IDX_HS_MANS    ON HO_SO_THI_LUC (MANS);
CREATE INDEX IDX_HS_NGAY    ON HO_SO_THI_LUC (NGAYKHAM);

-- ── LICH_HEN (Lễ tân lọc theo trạng thái) ─────────────────────────────────────
CREATE INDEX IDX_LH_MAKH    ON LICH_HEN (MAKH);
CREATE INDEX IDX_LH_TRANG   ON LICH_HEN (TRANGTHAI);            -- WHERE 'Mới'
CREATE INDEX IDX_LH_NGAY    ON LICH_HEN (NGAYHEN);

-- ── CT_KE_DON (Bác sĩ xem chi tiết đơn) ──────────────────────────────────────
CREATE INDEX IDX_CTKD_MADON ON CT_KE_DON (MADON);
CREATE INDEX IDX_CTKD_MASP  ON CT_KE_DON (MASP);

-- ── PHIEU_NHAP / PHIEU_XUAT ───────────────────────────────────────────────────
CREATE INDEX IDX_PN_MANCC   ON PHIEU_NHAP (MANCC);
CREATE INDEX IDX_PN_MANS    ON PHIEU_NHAP (MANS);
CREATE INDEX IDX_PX_MAHD    ON PHIEU_XUAT (MAHD);

-- ── NHAN_SU (JOIN chức vụ trong mọi trigger phân quyền) ───────────────────────
CREATE INDEX IDX_NS_MACV    ON NHAN_SU (MACV);                  -- JOIN CHUC_VU (trigger dùng nhiều)
CREATE INDEX IDX_NS_MATK    ON NHAN_SU (MATK);                  -- Lookup theo tài khoản


-- ============================================================
-- END OF V1__Initial_Setup.sql
-- ============================================================