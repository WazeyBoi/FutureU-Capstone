package edu.cit.futureu.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.CareerPathEntity;
import edu.cit.futureu.entity.ProgramCareerPathEntity;
import edu.cit.futureu.entity.ProgramEntity;

@Repository
public interface ProgramCareerPathRepository extends JpaRepository<ProgramCareerPathEntity, Integer> {
    List<ProgramCareerPathEntity> findByProgram(ProgramEntity program);
    List<ProgramCareerPathEntity> findByCareerPath(CareerPathEntity careerPath);
    Optional<ProgramCareerPathEntity> findByProgramAndCareerPath(ProgramEntity program, CareerPathEntity careerPath);
}