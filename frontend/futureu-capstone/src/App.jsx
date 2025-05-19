import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AcademicExplorer from './components/AcademicExplorer.jsx';
import AccreditationRatings from './components/AccreditationRatings.jsx';
import AccreditationSection from './components/AccreditationSection.jsx';
import VirtualCampusToursPage from './components/VirtualCampusToursPage.jsx';
import Navigation from './components/Navigation.jsx';
import UserLandingPage from './components/UserLandingPage.jsx';
import CareerPathways from './components/CareerPathways.jsx';
import Testimonials from './components/Testimonials.jsx';
import AssessmentSubCategories from './pages/AssessmentSubCategories.jsx';
import AssessmentCategories from './pages/AssessmentCategories.jsx';
import Assessments from './pages/Assessments.jsx';
import QuizSubCategories from './pages/QuizSubCategories.jsx';
import Questions from './pages/Questions.jsx';
import TakeAssessment from './pages/TakeAssessment.jsx';
import AssessmentDashboard from './pages/AssessmentDashboard.jsx';
import AssessmentResults from './pages/AssessmentResults.jsx'; // Ensure this import exists
import StudentRegister from './components/Authentication/StudentRegister.jsx';
import StudentLogin from './components/Authentication/StudentLogin.jsx';
import AdminLogin from './components/Admin/AdminLogin.jsx';
import AdminDashboardTest from './components/Admin/AdminDashboardTest.jsx';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import AdminRoute from './components/AdminRoute';
import Unauthorized from './components/Admin/Unauthorized.jsx';
import './styles/animations.css'; // Import the animations CSS file
import './App.css';
import 'leaflet/dist/leaflet.css';
import SchoolsPage from './components/SchoolsPage.jsx';
 
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
      <Navigation />
      <Routes>
        {/* Redirect root path to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
       
        {/* Public routes - with protection against authenticated access */}
        <Route path="/login" element={
          <PublicRoute>
            <StudentLogin />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <StudentRegister />
          </PublicRoute>
        } />
        
        {/* Admin routes */}
        <Route path="/admin-login" element={
          <PublicRoute>
            <AdminLogin />
          </PublicRoute>
        } />
        <Route path="/admin-dashboard" element={
          <AdminRoute>
            <AdminDashboardTest />
          </AdminRoute>
        } />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Public routes */}
        <Route path="/virtual-campus-tours" element={<VirtualCampusToursPage />} />
        <Route path="/user-landing-page" element={<UserLandingPage />} />
        <Route path="/schools" element={<SchoolsPage />} />
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
        <Route path="/testimonials" element={
          <PrivateRoute>
            <Testimonials />
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
        <Route path="/assessment-dashboard" element={
          <PrivateRoute>
            <AssessmentDashboard />
          </PrivateRoute>
        } />
          <Route path="/assessment-results/:userAssessmentId" element={
            <PrivateRoute>
              <AssessmentResults />
            </PrivateRoute>
          } />
      </Routes>
    </Router>
  );
}
 
export default App;