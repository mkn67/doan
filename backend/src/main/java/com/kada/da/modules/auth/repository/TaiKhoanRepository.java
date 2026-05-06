package com.kada.da.Repository;

import com.kada.da.Entity.TaiKhoan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, String> {
    Optional<TaiKhoan> findByUsername(String username);

    boolean existsByUsername(String username);

    @Query("SELECT MAX(t.maTk) FROM TaiKhoan t")
    String findMaxMaTk();
}