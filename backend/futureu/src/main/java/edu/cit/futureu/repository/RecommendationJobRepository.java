package edu.cit.futureu.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.RecommendationJobEntity;

@Repository
public interface RecommendationJobRepository extends JpaRepository<RecommendationJobEntity, Long> {
}
