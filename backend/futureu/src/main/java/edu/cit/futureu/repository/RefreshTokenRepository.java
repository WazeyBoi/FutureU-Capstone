package edu.cit.futureu.repository;

import edu.cit.futureu.entity.RefreshTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshTokenEntity, Long> {
    
    Optional<RefreshTokenEntity> findByToken(String token);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshTokenEntity r WHERE r.userId = :userId")
    void deleteByUserId(@Param("userId") Long userId);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM RefreshTokenEntity r WHERE r.expiryDate < :now")
    void deleteExpiredTokens(@Param("now") LocalDateTime now);
    
    @Modifying
    @Transactional
    @Query("UPDATE RefreshTokenEntity r SET r.revoked = true WHERE r.userId = :userId")
    void revokeAllUserTokens(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(r) FROM RefreshTokenEntity r WHERE r.userId = :userId AND r.revoked = false")
    long countActiveTokensByUserId(@Param("userId") Long userId);
}
