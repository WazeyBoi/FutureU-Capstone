import React from 'react';
import { motion } from 'framer-motion'; // Need to install: npm install framer-motion

const QuestionItem = ({ question, answer, onAnswerChange, questionNumber }) => {
  // Check question types
  const isMultipleChoice = question.questionType === 'Multiple Choice';
  const isLikert = question.questionType === 'Likert' || question.isRiasecQuestion;

  // Check if multiple choice question has choices
  const hasChoices = isMultipleChoice && question.choices && question.choices.length > 0;
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Formatter: underline a single word from various markers and preserve newlines
  const formatText = (text) => {
    if (!text) return '';
    let t = String(text);

    const requiresUnderline = (fullText) => {
      // Only underline when instructions indicate an underlined/emphasized/bold target
      return /(underlined\s+word|underlined|emphasized|bold\/?emphasized|bold)/i.test(fullText);
    };

    const underlineOneInSegment = (segment) => {
      if (!segment) return segment;
      const words = segment.match(/[A-Za-z]+/g) || [];
      if (words.length === 0) return segment;
      const preferred = words.find(w => /(?:ous|ful|less|ive|able|ible|al|ic|ish|ary|ory|ent|ant|est|er|ly|ed|ing)$/i.test(w));
      const chosen = preferred || words[0];
      let done = false;
      return segment.replace(new RegExp(`\\b${chosen}\\b`), (m) => {
        if (done) return m;
        done = true;
        return `<u>${m}</u>`;
      });
    };

    // Marker-based underlines
    t = t
      .replace(/\[u\]([\s\S]*?)\[\/u\]/g, (_, g1) => underlineOneInSegment(g1))
      .replace(/__([^_]+?)__/g, (_, g1) => underlineOneInSegment(g1))
      .replace(/(^|\W)_([^_]+?)_(?=\W|$)/g, (m, p1, g1) => `${p1}${underlineOneInSegment(g1)}`)
      .replace(/(^|\W)\*([^*]+?)\*(?=\W|$)/g, (m, p1, g1) => `${p1}${underlineOneInSegment(g1)}`);

    // Quote-based underlines: underline the exact quoted token and remove quotes (only if required)
    if (requiresUnderline(t)) {
      t = t
        .replace(/"([^"\n]+)"/g, (m, g1) => `<u>${g1.trim()}</u>`)
        .replace(/“([^”\n]+)”/g, (m, g1) => `<u>${g1.trim()}</u>`);
    }

    // If still no underline, underline from approved vocabulary list (case-insensitive) but only if required
    if (requiresUnderline(t) && !/<u>/i.test(t)) {
      const vocab = [
        'eloquent','resilient','meticulous','testament','unanimous','composure','innovative',
        'modest','fragile','dilapidated','optimistic','torrent','corroborate','concise','enigmatic'
      ];
      for (const w of vocab) {
        const re = new RegExp(`\\b(${w})\\b`, 'i');
        if (re.test(t)) { t = t.replace(re, '<u>$1</u>'); break; }
      }
    }

    // Fallback when prompt mentions underlined word but none provided
    if (requiresUnderline(t) && /underlined\s+word/i.test(t) && !/<u>/i.test(t)) {
      const lines = t.split(/\n+/);
      const body = lines.length > 1 ? lines[1] : lines[0];
      const match = body && body.match(/\b([A-Za-z]+)\b/);
      if (match) {
        const w = match[1];
        t = t.replace(new RegExp(`\\b${w}\\b`), `<u>${w}</u>`);
      }
    }
    return t;
  };

  return (
    <div className="question-container">
      <div className="mb-5">
        <h5 className="text-start font-medium text-[#232D35] mb-2 bg-gray-50 p-4 rounded-lg border-l-4 border-[#1D63A1] shadow-sm flex items-start">
          <span className="inline-flex items-center justify-center w-8 h-8 bg-[#1D63A1] text-white text-sm font-bold rounded-full mr-3 flex-shrink-0">
            {questionNumber}
          </span>
          <span className="whitespace-pre-line" dangerouslySetInnerHTML={{ __html: formatText(question.questionText) }} />
        </h5>
        
        {/* Question meta info - hide for RIASEC/Likert questions */}
        {!isLikert && (
          <div className="flex flex-wrap gap-2 mt-3">
            {question.difficultyLevel && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                question.difficultyLevel === 'EASY' ? 'bg-green-100 text-green-800' :
                question.difficultyLevel === 'MEDIUM' ? 'bg-[#FFB71B]/20 text-[#FFB71B]/90' :
                'bg-red-100 text-red-800'
              }`}>
                {question.difficultyLevel}
              </span>
            )}
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-[#1D63A1]/90">
              {question.questionType || (isLikert ? 'Likert Scale' : '')}
            </span>
          </div>
        )}
      </div>

      {/* Choices for multiple choice question */}
      {hasChoices && (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {question.choices.map((choice, index) => (
            <motion.div key={choice.choiceId} variants={item}>
              <label 
                className={`ml-11 flex items-start px-5 py-2  rounded-lg cursor-pointer transition-all ${
                  answer === choice.choiceId.toString() 
                    ? 'bg-[#1D63A1]/10 shadow-md' 
                    : 'hover:bg-gray-50 border-gray-200 hover:border-[#1D63A1]/50'
                }`}
              >
                <div className="flex">
                  <div 
                    className={`flex-shrink-0 h-5 w-5 mt-1 rounded-full border-2 flex items-center justify-center ${
                      answer === choice.choiceId.toString() 
                        ? 'border-[#1D63A1] bg-[#1D63A1]' 
                        : 'border-gray-300'
                    }`}
                  >
                    {answer === choice.choiceId.toString() && (
                      <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }}
                        className="h-2 w-2 rounded-full bg-white"
                      />
                    )}
                  </div>
                  <input
                    type="radio"
                    name={`question-${question.questionId}`}
                    value={choice.choiceId.toString()}
                    checked={answer === choice.choiceId.toString()}
                    onChange={() => onAnswerChange(choice.choiceId.toString())}
                    className="sr-only"
                  />
                </div>
                <div className="ml-3 flex-1">
                  <span className="text-gray-800 text-left block whitespace-pre-line">{choice.choiceText}</span>
                </div>
              </label>
            </motion.div>
          ))}
        </motion.div>
      )}
      
      {isMultipleChoice && !hasChoices && (
        <div className="bg-[#FFB71B]/10 border-l-4 border-[#FFB71B] p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-[#FFB71B]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-[#232D35]">This multiple choice question is missing its choices.</p>
            </div>
          </div>
        </div>
      )}

      {/* RIASEC 5-Point Likert Scale - Table Structure */}
      {isLikert && (
        <div className="mt-4">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600 font-medium">How much do you agree with this statement?</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Strongly Disagree
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Disagree
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Neutral
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Agree
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Strongly Agree
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  {/* Strongly Disagree */}
                  <td className="border border-gray-300 p-4 text-center">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <label className="cursor-pointer flex flex-col items-center">
                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center mb-2 transition-all ${
                          answer === "1" ? 'border-red-500 bg-red-500' : 'border-gray-300 hover:border-red-400'
                        }`}>
                          {answer === "1" && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-3 w-3 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-xs text-gray-600">1</span>
                        <input 
                          type="radio" 
                          name={`question-${question.questionId}`} 
                          value="1" 
                          checked={answer === "1"} 
                          onChange={() => onAnswerChange("1")} 
                          className="sr-only" 
                        />
                      </label>
                    </motion.div>
                  </td>

                  {/* Disagree */}
                  <td className="border border-gray-300 p-4 text-center">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <label className="cursor-pointer flex flex-col items-center">
                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center mb-2 transition-all ${
                          answer === "2" ? 'border-orange-500 bg-orange-500' : 'border-gray-300 hover:border-orange-400'
                        }`}>
                          {answer === "2" && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-3 w-3 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-xs text-gray-600">2</span>
                        <input 
                          type="radio" 
                          name={`question-${question.questionId}`} 
                          value="2" 
                          checked={answer === "2"} 
                          onChange={() => onAnswerChange("2")} 
                          className="sr-only" 
                        />
                      </label>
                    </motion.div>
                  </td>

                  {/* Neutral */}
                  <td className="border border-gray-300 p-4 text-center">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <label className="cursor-pointer flex flex-col items-center">
                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center mb-2 transition-all ${
                          answer === "3" ? 'border-gray-500 bg-gray-500' : 'border-gray-300 hover:border-gray-400'
                        }`}>
                          {answer === "3" && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-3 w-3 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-xs text-gray-600">3</span>
                        <input 
                          type="radio" 
                          name={`question-${question.questionId}`} 
                          value="3" 
                          checked={answer === "3"} 
                          onChange={() => onAnswerChange("3")} 
                          className="sr-only" 
                        />
                      </label>
                    </motion.div>
                  </td>

                  {/* Agree */}
                  <td className="border border-gray-300 p-4 text-center">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <label className="cursor-pointer flex flex-col items-center">
                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center mb-2 transition-all ${
                          answer === "4" ? 'border-blue-500 bg-blue-500' : 'border-gray-300 hover:border-blue-400'
                        }`}>
                          {answer === "4" && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-3 w-3 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-xs text-gray-600">4</span>
                        <input 
                          type="radio" 
                          name={`question-${question.questionId}`} 
                          value="4" 
                          checked={answer === "4"} 
                          onChange={() => onAnswerChange("4")} 
                          className="sr-only" 
                        />
                      </label>
                    </motion.div>
                  </td>

                  {/* Strongly Agree */}
                  <td className="border border-gray-300 p-4 text-center">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <label className="cursor-pointer flex flex-col items-center">
                        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center mb-2 transition-all ${
                          answer === "5" ? 'border-green-500 bg-green-500' : 'border-gray-300 hover:border-green-400'
                        }`}>
                          {answer === "5" && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="h-3 w-3 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-xs text-gray-600">5</span>
                        <input 
                          type="radio" 
                          name={`question-${question.questionId}`} 
                          value="5" 
                          checked={answer === "5"} 
                          onChange={() => onAnswerChange("5")} 
                          className="sr-only" 
                        />
                      </label>
                    </motion.div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* Scale description */}
          <div className="mt-3 text-center">
            <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
              <span>1 = Strongly Disagree</span>
              <span>•</span>
              <span>3 = Neutral</span>
              <span>•</span>
              <span>5 = Strongly Agree</span>
            </div>
          </div>
        </div>
      )}

      {/* Short answer / essay questions - for any other question types */}
      {!isMultipleChoice && !isLikert && (
        <div className="mt-2">
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1D63A1] focus:border-[#1D63A1]"
            rows="4"
            placeholder="Enter your answer here..."
            value={answer || ''}
            onChange={(e) => onAnswerChange(e.target.value)}
          ></textarea>
        </div>
      )}
    </div>
  );
};

export default QuestionItem;
