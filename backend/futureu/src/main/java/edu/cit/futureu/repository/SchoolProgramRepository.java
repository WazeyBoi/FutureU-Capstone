
package edu.cit.futureu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.AccreditationEntity;
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
    
    // Find school programs by accreditation
    List<SchoolProgramEntity> findByAccreditation(AccreditationEntity accreditation);
    
    // Find school programs by accreditation ID
    List<SchoolProgramEntity> findByAccreditation_AccredId(Integer accredId);
    
    // Find school programs by department
    List<SchoolProgramEntity> findByDepartment(String department);
    
    // Find school programs by department containing (case-insensitive search)
    List<SchoolProgramEntity> findByDepartmentContainingIgnoreCase(String department);
    
    // Find school programs by school and department
    List<SchoolProgramEntity> findBySchoolAndDepartment(SchoolEntity school, String department);
    
    // Find school programs by program and department
    List<SchoolProgramEntity> findByProgramAndDepartment(ProgramEntity program, String department);
}