package com.kada.da.Repository.custom;

import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.Map;

@Repository
public class HoaDonRepositoryCustomImpl implements HoaDonRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Map<String, String> taoHoaDonTuJson(String maKh, String maNs, String maHoso, String maDon, String jsonSp,
            String jsonDv) {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("SP_TAO_HOA_DON");

        query.registerStoredProcedureParameter(1, String.class, ParameterMode.IN); // p_makh
        query.registerStoredProcedureParameter(2, String.class, ParameterMode.IN); // p_mans
        query.registerStoredProcedureParameter(3, String.class, ParameterMode.IN); // p_mahoso
        query.registerStoredProcedureParameter(4, String.class, ParameterMode.IN); // p_madon
        query.registerStoredProcedureParameter(5, String.class, ParameterMode.IN); // p_json_sp
        query.registerStoredProcedureParameter(6, String.class, ParameterMode.IN); // p_json_dv
        query.registerStoredProcedureParameter(7, String.class, ParameterMode.OUT); // p_mahd_out

        query.setParameter(1, maKh);
        query.setParameter(2, maNs);
        query.setParameter(3, maHoso);
        query.setParameter(4, maDon);
        query.setParameter(5, jsonSp);
        query.setParameter(6, jsonDv);

        query.execute();

        String maHd = (String) query.getOutputParameterValue(7);
        Map<String, String> result = new HashMap<>();
        result.put("maHd", maHd);
        return result;
    }

    @Override
    public void huyHoaDon(String maHd) {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("SP_HUY_HOA_DON");
        query.registerStoredProcedureParameter(1, String.class, ParameterMode.IN);
        query.setParameter(1, maHd);
        query.execute();
    }
}