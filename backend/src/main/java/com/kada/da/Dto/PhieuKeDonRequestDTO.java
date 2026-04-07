package com.kada.da.Dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PhieuKeDonRequestDTO {
    @NotBlank(message = "Mã hồ sơ khám không được để trống")
    private String maHoSo;

    @NotBlank(message = "Mã bác sĩ kê đơn không được để trống")
    private String maNs;

    private String loiKhuyen; // Ví dụ: "Hạn chế nhìn máy tính, tái khám sau 3 tháng"
    private String ghiChu;

    @NotEmpty(message = "Đơn phải có ít nhất 1 sản phẩm (thuốc/kính)")
    @Valid
    private List<CtKeDonRequest> danhSachKeDon;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CtKeDonRequest {
        @NotBlank(message = "Mã sản phẩm không được để trống")
        private String maSp;

        private Integer soLuong;
        private String lieuDung; // Ví dụ: "Ngày 2 lần"
        private String cachDung; // Ví dụ: "Nhỏ mắt phải trước khi ngủ"
    }
}