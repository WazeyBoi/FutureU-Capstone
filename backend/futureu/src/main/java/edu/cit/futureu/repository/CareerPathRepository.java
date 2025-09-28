package edu.cit.futureu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.CareerPathEntity;

@Repository
public interface CareerPathRepository extends JpaRepository<CareerPathEntity, Integer> {
    List<CareerPathEntity> findByCareerPathNameContainingIgnoreCase(String name);
    List<CareerPathEntity> findByCareerPathDescriptionContainingIgnoreCase(String description);
}