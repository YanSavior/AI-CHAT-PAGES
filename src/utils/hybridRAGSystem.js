// 混合RAG系统实现
// 同时使用本地前端RAG和DeepSeek API，不依赖内网穿透

import SimpleFrontendRAG from './simpleFrontendRAG';
import axios from 'axios';

class HybridRAGSystem {
  constructor(options = {}) {
    this.localRAG = new SimpleFrontendRAG();
    this.isInitialized = false;
    this.options = {
      apiKey: options.apiKey || 'sk-7f5214ed15764dfea0b45c84c6d0c961', // 默认API密钥
      model: options.model || 'deepseek-chat',
      maxTokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
      topK: options.topK || 3,
      systemPrompt: options.systemPrompt || '你是一个专业的大学咨询助手，专门为大学生提供学习和生活方面的建议。请根据用户的问题提供详细、实用的回答。'
    };
  }

  async initialize() {
    try {
      console.log('初始化混合RAG系统...');
      
      // 初始化本地RAG系统
      await this.localRAG.initialize();
      
      this.isInitialized = true;
      console.log('混合RAG系统初始化完成');
      
      return this.getStatus();
    } catch (error) {
      console.error('混合RAG系统初始化失败:', error);
      throw error;
    }
  }

  async query(question, options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`[混合RAG] 处理问题: ${question}`);
      
      // 步骤1: 使用本地RAG系统检索相关文档
      const localTopK = options.topK || this.options.topK;
      const ragResult = await this.localRAG.query(question, localTopK);
      
      let ragContext = '';
      if (ragResult.relevant_docs && ragResult.relevant_docs.length > 0) {
        ragContext = `\n\n相关专业知识库信息：\n${ragResult.relevant_docs.join('\n\n')}`;
        console.log(`[混合RAG] 本地检索到 ${ragResult.relevant_docs.length} 个相关文档`);
      } else {
        console.log('[混合RAG] 本地未检索到相关文档');
      }
      
      // 步骤2: 调用DeepSeek API生成回答
      const apiResponse = await this.callLLMAPI(question, ragContext, options);
      
      return {
        question,
        answer: apiResponse.answer,
        relevant_docs: ragResult.relevant_docs,
        scores: ragResult.scores,
        source: 'hybrid'
      };
    } catch (error) {
      console.error('[混合RAG] 查询失败:', error);
      
      // 如果API调用失败，尝试使用本地回退方案
      if (error.message.includes('API') || error.response) {
        // 保存ragResult变量，确保在错误处理中可用
        const ragResult = await this.localRAG.query(question, options.topK || this.options.topK);
        return this.localFallback(question, ragResult);
      }
      
      throw error;
    }
  }
  
  async callLLMAPI(question, ragContext, options = {}) {
    try {
      const apiKey = options.apiKey || this.options.apiKey;
      const model = options.model || this.options.model;
      const maxTokens = options.maxTokens || this.options.maxTokens;
      const temperature = options.temperature || this.options.temperature;
      const systemPrompt = options.systemPrompt || this.options.systemPrompt;
      
      console.log('[混合RAG] 调用DeepSeek API...');
      
      const response = await axios.post('/v1/chat/completions', {
        model: model,
        messages: [
          {
            role: 'system',
            content: `${systemPrompt}${ragContext}`
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_tokens: maxTokens,
        temperature: temperature
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      const answer = response.data.choices[0].message.content;
      console.log('[混合RAG] API调用成功');
      
      return { answer };
    } catch (error) {
      console.error('[混合RAG] API调用失败:', error);
      throw new Error('API调用失败: ' + (error.response?.data?.error?.message || error.message));
    }
  }
  
  async localFallback(question, ragResult) {
    console.log('[混合RAG] 使用本地回退方案...');
    
    // 简单的回退方案：基于检索到的文档构建回答
    let answer = '抱歉，我无法连接到AI服务。以下是我从知识库中找到的相关信息：\n\n';
    
    if (ragResult.relevant_docs && ragResult.relevant_docs.length > 0) {
      answer += ragResult.relevant_docs.join('\n\n');
    } else {
      answer += '很遗憾，我没有找到与您问题相关的信息。请尝试重新表述您的问题，或者稍后再试。';
    }
    
    return {
      question,
      answer,
      relevant_docs: ragResult.relevant_docs,
      scores: ragResult.scores,
      source: 'local_fallback'
    };
  }
  
  // 添加新文档到本地知识库
  addDocument(document) {
    this.localRAG.addDocument(document);
  }
  
  // 获取系统状态
  getStatus() {
    const localStatus = this.localRAG.getStatus();
    
    return {
      isInitialized: this.isInitialized,
      localRAG: localStatus,
      apiConfigured: !!this.options.apiKey
    };
  }
}

export default HybridRAGSystem; 