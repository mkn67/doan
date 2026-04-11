package com.kada.da.Service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Dto.Response.XuLyKinhResponseDTO;
import com.kada.da.Dto.XuLyKinhRequestDTO;
import com.kada.da.Entity.XuLyKinh;
import com.kada.da.Repository.XuLyKinhRepository;
import com.kada.da.Service.XuLyKinhService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class XuLyKinhServiceImpl implements XuLyKinhService {

    private final XuLyKinhRepository xuLyKinhRepository;
    private final ObjectMapper objectMapper; // Dùng để ép cục JSON thông số kính thành String

    @Override
    @Transactional
    public String taoPhieuGiaoKinh(String maDon, String maNsKyThuat, String thongSoKinh) {
        log.info("Gọi SP_GIAO_XU_LY_KINH: đơn={}, ktv={}", maDon, maNsKyThuat);

        // Chuyền bóng thẳng cho Oracle lo liệu!
        String maXl = xuLyKinhRepository.giaoXuLyKinh(maDon, maNsKyThuat, thongSoKinh);

        log.info("Đã tạo phiếu xử lý kính thành công, mã: {}", maXl);
        return maXl; // Frontend rất thích cái mã này để mở chi tiết
    }

    @Override
    public XuLyKinhResponseDTO getXuLyKinhById(String maXl) {
        return toDTO(xuLyKinhRepository.findById(maXl)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu xử lý kính: " + maXl)));
    }

    @Override
    public PageResponseDTO<XuLyKinhResponseDTO> getAllXuLyKinh(int page, int size) {
        Page<XuLyKinh> pageResult = xuLyKinhRepository.findAll(PageRequest.of(page, size));
        List<XuLyKinhResponseDTO> content = pageResult.getContent().stream()
                .map(this::toDTO).collect(Collectors.toList());

        return PageResponseDTO.<XuLyKinhResponseDTO>builder()
                .content(content)
                .pageNo(page)
                .pageSize(size)
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    @Override
    public List<XuLyKinhResponseDTO> getXuLyKinhByMaDon(String maDon) {
        return xuLyKinhRepository.findByPhieuKeDon_MaDon(maDon).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<XuLyKinhResponseDTO> getXuLyKinhByTrangThai(String trangThai) {
        return xuLyKinhRepository.findByTrangThai(trangThai).stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    public List<XuLyKinhResponseDTO> getXuLyKinhCanXuLy() {
        return getXuLyKinhByTrangThai("Chờ xử lý");
    }

    @Override
    public List<XuLyKinhResponseDTO> getXuLyKinhByKyThuatAndTrangThai(String maKyThuat, String trangThai) {
        return xuLyKinhRepository.findByNhanSuKyThuat_MaNsAndTrangThai(maKyThuat, trangThai)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public XuLyKinhResponseDTO updateThongSoKinh(String maXl, Object thongSoKinh) {
        XuLyKinh existing = xuLyKinhRepository.findById(maXl)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu xử lý kính: " + maXl));
        try {
            existing.setThongSoKinh(objectMapper.writeValueAsString(thongSoKinh));
        } catch (Exception e) {
        }
        return toDTO(xuLyKinhRepository.save(existing));
    }

    @Override
    @Transactional
    public XuLyKinhResponseDTO updateTrangThai(String maXl, String trangThai) {
        XuLyKinh existing = xuLyKinhRepository.findById(maXl)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu xử lý kính: " + maXl));
        existing.setTrangThai(trangThai);

        // Tự động chốt giờ nếu hoàn thành
        if ("Hoàn thành".equalsIgnoreCase(trangThai) || "Đã xong".equalsIgnoreCase(trangThai)) {
            existing.setNgayHoanThanh(LocalDateTime.now());
        }
        return toDTO(xuLyKinhRepository.save(existing));
    }

    @Override
    @Transactional
    public XuLyKinhResponseDTO batDauXuLy(String maXl, String maKyThuat) {
        XuLyKinh existing = xuLyKinhRepository.findById(maXl)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu: " + maXl));

        // Logic cũ dùng JPA, nếu muốn đồng bộ SP thì nên gọi SP tương ứng ở đây
        existing.setNgayBatDau(LocalDateTime.now()); // Ghi nhận giờ bắt đầu cắt kính

        return toDTO(xuLyKinhRepository.save(existing));
    }

    @Override
    @Transactional
    public XuLyKinhResponseDTO hoanThanhXuLy(String maXl) {
        return updateTrangThai(maXl, "Hoàn thành");
    }

    @Override
    @Transactional
    public XuLyKinhResponseDTO huyXuLy(String maXl, String lyDo) {
        XuLyKinh existing = xuLyKinhRepository.findById(maXl)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phiếu: " + maXl));
        existing.setTrangThai("Đã hủy");
        existing.setGhiChu(lyDo);
        return toDTO(xuLyKinhRepository.save(existing));
    }

    // ==================== PRIVATE METHODS ====================

    @Override
    public XuLyKinhResponseDTO createXuLyKinh(XuLyKinhRequestDTO request) {
        throw new UnsupportedOperationException("Dùng taoPhieuGiaoKinh(SP) thay thế cho nghiệp vụ này");
    }

    private XuLyKinhResponseDTO toDTO(XuLyKinh entity) {
        String maHoSo = null;
        String tenKhachHang = null;

        // Trích xuất an toàn Mã hồ sơ và Tên khách hàng từ PhieuKeDon
        if (entity.getPhieuKeDon() != null && entity.getPhieuKeDon().getHoSoThiLuc() != null) {
            maHoSo = entity.getPhieuKeDon().getHoSoThiLuc().getMaHoSo();

            // Giả sử HoSoThiLuc của ông có nối với KhachHang để lấy tên
            if (entity.getPhieuKeDon().getHoSoThiLuc().getKhachHang() != null) {
                tenKhachHang = entity.getPhieuKeDon().getHoSoThiLuc().getKhachHang().getHoTen();
            }
        }

        // Chuyển ngược chuỗi JSON trong DB thành Object để nhét vào DTO
        Object thongSoObj = null;
        try {
            if (entity.getThongSoKinh() != null && !entity.getThongSoKinh().isEmpty()) {
                thongSoObj = objectMapper.readValue(entity.getThongSoKinh(), Object.class);
            }
        } catch (Exception e) {
            thongSoObj = entity.getThongSoKinh(); // Lỡ lỗi thì trả nguyên chuỗi
        }

        return XuLyKinhResponseDTO.builder()
                .maXl(entity.getMaXl())
                .maDon(entity.getPhieuKeDon() != null ? entity.getPhieuKeDon().getMaDon() : null)
                .maHoso(maHoSo)
                .tenKhachHang(tenKhachHang) // Lấy từ Hồ Sơ (thay vì Hóa Đơn vì xử lý kính nối với Đơn Thuốc)
                .tenKyThuatVien(entity.getNhanSuKyThuat() != null ? entity.getNhanSuKyThuat().getHoTen() : null)
                .tinhTrang(entity.getTrangThai()) // Đổi trangThai -> tinhTrang
                .ngayNhan(entity.getNgayBatDau()) // Đổi ngayBatDau -> ngayNhan
                .ngayHenTra(entity.getNgayHoanThanh()) // Đổi ngayHoanThanh -> ngayHenTra
                .ghiChu(entity.getGhiChu())
                .thongSoKinh(thongSoObj) // Đã chuyển thành Object siêu xịn
                .build();
    }
}