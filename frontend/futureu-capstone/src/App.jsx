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
import StudentRegister from './components/Authentication/StudentRegister.jsx';
import StudentLogin from './components/Authentication/StudentLogin.jsx';
import PrivateRoute from './components/PrivateRoute';
import './styles/animations.css'; // Import the animations CSS file
import './App.css';

// Add these styles to App.css
/*
@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.animate-float {
  animation-name: float;
  animation-duration: 3s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}
*/

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-1">
          <Routes>
            <Route path="/login" element={<StudentLogin />} />
            <Route path="/register" element={<StudentRegister />} />
            {/* Public routes */}
            <Route path="/virtual-campus-tours" element={<VirtualCampusToursPage />} />
            <Route path="/user-landing-page" element={<UserLandingPage />} />
            {/* Protected routes */}
            <Route path="/academic-explorer" element={
              <PrivateRoute>
                <AcademicExplorer />
              </PrivateRoute>
            } />
            <Route path="/accreditation" element={
              <PrivateRoute>
                <AccreditationRatings />
              </PrivateRoute>
            } />
            <Route path="/accreditation/:section" element={
              <PrivateRoute>
                <AccreditationSection />
              </PrivateRoute>
            } />
            <Route path="/career-pathways" element={
              <PrivateRoute>
                <CareerPathways />
              </PrivateRoute>
            } />
            <Route path="/assessments" element={
              <PrivateRoute>
                <Assessments />
              </PrivateRoute>
            } />
            <Route path="/assessment-categories" element={
              <PrivateRoute>
                <AssessmentCategories />
              </PrivateRoute>
            } />
            <Route path="/assessment-subcategories" element={
              <PrivateRoute>
                <AssessmentSubCategories />
              </PrivateRoute>
            } />
            <Route path="/quiz-subcategories" element={
              <PrivateRoute>
                <QuizSubCategories />
              </PrivateRoute>
            } />
            <Route path="/questions" element={
              <PrivateRoute>
                <Questions />
              </PrivateRoute>
            } />
            <Route path="/take-assessment/:assessmentId" element={
              <PrivateRoute>
                <TakeAssessment />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
