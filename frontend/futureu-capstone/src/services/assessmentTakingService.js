import apiClient from './api';
import questionService from './questionService';
import choiceService from './choiceService';

/**
 * Service for handling assessment taking functionality
 */
class AssessmentTakingService {
  /**
   * Load questions for a specific assessment
   * @param {number} assessmentId - The assessment ID
   * @returns {Promise<Object>} - Structured assessment data with questions
   */
  async loadAssessmentQuestions(assessmentId = 1) {
    try {
      // Get all questions
      const allQuestions = await questionService.getAllQuestions();
      
      // Load choices for all multiple-choice questions
      for (const question of allQuestions) {
        if (question.questionType === 'Multiple Choice') {
          try {
            const choices = await choiceService.getChoicesByQuestion(question.questionId);
            question.choices = choices || [];
            console.log(`Loaded ${choices.length} choices for question ${question.questionId}`);
          } catch (err) {
            console.error(`Error fetching choices for question ${question.questionId}:`, err);
            question.choices = [];
          }
        }
      }
      
      // Mark RIASEC questions (assessment sub-categories 6-11) - these are Likert scale questions
      const riasecSubCategoryIds = [6, 7, 8, 9, 10, 11];
      allQuestions.forEach(q => {
        if (q.assessmentSubCategory && 
            riasecSubCategoryIds.includes(q.assessmentSubCategory.assessmentSubCategoryId)) {
          q.isRiasecQuestion = true;
          // Set question type to indicate Likert scale questions
          q.questionType = 'Likert';
        }
      });
      
      // Structure to hold organized questions
      const organizedQuestions = {
        gsa: {
          scientificAbility: this.filterAndRandomize(allQuestions, 1, 1, 25),
          readingComprehension: this.filterAndRandomize(allQuestions, 1, 2, 25),
          verbalAbility: this.filterAndRandomize(allQuestions, 1, 3, 25),
          mathematicalAbility: this.filterAndRandomize(allQuestions, 1, 4, 25),
          logicalReasoning: this.filterAndRandomize(allQuestions, 1, 5, 25),
        },
        academicTrack: {
          stem: this.filterAndRandomize(allQuestions, 2, 6, 20),
          abm: this.filterAndRandomize(allQuestions, 2, 7, 20),
          humss: this.filterAndRandomize(allQuestions, 2, 8, 20),
        },
        otherTracks: {
          techVoc: this.filterAndRandomize(allQuestions, 3, null, 15),
          sports: this.filterAndRandomize(allQuestions, 4, null, 15),
          artsDesign: this.filterAndRandomize(allQuestions, 5, null, 15),
        },
        interestAreas: {
          realistic: this.filterAndRandomize(allQuestions, 6, null, 10),
          investigative: this.filterAndRandomize(allQuestions, 7, null, 10),
          artistic: this.filterAndRandomize(allQuestions, 8, null, 10),
          social: this.filterAndRandomize(allQuestions, 9, null, 10),
          enterprising: this.filterAndRandomize(allQuestions, 10, null, 10),
          conventional: this.filterAndRandomize(allQuestions, 11, null, 10),
        }
      };
      
      return organizedQuestions;
    } catch (error) {
      this.handleError(error, 'Loading assessment questions');
      throw error;
    }
  }

  /**
   * Filter questions by subcategory and quiz subcategory, then randomize and limit
   * @param {Array} questions - All questions
   * @param {number} subCategoryId - Assessment sub-category ID
   * @param {number|null} quizSubCategoryId - Quiz sub-category ID (null if not applicable)
   * @param {number} limit - Number of questions to return
   * @returns {Array} - Filtered, randomized questions
   */
  filterAndRandomize(questions, subCategoryId, quizSubCategoryId, limit) {
    // Filter questions by assessment sub-category
    let filtered = questions.filter(q => 
      q.assessmentSubCategory && 
      q.assessmentSubCategory.assessmentSubCategoryId === subCategoryId
    );
    
    // Further filter by quiz sub-category if applicable
    if (quizSubCategoryId) {
      filtered = filtered.filter(q => 
        q.quizSubCategoryCategory && 
        q.quizSubCategoryCategory.quizSubCategoryCategoryId === quizSubCategoryId
      );
    }
    
    // For RIASEC questions (subCategoryId 6-11), ensure they're marked properly
    // These are Likert scale questions
    if (subCategoryId >= 6 && subCategoryId <= 11) {
      filtered.forEach(q => {
        q.isRiasecQuestion = true;
        q.questionType = 'Likert';
      });
    }
    // For non-RIASEC, ensure they're multiple choice and have choices
    else if (filtered.length > 0) {
      filtered = filtered.filter(q => 
        q.questionType === 'Multiple Choice' && 
        q.choices && 
        q.choices.length > 0
      );
    }
    
    // Randomize the order
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    
    // Take only the number needed, or all if not enough
    return shuffled.slice(0, limit);
  }

  /**
   * Submit user answers for an assessment
   * @param {number} assessmentId - The assessment ID
   * @param {Array} answers - User answers
   * @returns {Promise<Object>} - Submission result
   */
  async submitAnswers(assessmentId, answers) {
    try {
      const response = await apiClient.post('/userAssessment/submitAnswers', {
        assessmentId,
        answers
      });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Submitting assessment answers');
      throw error;
    }
  }

  /**
   * Centralized error handling
   * @param {Error} error - The error object
   * @param {string} context - Context where the error occurred
   */
  handleError(error, context = '') {
    console.error(`Assessment taking service error${context ? ' - ' + context : ''}:`, error);
  }
}

export default new AssessmentTakingService();
