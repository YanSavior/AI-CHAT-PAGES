// RAGflow API客户端
import axios from 'axios';
import { RAG_CONFIG } from '../config/apiConfig';

class RAGflowClient {
  constructor() {
    this.client = axios.create({
      baseURL: RAG_CONFIG.baseURL,
      timeout: RAG_CONFIG.timeout,
      headers: RAG_CONFIG.headers
    });
    
    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        console.log('🚀 RAGflow API请求:', config.url, config.data);
        return config;
      },
      (error) => {
        console.error('❌ RAGflow API请求错误:', error);
        return Promise.reject(error);
      }
    );
    
    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        console.log('✅ RAGflow API响应:', response.data);
        return response;
      },
      (error) => {
        console.error('❌ RAGflow API响应错误:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }
  
  // 健康检查
  async healthCheck() {
    try {
      const response = await this.client.get('/api/v1/health');
      return response.data;
    } catch (error) {
      console.error('RAGflow健康检查失败:', error);
      throw error;
    }
  }
  
  // 查询知识库
  async query(question, options = {}) {
    try {
      const requestData = {
        question: question,
        conversation_id: options.conversationId || this.generateConversationId(),
        quote: options.includeQuote !== false, // 默认包含引用
        stream: false, // 不使用流式响应
        ...options
      };
      
      const response = await this.client.post('/api/v1/completion', requestData);
      
      // 处理RAGflow的响应格式
      return this.formatResponse(response.data, question);
    } catch (error) {
      console.error('RAGflow查询失败:', error);
      throw error;
    }
  }
  
  // 格式化响应以匹配前端期望的格式
  formatResponse(ragflowResponse, originalQuestion) {
    return {
      question: originalQuestion,
      answer: ragflowResponse.answer || ragflowResponse.data?.answer || '抱歉，没有获得回答',
      relevant_docs: this.extractRelevantDocs(ragflowResponse),
      scores: this.extractScores(ragflowResponse),
      source: 'ragflow',
      conversation_id: ragflowResponse.conversation_id,
      reference: ragflowResponse.reference || []
    };
  }
  
  // 提取相关文档
  extractRelevantDocs(response) {
    if (response.reference && Array.isArray(response.reference)) {
      return response.reference.map(ref => ref.content || ref.chunk_content || ref.text || '');
    }
    
    if (response.chunks && Array.isArray(response.chunks)) {
      return response.chunks.map(chunk => chunk.content || chunk.text || '');
    }
    
    return [];
  }
  
  // 提取相关性分数
  extractScores(response) {
    if (response.reference && Array.isArray(response.reference)) {
      return response.reference.map(ref => ref.similarity || ref.score || 0.8);
    }
    
    if (response.chunks && Array.isArray(response.chunks)) {
      return response.chunks.map(chunk => chunk.similarity || chunk.score || 0.8);
    }
    
    return [];
  }
  
  // 生成对话ID
  generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // 获取知识库列表
  async getKnowledgeBases() {
    try {
      const response = await this.client.get('/api/v1/datasets');
      return response.data;
    } catch (error) {
      console.error('获取知识库列表失败:', error);
      throw error;
    }
  }
  
  // 设置默认知识库
  setDefaultDataset(datasetId) {
    this.defaultDatasetId = datasetId;
    this.client.defaults.headers['X-Dataset-ID'] = datasetId;
  }
}

// 创建全局实例
const ragflowClient = new RAGflowClient();

export default ragflowClient;