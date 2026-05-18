package com.kada.da.modules.billing.controller;

import java.io.IOException;
import java.text.NumberFormat;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kada.da.modules.billing.domain.CtHoaDon;
import com.kada.da.modules.billing.domain.HoaDon;
import com.kada.da.modules.billing.dto.HoaDonResponseDTO;
import com.kada.da.modules.billing.dto.TaoHoaDonJsonRequest;
import com.kada.da.modules.billing.dto.ThanhToanRequestDTO;
import com.kada.da.modules.billing.mapper.HoaDonMapper;
import com.kada.da.modules.billing.service.HoaDonService;
import com.kada.da.modules.billing.service.ThanhToanService;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;

import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/billing")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class BillingController {

    private final HoaDonService hoaDonService;
    private final ThanhToanService thanhToanService;

    @GetMapping
    public ResponseEntity<List<HoaDonResponseDTO>> getDanhSachHoaDon() {
        return ResponseEntity.ok(hoaDonService.getAllHoaDon());
    }

    @PostMapping("/pay")
    public ResponseEntity<HoaDonResponseDTO> thanhToanHoaDon(@RequestBody HoaDon hoaDon) {
        // Kiểm tra null cho hóa đơn
        if (hoaDon == null) {
            return ResponseEntity.badRequest().build();
        }
        if (hoaDon.getCtHoaDons() == null || hoaDon.getCtHoaDons().isEmpty()) {
            throw new RuntimeException("Hóa đơn phải có ít nhất một sản phẩm!");
        }
        HoaDon savedHoaDon = hoaDonService.thanhToanHoaDon(hoaDon);
        HoaDonResponseDTO dto = HoaDonMapper.toResponse(savedHoaDon);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PostMapping("/process-payment")
    public ResponseEntity<?> taoThanhToan(@RequestBody ThanhToanRequestDTO dto) {
        try {
            // Xử lý thanh toán qua service đúng chuẩn DTO, không truyền entity trực tiếp
            return ResponseEntity.ok(thanhToanService.xuLyThanhToan(dto));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
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
        HoaDon hoaDon = hoaDonService.findById(maHd);

        response.setContentType("application/pdf");
        String headerKey = HttpHeaders.CONTENT_DISPOSITION;
        String headerValue = "attachment; filename=HoaDon_" + maHd + ".pdf";
        response.setHeader(headerKey, headerValue);

        try (Document document = new Document(PageSize.A4)) {
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
        }
    }
}
