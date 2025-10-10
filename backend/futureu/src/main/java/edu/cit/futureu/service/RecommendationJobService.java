package edu.cit.futureu.service;

import java.time.LocalDateTime;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.task.TaskExecutor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import edu.cit.futureu.entity.AssessmentResultEntity;
import edu.cit.futureu.entity.RecommendationJobEntity;
import edu.cit.futureu.entity.UserAssessmentEntity;
import edu.cit.futureu.recommendation.AdvancedRecommendationResponse;
import edu.cit.futureu.recommendation.StructuredRecommendationService;
import edu.cit.futureu.repository.RecommendationJobRepository;

@Service
public class RecommendationJobService {

    private static final Logger logger = LoggerFactory.getLogger(RecommendationJobService.class);

    @Autowired
    private RecommendationJobRepository jobRepository;

    @Autowired
    private UserAssessmentService userAssessmentService;

    @Autowired
    private AssessmentResultService assessmentResultService;

    @Autowired
    private StructuredRecommendationService structuredRecommendationService;

    @Autowired
    private RecommendationPersistenceService recommendationPersistenceService;

    @Autowired
    private TaskExecutor taskExecutor;

    public RecommendationJobEntity enqueueJob(Integer userAssessmentId) {
        RecommendationJobEntity job = new RecommendationJobEntity();
        job.setUserAssessmentId(userAssessmentId);
        job.setStatus("QUEUED");
        job.setCreatedAt(LocalDateTime.now());
    job = jobRepository.save(job);

    // Submit async task using captured jobId
    final Long queuedJobId = job.getId();
    taskExecutor.execute(() -> runJob(queuedJobId));

        return job;
    }

    @Transactional
    protected void runJob(Long jobId) {
        Optional<RecommendationJobEntity> jobOpt = jobRepository.findById(jobId);
        if (jobOpt.isEmpty()) return;
        RecommendationJobEntity job = jobOpt.get();
        job.setStatus("RUNNING");
        jobRepository.save(job);

        try {
            Integer userAssessmentId = job.getUserAssessmentId();
            Optional<UserAssessmentEntity> uaOpt = userAssessmentService.getUserAssessmentById(userAssessmentId);
            if (uaOpt.isEmpty()) {
                job.setStatus("FAILED");
                job.setMessage("User assessment not found");
                job.setFinishedAt(LocalDateTime.now());
                jobRepository.save(job);
                return;
            }

            UserAssessmentEntity userAssessment = uaOpt.get();
            Optional<AssessmentResultEntity> resOpt = assessmentResultService.getAssessmentResultByUserAssessment(userAssessment);
            if (resOpt.isEmpty()) {
                job.setStatus("FAILED");
                job.setMessage("Assessment result not found");
                job.setFinishedAt(LocalDateTime.now());
                jobRepository.save(job);
                return;
            }

            AssessmentResultEntity assessmentResult = resOpt.get();

            // Generate structured recommendations (this may be long-running)
            AdvancedRecommendationResponse structured = structuredRecommendationService.generate(userAssessment);

            // Persist to DB
            recommendationPersistenceService.persistRecommendations(assessmentResult, structured);

            job.setStatus("SUCCEEDED");
            job.setMessage("Completed successfully");
            job.setFinishedAt(LocalDateTime.now());
            jobRepository.save(job);

        } catch (Exception e) {
            logger.error("Job {} failed: {}", jobId, e.getMessage(), e);
            job.setStatus("FAILED");
            job.setMessage(e.getMessage());
            job.setFinishedAt(LocalDateTime.now());
            jobRepository.save(job);
        }
    }

    public Optional<RecommendationJobEntity> getJob(Long jobId) {
        return jobRepository.findById(jobId);
    }
}
