-- ============================================================
-- FILE   : V2_Feature.sql
-- PROJECT: Hệ Thống Quản Lý Dịch Vụ Thị Lực & Thiết Bị Y Tế
-- VERSION: Bổ sung chức năng (đánh giá, hàng chờ, dịch vụ khám, tồn kho tối thiểu, điểm thưởng, khuyến mãi)
-- ============================================================

-- ============================================================
-- [G2] ĐÁNH GIÁ & RATING BÁC SĨ
-- ============================================================
CREATE TABLE DANH_GIA (
    MADG      VARCHAR2(10)  PRIMARY KEY,
    MAHOSO    VARCHAR2(10)  NOT NULL,
    MAKH      VARCHAR2(10)  NOT NULL,
    MANS      VARCHAR2(10)  NOT NULL,
    SO_SAO    NUMBER(1)     NOT NULL,
    NOI_DUNG  NVARCHAR2(500),
    NGAY_DG   TIMESTAMP     DEFAULT SYSTIMESTAMP,
    IS_HIDDEN NUMBER(1)     DEFAULT 0,
    PHAN_HOI_CHI_TIET JSON,
    CONSTRAINT PK_DG       PRIMARY KEY (MADG),
    CONSTRAINT FK_DG_HS    FOREIGN KEY (MAHOSO) REFERENCES HO_SO_THI_LUC(MAHOSO),
    CONSTRAINT FK_DG_KH    FOREIGN KEY (MAKH)   REFERENCES KHACH_HANG(MAKH),
    CONSTRAINT FK_DG_NS    FOREIGN KEY (MANS)   REFERENCES NHAN_SU(MANS),
    CONSTRAINT CK_DG_SAO   CHECK (SO_SAO BETWEEN 1 AND 5),
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
-- [G6] HÀNG CHỜ — QUEUE MANAGEMENT (đã tạo trong V1, nhưng cần thêm SEQUENCE và TRIGGER nếu chưa có)
-- ============================================================
-- Lưu ý: Bảng HANG_CHO đã tạo trong V1, chỉ bổ sung Sequence và Trigger nếu chưa có.
-- Nếu đã có trong V1 thì có thể comment lại các lệnh dưới đây.
CREATE SEQUENCE SEQ_HANG_CHO START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

CREATE OR REPLACE TRIGGER TRG_GEN_MAHC
BEFORE INSERT ON HANG_CHO
FOR EACH ROW
BEGIN
    IF :NEW.MAHC IS NULL THEN
        :NEW.MAHC := 'HC' || LPAD(SEQ_HANG_CHO.NEXTVAL, 6, '0');
    END IF;
    IF :NEW.SO_THU_TU IS NULL THEN
        SELECT NVL(MAX(SO_THU_TU), 0) + 1 INTO :NEW.SO_THU_TU
        FROM HANG_CHO
        WHERE TRUNC(GIO_DANG_KY) = TRUNC(SYSDATE);
    END IF;
END;
/

-- ============================================================
-- [G7] DỊCH VỤ KHÁM & PHÍ DỊCH VỤ (đã tạo trong V1, chỉ bổ sung seed dữ liệu)
-- ============================================================
INSERT INTO DICH_VU_KHAM VALUES ('DV01', N'Phí khám tổng quát',   150000, N'Phí khám cơ bản', 1);
INSERT INTO DICH_VU_KHAM VALUES ('DV02', N'Phí đo khúc xạ',       200000, N'Đo và tư vấn kính',1);
INSERT INTO DICH_VU_KHAM VALUES ('DV03', N'Phí soi đáy mắt',      250000, N'Chụp ảnh đáy mắt', 1);
INSERT INTO DICH_VU_KHAM VALUES ('DV04', N'Phí tư vấn kính áp tròng',100000,N'Thử và tư vấn',  1);
COMMIT;

-- ============================================================
-- [G8] TỒN KHO TỐI THIỂU — CẢNH BÁO THỦ KHO
-- ============================================================
ALTER TABLE SAN_PHAM ADD (
    TON_KHO_TOI_THIEU NUMBER DEFAULT 0,
    DON_VI_TINH_KHO   NVARCHAR2(20) NULL
);

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
CREATE TABLE LICH_SU_DIEM (
    MALSD     VARCHAR2(10)  PRIMARY KEY,
    MAKH      VARCHAR2(10)  NOT NULL,
    LOAI      NVARCHAR2(20) NOT NULL,
    SO_DIEM   NUMBER        NOT NULL,
    LY_DO     NVARCHAR2(200),
    MAHD      VARCHAR2(10)  NULL,
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

CREATE TABLE KHUYEN_MAI (
    MAKM        VARCHAR2(10)  PRIMARY KEY,
    TENKM       NVARCHAR2(100) NOT NULL,
    LOAI        NVARCHAR2(20) NOT NULL,
    GIA_TRI     NUMBER(15,2)  NOT NULL,
    GIAM_TOI_DA NUMBER(15,2)  NULL,
    MA_CODE     VARCHAR2(20)  UNIQUE,
    NGAY_BD     DATE          NOT NULL,
    NGAY_KT     DATE          NOT NULL,
    SO_LUONG    NUMBER        NULL,
    DA_DUNG     NUMBER        DEFAULT 0,
    DIEU_KIEN   NUMBER(15,2)  DEFAULT 0,
    DIEU_KIEN_JSON JSON,
    IS_ACTIVE   NUMBER(1)     DEFAULT 1,
    CONSTRAINT CK_KM_NGAY CHECK (NGAY_KT >= NGAY_BD)
);

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
-- END OF V2_Feature.sql
-- ============================================================