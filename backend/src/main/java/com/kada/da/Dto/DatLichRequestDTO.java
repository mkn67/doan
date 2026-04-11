package com.kada.da.Dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DatLichRequestDTO {

    @NotBlank(message = "Mã khách hàng không được để trống")
    private String maKh;

    @NotBlank(message = "Vui lòng chọn bác sĩ khám")
    private String maNs;

    @NotBlank(message = "Vui lòng chọn gói khám")
    private String maGoi;

    @NotNull(message = "Ngày hẹn không được để trống")
    @FutureOrPresent(message = "Ngày hẹn phải từ hôm nay trở đi")
    private LocalDate ngayHen;

    @NotNull(message = "Giờ hẹn không được để trống")
    private LocalDateTime gioHen;
}