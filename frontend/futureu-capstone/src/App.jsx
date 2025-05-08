import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AcademicExplorer from './components/AcademicExplorer.jsx';
import AccreditationRatings from './components/AccreditationRatings.jsx';
import AccreditationSection from './components/AccreditationSection.jsx';
import VirtualCampusToursPage from './components/VirtualCampusToursPage.jsx';
import Navigation from './components/Navigation.jsx';
import UserLandingPage from './components/UserLandingPage.jsx';
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
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
