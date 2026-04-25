package com.kada.da.Repository;

import com.kada.da.Entity.TokenBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface TokenBlacklistRepository extends JpaRepository<TokenBlacklist, Long> {

    // Hàm dùng để check xem token có bị cấm không (dùng cho JwtAuthFilter)
    boolean existsByToken(String token);

    // BỔ SUNG HÀM NÀY ĐỂ DỌN RÁC (Dùng cho TokenCleanupTask)
    // Tớ dùng @Modifying và @Query để ép JPA chạy 1 câu lệnh DELETE tổng lực (Bulk
    // Delete),
    // như vậy sẽ nhanh và nhẹ cho Oracle hơn rất nhiều so với việc xóa từng dòng.
    @Modifying
    @Query("DELETE FROM TokenBlacklist t WHERE t.expiryDate < :now")
    void deleteByExpiryDateBefore(@Param("now") LocalDateTime now);
}