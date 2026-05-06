package com.kada.da.Service.impl;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kada.da.Dto.HangChoHomNayDto;
import com.kada.da.modules.booking.domain.HangCho;
import com.kada.da.modules.booking.repository.HangChoRepository;
import com.kada.da.Service.HangChoService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class HangChoServiceImpl implements HangChoService {

    private final HangChoRepository hangChoRepository;

    @Override
    @Transactional
    public void capNhatTrangThaiHangCho(String maHc, String trangThai, LocalDateTime gioVaoKham) {
        log.info("Gọi SP_CAP_NHAT_HANG_CHO: mã HC={}, trạng thái mới={}, giờ vào khám={}",
                maHc, trangThai, gioVaoKham);

        // Convert LocalDateTime (Java) sang Timestamp (Oracle JDBC)
        java.sql.Timestamp timestampOracle = (gioVaoKham != null) ? java.sql.Timestamp.valueOf(gioVaoKham) : null;

        // Gọi thẳng xuống DB, Oracle sẽ tự xử lý báo lỗi nếu sai luồng trạng thái
        hangChoRepository.capNhatHangCho(maHc, trangThai, timestampOracle);

        log.info("Cập nhật hàng chờ thành công!");
    }

    @Override
    @Transactional(readOnly = true) // ĐÃ SỬA: Tối ưu cho hàm chỉ đọc
    public List<HangChoHomNayDto> getHangChoHomNay() {
        // Lấy list hàng chờ của ngày hôm nay từ Repo (Viết thêm hàm
        // findByGioDangKyToday trong Repo nhé)
        List<HangCho> listHc = hangChoRepository.findHangChoToday();
        LocalDateTime now = LocalDateTime.now();

        return listHc.stream()
                .filter(hc -> hc.getTrangThai() != null && !hc.getTrangThai().name().equals("HOAN_THANH")
                && !hc.getTrangThai().name().equals("BO_VE"))
                .map(hc -> {
                    // Tính số phút chờ
                    long phutCho = java.time.temporal.ChronoUnit.MINUTES.between(hc.getGioDangKy(), now);

                    String tenKhach = hc.getKhachHang() != null ? hc.getKhachHang().getHoTen() : hc.getTenKhach();
                    String tenBs = hc.getNhanSuPhanCong() != null ? hc.getNhanSuPhanCong().getHoTen() : null;
                    String goiKham = (hc.getLichHen() != null && hc.getLichHen().getGoiKham() != null)
                            ? hc.getLichHen().getGoiKham().getTenGoi()
                            : null;

                    return HangChoHomNayDto.builder()
                            .maHc(hc.getMaHc()).soThuTu(hc.getSoThuTu()).loaiKhach(hc.getLoaiKhach())
                            .tenKhach(tenKhach).sdt(hc.getKhachHang() != null ? hc.getKhachHang().getSdt() : null)
                            .tenBacSi(tenBs).goiKham(goiKham)
                            .trangThai(hc.getTrangThai() != null ? hc.getTrangThai().name() : null)
                            .gioDangKy(hc.getGioDangKy()).phutCho(phutCho)
                            .build();
                })
                // ORDER BY: Walk-in lên trước, sau đó xếp theo Số thứ tự
                .sorted(Comparator.comparing((HangChoHomNayDto dto) -> dto.getLoaiKhach().equals("Walk-in") ? 0 : 1)
                        .thenComparing(HangChoHomNayDto::getSoThuTu))
                .collect(Collectors.toList());
    }
}
