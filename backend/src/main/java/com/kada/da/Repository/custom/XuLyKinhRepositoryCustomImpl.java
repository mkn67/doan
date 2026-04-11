package com.kada.da.Repository.custom;

import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
import org.springframework.stereotype.Repository;

@Repository
public class XuLyKinhRepositoryCustomImpl implements XuLyKinhRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public String giaoXuLyKinh(String maDon, String maNsKyThuat, String thongSoKinh) {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("SP_GIAO_XU_LY_KINH");

        // Đăng ký tham số (Khớp y chang thứ tự trong Oracle)
        query.registerStoredProcedureParameter(1, String.class, ParameterMode.IN); // p_madon
        query.registerStoredProcedureParameter(2, String.class, ParameterMode.IN); // p_mans_ky_thuat
        query.registerStoredProcedureParameter(3, String.class, ParameterMode.IN); // p_thong_so_kinh (CLOB map sang
                                                                                   // String ngon ơ)
        query.registerStoredProcedureParameter(4, String.class, ParameterMode.OUT); // p_maxl_out

        // Truyền giá trị vào
        query.setParameter(1, maDon);
        query.setParameter(2, maNsKyThuat);
        query.setParameter(3, thongSoKinh);

        // Bóp cò!
        query.execute();

        // Móc cái Mã Xử Lý ra và trả về
        return (String) query.getOutputParameterValue(4);
    }
}