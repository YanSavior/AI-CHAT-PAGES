import axios from 'axios';

/**
 * Anything LLM API客户端
 * 用于与Anything LLM服务进行交互
 */
class AnythingLLMClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || '5DW5A42-8K7400V-NP3XPHT-MPHMMRP';
    this.workspaceName = options.workspaceName || 'test';
    this.baseURL = options.baseURL || 'http://localhost:3001'; // Anything LLM默认端口
    
    // 创建axios实例
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json'
      },
      timeout: 30000 // 30秒超时
    });
    
    this.isInitialized = false;
  }

  /**
   * 初始化客户端，检查连接状态
   */
  async initialize() {
    try {
      console.log('🔗 初始化Anything LLM客户端...');
      
      // 首先测试基本连接
      const healthResponse = await axios.get(`${this.baseURL}/api/v1/system`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 使用axios实例的timeout
      });
      
      console.log('🔍 系统健康检查响应:', healthResponse.status);
      
      // 验证工作区
      await this.verifyWorkspace();
      
      this.isInitialized = true;
      console.log('✅ Anything LLM客户端初始化成功');
      return true;
    } catch (error) {
      console.log('❌ Anything LLM客户端初始化失败:', error);
      
      if (error.response?.status === 401) {
        console.log('🔑 API密钥验证失败，请检查密钥是否正确');
        console.log('💡 尝试在Anything LLM应用中获取新的API密钥');
      } else if (error.response?.status === 404) {
        console.log('📂 工作区或端点不存在');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('🔌 无法连接到Anything LLM服务');
      }
      
      throw new Error(`Anything LLM初始化失败: ${error.message}`);
    }
  }

  /**
   * 验证工作空间是否存在
   */
  async verifyWorkspace() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v1/workspace/${this.workspaceName}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 使用axios实例的timeout
      });
      console.log(`✅ 工作空间 "${this.workspaceName}" 验证成功`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        console.warn(`⚠️ 工作空间 "${this.workspaceName}" 不存在`);
        console.log(`💡 请在Anything LLM应用中创建名为 "${this.workspaceName}" 的工作空间`);
        // 不抛出错误，让系统继续运行
        return null;
      }
      throw error;
    }
  }

  /**
   * 发送聊天消息到指定工作空间
   * @param {string} message - 用户消息
   * @param {Object} options - 聊天选项
   * @returns {Promise<Object>} 聊天响应
   */
  async chat(message, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`💬 向工作空间 "${this.workspaceName}" 发送消息:`, message);
      
      const requestData = {
        message: message,
        sessionId: options.sessionId || `session_${Date.now()}`
        // 移除mode参数，可能导致冲突
      };

      const response = await this.client.post(
        `/api/v1/workspace/${this.workspaceName}/chat`,
        requestData
      );

      if (response.data) {
        console.log('✅ Anything LLM响应成功');
        return {
          answer: response.data.textResponse || response.data.response || '',
          sources: response.data.sources || [],
          sessionId: response.data.sessionId,
          rawResponse: response.data
        };
      } else {
        throw new Error('无效的响应格式');
      }
    } catch (error) {
      console.error('❌ Anything LLM聊天请求失败:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.error || error.response.data?.message || '未知错误';
        throw new Error(`Anything LLM API错误: ${errorMessage}`);
      } else if (error.request) {
        throw new Error('无法连接到Anything LLM服务，请检查服务器状态');
      } else {
        throw new Error(`请求配置错误: ${error.message}`);
      }
    }
  }

  /**
   * 获取工作空间信息
   */
  async getWorkspaceInfo() {
    try {
      const response = await this.client.get(`/api/v1/workspace/${this.workspaceName}`);
      return response.data;
    } catch (error) {
      console.error('获取工作空间信息失败:', error);
      throw error;
    }
  }

  /**
   * 获取工作空间的文档列表
   */
  async getWorkspaceDocuments() {
    try {
      const response = await this.client.get(`/api/v1/workspace/${this.workspaceName}/documents`);
      return response.data;
    } catch (error) {
      console.error('获取工作空间文档失败:', error);
      throw error;
    }
  }

  /**
   * 检查Anything LLM服务状态
   */
  async checkStatus() {
    try {
      const response = await this.client.get('/api/v1/system');
      return {
        status: 'available',
        data: response.data
      };
    } catch (error) {
      return {
        status: 'unavailable',
        error: error.message
      };
    }
  }

  /**
   * 设置新的工作空间
   */
  setWorkspace(workspaceName) {
    this.workspaceName = workspaceName;
    this.isInitialized = false; // 需要重新初始化
  }

  /**
   * 更新API配置
   */
  updateConfig(config) {
    if (config.apiKey) this.apiKey = config.apiKey;
    if (config.baseURL) this.baseURL = config.baseURL;
    if (config.workspaceName) this.workspaceName = config.workspaceName;
    
    // 更新axios实例的配置
    this.client.defaults.baseURL = this.baseURL;
    this.client.defaults.headers['Authorization'] = `Bearer ${this.apiKey}`;
    
    this.isInitialized = false; // 需要重新初始化
  }
}

export default AnythingLLMClient; 