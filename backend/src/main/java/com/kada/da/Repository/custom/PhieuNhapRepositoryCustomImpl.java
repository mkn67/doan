package com.kada.da.Repository.custom;

import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Repository
@Transactional
public class PhieuNhapRepositoryCustomImpl implements PhieuNhapRepositoryCustom {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Map<String, Object> nhapKhoLoHang(
            String maPn, String maNcc, String maNs, String maLo, String maSp,
            LocalDate ngaySx, LocalDate ngayHetHan, Integer soLuongNhap, Double giaNhap) {

        // Đảm bảo maPn và maLo truyền vào là null nếu rỗng để SP tự sinh mã
        String pMaPn = (maPn == null || maPn.trim().isEmpty()) ? null : maPn;
        String pMaLo = (maLo == null || maLo.trim().isEmpty()) ? null : maLo;

        StoredProcedureQuery query = entityManager.createStoredProcedureQuery("SP_NHAP_KHO_LO_HANG");

        // Đăng ký tham số (theo đúng thứ tự trong SP)
        query.registerStoredProcedureParameter(1, String.class, ParameterMode.INOUT); // p_mapn
        query.registerStoredProcedureParameter(2, String.class, ParameterMode.IN); // p_mancc
        query.registerStoredProcedureParameter(3, String.class, ParameterMode.IN); // p_mans
        query.registerStoredProcedureParameter(4, String.class, ParameterMode.INOUT); // p_malo
        query.registerStoredProcedureParameter(5, String.class, ParameterMode.IN); // p_masp
        query.registerStoredProcedureParameter(6, java.sql.Date.class, ParameterMode.IN); // p_ngaysx
        query.registerStoredProcedureParameter(7, java.sql.Date.class, ParameterMode.IN); // p_ngayhethan
        query.registerStoredProcedureParameter(8, Integer.class, ParameterMode.IN); // p_soluongnhap
        query.registerStoredProcedureParameter(9, Double.class, ParameterMode.IN); // p_gianhap
        query.registerStoredProcedureParameter(10, Double.class, ParameterMode.OUT); // p_tongtien_out

        // Set giá trị
        query.setParameter(1, pMaPn);
        query.setParameter(2, maNcc);
        query.setParameter(3, maNs);
        query.setParameter(4, pMaLo);
        query.setParameter(5, maSp);
        query.setParameter(6, ngaySx != null ? java.sql.Date.valueOf(ngaySx) : null);
        query.setParameter(7, ngayHetHan != null ? java.sql.Date.valueOf(ngayHetHan) : null);
        query.setParameter(8, soLuongNhap);
        query.setParameter(9, giaNhap);

        query.execute();

        // Lấy các giá trị OUT
        String maPnOut = (String) query.getOutputParameterValue(1);
        String maLoOut = (String) query.getOutputParameterValue(4);
        Double tongTien = (Double) query.getOutputParameterValue(10);

        Map<String, Object> result = new HashMap<>();
        result.put("maPn", maPnOut);
        result.put("maLo", maLoOut);
        result.put("tongTien", tongTien);
        return result;
    }
}