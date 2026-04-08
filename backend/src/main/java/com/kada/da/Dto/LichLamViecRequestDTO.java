package com.kada.da.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class LichLamViecRequestDTO {
    @NotBlank(message = "Mã nhân sự không được để trống")
    private String maNs;

    @NotNull(message = "Ngày làm không được để trống")
    private LocalDate ngayLam;

    @NotNull(message = "Giờ bắt đầu không được để trống")
    private Double gioBatDau;

    @NotNull(message = "Giờ kết thúc không được để trống")
    private Double gioKetThuc;

    private Integer isNghi;
}