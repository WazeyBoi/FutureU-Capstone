package edu.cit.futureu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.ProgramEntity;

@Repository
public interface ProgramRepository extends JpaRepository<ProgramEntity, Integer> {
    // Search programs by name
    List<ProgramEntity> findByProgramNameContainingIgnoreCase(String programName);
}