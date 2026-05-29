package com.kada.da.Config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseUpdateRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseUpdateRunner(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("🚀 [DATABASE UPDATE RUNNER] Deploying DB stored procedures and functions...");

        try {
            // 1. Deploy SP_TAO_HOA_DON
            String spTaoHoaDonSql = """
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

                    -- Nạp chi tiết sản phẩm
                    IF p_json_sp IS NOT NULL AND DBMS_LOB.GETLENGTH(p_json_sp) > 0 AND p_json_sp != '[]' THEN
                        INSERT INTO CT_HOA_DON(MAHD, MALO, MASP, SOLUONG, DONGIA)
                        SELECT v_mahd, j.malo, (SELECT MASP FROM LO_HANG WHERE MALO = j.malo), j.sl, j.gia
                        FROM JSON_TABLE(p_json_sp, '$[*]' COLUMNS (malo VARCHAR2(20) PATH '$.malo', sl NUMBER PATH '$.sl', gia NUMBER PATH '$.gia')) j;
                    ELSIF p_madon IS NOT NULL THEN
                        DECLARE
                            v_malo    VARCHAR2(20);
                            v_dongia  NUMBER(15,2);
                            v_tensp   NVARCHAR2(100);
                        BEGIN
                            FOR rec IN (SELECT MASP, SOLUONG FROM CT_KE_DON WHERE MADON = p_madon) LOOP
                                -- Tìm lô hàng FEFO
                                v_malo := FN_GET_MALO_FEFO(rec.MASP, rec.SOLUONG);
                                
                                IF v_malo IS NULL THEN
                                    SELECT TENSP INTO v_tensp FROM SAN_PHAM WHERE MASP = rec.MASP;
                                    RAISE_APPLICATION_ERROR(-20035, 'Không đủ tồn kho cho sản phẩm ' || v_tensp || ' (Mã SP: ' || rec.MASP || ', Yêu cầu: ' || rec.SOLUONG || ')!');
                                END IF;

                                -- Lấy đơn giá bán
                                SELECT GIABAN INTO v_dongia FROM SAN_PHAM WHERE MASP = rec.MASP;

                                -- Lưu vào chi tiết hóa đơn
                                INSERT INTO CT_HOA_DON(MAHD, MALO, MASP, SOLUONG, DONGIA)
                                VALUES (v_mahd, v_malo, rec.MASP, rec.SOLUONG, v_dongia);
                            END LOOP;
                        END;
                    END IF;

                    -- Nạp chi tiết dịch vụ
                    IF p_json_dv IS NOT NULL AND DBMS_LOB.GETLENGTH(p_json_dv) > 0 AND p_json_dv != '[]' THEN
                        INSERT INTO CT_HOA_DON_DV(MAHD, MADV, SOLUONG, DONGIA)
                        SELECT v_mahd, j.madv, j.sl, j.gia
                        FROM JSON_TABLE(p_json_dv, '$[*]' COLUMNS (madv VARCHAR2(20) PATH '$.madv', sl NUMBER PATH '$.sl', gia NUMBER PATH '$.gia')) j;
                    ELSIF p_mahoso IS NOT NULL THEN
                        DECLARE
                            v_makh      VARCHAR2(10);
                            v_ngaykham  DATE;
                            v_magoi     VARCHAR2(10);
                            v_has_dv    INT := 0;
                        BEGIN
                            SELECT MAKH, TRUNC(NGAYKHAM) INTO v_makh, v_ngaykham FROM HO_SO_THI_LUC WHERE MAHOSO = p_mahoso;
                            
                            BEGIN
                                SELECT MAGOI INTO v_magoi
                                FROM (
                                    SELECT MAGOI 
                                    FROM LICH_HEN 
                                    WHERE MAKH = v_makh 
                                      AND TRANGTHAI != N'Đã hủy'
                                      AND TRUNC(NGAYHEN) = v_ngaykham
                                    ORDER BY NGAYHEN DESC
                                ) WHERE ROWNUM = 1;
                            EXCEPTION WHEN NO_DATA_FOUND THEN
                                v_magoi := NULL;
                            END;

                            IF v_magoi IS NOT NULL THEN
                                FOR rec IN (
                                    SELECT cg.MADV, d.GIA
                                    FROM CT_GOI_KHAM cg
                                    JOIN DICH_VU_KHAM d ON cg.MADV = d.MADV
                                    WHERE cg.MAGOI = v_magoi
                                ) LOOP
                                    INSERT INTO CT_HOA_DON_DV(MAHD, MADV, SOLUONG, DONGIA)
                                    VALUES (v_mahd, rec.MADV, 1, rec.GIA);
                                    v_has_dv := 1;
                                END LOOP;
                            END IF;

                            IF v_has_dv = 0 THEN
                                -- Mặc định thêm dịch vụ Khám mắt tổng quát (DV01) nếu không có gói khám
                                INSERT INTO CT_HOA_DON_DV(MAHD, MADV, SOLUONG, DONGIA)
                                VALUES (v_mahd, 'DV01', 1, 150000);
                            END IF;
                        END;
                    END IF;

                    -- Tự động thêm dịch vụ mài lắp kính nếu có phiếu gia công kính
                    IF p_madon IS NOT NULL THEN
                        DECLARE
                            v_has_xlk INT := 0;
                            v_dv_gia  NUMBER(15,2);
                            v_exists  INT := 0;
                        BEGIN
                            SELECT COUNT(*) INTO v_has_xlk FROM XU_LY_KINH WHERE MADON = p_madon;
                            IF v_has_xlk > 0 THEN
                                SELECT COUNT(*) INTO v_exists FROM CT_HOA_DON_DV WHERE MAHD = v_mahd AND MADV = 'DV06';
                                IF v_exists = 0 THEN
                                    SELECT GIA INTO v_dv_gia FROM DICH_VU_KHAM WHERE MADV = 'DV06';
                                    INSERT INTO CT_HOA_DON_DV(MAHD, MADV, SOLUONG, DONGIA)
                                    VALUES (v_mahd, 'DV06', 1, v_dv_gia);
                                END IF;
                            END IF;
                        EXCEPTION
                            WHEN OTHERS THEN
                                NULL;
                        END;
                    END IF;

                    p_mahd_out := v_mahd;
                EXCEPTION
                    WHEN OTHERS THEN
                        RAISE;
                END SP_TAO_HOA_DON;
                """;
            jdbcTemplate.execute(spTaoHoaDonSql);
            System.out.println("✅ SP_TAO_HOA_DON compiled successfully.");

            // 2. Deploy SP_GIAO_XU_LY_KINH
            String spGiaoXuLyKinhSql = """
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
                       N'Chờ xử lý',
                       NULL,
                       p_mans_ky_thuat
                    );

                   p_maxl_out := v_maxl;
                EXCEPTION
                   WHEN OTHERS THEN
                      RAISE;
                END SP_GIAO_XU_LY_KINH;
                """;
            jdbcTemplate.execute(spGiaoXuLyKinhSql);
            System.out.println("✅ SP_GIAO_XU_LY_KINH compiled successfully.");

            // 3. Deploy FN_GET_MALO_FEFO
            String fnGetMaloFefoSql = """
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
                          AND (NGAYHETHAN IS NULL OR NGAYHETHAN >= TRUNC(SYSDATE))
                        ORDER BY CASE WHEN NGAYHETHAN IS NULL THEN 1 ELSE 0 END ASC,
                                 NGAYHETHAN ASC,
                                 SOLUONGTON DESC
                    )
                    WHERE ROWNUM = 1;
                    RETURN v_malo;
                EXCEPTION
                    WHEN NO_DATA_FOUND THEN
                        RETURN NULL;
                END FN_GET_MALO_FEFO;
                """;
            jdbcTemplate.execute(fnGetMaloFefoSql);
            System.out.println("✅ FN_GET_MALO_FEFO compiled successfully.");

        } catch (Exception e) {
            System.err.println("❌ Lỗi deploying stored procedures/functions: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
