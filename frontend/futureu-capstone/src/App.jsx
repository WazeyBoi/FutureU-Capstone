import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AcademicExplorer from './components/AcademicExplorer.jsx';
import AccreditationRatings from './components/AccreditationRatings.jsx';
import AccreditationSection from './components/AccreditationSection.jsx';
import VirtualCampusToursPage from './components/VirtualCampusToursPage.jsx';
import Navigation from './components/Navigation.jsx';
import UserLandingPage from './components/UserLandingPage.jsx';
import CareerPathways from './components/CareerPathways.jsx';
import AssessmentSubCategories from './pages/AssessmentSubCategories.jsx';
import AssessmentCategories from './pages/AssessmentCategories.jsx';
import Assessments from './pages/Assessments.jsx';
import QuizSubCategories from './pages/QuizSubCategories.jsx';
import Questions from './pages/Questions.jsx';
import TakeAssessment from './pages/TakeAssessment.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1">
          <Routes>
            <Route path="/academic-explorer" element={<AcademicExplorer />} />
            <Route path="/accreditation" element={<AccreditationRatings />} />
            <Route path="/accreditation/:section" element={<AccreditationSection />} />
            <Route path="/virtual-campus-tours" element={<VirtualCampusToursPage />} />
            <Route path="/user-landing-page" element={<UserLandingPage />} />
            <Route path="/career-pathways" element={<CareerPathways />} />
            <Route path="/assessments" element={<Assessments />} />
            <Route path="/assessment-categories" element={<AssessmentCategories />} />
            <Route path="/assessment-subcategories" element={<AssessmentSubCategories />} />
            <Route path="/quiz-subcategories" element={<QuizSubCategories />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/take-assessment/:assessmentId" element={<TakeAssessment />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
