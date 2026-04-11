package com.kada.da.Service.impl;

import com.kada.da.Dto.Response.DatLichResponseDTO;
import com.kada.da.Dto.Response.LichHenResponseDTO;
import com.kada.da.Dto.Response.HangChoResponseDTO;
import com.kada.da.Entity.HangCho;
import com.kada.da.Entity.LichHen;
import com.kada.da.Entity.LichHenTrieuChung;
import com.kada.da.Enum.TrangThaiHangCho;
import com.kada.da.Enum.TrangThaiLichHen;
import com.kada.da.Exception.BusinessRuleException;
import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.Repository.HangChoRepository;
import com.kada.da.Repository.LichHenRepository;
import com.kada.da.Service.LichHenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LichHenServiceImpl implements LichHenService {

    private final LichHenRepository lichHenRepository;
    private final HangChoRepository hangChoRepository;

    // ==================== CÁC HÀM DÙNG STORED PROCEDURE ====================

    @Override
    @Transactional
    public DatLichResponseDTO datLichHen(String maKh, String maNs, String maGoi, LocalDate ngayHen,
            LocalDateTime gioHen) {
        log.info("Gọi SP_DAT_LICH_HEN: khách={}, bác sĩ={}, ngày={}, giờ={}", maKh, maNs, ngayHen, gioHen);

        String maLh = lichHenRepository.datLichHen(maKh, maNs, maGoi, ngayHen, gioHen);

        LichHen lichHen = findLichHenById(maLh);

        return DatLichResponseDTO.builder()
                .maLh(maLh)
                .maKhachHang(maKh)
                .tenKhachHang(lichHen.getKhachHang() != null ? lichHen.getKhachHang().getHoTen() : "")
                .maBacSi(maNs)
                .tenBacSi(lichHen.getNhanSu() != null ? lichHen.getNhanSu().getHoTen() : "")
                .ngayHen(ngayHen)
                .gioHen(gioHen)
                .trangThai(lichHen.getTrangThai() != null ? lichHen.getTrangThai().name() : "Mới")
                .thongBao("Đặt lịch thành công")
                .build();
    }

    @Override
    @Transactional
    public void huyLichHen(String maLh) {
        log.info("Gọi SP_HUY_LICH_HEN: {}", maLh);
        lichHenRepository.huyLichHen(maLh);
    }

    // ==================== CÁC HÀM DÙNG JPA BÌNH THƯỜNG ====================

    @Override
    @Transactional
    public LichHenResponseDTO confirmLichHen(String maLichHen) {
        LichHen lichHen = findLichHenById(maLichHen);
        if (lichHen.getTrangThai() != TrangThaiLichHen.CHO_XAC_NHAN) {
            throw new BusinessRuleException("Chỉ có thể xác nhận lịch hẹn 'Chờ xác nhận'");
        }
        lichHen.setTrangThai(TrangThaiLichHen.DA_XAC_NHAN);
        return convertToLichHenResponse(lichHenRepository.save(lichHen));
    }

    @Override
    @Transactional
    public HangChoResponseDTO checkIn(String maLichHen) {
        LichHen lichHen = findLichHenById(maLichHen);

        if (lichHen.getTrangThai() != TrangThaiLichHen.DA_XAC_NHAN) {
            throw new BusinessRuleException("Khách hàng chưa được xác nhận lịch hẹn, không thể check-in!");
        }

        LocalDate today = LocalDate.now();
        if (lichHen.getNgayHen() == null || !lichHen.getNgayHen().toLocalDate().equals(today)) {
            throw new BusinessRuleException("Lịch hẹn không phải hôm nay, không thể check-in");
        }

        // Cập nhật trạng thái lịch hẹn
        lichHen.setTrangThai(TrangThaiLichHen.DA_CHECK_IN);
        lichHenRepository.save(lichHen);

        // Tạo Hàng Chờ mới (KHÔNG set MAHC và SO_THU_TU, để Trigger Oracle tự lo)
        HangCho hangCho = HangCho.builder()
                .trangThai(TrangThaiHangCho.DANG_CHO)
                .gioDangKy(LocalDateTime.now())
                .khachHang(lichHen.getKhachHang())
                .lichHen(lichHen)
                .nhanSuPhanCong(lichHen.getNhanSu())
                .build();

        // Lưu vào DB -> Trigger TRG_GEN_MAHC sẽ chạy và tự đắp dữ liệu vào
        HangCho savedHangCho = hangChoRepository.save(hangCho);

        return convertToHangChoResponse(savedHangCho);
    }

    // ==================== PRIVATE MAPPER METHODS ====================

    private LichHen findLichHenById(String maLichHen) {
        return lichHenRepository.findById(maLichHen)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy lịch hẹn mã: " + maLichHen));
    }

    private LichHenResponseDTO convertToLichHenResponse(LichHen entity) {
        String trieuChungStr = entity.getDanhSachTrieuChung() != null ? entity.getDanhSachTrieuChung().stream()
                .map(LichHenTrieuChung::getMoTaTuDo)
                .filter(m -> m != null && !m.isEmpty())
                .collect(Collectors.joining(", ")) : "";

        return LichHenResponseDTO.builder()
                .maLh(entity.getMaLh())
                .tenKhachHang(entity.getKhachHang() != null ? entity.getKhachHang().getHoTen() : null)
                .tenBacSi(entity.getNhanSu() != null ? entity.getNhanSu().getHoTen() : null)
                .ngayHen(entity.getNgayHen() != null ? entity.getNgayHen().toLocalDate() : null)
                .gioHen(entity.getGioHen() != null ? entity.getGioHen().toLocalTime() : null)
                .trieuChung(trieuChungStr)
                .loaiLich(entity.getLoaiLich())
                .trangThai(entity.getTrangThai() != null ? entity.getTrangThai().name() : null)
                .build();
    }

    private HangChoResponseDTO convertToHangChoResponse(HangCho entity) {
        return HangChoResponseDTO.builder()
                .maHangCho(entity.getMaHc())
                .soThuTu(entity.getSoThuTu())
                .tenKhachHang(entity.getKhachHang() != null ? entity.getKhachHang().getHoTen() : null)
                .tenBacSi(entity.getNhanSuPhanCong() != null ? entity.getNhanSuPhanCong().getHoTen() : null)
                .thoiGianBatDauCho(entity.getGioDangKy())
                .thoiGianChoDoiPhut(0L)
                .trangThai(entity.getTrangThai() != null ? entity.getTrangThai().name() : null)
                .build();
    }
}