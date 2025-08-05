import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import EmojiPicker from 'emoji-picker-react';
import AIAvatar from './AIAvatar';

// 创建一个配置了基础 URL 的 axios 实例
const getApiBaseURL = () => {
  // 如果是开发环境，使用本地地址
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:8000';
  }
  // 如果是生产环境，使用部署的RAG API地址
  // TODO: 部署完成后，请将下面的URL替换为实际的Railway域名
  // 例如：https://your-app-name.railway.app
  return 'https://your-rag-api.railway.app'; // 替换为实际部署地址
};

const api = axios.create({
  baseURL: 'https://api.deepseek.com',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer sk-7f5214ed15764dfea0b45c84c6d0c961'
  }
});

// RAG API客户端
const ragApi = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

const FRESHMAN_SYSTEM_PROMPT = `你是一位温暖贴心的重邮校园生活顾问，专门为新生提供帮助。你需要以友好、耐心的态度回答新生关于重邮的各种问题。

你的主要职责包括：
1. 回答关于重邮校园环境、设施、规章制度的问题
2. 提供学习、生活、社团活动等方面的建议
3. 解答新生常见困惑，如选课、宿舍、食堂等
4. 分享重邮的校园文化和传统
5. 提供实用的校园生活小贴士

回答要求：
1. 语气要温暖、友好、鼓励
2. 回答要具体、实用、可操作
3. 适当分享重邮的特色和优势
4. 对新生表示欢迎和理解
5. 如果遇到不确定的信息，建议咨询相关部门

记住：你是新生的朋友和向导，要帮助他们快速适应重邮的校园生活。`;

const FreshmanChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isAIAvatarReplying, setIsAIAvatarReplying] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const emojiPickerRef = useRef(null);

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
      // 首先通过RAG系统获取相关知识
      let ragContext = '';
      try {
        const ragResponse = await ragApi.post('/query', {
          question: inputMessage,
          top_k_retrieve: 5,
          top_k_final: 3
        });
        
        if (ragResponse.data && ragResponse.data.relevant_docs) {
          ragContext = `\n\n相关校园知识库信息：\n${ragResponse.data.relevant_docs.join('\n\n')}`;
        }
      } catch (ragError) {
        console.log('RAG系统未运行，继续使用DeepSeek API');
      }

      const response = await api.post('/v1/chat/completions', {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `${FRESHMAN_SYSTEM_PROMPT}${ragContext}`
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
          time: formatTime()
        };
        
        setIsAIAvatarReplying(true);
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('无效的 API 响应格式');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(
        error.response?.data?.error?.message || 
        error.message || 
        '抱歉，发生了一些错误。请确保已配置正确的 API 密钥。'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-xl shadow-soft border border-gray-100 qq-style-chat">
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
                    欢迎来到重邮！
                  </h3>
                  <p className="text-secondary-500 mt-1 text-sm">
                    新生专属助手，为您答疑解惑
                  </p>
                </div>
              </div>
              
              <div className="prompt-box mb-4">
                <h4 className="prompt-box-title text-sm font-medium">
                  你对重邮有什么想要了解的？
                </h4>
                <div className="max-w-md mx-auto">
                  <ol className="space-y-1.5 text-secondary-600 text-sm">
                    <li className="flex items-center space-x-2.5 hover:text-cqupt-blue-600 transition-colors duration-200 group">
                      <span className="w-4 h-4 rounded-full bg-secondary-200 flex items-center justify-center text-xs group-hover:bg-cqupt-blue-100 group-hover:text-cqupt-blue-700 transition-colors duration-200">1</span>
                      <span>校园环境和设施</span>
                    </li>
                    <li className="flex items-center space-x-2.5 hover:text-cqupt-blue-600 transition-colors duration-200 group">
                      <span className="w-4 h-4 rounded-full bg-secondary-200 flex items-center justify-center text-xs group-hover:bg-cqupt-blue-100 group-hover:text-cqupt-blue-700 transition-colors duration-200">2</span>
                      <span>学习生活和选课</span>
                    </li>
                    <li className="flex items-center space-x-2.5 hover:text-cqupt-blue-600 transition-colors duration-200 group">
                      <span className="w-4 h-4 rounded-full bg-secondary-200 flex items-center justify-center text-xs group-hover:bg-cqupt-blue-100 group-hover:text-cqupt-blue-700 transition-colors duration-200">3</span>
                      <span>宿舍和食堂情况</span>
                    </li>
                    <li className="flex items-center space-x-2.5 hover:text-cqupt-blue-600 transition-colors duration-200 group">
                      <span className="w-4 h-4 rounded-full bg-secondary-200 flex items-center justify-center text-xs group-hover:bg-cqupt-blue-100 group-hover:text-cqupt-blue-700 transition-colors duration-200">4</span>
                      <span>社团活动和校园文化</span>
                    </li>
                    <li className="flex items-center space-x-2.5 hover:text-cqupt-blue-600 transition-colors duration-200 group">
                      <span className="w-4 h-4 rounded-full bg-secondary-200 flex items-center justify-center text-xs group-hover:bg-cqupt-blue-100 group-hover:text-cqupt-blue-700 transition-colors duration-200">5</span>
                      <span>其他任何困惑</span>
                    </li>
                  </ol>
                </div>
              </div>
              
              <div className="title-box mt-3 max-w-xs mx-auto py-1 px-3">
                <p className="text-xs text-secondary-500">
                  我会为您提供详细的重邮校园生活指南
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
              <div className={message.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}>
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
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                        </svg>
                        已复制
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
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
                  <div className="text-xs text-gray-500 animate-pulse">AI正在思考中...</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent animate-pulse-slow rounded-lg" style={{ backgroundSize: '200% 100%', animation: 'gradientShift 2s ease infinite' }}></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center animate-shake">
            <div className="rounded-lg px-3 py-2 max-w-[80%] text-xs shadow-sm border bg-red-50 text-red-500 border-red-200 flex items-center">
              <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
              {error}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
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
              placeholder="输入消息..."
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
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span className="flex items-center">
                    发送
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
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
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd"></path>
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

export default FreshmanChatInterface; 