import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AcademicExplorer from './components/AcademicExplorer.jsx';
import AccreditationRatings from './components/AccreditationRatings.jsx';
import AccreditationSection from './components/AccreditationSection.jsx';
import Navigation from './components/Navigation.jsx';
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
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
