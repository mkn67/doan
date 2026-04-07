package com.kada.da.Dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class HoaDonRequestDTO {
    @NotBlank(message = "Mã khách hàng không được để trống")
    private String maKh;

    @NotBlank(message = "Mã nhân viên lập không được để trống")
    private String maNs;

    private String maHoSo;

    @NotEmpty(message = "Hóa đơn phải có ít nhất một sản phẩm hoặc dịch vụ")
    @Valid
    private List<CtHoaDonDTO> dsSanPhams;

    @Valid
    private List<CtHoaDonDvDTO> dsDichVus;

    private BigDecimal tongTienDuKien; // Frontend tự tính và gửi lên để đối soát

    private String ghiChu; // Thêm cái này cho Lễ tân ghi chú (Ví dụ: Khách hẹn lấy sau)
}