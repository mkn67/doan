package com.kada.da.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

// Class này đại diện cho Khóa chính kép: (MAHOSO, MAT)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChiTietThiLucId implements Serializable {
    private String hoSoThiLuc; // Tên biến phải Y HỆT tên biến @ManyToOne trong entity chính
    private String mat;
}