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
    DIACHI   NVARCHAR2(255)
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
-- PHẦN II: MEGA-TRIGGERS (RÀNG BUỘC NGHIỆP VỤ & BẢO MẬT)
-- ============================================================
-- Chiến lược: Gom toàn bộ logic của một bảng vào 1 Compound Trigger duy nhất.
-- Lợi ích:
--   (1) Giảm context switch: Oracle chỉ parse/compile 1 trigger thay vì N triggers nhỏ
--   (2) Dùng chung biến DECLARE: tránh SELECT lặp lại nhiều lần cho cùng 1 row
--   (3) Dễ maintain: toàn bộ logic 1 bảng nằm ở 1 chỗ, không cần tìm khắp nơi
--   (4) Kiểm soát thứ tự thực thi: BEFORE check -> AFTER update, đảm bảo nhất quán
-- ============================================================


-- =====================================================
-- MEGA-TRIGGER 1: TRG_MEGA_NHAN_SU
-- Bảng: NHAN_SU
-- Gom: Kiểm tra tuổi >= 18 (INSERT/UPDATE) + Chặn tài khoản trùng (INSERT)
-- Thay thế triggers cũ: TRG_CHECK_AGE_NS + TRG_ONE_ACC_ONE_NS
-- =====================================================

CREATE OR REPLACE TRIGGER TRG_MEGA_NHAN_SU
FOR INSERT OR UPDATE ON NHAN_SU
COMPOUND TRIGGER

    -- Biến dùng chung trong toàn bộ trigger (khai báo 1 lần, dùng cho mọi timing point)
    v_tuoi   NUMBER;
    v_count  NUMBER;

    -- ── BEFORE EACH ROW: Chạy trước khi ghi dữ liệu vào bảng ──────────────────
    BEFORE EACH ROW IS
    BEGIN
        -- [1] Kiểm tra tuổi lao động tối thiểu 18 (áp dụng cho cả INSERT lẫn UPDATE)
        v_tuoi := MONTHS_BETWEEN(SYSDATE, :NEW.NGAYSINH) / 12;
        IF v_tuoi < 18 THEN
            RAISE_APPLICATION_ERROR(-20010,
                'LỖI: Nhân viên [' || :NEW.HOTEN || '] chưa đủ 18 tuổi! (Hiện tại: '
                || TRUNC(v_tuoi) || ' tuổi)');
        END IF;

        -- [2] Mỗi tài khoản chỉ được gán cho 1 nhân viên duy nhất (chỉ kiểm tra khi INSERT)
        IF INSERTING THEN
            SELECT COUNT(*) INTO v_count FROM NHAN_SU WHERE MATK = :NEW.MATK;
            IF v_count > 0 THEN
                RAISE_APPLICATION_ERROR(-20009,
                    'LỖI: Tài khoản [' || :NEW.MATK || '] đã được gán cho nhân viên khác!');
            END IF;
        END IF;
    END BEFORE EACH ROW;

END TRG_MEGA_NHAN_SU;
/


-- =====================================================
-- MEGA-TRIGGER 2: TRG_MEGA_KHACH_HANG
-- Bảng: KHACH_HANG
-- Gom: Validate SĐT (INSERT/UPDATE) + Chặn xóa KH có lịch hẹn (DELETE)
-- Thay thế triggers cũ: TRG_CHECK_PHONE + TRG_PREVENT_DEL_KH
-- =====================================================

CREATE OR REPLACE TRIGGER TRG_MEGA_KHACH_HANG
FOR INSERT OR UPDATE OR DELETE ON KHACH_HANG
COMPOUND TRIGGER

    v_count NUMBER;

    -- ── BEFORE EACH ROW ─────────────────────────────────────────────────────────
    BEFORE EACH ROW IS
    BEGIN
        -- [1] Validate định dạng số điện thoại: chỉ chứa ký số, 9-11 chữ số
        IF INSERTING OR UPDATING THEN
            IF NOT REGEXP_LIKE(:NEW.SDT, '^[0-9]{9,11}$') THEN
                RAISE_APPLICATION_ERROR(-20013,
                    'LỖI: Số điện thoại [' || :NEW.SDT || '] không hợp lệ! Chỉ chứa 9-11 chữ số.');
            END IF;
        END IF;

        -- [2] Chặn xóa khách hàng đang có lịch hẹn chưa xử lý
        IF DELETING THEN
            SELECT COUNT(*) INTO v_count
            FROM   LICH_HEN
            WHERE  MAKH = :OLD.MAKH AND TRANGTHAI = N'Mới';

            IF v_count > 0 THEN
                RAISE_APPLICATION_ERROR(-20011,
                    'LỖI: Không thể xóa KH [' || :OLD.MAKH || '] - Đang có '
                    || v_count || ' lịch hẹn chưa xử lý!');
            END IF;
        END IF;
    END BEFORE EACH ROW;

END TRG_MEGA_KHACH_HANG;
/


-- =====================================================
-- MEGA-TRIGGER 3: TRG_MEGA_HO_SO_THI_LUC
-- Bảng: HO_SO_THI_LUC
-- Gom: Phân quyền Bác sĩ (INSERT/UPDATE) + Chặn tự khám (INSERT) + Audit Trail CDC (UPDATE KETLUAN)
-- Thay thế triggers cũ: TRG_CHECK_BS_HOSO + TRG_ANTI_SELF_EXAM + TRG_AUDIT_KETLUAN
-- Điểm đặc biệt: Dùng cả BEFORE (validate) lẫn AFTER (audit log) trong cùng 1 trigger
-- =====================================================

CREATE OR REPLACE TRIGGER TRG_MEGA_HO_SO_THI_LUC
FOR INSERT OR UPDATE ON HO_SO_THI_LUC
COMPOUND TRIGGER

    v_tencv  CHUC_VU.TENCV%TYPE;
    v_tk_ns  VARCHAR2(10);
    v_tk_kh  VARCHAR2(10);

    -- ── BEFORE EACH ROW: Validate quyền hạn và nghiệp vụ ──────────────────────
    BEFORE EACH ROW IS
    BEGIN
        -- [1] Phân quyền: Chỉ Bác sĩ mới được lập/sửa hồ sơ khám
        SELECT cv.TENCV INTO v_tencv
        FROM   NHAN_SU ns JOIN CHUC_VU cv ON ns.MACV = cv.MACV
        WHERE  ns.MANS = :NEW.MANS;

        IF v_tencv != N'Bác sĩ' THEN
            RAISE_APPLICATION_ERROR(-20001,
                'LỖI: Nhân sự [' || :NEW.MANS || '] không có quyền lập Hồ Sơ Khám! '
                || '(Chức vụ hiện tại: ' || v_tencv || ')');
        END IF;

        -- [2] Anti-self-exam: Bác sĩ không được tự khám cho bản thân
        IF INSERTING THEN
            SELECT MATK INTO v_tk_ns FROM NHAN_SU WHERE MANS = :NEW.MANS;
            BEGIN
                SELECT ns.MATK INTO v_tk_kh
                FROM   NHAN_SU ns JOIN KHACH_HANG kh ON ns.CCCD = kh.CCCD
                WHERE  kh.MAKH = :NEW.MAKH;

                IF v_tk_ns = v_tk_kh THEN
                    RAISE_APPLICATION_ERROR(-20012,
                        'LỖI: Bác sĩ [' || :NEW.MANS || '] không được tự lập hồ sơ khám cho bản thân!');
                END IF;
            EXCEPTION
                WHEN NO_DATA_FOUND THEN NULL; -- Khách hàng thông thường, không phải nhân viên → OK
            END;
        END IF;
    END BEFORE EACH ROW;

    -- ── AFTER EACH ROW: Ghi Audit Log sau khi dữ liệu đã được cập nhật ─────────
    AFTER EACH ROW IS
    BEGIN
        -- [3] CDC Audit Trail: Ghi vết mỗi khi KETLUAN bị thay đổi
        --     Dùng AFTER để đảm bảo chỉ ghi log khi UPDATE thực sự thành công
        IF UPDATING('KETLUAN') AND
           (    :OLD.KETLUAN IS NULL AND :NEW.KETLUAN IS NOT NULL
             OR :OLD.KETLUAN IS NOT NULL AND :NEW.KETLUAN IS NULL
             OR :OLD.KETLUAN != :NEW.KETLUAN )
        THEN
            INSERT INTO AUDIT_HOSO_THILUC (
                MAAUDIT, MAHOSO, OLD_KETLUAN, NEW_KETLUAN, THOI_GIAN, NGUOI_THUC_HIEN
            ) VALUES (
                'AUD_' || :OLD.MAHOSO || '_' || TO_CHAR(SYSTIMESTAMP, 'YYYYMMDDHH24MISS'),
                :OLD.MAHOSO,
                :OLD.KETLUAN,
                :NEW.KETLUAN,
                SYSTIMESTAMP,
                USER
            );
        END IF;
    END AFTER EACH ROW;

END TRG_MEGA_HO_SO_THI_LUC;
/


-- =====================================================
-- MEGA-TRIGGER 4: TRG_MEGA_HOA_DON
-- Bảng: HOA_DON
-- Gom: Phân quyền Thu ngân/Quản lý (INSERT/UPDATE) + Khóa hóa đơn đã TT (UPDATE/DELETE)
-- Thay thế triggers cũ: TRG_CHECK_THUNGAN_HOADON + TRG_LOCK_HOADON
-- =====================================================

CREATE OR REPLACE TRIGGER TRG_MEGA_HOA_DON
FOR INSERT OR UPDATE OR DELETE ON HOA_DON
COMPOUND TRIGGER

    v_tencv CHUC_VU.TENCV%TYPE;

    -- ── BEFORE EACH ROW ─────────────────────────────────────────────────────────
    BEFORE EACH ROW IS
    BEGIN
        -- [1] Phân quyền: Chỉ Thu ngân hoặc Quản lý mới được tạo/sửa hóa đơn
        IF INSERTING OR UPDATING THEN
            SELECT cv.TENCV INTO v_tencv
            FROM   NHAN_SU ns JOIN CHUC_VU cv ON ns.MACV = cv.MACV
            WHERE  ns.MANS = :NEW.MANS;

            IF v_tencv NOT IN (N'Thu ngân', N'Quản lý') THEN
                RAISE_APPLICATION_ERROR(-20003,
                    'LỖI: Nhân sự [' || :NEW.MANS || '] không có quyền lập Hóa Đơn! '
                    || '(Chức vụ hiện tại: ' || v_tencv || ')');
            END IF;
        END IF;

        -- [2] Bảo toàn hóa đơn: Chặn mọi thay đổi/xóa khi đã thanh toán xong
        IF UPDATING OR DELETING THEN
            IF :OLD.TRANGTHAI = N'Đã thanh toán' THEN
                RAISE_APPLICATION_ERROR(-20007,
                    'LỖI: Hóa đơn [' || :OLD.MAHD || '] đã thanh toán - không thể '
                    || CASE WHEN UPDATING THEN 'chỉnh sửa' ELSE 'xóa' END || '!');
            END IF;
        END IF;
    END BEFORE EACH ROW;

END TRG_MEGA_HOA_DON;
/


-- =====================================================
-- MEGA-TRIGGER 5: TRG_MEGA_CT_HOA_DON
-- Bảng: CT_HOA_DON (Chi tiết hóa đơn - bảng nghiệp vụ TRỌNG YẾU nhất)
<<<<<<< HEAD
-- Gom: Validate tồn kho + hạn SD (BEFORE) + Trừ kho + Cộng tổng tiền (AFTER)
-- Thay thế triggers cũ: TRG_LOGIC_CT_HOA_DON + TRG_UPDATE_KHO_BAN + TRG_SUM_HOADON
-- FIX: Phân biệt INSERTING vs UPDATING để tính delta kho và TONGTIEN chính xác
--      INSERT → trừ :NEW.SOLUONG
--      UPDATE → hoàn :OLD.SOLUONG rồi trừ :NEW.SOLUONG (delta = NEW - OLD)
=======
-- Gom: Validate tồn kho + hạn SD (BEFORE INSERT) + Trừ kho + Cộng tổng tiền (AFTER INSERT)
-- Thay thế triggers cũ: TRG_LOGIC_CT_HOA_DON + TRG_UPDATE_KHO_BAN + TRG_SUM_HOADON
-- Điểm đặc biệt: Dùng 1 SELECT duy nhất lấy cả SOLUONGTON lẫn NGAYHETHAN → tối ưu I/O
>>>>>>> 0cc05dc62a48c3006a19bcceb8ffb68da2f71f51
-- =====================================================

CREATE OR REPLACE TRIGGER TRG_MEGA_CT_HOA_DON
FOR INSERT OR UPDATE ON CT_HOA_DON
COMPOUND TRIGGER

<<<<<<< HEAD
    v_ton    LO_HANG.SOLUONGTON%TYPE;
    v_hsd    LO_HANG.NGAYHETHAN%TYPE;
    v_tensp  SAN_PHAM.TENSP%TYPE;
    -- v_ton đọc từ DB TRƯỚC khi trừ → cần tính tồn kho thực (đã hoàn OLD nếu UPDATE)
    v_ton_effective NUMBER;
=======
    -- Biến cache thông tin lô hàng (SELECT 1 lần, dùng cho cả BEFORE lẫn AFTER)
    v_ton     LO_HANG.SOLUONGTON%TYPE;
    v_hsd     LO_HANG.NGAYHETHAN%TYPE;
    v_tensp   SAN_PHAM.TENSP%TYPE;
>>>>>>> 0cc05dc62a48c3006a19bcceb8ffb68da2f71f51

    -- ── BEFORE EACH ROW: Validate toàn bộ điều kiện an toàn ────────────────────
    BEFORE EACH ROW IS
    BEGIN
<<<<<<< HEAD
        -- 1 SELECT lấy đủ thông tin lô hàng (tối ưu I/O)
=======
        -- 1 SELECT duy nhất lấy đủ dữ liệu cần thiết (giảm I/O so với 2 trigger riêng lẻ)
>>>>>>> 0cc05dc62a48c3006a19bcceb8ffb68da2f71f51
        SELECT lh.SOLUONGTON, lh.NGAYHETHAN, sp.TENSP
        INTO   v_ton, v_hsd, v_tensp
        FROM   LO_HANG lh JOIN SAN_PHAM sp ON lh.MASP = sp.MASP
        WHERE  lh.MALO = :NEW.MALO;

        -- [1] Chặn bán hàng hết hạn sử dụng
        IF v_hsd < SYSDATE THEN
            RAISE_APPLICATION_ERROR(-20006,
<<<<<<< HEAD
                'LỖI: Lô [' || :NEW.MALO || '] - "' || v_tensp
                || '" đã hết hạn ngày ' || TO_CHAR(v_hsd, 'DD/MM/YYYY') || '!');
        END IF;

        -- [2] Chặn số lượng âm hoặc bằng 0
        IF :NEW.SOLUONG <= 0 THEN
            RAISE_APPLICATION_ERROR(-20014, 'LỖI: Số lượng bán phải lớn hơn 0!');
        END IF;

        -- [3] Chặn bán vượt tồn kho
        --     Khi UPDATE: tồn kho "hiệu dụng" = tồn hiện tại + OLD.SOLUONG (vì AFTER sẽ hoàn lại)
        --     Khi INSERT: tồn hiệu dụng = tồn hiện tại (chưa có giao dịch nào)
        IF UPDATING THEN
            v_ton_effective := v_ton + :OLD.SOLUONG;
        ELSE
            v_ton_effective := v_ton;
        END IF;

        IF :NEW.SOLUONG > v_ton_effective THEN
            RAISE_APPLICATION_ERROR(-20005,
                'LỖI: Lô [' || :NEW.MALO || '] - "' || v_tensp
                || '" không đủ hàng! Yêu cầu: ' || :NEW.SOLUONG
                || ' | Tồn kho hiệu dụng: ' || v_ton_effective);
        END IF;
    END BEFORE EACH ROW;

    -- ── AFTER EACH ROW: Cập nhật kho và tổng tiền ──────────────────────────────
    AFTER EACH ROW IS
    BEGIN
        IF INSERTING THEN
            -- [4a] INSERT: trừ thẳng số lượng mới
            UPDATE LO_HANG
            SET    SOLUONGTON = SOLUONGTON - :NEW.SOLUONG
            WHERE  MALO = :NEW.MALO;

            -- [5a] INSERT: cộng thêm thành tiền mới vào hóa đơn
            UPDATE HOA_DON
            SET    TONGTIEN = NVL(TONGTIEN, 0) + (:NEW.SOLUONG * :NEW.DONGIA)
            WHERE  MAHD = :NEW.MAHD;

        ELSIF UPDATING THEN
            -- [4b] UPDATE: hoàn lại OLD rồi trừ NEW → net delta = NEW - OLD
            UPDATE LO_HANG
            SET    SOLUONGTON = SOLUONGTON + :OLD.SOLUONG - :NEW.SOLUONG
            WHERE  MALO = :NEW.MALO;

            -- [5b] UPDATE: trừ thành tiền cũ, cộng thành tiền mới
            --      Xử lý cả trường hợp đổi DONGIA lẫn đổi SOLUONG
            UPDATE HOA_DON
            SET    TONGTIEN = NVL(TONGTIEN, 0)
                              - (:OLD.SOLUONG * :OLD.DONGIA)
                              + (:NEW.SOLUONG * :NEW.DONGIA)
            WHERE  MAHD = :NEW.MAHD;
        END IF;
=======
                'LỖI: Lô [' || :NEW.MALO || '] - Sản phẩm "' || v_tensp
                || '" đã hết hạn ngày ' || TO_CHAR(v_hsd, 'DD/MM/YYYY') || '!');
        END IF;

        -- [2] Chặn bán vượt tồn kho
        IF :NEW.SOLUONG > v_ton THEN
            RAISE_APPLICATION_ERROR(-20005,
                'LỖI: Lô [' || :NEW.MALO || '] - "' || v_tensp
                || '" không đủ hàng! Yêu cầu: ' || :NEW.SOLUONG
                || ' | Tồn kho: ' || v_ton);
        END IF;

        -- [3] Chặn số lượng âm hoặc bằng 0
        IF :NEW.SOLUONG <= 0 THEN
            RAISE_APPLICATION_ERROR(-20014,
                'LỖI: Số lượng bán phải lớn hơn 0!');
        END IF;
    END BEFORE EACH ROW;

    -- ── AFTER EACH ROW: Cập nhật kho và tổng tiền sau khi row đã commit ────────
    AFTER EACH ROW IS
    BEGIN
        -- [4] Tự động trừ kho của lô hàng tương ứng
        UPDATE LO_HANG
        SET    SOLUONGTON = SOLUONGTON - :NEW.SOLUONG
        WHERE  MALO = :NEW.MALO;

        -- [5] Tự động cộng dồn tổng tiền vào hóa đơn
        UPDATE HOA_DON
        SET    TONGTIEN = NVL(TONGTIEN, 0) + (:NEW.SOLUONG * :NEW.DONGIA)
        WHERE  MAHD = :NEW.MAHD;
>>>>>>> 0cc05dc62a48c3006a19bcceb8ffb68da2f71f51
    END AFTER EACH ROW;

END TRG_MEGA_CT_HOA_DON;
/


-- =====================================================
-- MEGA-TRIGGER 6: TRG_MEGA_PHIEU_NHAP  [TRIGGER MỚI]
-- Bảng: PHIEU_NHAP
-- Gom: Phân quyền Thủ kho/Quản lý + Tự động cập nhật TONGTIEN phiếu nhập
--      khi chi tiết lô hàng được thêm vào
-- Thay thế triggers cũ: TRG_CHECK_THUKHO_PHIEUNHAP
-- Mở rộng: Thêm logic tính tổng tiền phiếu nhập tự động từ LO_HANG
-- =====================================================

CREATE OR REPLACE TRIGGER TRG_MEGA_PHIEU_NHAP
FOR INSERT OR UPDATE ON PHIEU_NHAP
COMPOUND TRIGGER

    v_tencv CHUC_VU.TENCV%TYPE;

    -- ── BEFORE EACH ROW ─────────────────────────────────────────────────────────
    BEFORE EACH ROW IS
    BEGIN
        -- [1] Phân quyền: Chỉ Thủ kho hoặc Quản lý mới được tạo phiếu nhập
        SELECT cv.TENCV INTO v_tencv
        FROM   NHAN_SU ns JOIN CHUC_VU cv ON ns.MACV = cv.MACV
        WHERE  ns.MANS = :NEW.MANS;

        IF v_tencv NOT IN (N'Thủ kho', N'Quản lý') THEN
            RAISE_APPLICATION_ERROR(-20004,
                'LỖI: Nhân sự [' || :NEW.MANS || '] không có quyền lập Phiếu Nhập! '
                || '(Chức vụ hiện tại: ' || v_tencv || ')');
        END IF;

        -- [2] Chặn sửa/xóa phiếu nhập đã hoàn tất (có lô hàng đang được bán)
        IF UPDATING THEN
            DECLARE
                v_lo_daban NUMBER;
            BEGIN
                SELECT COUNT(*) INTO v_lo_daban
                FROM   LO_HANG lh
                WHERE  lh.MAPN = :OLD.MAPN
                  AND  lh.SOLUONGTON < lh.SOLUONGNHAP; -- Lô đã bị trừ hàng = đã có giao dịch
                IF v_lo_daban > 0 THEN
                    RAISE_APPLICATION_ERROR(-20015,
                        'LỖI: Phiếu nhập [' || :OLD.MAPN || '] đã có '
                        || v_lo_daban || ' lô hàng đang giao dịch - không thể sửa!');
                END IF;
            END;
        END IF;
    END BEFORE EACH ROW;

    -- ── AFTER EACH ROW: Đồng bộ TONGTIEN từ các lô hàng thực tế ───────────────
    AFTER EACH ROW IS
    BEGIN
        -- [3] Tự động tính lại TONGTIEN phiếu nhập dựa trên tổng giá trị các lô
        --     Dùng SELECT SUM thay vì cộng dồn để đảm bảo tính chính xác tuyệt đối
        UPDATE PHIEU_NHAP
        SET    TONGTIEN = (
                   SELECT NVL(SUM(SOLUONGNHAP * GIANHAP), 0)
                   FROM   LO_HANG
                   WHERE  MAPN = :NEW.MAPN
               )
        WHERE  MAPN = :NEW.MAPN;
    END AFTER EACH ROW;

END TRG_MEGA_PHIEU_NHAP;
/


-- =====================================================
-- MEGA-TRIGGER 7: TRG_MEGA_THANH_TOAN  [TRIGGER MỚI]
-- Bảng: THANH_TOAN
-- Gom: Validate số tiền + Chặn thanh toán trùng + Tự động cập nhật trạng thái HD
-- Logic mới hoàn toàn - không có trigger nào tương đương trước đây
-- =====================================================

CREATE OR REPLACE TRIGGER TRG_MEGA_THANH_TOAN
FOR INSERT OR UPDATE ON THANH_TOAN
COMPOUND TRIGGER

    v_tong_hd       NUMBER;
    v_da_thanhtoan  NUMBER;
    v_trangthai_hd  NVARCHAR2(50);

    -- ── BEFORE EACH ROW: Validate toàn bộ điều kiện thanh toán ─────────────────
    BEFORE EACH ROW IS
    BEGIN
        -- Đọc trạng thái và tổng tiền hóa đơn 1 lần duy nhất
        SELECT TONGTIEN, TRANGTHAI
        INTO   v_tong_hd, v_trangthai_hd
        FROM   HOA_DON
        WHERE  MAHD = :NEW.MAHD;

        -- [1] Chặn thanh toán cho hóa đơn đã thanh toán rồi
        IF v_trangthai_hd = N'Đã thanh toán' THEN
            RAISE_APPLICATION_ERROR(-20016,
                'LỖI: Hóa đơn [' || :NEW.MAHD || '] đã được thanh toán trước đó!');
        END IF;

        -- [2] Chặn thanh toán cho hóa đơn đã bị hủy
        IF v_trangthai_hd = N'Đã hủy' THEN
            RAISE_APPLICATION_ERROR(-20017,
                'LỖI: Hóa đơn [' || :NEW.MAHD || '] đã bị hủy, không thể thanh toán!');
        END IF;

        -- [3] Chặn số tiền vượt tổng hóa đơn
        IF :NEW.SOTIEN > v_tong_hd THEN
            RAISE_APPLICATION_ERROR(-20008,
                'LỖI: Số tiền thanh toán (' || :NEW.SOTIEN
                || ') vượt quá tổng hóa đơn (' || v_tong_hd || ')!');
        END IF;

        -- [4] Chặn số tiền âm hoặc bằng 0
        IF :NEW.SOTIEN <= 0 THEN
            RAISE_APPLICATION_ERROR(-20018,
                'LỖI: Số tiền thanh toán phải lớn hơn 0!');
        END IF;

        -- [5] Kiểm tra tổng tiền đã thanh toán trước đó (chặn thanh toán trùng lặp)
        SELECT NVL(SUM(SOTIEN), 0) INTO v_da_thanhtoan
        FROM   THANH_TOAN
        WHERE  MAHD = :NEW.MAHD AND TRANGTHAI = N'Thành công';

        IF v_da_thanhtoan + :NEW.SOTIEN > v_tong_hd THEN
            RAISE_APPLICATION_ERROR(-20019,
                'LỖI: Tổng tiền thanh toán (' || (v_da_thanhtoan + :NEW.SOTIEN)
                || ') vượt quá giá trị hóa đơn (' || v_tong_hd || ')! '
                || 'Đã thanh toán trước: ' || v_da_thanhtoan);
        END IF;
    END BEFORE EACH ROW;

    -- ── AFTER EACH ROW: Tự động cập nhật trạng thái Hóa Đơn ───────────────────
    AFTER EACH ROW IS
    BEGIN
        -- [6] Nếu thanh toán thành công và đủ số tiền → tự động chốt hóa đơn
        --     Đây là "cầu nối" giữa bảng THANH_TOAN và HOA_DON, không cần SP can thiệp
        IF :NEW.TRANGTHAI = N'Thành công' THEN
            UPDATE HOA_DON
            SET    TRANGTHAI = N'Đã thanh toán'
            WHERE  MAHD = :NEW.MAHD
              AND  TONGTIEN <= :NEW.SOTIEN; -- Chỉ chốt khi số tiền thanh toán >= tổng hóa đơn
        END IF;
    END AFTER EACH ROW;

END TRG_MEGA_THANH_TOAN;
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

<<<<<<< HEAD
    -- Bước 2: Chỉ INSERT vào THANH_TOAN.
    --         TRG_MEGA_THANH_TOAN (AFTER EACH ROW) sẽ tự động UPDATE HOA_DON.TRANGTHAI
    --         → tránh duplicate logic giữa SP và trigger
    INSERT INTO THANH_TOAN (MATT, MAHD, NGAYTHANHTOAN, SOTIEN, PHUONGTHUC, TRANGTHAI)
    VALUES (p_matt, p_mahd, SYSTIMESTAMP, v_tongtien, p_phuong_thuc, N'Thành công');

    -- Bước 3: Sinh Phiếu Xuất Kho (trigger không cover bước này → SP vẫn cần xử lý)
=======
    -- Bước 2: Cập nhật trạng thái hóa đơn
    -- (Trigger TRG_LOCK_HOADON sẽ khóa hóa đơn này sau bước này)
    UPDATE HOA_DON
    SET    TRANGTHAI = N'Đã thanh toán'
    WHERE  MAHD = p_mahd;

    -- Bước 3: Ghi nhận dòng tiền vào THANH_TOAN
    INSERT INTO THANH_TOAN (MATT, MAHD, NGAYTHANHTOAN, SOTIEN, PHUONGTHUC, TRANGTHAI)
    VALUES (p_matt, p_mahd, SYSTIMESTAMP, v_tongtien, p_phuong_thuc, N'Thành công');

    -- Bước 4: Tự động sinh Phiếu Xuất Kho
>>>>>>> 0cc05dc62a48c3006a19bcceb8ffb68da2f71f51
    v_mapx := 'PX_' || p_mahd;
    INSERT INTO PHIEU_XUAT (MAPX, MAHD, MANS, NGAYXUAT)
    VALUES (v_mapx, p_mahd, p_mans_xuat, SYSTIMESTAMP);

<<<<<<< HEAD
    -- Bước 4: Copy CT_HOA_DON → CT_PHIEU_XUAT
=======
    -- Bước 5: Copy toàn bộ dòng CT_HOA_DON sang CT_PHIEU_XUAT
>>>>>>> 0cc05dc62a48c3006a19bcceb8ffb68da2f71f51
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
<<<<<<< HEAD
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
=======
-- END OF V1__Initial_Setup.sql
-- ============================================================
>>>>>>> 0cc05dc62a48c3006a19bcceb8ffb68da2f71f51
