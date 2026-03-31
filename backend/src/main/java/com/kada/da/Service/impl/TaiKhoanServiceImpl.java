package com.kada.da.Service.impl;
import com.kada.da.Entity.TaiKhoan;
import com.kada.da.Repository.TaiKhoanRepository;
import com.kada.da.Service.TaiKhoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TaiKhoanServiceImpl implements TaiKhoanService {

    // Ký hiệu @RequiredArgsConstructor của Lombok sẽ tự động tạo hàm Constructor (tiêm phụ thuộc) cho biến này
    private final TaiKhoanRepository taiKhoanRepository;

    @Override
    public Optional<TaiKhoan> findByUsername(String username) {
        return taiKhoanRepository.findByUsername(username);
    }

    @Override
    @Transactional
    public TaiKhoan createTaiKhoan(TaiKhoan taiKhoan) {
        // Kiểm tra xem username đã tồn tại chưa
        if (taiKhoanRepository.findByUsername(taiKhoan.getUsername()).isPresent()) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại trong hệ thống!");
        }
        
        // Mặc định trạng thái là 1 (Hoạt động) khi tạo mới
        taiKhoan.setTrangThai(1);
        
        // Lưu xuống DB (Oracle)
        return taiKhoanRepository.save(taiKhoan);
    }

    @Override
    @Transactional
    public void lockTaiKhoan(String maTk) {
        // Tìm tài khoản theo mã, nếu không thấy thì ném lỗi
        TaiKhoan taiKhoan = taiKhoanRepository.findById(maTk)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với mã: " + maTk));
        
        // Chuyển trạng thái sang 0 (Bị khóa)
        taiKhoan.setTrangThai(0);
        
        taiKhoanRepository.save(taiKhoan);
    }
}