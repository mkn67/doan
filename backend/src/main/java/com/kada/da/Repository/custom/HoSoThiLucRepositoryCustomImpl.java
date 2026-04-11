package com.kada.da.Repository.custom;

import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
import org.springframework.stereotype.Repository;
import java.util.HashMap;
import java.util.Map;

@Repository
public class HoSoThiLucRepositoryCustomImpl implements HoSoThiLucRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Map<String, String> luuHoSoKhamBenh(
            String maKhachHang, String maBacSi, String ketLuan,
            Double matTraiSph, Double matTraiCyl, Integer matTraiAx, Double docongTrai,
            Double matPhaiSph, Double matPhaiCyl, Integer matPhaiAx, Double docongPhai,
            Double pd) {

        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("SP_LUU_HOSO_KHAM_BENH");

        query.registerStoredProcedureParameter(1, String.class, ParameterMode.INOUT);
        query.registerStoredProcedureParameter(2, String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(3, String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(4, String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(5, Double.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(6, Double.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(7, Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(8, Double.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(9, Double.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(10, Double.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(11, Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(12, Double.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(13, Double.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(14, String.class, ParameterMode.OUT);

        // Set tham số
        query.setParameter(1, null); // p_mahoso (INOUT, ban đầu null)
        query.setParameter(2, maKhachHang);
        query.setParameter(3, maBacSi);
        query.setParameter(4, ketLuan);
        query.setParameter(5, matTraiSph);
        query.setParameter(6, matTraiCyl);
        query.setParameter(7, matTraiAx);
        query.setParameter(8, docongTrai);
        query.setParameter(9, matPhaiSph);
        query.setParameter(10, matPhaiCyl);
        query.setParameter(11, matPhaiAx);
        query.setParameter(12, docongPhai);
        query.setParameter(13, pd);

        query.execute();

        String maHoso = (String) query.getOutputParameterValue(1);
        String maDon = (String) query.getOutputParameterValue(14);

        Map<String, String> result = new HashMap<>();
        result.put("maHoso", maHoso);
        result.put("maDon", maDon);
        return result;
    }
}