import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ProfileProvider } from './contexts/ProfileContext';
import AcademicExplorer from './components/AcademicExplorer.jsx';
import AccreditationRatings from './components/AccreditationRatings.jsx';
import AccreditationSection from './components/AccreditationSection.jsx';
import VirtualCampusToursPage from './components/VirtualCampusToursPage.jsx';
import Navigation from './components/Navigation.jsx';
import UserLandingPage from './components/UserLandingPage.jsx';
import CareerPathways from './components/CareerPathways/CareerPathways';
import Testimonials from './components/Testimonials.jsx';
import AboutUsPage from './pages/AboutUsPage.jsx';
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
import AdminDashboardTest from './components/Admin/AdminDashboard.jsx';
import PrivateRoute from './components/routes/PrivateRoute';
import PublicRoute from './components/routes/PublicRoute';
import PublicOrStudentRoute from './components/routes/PublicOrStudentRoute.jsx';
import AdminRoute from './components/routes/AdminRoute';
import CounselorRoute from './components/routes/CounselorRoute.jsx';
import Unauthorized from './components/Admin/Unauthorized.jsx';
import './styles/animations.css'; 
import './App.css';
import 'leaflet/dist/leaflet.css';
import CRUD_School from './components/Admin/adminCRUD/CRUD_School.jsx';
import CRUD_Program from './components/Admin/adminCRUD/CRUD_Program.jsx';
import CRUD_Accreditation from './components/Admin/adminCRUD/CRUD_Accreditation.jsx';
import CRUD_SchoolProgram from './components/Admin/adminCRUD/CRUD_SchoolProgram.jsx';
import CRUD_User from './components/Admin/adminCRUD/CRUD_User.jsx';
import CRUD_Career from './components/Admin/adminCRUD/CRUD_Career.jsx';
import CRUD_CareerPath from './components/Admin/adminCRUD/CRUD_CareerPath.jsx';
import CRUD_Testimony from './components/Admin/adminCRUD/CRUD_Testimony.jsx';
import CRUD_Assessment from './components/Admin/adminCRUD/CRUD_Assessment.jsx';
import CRUD_AssessmentCategory from './components/Admin/adminCRUD/CRUD_AssessmentCategory.jsx';
import CRUD_UserAssessment from './components/Admin/adminCRUD/CRUD_UserAssessment.jsx';
import CRUD_AssessmentSubCategory from './components/Admin/adminCRUD/CRUD_AssessmentSubCategory.jsx'
import CRUD_QuizSubCategory from './components/Admin/adminCRUD/CRUD_QuizSubCategory.jsx'
import CRUD_Question from './components/Admin/adminCRUD/CRUD_Question.jsx'
import CRUD_Choice from './components/Admin/adminCRUD/CRUD_Choice.jsx'
import CRUD_CareerProgram from './components/Admin/adminCRUD/CRUD_CareerProgram.jsx'
import CounselorLogin from './components/Counselor/CounselorLogin.jsx';
import CounselorDashboard from './components/Counselor/CounselorDashboard.jsx';
import InstitutionalDashboard from './components/Counselor/InstitutionalDashboard.jsx';
import StudentReportPage from './components/Counselor/StudentReportPage.jsx';
import StudentRoute from './components/routes/StudentRoute.jsx';
import ProfilePage from './components/Profile/ProfilePage.jsx';
import StudentHomepage from './components/Student/StudentHomepage.jsx';
import ProgramCareerExplorer from './components/ProgramCareerExplorer/ProgramCareerExplorer.jsx';
// Add any other admin CRUD components you need

function ScrollToTop() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname]);
  return null;
}

function ConditionalNavigation() {
  const location = useLocation();
  
  // Hide navigation on TakeAssessment page
  const hideNavigation = location.pathname.startsWith('/take-assessment/');
  
  if (hideNavigation) {
    return null;
  }
  
  return <Navigation />;
}

function App() {
  return (

    <ProfileProvider>
      <Router>
        <div className="App">
          <ScrollToTop />
          <ConditionalNavigation />
          <Routes>
            {/* Public homepage - show landing for guests; redirect authenticated users */}
            <Route path="/" element={
              <PublicRoute>
                <UserLandingPage />
              </PublicRoute>
            } />
           
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
              
            {/* Student homepage */}
            <Route path="/student-home" element={
              <StudentRoute>
                <StudentHomepage />
              </StudentRoute>
            } />
            
            {/* Protected routes */}
            <Route path="/virtual-campus-tours" element={
              <StudentRoute>
                <VirtualCampusToursPage />
              </StudentRoute>
            } />
            {/* Protected routes */}
            <Route path="/academic-explorer" element={
              <StudentRoute>
                <AcademicExplorer />
              </StudentRoute>
            } />
            <Route path="/accreditation" element={
              <StudentRoute>
                <AccreditationRatings />
              </StudentRoute>
            } />
            <Route path="/accreditation/:section" element={
              <StudentRoute>
                <AccreditationSection />
              </StudentRoute>
            } />
            <Route path="/testimonials" element={
              <StudentRoute>
                <Testimonials />
              </StudentRoute>
            } />
            <Route path="/about-us" element={
              <PublicOrStudentRoute>
                <AboutUsPage />
              </PublicOrStudentRoute>
            } />
              <Route path="/profile" element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              } />
            <Route path="/career-pathways" element={
              <StudentRoute>
                <CareerPathways />
              </StudentRoute>
            } />
            <Route path="/assessments" element={
              <StudentRoute>
                <Assessments />
              </StudentRoute>
            } />
            
            <Route path="/assessment-subcategories" element={
              <StudentRoute>
                <AssessmentSubCategories />
              </StudentRoute>
            } />
            <Route path="/quiz-subcategories" element={
              <StudentRoute>
                <QuizSubCategories />
              </StudentRoute>
            } />
            
            <Route path="/take-assessment/:assessmentId" element={
              <StudentRoute>
                <TakeAssessment />
              </StudentRoute>
            } />
            <Route path="/assessment-dashboard" element={
              <StudentRoute>
                <AssessmentDashboard />
              </StudentRoute>
            } />
              <Route path="/assessment-results/:userAssessmentId" element={
                <StudentRoute>
                  <AssessmentResults />
                </StudentRoute>
              } />
            
            {/* Admin CRUD Routes */}
            <Route path="/admin/users" element={
              <AdminRoute>
                <CRUD_User />
              </AdminRoute>
            } />


            <Route path="/assessment-categories" element={
              <AdminRoute>
                <AssessmentCategories />
              </AdminRoute>
            } />

            <Route path="/questions" element={
              <AdminRoute>
                <Questions />
              </AdminRoute>
            } />
            
            {/* Add routes for all other admin tools
            <Route path="/admin/testimony" element={
              <AdminRoute>
                <CRUD_Testimony />
              </AdminRoute>
            } /> */}
            
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
            
            {/* <Route path="/admin/recommendation" element={
              <AdminRoute>
                <div>Recommendation Management (Coming Soon)</div>
              </AdminRoute>
            } /> */}
            
            {/* <Route path="/admin/assessment-result" element={
              <AdminRoute>
                <CRUD_AssessmentResult />
              </AdminRoute>
            } /> */}
            
            {/* <Route path="/admin/answer" element={
              <AdminRoute>
                <div>Answer Management (Coming Soon)</div>
              </AdminRoute>
            } /> */}
            
            <Route path="/admin/question" element={
              <AdminRoute>
                <CRUD_Question />
              </AdminRoute>
            } />
            
            <Route path="/admin/choice" element={
              <AdminRoute>
                <CRUD_Choice />
              </AdminRoute>
            } />
            
            {/* <Route path="/admin/user-assessment" element={
              <AdminRoute>
                <CRUD_UserAssessment />
              </AdminRoute>
            } /> */}
            
            <Route path="/admin/assessment" element={
              <AdminRoute>
                <CRUD_Assessment />
              </AdminRoute>
            } />
            
            {/* <Route path="/admin/user-assessment-section-result" element={
              <AdminRoute>
                <div>User-Assessment-Section-Result Management (Coming Soon)</div>
              </AdminRoute>
            } /> */}
            
            <Route path="/admin/assessment-category" element={
              <AdminRoute>
                <CRUD_AssessmentCategory />
              </AdminRoute>
            } />
            
            <Route path="/admin/assessment-sub-category" element={
              <AdminRoute>
                <CRUD_AssessmentSubCategory />
              </AdminRoute>
            } />
            
            <Route path="/admin/quiz-sub-category" element={
              <AdminRoute>
                <CRUD_QuizSubCategory />
              </AdminRoute>
            } />
            
            <Route path="/admin/career" element={
              <AdminRoute>
                <CRUD_Career />
              </AdminRoute>
            } />

            <Route path="/admin/career-path" element={
              <AdminRoute>
                <CRUD_CareerPath />
              </AdminRoute>
            } />
            
            <Route path="/admin/career-program" element={
              <AdminRoute>
                <CRUD_CareerProgram />
              </AdminRoute>
            } />
            
            {/* Counselor routes */}
            <Route path="/counselor/login" element={
              <PublicRoute>
                <CounselorLogin />
              </PublicRoute>
            } />
            <Route path="/counselor-dashboard" element={
              <CounselorRoute>
                <CounselorDashboard />
              </CounselorRoute>
            } />
            <Route path="/counselor/institutional-dashboard" element={
              <CounselorRoute>
                <InstitutionalDashboard />
              </CounselorRoute>
            } />
            <Route path="/counselor/student-report" element={
              <CounselorRoute>
                <StudentReportPage />
              </CounselorRoute>
            } />
            <Route path="/program-career-explorer" element={
              <StudentRoute>
                <ProgramCareerExplorer />
              </StudentRoute>
            } />
            
            {/* For any route that doesn't match */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </ProfileProvider>
  );
}

export default App;