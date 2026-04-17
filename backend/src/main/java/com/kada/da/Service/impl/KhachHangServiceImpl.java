package com.kada.da.Service.impl;

import com.kada.da.Entity.KhachHang;
import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.Repository.KhachHangRepository;
import com.kada.da.Service.KhachHangService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class KhachHangServiceImpl implements KhachHangService {

    private final KhachHangRepository khachHangRepository;

    @Override
    public List<KhachHang> layTatCaKhachHang() {
        // Chỉ lấy những khách hàng chưa bị xóa mềm (isDeleted = 0 hoặc null)
        return khachHangRepository.findAll().stream()
                .filter(kh -> kh.getIsDeleted() == null || kh.getIsDeleted() == 0)
                .collect(Collectors.toList());
    }

    @Override
    public KhachHang timKhachHangTheoId(String maKh) {
        return khachHangRepository.findById(maKh)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng mã: " + maKh));
    }

    @Override
    public KhachHang timKhachHangTheoSdt(String sdt) {
        // Hàm này ông cần thêm Optional<KhachHang> findBySdt(String sdt); vào
        // KhachHangRepository nhé
        // Tạm thời nếu chưa có hàm đó thì mình dùng vòng lặp, nhưng nên viết trong Repo
        // cho tối ưu
        return layTatCaKhachHang().stream()
                .filter(kh -> sdt.equals(kh.getSdt()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng với SĐT: " + sdt));
    }

    @Override
    @Transactional
    public KhachHang taoMoiKhachHang(KhachHang khachHang) {
        // Sinh mã Khách hàng tự động (Tối đa 10 ký tự theo Entity)
        String generatedMaKh = "KH" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        khachHang.setMaKh(generatedMaKh);

        // Mặc định khách mới: Điểm tích lũy = 0, Chưa bị xóa = 0
        khachHang.setDiemTichLuy(0);
        khachHang.setIsDeleted(0);

        return khachHangRepository.save(khachHang);
    }

    @Override
    @Transactional
    public KhachHang capNhatKhachHang(String maKh, KhachHang khachHangDetails) {
        KhachHang khachHang = timKhachHangTheoId(maKh);

        // Cập nhật các thông tin cho phép sửa
        khachHang.setHoTen(khachHangDetails.getHoTen());
        khachHang.setCccd(khachHangDetails.getCccd());
        khachHang.setNgaySinh(khachHangDetails.getNgaySinh());
        khachHang.setGioiTinh(khachHangDetails.getGioiTinh());
        khachHang.setSdt(khachHangDetails.getSdt());
        khachHang.setDiaChi(khachHangDetails.getDiaChi());

        return khachHangRepository.save(khachHang);
    }

    @Override
    @Transactional
    public void xoaMemKhachHang(String maKh) {
        KhachHang khachHang = timKhachHangTheoId(maKh);
        khachHang.setIsDeleted(1); // 1 = Đã xóa
        khachHangRepository.save(khachHang);
    }

    @Override
    @Transactional
    public void congDiemThuCong(String maKh, Integer soDiem, String lyDo, String maHd) {
        log.info("Gọi SP_CONG_DIEM: khách={}, điểm={}, lý do={}, mã HD={}",
                maKh, soDiem, lyDo, maHd != null ? maHd : "Không có");

        // Bóp cò gọi SP
        khachHangRepository.congDiemThuCong(maKh, soDiem, lyDo, maHd);

        log.info("Cộng điểm thủ công thành công cho khách hàng: {}", maKh);
    }

    @Override
    @Transactional(readOnly = true)
    public String layLichSuKhamMoiNhat(String maKh) {
        log.info("Đang gọi Function Oracle lấy lịch sử cho khách hàng: {}", maKh);
        String ketQua = khachHangRepository.getLichSuKhamCuoi(maKh);
        return (ketQua != null) ? ketQua : "Không thể lấy thông tin lịch sử khám.";
    }
}