package com.kada.da.Service.impl;

import com.kada.da.Entity.HoaDon;
import com.kada.da.Entity.CtHoaDon;
import com.kada.da.Entity.LoHang;
import com.kada.da.Exception.BusinessRuleException;
import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.Repository.HoaDonRepository;
import com.kada.da.Repository.LoHangRepository;
import com.kada.da.Service.HoaDonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HoaDonServiceImpl implements HoaDonService {

    private final HoaDonRepository hoaDonRepository;
    private final LoHangRepository loHangRepository;

    @Override
    @Transactional
    public HoaDon thanhToanHoaDon(HoaDon hoaDon) {
        // 1. Khởi tạo thông tin hóa đơn
        hoaDon.setMaHd("HD" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        hoaDon.setNgayLap(LocalDateTime.now());
        hoaDon.setTrangThai("Đã thanh toán");

        // 2. Duyệt qua từng dòng chi tiết để trừ kho
        if (hoaDon.getCtHoaDons() == null || hoaDon.getCtHoaDons().isEmpty()) {
            throw new BusinessRuleException("Hóa đơn phải có ít nhất một sản phẩm!");
        }

        BigDecimal tongTien = BigDecimal.ZERO;

        for (CtHoaDon ct : hoaDon.getCtHoaDons()) {
            // Lấy thông tin lô hàng thực tế từ DB
            LoHang loHang = loHangRepository.findById(ct.getLoHang().getMaLo())
                    .orElseThrow(() -> new BusinessRuleException("Lô hàng không tồn tại!"));

            // Kiểm tra tồn kho
            if (loHang.getSoLuongTon() < ct.getSoLuong()) {
                throw new BusinessRuleException("Sản phẩm " + loHang.getSanPham().getTenSp() +
                        " trong lô " + loHang.getMaLo() + " không đủ số lượng tồn!");
            }

            // LOGIC CỐT LÕI: Trừ tồn kho trực tiếp
            loHang.setSoLuongTon(loHang.getSoLuongTon() - ct.getSoLuong());
            loHangRepository.save(loHang);

            // Tính tiền từng dòng
            ct.setHoaDon(hoaDon);
            BigDecimal lineTotal = BigDecimal.valueOf(ct.getDonGia())
                    .multiply(BigDecimal.valueOf(ct.getSoLuong()));
            tongTien = tongTien.add(lineTotal);
        }

        hoaDon.setTongTien(tongTien);

        // 3. Lưu hóa đơn (JPA sẽ tự lưu luôn danh sách CtHoaDon nhờ Cascade)
        return hoaDonRepository.save(hoaDon);
    }

    @Override
    public HoaDon findById(String maHd) {
        return hoaDonRepository.findById(maHd)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hóa đơn mã: " + maHd));
    }
}