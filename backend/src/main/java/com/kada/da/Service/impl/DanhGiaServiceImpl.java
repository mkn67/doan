package com.kada.da.Service.impl;

import com.kada.da.Dto.DanhGiaRequestDTO;
import com.kada.da.Dto.Response.DanhGiaResponseDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Entity.DanhGia;
import com.kada.da.Entity.KhachHang;
import com.kada.da.Entity.HoSoThiLuc;
import com.kada.da.Entity.NhanSu;
import com.kada.da.Exception.BusinessRuleException;
import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.Repository.DanhGiaRepository;
import com.kada.da.Repository.KhachHangRepository;
import com.kada.da.Repository.HoSoThiLucRepository;
import com.kada.da.Repository.NhanSuRepository;
import com.kada.da.Service.DanhGiaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DanhGiaServiceImpl implements DanhGiaService {

    private final DanhGiaRepository danhGiaRepository;
    private final KhachHangRepository khachHangRepository;
    private final NhanSuRepository nhanSuRepository;
    private final HoSoThiLucRepository hoSoThiLucRepository;

    @Override
    @Transactional
    public DanhGiaResponseDTO createDanhGia(DanhGiaRequestDTO request) {
        log.info("Tạo đánh giá mới từ KH: {}", request.getMaKh());

        KhachHang khachHang = khachHangRepository.findById(request.getMaKh())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng"));

        NhanSu nhanSu = nhanSuRepository.findById(request.getMaNs())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bác sĩ/nhân sự"));

        HoSoThiLuc hoSoThiLuc = hoSoThiLucRepository.findById(request.getMaHoSo())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hồ sơ thị lực"));

        if (request.getSoSao() < 1 || request.getSoSao() > 5) {
            throw new BusinessRuleException("Số sao đánh giá phải từ 1 đến 5");
        }

        DanhGia danhGia = DanhGia.builder()
                .maDg("DG" + UUID.randomUUID().toString().substring(0, 7).toUpperCase())
                .khachHang(khachHang)
                .nhanSu(nhanSu)
                .hoSoThiLuc(hoSoThiLuc)
                .soSao(request.getSoSao())
                .noiDung(request.getNoiDung())
                .phanHoiChiTiet(request.getPhanHoiChiTiet())
                .ngayDg(LocalDateTime.now())
                .isHidden(0) // 0: hiển thị, 1: ẩn
                .build();

        return convertToResponse(danhGiaRepository.save(danhGia));
    }

    @Override
    public DanhGiaResponseDTO getDanhGiaById(String maDg) {
        return convertToResponse(findById(maDg));
    }

    @Override
    public PageResponseDTO<DanhGiaResponseDTO> getAllDanhGia(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<DanhGia> pageData = danhGiaRepository.findAll(pageable);

        return PageResponseDTO.<DanhGiaResponseDTO>builder()
                .content(pageData.getContent().stream().map(this::convertToResponse).collect(Collectors.toList()))
                .pageNo(page)
                .pageSize(size)
                .totalElements(pageData.getTotalElements())
                .totalPages(pageData.getTotalPages())
                .last(pageData.isLast())
                .build();
    }

    @Override
    public DanhGiaResponseDTO getDanhGiaByMaHoso(String maHoso) {
        DanhGia danhGia = danhGiaRepository.findByHoSoThiLuc_MaHoSo(maHoso)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá cho hồ sơ: " + maHoso));
        return convertToResponse(danhGia);
    }

    @Override
    public List<DanhGiaResponseDTO> getDanhGiaByMaKh(String maKh) {
        return danhGiaRepository.findByKhachHang_MaKh(maKh).stream()
                .map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public List<DanhGiaResponseDTO> getDanhGiaByMaNs(String maNs) {
        return danhGiaRepository.findByNhanSu_MaNs(maNs).stream()
                .map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public List<DanhGiaResponseDTO> getDanhGiaBySoSao(Integer soSao) {
        return danhGiaRepository.findBySoSao(soSao).stream()
                .map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public List<DanhGiaResponseDTO> getDanhGiaHienThi() {
        return danhGiaRepository.findByIsHiddenFalse().stream()
                .map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    public List<DanhGiaResponseDTO> getDanhGiaGanDay(int days) {
        LocalDateTime dateThreshold = LocalDateTime.now().minusDays(days);
        return danhGiaRepository.findByNgayDgAfter(dateThreshold).stream()
                .map(this::convertToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DanhGiaResponseDTO updateDanhGia(String maDg, DanhGiaRequestDTO request) {
        DanhGia danhGia = findById(maDg);
        danhGia.setSoSao(request.getSoSao());
        danhGia.setNoiDung(request.getNoiDung());
        return convertToResponse(danhGiaRepository.save(danhGia));
    }

    @Override
    @Transactional
    public DanhGiaResponseDTO toggleHidden(String maDg, boolean hidden) {
        DanhGia danhGia = findById(maDg);
        danhGia.setIsHidden(hidden ? 1 : 0);
        return convertToResponse(danhGiaRepository.save(danhGia));
    }

    @Override
    @Transactional
    public void deleteDanhGia(String maDg) {
        danhGiaRepository.delete(findById(maDg));
    }

    @Override
    public Double getTrungBinhSaoByBacSi(String maNs) {
        Double avg = danhGiaRepository.getAverageRatingByNhanSu(maNs);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
    }

    @Override
    public Object getTyLeDanhGia() {
        // Trả về map tỷ lệ % các sao (1 sao, 2 sao... 5 sao)
        long total = danhGiaRepository.count();
        if (total == 0)
            return new HashMap<>();

        Map<Integer, Double> tyle = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            long countSao = danhGiaRepository.countBySoSao(i);
            double percentage = (double) countSao / total * 100;
            tyle.put(i, Math.round(percentage * 10.0) / 10.0);
        }
        return tyle;
    }

    private DanhGia findById(String maDg) {
        return danhGiaRepository.findById(maDg)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá: " + maDg));
    }

    private DanhGiaResponseDTO convertToResponse(DanhGia entity) {
        return DanhGiaResponseDTO.builder()
                .maDg(entity.getMaDg())
                .tenKhachHang(entity.getKhachHang() != null ? entity.getKhachHang().getHoTen() : "Khách ẩn danh")
                .sdtKhachHang(entity.getKhachHang() != null ? entity.getKhachHang().getSdt() : "Không có SĐT")
                .tenBacSi(entity.getNhanSu() != null ? entity.getNhanSu().getHoTen() : "Chưa phân công")
                .soSao(entity.getSoSao())
                .noiDung(entity.getNoiDung())
                .phanHoiChiTiet(entity.getPhanHoiChiTiet())
                .ngayDg(entity.getNgayDg())
                .isHidden(entity.getIsHidden() != null && entity.getIsHidden() == 1)
                .build();
    }
}