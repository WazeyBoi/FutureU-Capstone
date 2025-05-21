package edu.cit.futureu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.ProgramEntity;
import edu.cit.futureu.entity.SchoolEntity;
import edu.cit.futureu.entity.SchoolProgramEntity;

@Repository
public interface SchoolProgramRepository extends JpaRepository<SchoolProgramEntity, Integer> {
    // Find programs by school
    List<SchoolProgramEntity> findBySchool(SchoolEntity school);
    
    // Find schools by program
    List<SchoolProgramEntity> findByProgram(ProgramEntity program);
    
    // Find specific school-program combination
    SchoolProgramEntity findBySchoolAndProgram(SchoolEntity school, ProgramEntity program);
}