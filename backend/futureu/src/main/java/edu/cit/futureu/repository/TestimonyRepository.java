package edu.cit.futureu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.SchoolEntity;
import edu.cit.futureu.entity.TestimonyEntity;
import edu.cit.futureu.entity.UserEntity;

@Repository
public interface TestimonyRepository extends JpaRepository<TestimonyEntity, Integer> {
    // Find testimonies by school
    List<TestimonyEntity> findBySchool(SchoolEntity school);
    
    // Find testimonies by student
    List<TestimonyEntity> findByStudent(UserEntity student);
}