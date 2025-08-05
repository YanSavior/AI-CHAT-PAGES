import React from 'react';
import ChatInterface from '../components/ChatInterface';
import '../App.css';

const ChatPage = ({ onLogout }) => {
  return (
    <div className="chat-page">
      {/* 顶部导航栏 */}
      <header className="chat-header">
        <div className="chat-header-content">
          <h1 className="chat-title">重邮AI问答系统</h1>
          <button className="logout-button" onClick={onLogout}>
            退出登录
          </button>
        </div>
      </header>
      
      {/* 聊天界面 */}
      <ChatInterface />
    </div>
  );
};

export default ChatPage; 