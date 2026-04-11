package com.kada.da.Repository.custom;

import com.kada.da.Dto.Response.CanhBaoHetHanDTO;
import com.kada.da.Dto.Response.DoanhThuResponseDTO;
import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Repository
public class ReportRepositoryCustomImpl implements ReportRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<CanhBaoHetHanDTO> getCanhBaoHetHan(int soNgay) {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("SP_CANH_BAO_HANG_HET_HAN");
        query.registerStoredProcedureParameter(1, Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter(2, void.class, ParameterMode.REF_CURSOR);
        query.setParameter(1, soNgay);
        query.execute();

        @SuppressWarnings("unchecked")
        List<Object[]> results = query.getResultList();
        List<CanhBaoHetHanDTO> list = new ArrayList<>();
        for (Object[] row : results) {
            list.add(CanhBaoHetHanDTO.builder()
                    .maLo((String) row[0])
                    .maSp((String) row[1])
                    .tenSp((String) row[2])
                    .donViTinh((String) row[3])
                    .ngayHetHan(row[4] != null ? ((java.sql.Date) row[4]).toLocalDate() : null)
                    .soNgayConLai(row[5] != null ? ((Number) row[5]).longValue() : null)
                    .tonKho(row[6] != null ? ((Number) row[6]).intValue() : null)
                    .mucDo((String) row[7])
                    .nhaCungCap((String) row[8])
                    .build());
        }
        return list;
    }

    @Override
    public List<DoanhThuResponseDTO> getThongKeDoanhThuThang(int thang, int nam) {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("SP_THONG_KE_DOANH_THU_THANG");
        query.registerStoredProcedureParameter("p_thang", Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_nam", Integer.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("c_data", void.class, ParameterMode.REF_CURSOR);
        query.setParameter("p_thang", thang);
        query.setParameter("p_nam", nam);
        query.execute();

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        List<DoanhThuResponseDTO> result = new ArrayList<>();
        for (Object[] row : rows) {
            DoanhThuResponseDTO dto = new DoanhThuResponseDTO();
            dto.setNgay(row[0] != null ? row[0].toString() : "");
            dto.setSoLuongDon(row[1] != null ? ((Number) row[1]).longValue() : 0L);
            dto.setDoanhThuNgay(row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO);
            result.add(dto);
        }
        return result;
    }
}