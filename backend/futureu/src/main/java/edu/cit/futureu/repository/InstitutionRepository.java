package edu.cit.futureu.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import edu.cit.futureu.entity.InstitutionEntity;
import java.util.Optional;

@Repository
public interface InstitutionRepository extends JpaRepository<InstitutionEntity, Integer> {
    
    Optional<InstitutionEntity> findByEmailDomain(String emailDomain);
    Optional<InstitutionEntity> findBySchoolCode(String schoolCode);
    boolean existsByEmailDomain(String emailDomain);
    boolean existsBySchoolCode(String schoolCode);
}