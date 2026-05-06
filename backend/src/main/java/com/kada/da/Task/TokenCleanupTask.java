package com.kada.da.Task;

import com.kada.da.modules.auth.repository.TokenBlacklistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Component
@RequiredArgsConstructor
public class TokenCleanupTask {

    private final TokenBlacklistRepository tokenBlacklistRepository;

    // Chạy vào 2:00 AM mỗi ngày
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Bắt đầu dọn dẹp các Token Blacklist đã hết hạn...");

        // Bạn cần thêm hàm này vào TokenBlacklistRepository:
        // void deleteByExpiryDateBefore(LocalDateTime now);
        tokenBlacklistRepository.deleteByExpiryDateBefore(LocalDateTime.now());

        log.info("Dọn dẹp Token Blacklist hoàn tất!");
    }
}