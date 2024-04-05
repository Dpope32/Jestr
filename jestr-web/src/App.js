import React, { useState, useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import LoadingScreen from './components/LoadingScreen'; // Adjust the path as necessary
import './App.css';

const App = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set a timeout if you want to delay the transition
    const timer = setTimeout(() => setLoading(false), 3500); // 3s for the animation + 0.5s buffer
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="App">
      {loading ? <LoadingScreen onFinished={() => setLoading(false)} /> : <LandingPage />}
    </div>
  );
};

export default App;
