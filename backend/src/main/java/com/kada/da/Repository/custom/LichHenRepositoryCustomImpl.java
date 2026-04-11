package com.kada.da.Repository.custom;

import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Repository
public class LichHenRepositoryCustomImpl implements LichHenRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public String datLichHen(String maKh, String maNs, String maGoi, LocalDate ngayHen, LocalDateTime gioHen) {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("SP_DAT_LICH_HEN");

        query.registerStoredProcedureParameter(1, String.class, ParameterMode.IN); // p_makh
        query.registerStoredProcedureParameter(2, String.class, ParameterMode.IN); // p_mans
        query.registerStoredProcedureParameter(3, String.class, ParameterMode.IN); // p_magoi
        query.registerStoredProcedureParameter(4, java.sql.Date.class, ParameterMode.IN); // p_ngayhen
        query.registerStoredProcedureParameter(5, java.sql.Timestamp.class, ParameterMode.IN); // p_giohen
        query.registerStoredProcedureParameter(6, String.class, ParameterMode.OUT); // p_malh_out

        query.setParameter(1, maKh);
        query.setParameter(2, maNs);
        query.setParameter(3, maGoi);
        query.setParameter(4, ngayHen != null ? java.sql.Date.valueOf(ngayHen) : null);
        query.setParameter(5, gioHen != null ? java.sql.Timestamp.valueOf(gioHen) : null);

        query.execute();

        return (String) query.getOutputParameterValue(6);
    }

    @Override
    public void huyLichHen(String maLh) {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("SP_HUY_LICH_HEN");
        query.registerStoredProcedureParameter(1, String.class, ParameterMode.IN);
        query.setParameter(1, maLh);
        query.execute();
    }
}