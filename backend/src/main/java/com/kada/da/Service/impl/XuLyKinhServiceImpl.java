package com.kada.da.Service.impl;

import com.kada.da.Dto.XuLyKinhRequestDTO;
import com.kada.da.Dto.Response.PageResponseDTO;
import com.kada.da.Dto.Response.XuLyKinhResponseDTO;
import com.kada.da.Entity.HoaDon;
import com.kada.da.Entity.HoSoThiLuc;
import com.kada.da.Entity.NhanSu;
import com.kada.da.Entity.XuLyKinh;
import com.kada.da.Exception.BusinessRuleException;
import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.Repository.HoaDonRepository;
import com.kada.da.Repository.HoSoThiLucRepository;
import com.kada.da.Repository.NhanSuRepository;
import com.kada.da.Repository.XuLyKinhRepository;
import com.kada.da.Service.XuLyKinhService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class XuLyKinhServiceImpl implements XuLyKinhService {

    private final XuLyKinhRepository xuLyKinhRepository;
    private final HoaDonRepository hoaDonRepository;
    private final HoSoThiLucRepository hoSoThiLucRepository;
    private final NhanSuRepository nhanSuRepository;

    private static final String PREFIX = "XLK";

    @Override
    @Transactional
    public XuLyKinhResponseDTO createXuLyKinh(XuLyKinhRequestDTO request) {
        log.info("Tạo xử lý kính mới cho hóa đơn: {}", request.getMaHd());

        // 1. Kiểm tra hóa đơn tồn tại
        HoaDon hoaDon = hoaDonRepository.findById(request.getMaHd())
                .orElseThrow(() -> new ResourceNotFoundException("Hóa đơn không tồn tại: " + request.getMaHd()));

        // 2. Kiểm tra hồ sơ thị lực (nếu có)
        HoSoThiLuc hoSoThiLuc = null;
        if (request.getMaHoso() != null) {
            hoSoThiLuc = hoSoThiLucRepository.findById(request.getMaHoso())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Hồ sơ thị lực không tồn tại: " + request.getMaHoso()));
        }

        // 3. Tạo xử lý kính mới
        String maXlk = generateMaXuLyKinh();
        XuLyKinh xuLyKinh = XuLyKinh.builder()
                .maXlk(maXlk)
                .ngayNhan(LocalDateTime.now())
                .ngayHenTra(request.getNgayHenTra())
                .tinhTrang("Chờ xử lý")
                .ghiChu(request.getGhiChu())
                .hoSoThiLuc(hoSoThiLuc)
                .hoaDon(hoaDon)
                .nhanSuKyThuat(null)
                .build();

        XuLyKinh saved = xuLyKinhRepository.save(xuLyKinh);
        log.info("Đã tạo xử lý kính với mã: {}", maXlk);

        return convertToResponseDTO(saved);
    }

    @Override
    public XuLyKinhResponseDTO getXuLyKinhById(String maXlk) {
        log.info("Lấy xử lý kính theo mã: {}", maXlk);
        XuLyKinh xuLyKinh = findById(maXlk);
        return convertToResponseDTO(xuLyKinh);
    }

    @Override
    public PageResponseDTO<XuLyKinhResponseDTO> getAllXuLyKinh(int page, int size) {
        log.info("Lấy danh sách xử lý kính - page: {}, size: {}", page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<XuLyKinh> pageResult = xuLyKinhRepository.findAll(pageable);

        List<XuLyKinhResponseDTO> responseList = pageResult.getContent().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());

        return PageResponseDTO.<XuLyKinhResponseDTO>builder()
                .content(responseList)
                .pageNo(page)
                .pageSize(size)
                .totalElements(pageResult.getTotalElements())
                .totalPages(pageResult.getTotalPages())
                .last(pageResult.isLast())
                .build();
    }

    @Override
    public List<XuLyKinhResponseDTO> getXuLyKinhByMaDon(String maDon) {
        log.info("Lấy xử lý kính theo mã đơn thuốc: {}", maDon);

        // Tìm hóa đơn có chứa đơn thuốc này
        List<HoaDon> hoaDonList = hoaDonRepository.findByPhieuKeDon_MaDon(maDon);

        if (hoaDonList.isEmpty()) {
            log.warn("Không tìm thấy hóa đơn nào liên quan đến đơn thuốc: {}", maDon);
            return List.of();
        }

        // Lấy danh sách xử lý kính từ các hóa đơn
        List<XuLyKinh> xuLyKinhList = new ArrayList<>();
        for (HoaDon hoaDon : hoaDonList) {
            List<XuLyKinh> list = xuLyKinhRepository.findByHoaDon(hoaDon);
            xuLyKinhList.addAll(list);
        }

        return xuLyKinhList.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<XuLyKinhResponseDTO> getXuLyKinhByTrangThai(String trangThai) {
        log.info("Lấy xử lý kính theo trạng thái: {}", trangThai);
        List<XuLyKinh> list = xuLyKinhRepository.findByTinhTrang(trangThai);
        return list.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<XuLyKinhResponseDTO> getXuLyKinhCanXuLy() {
        log.info("Lấy danh sách xử lý kính cần xử lý");
        List<XuLyKinh> list = xuLyKinhRepository.findByTinhTrangIn(List.of("Chờ xử lý", "Đang mài", "Chờ lắp"));
        return list.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
    }

    @Override
    public List<XuLyKinhResponseDTO> getXuLyKinhByKyThuatAndTrangThai(String maKyThuat, String trangThai) {
        log.info("Lấy xử lý kính theo kỹ thuật viên: {} và trạng thái: {}", maKyThuat, trangThai);

        NhanSu kyThuat = nhanSuRepository.findById(maKyThuat)
                .orElseThrow(() -> new ResourceNotFoundException("Kỹ thuật viên không tồn tại: " + maKyThuat));

        List<XuLyKinh> list = xuLyKinhRepository.findByNhanSuKyThuatAndTinhTrang(kyThuat, trangThai);
        return list.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public XuLyKinhResponseDTO updateThongSoKinh(String maXlk, Object thongSoKinh) {
        log.warn("Entity XU_LY_KINH không có cột THONG_SO_KINH. Vui lòng thêm cột hoặc lưu ở bảng khác.");
        throw new BusinessRuleException("Tính năng chưa được hỗ trợ với cấu trúc database hiện tại");
    }

    @Override
    @Transactional
    public XuLyKinhResponseDTO updateTrangThai(String maXlk, String trangThai) {
        log.info("Cập nhật trạng thái xử lý kính {} thành: {}", maXlk, trangThai);

        XuLyKinh xuLyKinh = findById(maXlk);

        // Validate trạng thái hợp lệ
        if (!isValidTinhTrang(trangThai)) {
            throw new BusinessRuleException("Trạng thái không hợp lệ: " + trangThai);
        }

        xuLyKinh.setTinhTrang(trangThai);
        XuLyKinh updated = xuLyKinhRepository.save(xuLyKinh);

        return convertToResponseDTO(updated);
    }

    @Override
    @Transactional
    public XuLyKinhResponseDTO batDauXuLy(String maXlk, String maKyThuat) {
        log.info("Bắt đầu xử lý kính {} cho kỹ thuật viên: {}", maXlk, maKyThuat);

        XuLyKinh xuLyKinh = findById(maXlk);

        if (!"Chờ xử lý".equals(xuLyKinh.getTinhTrang())) {
            throw new BusinessRuleException("Chỉ có thể bắt đầu xử lý khi trạng thái là 'Chờ xử lý'");
        }

        NhanSu kyThuat = nhanSuRepository.findById(maKyThuat)
                .orElseThrow(() -> new ResourceNotFoundException("Kỹ thuật viên không tồn tại: " + maKyThuat));

        xuLyKinh.setTinhTrang("Đang mài");
        xuLyKinh.setNhanSuKyThuat(kyThuat);

        XuLyKinh updated = xuLyKinhRepository.save(xuLyKinh);
        return convertToResponseDTO(updated);
    }

    @Override
    @Transactional
    public XuLyKinhResponseDTO hoanThanhXuLy(String maXlk) {
        log.info("Hoàn thành xử lý kính: {}", maXlk);

        XuLyKinh xuLyKinh = findById(maXlk);

        if (!"Đang mài".equals(xuLyKinh.getTinhTrang()) && !"Chờ lắp".equals(xuLyKinh.getTinhTrang())) {
            throw new BusinessRuleException("Chỉ có thể hoàn thành khi đang xử lý");
        }

        xuLyKinh.setTinhTrang("Đã xong");
        // Nếu có field ngayHoanThanh thì set ở đây

        XuLyKinh updated = xuLyKinhRepository.save(xuLyKinh);
        return convertToResponseDTO(updated);
    }

    @Override
    @Transactional
    public XuLyKinhResponseDTO huyXuLy(String maXlk, String lyDo) {
        log.info("Hủy xử lý kính: {} - Lý do: {}", maXlk, lyDo);

        XuLyKinh xuLyKinh = findById(maXlk);

        if ("Đã xong".equals(xuLyKinh.getTinhTrang()) || "Đã giao".equals(xuLyKinh.getTinhTrang())) {
            throw new BusinessRuleException("Không thể hủy xử lý kính đã hoàn thành");
        }

        xuLyKinh.setTinhTrang("Đã hủy");

        String currentGhiChu = xuLyKinh.getGhiChu();
        String newGhiChu = (currentGhiChu != null ? currentGhiChu + " | " : "") + "Hủy lý do: " + lyDo;
        xuLyKinh.setGhiChu(newGhiChu);

        XuLyKinh updated = xuLyKinhRepository.save(xuLyKinh);
        return convertToResponseDTO(updated);
    }

    // ==================== PRIVATE METHODS ====================

    private XuLyKinh findById(String maXlk) {
        return xuLyKinhRepository.findById(maXlk)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy xử lý kính với mã: " + maXlk));
    }

    private String generateMaXuLyKinh() {
        String maxCode = xuLyKinhRepository.findMaxMaXlk();
        if (maxCode == null || maxCode.length() < 4) {
            return PREFIX + "001";
        }
        String numberPart = maxCode.substring(PREFIX.length());
        try {
            int nextNumber = Integer.parseInt(numberPart) + 1;
            return PREFIX + String.format("%03d", nextNumber);
        } catch (NumberFormatException e) {
            return PREFIX + "001";
        }
    }

    private boolean isValidTinhTrang(String tinhTrang) {
        return "Chờ xử lý".equals(tinhTrang) ||
                "Đang mài".equals(tinhTrang) ||
                "Chờ lắp".equals(tinhTrang) ||
                "Đã xong".equals(tinhTrang) ||
                "Đã giao".equals(tinhTrang) ||
                "Đã hủy".equals(tinhTrang);
    }

    private XuLyKinhResponseDTO convertToResponseDTO(XuLyKinh entity) {
        String tenKhachHang = entity.getHoaDon() != null && entity.getHoaDon().getKhachHang() != null
                ? entity.getHoaDon().getKhachHang().getHoTen()
                : null;
        String tenKyThuatVien = entity.getNhanSuKyThuat() != null
                ? entity.getNhanSuKyThuat().getHoTen()
                : null;

        return XuLyKinhResponseDTO.builder()
                .maXl(entity.getMaXlk())
                .maHd(entity.getHoaDon() != null ? entity.getHoaDon().getMaHd() : null)
                .maHoso(entity.getHoSoThiLuc() != null ? entity.getHoSoThiLuc().getMaHoSo() : null)
                .tenKhachHang(tenKhachHang)
                .tenKyThuatVien(tenKyThuatVien)
                .tinhTrang(entity.getTinhTrang())
                .ngayNhan(entity.getNgayNhan())
                .ngayHenTra(entity.getNgayHenTra())
                .ghiChu(entity.getGhiChu())
                .build();
    }
}