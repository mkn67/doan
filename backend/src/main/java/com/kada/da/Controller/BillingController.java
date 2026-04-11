package com.kada.da.Controller;

import com.kada.da.Dto.TaoHoaDonJsonRequest;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import com.kada.da.Entity.HoaDon;
import com.kada.da.Entity.CtHoaDon;
import com.kada.da.Service.HoaDonService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.text.NumberFormat;
import java.util.Map;
import java.util.Locale;

@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BillingController {

    private final HoaDonService hoaDonService;

    // 1. Lễ tân tạo hóa đơn & Thanh toán (Hệ thống sẽ tự động trừ kho)
    @PostMapping("/pay")
    public ResponseEntity<HoaDon> thanhToanHoaDon(@RequestBody HoaDon hoaDon) {
        // Gọi thẳng vào logic Transactional trừ tiền, trừ kho đã viết
        HoaDon savedHoaDon = hoaDonService.thanhToanHoaDon(hoaDon);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedHoaDon);
    }

    @PostMapping("/tao-tu-json")
    public ResponseEntity<Map<String, String>> taoHoaDonTuJson(@RequestBody TaoHoaDonJsonRequest request) {
        Map<String, String> result = hoaDonService.taoHoaDonTuJson(
                request.getMaKh(), request.getMaNs(), request.getMaHoso(),
                request.getMaDon(), request.getJsonSp(), request.getJsonDv());
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{maHd}")
    public ResponseEntity<Void> huyHoaDon(@PathVariable String maHd) {
        hoaDonService.huyHoaDon(maHd);
        return ResponseEntity.noContent().build();
    }

    // 2. Xuất hóa đơn PDF
    @GetMapping("/{maHd}/export-pdf")
    public void exportToPDF(@PathVariable("maHd") String maHd, HttpServletResponse response) throws IOException {
        // Giả sử ông đã có hàm findById trong HoaDonService
        // Nếu chưa có, hãy thêm: HoaDon findById(String maHd); vào Service
        HoaDon hoaDon = hoaDonService.findById(maHd);

        response.setContentType("application/pdf");
        String headerKey = HttpHeaders.CONTENT_DISPOSITION;
        String headerValue = "attachment; filename=HoaDon_" + maHd + ".pdf";
        response.setHeader(headerKey, headerValue);

        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());

        document.open();
        Font fontTitle = FontFactory.getFont(FontFactory.HELVETICA_BOLD);
        fontTitle.setSize(18);

        Paragraph title = new Paragraph("HOA DON BAN HANG", fontTitle);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(title);

        document.add(new Paragraph("Ma hoa don: " + hoaDon.getMaHd()));
        document.add(new Paragraph("Ngay lap: " + hoaDon.getNgayLap().toString()));
        document.add(new Paragraph(
                "Khach hang: " + (hoaDon.getKhachHang() != null ? hoaDon.getKhachHang().getHoTen() : "Khach le")));
        document.add(new Paragraph("------------------------------------------------------------------"));

        // Chi tiết mặt hàng
        if (hoaDon.getCtHoaDons() != null) {
            for (CtHoaDon ct : hoaDon.getCtHoaDons()) {
                String line = String.format("- %s | SL: %d | DG: %s",
                        ct.getLoHang().getSanPham().getTenSp(),
                        ct.getSoLuong(),
                        ct.getDonGia());
                document.add(new Paragraph(line));
            }
        }

        document.add(new Paragraph("------------------------------------------------------------------"));

        NumberFormat currencyVN = NumberFormat.getCurrencyInstance(Locale.of("vi", "VN"));
        Paragraph total = new Paragraph("TONG TIEN: " + currencyVN.format(hoaDon.getTongTien()));
        total.setAlignment(Paragraph.ALIGN_RIGHT);
        document.add(total);

        document.close();
    }
}