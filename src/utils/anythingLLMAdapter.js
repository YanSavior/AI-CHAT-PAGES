import AnythingLLMRAG from './anythingLLMRAG';

/**
 * Anything LLM适配器
 * 提供与RAGflow API兼容的接口，让原有的ChatInterface无需修改即可使用Anything LLM
 */
class AnythingLLMAdapter {
  constructor() {
    this.ragSystem = new AnythingLLMRAG();
    this.isInitialized = false;
  }

  /**
   * 健康检查 - 兼容RAGflow API的checkHealth方法
   */
  async checkHealth() {
    try {
      if (!this.isInitialized) {
        const initResult = await this.ragSystem.initialize();
        this.isInitialized = true;
        
        if (initResult.status === 'success') {
          return {
            status: 'available',
            data: {
              message: 'Anything LLM连接成功',
              workspace: initResult.workspace,
              sessionId: initResult.sessionId
            },
            message: 'Anything LLM连接成功'
          };
        } else if (initResult.status === 'fallback') {
          return {
            status: 'available',
            data: {
              message: 'Anything LLM不可用，使用DeepSeek备用方案',
              fallback: true
            },
            message: 'Anything LLM不可用，使用DeepSeek备用方案'
          };
        }
      } else {
        // 已初始化，检查状态
        const status = await this.ragSystem.checkStatus();
        return {
          status: 'available',
          data: status,
          message: 'Anything LLM系统状态正常'
        };
      }
    } catch (error) {
      console.error('Anything LLM适配器健康检查失败:', error);
      return {
        status: 'unavailable',
        error: error.message,
        message: 'Anything LLM连接失败',
        details: {
          suggestion: '请检查Anything LLM服务是否正在运行在端口3001'
        }
      };
    }
  }

  /**
   * 混合查询 - 兼容RAGflow API的hybridQuery方法
   * @param {string} question - 用户问题
   * @param {Object} options - 查询选项
   * @returns {Promise<Object>} 查询结果
   */
  async hybridQuery(question, options = {}) {
    try {
      if (!this.isInitialized) {
        await this.ragSystem.initialize();
        this.isInitialized = true;
      }

      // 构建系统提示，兼容原有的system_prompt字段
      const systemPrompt = options.system_prompt || options.systemPrompt || '';
      
      // 调用Anything LLM RAG系统
      const response = await this.ragSystem.query(question, {
        systemPrompt: systemPrompt,
        temperature: options.temperature || 0.7,
        maxTokens: options.max_tokens || options.maxTokens || 1000,
        sessionId: options.chat_id || options.sessionId
      });

      // 返回兼容RAGflow格式的响应
      return {
        answer: response.answer,
        relevant_docs: response.sources || [],
        sources: response.sources || [],
        sessionId: response.sessionId,
        source: response.source,
        question: question
      };

    } catch (error) {
      console.error('Anything LLM适配器查询失败:', error);
      throw error;
    }
  }

  /**
   * 重置会话
   */
  resetSession() {
    if (this.ragSystem) {
      this.ragSystem.resetSession();
    }
  }

  /**
   * 获取工作空间信息
   */
  async getWorkspaceInfo() {
    if (!this.isInitialized) {
      await this.ragSystem.initialize();
      this.isInitialized = true;
    }
    return await this.ragSystem.getWorkspaceInfo();
  }

  /**
   * 获取状态信息
   */
  async getStatus() {
    if (!this.isInitialized) {
      await this.ragSystem.initialize();
      this.isInitialized = true;
    }
    return await this.ragSystem.checkStatus();
  }
}

// 创建单例实例
const anythingLLMAdapter = new AnythingLLMAdapter();

export default anythingLLMAdapter; 