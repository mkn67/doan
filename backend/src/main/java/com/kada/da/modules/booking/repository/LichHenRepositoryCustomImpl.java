package com.kada.da.modules.booking.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;

@Repository
public class LichHenRepositoryCustomImpl implements LichHenRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public String datLichHen(String maKh, String maNs, String maGoi, LocalDate ngayHen, LocalDateTime gioHen) {

        // DEBUG: In ra Console để xem Frontend gửi xuống đúng ngày không!
        System.out.println("=== [DEBUG] DỮ LIỆU JAVA NHẬN ĐƯỢC ===");
        System.out.println("Mã BS: " + maNs);
        System.out.println("Ngày Hẹn: " + ngayHen);
        System.out.println("Giờ Hẹn: " + gioHen);
        System.out.println("======================================");

        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("SP_DAT_LICH_HEN");

        query.registerStoredProcedureParameter(1, String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(2, String.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(3, String.class, ParameterMode.IN);

        // SỬA ROOT CAUSE: Dùng trực tiếp class của java.time, KHÔNG ép sang java.sql
        query.registerStoredProcedureParameter(4, LocalDate.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(5, LocalDateTime.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(6, String.class, ParameterMode.OUT);

        query.setParameter(1, maKh);
        query.setParameter(2, maNs);
        query.setParameter(3, maGoi);

        // Truyền thẳng object, Hibernate 6 sẽ tự lo liệu vụ Múi giờ
        query.setParameter(4, ngayHen);
        query.setParameter(5, gioHen);

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
