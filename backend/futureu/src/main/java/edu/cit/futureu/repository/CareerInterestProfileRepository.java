package edu.cit.futureu.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.CareerInterestProfileEntity;
import edu.cit.futureu.entity.UserEntity;

@Repository
public interface CareerInterestProfileRepository extends JpaRepository<CareerInterestProfileEntity, Integer> {
    
    // Find all profiles by user
    List<CareerInterestProfileEntity> findByUserOrderByCreatedAtDesc(UserEntity user);
    
    // Find all active profiles by user
    List<CareerInterestProfileEntity> findByUserAndIsActiveTrueOrderByCreatedAtDesc(UserEntity user);
    
    // Find the most recent active profile by user
    @Query("SELECT p FROM CareerInterestProfileEntity p WHERE p.user = :user AND p.isActive = true ORDER BY p.createdAt DESC LIMIT 1")
    Optional<CareerInterestProfileEntity> findMostRecentActiveByUser(@Param("user") UserEntity user);
    
    // Find profiles by user ID
    List<CareerInterestProfileEntity> findByUser_UserIdOrderByCreatedAtDesc(int userId);
    
    // Find active profiles by user ID
    List<CareerInterestProfileEntity> findByUser_UserIdAndIsActiveTrueOrderByCreatedAtDesc(int userId);
    
    // Search profiles by dream career keyword
    @Query("SELECT p FROM CareerInterestProfileEntity p WHERE p.isActive = true AND LOWER(p.dreamCareer) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<CareerInterestProfileEntity> findByDreamCareerContaining(@Param("keyword") String keyword);
    
    // Search profiles by interests/hobbies keyword
    @Query("SELECT p FROM CareerInterestProfileEntity p WHERE p.isActive = true AND LOWER(p.mainInterestsHobbies) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<CareerInterestProfileEntity> findByInterestsContaining(@Param("keyword") String keyword);
}