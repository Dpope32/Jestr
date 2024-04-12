import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Feed from './pages/Feed';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          {loading ? (
            <LoadingScreen onFinished={() => setLoading(false)} />
          ) : (
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/feed" element={<Feed />} />
            </Routes>
          )}
        </div>
      </Router>
    </ErrorBoundary>
  );
};

export default App;