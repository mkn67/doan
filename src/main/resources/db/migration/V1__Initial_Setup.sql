
-- =====================================================
-- I. QUẢN LÝ QUYỀN TRUY CẬP (RBAC) & NHÂN SỰ (ĐÃ TÁCH BẢNG CHỨC VỤ)
-- =====================================================

-- Bảng Nhóm Người Dùng (ví dụ: Bác sĩ, Thu ngân, ...)
CREATE TABLE NHOM (
    MANHOM        VARCHAR2(10) PRIMARY KEY, -- Mã nhóm người dùng, Khóa chính
    TENNHOM       NVARCHAR2(100) -- Tên nhóm người dùng
);

-- Bảng Vai Trò/Quyền Hạn (ví dụ: Xem hồ sơ, Quản lý kho, ...)
CREATE TABLE VAITRO (
    MAVAITRO      VARCHAR2(10) PRIMARY KEY, -- Mã vai trò, Khóa chính
    TENVAITRO     NVARCHAR2(100) -- Tên vai trò
);

-- Bảng Trung Gian Gán Vai Trò Vào Nhóm
CREATE TABLE NHOM_VAITRO (
    MANHOM        VARCHAR2(10), -- Mã nhóm, Khóa ngoại
    MAVAITRO      VARCHAR2(10), -- Mã vai trò, Khóa ngoại
    CONSTRAINT PK_NHOM_VAITRO PRIMARY KEY (MANHOM, MAVAITRO), -- Khóa chính tổ hợp
    CONSTRAINT FK_NVT_NHOM FOREIGN KEY (MANHOM) REFERENCES NHOM(MANHOM),
    CONSTRAINT FK_NVT_VAITRO FOREIGN KEY (MAVAITRO) REFERENCES VAITRO(MAVAITRO)
);

-- Bảng Tài Khoản Người Dùng Hệ Thống
CREATE TABLE TAI_KHOAN (
    MATK          VARCHAR2(10) PRIMARY KEY, -- Mã tài khoản, Khóa chính
    MANHOM        VARCHAR2(10), -- Mã nhóm mà tài khoản thuộc về, Khóa ngoại
    USERNAME      VARCHAR2(50) UNIQUE, -- Tên đăng nhập, Duy nhất
    PASSWORD      VARCHAR2(255), -- Mật khẩu (đã mã hóa)
    TRANGTHAI     NUMBER(1), -- Trạng thái hoạt động (1: Hoạt động, 0: Bị khóa)
    CONSTRAINT FK_TK_NHOM FOREIGN KEY (MANHOM) REFERENCES NHOM(MANHOM)
);

-- Bảng Chức Vụ Công Việc
CREATE TABLE CHUC_VU (
    MACV          VARCHAR2(10) PRIMARY KEY, -- Mã chức vụ, Khóa chính
    TENCV         NVARCHAR2(100) -- Tên chức vụ
);

-- Bảng Thông Tin Chi Tiết Nhân Sự
CREATE TABLE NHAN_SU (
    MANS          VARCHAR2(10) PRIMARY KEY, -- Mã nhân sự, Khóa chính
    MATK          VARCHAR2(10) UNIQUE, -- Mã tài khoản liên kết (Mỗi nhân sự 1 tài khoản, Duy nhất)
    MACV          VARCHAR2(10), -- Mã chức vụ đảm nhiệm, Khóa ngoại
    CCCD          VARCHAR2(12), -- Số CCCD/CMND
    HOTEN         NVARCHAR2(100), -- Họ và tên nhân sự
    NGAYSINH      DATE, -- Ngày sinh
    GIOITINH      NVARCHAR2(10), -- Giới tính
    SDT           VARCHAR2(15), -- Số điện thoại liên hệ
    DIACHI        NVARCHAR2(255), -- Địa chỉ thường trú
    CHUYENKHOA    NVARCHAR2(100) NULL, -- Chuyên khoa (Cho phép NULL, chỉ dành cho Bác sĩ)
    CONSTRAINT FK_NS_TK FOREIGN KEY (MATK) REFERENCES TAI_KHOAN(MATK),
    CONSTRAINT FK_NS_CV FOREIGN KEY (MACV) REFERENCES CHUC_VU(MACV)
);

-- =====================================================
-- II. QUẢN LÝ KHÁCH HÀNG & Y KHOA (HỒ SƠ, ĐƠN THUỐC)
-- =====================================================

-- Bảng Thông Tin Chi Tiết Khách Hàng/Bệnh Nhân
CREATE TABLE KHACH_HANG (
    MAKH          VARCHAR2(10) PRIMARY KEY, -- Mã khách hàng, Khóa chính
    CCCD          VARCHAR2(12), -- Số CCCD/CMND
    HOTEN         NVARCHAR2(100), -- Họ và tên khách hàng
    NGAYSINH      DATE, -- Ngày sinh
    GIOITINH      NVARCHAR2(10), -- Giới tính
    SDT           VARCHAR2(15) UNIQUE, -- Số điện thoại (Duy nhất để tra cứu)
    DIACHI        NVARCHAR2(255) -- Địa chỉ
);

-- Bảng Lịch Hẹn Khám/Tư Vấn
CREATE TABLE LICH_HEN (
    MALH          VARCHAR2(10) PRIMARY KEY, -- Mã lịch hẹn, Khóa chính
    MAKH          VARCHAR2(10), -- Mã khách hàng đặt hẹn, Khóa ngoại
    MANS          VARCHAR2(10), -- Mã nhân sự phụ trách lịch hẹn, Khóa ngoại
    NGAYHEN       TIMESTAMP, -- Ngày giờ hẹn khám
    TRANGTHAI     NVARCHAR2(50), -- Trạng thái lịch hẹn (ví dụ: Mới, Đã khám, Đã hủy, ...)
    CONSTRAINT FK_LH_KH FOREIGN KEY (MAKH) REFERENCES KHACH_HANG(MAKH),
    CONSTRAINT FK_LH_NS FOREIGN KEY (MANS) REFERENCES NHAN_SU(MANS)
);

-- Bảng Hồ Sơ Khám Thị Lực (Tạo bởi Bác sĩ)
CREATE TABLE HO_SO_THI_LUC (
    MAHOSO        VARCHAR2(10) PRIMARY KEY, -- Mã hồ sơ khám, Khóa chính
    MAKH          VARCHAR2(10), -- Mã khách hàng được khám, Khóa ngoại
    MANS          VARCHAR2(10), -- Mã bác sĩ thực hiện khám, Khóa ngoại
    NGAYKHAM      TIMESTAMP, -- Ngày giờ khám
    KETLUAN       NVARCHAR2(255), -- Kết luận chung của bác sĩ
    CONSTRAINT FK_HS_KH FOREIGN KEY (MAKH) REFERENCES KHACH_HANG(MAKH),
    CONSTRAINT FK_HS_NS FOREIGN KEY (MANS) REFERENCES NHAN_SU(MANS)
);

-- Bảng Chi Tiết Thị Lực Cho Từng Mắt
CREATE TABLE CHI_TIET_THI_LUC (
    MAHOSO        VARCHAR2(10), -- Mã hồ sơ khám liên kết, Khóa ngoại
    MAT           CHAR(1), -- Mắt khám (P: Phải, T: Trái)
    DOCAU_SPH     NUMBER(4,2), -- Độ cầu (Sphere)
    DOTRU_CYL     NUMBER(4,2), -- Độ trụ (Cylinder)
    TRUC_AX       NUMBER(3), -- Trục (Axis)
    KHOANGCACH_PD NUMBER(3,1), -- Khoảng cách đồng tử (瞳孔間距離, Pupil Distance)
    CONSTRAINT PK_CTTTL PRIMARY KEY (MAHOSO, MAT), -- Khóa chính tổ hợp
    CONSTRAINT FK_CTTTL_HS FOREIGN KEY (MAHOSO) REFERENCES HO_SO_THI_LUC(MAHOSO)
);

-- Bảng Đơn Thuốc Gốc (Cần cập nhật hoặc gộp vào PHIEU_KE_DON)
CREATE TABLE DON_THUOC (
    MADONTHUOC    VARCHAR2(10) PRIMARY KEY, -- Mã đơn thuốc, Khóa chính
    MAHOSO        VARCHAR2(10), -- Mã hồ sơ khám liên kết, Khóa ngoại
    MANS          VARCHAR2(10), -- Mã bác sĩ kê đơn, Khóa ngoại
    NGAYKEDON     DATE, -- Ngày kê đơn
    LOIDAN        NVARCHAR2(255), -- Lời dặn của bác sĩ
    CONSTRAINT FK_DT_HS FOREIGN KEY (MAHOSO) REFERENCES HO_SO_THI_LUC(MAHOSO),
    CONSTRAINT FK_DT_NS FOREIGN KEY (MANS) REFERENCES NHAN_SU(MANS)
);

-- =====================================================
-- III. QUẢN LÝ SẢN PHẨM & KÊ ĐƠN (Hỗ trợ Lenses, Thiết bị, Thuốc, TPCN)
-- =====================================================

-- Bảng Phân Loại Sản Phẩm
CREATE TABLE LOAI_SAN_PHAM (
    MALOAI        VARCHAR2(10) PRIMARY KEY, -- Mã loại, Khóa chính
    TENLOAI       NVARCHAR2(100) -- Tên loại sản phẩm (ví dụ: Kính, Thuốc, ...)
);

-- Bảng Thông Tin Chi Tiết Sản Phẩm
CREATE TABLE SAN_PHAM (
    MASP          VARCHAR2(10) PRIMARY KEY, -- Mã sản phẩm, Khóa chính
    MALOAI        VARCHAR2(10), -- Mã loại sản phẩm, Khóa ngoại
    TENSP         NVARCHAR2(100), -- Tên sản phẩm
    DONVITINH     NVARCHAR2(20), -- Đơn vị tính (ví dụ: Chiếc, Hộp, ...)
    LATHUOC       NUMBER(1), -- Loại sản phẩm (1: Thuốc/TPCN, 0: Kính/Thiết bị)
    GIABAN        NUMBER(15,2), -- Giá bán lẻ niêm yết
    CONSTRAINT FK_SP_LOAI FOREIGN KEY (MALOAI) REFERENCES LOAI_SAN_PHAM(MALOAI)
);

-- Bảng Phiếu Kê Đơn Bao Quát (Lenses, Thiết bị, Thuốc, TPCN)
CREATE TABLE PHIEU_KE_DON (
    MADON         VARCHAR2(10) PRIMARY KEY, -- Mã phiếu kê đơn, Khóa chính
    MAHOSO        VARCHAR2(10), -- Mã hồ sơ khám liên kết, Khóa ngoại
    MANS          VARCHAR2(10), -- Mã bác sĩ kê đơn, Khóa ngoại
    NGAYKEDON     DATE, -- Ngày kê đơn
    LOIDAN        NVARCHAR2(255), -- Lời dặn
    CONSTRAINT FK_PKD_HS FOREIGN KEY (MAHOSO) REFERENCES HO_SO_THI_LUC(MAHOSO),
    CONSTRAINT FK_PKD_NS FOREIGN KEY (MANS) REFERENCES NHAN_SU(MANS)
);

-- Bảng Chi Tiết Sản Phẩm Trong Phiếu Kê Đơn
CREATE TABLE CT_KE_DON (
    MADON         VARCHAR2(10), -- Mã phiếu kê đơn, Khóa ngoại
    MASP          VARCHAR2(10), -- Mã sản phẩm được kê, Khóa ngoại
    SOLUONG       NUMBER, -- Số lượng kê
    LIEUDUNG      NVARCHAR2(100) NULL, -- Liều dùng (Cho phép NULL, chỉ bắt buộc cho Thuốc/TPCN)
    CACHDUNG      NVARCHAR2(100) NULL, -- Cách dùng (Cho phép NULL, chỉ bắt buộc cho Thuốc/TPCN)
    CONSTRAINT PK_CTKD PRIMARY KEY (MADON, MASP), -- Khóa chính tổ hợp
    CONSTRAINT FK_CTKD_PKD FOREIGN KEY (MADON) REFERENCES PHIEU_KE_DON(MADON),
    CONSTRAINT FK_CTKD_SP FOREIGN KEY (MASP) REFERENCES SAN_PHAM(MASP)
);

-- =====================================================
-- IV. QUẢN LÝ NHẬP KHO & LÔ HÀNG
-- =====================================================

-- Bảng Thông Tin Nhà Cung Cấp
CREATE TABLE NHA_CUNG_CAP (
    MANCC         VARCHAR2(10) PRIMARY KEY, -- Mã NCC, Khóa chính
    TENNCC        NVARCHAR2(100), -- Tên nhà cung cấp
    SDT           VARCHAR2(15), -- Số điện thoại liên hệ
    DIACHI        NVARCHAR2(255) -- Địa chỉ nhà cung cấp
);

-- Bảng Phiếu Nhập Kho Goods Received Note (Tạo bởi Thủ kho/QL)
CREATE TABLE PHIEU_NHAP (
    MAPN          VARCHAR2(10) PRIMARY KEY, -- Mã phiếu nhập, Khóa chính
    MANCC         VARCHAR2(10), -- Mã nhà cung cấp giao hàng, Khóa ngoại
    MANS          VARCHAR2(10), -- Mã thủ kho tiếp nhận, Khóa ngoại
    NGAYNHAP      TIMESTAMP, -- Ngày giờ nhập kho
    TONGTIEN      NUMBER(15,2), -- Tổng giá trị đơn nhập kho
    CONSTRAINT FK_PN_NCC FOREIGN KEY (MANCC) REFERENCES NHA_CUNG_CAP(MANCC),
    CONSTRAINT FK_PN_NS FOREIGN KEY (MANS) REFERENCES NHAN_SU(MANS)
);

-- Bảng Thông Tin Chi Tiết Lô Hàng Nhập (Cần quản lý date)
CREATE TABLE LO_HANG (
    MALO          VARCHAR2(10) PRIMARY KEY, -- Mã lô hàng, Khóa chính
    MASP          VARCHAR2(10), -- Mã sản phẩm trong lô, Khóa ngoại
    MAPN          VARCHAR2(10), -- Mã phiếu nhập kho tương ứng, Khóa ngoại
    NGAYSANXUAT   DATE, -- Ngày sản xuất
    NGAYHETHAN    DATE, -- Ngày hết hạn
    SOLUONGNHAP   NUMBER, -- Số lượng sản phẩm nhập kho ban đầu của lô
    SOLUONGTON    NUMBER, -- Số lượng sản phẩm hiện tại còn tồn kho của lô
    GIANHAP       NUMBER(15,2), -- Giá vốn nhập hàng
    CONSTRAINT FK_LO_SP FOREIGN KEY (MASP) REFERENCES SAN_PHAM(MASP),
    CONSTRAINT FK_LO_PN FOREIGN KEY (MAPN) REFERENCES PHIEU_NHAP(MAPN)
);

-- =====================================================
-- V. QUẢN LÝ BÁN HÀNG & XUẤT KHO
-- =====================================================

-- Bảng Thông Tin Hóa Đơn Bán Hàng (Tạo bởi Thu ngân/QL)
CREATE TABLE HOA_DON (
    MAHD          VARCHAR2(10) PRIMARY KEY, -- Mã hóa đơn, Khóa chính
    MAKH          VARCHAR2(10), -- Mã khách hàng mua, Khóa ngoại
    MANS          VARCHAR2(10), -- Mã nhân viên lập hóa đơn, Khóa ngoại
    MAHOSO        VARCHAR2(10) NULL, -- Mã hồ sơ khám (nếu cắt kính theo hồ sơ), Cho phép NULL
    MADONTHUOC    VARCHAR2(10) NULL, -- Mã đơn thuốc (nếu mua theo đơn), Cho phép NULL
    NGAYLAP       TIMESTAMP, -- Ngày giờ lập hóa đơn
    TONGTIEN      NUMBER(15,2), -- Tổng giá trị hóa đơn
    TRANGTHAI     NVARCHAR2(50), -- Trạng thái hóa đơn (ví dụ: Đã thanh toán, Chưa thanh toán, Đã hủy, ...)
    CONSTRAINT FK_HD_KH FOREIGN KEY (MAKH) REFERENCES KHACH_HANG(MAKH),
    CONSTRAINT FK_HD_NS FOREIGN KEY (MANS) REFERENCES NHAN_SU(MANS),
    CONSTRAINT FK_HD_HS FOREIGN KEY (MAHOSO) REFERENCES HO_SO_THI_LUC(MAHOSO),
    CONSTRAINT FK_HD_DT FOREIGN KEY (MADONTHUOC) REFERENCES DON_THUOC(MADONTHUOC)
);

-- Bảng Chi Tiết Sản Phẩm Trong Hóa Đơn
CREATE TABLE CT_HOA_DON (
    MAHD          VARCHAR2(10), -- Mã hóa đơn, Khóa ngoại
    MALO          VARCHAR2(10), -- Mã lô hàng cụ thể để trừ kho, Khóa ngoại
    SOLUONG       NUMBER, -- Số lượng mua
    DONGIA        NUMBER(15,2), -- Đơn giá bán
    CONSTRAINT PK_CTHD PRIMARY KEY (MAHD, MALO), -- Khóa chính tổ hợp
    CONSTRAINT FK_CTHD_HD FOREIGN KEY (MAHD) REFERENCES HOA_DON(MAHD),
    CONSTRAINT FK_CTHD_LO FOREIGN KEY (MALO) REFERENCES LO_HANG(MALO)
);

-- Bảng Thông Tin Thanh Toán Cho Hóa Đơn
CREATE TABLE THANH_TOAN (
    MATT          VARCHAR2(10) PRIMARY KEY, -- Mã thanh toán, Khóa chính
    MAHD          VARCHAR2(10), -- Mã hóa đơn được thanh toán, Khóa ngoại
    NGAYTHANHTOAN TIMESTAMP, -- Ngày giờ thực hiện thanh toán
    SOTIEN        NUMBER(15,2), -- Số tiền thanh toán
    PHUONGTHUC    NVARCHAR2(50), -- Phương thức (ví dụ: Tiền mặt, Chuyển khoản, Thẻ)
    TRANGTHAI     NVARCHAR2(50), -- Trạng thái (ví dụ: Thành công, Thất bại, Đang xử lý)
    CONSTRAINT FK_TT_HD FOREIGN KEY (MAHD) REFERENCES HOA_DON(MAHD)
);

-- Bảng Phiếu Xuất Kho Stock Out Note (Tạo từ Hóa đơn)
CREATE TABLE PHIEU_XUAT (
    MAPX          VARCHAR2(10) PRIMARY KEY, -- Mã phiếu xuất, Khóa chính
    MAHD          VARCHAR2(10), -- Mã hóa đơn yêu cầu xuất, Khóa ngoại
    MANS          VARCHAR2(10), -- Mã nhân viên thực hiện xuất kho, Khóa ngoại
    NGAYXUAT      TIMESTAMP, -- Ngày giờ xuất kho thực tế
    CONSTRAINT FK_PX_HD FOREIGN KEY (MAHD) REFERENCES HOA_DON(MAHD),
    CONSTRAINT FK_PX_NS FOREIGN KEY (MANS) REFERENCES NHAN_SU(MANS)
);

-- Bảng Chi Tiết Sản Phẩm Trong Phiếu Xuất Kho
CREATE TABLE CT_PHIEU_XUAT (
    MAPX          VARCHAR2(10), -- Mã phiếu xuất, Khóa ngoại
    MALO          VARCHAR2(10), -- Mã lô hàng xuất kho cụ thể, Khóa ngoại
    SOLUONGXUAT   NUMBER, -- Số lượng xuất
    CONSTRAINT PK_CTPX PRIMARY KEY (MAPX, MALO), -- Khóa chính tổ hợp
    CONSTRAINT FK_CTPX_PX FOREIGN KEY (MAPX) REFERENCES PHIEU_XUAT(MAPX),
    CONSTRAINT FK_CTPX_LO FOREIGN KEY (MALO) REFERENCES LO_HANG(MALO)
);

-- =====================================================
-- VI. TRIGGERS: RÀNG BUỘC NGHIỆP VỤ (Đã Cập Nhật theo Bảng CHUC_VU)
-- =====================================================

-- 1. Trigger Chặn: Chỉ nhân viên có Chức vụ "Bác sĩ" mới được lập Hồ sơ khám thị lực
CREATE OR REPLACE TRIGGER TRG_CHECK_BS_HOSO
BEFORE INSERT OR UPDATE ON HO_SO_THI_LUC
FOR EACH ROW
DECLARE
    v_tencv CHUC_VU.TENCV%TYPE; -- Biến tạm lưu tên chức vụ
BEGIN
    -- Lấy tên chức vụ từ MANS của hồ sơ mới
    SELECT cv.TENCV INTO v_tencv 
    FROM NHAN_SU ns JOIN CHUC_VU cv ON ns.MACV = cv.MACV 
    WHERE ns.MANS = :NEW.MANS;
    
    -- Nếu không phải Bác sĩ
    IF v_tencv != 'Bác sĩ' THEN
        -- Thông báo lỗi nghiệp vụ và chặn hành động
        RAISE_APPLICATION_ERROR(-20001, 'LỖI: Chỉ nhân sự có chức vụ "Bác sĩ" mới được lập Hồ Sơ!');
    END IF;
END;
/

-- 2. Trigger Chặn: Chỉ nhân viên có Chức vụ "Bác sĩ" mới được Kê Đơn Thuốc
CREATE OR REPLACE TRIGGER TRG_CHECK_BS_DONTHUOC
BEFORE INSERT OR UPDATE ON DON_THUOC
FOR EACH ROW
DECLARE
    v_tencv CHUC_VU.TENCV%TYPE; -- Biến tạm lưu tên chức vụ
BEGIN
    -- Lấy tên chức vụ từ MANS của đơn thuốc mới
    SELECT cv.TENCV INTO v_tencv 
    FROM NHAN_SU ns JOIN CHUC_VU cv ON ns.MACV = cv.MACV 
    WHERE ns.MANS = :NEW.MANS;
    
    -- Nếu không phải Bác sĩ
    IF v_tencv != 'Bác sĩ' THEN
        -- Thông báo lỗi nghiệp vụ và chặn hành động
        RAISE_APPLICATION_ERROR(-20002, 'LỖI: Chỉ nhân sự có chức vụ "Bác sĩ" mới được quyền Kê Đơn Thuốc!');
    END IF;
END;
/

-- 3. Trigger Chặn: Chỉ nhân viên có Chức vụ "Thu ngân" hoặc "Quản lý" mới được lập Hóa đơn bán hàng
CREATE OR REPLACE TRIGGER TRG_CHECK_THUNGAN_HOADON
BEFORE INSERT OR UPDATE ON HOA_DON
FOR EACH ROW
DECLARE
    v_tencv CHUC_VU.TENCV%TYPE; -- Biến tạm lưu tên chức vụ
BEGIN
    -- Lấy tên chức vụ từ MANS của hóa đơn mới
    SELECT cv.TENCV INTO v_tencv 
    FROM NHAN_SU ns JOIN CHUC_VU cv ON ns.MACV = cv.MACV 
    WHERE ns.MANS = :NEW.MANS;
    
    -- Nếu không phải Thu ngân hoặc Quản lý
    IF v_tencv NOT IN ('Thu ngân', 'Quản lý') THEN
        -- Thông báo lỗi nghiệp vụ và chặn hành động
        RAISE_APPLICATION_ERROR(-20003, 'LỖI: Chỉ "Thu ngân" hoặc "Quản lý" mới được phép lập Hóa Đơn!');
    END IF;
END;
/

-- 4. Trigger Chặn: Chỉ nhân viên có Chức vụ "Thủ kho" hoặc "Quản lý" mới được lập Phiếu Nhập kho
CREATE OR REPLACE TRIGGER TRG_CHECK_THUKHO_PHIEUNHAP
BEFORE INSERT OR UPDATE ON PHIEU_NHAP
FOR EACH ROW
DECLARE
    v_tencv CHUC_VU.TENCV%TYPE; -- Biến tạm lưu tên chức vụ
BEGIN
    -- Lấy tên chức vụ từ MANS của phiếu nhập mới
    SELECT cv.TENCV INTO v_tencv 
    FROM NHAN_SU ns JOIN CHUC_VU cv ON ns.MACV = cv.MACV 
    WHERE ns.MANS = :NEW.MANS;
    
    -- Nếu không phải Thủ kho hoặc Quản lý
    IF v_tencv NOT IN ('Thủ kho', 'Quản lý') THEN
        -- Thông báo lỗi nghiệp vụ và chặn hành động
        RAISE_APPLICATION_ERROR(-20004, 'LỖI: Chỉ "Thủ kho" hoặc "Quản lý" mới được lập Phiếu Nhập!');
    END IF;
END;
/
