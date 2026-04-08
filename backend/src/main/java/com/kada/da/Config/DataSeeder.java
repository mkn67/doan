package com.kada.da.Config;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.jdbc.core.JdbcTemplate;

//@Component
public class DataSeeder implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DataSeeder(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("[DATA SEEDER] Bắt đầu quét file CSV trong resources/data...");
        ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        // Quét toàn bộ file .csv trong folder data
        Resource[] resources = resolver.getResources("classpath:data/*.csv");
        // Sắp xếp theo tên file (01, 02, 03...) để tránh lỗi Foreign Key
        Arrays.sort(resources, Comparator.comparing(Resource::getFilename));
        for (Resource resource : resources) {
            String fileName = resource.getFilename();
            if (fileName == null)
                continue;
            // Lấy tên bảng từ tên file: 01_NHOM.csv -> NHOM
            String tableName = fileName.substring(3, fileName.lastIndexOf("."));
            System.out.println("⏳ Đang nạp dữ liệu cho bảng: " + tableName);
            try (BufferedReader br = new BufferedReader(
                    new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8))) {
                // Đọc dòng đầu tiên lấy tên các cột
                String headerLine = br.readLine();
                if (headerLine == null)
                    continue;
                String[] columns = headerLine.split(",");
                // Tạo câu lệnh SQL động: INSERT INTO TABLE (col1, col2) VALUES (?, ?)
                String placeholders = String.join(",", Collections.nCopies(columns.length, "?"));
                String sql = "INSERT INTO " + tableName + " (" + String.join(",", columns) + ") VALUES (" + placeholders
                        + ")";
                String line;
                int count = 0;
                while ((line = br.readLine()) != null) {
                    // Xử lý giá trị trống hoặc dấu phẩy trong nội dung nếu cần
                    String[] values = line.split(",", -1);
                    // Chuyển "NULL" thành giá trị null thật sự
                    Object[] params = new Object[values.length];
                    for (int i = 0; i < values.length; i++) {
                        params[i] = (values[i] == null || values[i].equalsIgnoreCase("NULL") || values[i].isEmpty())
                                ? null
                                : values[i];
                    }
                    jdbcTemplate.update(sql, params);
                    count++;
                }
                System.out.println("Đã nạp thành công " + count + " dòng vào bảng " + tableName);
            } catch (Exception e) {
                System.err.println("Lỗi khi nạp file " + fileName + ": " + e.getMessage());
            }
        }
        System.out.println("🏁 [DATA SEEDER] Hoàn tất nạp dữ liệu mẫu!");
    }
}