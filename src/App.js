import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import FrontendRAGChat from './components/FrontendRAGChat';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [chatMode, setChatMode] = useState('backend'); // 'backend' or 'frontend'

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setChatMode('backend');
  };

  const handleModeChange = (mode) => {
    setChatMode(mode);
  };

  return (
    <div>
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <div>
          {/* 模式选择器 */}
          <div className="bg-white shadow-sm border-b px-6 py-3">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => handleModeChange('backend')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  chatMode === 'backend'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                后端RAG模式
              </button>
              <button
                onClick={() => handleModeChange('frontend')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  chatMode === 'frontend'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                前端RAG模式
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600"
              >
                退出登录
              </button>
            </div>
          </div>
          
          {/* 聊天界面 */}
          {chatMode === 'backend' ? (
            <ChatPage onLogout={handleLogout} />
          ) : (
            <FrontendRAGChat />
          )}
        </div>
      )}
    </div>
  );
}

export default App; 