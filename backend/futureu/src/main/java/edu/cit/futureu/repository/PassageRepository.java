package edu.cit.futureu.repository;

import edu.cit.futureu.entity.PassageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PassageRepository extends JpaRepository<PassageEntity, Integer> {
    
    /**
     * Find passages by title containing a specific string (case-insensitive)
     */
    List<PassageEntity> findByTitleContainingIgnoreCase(String title);
    
    /**
     * Find passages with their questions loaded
     */
    @Query("SELECT p FROM PassageEntity p LEFT JOIN FETCH p.questions WHERE p.id = :id")
    Optional<PassageEntity> findByIdWithQuestions(@Param("id") int id);
    
    /**
     * Find all passages with their questions loaded
     */
    @Query("SELECT DISTINCT p FROM PassageEntity p LEFT JOIN FETCH p.questions")
    List<PassageEntity> findAllWithQuestions();
    
    /**
     * Find passages ordered by title
     */
    List<PassageEntity> findAllByOrderByTitle();
}
