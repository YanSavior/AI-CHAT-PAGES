import React, { useState } from 'react';
import ChatInterface from '../components/ChatInterface';
import '../App.css';

const ChatPage = () => {
  const [ragflowStatus, setRagflowStatus] = useState('checking');

  return (
    <div className="chat-page">
      {/* 顶部导航栏 */}
      <header className="chat-header">
        <div className="chat-header-content">
          <h1 className="chat-title">重邮AI问答系统</h1>
          <div className="header-actions">
            <div className="status-indicator">
              <span className={`status-dot ${ragflowStatus === 'available' ? 'status-online' : ragflowStatus === 'checking' ? 'status-checking' : 'status-offline'}`}></span>
              <span className="status-text">
                {ragflowStatus === 'available' ? 'RAGflow已连接' : 
                 ragflowStatus === 'checking' ? '连接中...' : 
                 'RAGflow离线'}
              </span>
            </div>
          </div>
        </div>
      </header>
      
      {/* 聊天界面 */}
      <div className="chat-content">
        <ChatInterface onStatusChange={setRagflowStatus} />
      </div>
    </div>
  );
};

export default ChatPage; 