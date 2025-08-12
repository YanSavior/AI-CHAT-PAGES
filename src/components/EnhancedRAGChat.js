import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import EmojiPicker from 'emoji-picker-react';
import AIAvatar from './AIAvatar';
import RAG_CONFIG from '../config/ragConfig';

// DeepSeek API配置
const deepseekApi = axios.create({
  baseURL: 'https://api.deepseek.com',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk-7f5214ed15764dfea0b45c84c6d0c961'
  }
});

// RAG API客户端
const ragApi = axios.create({
  baseURL: RAG_CONFIG.getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// 系统提示词
const SYSTEM_PROMPT = `你是一个专业的AI助手，专门为用户提供准确、有用的回答。

重要说明：
1. 当用户提问时，我会先通过RAG系统检索相关知识库信息
2. 请基于检索到的相关信息，结合你的专业知识来回答
3. 如果检索到的信息不足，请说明并基于你的知识回答
4. 回答要准确、详细、实用
5. 如果涉及专业领域，请确保信息的准确性

请根据提供的上下文信息，为用户提供最佳的回答。`;

const EnhancedRAGChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isAIAvatarReplying, setIsAIAvatarReplying] = useState(false);
  const [ragStatus, setRagStatus] = useState('checking'); // 'checking', 'available', 'unavailable'
  const [lastRagContext, setLastRagContext] = useState(''); // 存储最后一次的RAG上下文
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // 检测RAG系统状态
  useEffect(() => {
    const checkRagStatus = async () => {
      try {
        const response = await ragApi.get(RAG_CONFIG.ENDPOINTS.HEALTH);
        if (response.data.status === 'healthy') {
          setRagStatus('available');
          console.log('✅ RAG系统连接正常');
        } else {
          setRagStatus('unavailable');
          console.log('⚠️ RAG系统状态异常');
        }
      } catch (error) {
        setRagStatus('unavailable');
        console.log('❌ RAG系统连接失败，将使用纯DeepSeek模式');
      }
    };

    checkRagStatus();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const formatTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const handleEmojiClick = (emojiData) => {
    setInputMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // RAG知识库检索
  const retrieveRAGContext = async (question) => {
    if (ragStatus !== 'available') {
      console.log('RAG系统不可用，跳过检索');
      return '';
    }

    try {
      console.log('🔍 开始RAG知识库检索...');
      const response = await ragApi.post(RAG_CONFIG.ENDPOINTS.QUERY, {
        question: question,
        top_k_retrieve: RAG_CONFIG.QUERY_PARAMS.DEFAULT_TOP_K_RETRIEVE,
        top_k_final: RAG_CONFIG.QUERY_PARAMS.DEFAULT_TOP_K_FINAL
      });

      if (response.data && response.data.relevant_docs && response.data.relevant_docs.length > 0) {
        const context = `\n\n📚 相关专业知识库信息：\n${response.data.relevant_docs.join('\n\n')}`;
        console.log('✅ RAG检索成功，找到相关文档');
        setLastRagContext(context);
        return context;
      } else {
        console.log('⚠️ RAG检索完成，但未找到相关文档');
        return '';
      }
    } catch (error) {
      console.error('❌ RAG检索失败:', error);
      return '';
    }
  };

  // 构建增强的系统提示词
  const buildEnhancedSystemPrompt = (ragContext) => {
    let enhancedPrompt = SYSTEM_PROMPT;
    
    if (ragContext) {
      enhancedPrompt += `\n\n当前检索到的相关知识库信息：${ragContext}`;
    }
    
    if (ragStatus === 'available') {
      enhancedPrompt += `\n\n✅ RAG知识库系统已连接，可以检索相关信息`;
    } else {
      enhancedPrompt += `\n\n⚠️ RAG知识库系统暂时不可用，将基于我的知识回答`;
    }
    
    return enhancedPrompt;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      time: formatTime()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // 第一步：RAG知识库检索
      const ragContext = await retrieveRAGContext(inputMessage);
      
      // 第二步：构建增强的系统提示词
      const enhancedSystemPrompt = buildEnhancedSystemPrompt(ragContext);
      
      // 第三步：调用DeepSeek API生成答案
      console.log('🤖 调用DeepSeek API生成答案...');
      const response = await deepseekApi.post('/v1/chat/completions', {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: enhancedSystemPrompt
          },
          ...messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          })),
          {
            role: 'user',
            content: inputMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.9,
        frequency_penalty: 0.3,
        presence_penalty: 0.3
      });

      if (response.data && response.data.choices && response.data.choices[0]) {
        const aiMessage = {
          id: Date.now() + 1,
          text: response.data.choices[0].message.content,
          sender: 'ai',
          time: formatTime(),
          ragContext: ragContext // 保存RAG上下文信息
        };
        
        setIsAIAvatarReplying(true);
        setMessages(prev => [...prev, aiMessage]);
        
        console.log('✅ 回答生成成功');
        if (ragContext) {
          console.log('📚 本次回答使用了RAG知识库信息');
        }
      } else {
        throw new Error('无效的 API 响应格式');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(
        error.response?.data?.error?.message || 
        error.message || 
        '抱歉，发生了一些错误。请稍后重试。'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 显示RAG状态指示器
  const renderRAGStatus = () => {
    const statusConfig = {
      checking: { text: '检测中...', color: 'text-yellow-600', bg: 'bg-yellow-100' },
      available: { text: 'RAG已连接', color: 'text-green-600', bg: 'bg-green-100' },
      unavailable: { text: 'RAG未连接', color: 'text-red-600', bg: 'bg-red-100' }
    };
    
    const config = statusConfig[ragStatus];
    
    return (
      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
        <div className={`w-2 h-2 rounded-full mr-1 ${config.color.replace('text-', 'bg-')}`}></div>
        {config.text}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-xl shadow-soft border border-gray-100 qq-style-chat">
      {/* 状态栏 */}
      <div className="border-b border-gray-100 px-4 py-2 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-medium text-gray-700">增强版AI助手</h3>
            {renderRAGStatus()}
          </div>
          <div className="text-xs text-gray-500">
            RAG + DeepSeek 集成模式
          </div>
        </div>
      </div>

      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 qq-style-message-area"
      >
        {messages.length === 0 && (
          <div className="w-full max-w-2xl mx-auto animate-fade-in">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border p-5 shadow-soft transform transition-all duration-300 hover:shadow-lg border-gray-100">
              <div className="flex flex-col items-center mb-6">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cqupt-blue-400 to-cqupt-blue-600 flex items-center justify-center text-white shadow-sm mb-2 text-xs font-medium">
                  AI
                </div>
                <div className="title-box py-2 px-4">
                  <h3 className="text-xl font-bold text-gradient">
                    增强版AI助手
                  </h3>
                  <p className="text-secondary-500 mt-1 text-sm">
                    RAG知识库 + DeepSeek AI 完美结合
                  </p>
                </div>
              </div>
              
              <div className="prompt-box mb-4">
                <h4 className="prompt-box-title text-sm font-medium">
                  我可以帮您做什么？
                </h4>
                <div className="max-w-md mx-auto">
                  <ol className="space-y-1.5 text-secondary-600 text-sm">
                    <li className="flex items-center space-x-2.5 hover:text-cqupt-blue-600 transition-colors duration-200 group">
                      <span className="w-4 h-4 rounded-full bg-secondary-200 flex items-center justify-center text-xs group-hover:bg-cqupt-blue-100 group-hover:text-cqupt-blue-700 transition-colors duration-200">1</span>
                      <span>基于知识库的专业回答</span>
                    </li>
                    <li className="flex items-center space-x-2.5 hover:text-cqupt-blue-600 transition-colors duration-200 group">
                      <span className="w-4 h-4 rounded-full bg-secondary-200 flex items-center justify-center text-xs group-hover:bg-cqupt-blue-100 group-hover:text-cqupt-blue-700 transition-colors duration-200">2</span>
                      <span>智能知识检索和匹配</span>
                    </li>
                    <li className="flex items-center space-x-2.5 hover:text-cqupt-blue-600 transition-colors duration-200 group">
                      <span className="w-4 h-4 rounded-full bg-secondary-200 flex items-center justify-center text-xs group-hover:bg-cqupt-blue-100 group-hover:text-cqupt-blue-700 transition-colors duration-200">3</span>
                      <span>结合AI的创造性回答</span>
                    </li>
                    <li className="flex items-center space-x-2.5 hover:text-cqupt-blue-600 transition-colors duration-200 group">
                      <span className="w-4 h-4 rounded-full bg-secondary-200 flex items-center justify-center text-xs group-hover:bg-cqupt-blue-100 group-hover:text-cqupt-blue-700 transition-colors duration-200">4</span>
                      <span>多领域专业知识支持</span>
                    </li>
                  </ol>
                </div>
              </div>
              
              <div className="title-box mt-3 max-w-xs mx-auto py-1 px-3">
                <p className="text-xs text-secondary-500">
                  智能检索 + AI生成，为您提供最准确的答案
                </p>
              </div>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`chat-message ${
              message.sender === 'user' ? 'chat-message-user' : ''
            }`}
          >
            <div className={`chat-avatar ${message.sender === 'user' ? 'chat-avatar-user' : 'chat-avatar-ai'}`}>
              {message.sender === 'user' ? '我' : 'AI'}
            </div>
            <div className="chat-message-content">
              <div className={message.sender === 'ai' ? 'chat-bubble-ai' : 'chat-bubble-user'}>
                {message.sender === 'ai' ? (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown 
                      rehypePlugins={[rehypeRaw]}
                      components={{
                        p: ({node, ...props}) => <p className="whitespace-pre-wrap text-sm sm:text-base" {...props} />
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                    
                    {/* 显示RAG使用状态 */}
                    {message.ragContext && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center text-xs text-blue-600">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          本次回答使用了知识库信息
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm sm:text-base">{message.text}</p>
                )}
              </div>
              <div className="chat-message-time">
                {message.time}
                {message.sender === 'ai' && (
                  <button 
                    onClick={() => copyToClipboard(message.text, index)}
                    className="copy-button"
                    title="复制内容"
                  >
                    {copiedIndex === index ? (
                      <span className="flex items-center text-xs text-primary-600">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                        </svg>
                        已复制
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                        </svg>
                        复制
                      </span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="flex items-end space-x-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cqupt-blue-400 to-cqupt-blue-600 flex items-center justify-center text-white text-xs shadow-sm">
                AI
              </div>
              <div className="relative rounded-lg px-4 py-3 shadow-sm border bg-white border-gray-200 max-w-md">
                <div className="flex flex-col items-center">
                  <div className="relative z-10 flex items-center space-x-2 mb-2">
                    <div className="w-2 h-2 bg-cqupt-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-cqupt-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-cqupt-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <div className="text-xs text-gray-500 animate-pulse">
                    {ragStatus === 'available' ? '正在检索知识库并生成答案...' : 'AI正在思考中...'}
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent animate-pulse-slow rounded-lg" style={{ backgroundSize: '200% 100%', animation: 'gradientShift 2s ease infinite' }}></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center animate-shake">
            <div className="rounded-lg px-3 py-2 max-w-[80%] text-xs shadow-sm border bg-red-50 text-red-500 border-red-200 flex items-center">
              <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t input-area" style={{ paddingLeft: '250px', paddingRight: '20px', paddingBottom: '30px', paddingTop: '30px', position: 'relative' }}>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
          <div className="relative">
            <AIAvatar isThinking={isLoading} isReplying={isAIAvatarReplying} />
            
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="输入您的问题，我将结合知识库为您提供准确答案..."
              className="w-full rounded-xl text-secondary-800 resize-none min-h-[100px]"
              disabled={isLoading}
              style={{ marginTop: '10px' }}
            />
            <div className="absolute bottom-3 right-3 flex space-x-2" style={{ zIndex: 10 }}>
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className={`send-button ${
                  isLoading || !inputMessage.trim() 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:shadow-md'
                }`}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                ) : (
                  <span className="flex items-center">
                    发送
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                  </span>
                )}
              </button>
            </div>
          </div>
          
          <div className="input-toolbar">
            <div className="flex">
              <button
                type="button"
                className="input-toolbar-button flex items-center"
                title="表情"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd"/>
                </svg>
                表情
              </button>
            </div>
            <div className="text-xs text-secondary-400 ml-auto">
              {inputMessage.length > 0 ? `${inputMessage.length}字` : '按Enter发送，Shift+Enter换行'}
            </div>
          </div>
          
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef} 
              className="emoji-picker-container"
              style={{ bottom: '80px', left: '10px' }}
            >
              <EmojiPicker 
                onEmojiClick={handleEmojiClick} 
                searchDisabled={true}
                width={300}
                height={350}
                previewConfig={{ showPreview: false }}
                skinTonesDisabled={true}
              />
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default EnhancedRAGChat;