package com.kada.da.modules.booking.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    @JsonFormat(pattern = "yyyy-MM-dd") // Khóa chết format ngày
    private LocalDate ngayHen;

    @NotNull(message = "Giờ hẹn không được để trống")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime gioHen;
}
