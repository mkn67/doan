package com.kada.da;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import com.kada.da.modules.billing.dto.HoaDonResponseDTO;
import com.kada.da.modules.billing.dto.ThanhToanRequestDTO;
import com.kada.da.modules.billing.dto.ThanhToanResponseDTO;
import com.kada.da.modules.billing.service.HoaDonService;
import com.kada.da.modules.billing.service.ThanhToanService;
import com.kada.da.modules.booking.dto.DatLichResponseDTO;
import com.kada.da.modules.booking.dto.HangChoResponseDTO;
import com.kada.da.modules.booking.dto.LichHenResponseDTO;
import com.kada.da.modules.booking.service.HangChoService;
import com.kada.da.modules.booking.service.LichHenService;
import com.kada.da.modules.examination.service.HoSoThiLucService;
import com.kada.da.modules.prescription.dto.PhieuKeDonRequestDTO;
import com.kada.da.modules.prescription.dto.PhieuKeDonResponseDTO;
import com.kada.da.modules.prescription.dto.XuLyKinhResponseDTO;
import com.kada.da.modules.prescription.service.PhieuKeDonService;
import com.kada.da.modules.prescription.service.XuLyKinhService;

@SpringBootTest
@Transactional
public class WorkflowIntegrationTest {

    @Autowired
    private LichHenService lichHenService;

    @Autowired
    private HangChoService hangChoService;

    @Autowired
    private HoSoThiLucService hoSoThiLucService;

    @Autowired
    private PhieuKeDonService phieuKeDonService;

    @Autowired
    private XuLyKinhService xuLyKinhService;

    @Autowired
    private HoaDonService hoaDonService;

    @Autowired
    private ThanhToanService thanhToanService;

    @Autowired
    private jakarta.persistence.EntityManager entityManager;


    @Test
    public void testCompleteClinicWorkflow() {
        // 1. Đặt lịch hẹn (Appointment booking)
        String maKh = "KH001";
        String maNsBs = "NS005"; // Bác sĩ
        String maNsKtv = "NS006"; // Kỹ thuật viên mắt kính (CV07)
        String maGoi = "GK01"; // Gói khám cơ bản
        LocalDate ngayHen = LocalDate.now(); // Sử dụng ngày hôm nay để khớp ngày khám và lấy đúng gói dịch vụ
        LocalDateTime gioHen = ngayHen.atTime(10, 0);

        System.out.println("--- BƯỚC 1: Đặt lịch hẹn ---");
        DatLichResponseDTO lichHenRes = lichHenService.datLichHen(maKh, maNsBs, maGoi, ngayHen, gioHen);
        assertNotNull(lichHenRes);
        String maLh = lichHenRes.getMaLh();
        assertNotNull(maLh);
        System.out.println("Đặt lịch thành công! Mã lịch hẹn: " + maLh);

        // 2. Xác nhận và check in (Receptionist check-in)
        System.out.println("--- BƯỚC 2: Lễ tân xác nhận và check-in ---");
        LichHenResponseDTO confirmRes = lichHenService.confirmLichHen(maLh);
        assertNotNull(confirmRes);
        
        HangChoResponseDTO checkInRes = lichHenService.checkIn(maLh);
        assertNotNull(checkInRes);
        String maHc = checkInRes.getMaHangCho();
        assertNotNull(maHc);
        System.out.println("Check-in thành công! Mã hàng chờ: " + maHc);

        // Flush Hibernate session to ensure HANG_CHO is inserted in DB before stored procedure runs
        entityManager.flush();

        // 3. Khách hàng vào phòng khám
        System.out.println("--- BƯỚC 3: Khách hàng vào phòng khám ---");
        hangChoService.capNhatTrangThaiHangCho(maHc, "Đang khám", LocalDateTime.now());
        
        // Flush to ensure queue update is persisted
        entityManager.flush();

        // 4. Bác sĩ khám và nhập hồ sơ thị lực, kê đơn kính và thuốc (cả 2)
        System.out.println("--- BƯỚC 4: Bác sĩ nhập hồ sơ thị lực và kê đơn ---");
        
        // Gọi SP lưu hồ sơ khám bệnh để tự sinh hồ sơ và đơn thuốc
        Map<String, String> examResult = hoSoThiLucService.taoHoSoKhamBangSP(
                maKh, maNsBs, "Cận thị nhẹ, cần cắt kính và nhỏ mắt",
                -1.5, -0.5, 90, 0.0,
                -1.25, -0.75, 85, 0.0,
                62.5
        );
        String maHoSo = examResult.get("maHoso");
        String maDon = examResult.get("maDon");
        assertNotNull(maHoSo);
        assertNotNull(maDon);
        System.out.println("Lưu hồ sơ khám thành công! Mã hồ sơ: " + maHoSo + ", Mã đơn thuốc: " + maDon);

        // Flush database changes from stored procedure execution
        entityManager.flush();

        // Bác sĩ thêm sản phẩm vào đơn thuốc (bao gồm cả tròng kính SP001 và thuốc nhỏ mắt SP009)
        System.out.println("--- BƯỚC 4.1: Bác sĩ kê sản phẩm (gọng/tròng & thuốc) ---");
        PhieuKeDonRequestDTO.CtKeDonRequest itemKinh = new PhieuKeDonRequestDTO.CtKeDonRequest();
        itemKinh.setMaSp("SP001"); // Tròng CR-39 đơn tụ chống UV
        itemKinh.setSoLuong(2);

        PhieuKeDonRequestDTO.CtKeDonRequest itemThuoc = new PhieuKeDonRequestDTO.CtKeDonRequest();
        itemThuoc.setMaSp("SP009"); // Nhỏ mắt Systane Ultra (10ml)
        itemThuoc.setSoLuong(1);
        itemThuoc.setLieuDung("Nhỏ 3 lần/ngày");
        itemThuoc.setCachDung("Mỗi lần 1 giọt");

        PhieuKeDonRequestDTO.CtKeDonRequest itemGong = new PhieuKeDonRequestDTO.CtKeDonRequest();
        itemGong.setMaSp("SP004"); // Gọng nhựa Acetate thời trang
        itemGong.setSoLuong(1);

        PhieuKeDonRequestDTO requestKeDon = new PhieuKeDonRequestDTO();
        requestKeDon.setMaHoSo(maHoSo);
        requestKeDon.setMaNs(maNsBs);
        requestKeDon.setDanhSachKeDon(List.of(itemKinh, itemThuoc, itemGong));
        
        PhieuKeDonResponseDTO keDonRes = phieuKeDonService.taoDonThuoc(requestKeDon);
        assertNotNull(keDonRes);
        maDon = keDonRes.getMaDon();
        System.out.println("Đã kê sản phẩm vào đơn thuốc thành công. Mã đơn thuốc mới: " + maDon);

        // Flush to ensure prescription details are saved before creating glasses processing sheet
        entityManager.flush();

        // 5. Giao cho kỹ thuật viên kính và gia công mài lắp kính
        System.out.println("--- BƯỚC 5: Giao cho kỹ thuật viên cắt kính ---");
        String maXl = xuLyKinhService.taoPhieuGiaoKinh(maDon, maNsKtv, "{\"OD\": {\"SPH\": -1.5}, \"OS\": {\"SPH\": -1.25}}");
        assertNotNull(maXl);
        System.out.println("Tạo phiếu xử lý kính thành công! Mã xử lý kính: " + maXl);

        // Flush to write glasses processing sheet to database
        entityManager.flush();

        // Kỹ thuật viên bắt đầu xử lý và hoàn thành gia công
        xuLyKinhService.batDauXuLy(maXl, maNsKtv);
        XuLyKinhResponseDTO hoanThanhRes = xuLyKinhService.hoanThanhXuLy(maXl);
        assertNotNull(hoanThanhRes);
        assertEquals("Hoàn thành", hoanThanhRes.getTrangThai());
        System.out.println("Kỹ thuật viên đã hoàn thành mài lắp kính thành công!");

        // Flush to persist the completed glass status
        entityManager.flush();

        // 6. Chuyển sang bên thu ngân lập hóa đơn
        System.out.println("--- BƯỚC 6: Thu ngân lập hóa đơn ---");
        Map<String, String> hoaDonRes = hoaDonService.taoHoaDonTuJson(maKh, maNsBs, maHoSo, maDon, "", "", "KhamBenh");
        String maHd = hoaDonRes.get("maHd");
        assertNotNull(maHd);
        System.out.println("Lập hóa đơn thành công! Mã hóa đơn: " + maHd);

        // Flush to write invoice to database
        entityManager.flush();

        // 7. Kiểm tra chi tiết hóa đơn
        System.out.println("--- BƯỚC 6.1: Kiểm tra chi tiết hóa đơn (Dịch vụ, Thuốc, Kính) ---");
        List<HoaDonResponseDTO> dsHoaDon = hoaDonService.getAllHoaDon();
        HoaDonResponseDTO currentHd = dsHoaDon.stream()
                .filter(hd -> hd.getMaHd().equals(maHd))
                .findFirst()
                .orElse(null);
        
        assertNotNull(currentHd);
        System.out.println("Hóa đơn tìm thấy: " + currentHd.getMaHd() + " với tổng tiền: " + currentHd.getTongTien() + " đ");

        // Xác nhận dịch vụ khám mắt từ gói GK01 và mài lắp kính được nạp đầy đủ
        assertNotNull(currentHd.getDanhSachDichVu());
        assertTrue(currentHd.getDanhSachDichVu().stream().anyMatch(dv -> dv.getTenDichVu().contains("Khám mắt tổng quát")), "Phải có dịch vụ Khám mắt tổng quát");
        assertTrue(currentHd.getDanhSachDichVu().stream().anyMatch(dv -> dv.getTenDichVu().contains("Đo khúc xạ máy tự động")), "Phải có dịch vụ Đo khúc xạ máy tự động");
        assertTrue(currentHd.getDanhSachDichVu().stream().anyMatch(dv -> dv.getTenDichVu().contains("Mài lắp kính mắt")), "Phải có dịch vụ Mài lắp kính mắt");

        // Xác nhận các sản phẩm (thuốc và kính) được nạp đầy đủ vào hóa đơn
        assertNotNull(currentHd.getDanhSachSanPham());
        assertTrue(currentHd.getDanhSachSanPham().stream().anyMatch(sp -> sp.getTenSanPham().contains("Tròng CR-39 đơn tụ chống UV")), "Phải có sản phẩm tròng kính");
        assertTrue(currentHd.getDanhSachSanPham().stream().anyMatch(sp -> sp.getTenSanPham().contains("Nhỏ mắt Systane Ultra (10ml)")), "Phải có sản phẩm thuốc nhỏ mắt");
        assertTrue(currentHd.getDanhSachSanPham().stream().anyMatch(sp -> sp.getTenSanPham().contains("Gọng nhựa Acetate thời trang")), "Phải có sản phẩm gọng kính");

        // 8. Thực hiện thanh toán hóa đơn
        System.out.println("--- BƯỚC 8: Thực hiện thanh toán hóa đơn ---");
        ThanhToanRequestDTO requestThanhToan = new ThanhToanRequestDTO();
        requestThanhToan.setMaHd(maHd);
        requestThanhToan.setMaNs(maNsBs);
        requestThanhToan.setSoTien(currentHd.getTongTien());
        requestThanhToan.setHinhThucThanhToan("Tiền mặt");

        ThanhToanResponseDTO payRes = thanhToanService.xuLyThanhToan(requestThanhToan);
        assertNotNull(payRes);
        assertNotNull(payRes.getMaGiaoDich());
        System.out.println("Thanh toán thành công! Mã giao dịch: " + payRes.getMaGiaoDich());
    }
}
