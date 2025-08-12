import React, { useState, useEffect } from 'react';
import ChatInterface from '../components/ChatInterface';
import KnowledgeBaseManager from '../components/KnowledgeBaseManager';
import '../App.css';

const ChatPage = ({ onLogout, isAdmin }) => {
  const [activeTab, setActiveTab] = useState(isAdmin ? 'knowledge' : 'chat');

  // 当isAdmin状态改变时，自动切换到对应的界面
  useEffect(() => {
    setActiveTab(isAdmin ? 'knowledge' : 'chat');
  }, [isAdmin]);

  return (
    <div className="chat-page">
      {/* 顶部导航栏 */}
      <header className="chat-header">
        <div className="chat-header-content">
          <h1 className="chat-title">重邮AI问答系统</h1>
          <div className="header-actions">
            {/* 只有普通用户才能看到聊天选项 */}
            {!isAdmin && (
              <button 
                className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
                onClick={() => setActiveTab('chat')}
              >
                聊天
              </button>
            )}
            {/* 只有管理员才能看到知识库管理选项 */}
            {isAdmin && (
              <button 
                className={`tab-button ${activeTab === 'knowledge' ? 'active' : ''}`}
                onClick={() => setActiveTab('knowledge')}
              >
                知识库管理
              </button>
            )}
            <button className="logout-button" onClick={onLogout}>
              退出登录
            </button>
          </div>
        </div>
      </header>
      
      {/* 内容区域 */}
      <div className="chat-content">
        {activeTab === 'chat' ? (
          // 聊天界面
          <ChatInterface />
        ) : (
          // 知识库管理界面
          <div className="knowledge-management">
            <KnowledgeBaseManager />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage; 