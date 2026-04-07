package com.kada.da.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class NhomRequestDTO {
    @NotBlank(message = "Tên nhóm không được trống")
    private String tenNhom; // Ví dụ: Nhóm Y Tá
    private String moTa;
    private List<String> danhSachMaVaiTro; // Nhóm này có những quyền gì?
}