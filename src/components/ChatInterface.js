import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import EmojiPicker from 'emoji-picker-react';
import { graduateData } from '../data/graduateData';
import pyfaData from '../data/pyfaData.json';
import pyfaData1 from '../data/pyfaData-1.json';
// 导入API配置和Dify适配器
import config, { validateConfig } from '../config/apiConfig';
import difyAdapter from '../utils/difyAdapter';
import './ChatInterface.css';

// 调试：打印环境变量和配置信息
console.log('🔍 环境变量调试信息:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('NETLIFY:', process.env.NETLIFY);
console.log('REACT_APP_DEEPSEEK_API_KEY:', process.env.REACT_APP_DEEPSEEK_API_KEY ? `${process.env.REACT_APP_DEEPSEEK_API_KEY.substring(0, 10)}...` : 'undefined');
console.log('REACT_APP_DEEPSEEK_API_URL:', process.env.REACT_APP_DEEPSEEK_API_URL);
console.log('🔧 API配置信息:');
console.log('baseURL:', config.deepseek.baseURL);
console.log('apiKey:', config.deepseek.apiKey ? `${config.deepseek.apiKey.substring(0, 10)}...` : 'undefined');
console.log('timeout:', config.deepseek.timeout);

// 验证配置
const configValidation = validateConfig();
if (!configValidation.valid) {
  console.warn('⚠️ API配置存在问题:', configValidation.errors);
} else {
  console.log('✅ API配置验证通过');
}

// 创建DeepSeek API客户端
const api = axios.create({
  baseURL: config.deepseek.baseURL,
  timeout: config.deepseek.timeout,
  headers: {
    ...config.deepseek.headers,
    'Authorization': `Bearer ${config.deepseek.apiKey}`
  }
});

// AI状态枚举
const AI_STATES = {
  IDLE: 'idle',
  THINKING: 'thinking',
  ENLIGHTENED: 'enlightened',
  SPEAKING: 'speaking'
};

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

// 系统提示词 - 优化为优先使用RAG切片，但保留学长学姐匹配逻辑
const SYSTEM_PROMPT = `你是一位温暖贴心的职业规划顾问。

## 回答策略（严格按优先级执行）：

### 🔍 第一优先级：RAG知识库切片
- 我会为你提供通过向量相似度计算得到的相关知识切片
- 这些切片经过专业筛选，与用户问题高度相关
- 请优先基于这些知识切片来构建回答的核心内容

### 📊 第二优先级：学长学姐案例匹配
当用户提供个人信息（专业、学习阶段、成绩、兴趣等）时，必须执行以下匹配流程：

1. **智能匹配算法**：
   - 根据发展方向相关性、绩点接近程度、职业目标一致性进行匹配
   - 优先选择发展方向与用户专业或兴趣相关的学长学姐
   - 考虑绩点差异在±0.8范围内的案例（用户3.08，可匹配2.3-3.8范围）
   - 重视职业发展路径的相关性和可借鉴性

2. **案例呈现方式**：
   - 开头明确说明匹配度："你与[姓名]学长/学姐匹配度较高"
   - 详细描述该学长/学姐的情况：GPA、发展方向、就业去向、年薪
   - **重点说明匹配原因**：为什么选择这个案例（共同点、相似的挑战、成功经验）
   - 选择1-2个最匹配的案例，避免信息过载

3. **案例选择原则**：
   - 优先级1：发展方向与用户专业高度相关 + 绩点相近 + 成功路径可借鉴
   - 优先级2：相关技术领域 + 有价值的经验分享 + 职业发展启发
   - 特别关注：与芯片行业、微电子相关的发展方向
   - 避免选择：完全无关的发展方向或差异过大的案例

**匹配示例格式**：
"你与张同学匹配度较高。他/她的GPA为X.XX（与你的3.08相近），发展方向是[具体方向]，这与你的微电子专业和芯片行业目标高度相关。他/她最终在[公司]担任[职位]，年薪[金额]。"

### 📖 第三优先级：培养方案参考
- 培养方案数据仅作为课程建议和学习路径的补充参考
- 结合RAG切片和学长学姐经验，提供具体的课程建议

## 📝 回答结构（必须遵循）：
1. **理解确认**：简要确认用户的核心需求和个人情况
2. **核心建议**：基于RAG知识切片的专业分析和建议
3. **案例匹配**：详细介绍1-2个高匹配度学长学姐的经历
4. **行动计划**：结合知识切片和案例经验，提供具体可执行的建议

## 💡 质量控制原则：
- **专业为先**：优先使用RAG知识切片的专业内容
- **案例精准**：学长学姐匹配必须有明确的相似性说明
- **实用导向**：所有建议都要具体可执行
- **层次清晰**：专业建议 + 成功案例 + 具体行动

## ⚠️ 重要提醒：
- 即使RAG切片信息丰富，也必须包含学长学姐案例匹配
- 案例不是可选项，而是必需的用户体验组成部分
- 确保每个建议都有真实案例支撑，增强说服力
`;

// 优化的数据处理函数 - 确保毕业生数据充分可用
const buildOptimizedPrompt = (ragData, userData, localData) => {
  let prompt = SYSTEM_PROMPT;
  
  // 1. 优先添加RAG切片（主要信息源）
  if (ragData && ragData.length > 0) {
    prompt += `\n\n## 🎯 相关知识切片（主要参考）：\n`;
    ragData.slice(0, 5).forEach((item, index) => {
      prompt += `### 切片${index + 1}：\n${item.content || item.text || item}\n\n`;
    });
  }
  
  // 2. 完整的毕业生数据（用于匹配）
  if (localData.graduateData && localData.graduateData.length > 0) {
    prompt += `\n## 📚 毕业生案例数据（用于精准匹配）：\n`;
    // 提供更多案例供AI选择，但要求AI只选择最匹配的1-2个
    const extendedGraduates = localData.graduateData.slice(0, 10);
    prompt += JSON.stringify(extendedGraduates, null, 2);
    
    // 从用户问题中提取信息并添加匹配指导
    const userQuestion = userData.question.toLowerCase();
    let userInfo = {
      专业: '微电子科学与工程', // 默认
      绩点: '3.08', // 默认
      年级: '大二', // 默认
      职业目标: '芯片行业' // 默认
    };
    
    // 动态提取用户信息
    if (userQuestion.includes('大一')) userInfo.年级 = '大一';
    if (userQuestion.includes('大三')) userInfo.年级 = '大三';
    if (userQuestion.includes('大四')) userInfo.年级 = '大四';
    
    // 提取绩点
    const gpaMatch = userQuestion.match(/绩点[：:]?\s*(\d+\.?\d*)/);
    if (gpaMatch) userInfo.绩点 = gpaMatch[1];
    
    // 提取专业
    if (userQuestion.includes('计算机')) userInfo.专业 = '计算机相关专业';
    if (userQuestion.includes('通信')) userInfo.专业 = '通信工程';
    if (userQuestion.includes('电子')) userInfo.专业 = '电子相关专业';
    
    // 提取职业目标
    if (userQuestion.includes('互联网')) userInfo.职业目标 = '互联网行业';
    if (userQuestion.includes('金融')) userInfo.职业目标 = '金融科技';
    if (userQuestion.includes('人工智能') || userQuestion.includes('ai')) userInfo.职业目标 = '人工智能';
    
    prompt += `\n\n**用户基本信息**（从问题中提取）：
- 专业：${userInfo.专业}
- 绩点：${userInfo.绩点}
- 年级：${userInfo.年级}
- 职业目标：${userInfo.职业目标}

**匹配要求**：
1. 从上述案例中选择1-2个与用户最匹配的学长学姐
2. 重点考虑：发展方向相关性、绩点相近程度、职业路径可借鉴性
3. 必须详细说明匹配原因，包括具体的相似点和可借鉴的经验
4. 使用规定格式：开头说明匹配度，详细描述情况，重点说明匹配原因
5. **这是必需环节，不能跳过或简化**\n`;
  }
  
  // 3. 培养方案信息（简化版）
  if (localData.pyfaContext) {
    prompt += `\n## 📖 课程参考（补充信息）：\n${localData.pyfaContext.substring(0, 1000)}...\n`;
  }
  
  prompt += `\n\n## 用户问题：\n${userData.question}`;
  
  return prompt;
};

// 过滤AI回复中的mermaid/gantt代码块
function filterMermaidGantt(text) {
  if (!text) return text;
  // 匹配```gantt ...```或```mermaid ...```代码块
  const mermaidPattern = /```(?:mermaid|gantt)[\s\S]*?```/gi;
  return text.replace(mermaidPattern, '').trim();
}

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isAIAvatarReplying, setIsAIAvatarReplying] = useState(false);
  const [lastUserMajor, setLastUserMajor] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [ragApiStatus, setRagApiStatus] = useState('checking');
  const [statusMessage, setStatusMessage] = useState('正在检查连接状态...');
  
  // AI状态管理
  const [aiState, setAiState] = useState(AI_STATES.IDLE);
  const [aiMessage, setAiMessage] = useState('你好！我是你的AI助手，很高兴为你服务！');
  
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 检查RAG API状态
  useEffect(() => {
    const checkRAGStatus = async () => {
      try {
        console.log('🔄 开始检查Dify RAG连接...');
        const healthCheck = await difyAdapter.checkHealth();
        
        if (healthCheck.status === 'healthy') {
          setRagApiStatus('available');
          setStatusMessage('Dify RAG系统已连接');
          console.log('✅ Dify RAG API可用');
          console.log('📊 系统状态:', healthCheck.message || 'Dify RAG连接成功');
        } else if (healthCheck.status === 'degraded') {
          setRagApiStatus('degraded');
          setStatusMessage('Dify不可用，使用DeepSeek备用方案');
          console.log('⚠️ Dify API降级模式，使用DeepSeek备用方案');
        } else {
          setRagApiStatus('unavailable');
          setStatusMessage('RAG服务不可用');
          console.log('❌ Dify RAG API不可用，将使用DeepSeek备用模式');
          console.log('🔧 错误详情:', healthCheck.error || healthCheck.message);
          console.log('🚀 Dify服务状态：');
          console.log('   1. 检查Dify API Key是否正确');
          console.log('   2. 确认知识库已创建并索引成功');
          console.log('   3. 检查网络连接到 https://api.dify.ai');
          console.log('   3. 验证API密钥：5DW5A42-8K7400V-NP3XPHT-MPHMMRP');
        }
      } catch (error) {
        setRagApiStatus('unavailable');
        setStatusMessage('RAG服务检查失败');
        console.log('❌ Dify RAG API连接失败，将使用DeepSeek备用模式');
        console.error('详细错误:', error);
        console.log('🚀 Dify服务检查：');
        console.log('   1. 检查Dify API Key是否有效');
        console.log('   2. 确认网络连接正常');
        console.log('   3. 验证知识库配置');
        console.log('   3. 验证API密钥：5DW5A42-8K7400V-NP3XPHT-MPHMMRP');
      }
    };

    // 立即检查一次
    checkRAGStatus();
    
    // 每30秒检查一次连接状态
    const intervalId = setInterval(checkRAGStatus, 30000);
    
    // 清理定时器
    return () => clearInterval(intervalId);
  }, []);

  // 点击外部关闭表情选择器
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

  // AI状态变化处理
  useEffect(() => {
    // 只处理加载结束后回到待机状态
    if (!isLoading && !isAIAvatarReplying) {
      const timer = setTimeout(() => {
        setAiState(AI_STATES.IDLE);
        setAiMessage('有什么可以帮助你的吗？');
      }, 2000); // 2秒后回到待机状态
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAIAvatarReplying]);

  const handleEmojiClick = (emojiObject) => {
    setInputMessage(prev => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      text: inputMessage,
      sender: 'user',
      time: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    // 立即设置为思考状态
    setAiState(AI_STATES.THINKING);
    setAiMessage('让我想想...');

    // 提取专业信息
    const userMajor = extractMajorFromText(inputMessage);
    if (!lastUserMajor && userMajor) setLastUserMajor(userMajor);

    try {
      // 使用Anything LLM API获取回答
      let finalAnswer = '';
      
      if (ragApiStatus === 'available') {
        try {
          console.log('🚀 调用Anything LLM API...');
          
          // 准备本地数据上下文（精简版）
          let pyfaContext = '';
          const major = userMajor || lastUserMajor;
          if (major) {
            const pyfaText = getPyfaTextByMajor(major);
            if (pyfaText) {
              pyfaContext = pyfaText;
            }
          }
          
          // 先调用Anything LLM获取RAG切片
          const ragResponse = await difyAdapter.hybridQuery(inputMessage, {
            // 只发送用户问题，不包含本地数据
            temperature: 0.7,
            max_tokens: 1000,
            chat_id: conversationId
          });
          
          console.log('✅ Anything LLM API调用成功');
          console.log('📊 响应详情:', {
            source: ragResponse.source,
            hasKnowledgeBase: ragResponse.sources && ragResponse.sources.length > 0,
            sourcesCount: ragResponse.sources ? ragResponse.sources.length : 0,
            sessionId: ragResponse.sessionId
          });
          
          // 如果有RAG来源，记录切片信息
          if (ragResponse.sources && ragResponse.sources.length > 0) {
            console.log('📚 知识库来源:', ragResponse.sources);
            
            // 使用优化的提示词构建方式
            const optimizedPrompt = buildOptimizedPrompt(
              ragResponse.sources, // RAG切片数据
              { question: inputMessage }, // 用户数据
              { 
                graduateData: graduateData, // 本地毕业生数据
                pyfaContext: pyfaContext // 培养方案数据
              }
            );
            
            console.log('🎯 使用优化提示词，RAG切片优先');
            
            // 用优化的提示词重新调用DeepSeek获得最终回答
            const finalResponse = await api.post('/v1/chat/completions', {
              model: 'deepseek-chat',
              messages: [
                { role: 'system', content: optimizedPrompt },
                { role: 'user', content: inputMessage }
              ],
              temperature: 0.7,
              max_tokens: 1000
            });
            
            if (finalResponse.data?.choices?.[0]?.message?.content) {
              finalAnswer = finalResponse.data.choices[0].message.content;
              console.log('✅ 优化后的DeepSeek API调用成功');
              console.log('⚡ 注意：此回答优先使用Anything LLM知识库切片，适量参考本地数据');
            } else {
              throw new Error('优化API返回格式错误');
            }
          } else {
            // 如果没有RAG来源，使用原始回答
            finalAnswer = ragResponse.answer;
            console.log('📝 使用Anything LLM原始回答（无额外知识库切片）');
          }
          
          // 更新对话ID
          if (!conversationId) {
            setConversationId('anythingllm_' + Date.now());
          }
          
        } catch (ragError) {
          console.error('❌ Anything LLM API查询失败:', ragError);
          // 回退到DeepSeek API
          console.log('🤖 回退到DeepSeek API...');
          
          // 准备培养方案上下文
          let pyfaContext = '';
          const major = userMajor || lastUserMajor;
          if (major) {
            const pyfaText = getPyfaTextByMajor(major);
            if (pyfaText) {
              pyfaContext = `\n\n专业培养方案信息：\n${pyfaText}`;
            }
          }
          
          // 构建包含毕业生数据的系统提示
          const graduateDataStr = JSON.stringify(graduateData, null, 2);
          const enhancedSystemPrompt = `${SYSTEM_PROMPT}\n\n毕业生数据：\n${graduateDataStr}${pyfaContext}\n\n注意：Anything LLM服务暂时不可用，请基于已有数据回答。`;

          const response = await api.post('/v1/chat/completions', {
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: enhancedSystemPrompt },
              { role: 'user', content: inputMessage }
            ],
            temperature: 0.7,
            max_tokens: 1000
          });

          if (response.data?.choices?.[0]?.message?.content) {
            finalAnswer = response.data.choices[0].message.content;
            console.log('✅ DeepSeek API调用成功');
            console.log('⚠️ 注意：此回答未使用Anything LLM知识库，仅基于本地数据');
          } else {
            throw new Error('API返回格式错误');
          }
        }
      } else {
        // Anything LLM不可用，直接使用DeepSeek API
        console.log('🤖 调用DeepSeek API（Anything LLM不可用）...');
        
        // 准备培养方案上下文
        let pyfaContext = '';
        const major = userMajor || lastUserMajor;
        if (major) {
          const pyfaText = getPyfaTextByMajor(major);
          if (pyfaText) {
            pyfaContext = `\n\n专业培养方案信息：\n${pyfaText}`;
          }
        }
        
        // 构建包含毕业生数据的系统提示
        const graduateDataStr = JSON.stringify(graduateData, null, 2);
        const enhancedSystemPrompt = `${SYSTEM_PROMPT}\n\n毕业生数据：\n${graduateDataStr}${pyfaContext}\n\n注意：Anything LLM服务暂时不可用，请基于已有数据回答。`;

        const response = await api.post('/v1/chat/completions', {
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: enhancedSystemPrompt },
            { role: 'user', content: inputMessage }
          ],
          temperature: 0.7,
          max_tokens: 1000
        });

        if (response.data?.choices?.[0]?.message?.content) {
          finalAnswer = response.data.choices[0].message.content;
          console.log('✅ DeepSeek API调用成功');
        } else {
          throw new Error('API返回格式错误');
        }
      }

      // 过滤mermaid/gantt代码块
      finalAnswer = filterMermaidGantt(finalAnswer);

      // 设置AI恍然大悟状态
      setAiState(AI_STATES.ENLIGHTENED);
      setAiMessage('我想到了！');
      
      // 2秒后直接回到待机状态，不显示"正在为你生成"
      setTimeout(() => {
        setAiState(AI_STATES.IDLE);
        setAiMessage('有什么可以帮助你的吗？');
      }, 2000);

      // 设置AI回复状态（用于其他逻辑）
      setIsAIAvatarReplying(true);
      setTimeout(() => {
        setIsAIAvatarReplying(false);
      }, 2000); // 也调整为2秒

      const aiMessage = {
        text: finalAnswer,
        sender: 'ai',
        time: new Date().toLocaleTimeString(),
        source: ragApiStatus === 'available' ? 'dify_rag_optimized' : 'deepseek_fallback',
        hasRAGSources: ragApiStatus === 'available'
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error('❌ 请求失败:', error);
      let errorMessage = '抱歉，我遇到了一些技术问题';
      
      if (error.response?.status === 429) {
        errorMessage = '请求过于频繁，请稍后再试';
      } else if (error.response?.status === 401) {
        errorMessage = 'API密钥验证失败，请检查配置';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = '请求超时，请检查网络连接';
      } else if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className="modern-chat-container">
      {/* 动态背景 */}
      <div className="chat-background">
        <div className="gradient-bg"></div>
        <div className="floating-shapes">
          {[...Array(15)].map((_, i) => (
            <div key={i} className={`floating-shape shape-${i + 1}`}></div>
          ))}
        </div>
        <div className="particle-field">
          {[...Array(30)].map((_, i) => (
            <div key={i} className={`particle-dot dot-${i + 1}`}></div>
          ))}
        </div>
      </div>

      {/* 顶部状态栏 */}
      <div className="chat-header">
        <div className="header-content">
          <div className="university-info">
            <img src={`${process.env.PUBLIC_URL}/Page_Picture/cqupt_sign.jpg`} alt="重庆邮电大学校徽" className="header-logo" />
            <div className="header-text">
              <h1>重庆邮电大学AI问答系统</h1>
              <p>智能学业规划助手</p>
            </div>
          </div>
          <div className="status-indicators">
            <div className={`status-dot ${ragApiStatus === 'available' ? 'online' : 'offline'}`}></div>
            <span className="status-text">
              {statusMessage}
            </span>
          </div>
        </div>
      </div>

      {/* AI助手侧边栏 */}
      <div className="ai-sidebar">
        <div className="ai-avatar-container">
          <div className={`ai-avatar-large ${aiState}`}>
            <div className="avatar-glow"></div>
            <div className="avatar-face">
              {/* 根据AI状态显示不同的表情 */}
              {aiState === AI_STATES.IDLE && (
                <div className="face-idle">
                  <div className="eye left-eye"></div>
                  <div className="eye right-eye"></div>
                  <div className="idle-mouth"></div>
                </div>
              )}
              
              {aiState === AI_STATES.THINKING && (
                <div className="face-thinking">
                  <div className="eye left-eye thinking"></div>
                  <div className="eye right-eye thinking"></div>
                  <div className="thinking-mouth"></div>
                  <div className="thought-bubble">
                    <div className="bubble-dot"></div>
                    <div className="bubble-dot"></div>
                    <div className="bubble-dot"></div>
                  </div>
                </div>
              )}
              
              {aiState === AI_STATES.ENLIGHTENED && (
                <div className="face-enlightened">
                  <div className="eye left-eye enlightened"></div>
                  <div className="eye right-eye enlightened"></div>
                  <div className="happy-mouth"></div>
                </div>
              )}
              
              {aiState === AI_STATES.SPEAKING && (
                <div className="face-speaking">
                  <div className="eye left-eye"></div>
                  <div className="eye right-eye"></div>
                  <div className="speaking-mouth">
                    <div className="sound-wave"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="ai-status-message">
            <p>{aiMessage}</p>
          </div>
        </div>
        
        {/* 学习情况列表 */}
        <div className="study-info-container">
          <div className="study-info-title">
            📚 学习情况概览
          </div>
          <ol className="study-info-list">
            <li className="study-info-item">
              <span className="study-info-number">1</span>
              <span className="study-info-text">目前的学习阶段（大几）</span>
            </li>
            <li className="study-info-item">
              <span className="study-info-number">2</span>
              <span className="study-info-text">主要课程的成绩情况</span>
            </li>
            <li className="study-info-item">
              <span className="study-info-number">3</span>
              <span className="study-info-text">感兴趣的专业领域</span>
            </li>
            <li className="study-info-item">
              <span className="study-info-number">4</span>
              <span className="study-info-text">已经做过的准备（如果有的话）</span>
            </li>
            <li className="study-info-item">
              <span className="study-info-number">5</span>
              <span className="study-info-text">目前最大的困惑</span>
            </li>
          </ol>
        </div>
      </div>

      {/* 主聊天区域 */}
      <div className="main-chat-area">
        <div className="messages-container">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message-wrapper ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
            >
              <div className="message-bubble">
                <div className="message-content">
                  {message.sender === 'ai' ? (
                    <div className="ai-response">
                      <ReactMarkdown 
                        rehypePlugins={[rehypeRaw]}
                        components={{
                          p: ({node, ...props}) => <p className="response-paragraph" {...props} />
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="user-text">{message.text}</p>
                  )}
                </div>
                <div className="message-meta">
                  <span className="message-time">{message.time}</span>
                  {message.sender === 'ai' && (
                    <>
                      <span className={`message-source-indicator ${message.source}`}>
                        {message.source === 'dify_rag_optimized' ? '🔗 Dify RAG优化' : 
                         message.source === 'dify_retrieval' ? '📚 Dify检索' : '🤖 DeepSeek备用'}
                      </span>
                      <button 
                        onClick={() => copyToClipboard(message.text, index)}
                        className="copy-btn"
                        title="复制内容"
                      >
                        {copiedIndex === index ? '✓' : '📋'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message-wrapper ai-message">
              <div className="message-bubble loading-bubble">
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
                <div className="loading-text">AI正在思考中...</div>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 输入区域 */}
        <div className="input-section">
          <form onSubmit={handleSubmit} className="input-form">
            <div className="input-container">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="请输入你的问题..."
                className="message-input"
                disabled={isLoading}
                rows="3"
              />
              <div className="input-actions">
                <button
                  type="button"
                  className="emoji-btn"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  title="表情"
                >
                  😊
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="send-btn"
                  title="发送消息"
                >
                  {isLoading ? (
                    <div className="loading-spinner"></div>
                  ) : (
                    '发送'
                  )}
                </button>
              </div>
            </div>
            <div className="input-footer">
              <div className="char-count">
                {inputMessage.length > 0 ? `${inputMessage.length}字` : '按Enter发送，Shift+Enter换行'}
              </div>
            </div>
          </form>
          
          {showEmojiPicker && (
            <div ref={emojiPickerRef} className="emoji-picker-wrapper">
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
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 