import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import EmojiPicker from 'emoji-picker-react';
import { graduateData } from '../data/graduateData';
import pyfaData from '../data/pyfaData.json';
import pyfaData1 from '../data/pyfaData-1.json';
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

// 辅助函数：根据用户输入内容智能匹配专业
function extractMajorFromText(text) {
  const majors = [
    { name: '微电子科学与工程', keywords: ['微电子', '集成电路'] },
    { name: '机械设计制造及其自动化', keywords: ['机械', '自动化', '机电'] },
    // 可继续扩展
  ];
  for (const major of majors) {
    for (const kw of major.keywords) {
      if (text.includes(kw)) return major.name;
    }
  }
  return null;
}

const getPyfaTextByMajor = (major) => {
  if (major === '微电子科学与工程') return pyfaData.join('\n');
  if (major === '机械设计制造及其自动化') return pyfaData1.join('\n');
  return '';
};

const SYSTEM_PROMPT = `你是一位温暖贴心的职业规划顾问。无论是首次建议还是后续所有回答，你都必须严格参考我提供的"培养方案"内容，不能脱离培养方案随意生成建议。每一条建议都要能在培养方案中找到依据。

根据用户是否是首次对话，你需要采用不同的回复方式：

1. 如果这是用户的第一条完整信息（包含学院里的哪个专业、学习阶段、成绩、兴趣等），请按以下方式回复：
   a) 首先表达理解和认同，肯定用户已经做出的努力
   b) 从毕业生数据中选择2-3位最匹配的学长学姐，用自然的语言描述他们的经历：
      - 开头说明匹配度："你与[姓名]学长/学姐匹配度较高。"
      - 用一段话描述该学长/学姐的情况（绩点、毕业去向、薪资、在校经历）
      - 特别说明为什么与用户匹配（找到共同点或互补点）
   c) 最后给出详细的建议，要包含具体的时间节点和行动步骤，一定注意建议需要根据我提供给你的培养方案！并在回复末尾生成一段横向的技能树，要求技能树图示富有生气，且上面不同位置有着不同的时间，根据培养方案有着不同的技能或课程，可以尽量详尽一点


2. 如果是用户后续的问题或困惑：
   a) 首先表达理解和共情，安抚用户的焦虑
   b) 从已分享的学长学姐经历中提取相关的经验和建议
   c) 用温暖鼓励的语气给出建议，多分享成功案例
   d) 如果用户表达压力或焦虑，要着重进行心理疏导

注意事项：
1. 所有建议必须基于真实的毕业生数据和专业培养方案内容，且每一条建议都要能在培养方案中找到依据。
2. 语气要温暖、专业、鼓励
3. 回复要自然流畅，避免生硬的格式
4. 适时给予情感支持和鼓励
5. 建议要具体可执行
6. 注意：请不要用mermaid、gantt、markdown代码块等格式输出技能树或时间轴，只需用自然语言描述，技能树图形由前端负责渲染。`;

// 过滤AI回复中的mermaid/gantt代码块
function filterMermaidGantt(text) {
  if (!text) return text;
  // 匹配```gantt ...```或```mermaid ...```代码块
  return text.replace(/```(gantt|mermaid)[\s\S]*?```/gi, '')
             .replace(/gantt\s+title[\s\S]*?(section|$)/gi, '');
}

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [lastUserMajor, setLastUserMajor] = useState(null); // 记录上一次识别的专业
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isAIAvatarReplying, setIsAIAvatarReplying] = useState(false);
  const [ragApiStatus, setRagApiStatus] = useState('checking'); // 'checking', 'available', 'unavailable'
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // 检测RAG API状态
  useEffect(() => {
    const checkRagApiStatus = async () => {
      try {
        const response = await ragApi.get('/api/health');
        if (response.data && response.data.status === 'healthy') {
          setRagApiStatus('available');
          console.log('✅ RAG API 可用');
        } else {
          setRagApiStatus('unavailable');
          console.log('❌ RAG API 不可用');
        }
      } catch (error) {
        setRagApiStatus('unavailable');
        console.log('❌ RAG API 连接失败:', error.message);
      }
    };

    // 延迟检测，避免在开发环境立即检测
    const timer = setTimeout(checkRagApiStatus, 1000);
    return () => clearTimeout(timer);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 处理点击表情外部关闭表情选择器
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

  // 复制文本功能
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

    // 智能提取专业
    const userMajor = extractMajorFromText(inputMessage) || lastUserMajor;
    const pyfaText = userMajor ? getPyfaTextByMajor(userMajor) : '';
    if (!lastUserMajor && userMajor) setLastUserMajor(userMajor);

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
          ragContext = `\n\n相关专业知识库信息：\n${ragResponse.data.relevant_docs.join('\n\n')}`;
        }
      } catch (ragError) {
        console.log('RAG系统未运行，继续使用DeepSeek API');
      }

      const response = await api.post('/v1/chat/completions', {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `${SYSTEM_PROMPT}\n\n可用的毕业生数据如下：${JSON.stringify(graduateData, null, 2)}\n\n${userMajor ? `该用户专业为：${userMajor}，以下是该专业的培养方案内容：\n${pyfaText}` : ''}${ragContext}`
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
        max_tokens: 3000,
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
        
        // 触发AI智能体的恍然大悟状态
        setIsAIAvatarReplying(true);
        
        setMessages(prev => {
          const aiText = filterMermaidGantt(aiMessage.text || '').trim();
          if (!aiText) return prev; // 内容为空则不插入
          return [...prev, { ...aiMessage, text: aiText }];
        });
        if (isFirstMessage) {
          setIsFirstMessage(false);
        }
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
                    欢迎使用 重邮 AI 助手
                  </h3>
                  <p className="text-secondary-500 mt-1 text-sm">
                    智慧校园，为您服务
                  </p>
                </div>
              </div>
              
              {/* RAG API 状态显示 */}
              <div className="mb-4 p-3 rounded-lg bg-gray-50 border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">知识库状态：</span>
                  <div className="flex items-center space-x-2">
                    {ragApiStatus === 'checking' && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-yellow-600">检测中...</span>
                      </div>
                    )}
                    {ragApiStatus === 'available' && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600">已连接</span>
                      </div>
                    )}
                    {ragApiStatus === 'unavailable' && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-xs text-red-600">未连接</span>
                      </div>
                    )}
                  </div>
                </div>
                {ragApiStatus === 'available' && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ 知识库已启用，AI将基于专业数据进行回答
                  </p>
                )}
                {ragApiStatus === 'unavailable' && (
                  <p className="text-xs text-gray-500 mt-1">
                    ℹ️ 知识库未连接，AI将使用基础模式回答
                  </p>
                )}
              </div>
              
              <div className="prompt-box mb-4">
                <h4 className="prompt-box-title text-sm font-medium">
                  请分享一下你的情况
                </h4>
                <div className="max-w-md mx-auto">
                  <div className="space-y-1.5 text-secondary-600 text-sm">
                    <div className="flex items-center space-x-2.5 hover:text-cqupt-blue-600 transition-colors duration-200 group">
                      <span className="w-4 h-4 rounded-full bg-secondary-200 flex items-center justify-center text-xs group-hover:bg-cqupt-blue-100 group-hover:text-cqupt-blue-700 transition-colors duration-200">1</span>
                      <span>.目前的学习阶段（大几）</span>
                    </div>
                    <div className="flex items-center space-x-2.5 hover:text-cqupt-blue-600 transition-colors duration-200 group">
                      <span className="w-4 h-4 rounded-full bg-secondary-200 flex items-center justify-center text-xs group-hover:bg-cqupt-blue-100 group-hover:text-cqupt-blue-700 transition-colors duration-200">2</span>
                      <span>.主要课程的成绩情况</span>
                    </div>
                    <div className="flex items-center space-x-2.5 hover:text-cqupt-blue-600 transition-colors duration-200 group">
                      <span className="w-4 h-4 rounded-full bg-secondary-200 flex items-center justify-center text-xs group-hover:bg-cqupt-blue-100 group-hover:text-cqupt-blue-700 transition-colors duration-200">3</span>
                      <span>.感兴趣的专业领域</span>
                    </div>
                    <div className="flex items-center space-x-2.5 hover:text-cqupt-blue-600 transition-colors duration-200 group">
                      <span className="w-4 h-4 rounded-full bg-secondary-200 flex items-center justify-center text-xs group-hover:bg-cqupt-blue-100 group-hover:text-cqupt-blue-700 transition-colors duration-200">4</span>
                      <span>.已经做过的准备（如果有）</span>
                    </div>
                    <div className="flex items-center space-x-2.5 hover:text-cqupt-blue-600 transition-colors duration-200 group">
                      <span className="w-4 h-4 rounded-full bg-secondary-200 flex items-center justify-center text-xs group-hover:bg-cqupt-blue-100 group-hover:text-cqupt-blue-700 transition-colors duration-200">5</span>
                      <span>.目前最大的困惑</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="title-box mt-3 max-w-xs mx-auto py-1 px-3">
                <p className="text-xs text-secondary-500">
                  我们将为您提供个性化的学习规划与职业发展建议
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
            {/* AI智能体 */}
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
              style={{ 
                marginTop: '10px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#ffffff',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                outline: 'none',
                transition: 'border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out'
              }}
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

export default ChatInterface; 