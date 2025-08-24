/**
 * Dify API 客户端
 * 基于 Dify OpenAPI v1 实现
 * API 文档: https://api.dify.ai/v1
 */

import axios from 'axios';

class DifyClient {
  constructor(options = {}) {
    this.apiKey = options.apiKey || 'dataset-AdiXWdxe8pPYcQX3cu20arf7';
    this.baseURL = options.baseURL || 'https://api.dify.ai/v1';
    this.timeout = options.timeout || 30000;
    
    // 创建 axios 实例
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        console.log('🔗 Dify API 请求:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => {
        console.error('❌ Dify API 请求错误:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        console.log('✅ Dify API 响应成功:', response.status);
        return response;
      },
      (error) => {
        console.error('❌ Dify API 响应错误:', error.response?.status, error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  /**
   * 检查 Dify API 服务状态
   */
  async checkHealth() {
    try {
      console.log('🔍 检查 Dify API 服务状态...');
      const response = await this.client.get('/');
      
      if (response.data?.welcome === 'Dify OpenAPI') {
        console.log('✅ Dify API 服务正常:', response.data);
        return {
          status: 'healthy',
          version: response.data.server_version,
          api_version: response.data.api_version
        };
      }
      
      throw new Error('API 响应格式异常');
    } catch (error) {
      console.error('❌ Dify API 服务检查失败:', error.message);
      throw new Error(`Dify API 服务不可用: ${error.message}`);
    }
  }

  /**
   * 知识库检索查询
   * 使用 dataset API 进行文档检索
   */
  async retrieveDocuments(query, options = {}) {
    try {
      console.log('📚 Dify 知识库检索:', query);
      
      const requestData = {
        query: query,
        top_k: options.top_k || 3,
        score_threshold: options.score_threshold || 0.5
      };

      // 使用数据集检索端点
      const response = await this.client.post('/datasets/retrieval', requestData);
      
      if (response.data && response.data.records) {
        console.log('✅ 知识库检索成功, 找到文档:', response.data.records.length);
        return {
          success: true,
          documents: response.data.records,
          query: query,
          retrieval_count: response.data.records.length
        };
      }
      
      console.log('⚠️ 知识库检索无结果');
      return {
        success: true,
        documents: [],
        query: query,
        retrieval_count: 0
      };
      
    } catch (error) {
      console.error('❌ Dify 知识库检索失败:', error.message);
      throw new Error(`知识库检索失败: ${error.message}`);
    }
  }

  /**
   * 聊天对话 API
   * 使用应用的聊天接口
   */
  async chat(message, options = {}) {
    try {
      console.log('💬 Dify 聊天请求:', message);
      
      const requestData = {
        inputs: {},
        query: message,
        response_mode: options.response_mode || 'blocking',
        user: options.user || 'anonymous',
        conversation_id: options.conversation_id || null
      };

      // 如果有应用ID，使用应用聊天接口
      if (options.app_id) {
        const response = await this.client.post(`/chat-messages`, requestData, {
          headers: {
            'Authorization': `Bearer ${options.app_api_key || this.apiKey}`
          }
        });
        
        if (response.data) {
          console.log('✅ Dify 聊天响应成功');
          return {
            success: true,
            answer: response.data.answer,
            conversation_id: response.data.conversation_id,
            message_id: response.data.id,
            metadata: response.data.metadata
          };
        }
      }
      
      throw new Error('需要配置应用ID和应用API Key');
      
    } catch (error) {
      console.error('❌ Dify 聊天请求失败:', error.message);
      throw new Error(`Dify 聊天失败: ${error.message}`);
    }
  }

  /**
   * 获取对话历史
   */
  async getConversationHistory(conversation_id, options = {}) {
    try {
      const response = await this.client.get(`/messages`, {
        params: {
          conversation_id: conversation_id,
          first_id: options.first_id,
          limit: options.limit || 20
        }
      });
      
      return {
        success: true,
        messages: response.data.data || [],
        has_more: response.data.has_more || false
      };
    } catch (error) {
      console.error('❌ 获取对话历史失败:', error.message);
      throw new Error(`获取对话历史失败: ${error.message}`);
    }
  }

  /**
   * 文档查询 - 结合检索和生成
   */
  async queryDocuments(question, options = {}) {
    try {
      console.log('🔍 Dify 文档查询:', question);
      
      // 首先进行文档检索
      const retrievalResult = await this.retrieveDocuments(question, {
        top_k: options.top_k || 5,
        score_threshold: options.score_threshold || 0.3
      });
      
      if (!retrievalResult.success || retrievalResult.documents.length === 0) {
        return {
          success: true,
          answer: '',
          documents: [],
          source: 'dify_no_results'
        };
      }
      
      // 格式化检索到的文档
      const documents = retrievalResult.documents.map(doc => ({
        content: doc.segment.content,
        metadata: doc.segment.metadata,
        score: doc.score,
        source: doc.segment.document?.name || 'unknown'
      }));
      
      return {
        success: true,
        answer: '', // 将由 DeepSeek 生成答案
        documents: documents,
        source: 'dify_retrieval',
        retrieval_count: documents.length
      };
      
    } catch (error) {
      console.error('❌ Dify 文档查询失败:', error.message);
      throw new Error(`文档查询失败: ${error.message}`);
    }
  }
}

export default DifyClient;
