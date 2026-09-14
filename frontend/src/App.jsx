import React, { useState } from 'react';
import RegisterPage from './components/RegisterPage';
import LoginPage from './components/LoginPage';

function App() {
  const [currentView, setCurrentView] = useState('login');

  return (
    <div className="app-container">
      {currentView === 'login' ? (
        <LoginPage onNavigateToRegister={() => setCurrentView('register')} />
      ) : (
        <RegisterPage onNavigateToLogin={() => setCurrentView('login')} />
      )}
    </div>
  );
}

export default App;
