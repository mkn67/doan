package com.kada.da.modules.admin.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/admin/database")
@RequiredArgsConstructor
public class DatabaseAdminController {

    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/backup")
    public ResponseEntity<byte[]> backupDatabase() {
        log.info("Bắt đầu tiến trình sao lưu cơ sở dữ liệu logical SQL dump...");
        try {
            StringBuilder dump = new StringBuilder();
            dump.append("-- Vision Care Database Backup\n");
            dump.append("-- Generated on ").append(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)).append("\n\n");

            // Lấy danh sách các bảng của user hiện tại
            List<String> tables = jdbcTemplate.queryForList(
                    "SELECT TABLE_NAME FROM USER_TABLES ORDER BY TABLE_NAME", String.class);

            for (String table : tables) {
                // Bỏ qua flyway hoặc các bảng hệ thống
                if (table.toUpperCase().startsWith("FLYWAY_") || table.toUpperCase().contains("BIN$")) {
                    continue;
                }

                dump.append("-- =========================================================\n");
                dump.append("-- TABLE: ").append(table).append("\n");
                dump.append("-- =========================================================\n");
                dump.append("DELETE FROM ").append(table).append(";\n\n");

                // Lấy thông tin các cột
                List<Map<String, Object>> columns = jdbcTemplate.queryForList(
                        "SELECT COLUMN_NAME, DATA_TYPE FROM USER_TAB_COLUMNS WHERE TABLE_NAME = ? ORDER BY COLUMN_ID", table);

                String colNames = columns.stream()
                        .map(c -> (String) c.get("COLUMN_NAME"))
                        .collect(Collectors.joining(", "));

                // Lấy dữ liệu các hàng
                List<Map<String, Object>> rows = jdbcTemplate.queryForList("SELECT * FROM " + table);
                for (Map<String, Object> row : rows) {
                    dump.append("INSERT INTO ").append(table).append(" (").append(colNames).append(") VALUES (");

                    String valList = columns.stream().map(c -> {
                        String colName = (String) c.get("COLUMN_NAME");
                        Object val = row.get(colName);
                        if (val == null) {
                            return "NULL";
                        }
                        String dataType = (String) c.get("DATA_TYPE");
                        if (dataType.contains("CHAR") || dataType.contains("DATE") || dataType.contains("TIME") || dataType.contains("TIMESTAMP") || dataType.contains("CLOB")) {
                            String strVal = val.toString().replace("'", "''");
                            if (dataType.contains("NCHAR") || dataType.contains("NVARCHAR")) {
                                return "N'" + strVal + "'";
                            }
                            return "'" + strVal + "'";
                        }
                        return val.toString();
                    }).collect(Collectors.joining(", "));

                    dump.append(valList).append(");\n");
                }
                dump.append("\n");
            }

            byte[] dumpBytes = dump.toString().getBytes(StandardCharsets.UTF_8);
            String filename = "visioncare_backup_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".sql";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(dumpBytes);

        } catch (Exception e) {
            log.error("Lỗi khi tạo bản sao lưu database: ", e);
            return ResponseEntity.internalServerError().body(("Lỗi sao lưu: " + e.getMessage()).getBytes(StandardCharsets.UTF_8));
        }
    }

    @PostMapping("/restore")
    @Transactional
    public ResponseEntity<?> restoreDatabase(@RequestParam("file") MultipartFile file) {
        log.info("Bắt đầu khôi phục cơ sở dữ liệu từ file: {}", file.getOriginalFilename());
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "File khôi phục trống rỗng!"));
            }

            // Đọc nội dung file SQL
            StringBuilder sqlBuilder = new StringBuilder();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    // Loại bỏ comment
                    if (!line.trim().startsWith("--")) {
                        sqlBuilder.append(line).append("\n");
                    }
                }
            }

            String sqlContent = sqlBuilder.toString();
            // Tạm thời vô hiệu hóa tất cả các R (Foreign Key Constraints) để tránh lỗi vi phạm khóa ngoại khi khôi phục
            jdbcTemplate.execute(
                    "BEGIN " +
                    "  FOR r IN (SELECT table_name, constraint_name FROM user_constraints WHERE constraint_type = 'R') LOOP " +
                    "    EXECUTE IMMEDIATE 'ALTER TABLE ' || r.table_name || ' DISABLE CONSTRAINT ' || r.constraint_name; " +
                    "  END LOOP; " +
                    "END;");
            log.info("Đã tạm thời vô hiệu hóa toàn bộ ràng buộc khóa ngoại.");

            // Tách các câu lệnh theo dấu chấm phẩy
            String[] statements = sqlContent.split(";");
            int executedCount = 0;
            for (String statement : statements) {
                String trimmed = statement.trim();
                if (!trimmed.isEmpty()) {
                    jdbcTemplate.execute(trimmed);
                    executedCount++;
                }
            }

            // Bật lại các ràng buộc khóa ngoại
            jdbcTemplate.execute(
                    "BEGIN " +
                    "  FOR r IN (SELECT table_name, constraint_name FROM user_constraints WHERE constraint_type = 'R') LOOP " +
                    "    EXECUTE IMMEDIATE 'ALTER TABLE ' || r.table_name || ' ENABLE CONSTRAINT ' || r.constraint_name; " +
                    "  END LOOP; " +
                    "END;");
            log.info("Đã kích hoạt lại toàn bộ ràng buộc khóa ngoại.");

            return ResponseEntity.ok(Map.of(
                    "message", "Khôi phục dữ liệu thành công!",
                    "executedStatements", executedCount
            ));

        } catch (Exception e) {
            log.error("Lỗi khi khôi phục cơ sở dữ liệu: ", e);
            // Cố gắng bật lại các ràng buộc trong trường hợp lỗi xảy ra giữa chừng
            try {
                jdbcTemplate.execute(
                        "BEGIN " +
                        "  FOR r IN (SELECT table_name, constraint_name FROM user_constraints WHERE constraint_type = 'R') LOOP " +
                        "    EXECUTE IMMEDIATE 'ALTER TABLE ' || r.table_name || ' ENABLE CONSTRAINT ' || r.constraint_name; " +
                        "  END LOOP; " +
                        "END;");
            } catch (Exception ex) {
                log.error("Không thể khôi phục ràng buộc khóa ngoại sau lỗi: ", ex);
            }
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Khôi phục thất bại!",
                    "error", e.getMessage()
            ));
        }
    }
}
