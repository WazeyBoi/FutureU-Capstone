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
import AssessmentResults from './pages/AssessmentResults.jsx'; 
import StudentRegister from './components/Authentication/StudentRegister.jsx';
import StudentLogin from './components/Authentication/StudentLogin.jsx';
import AdminLogin from './components/Admin/AdminLogin.jsx';
import AdminDashboardTest from './components/Admin/AdminDashboardTest.jsx';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import AdminRoute from './components/AdminRoute';
import Unauthorized from './components/Admin/Unauthorized.jsx';
import './styles/animations.css'; 
import './App.css';
import 'leaflet/dist/leaflet.css';
import SchoolsPage from './components/SchoolsPage.jsx';
import CRUD_School from './components/Admin/CRUD_School.jsx';
import CRUD_Program from './components/Admin/CRUD_Program.jsx';
import CRUD_Accreditation from './components/Admin/CRUD_Accreditation.jsx';
import CRUD_SchoolProgram from './components/Admin/CRUD_SchoolProgram.jsx';
import CRUD_User from './components/Admin/CRUD_User.jsx';
import CRUD_Career from './components/Admin/CRUD_Career.jsx';
import CRUD_Testimony from './components/Admin/CRUD_Testimony.jsx';
import CRUD_Assessment from './components/Admin/CRUD_Assessment.jsx';
// Add any other admin CRUD components you need

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
        <Route path="/admin/login" element={
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
        
        {/* Admin CRUD Routes */}
        <Route path="/admin/users" element={
          <AdminRoute>
            <CRUD_User />
          </AdminRoute>
        } />
        
        {/* Add routes for all other admin tools */}
        <Route path="/admin/testimony" element={
          <AdminRoute>
            <CRUD_Testimony />
          </AdminRoute>
        } />
        
        <Route path="/admin/school" element={
          <AdminRoute>
            <CRUD_School />
          </AdminRoute>
        } />
        
        <Route path="/admin/program" element={
          <AdminRoute>
            <CRUD_Program />
          </AdminRoute>
        } />
        
        <Route path="/admin/accreditation" element={
          <AdminRoute>
            <CRUD_Accreditation />
          </AdminRoute>
        } />
        
        <Route path="/admin/schoolprogram" element={
          <AdminRoute>
            <CRUD_SchoolProgram />
          </AdminRoute>
        } />
        
        <Route path="/admin/recommendation" element={
          <AdminRoute>
            <div>Recommendation Management (Coming Soon)</div>
          </AdminRoute>
        } />
        
        <Route path="/admin/assessment-result" element={
          <AdminRoute>
            <div>Assessment-Result Management (Coming Soon)</div>
          </AdminRoute>
        } />
        
        <Route path="/admin/answer" element={
          <AdminRoute>
            <div>Answer Management (Coming Soon)</div>
          </AdminRoute>
        } />
        
        <Route path="/admin/question" element={
          <AdminRoute>
            <div>Question Management (Coming Soon)</div>
          </AdminRoute>
        } />
        
        <Route path="/admin/choice" element={
          <AdminRoute>
            <div>Choice Management (Coming Soon)</div>
          </AdminRoute>
        } />
        
        <Route path="/admin/user-assessment" element={
          <AdminRoute>
            <div>User-Assessment Management (Coming Soon)</div>
          </AdminRoute>
        } />
        
        <Route path="/admin/assessment" element={
          <AdminRoute>
            <CRUD_Assessment />
          </AdminRoute>
        } />
        
        <Route path="/admin/user-assessment-section-result" element={
          <AdminRoute>
            <div>User-Assessment-Section-Result Management (Coming Soon)</div>
          </AdminRoute>
        } />
        
        <Route path="/admin/assessment-category" element={
          <AdminRoute>
            <div>Assessment-Category Management (Coming Soon)</div>
          </AdminRoute>
        } />
        
        <Route path="/admin/assessment-sub-category" element={
          <AdminRoute>
            <div>Assessment-Sub-Category Management (Coming Soon)</div>
          </AdminRoute>
        } />
        
        <Route path="/admin/quiz-sub-category" element={
          <AdminRoute>
            <div>Quiz-Sub-Category Management (Coming Soon)</div>
          </AdminRoute>
        } />
        
        <Route path="/admin/career" element={
          <AdminRoute>
            <CRUD_Career />
          </AdminRoute>
        } />
        
        {/* For any route that doesn't match */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;