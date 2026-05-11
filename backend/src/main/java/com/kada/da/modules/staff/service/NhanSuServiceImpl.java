package com.kada.da.modules.staff.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kada.da.Exception.ResourceNotFoundException;
import com.kada.da.modules.auth.domain.TaiKhoan;
import com.kada.da.modules.auth.repository.TaiKhoanRepository; // IMPORT REPOSITORY
import com.kada.da.modules.report.domain.VRatingBacSi;
import com.kada.da.modules.report.dto.TopBacSiDTO;
import com.kada.da.modules.report.repository.VRatingBacSiRepository;
import com.kada.da.modules.staff.domain.ChucVu;
import com.kada.da.modules.staff.domain.NhanSu;
import com.kada.da.modules.staff.domain.Nhom;
import com.kada.da.modules.staff.dto.NhanSuRequestDTO;
import com.kada.da.modules.staff.dto.NhanSuResponseDTO;
import com.kada.da.modules.staff.dto.PageResponseDTO;
import com.kada.da.modules.staff.repository.ChucVuRepository;
import com.kada.da.modules.staff.repository.NhanSuRepository;
import com.kada.da.modules.staff.repository.NhomRepository; // FIX LỖI 1: QUÊN IMPORT LIST

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NhanSuServiceImpl implements NhanSuService {

    private final NhanSuRepository nhanSuRepository;
    private final ChucVuRepository chucVuRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final NhomRepository nhomRepository;
    private final PasswordEncoder passwordEncoder;

    private final VRatingBacSiRepository vRatingBacSiRepository;

    @Override
    @Transactional
    public NhanSuResponseDTO createNhanSu(NhanSuRequestDTO request) {
        // 1. Tạo tài khoản
        if (taiKhoanRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }

        TaiKhoan taiKhoan = new TaiKhoan();
        taiKhoan.setMaTk("TK" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        taiKhoan.setUsername(request.getUsername());
        taiKhoan.setPassword(passwordEncoder.encode(request.getPassword()));
        taiKhoan.setLoaiTk("INTERNAL");
        taiKhoan.setTrangThai(1);
        taiKhoan.setDanhSachNhom(new ArrayList<>());

        // 2. Gán nhóm quyền
        Nhom nhomQuyen = nhomRepository.findById(request.getMaNhom())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhóm quyền: " + request.getMaNhom()));
        taiKhoan.getDanhSachNhom().add(nhomQuyen);
        TaiKhoan savedTk = taiKhoanRepository.save(taiKhoan);

        // 3. Tạo hồ sơ nhân sự
        ChucVu chucVu = null;
        if (request.getMaChucVu() != null) {
            chucVu = chucVuRepository.findById(request.getMaChucVu()).orElse(null);
        }

        NhanSu nhanSu = NhanSu.builder()
                .maNs("NS" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .hoTen(request.getHoTen())
                .sdt(request.getSdt())
                .taiKhoan(savedTk)
                .chucVu(chucVu)
                .chuyenKhoa(request.getChuyenKhoa())
                .isDeleted(0)
                .build();
        return mapToResponse(nhanSuRepository.save(nhanSu));
    }

    @Override
    @Transactional(readOnly = true)
    public NhanSuResponseDTO updateNhanSu(String maNs, NhanSuRequestDTO request) {
        NhanSu nhanSu = nhanSuRepository.findById(maNs)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân sự: " + maNs));

        ChucVu chucVu = chucVuRepository.findById(request.getMaChucVu())
                .orElseThrow(() -> new ResourceNotFoundException(
                "Không tìm thấy chức vụ: " + request.getMaChucVu()));

        nhanSu.setHoTen(request.getHoTen());
        nhanSu.setSdt(request.getSdt());
        nhanSu.setNgaySinh(request.getNgaySinh());
        nhanSu.setGioiTinh(request.getGioiTinh());
        nhanSu.setDiaChi(request.getDiaChi());
        nhanSu.setChucVu(chucVu);

        return mapToResponse(nhanSuRepository.save(nhanSu));
    }

    @Override
    public NhanSuResponseDTO getNhanSuById(String maNs) {
        return nhanSuRepository.findById(maNs)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân sự: " + maNs));
    }

    @Override
    public PageResponseDTO<NhanSuResponseDTO> getAllNhanSu(int page, int size, String keyword) {
        Pageable pageable = PageRequest.of(page, size);
        // Chỉ lấy nhân sự có isDeleted = 0 (Đang làm việc)
        Page<NhanSu> nhanSuPage = (keyword == null || keyword.isEmpty())
                ? nhanSuRepository.findByIsDeleted(0, pageable)
                : nhanSuRepository.findByHoTenContainingIgnoreCaseAndIsDeleted(keyword, 0, pageable);

        return PageResponseDTO.<NhanSuResponseDTO>builder()
                .content(nhanSuPage.getContent().stream().map(this::mapToResponse)
                        .collect(Collectors.toList()))
                .pageNo(nhanSuPage.getNumber())
                .pageSize(nhanSuPage.getSize())
                .totalElements(nhanSuPage.getTotalElements())
                .totalPages(nhanSuPage.getTotalPages())
                .last(nhanSuPage.isLast())
                .build();
    }

    private NhanSuResponseDTO mapToResponse(NhanSu entity) {
        return NhanSuResponseDTO.builder()
                .maNs(entity.getMaNs())
                .hoTen(entity.getHoTen())
                .sdt(entity.getSdt())
                .diaChi(entity.getDiaChi())
                .ngaySinh(entity.getNgaySinh())
                .gioiTinh(entity.getGioiTinh())
                .tenChucVu(entity.getChucVu() != null ? entity.getChucVu().getTenCv() : null)
                .build();
    }

    @Override
    public List<TopBacSiDTO> getTopBacSiRating() {
        // 1. Gọi Repository lấy list View đã sắp xếp từ DB
        List<VRatingBacSi> listTopView = vRatingBacSiRepository.findAllByOrderByRatingTrungBinhDesc();

        // 2. Map Entity View sang DTO
        return listTopView.stream().map(view -> TopBacSiDTO.builder()
                .maNs(view.getMaNs())
                .tenBacSi(view.getHoTen())
                .tongSoCaKham(view.getTongLuotDanhGia())
                .diemDanhGiaTrungBinh(view.getRatingTrungBinh())
                .build()).collect(Collectors.toList());
    }

    @Override
    public List<NhanSuResponseDTO> getNhanSuByChucVuActive(String maCv) {
        return nhanSuRepository.findByChucVu_MaCvAndIsDeleted(maCv, 0).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}
