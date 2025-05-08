package edu.cit.futureu.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import edu.cit.futureu.entity.AnswerEntity;
import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.entity.QuestionEntity;

@Repository
public interface AnswerRepository extends JpaRepository<AnswerEntity, Integer> {
    List<AnswerEntity> findByUser(UserEntity user);
    List<AnswerEntity> findByQuestion(QuestionEntity question);
    List<AnswerEntity> findByUserAndQuestion(UserEntity user, QuestionEntity question);
}
