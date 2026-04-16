import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import MainApp from './components/MainApp';

function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [user, setUser] = useState(null);

  const handleLogin = (email, password) => {
    if (email && password) {
      setUser({ email, name: email.split('@')[0] });
      setCurrentPage('app');
    }
  };

  const handleSignup = (email, password, name) => {
    if (email && password && name) {
      setUser({ email, name });
      setCurrentPage('app');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('landing');
  };

  if (currentPage === 'landing') {
    return <LandingPage setCurrentPage={setCurrentPage} />;
  }

  if (currentPage === 'login') {
    return <LoginPage setCurrentPage={setCurrentPage} handleLogin={handleLogin} />;
  }

  if (currentPage === 'signup') {
    return <SignupPage setCurrentPage={setCurrentPage} handleSignup={handleSignup} />;
  }

  return <MainApp user={user} handleLogout={handleLogout} />;
}

export default App;