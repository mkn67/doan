package com.kada.da.Dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class PhieuNhapRequestDTO {

    @NotBlank(message = "Mã nhà cung cấp không được để trống")
    private String maNcc;

    @NotBlank(message = "Mã nhân viên nhập kho không được để trống")
    private String maNs;

    @NotEmpty(message = "Danh sách sản phẩm nhập không được để trống")
    @Valid
    private List<LoHangRequestDTO> loHangList;
}