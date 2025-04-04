package edu.cit.futureu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.SchoolEntity;

@Repository
public interface SchoolRepository extends JpaRepository<SchoolEntity, Integer> {
    // Search schools by name
    List<SchoolEntity> findByNameContainingIgnoreCase(String name);
    
    // Filter schools by location
    List<SchoolEntity> findByLocationContainingIgnoreCase(String location);
    
    // Filter schools by type (public, private, etc.)
    List<SchoolEntity> findByType(String type);
}