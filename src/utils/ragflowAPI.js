/**
 * RAGflow API 客户端
 * 直接调用RAGflow的RESTful API实现完整RAG功能
 */

import axios from 'axios';
import config from '../config/apiConfig';

class RAGflowAPI {
  constructor() {
    this.baseURL = config.ragflow.baseURL;
    this.apiKey = config.ragflow.apiKey;
    this.defaultDatasetId = config.ragflow.defaultDatasetId;
    this.defaultChatId = config.ragflow.defaultChatId;
    
    // 创建axios实例
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: config.ragflow.timeout,
      headers: {
        ...config.ragflow.headers,
        'Authorization': `Bearer ${this.apiKey}`
      }
    });

    // 添加请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        console.log('🚀 RAGflow API请求:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => {
        console.error('❌ RAGflow API请求错误:', error);
        return Promise.reject(error);
      }
    );

    // 添加响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        console.log('✅ RAGflow API响应:', response.status, response.data);
        return response;
      },
      (error) => {
        console.error('❌ RAGflow API响应错误:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * 检查RAGflow服务状态（简化版）
   */
  async checkHealth() {
    console.log('🔍 开始RAGflow健康检查...');
    console.log('📍 RAGflow地址:', this.baseURL);
    console.log('🔑 API密钥:', this.apiKey ? `${this.apiKey.substring(0, 20)}...` : '未配置');
    console.log('📦 数据集ID:', this.defaultDatasetId);
    
    try {
      // 直接尝试获取数据集列表
      const response = await this.client.get('/api/v1/datasets', {
        params: { page: 1, page_size: 1 }
      });
      
      console.log('✅ RAGflow健康检查成功!');
      console.log('📊 响应状态:', response.status);
      console.log('📊 数据集数量:', response.data?.data?.length || 0);
      
      // 检查目标数据集是否存在
      if (response.data?.data && this.defaultDatasetId) {
        const targetDataset = response.data.data.find(ds => ds.id === this.defaultDatasetId);
        if (targetDataset) {
          console.log('✅ 找到目标数据集:', targetDataset.name);
          console.log('📄 文档数量:', targetDataset.document_count);
          console.log('🧩 分块数量:', targetDataset.chunk_count);
        } else {
          console.log('⚠️ 未找到目标数据集，但连接正常');
        }
      }
      
      return { 
        status: 'available', 
        data: response.data,
        message: 'RAGflow连接成功'
      };
      
    } catch (error) {
      console.error('❌ RAGflow健康检查失败:', error);
      console.error('📋 错误详情:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data
      });
      
      return { 
        status: 'unavailable', 
        error: error.message,
        message: 'RAGflow连接失败'
      };
    }
  }

  /**
   * 获取数据集列表
   */
  async listDatasets(params = {}) {
    try {
      const response = await this.client.get('/api/v1/datasets', {
        params: {
          page: 1,
          page_size: 30,
          orderby: 'create_time',
          desc: true,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      console.error('获取数据集列表失败:', error);
      throw error;
    }
  }

  /**
   * 创建数据集
   */
  async createDataset(name, options = {}) {
    try {
      const response = await this.client.post('/api/v1/datasets', {
        name,
        description: options.description || `${name} - 重庆邮电大学AI问答系统知识库`,
        embedding_model: options.embedding_model || 'BAAI/bge-large-zh-v1.5@BAAI',
        permission: options.permission || 'me',
        chunk_method: options.chunk_method || 'naive',
        parser_config: options.parser_config || {
          chunk_token_num: 512,
          delimiter: '\\n',
          html4excel: false,
          layout_recognize: 'DeepDOC',
          raptor: { use_raptor: false }
        }
      });
      return response.data;
    } catch (error) {
      console.error('创建数据集失败:', error);
      throw error;
    }
  }

  /**
   * 检索相关文档片段
   */
  async retrieveChunks(question, options = {}) {
    try {
      const params = {
        question,
        dataset_ids: options.dataset_ids || (this.defaultDatasetId ? [this.defaultDatasetId] : []),
        page: options.page || 1,
        page_size: options.page_size || config.ragflow.retrieval.page_size,
        similarity_threshold: options.similarity_threshold || config.ragflow.retrieval.similarity_threshold,
        vector_similarity_weight: options.vector_similarity_weight || config.ragflow.retrieval.vector_similarity_weight,
        top_k: options.top_k || config.ragflow.retrieval.top_k,
        keyword: options.keyword || false,
        highlight: options.highlight || false
      };

      const response = await this.client.post('/api/v1/retrieval', params);
      return response.data;
    } catch (error) {
      console.error('检索文档片段失败:', error);
      throw error;
    }
  }

  /**
   * 使用OpenAI兼容的聊天API进行对话
   * 这个API会自动结合知识库进行RAG
   */
  async chatCompletion(messages, options = {}) {
    try {
      const chatId = options.chat_id || this.defaultChatId || 'default';
      const response = await this.client.post(`/api/v1/chats_openai/${chatId}/chat/completions`, {
        model: options.model || 'deepseek-chat',
        messages,
        stream: options.stream || false,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000
      });
      return response.data;
    } catch (error) {
      console.error('RAGflow聊天完成失败:', error);
      throw error;
    }
  }

  /**
   * 混合RAG查询 - 结合检索和LLM生成
   */
  async hybridQuery(question, options = {}) {
    try {
      console.log('🤖 开始混合RAG查询:', question);
      
      // 如果有指定的chat_id，直接使用聊天API
      if (options.chat_id || this.defaultChatId) {
        const messages = [
          {
            role: 'system',
            content: options.system_prompt || '你是重庆邮电大学的AI助手，专门为学生提供学业规划和就业指导。请基于知识库内容回答问题，并提供准确的信息和建议。'
          },
          {
            role: 'user',
            content: question
          }
        ];

        const chatResponse = await this.chatCompletion(messages, options);
        
        return {
          question,
          answer: chatResponse.choices[0].message.content,
          relevant_docs: [], // RAGflow聊天API内部处理检索
          source: 'ragflow_chat'
        };
      }

      // 否则使用检索+生成的方式
      // 1. 检索相关文档
      const retrievalResult = await this.retrieveChunks(question, options);
      
      let relevant_docs = [];
      if (retrievalResult.data && retrievalResult.data.chunks) {
        relevant_docs = retrievalResult.data.chunks.map(chunk => chunk.content);
      }

      // 如果有检索到内容，返回检索结果；否则返回提示
      const answer = relevant_docs.length > 0
        ? `根据知识库信息，我为您整理了以下相关内容：\n\n${relevant_docs.slice(0, 3).join('\n\n')}`
        : '抱歉，我在知识库中没有找到与您问题相关的信息。请尝试换个方式提问，或者确保相关文档已经上传到知识库中。';

      return {
        question,
        answer,
        relevant_docs,
        source: 'ragflow_retrieval'
      };
    } catch (error) {
      console.error('混合RAG查询失败:', error);
      throw error;
    }
  }

  /**
   * 上传文档到数据集
   */
  async uploadDocuments(datasetId, documents) {
    try {
      const formData = new FormData();
      
      documents.forEach((doc, index) => {
        if (doc.file) {
          formData.append('file', doc.file, doc.name || `document_${index}`);
        }
      });

      const response = await this.client.post(`/api/v1/datasets/${datasetId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('上传文档失败:', error);
      throw error;
    }
  }

  /**
   * 获取数据集中的文档列表
   */
  async listDocuments(datasetId, params = {}) {
    try {
      const response = await this.client.get(`/api/v1/datasets/${datasetId}/documents`, {
        params: {
          page: 1,
          page_size: 30,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      console.error('获取文档列表失败:', error);
      throw error;
    }
  }

  /**
   * 解析文档
   */
  async parseDocuments(datasetId, documentIds) {
    try {
      const response = await this.client.post(`/api/v1/datasets/${datasetId}/documents/parse`, {
        document_ids: documentIds
      });
      return response.data;
    } catch (error) {
      console.error('解析文档失败:', error);
      throw error;
    }
  }
}

// 创建全局实例
const ragflowAPI = new RAGflowAPI();

export default ragflowAPI; 