package com.kada.da.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.kada.da.Entity.NhanSu;

@Repository
public interface  NhanSuRepository extends JpaRepository<NhanSu, String>{
    Optional<NhanSu> findByCccd(String cccd);
}
