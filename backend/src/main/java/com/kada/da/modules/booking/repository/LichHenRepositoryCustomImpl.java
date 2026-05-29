package com.kada.da.modules.booking.repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

import com.kada.da.modules.booking.Enum.TrangThaiLichHen;
import com.kada.da.modules.booking.domain.LichHen;
import com.kada.da.modules.booking.dto.LichHenFilterDTO;

import jakarta.persistence.EntityManager;
import jakarta.persistence.ParameterMode;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.StoredProcedureQuery;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

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

    private List<Predicate> getPredicates(CriteriaBuilder cb, Root<LichHen> root, LichHenFilterDTO filter) {
        List<Predicate> predicates = new ArrayList<>();

        // 1. Lọc theo Keyword (Tên, SĐT, hoặc Mã khách hàng) - Join với bảng KhachHang
        if (filter.getKeyword() != null && !filter.getKeyword().isEmpty()) {
            Join<Object, Object> khachHangJoin = root.join("khachHang"); // "khachHang" là tên field trong Entity LichHen
            String pattern = "%" + filter.getKeyword().toLowerCase() + "%";
            predicates.add(cb.or(
                    cb.like(cb.lower(khachHangJoin.get("hoTen")), pattern),
                    cb.like(khachHangJoin.get("sdt"), pattern),
                    cb.like(cb.lower(khachHangJoin.get("maKh")), pattern) // Tìm theo Mã khách hàng (VD: KH002)
            ));
        }

        // 2. Lọc theo Bác sĩ
        if (filter.getMaNs() != null && !filter.getMaNs().isEmpty()) {
            predicates.add(cb.equal(root.get("nhanSu").get("maNs"), filter.getMaNs()));
        }

        // 3. Lọc theo Ngày (Từ ngày - Đến ngày)
        if (filter.getTuNgay() != null && !filter.getTuNgay().isEmpty()) {
            LocalDate start = LocalDate.parse(filter.getTuNgay());
            predicates.add(cb.greaterThanOrEqualTo(root.get("ngayHen"), start.atStartOfDay()));
        }
        if (filter.getDenNgay() != null && !filter.getDenNgay().isEmpty()) {
            LocalDate end = LocalDate.parse(filter.getDenNgay());
            predicates.add(cb.lessThan(root.get("ngayHen"), end.plusDays(1).atStartOfDay()));
        }

        // 4. Lọc theo Trạng thái
        if (filter.getTrangThai() != null && !filter.getTrangThai().isEmpty()) {
            predicates.add(cb.equal(root.get("trangThai"), TrangThaiLichHen.safeValueOf(filter.getTrangThai())));
        }

        return predicates;
    }

    @Override
    public Page<LichHen> findAllWithFilter(LichHenFilterDTO filter) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<LichHen> query = cb.createQuery(LichHen.class);
        Root<LichHen> root = query.from(LichHen.class);
        
        List<Predicate> predicates = getPredicates(cb, root, filter);

        // Thực thi Query
        query.where(predicates.toArray(new Predicate[0]));

        // Sắp xếp
        if (filter.getSortDir().equalsIgnoreCase("desc")) {
            query.orderBy(cb.desc(root.get(filter.getSortBy())));
        } else {
            query.orderBy(cb.asc(root.get(filter.getSortBy())));
        }

        TypedQuery<LichHen> typedQuery = entityManager.createQuery(query);
        typedQuery.setFirstResult(filter.getPage() * filter.getSize());
        typedQuery.setMaxResults(filter.getSize());

        List<LichHen> resultList = typedQuery.getResultList();

        // Tính tổng để phân trang (Dùng root mới và predicates mới để tránh lỗi copy SqmSingularJoin trong Hibernate 6)
        CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
        Root<LichHen> countRoot = countQuery.from(LichHen.class);
        List<Predicate> countPredicates = getPredicates(cb, countRoot, filter);
        
        countQuery.select(cb.count(countRoot));
        countQuery.where(countPredicates.toArray(new Predicate[0]));
        Long total = entityManager.createQuery(countQuery).getSingleResult();

        return new PageImpl<>(resultList, PageRequest.of(filter.getPage(), filter.getSize()), total);
    }
}
