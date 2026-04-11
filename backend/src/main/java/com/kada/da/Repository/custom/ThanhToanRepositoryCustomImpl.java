package com.kada.da.Repository.custom;

import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
import org.springframework.stereotype.Repository;

@Repository
public class ThanhToanRepositoryCustomImpl implements ThanhToanRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public String chotThanhToanHoaDon(String maHd, String maNs, String phuongThuc) {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("SP_CHOT_THANH_TOAN_HOA_DON");

        query.registerStoredProcedureParameter(1, String.class, ParameterMode.IN); // p_mahd
        query.registerStoredProcedureParameter(2, String.class, ParameterMode.IN); // p_mans
        query.registerStoredProcedureParameter(3, String.class, ParameterMode.IN); // p_phuongthuc
        query.registerStoredProcedureParameter(4, String.class, ParameterMode.OUT); // p_matt_out

        query.setParameter(1, maHd);
        query.setParameter(2, maNs);
        query.setParameter(3, phuongThuc);

        query.execute();

        return (String) query.getOutputParameterValue(4);
    }
}