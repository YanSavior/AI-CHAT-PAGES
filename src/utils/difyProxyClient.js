/**
 * Dify 代理客户端
 * 通过后端代理调用 Dify API，解决 CORS 问题
 */

import axios from 'axios';

class DifyProxyClient {
  constructor(options = {}) {
    this.proxyUrl = options.proxyUrl || '/api/dify-proxy';
    this.timeout = options.timeout || 30000;
    
    this.client = axios.create({
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * 通过代理调用 Dify API
   */
  async proxyRequest(method, url, data = null) {
    try {
      console.log(`🔗 代理请求: ${method} ${url}`);
      
      const response = await this.client.post(this.proxyUrl, {
        method: method,
        url: url,
        body: data
      });
      
      console.log('✅ 代理响应成功');
      return response.data;
      
    } catch (error) {
      console.error('❌ 代理请求失败:', error.message);
      throw new Error(`代理请求失败: ${error.message}`);
    }
  }

  /**
   * 检查服务状态
   */
  async checkHealth() {
    return await this.proxyRequest('GET', '/');
  }

  /**
   * 知识库检索
   */
  async retrieveDocuments(query, options = {}) {
    try {
      console.log('📚 Dify 代理知识库检索:', query);
      
      const requestData = {
        query: query,
        top_k: options.top_k || 3,
        score_threshold: options.score_threshold || 0.5
      };
      
      const response = await this.proxyRequest('POST', '/datasets/retrieval', requestData);
      
      if (response && response.records) {
        console.log('✅ 代理知识库检索成功, 找到文档:', response.records.length);
        return {
          success: true,
          documents: response.records,
          query: query,
          retrieval_count: response.records.length
        };
      }
      
      return {
        success: true,
        documents: [],
        query: query,
        retrieval_count: 0
      };
      
    } catch (error) {
      console.error('❌ 代理知识库检索失败:', error.message);
      throw new Error(`代理知识库检索失败: ${error.message}`);
    }
  }

  /**
   * 文档查询 - 兼容原有接口
   */
  async queryDocuments(question, options = {}) {
    try {
      console.log('🔍 Dify 代理文档查询:', question);
      
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
      console.error('❌ 代理文档查询失败:', error.message);
      throw new Error(`代理文档查询失败: ${error.message}`);
    }
  }

  /**
   * 聊天对话
   */
  async chat(message, options = {}) {
    const requestData = {
      inputs: {},
      query: message,
      response_mode: options.response_mode || 'blocking',
      user: options.user || 'anonymous',
      conversation_id: options.conversation_id || null
    };
    
    return await this.proxyRequest('POST', '/chat-messages', requestData);
  }
}

export default DifyProxyClient;
