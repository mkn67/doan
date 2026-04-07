package com.kada.da.Dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CtKeDonRequestDTO {

    // Mã phiếu kê đơn (Nếu thêm thuốc vào đơn đã có sẵn)
    // Có thể null nếu gửi kèm cả list trong lúc tạo phiếu mới
    private String maDon;

    @NotBlank(message = "Mã sản phẩm (thuốc/kính) không được để trống")
    private String maSp;

    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải từ 1 trở lên")
    private Integer soLuong;

    @NotBlank(message = "Liều dùng là bắt buộc đối với thuốc")
    private String lieuDung; // Ví dụ: "Ngày 2 lần, mỗi lần 1 viên"

    private String cachDung; // Ví dụ: "Uống sau ăn", "Nhỏ mắt trái"

    private String ghiChu;
}