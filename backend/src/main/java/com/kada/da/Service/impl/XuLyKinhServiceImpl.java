package com.kada.da.Service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kada.da.Dto.XuLyKinhRequestDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Dto.Response.XuLyKinhResponseDTO;
import com.kada.da.Entity.NhanSu;
import com.kada.da.Entity.PhieuKeDon;
import com.kada.da.Entity.XuLyKinh;
import com.kada.da.Repository.NhanSuRepository;
import com.kada.da.Repository.PhieuKeDonRepository;
import com.kada.da.Repository.XuLyKinhRepository;
import com.kada.da.Service.XuLyKinhService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class XuLyKinhServiceImpl implements XuLyKinhService {

    private final XuLyKinhRepository xuLyKinhRepository;
    private final PhieuKeDonRepository phieuKeDonRepository;
    private final NhanSuRepository nhanSuRepository;
    private final ObjectMapper objectMapper; // Dùng để ép cục JSON thông số kính thành String

    @Override
    @Transactional
    public XuLyKinhResponseDTO createXuLyKinh(XuLyKinhRequestDTO request) {
        PhieuKeDon phieuKeDon = phieuKeDonRepository.findById(request.getMaDon())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn thuốc"));

        XuLyKinh xuLyKinh = new XuLyKinh();
        xuLyKinh.setMaXl(generateMaXl());
        xuLyKinh.setPhieuKeDon(phieuKeDon);
        xuLyKinh.setTrangThai("Chờ xử lý"); // Mặc định khi mới tạo

        try {
            if (request.getThongSoKinh() != null) {
                xuLyKinh.setThongSoKinh(objectMapper.writeValueAsString(request.getThongSoKinh()));
            }
        } catch (Exception e) {
            xuLyKinh.setThongSoKinh("{}");
        }

        return toDTO(xuLyKinhRepository.save(xuLyKinh));
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
        NhanSu kyThuat = nhanSuRepository.findById(maKyThuat)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhân sự"));

        existing.setNhanSuKyThuat(kyThuat);
        existing.setTrangThai("Đang xử lý");
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

    private String generateMaXl() {
        String maxCode = xuLyKinhRepository.findMaxMaXl();
        if (maxCode == null || maxCode.length() < 3)
            return "XL001";
        try {
            int nextNumber = Integer.parseInt(maxCode.substring(2)) + 1;
            return "XL" + String.format("%03d", nextNumber);
        } catch (Exception e) {
            return "XL001";
        }
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