package com.kada.da.Repository;

import com.kada.da.Entity.XuLyKinh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface XuLyKinhRepository extends JpaRepository<XuLyKinh, String> {
}