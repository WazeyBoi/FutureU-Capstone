package edu.cit.futureu.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.cit.futureu.entity.AnswerEntity;
import edu.cit.futureu.entity.UserEntity;
import edu.cit.futureu.entity.QuestionEntity;
import edu.cit.futureu.repository.AnswerRepository;

@Service
public class AnswerService {

    @Autowired
    private AnswerRepository answerRepository;

    public AnswerEntity createAnswer(AnswerEntity answer) {
        return answerRepository.save(answer);
    }

    public List<AnswerEntity> getAllAnswers() {
        return answerRepository.findAll();
    }

    public Optional<AnswerEntity> getAnswerById(int id) {
        return answerRepository.findById(id);
    }

    public List<AnswerEntity> getAnswersByUser(UserEntity user) {
        return answerRepository.findByUser(user);
    }

    public List<AnswerEntity> getAnswersByQuestion(QuestionEntity question) {
        return answerRepository.findByQuestion(question);
    }

    public List<AnswerEntity> getAnswersByUserAndQuestion(UserEntity user, QuestionEntity question) {
        return answerRepository.findByUserAndQuestion(user, question);
    }

    public AnswerEntity updateAnswer(AnswerEntity answer) {
        if (answerRepository.existsById(answer.getAnswerId())) {
            return answerRepository.save(answer);
        }
        return null;
    }

    public boolean deleteAnswer(int id) {
        if (answerRepository.existsById(id)) {
            answerRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
