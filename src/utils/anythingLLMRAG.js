import AnythingLLMClient from './anythingLLMClient';
import RAG_CONFIG from '../config/ragConfig';
import axios from 'axios';

/**
 * Anything LLM RAG系统
 * 提供与原有RAG系统兼容的接口，同时支持回退到DeepSeek API
 */
class AnythingLLMRAG {
  constructor(options = {}) {
    const config = RAG_CONFIG.ANYTHING_LLM;
    
    this.anythingLLM = new AnythingLLMClient({
      apiKey: options.apiKey || config.API_KEY,
      workspaceName: options.workspaceName || config.WORKSPACE_NAME,
      baseURL: options.baseURL || config.BASE_URL
    });
    
    this.config = {
      ...config,
      ...options
    };
    
    this.isInitialized = false;
    this.sessionId = null;
    
    // DeepSeek API备用配置
    this.deepseekApi = axios.create({
      baseURL: 'https://api.deepseek.com',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.DEEPSEEK_API_KEY}`
      },
      timeout: 15000
    });
  }

  /**
   * 初始化RAG系统
   */
  async initialize() {
    try {
      console.log('🚀 初始化Anything LLM RAG系统...');
      
      if (!this.config.ENABLED) {
        throw new Error('Anything LLM未启用');
      }
      
      await this.anythingLLM.initialize();
      
      // 生成会话ID
      if (this.config.SESSION_PERSISTENCE) {
        this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }
      
      this.isInitialized = true;
      console.log('✅ Anything LLM RAG系统初始化成功');
      
      return {
        status: 'success',
        message: 'Anything LLM RAG系统已准备就绪',
        workspace: this.config.WORKSPACE_NAME,
        sessionId: this.sessionId
      };
    } catch (error) {
      console.error('❌ Anything LLM RAG系统初始化失败:', error);
      
      if (this.config.FALLBACK_TO_DEEPSEEK) {
        console.log('🔄 将使用DeepSeek API作为备用方案');
        this.isInitialized = true; // 标记为已初始化，但使用备用方案
        return {
          status: 'fallback',
          message: 'Anything LLM不可用，使用DeepSeek备用方案',
          fallback: true
        };
      }
      
      throw error;
    }
  }

  /**
   * 查询RAG系统
   * @param {string} question - 用户问题
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 查询结果
   */
  async query(question, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`📝 处理问题: ${question}`);
      
      // 首先尝试使用Anything LLM
      if (this.config.ENABLED) {
        try {
          const chatOptions = {
            sessionId: this.sessionId,
            mode: options.mode || this.config.DEFAULT_MODE,
            ...options
          };
          
          const response = await this.anythingLLM.chat(question, chatOptions);
          
          return {
            question,
            answer: response.answer,
            sources: response.sources || [],
            sessionId: response.sessionId,
            source: 'anything_llm',
            rawResponse: response.rawResponse
          };
        } catch (anythingLLMError) {
          console.error('Anything LLM查询失败:', anythingLLMError);
          
          if (!this.config.FALLBACK_TO_DEEPSEEK) {
            throw anythingLLMError;
          }
          
          console.log('🔄 回退到DeepSeek API...');
        }
      }
      
      // 回退到DeepSeek API
      return await this.fallbackToDeepSeek(question, options);
      
    } catch (error) {
      console.error('❌ RAG查询失败:', error);
      throw error;
    }
  }

  /**
   * 回退到DeepSeek API
   * @param {string} question - 用户问题
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 查询结果
   */
  async fallbackToDeepSeek(question, options = {}) {
    try {
      console.log('🤖 使用DeepSeek API处理问题...');
      
      const systemPrompt = options.systemPrompt || `
你是一个专业的AI助手，专门为用户提供准确、有用的信息和建议。
请根据用户的问题提供详细、实用的回答。
如果问题涉及专业领域，请确保信息的准确性。
      `;
      
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: question
        }
      ];
      
      const response = await this.deepseekApi.post('/v1/chat/completions', {
        model: 'deepseek-chat',
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        top_p: options.topP || 0.9,
        frequency_penalty: options.frequencyPenalty || 0.3,
        presence_penalty: options.presencePenalty || 0.3
      });

      if (response.data && response.data.choices && response.data.choices[0]) {
        return {
          question,
          answer: response.data.choices[0].message.content,
          sources: [],
          source: 'deepseek_fallback',
          rawResponse: response.data
        };
      } else {
        throw new Error('DeepSeek API响应格式无效');
      }
    } catch (error) {
      console.error('DeepSeek API调用失败:', error);
      throw new Error(`备用方案失败: ${error.message}`);
    }
  }

  /**
   * 检查系统状态
   */
  async checkStatus() {
    try {
      const anythingLLMStatus = await this.anythingLLM.checkStatus();
      
      return {
        anythingLLM: anythingLLMStatus,
        fallbackAvailable: this.config.FALLBACK_TO_DEEPSEEK,
        sessionId: this.sessionId,
        workspace: this.config.WORKSPACE_NAME
      };
    } catch (error) {
      return {
        anythingLLM: { status: 'error', error: error.message },
        fallbackAvailable: this.config.FALLBACK_TO_DEEPSEEK,
        sessionId: this.sessionId,
        workspace: this.config.WORKSPACE_NAME
      };
    }
  }

  /**
   * 获取工作空间信息
   */
  async getWorkspaceInfo() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      return await this.anythingLLM.getWorkspaceInfo();
    } catch (error) {
      console.error('获取工作空间信息失败:', error);
      throw error;
    }
  }

  /**
   * 获取工作空间文档列表
   */
  async getWorkspaceDocuments() {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      return await this.anythingLLM.getWorkspaceDocuments();
    } catch (error) {
      console.error('获取工作空间文档失败:', error);
      throw error;
    }
  }

  /**
   * 重置会话
   */
  resetSession() {
    if (this.config.SESSION_PERSISTENCE) {
      this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    console.log('🔄 会话已重置:', this.sessionId);
  }

  /**
   * 更新配置
   */
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.anythingLLM.updateConfig(newConfig);
    this.isInitialized = false; // 需要重新初始化
  }
}

export default AnythingLLMRAG; 