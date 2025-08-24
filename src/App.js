import React, { useState } from 'react';
import ChatPage from './pages/ChatPage';
import LoginInterface from './components/LoginInterface';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (loginStatus) => {
    setIsLoggedIn(loginStatus);
  };

  return (
    <div className="App">
      {isLoggedIn ? (
        <ChatPage />
      ) : (
        <LoginInterface onLogin={handleLogin} />
      )}
    </div>
  );
}

export default App; 