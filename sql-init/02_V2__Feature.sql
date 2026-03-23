-- FILE   : V2Feature.sql
-- FLYWAY : Version 2 - Bổ sung chức năng thiếu so với spec
-- ============================================================
-- Danh sách bổ sung:
--   [G1] GIO_HANG + CT_GIO_HANG          ← E-commerce giỏ hàng
--   [G2] DANH_GIA                         ← Rating & Feedback bác sĩ
--   [G3] GOI_KHAM + LICH_HEN.MAGOI        ← Gói dịch vụ khám
--   [G4] LICH_HEN.TRIEU_CHUNG             ← Triệu chứng tiền khám
--   [G5] LICH_LAM_VIEC                    ← Lịch trống bác sĩ
--   [G6] HANG_CHO                         ← Queue walk-in vs online
--   [G7] DICH_VU_KHAM + CT_HOA_DON_DV    ← Phí dịch vụ khám
--   [G8] SAN_PHAM.TON_KHO_TOI_THIEU      ← Cảnh báo tồn kho min
--   [G9] LICH_SU_DIEM + KHUYEN_MAI        ← Loyalty & khuyến mãi
-- ============================================================


-- ============================================================
-- [G1] GIỎ HÀNG — E-COMMERCE
-- Khách hàng thêm sản phẩm vào giỏ, chưa đặt lịch hay thanh toán
-- ============================================================

CREATE TABLE GIO_HANG (
    MAGH      VARCHAR2(10)  PRIMARY KEY,
    MAKH      VARCHAR2(10)  NOT NULL,
    NGAYTAO   TIMESTAMP     DEFAULT SYSTIMESTAMP,
    TRANG_THAI NVARCHAR2(20) DEFAULT N'Đang dùng',  -- Đang dùng | Đã đặt | Đã hủy
    CONSTRAINT FK_GH_KH FOREIGN KEY (MAKH) REFERENCES KHACH_HANG(MAKH)
);

CREATE TABLE CT_GIO_HANG (
    MAGH      VARCHAR2(10),
    MASP      VARCHAR2(10),
    SOLUONG   NUMBER        NOT NULL,
    GIA_TAI_THOI_DIEM NUMBER(15,2),  -- Snapshot giá lúc thêm vào giỏ (giá có thể thay đổi)
    NGAY_THEM TIMESTAMP     DEFAULT SYSTIMESTAMP,
    CONSTRAINT PK_CTGH    PRIMARY KEY (MAGH, MASP),
    CONSTRAINT FK_CTGH_GH FOREIGN KEY (MAGH) REFERENCES GIO_HANG(MAGH),
    CONSTRAINT FK_CTGH_SP FOREIGN KEY (MASP) REFERENCES SAN_PHAM(MASP)
);

-- Sequence cho giỏ hàng
CREATE SEQUENCE SEQ_GIO_HANG START WITH 1 INCREMENT BY 1 CACHE 20 NOCYCLE;

-- Trigger sinh MAGH tự động
CREATE OR REPLACE TRIGGER TRG_GEN_MAGH
BEFORE INSERT ON GIO_HANG
FOR EACH ROW
BEGIN
    IF :NEW.MAGH IS NULL THEN
        :NEW.MAGH := 'GH' || LPAD(SEQ_GIO_HANG.NEXTVAL, 6, '0');
    END IF;
END;
/

-- Index
CREATE INDEX IDX_GH_MAKH  ON GIO_HANG (MAKH);
CREATE INDEX IDX_GH_TRANG ON GIO_HANG (TRANG_THAI);


-- ============================================================
-- [G2] ĐÁNH GIÁ & RATING BÁC SĨ
-- Bệnh nhân đánh giá sau mỗi lần khám
-- ============================================================

CREATE TABLE DANH_GIA (
    MADG      VARCHAR2(10)  PRIMARY KEY,
    MAHOSO    VARCHAR2(10)  NOT NULL,    -- Gắn với lần khám cụ thể
    MAKH      VARCHAR2(10)  NOT NULL,    -- Người đánh giá
    MANS      VARCHAR2(10)  NOT NULL,    -- Bác sĩ được đánh giá
    SO_SAO    NUMBER(1)     NOT NULL,    -- 1–5
    NOI_DUNG  NVARCHAR2(500),           -- Nhận xét (tùy chọn)
    NGAY_DG   TIMESTAMP     DEFAULT SYSTIMESTAMP,
    IS_HIDDEN NUMBER(1)     DEFAULT 0,  -- 0: hiển thị | 1: ẩn (admin ẩn bình luận vi phạm)
    CONSTRAINT PK_DG       PRIMARY KEY (MADG),
    CONSTRAINT FK_DG_HS    FOREIGN KEY (MAHOSO) REFERENCES HO_SO_THI_LUC(MAHOSO),
    CONSTRAINT FK_DG_KH    FOREIGN KEY (MAKH)   REFERENCES KHACH_HANG(MAKH),
    CONSTRAINT FK_DG_NS    FOREIGN KEY (MANS)   REFERENCES NHAN_SU(MANS),
    CONSTRAINT CK_DG_SAO   CHECK (SO_SAO BETWEEN 1 AND 5),
    -- Mỗi hồ sơ khám chỉ được đánh giá 1 lần
    CONSTRAINT UK_DG_MAHOSO UNIQUE (MAHOSO)
);

CREATE SEQUENCE SEQ_DANH_GIA START WITH 1 INCREMENT BY 1 CACHE 20 NOCYCLE;

CREATE OR REPLACE TRIGGER TRG_GEN_MADG
BEFORE INSERT ON DANH_GIA
FOR EACH ROW
BEGIN
    IF :NEW.MADG IS NULL THEN
        :NEW.MADG := 'DG' || LPAD(SEQ_DANH_GIA.NEXTVAL, 6, '0');
    END IF;
END;
/

-- View tính rating trung bình mỗi bác sĩ (dùng trong API bác sĩ)
CREATE OR REPLACE VIEW V_RATING_BAC_SI AS
SELECT
    ns.MANS,
    ns.HOTEN,
    ns.CHUYENKHOA,
    COUNT(dg.MADG)          AS TONG_LUOT_DANH_GIA,
    ROUND(AVG(dg.SO_SAO),1) AS RATING_TRUNG_BINH
FROM NHAN_SU ns
LEFT JOIN DANH_GIA dg ON ns.MANS = dg.MANS AND dg.IS_HIDDEN = 0
WHERE ns.IS_DELETED = 0
GROUP BY ns.MANS, ns.HOTEN, ns.CHUYENKHOA;

CREATE INDEX IDX_DG_MANS  ON DANH_GIA (MANS);
CREATE INDEX IDX_DG_MAKH  ON DANH_GIA (MAKH);


-- ============================================================
-- [G3] GÓI DỊCH VỤ KHÁM
-- Booking bước 3: KH chọn gói khám (tổng quát, đo khúc xạ...)
-- ============================================================

CREATE TABLE GOI_KHAM (
    MAGOI     VARCHAR2(10)  PRIMARY KEY,
    TENGOI    NVARCHAR2(100) NOT NULL,
    MOTA      NVARCHAR2(500),
    GIA       NUMBER(15,2)  NOT NULL,
    THOILUONG NUMBER        DEFAULT 30,  -- Phút — dùng để tính slot lịch trống
    IS_ACTIVE NUMBER(1)     DEFAULT 1    -- 1: đang cung cấp | 0: ngừng
);

-- Liên kết LICH_HEN với gói khám và thêm triệu chứng [G4]
ALTER TABLE LICH_HEN ADD (
    MAGOI      VARCHAR2(10)  NULL,           -- [G3] Gói khám đã chọn
    TRIEU_CHUNG NVARCHAR2(500) NULL,         -- [G4] Triệu chứng KH nhập trước khi đặt
    LOAI_LICH  NVARCHAR2(20) DEFAULT N'Online', -- Walk-in | Online
    GIO_HEN    TIMESTAMP     NULL            -- Giờ hẹn cụ thể (khác NGAYHEN chỉ lưu ngày)
);

ALTER TABLE LICH_HEN ADD CONSTRAINT FK_LH_GOI
    FOREIGN KEY (MAGOI) REFERENCES GOI_KHAM(MAGOI);

-- Seed dữ liệu gói khám mẫu
INSERT INTO GOI_KHAM (MAGOI, TENGOI, MOTA, GIA, THOILUONG) VALUES
('GOI01', N'Khám tổng quát mắt',   N'Kiểm tra thị lực tổng quát, áp nhãn cầu',        150000, 30);
INSERT INTO GOI_KHAM (MAGOI, TENGOI, MOTA, GIA, THOILUONG) VALUES
('GOI02', N'Đo khúc xạ cắt kính',  N'Đo độ cận/viễn/loạn, tư vấn thông số kính',      200000, 45);
INSERT INTO GOI_KHAM (MAGOI, TENGOI, MOTA, GIA, THOILUONG) VALUES
('GOI03', N'Khám chuyên sâu',      N'Soi đáy mắt, đo OCT, chẩn đoán bệnh lý võng mạc',450000, 60);
INSERT INTO GOI_KHAM (MAGOI, TENGOI, MOTA, GIA, THOILUONG) VALUES
('GOI04', N'Tư vấn kính áp tròng', N'Tư vấn và thử kính áp tròng phù hợp',             100000, 30);
COMMIT;


-- ============================================================
-- [G5] LỊCH LÀM VIỆC BÁC SĨ
-- Booking bước 4: slot trống = LICH_LAM_VIEC trừ LICH_HEN đã book
-- ============================================================

CREATE TABLE LICH_LAM_VIEC (
    MALLV        VARCHAR2(10)  PRIMARY KEY,
    MANS         VARCHAR2(10)  NOT NULL,
    NGAY_LAM     DATE          NOT NULL,
    GIO_BAT_DAU  NUMBER(4,2)   NOT NULL,   -- VD: 8.0 = 8:00, 13.5 = 13:30
    GIO_KET_THUC NUMBER(4,2)   NOT NULL,
    IS_NGHI      NUMBER(1)     DEFAULT 0,  -- 1: nghỉ đột xuất (override lịch thường)
    CONSTRAINT FK_LLV_NS   FOREIGN KEY (MANS) REFERENCES NHAN_SU(MANS),
    CONSTRAINT CK_LLV_GIO  CHECK (GIO_KET_THUC > GIO_BAT_DAU)
);

CREATE SEQUENCE SEQ_LICH_LAM_VIEC START WITH 1 INCREMENT BY 1 CACHE 10 NOCYCLE;

CREATE OR REPLACE TRIGGER TRG_GEN_MALLV
BEFORE INSERT ON LICH_LAM_VIEC
FOR EACH ROW
BEGIN
    IF :NEW.MALLV IS NULL THEN
        :NEW.MALLV := 'LV' || LPAD(SEQ_LICH_LAM_VIEC.NEXTVAL, 6, '0');
    END IF;
END;
/

-- View slot còn trống theo ngày (Spring Boot dùng để render lịch booking)
CREATE OR REPLACE VIEW V_SLOT_TRONG AS
SELECT
    llv.MANS,
    ns.HOTEN     AS TEN_BAC_SI,
    llv.NGAY_LAM,
    llv.GIO_BAT_DAU,
    llv.GIO_KET_THUC,
    goi.THOILUONG,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM LICH_HEN lh
            WHERE lh.MANS     = llv.MANS
              AND lh.GIO_HEN  IS NOT NULL
              AND TRUNC(lh.GIO_HEN) = llv.NGAY_LAM
              AND EXTRACT(HOUR FROM lh.GIO_HEN) + EXTRACT(MINUTE FROM lh.GIO_HEN)/60
                  BETWEEN llv.GIO_BAT_DAU AND llv.GIO_KET_THUC - NVL(goi.THOILUONG,30)/60.0
              AND lh.TRANGTHAI != N'Đã hủy'
        ) THEN N'Đã đặt'
        ELSE N'Còn trống'
    END AS TRANG_THAI_SLOT
FROM LICH_LAM_VIEC llv
JOIN NHAN_SU ns ON llv.MANS = ns.MANS
LEFT JOIN LICH_HEN lh2 ON llv.MANS = lh2.MANS
LEFT JOIN GOI_KHAM goi ON lh2.MAGOI = goi.MAGOI
WHERE llv.IS_NGHI = 0
  AND llv.NGAY_LAM >= TRUNC(SYSDATE)
  AND ns.IS_DELETED = 0;

CREATE INDEX IDX_LLV_MANS ON LICH_LAM_VIEC (MANS);
CREATE INDEX IDX_LLV_NGAY ON LICH_LAM_VIEC (NGAY_LAM);


-- ============================================================
-- [G6] HÀNG CHỜ — QUEUE MANAGEMENT
-- Lễ tân quản lý thứ tự: walk-in ưu tiên bốc số
-- ============================================================

CREATE TABLE HANG_CHO (
    MAHC         VARCHAR2(10)  PRIMARY KEY,
    MAKH         VARCHAR2(10),             -- NULL nếu vãng lai chưa có tài khoản
    TEN_KHACH    NVARCHAR2(100),           -- Tên hiển thị (từ KHACH_HANG hoặc nhập tay)
    SO_THU_TU    NUMBER        NOT NULL,
    LOAI_KHACH   NVARCHAR2(20) DEFAULT N'Walk-in',  -- Walk-in | Online
    MALH         VARCHAR2(10)  NULL,       -- Liên kết lịch hẹn online (nếu có)
    MANS_PHAN_CONG VARCHAR2(10) NULL,      -- Bác sĩ được phân công
    TRANG_THAI   NVARCHAR2(30) DEFAULT N'Đang chờ', -- Đang chờ | Đang khám | Hoàn thành | Bỏ về
    GIO_DANG_KY  TIMESTAMP     DEFAULT SYSTIMESTAMP,
    GIO_VAO_KHAM TIMESTAMP     NULL,
    GHI_CHU      NVARCHAR2(255),
    CONSTRAINT FK_HC_KH FOREIGN KEY (MAKH) REFERENCES KHACH_HANG(MAKH),
    CONSTRAINT FK_HC_LH FOREIGN KEY (MALH) REFERENCES LICH_HEN(MALH),
    CONSTRAINT FK_HC_NS FOREIGN KEY (MANS_PHAN_CONG) REFERENCES NHAN_SU(MANS)
);

CREATE SEQUENCE SEQ_HANG_CHO START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

CREATE OR REPLACE TRIGGER TRG_GEN_MAHC
BEFORE INSERT ON HANG_CHO
FOR EACH ROW
BEGIN
    IF :NEW.MAHC IS NULL THEN
        :NEW.MAHC := 'HC' || LPAD(SEQ_HANG_CHO.NEXTVAL, 6, '0');
    END IF;
    -- Số thứ tự reset theo ngày (bốc số từ 1 mỗi ngày mới)
    IF :NEW.SO_THU_TU IS NULL THEN
        SELECT NVL(MAX(SO_THU_TU), 0) + 1 INTO :NEW.SO_THU_TU
        FROM HANG_CHO
        WHERE TRUNC(GIO_DANG_KY) = TRUNC(SYSDATE);
    END IF;
END;
/

-- View hàng chờ hiện tại hôm nay (cho màn hình lễ tân)
CREATE OR REPLACE VIEW V_HANG_CHO_HOM_NAY AS
SELECT
    hc.MAHC,
    hc.SO_THU_TU,
    hc.LOAI_KHACH,
    NVL(kh.HOTEN, hc.TEN_KHACH) AS TEN_KHACH,
    kh.SDT,
    hc.MANS_PHAN_CONG,
    ns.HOTEN  AS TEN_BAC_SI,
    goi.TENGOI AS GOI_KHAM,
    hc.TRANG_THAI,
    hc.GIO_DANG_KY,
    hc.GIO_VAO_KHAM,
    -- Thời gian chờ (phút)
    ROUND((SYSTIMESTAMP - hc.GIO_DANG_KY) * 24 * 60) AS PHUT_CHO
FROM HANG_CHO hc
LEFT JOIN KHACH_HANG kh ON hc.MAKH  = kh.MAKH
LEFT JOIN NHAN_SU    ns ON hc.MANS_PHAN_CONG = ns.MANS
LEFT JOIN LICH_HEN   lh ON hc.MALH  = lh.MALH
LEFT JOIN GOI_KHAM   goi ON lh.MAGOI = goi.MAGOI
WHERE TRUNC(hc.GIO_DANG_KY) = TRUNC(SYSDATE)
  AND hc.TRANG_THAI NOT IN (N'Hoàn thành', N'Bỏ về')
ORDER BY
    -- Walk-in được ưu tiên trong cùng nhóm thứ tự
    CASE WHEN hc.LOAI_KHACH = N'Walk-in' THEN 0 ELSE 1 END,
    hc.SO_THU_TU;

CREATE INDEX IDX_HC_NGAY  ON HANG_CHO (GIO_DANG_KY);
CREATE INDEX IDX_HC_TRANG ON HANG_CHO (TRANG_THAI);
CREATE INDEX IDX_HC_LOAI  ON HANG_CHO (LOAI_KHACH);


-- ============================================================
-- [G7] DỊCH VỤ KHÁM & PHÍ DỊCH VỤ
-- Thu ngân nhận phí từ phòng khám (khám bệnh) + quầy bán hàng
-- ============================================================

CREATE TABLE DICH_VU_KHAM (
    MADV   VARCHAR2(10)  PRIMARY KEY,
    TENDV  NVARCHAR2(100) NOT NULL,
    GIA    NUMBER(15,2)  NOT NULL,
    MOTA   NVARCHAR2(255),
    IS_ACTIVE NUMBER(1)  DEFAULT 1
);

-- Chi tiết dịch vụ trong hóa đơn (song song với CT_HOA_DON cho sản phẩm)
CREATE TABLE CT_HOA_DON_DV (
    MAHD    VARCHAR2(10),
    MADV    VARCHAR2(10),
    SOLUONG NUMBER        DEFAULT 1,
    DONGIA  NUMBER(15,2),
    CONSTRAINT PK_CTHD_DV    PRIMARY KEY (MAHD, MADV),
    CONSTRAINT FK_CTHD_DV_HD FOREIGN KEY (MAHD) REFERENCES HOA_DON(MAHD),
    CONSTRAINT FK_CTHD_DV_DV FOREIGN KEY (MADV) REFERENCES DICH_VU_KHAM(MADV)
);

-- Trigger cộng TONGTIEN vào HOA_DON khi thêm dịch vụ
CREATE OR REPLACE TRIGGER TRG_CT_HOA_DON_DV
FOR INSERT OR UPDATE OR DELETE ON CT_HOA_DON_DV
COMPOUND TRIGGER
    AFTER EACH ROW IS
    BEGIN
        IF INSERTING THEN
            UPDATE HOA_DON
            SET    TONGTIEN = NVL(TONGTIEN, 0) + (:NEW.SOLUONG * :NEW.DONGIA)
            WHERE  MAHD = :NEW.MAHD;
        ELSIF UPDATING THEN
            UPDATE HOA_DON
            SET    TONGTIEN = NVL(TONGTIEN, 0)
                              - (:OLD.SOLUONG * :OLD.DONGIA)
                              + (:NEW.SOLUONG * :NEW.DONGIA)
            WHERE  MAHD = :NEW.MAHD;
        ELSIF DELETING THEN
            UPDATE HOA_DON
            SET    TONGTIEN = NVL(TONGTIEN, 0) - (:OLD.SOLUONG * :OLD.DONGIA)
            WHERE  MAHD = :OLD.MAHD;
        END IF;
    END AFTER EACH ROW;
END TRG_CT_HOA_DON_DV;
/

-- Seed dịch vụ mẫu
INSERT INTO DICH_VU_KHAM VALUES ('DV01', N'Phí khám tổng quát',   150000, N'Phí khám cơ bản', 1);
INSERT INTO DICH_VU_KHAM VALUES ('DV02', N'Phí đo khúc xạ',       200000, N'Đo và tư vấn kính',1);
INSERT INTO DICH_VU_KHAM VALUES ('DV03', N'Phí soi đáy mắt',      250000, N'Chụp ảnh đáy mắt', 1);
INSERT INTO DICH_VU_KHAM VALUES ('DV04', N'Phí tư vấn kính áp tròng',100000,N'Thử và tư vấn',  1);
COMMIT;

CREATE INDEX IDX_CTHD_DV_MAHD ON CT_HOA_DON_DV (MAHD);


-- ============================================================
-- [G8] TỒN KHO TỐI THIỂU — CẢNH BÁO THỦ KHO
-- ============================================================

ALTER TABLE SAN_PHAM ADD (
    TON_KHO_TOI_THIEU NUMBER DEFAULT 0,     -- Alert khi tổng tồn < ngưỡng này
    DON_VI_TINH_KHO   NVARCHAR2(20) NULL    -- Đơn vị tính trong kho (có thể khác đơn vị bán)
);

-- View cảnh báo tồn kho (Thủ kho dùng hàng ngày)
CREATE OR REPLACE VIEW V_CANH_BAO_TON_KHO AS
SELECT
    sp.MASP,
    sp.TENSP,
    sp.DONVITINH,
    NVL(SUM(lh.SOLUONGTON), 0)  AS TONG_TON_HIEN_TAI,
    sp.TON_KHO_TOI_THIEU,
    CASE
        WHEN NVL(SUM(lh.SOLUONGTON), 0) = 0                          THEN N'Het hang'
        WHEN NVL(SUM(lh.SOLUONGTON), 0) <= sp.TON_KHO_TOI_THIEU      THEN N'Sap het'
        WHEN NVL(SUM(lh.SOLUONGTON), 0) <= sp.TON_KHO_TOI_THIEU * 2  THEN N'Canh bao'
        ELSE                                                               N'On dinh'
    END AS MUC_DO
FROM SAN_PHAM sp
LEFT JOIN LO_HANG lh ON sp.MASP = lh.MASP
                    AND lh.NGAYHETHAN > SYSDATE
                    AND lh.SOLUONGTON > 0
GROUP BY sp.MASP, sp.TENSP, sp.DONVITINH, sp.TON_KHO_TOI_THIEU
HAVING NVL(SUM(lh.SOLUONGTON), 0) <= sp.TON_KHO_TOI_THIEU * 2
    OR NVL(SUM(lh.SOLUONGTON), 0) = 0
ORDER BY MUC_DO, TONG_TON_HIEN_TAI;


-- ============================================================
-- [G9] ĐIỂM TÍCH LŨY — LỊCH SỬ & KHUYẾN MÃI
-- ============================================================

-- Lịch sử cộng/trừ điểm
CREATE TABLE LICH_SU_DIEM (
    MALSD     VARCHAR2(10)  PRIMARY KEY,
    MAKH      VARCHAR2(10)  NOT NULL,
    LOAI      NVARCHAR2(20) NOT NULL,   -- Cong | Tru | Quy_doi
    SO_DIEM   NUMBER        NOT NULL,   -- Dương = cộng, Âm = trừ
    LY_DO     NVARCHAR2(200),
    MAHD      VARCHAR2(10)  NULL,       -- Liên kết hóa đơn nếu có
    THOI_GIAN TIMESTAMP     DEFAULT SYSTIMESTAMP,
    CONSTRAINT FK_LSD_KH FOREIGN KEY (MAKH) REFERENCES KHACH_HANG(MAKH),
    CONSTRAINT FK_LSD_HD FOREIGN KEY (MAHD) REFERENCES HOA_DON(MAHD)
);

CREATE SEQUENCE SEQ_LICH_SU_DIEM START WITH 1 INCREMENT BY 1 CACHE 50 NOCYCLE;

CREATE OR REPLACE TRIGGER TRG_GEN_MALSD
BEFORE INSERT ON LICH_SU_DIEM
FOR EACH ROW
BEGIN
    IF :NEW.MALSD IS NULL THEN
        :NEW.MALSD := 'LS' || LPAD(SEQ_LICH_SU_DIEM.NEXTVAL, 6, '0');
    END IF;
END;
/

-- Khuyến mãi / Voucher
CREATE TABLE KHUYEN_MAI (
    MAKM        VARCHAR2(10)  PRIMARY KEY,
    TENKM       NVARCHAR2(100) NOT NULL,
    LOAI        NVARCHAR2(20) NOT NULL,   -- PhanTram | SoTien | DoiDiem
    GIA_TRI     NUMBER(15,2)  NOT NULL,   -- % hoặc VNĐ hoặc số điểm cần đổi
    GIAM_TOI_DA NUMBER(15,2)  NULL,       -- Giảm tối đa (áp dụng cho loại PhanTram)
    MA_CODE     VARCHAR2(20)  UNIQUE,     -- Code nhập khi checkout
    NGAY_BD     DATE          NOT NULL,
    NGAY_KT     DATE          NOT NULL,
    SO_LUONG    NUMBER        NULL,       -- NULL = không giới hạn
    DA_DUNG     NUMBER        DEFAULT 0,
    DIEU_KIEN   NUMBER(15,2)  DEFAULT 0,  -- Đơn hàng tối thiểu để áp dụng
    IS_ACTIVE   NUMBER(1)     DEFAULT 1,
    CONSTRAINT CK_KM_NGAY CHECK (NGAY_KT >= NGAY_BD)
);

-- Theo dõi voucher nào KH đã dùng
CREATE TABLE KH_KHUYEN_MAI (
    MAKH    VARCHAR2(10),
    MAKM    VARCHAR2(10),
    MAHD    VARCHAR2(10)  NULL,
    NGAY_SD TIMESTAMP     DEFAULT SYSTIMESTAMP,
    CONSTRAINT PK_KH_KM    PRIMARY KEY (MAKH, MAKM),
    CONSTRAINT FK_KHKM_KH  FOREIGN KEY (MAKH) REFERENCES KHACH_HANG(MAKH),
    CONSTRAINT FK_KHKM_KM  FOREIGN KEY (MAKM) REFERENCES KHUYEN_MAI(MAKM),
    CONSTRAINT FK_KHKM_HD  FOREIGN KEY (MAHD) REFERENCES HOA_DON(MAHD)
);

CREATE INDEX IDX_LSD_MAKH ON LICH_SU_DIEM (MAKH);
CREATE INDEX IDX_LSD_MAHD ON LICH_SU_DIEM (MAHD);
CREATE INDEX IDX_KM_CODE  ON KHUYEN_MAI (MA_CODE);
CREATE INDEX IDX_KM_NGAY  ON KHUYEN_MAI (NGAY_BD, NGAY_KT);

-- ============================================================
-- END OF V2__Feature.sql
-- ============================================================
-- [G4] Cập nhật LICH_HEN dùng JSON cho Triệu chứng
ALTER TABLE LICH_HEN MODIFY (
    TRIEU_CHUNG JSON
);

-- [G2] Thêm Metadata cho DANH_GIA
ALTER TABLE DANH_GIA ADD (
    PHAN_HOI_CHI_TIET JSON
);

-- [G9] Cấu hình điều kiện KHUYEN_MAI
ALTER TABLE KHUYEN_MAI ADD (
    DIEU_KIEN_JSON JSON
);