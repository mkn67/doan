package com.kada.da.Dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDate;

@Data
public class LichLamViecRequestDTO {
    @NotBlank(message = "Mã nhân sự là bắt buộc")
    private String maNs;

    @NotNull(message = "Ngày làm việc không được để trống")
    @FutureOrPresent(message = "Không thể lên lịch cho quá khứ")
    private LocalDate ngay;

    @NotBlank(message = "Phải chọn ca làm việc")
    private String ca; // Ví dụ: SANG, CHIEU, TOI

    private String ghiChu;
}