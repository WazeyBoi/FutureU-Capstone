package edu.cit.futureu.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.CareerEntity;
import edu.cit.futureu.entity.CareerProgramEntity;
import edu.cit.futureu.entity.ProgramEntity;

@Repository
public interface CareerProgramRepository extends JpaRepository<CareerProgramEntity, Integer> {
    List<CareerProgramEntity> findByCareer(CareerEntity career);
    List<CareerProgramEntity> findByProgram(ProgramEntity program);
    Optional<CareerProgramEntity> findByCareerAndProgram(CareerEntity career, ProgramEntity program);
}
