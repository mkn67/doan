package com.kada.da.Dto.Response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DanhGiaResponseDTO {
    private String maDg;
    private String tenKhachHang;
    private String sdtKhachHang; // Có SĐT để quản lý gọi điện xin lỗi nếu khách đánh giá 1 sao
    private String tenBacSi;

    private Integer soSao;
    private String noiDung;
    private String phanHoiChiTiet; // Frontend sẽ dùng JSON.parse() để vẽ biểu đồ radar

    private LocalDateTime ngayDg;
    private Boolean isHidden; // Trạng thái ẩn/hiện (Nếu ai chửi bậy thì admin ẩn đi)
}