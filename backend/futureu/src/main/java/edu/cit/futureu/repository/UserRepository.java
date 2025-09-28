package edu.cit.futureu.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import edu.cit.futureu.entity.UserEntity;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Integer> {
    // Find user by email (useful for authentication)
    UserEntity findByEmail(String email);
    
    // Find users by email containing a domain
    List<UserEntity> findByEmailContaining(String domain);
    
    // Find users by school code
    List<UserEntity> findBySchoolCode(String schoolCode);
}
