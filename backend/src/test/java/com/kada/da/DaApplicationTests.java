package com.kada.da;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.kada.da.modules.examination.repository.HoSoThiLucRepository;
import com.kada.da.modules.staff.repository.NhanSuRepository;

@SpringBootTest
class DaApplicationTests {

	@Autowired
	private HoSoThiLucRepository hoSoThiLucRepository;

	@Autowired
	private NhanSuRepository nhanSuRepository;

	@Autowired
	private com.kada.da.modules.inventory.repository.LoHangRepository loHangRepository;

	@Test
	void contextLoads() {
		// Update batches LO_S18 and LO_S17 for FEFO near expiry testing
		loHangRepository.findById("LO_S18").ifPresent(lo -> {
			lo.setNgayHetHan(java.time.LocalDate.now().plusDays(10));
			loHangRepository.save(lo);
			System.out.println("Updated LO_S18 expiry to " + lo.getNgayHetHan());
		});
		loHangRepository.findById("LO_S17").ifPresent(lo -> {
			lo.setNgayHetHan(java.time.LocalDate.now().plusDays(25));
			loHangRepository.save(lo);
			System.out.println("Updated LO_S17 expiry to " + lo.getNgayHetHan());
		});

		System.out.println("====== HOSO IN DB ======");
		hoSoThiLucRepository.findAll().stream().limit(5).forEach(h -> 
			System.out.println("HoSo: " + h.getMaHoSo() + ", Patient: " + (h.getKhachHang() != null ? h.getKhachHang().getMaKh() : "null"))
		);
		System.out.println("====== NHANSU IN DB ======");
		nhanSuRepository.findAll().stream().limit(5).forEach(n -> 
			System.out.println("NhanSu: " + n.getMaNs() + ", Name: " + n.getHoTen())
		);
		System.out.println("==========================");
	}

}




