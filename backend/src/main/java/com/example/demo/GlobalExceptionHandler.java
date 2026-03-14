package com.example.demo;

///Oracle ném lỗi -2000X là nó tóm gọn và biến thành file JSON gửi cho React.
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Bắt các lỗi văng ra từ Oracle Trigger (thường được Spring bọc trong DataAccessException)
    @ExceptionHandler(org.springframework.dao.DataAccessException.class)
    public ResponseEntity<Map<String, String>> handleDatabaseExceptions(Exception ex) {
        String errorMessage = ex.getMessage();
        Map<String, String> response = new HashMap<>();
        
        // Oracle luôn ném lỗi bắt đầu bằng ORA-2000X: LỖI: ...
        if (errorMessage != null && errorMessage.contains("ORA-2000")) {
            // Cắt chuỗi để lấy đúng câu tiếng Việt m đã viết trong Trigger
            String cleanMessage = errorMessage.substring(errorMessage.indexOf("LỖI:"), errorMessage.indexOf("\n")).trim();
            response.put("error", cleanMessage);
            // Trả về mã 400 (Bad Request) cho React
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        response.put("error", "Lỗi hệ thống cơ sở dữ liệu!");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}