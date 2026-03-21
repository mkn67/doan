package com.example.demo.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.Dto.DatLichRequest;
import com.example.demo.Repository.LichHenRepository;
import com.example.demo.Repository.SlotTrongRepository;

import java.util.List;

@Slf4j // Dùng để ghi log quá trình chạy
@Service // BẮT BUỘC: Đánh dấu đây là tầng xử lý nghiệp vụ để Spring Boot nhận diện
@RequiredArgsConstructor // Tự động inject các Repository vào mà không cần @Autowired
public class LichHenService {

    // Gọi các Repository (tầng giao tiếp trực tiếp với Oracle)
    private final LichHenRepository lichHenRepository;
    private final SlotTrongRepository slotTrongRepository;

    /**
     * Xử lý luồng: Đặt lịch khám mới
     */
    @Transactional // RẤT QUAN TRỌNG: Đảm bảo tính toàn vẹn dữ liệu (nếu lỗi giữa chừng sẽ tự động rollback)
    public String taoLichHenMoi(DatLichRequest request) {
        
        log.info("Bắt đầu xử lý đặt lịch cho khách hàng: {}", request.getMaKhachHang());

        // Vì ID (Mã lịch hẹn) do Trigger Oracle tự sinh (TRG_GEN_MALH), 
        // ở đây cậu chỉ việc gọi Repository để lưu data xuống hoặc gọi thẳng Stored Procedure.
        // Ví dụ gọi một Procedure đã định nghĩa trong Repository:
        String maLichHenMoi = lichHenRepository.callSpTaoLichHen(
                request.getMaKhachHang(),
                request.getMaGoiKham(),
                request.getTrieuChung(),
                request.getGioHen()
        );

        log.info("Đặt lịch thành công, mã LH: {}", maLichHenMoi);
        
        // Trả mã lịch hẹn về cho Controller
        return maLichHenMoi; 
    }

    /**
     * Xử lý luồng: Lấy slot trống dựa vào View V_SLOT_TRONG dưới DB
     */
    @Transactional(readOnly = true) // Tối ưu hóa hiệu suất cho các hàm chỉ Đọc (Select)
    public List<Object> laySlotTrongTheoNgay(String maBacSi, String ngayKham) {
        
        log.info("Lấy danh sách slot trống cho bác sĩ {} ngày {}", maBacSi, ngayKham);
        
        // Trực tiếp query vào cái View cực xịn mà cậu đã viết bằng SQL
        return slotTrongRepository.findSlotTrongByMaBacSiAndNgay(maBacSi, ngayKham);
    }
}