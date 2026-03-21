# Seed Data — Hệ Thống Quản Lý Thị Lực v2.0
## Stack: Oracle SQL + Spring Boot + React.js
## Migration: V1__Initial_Setup.sql (v3) + V2__Feature_Gap_Fix.sql

---

## Thứ tự import (PHẢI theo đúng thứ tự FK dependency)

### NHÓM 1 — RBAC & Nhân sự (V1)
```
01_NHOM.csv           → NHOM
02_VAITRO.csv         → VAITRO
03_NHOM_VAITRO.csv    → NHOM_VAITRO
04_TAI_KHOAN.csv      → TAI_KHOAN
05_CHUC_VU.csv        → CHUC_VU
06_NHAN_SU.csv        → NHAN_SU          ← có IS_DELETED (v3)
```

### NHÓM 2 — Khách hàng & Y khoa (V1 + V2)
```
07_KHACH_HANG.csv     → KHACH_HANG       ← có IS_DELETED (v3)
27_GOI_KHAM.csv       → GOI_KHAM         ← V2: cần trước LICH_HEN
08_LICH_HEN.csv       → LICH_HEN         ← có MAGOI, TRIEU_CHUNG, LOAI_LICH, GIO_HEN (v3)
09_HO_SO_THI_LUC.csv  → HO_SO_THI_LUC
10_CHI_TIET_THI_LUC.csv → CHI_TIET_THI_LUC
11_DON_THUOC.csv      → DON_THUOC
```

### NHÓM 3 — Sản phẩm & Kê đơn (V1)
```
12_LOAI_SAN_PHAM.csv  → LOAI_SAN_PHAM
13_SAN_PHAM.csv       → SAN_PHAM         ← có TON_KHO_TOI_THIEU, DON_VI_TINH_KHO (v3)
14_PHIEU_KE_DON.csv   → PHIEU_KE_DON
15_CT_KE_DON.csv      → CT_KE_DON
```

### NHÓM 4 — Kho (V1)
```
16_NHA_CUNG_CAP.csv   → NHA_CUNG_CAP
17_PHIEU_NHAP.csv     → PHIEU_NHAP
18_LO_HANG.csv        → LO_HANG
```

### NHÓM 5 — Bán hàng (V1)
```
19_HOA_DON.csv        → HOA_DON          ← có IS_DELETED (v3)
20_CT_HOA_DON.csv     → CT_HOA_DON
21_THANH_TOAN.csv     → THANH_TOAN
22_PHIEU_XUAT.csv     → PHIEU_XUAT
23_CT_PHIEU_XUAT.csv  → CT_PHIEU_XUAT
```

### NHÓM 6 — V2 Extensions
```
24_GIO_HANG.csv       → GIO_HANG
25_CT_GIO_HANG.csv    → CT_GIO_HANG
26_DANH_GIA.csv       → DANH_GIA
29_LICH_LAM_VIEC.csv  → LICH_LAM_VIEC
30_HANG_CHO.csv       → HANG_CHO
31_DICH_VU_KHAM.csv   → DICH_VU_KHAM
32_CT_HOA_DON_DV.csv  → CT_HOA_DON_DV
33_LICH_SU_DIEM.csv   → LICH_SU_DIEM
34_KHUYEN_MAI.csv     → KHUYEN_MAI
35_KH_KHUYEN_MAI.csv  → KH_KHUYEN_MAI
```

---

## Lưu ý quan trọng

1. **DISABLE TRIGGERS trước khi seed** — tránh validation conflict:
   ```sql
   ALTER TABLE NHAN_SU     DISABLE ALL TRIGGERS;
   ALTER TABLE KHACH_HANG  DISABLE ALL TRIGGERS;
   ALTER TABLE HO_SO_THI_LUC DISABLE ALL TRIGGERS;
   ALTER TABLE HOA_DON     DISABLE ALL TRIGGERS;
   ALTER TABLE CT_HOA_DON  DISABLE ALL TRIGGERS;
   ALTER TABLE LO_HANG     DISABLE ALL TRIGGERS;
   ALTER TABLE LICH_HEN    DISABLE ALL TRIGGERS;
   ALTER TABLE PHIEU_KE_DON DISABLE ALL TRIGGERS;
   ALTER TABLE PHIEU_NHAP  DISABLE ALL TRIGGERS;
   ALTER TABLE THANH_TOAN  DISABLE ALL TRIGGERS;
   ```

2. **ENABLE TRIGGERS sau khi seed**:
   ```sql
   ALTER TABLE NHAN_SU     ENABLE ALL TRIGGERS;
   -- (lặp lại cho tất cả bảng trên)
   ```

3. **Cột rỗng "" = NULL** trong Oracle — DataSeeder tự convert

4. **Mật khẩu** tất cả tài khoản: `Abc@12345` (đã BCrypt trong file)

---

## Thống kê data

| Bảng               | Rows | Ghi chú                          |
|--------------------|------|----------------------------------|
| NHOM               | 5    | BS, Thu ngân, Thủ kho, QL, KH   |
| VAITRO             | 11   |                                  |
| TAI_KHOAN          | 11   | TK009 bị khóa (TRANGTHAI=0)      |
| NHAN_SU            | 9    | 4 BS, 2 Thu ngân, 2 Thủ kho, 1 QL|
| KHACH_HANG         | 15   | KH001-002 có tài khoản portal    |
| LICH_HEN           | 20   | 15 đã khám, 2 mới (tháng 4)      |
| HO_SO_THI_LUC      | 18   |                                  |
| SAN_PHAM           | 28   | 7 loại sản phẩm                  |
| HOA_DON            | 17   | 15 đã TT, 1 chưa TT, 1 đã hủy   |
| GIO_HANG           | 7    | 2 đã đặt, 3 đang dùng, 1 hủy     |
| DANH_GIA           | 15   | Rating 3-5 sao, test đa dạng     |
| GOI_KHAM           | 4    | Tổng quát, Khúc xạ, CD, Áp tròng|
| LICH_LAM_VIEC      | 37   | 4 bác sĩ, 2 tuần tới             |
| HANG_CHO           | 9    | Simulate ngày 10/04/2025         |
| DICH_VU_KHAM       | 6    |                                  |
| CT_HOA_DON_DV      | 10   |                                  |
| LICH_SU_DIEM       | 16   |                                  |
| KHUYEN_MAI         | 6    | 3 hết hạn, 3 đang active         |
| KH_KHUYEN_MAI      | 10   |                                  |

## Data "có chủ ý" để test

- **LH019, LH020**: Trạng thái "Mới" tháng 4 → test booking flow
- **HD016**: "Chưa thanh toán" → test trigger khóa khi sửa
- **HD017**: "Đã hủy" → test chặn thanh toán
- **TK009**: TRANGTHAI=0 (bị khóa) → test auth reject
- **KH012**: DIEMTICHLUY=785 (VIP) → test quy đổi điểm
- **DG000009**: Rating 3 sao → test hiển thị đa dạng feedback
- **LO030, LO029**: Gần hết hạn → test SP_CANH_BAO_HANG_HET_HAN
- **NS001**: Nghỉ đột xuất 09/04/2025 (IS_NGHI=1) → test V_SLOT_TRONG
