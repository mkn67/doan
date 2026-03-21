package com.example.demo.Exception; 

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Khai báo biến log thủ công ở đây
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleExceptions(Exception ex) {
        
        Throwable rootCause = ex;
        while (rootCause.getCause() != null && rootCause != rootCause.getCause()) {
            rootCause = rootCause.getCause();
        }
        
        String errorMessage = rootCause.getMessage();
        Map<String, String> response = new HashMap<>();

        // 1. Kiểm tra xem có phải lỗi do Trigger Oracle ném ra
        if (errorMessage != null && errorMessage.contains("ORA-20")) {
            
            String cleanMessage = errorMessage;
            
            int startIndex = cleanMessage.indexOf("ORA-20");
            if (startIndex != -1) {
                cleanMessage = cleanMessage.substring(startIndex + 11);
            }
            
            int endIndex = cleanMessage.indexOf("ORA-06512");
            if (endIndex != -1) {
                cleanMessage = cleanMessage.substring(0, endIndex);
            }
            
            int newlineIndex = cleanMessage.indexOf("\n");
            if (newlineIndex != -1) {
                cleanMessage = cleanMessage.substring(0, newlineIndex);
            }

            response.put("error", cleanMessage.trim());
            
            // Ghi log nhẹ nhàng ở mức WARN (Cảnh báo nghiệp vụ)
            log.warn("Nghiệp vụ bị chặn từ DB: {}", cleanMessage.trim()); 
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // 2. Lỗi hệ thống thực sự (Ví dụ: NullPointerException)
        log.error("Lỗi hệ thống nghiêm trọng: ", ex); 
        
        response.put("error", "Lỗi máy chủ nội bộ. Vui lòng liên hệ Admin!");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}