import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import EmojiPicker from 'emoji-picker-react';
import SimpleFrontendRAG from '../utils/simpleFrontendRAG';

const SYSTEM_PROMPT = `你是一个专业的大学咨询助手，专门为大学生提供学习和生活方面的建议。请根据用户的问题提供详细、实用的回答。`;

const FrontendRAGChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [ragSystem, setRagSystem] = useState(null);
  const [ragStatus, setRagStatus] = useState('initializing'); // 'initializing', 'ready', 'error'
  const [ragDetails, setRagDetails] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 初始化简化版前端RAG系统
    const initRAG = async () => {
      try {
        setRagStatus('initializing');
        const rag = new SimpleFrontendRAG();
        await rag.initialize();
        setRagSystem(rag);
        
        // 获取RAG系统状态
        const status = rag.getStatus();
        setRagDetails(status);
        
        if (status.hasDocuments) {
          setRagStatus('ready');
          console.log('✅ 简化版前端RAG系统已就绪');
        } else {
          setRagStatus('error');
          console.log('❌ 简化版前端RAG系统初始化失败：没有加载到文档');
        }
      } catch (error) {
        console.error('❌ 简化版前端RAG系统初始化失败:', error);
        setRagStatus('error');
      }
    };

    initRAG();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setShowEmojiPicker(false);

    // 添加用户消息
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      let ragContext = '';
      
      // 使用简化版前端RAG系统查询相关文档
      if (ragSystem && ragStatus === 'ready') {
        try {
          const ragResult = await ragSystem.query(userMessage, 3);
          if (ragResult.relevant_docs && ragResult.relevant_docs.length > 0) {
            ragContext = `\n\n相关专业知识库信息：\n${ragResult.relevant_docs.join('\n\n')}`;
            console.log('简化版前端RAG查询结果:', ragResult);
          }
        } catch (ragError) {
          console.log('简化版前端RAG查询失败，继续使用DeepSeek API');
        }
      }

      // 调用DeepSeek API
      const response = await axios.post('/v1/chat/completions', {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `${SYSTEM_PROMPT}${ragContext}`
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-7f5214ed15764dfea0b45c84c6d0c961'
        }
      });

      const assistantMessage = response.data.choices[0].message.content;
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);

    } catch (error) {
      console.error('API调用失败:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '抱歉，我遇到了一些问题。请稍后再试。' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setInputMessage(prev => prev + emojiObject.emoji);
  };

  const getRagStatusText = () => {
    switch (ragStatus) {
      case 'initializing':
        return '🔄 简化版前端RAG系统初始化中...';
      case 'ready':
        return `✅ 简化版前端RAG系统已就绪 (${ragDetails.documentCount} 个文档)`;
      case 'error':
        return `❌ 简化版前端RAG系统初始化失败 (${ragDetails.documentCount} 个文档)`;
      default:
        return '⏳ 简化版前端RAG系统状态未知';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-800">AI智能咨询助手</h1>
        <p className="text-sm text-gray-600 mt-1">基于简化版前端RAG系统的智能对话</p>
        <div className="mt-2 text-xs text-gray-500">
          {getRagStatusText()}
        </div>
        {ragDetails.documentCount > 0 && (
          <div className="mt-1 text-xs text-green-600">
            📚 知识库已加载，包含 {ragDetails.documentCount} 条专业知识
          </div>
        )}
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-20">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-lg">欢迎使用AI智能咨询助手！</p>
            <p className="text-sm mt-2">我可以为您提供学习和生活方面的建议</p>
            {ragStatus === 'ready' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ✅ RAG系统已就绪，可以为您提供专业的知识库支持
                </p>
              </div>
            )}
            {ragStatus === 'error' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  ⚠️ RAG系统初始化失败，将使用基础模式回答
                </p>
              </div>
            )}
          </div>
        )}
        
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-800 shadow-sm border'
              }`}
            >
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                className="prose prose-sm max-w-none"
              >
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 shadow-sm border px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm">正在思考...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="bg-white border-t p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="输入您的问题..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            😊
          </button>
          
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            发送
          </button>
        </form>
      </div>
    </div>
  );
};

export default FrontendRAGChat; 