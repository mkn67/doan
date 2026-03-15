package com.example.demo;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Bắt mọi lỗi Exception, sau đó mới soi xem có phải từ Oracle không
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleExceptions(Exception ex) {
        
        // Lấy nguyên gốc câu lỗi (nếu bị bọc nhiều lớp bởi Hibernate)
        Throwable rootCause = ex;
        while (rootCause.getCause() != null && rootCause != rootCause.getCause()) {
            rootCause = rootCause.getCause();
        }
        
        String errorMessage = rootCause.getMessage();
        Map<String, String> response = new HashMap<>();

        // 1. Kiểm tra xem có phải lỗi do Trigger Oracle ném ra (Mã ORA-20000 đến ORA-20999)
        if (errorMessage != null && errorMessage.contains("ORA-20")) {
            
            // Xử lý chuỗi an toàn: Bắt đầu từ "ORA-20XXX: "
            String cleanMessage = errorMessage;
            
            // Tìm vị trí chữ ORA-
            int startIndex = cleanMessage.indexOf("ORA-20");
            if (startIndex != -1) {
                // Bỏ qua mã lỗi "ORA-20XXX: ", lấy phần text phía sau
                cleanMessage = cleanMessage.substring(startIndex + 11);
            }
            
            // Cắt bỏ phần râu ria thừa của Oracle (ORA-06512...) nếu có
            int endIndex = cleanMessage.indexOf("ORA-06512");
            if (endIndex != -1) {
                cleanMessage = cleanMessage.substring(0, endIndex);
            }
            
            // Cắt ngang dòng đầu tiên nếu có ký tự xuống dòng
            int newlineIndex = cleanMessage.indexOf("\n");
            if (newlineIndex != -1) {
                cleanMessage = cleanMessage.substring(0, newlineIndex);
            }

            response.put("error", cleanMessage.trim());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // 2. Nếu là các lỗi hệ thống khác không phải của Trigger
        // Print stack trace ra console backend để dễ debug
        ex.printStackTrace(); 
        response.put("error", "Lỗi máy chủ nội bộ. Vui lòng liên hệ Admin!");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}