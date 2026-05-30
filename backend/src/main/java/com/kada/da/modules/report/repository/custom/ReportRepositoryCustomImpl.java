package com.kada.da.modules.report.repository.custom;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Repository;

import com.kada.da.modules.inventory.dto.CanhBaoHetHanDTO;
import com.kada.da.modules.inventory.domain.LoHang;
import com.kada.da.modules.report.dto.DoanhThuResponseDTO;

import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;

@Repository
public class ReportRepositoryCustomImpl implements ReportRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public List<CanhBaoHetHanDTO> getCanhBaoHetHan(int soNgay) {
        LocalDate today = LocalDate.now();
        LocalDate limitDate = today.plusDays(soNgay);

        List<LoHang> results = entityManager.createQuery("""
                        SELECT l FROM LoHang l
                        JOIN FETCH l.sanPham s
                        JOIN FETCH l.phieuNhap pn
                        JOIN FETCH pn.nhaCungCap ncc
                        WHERE l.soLuongTon > 0
                          AND l.ngayHetHan > :today
                          AND l.ngayHetHan <= :limitDate
                        ORDER BY l.ngayHetHan ASC
                        """, LoHang.class)
                .setParameter("today", today)
                .setParameter("limitDate", limitDate)
                .getResultList();

        List<CanhBaoHetHanDTO> list = new ArrayList<>();
        for (LoHang loHang : results) {
            long soNgayConLai = ChronoUnit.DAYS.between(today, loHang.getNgayHetHan());
            list.add(CanhBaoHetHanDTO.builder()
                    .maLo(loHang.getMaLo())
                    .maSp(loHang.getSanPham().getMaSp())
                    .tenSp(loHang.getSanPham().getTenSp())
                    .donViTinh(loHang.getSanPham().getDonViTinh())
                    .ngayHetHan(loHang.getNgayHetHan())
                    .soNgayConLai(soNgayConLai)
                    .tonKho(loHang.getSoLuongTon())
                    .mucDo(resolveMucDo(soNgayConLai))
                    .nhaCungCap(loHang.getPhieuNhap().getNhaCungCap().getTenNcc())
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

    @Override
    public List<DoanhThuResponseDTO> getThongKeDoanhThuNgay(java.time.LocalDate tuNgay, java.time.LocalDate denNgay) {
        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("SP_THONG_KE_DOANH_THU_THEO_NGAY");
        query.registerStoredProcedureParameter("p_tu_ngay", java.sql.Date.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("p_den_ngay", java.sql.Date.class, ParameterMode.IN);
        query.registerStoredProcedureParameter("c_result", void.class, ParameterMode.REF_CURSOR);
        query.setParameter("p_tu_ngay", java.sql.Date.valueOf(tuNgay));
        query.setParameter("p_den_ngay", java.sql.Date.valueOf(denNgay));
        query.execute();

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        List<DoanhThuResponseDTO> result = new ArrayList<>();
        for (Object[] row : rows) {
            DoanhThuResponseDTO dto = new DoanhThuResponseDTO();
            dto.setNgay(row[0] != null ? row[0].toString() : "");
            dto.setDoanhThuNgay(row[1] != null ? new java.math.BigDecimal(row[1].toString()) : java.math.BigDecimal.ZERO);
            dto.setSoLuongDon(row[2] != null ? ((Number) row[2]).longValue() : 0L);
            result.add(dto);
        }
        return result;
    }

    private String resolveMucDo(long soNgayConLai) {
        if (soNgayConLai <= 7) {
            return "Nguy cap";
        }
        if (soNgayConLai <= 30) {
            return "Canh bao";
        }
        return "Chu y";
    }
}
