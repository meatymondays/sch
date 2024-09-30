import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ScheduleComp from './ScheduleComp';
import AuthSuccess from './AuthSuccess';
import AuthError from './AuthError';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ScheduleComp />} />
        <Route path="/auth-success" element={<AuthSuccess />} />
        <Route path="/auth-error" element={<AuthError />} />
      </Routes>
    </Router>
  );
}

export default App;
