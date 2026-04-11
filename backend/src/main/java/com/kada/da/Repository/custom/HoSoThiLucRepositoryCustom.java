package com.kada.da.Repository.custom;

import java.util.Map;

public interface HoSoThiLucRepositoryCustom {
    Map<String, String> luuHoSoKhamBenh(
            String maKhachHang,
            String maBacSi,
            String ketLuan,
            Double matTraiSph, Double matTraiCyl, Integer matTraiAx, Double docongTrai,
            Double matPhaiSph, Double matPhaiCyl, Integer matPhaiAx, Double docongPhai,
            Double pd);
}