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

	@Test
	void contextLoads() {
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




