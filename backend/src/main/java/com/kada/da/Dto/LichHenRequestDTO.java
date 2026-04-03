package com.kada.da.Dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LichHenRequestDTO {

    @NotBlank(message = "Mã khách hàng không được để trống")
    private String maKhachHang;

    @NotBlank(message = "Vui lòng chọn bác sĩ khám")
    private String maBacSi; // Nhân sự

    @NotNull(message = "Ngày hẹn không được để trống")
    @FutureOrPresent(message = "Ngày hẹn phải từ hôm nay trở đi")
    private LocalDate ngayHen;

    @NotNull(message = "Giờ hẹn không được để trống")
    private LocalTime gioHen;

    private String trieuChung;
}