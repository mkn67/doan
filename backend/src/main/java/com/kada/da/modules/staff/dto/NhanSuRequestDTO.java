package com.kada.da.modules.staff.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class NhanSuRequestDTO {

    // --- Thông tin cho bảng TAI_KHOAN ---
    @NotBlank(message = "Tên đăng nhập không được để trống")
    private String username;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 6, message = "Mật khẩu phải có ít nhất 6 ký tự")
    private String password;

    // --- Thông tin cho bảng TAIKHOAN_NHOM (Phân quyền) ---
    @NotBlank(message = "Phải chỉ định nhóm quyền (maNhom)")
    private String maNhom; // Ví dụ: NH01, NH06...

    // --- Thông tin cho bảng NHAN_SU ---
    private String maNs; // Null khi thêm mới, dùng khi cập nhật

    @NotBlank(message = "Họ tên nhân sự không được để trống")
    private String hoTen;

    @NotBlank(message = "Số điện thoại là bắt buộc")
    @Pattern(regexp = "^(0|\\+84)(\\s|\\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\\d)(\\s|\\.)?(\\d{3})(\\s|\\.)?(\\d{3})$", message = "Số điện thoại không đúng định dạng Việt Nam")
    private String sdt;

    @Email(message = "Email không hợp lệ")
    private String email;

    private String diaChi;
    private LocalDate ngaySinh;
    private String gioiTinh;
    private String cccd;

    private String maChucVu; // Có thể suy ra từ maNhom hoặc để riêng

    private String chuyenKhoa; // Dành riêng cho Bác sĩ (NH01)
}
