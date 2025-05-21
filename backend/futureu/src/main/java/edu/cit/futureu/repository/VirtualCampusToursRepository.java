package edu.cit.futureu.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import edu.cit.futureu.entity.VirtualCampusToursEntity;
import edu.cit.futureu.entity.SchoolEntity;

@Repository
public interface VirtualCampusToursRepository extends JpaRepository<VirtualCampusToursEntity, Integer> {
    List<VirtualCampusToursEntity> findBySchool(SchoolEntity school);
}