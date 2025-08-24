/**
 * Dify RAG 系统
 * 集成 Dify 知识库检索 + DeepSeek 答案生成
 */

import DifyClient from './difyClient.js';
import DifyProxyClient from './difyProxyClient.js';
import axios from 'axios';

class DifyRAG {
  constructor(options = {}) {
    // 检查是否使用代理模式
    const useProxy = process.env.REACT_APP_USE_PROXY === 'true' || process.env.NODE_ENV === 'production';
    
    if (useProxy) {
      console.log('🔗 使用 Dify 代理客户端');
      this.difyClient = new DifyProxyClient({
        proxyUrl: process.env.REACT_APP_PROXY_URL || '/api/dify-proxy',
        apiKey: options.difyApiKey || 'dataset-AdiXWdxe8pPYcQX3cu20arf7',
        datasetId: options.datasetId || '4b03f4127e3011f0a2a51a264d04a702',
        timeout: options.timeout || 30000
      });
    } else {
      console.log('🔗 使用 Dify 直连客户端');
      this.difyClient = new DifyClient({
        apiKey: options.difyApiKey || 'dataset-AdiXWdxe8pPYcQX3cu20arf7',
        baseURL: options.difyBaseURL || 'https://api.dify.ai/v1',
        datasetId: options.datasetId || '4b03f4127e3011f0a2a51a264d04a702',
        timeout: options.timeout || 30000
      });
    }
    
    // DeepSeek API 配置
    this.deepseekConfig = {
      baseURL: 'https://api.deepseek.com',
      apiKey: 'sk-7f5214ed15764dfea0b45c84c6d0c961',
      timeout: 30000
    };
    
    // 创建 DeepSeek 客户端
    this.deepseekClient = axios.create({
      baseURL: this.deepseekConfig.baseURL,
      timeout: this.deepseekConfig.timeout,
      headers: {
        'Authorization': `Bearer ${this.deepseekConfig.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    this.initialized = false;
  }

  /**
   * 初始化系统
   */
  async initialize() {
    try {
      console.log('🚀 初始化 Dify RAG 系统...');
      
      // 检查 Dify API 状态
      const healthCheck = await this.difyClient.checkHealth();
      console.log('✅ Dify API 连接成功:', healthCheck);
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('❌ Dify RAG 系统初始化失败:', error.message);
      this.initialized = false;
      throw error;
    }
  }

  /**
   * 主查询方法 - Dify RAG + DeepSeek 生成
   */
  async query(question, options = {}) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }
      
      console.log('📝 Dify RAG 处理问题:', question);
      
      // Step 1: Dify 知识库检索
      const retrievalResult = await this.difyClient.queryDocuments(question, {
        top_k: options.top_k || 5,
        score_threshold: options.score_threshold || 0.3
      });
      
      if (!retrievalResult.success) {
        throw new Error('Dify 知识库检索失败');
      }
      
      // Step 2: 构建 DeepSeek 提示词
      const prompt = this.buildPromptWithDifyResults(question, retrievalResult);
      
      // Step 3: DeepSeek 生成答案
      const answer = await this.generateAnswerWithDeepSeek(prompt, options);
      
      return {
        success: true,
        answer: answer,
        source: 'dify_rag_optimized',
        documents: retrievalResult.documents || [],
        retrieval_count: retrievalResult.retrieval_count || 0,
        has_knowledge_base: retrievalResult.documents?.length > 0
      };
      
    } catch (error) {
      console.error('❌ Dify RAG 查询失败:', error.message);
      
      // 降级到纯 DeepSeek
      return await this.fallbackToDeepSeek(question, options);
    }
  }

  /**
   * 构建包含 Dify 检索结果的提示词
   */
  buildPromptWithDifyResults(question, retrievalResult) {
    const documents = retrievalResult.documents || [];
    
    let prompt = `你是一个专业的学业指导AI助手，专门帮助大学生进行学业规划和发展建议。

## 角色定位
- 基于提供的知识库信息回答问题
- 重点关注学长学姐经验分享和专业发展路径
- 提供具体可行的建议和指导

## 回答要求
1. **必须基于知识库信息**：优先使用提供的文档内容回答
2. **学长学姐匹配**：如果有相关的学长学姐案例，必须详细介绍
3. **具体建议**：提供可操作的具体建议
4. **结构清晰**：使用markdown格式，层次分明

`;

    if (documents.length > 0) {
      prompt += `## 📚 相关知识库内容\n\n`;
      
      documents.forEach((doc, index) => {
        prompt += `### 文档 ${index + 1} (相关度: ${(doc.score * 100).toFixed(1)}%)\n`;
        prompt += `**来源**: ${doc.source}\n`;
        prompt += `**内容**: ${doc.content}\n\n`;
      });
      
      prompt += `## 💡 基于以上信息，请回答用户问题\n\n`;
    } else {
      prompt += `## ⚠️ 注意\n当前知识库中暂无直接相关的信息，请基于一般性的学业指导原则回答。\n\n`;
    }
    
    prompt += `**用户问题**: ${question}\n\n`;
    prompt += `请基于上述知识库内容，为用户提供专业的学业指导建议。如果有相关的学长学姐案例，请详细介绍他们的经验和建议。`;
    
    return prompt;
  }

  /**
   * 使用 DeepSeek 生成答案
   */
  async generateAnswerWithDeepSeek(prompt, options = {}) {
    try {
      console.log('🤖 使用 DeepSeek 生成答案...');
      
      const requestData = {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000,
        stream: false
      };
      
      const response = await this.deepseekClient.post('/chat/completions', requestData);
      
      if (response.data?.choices?.[0]?.message?.content) {
        const answer = response.data.choices[0].message.content;
        console.log('✅ DeepSeek 答案生成成功');
        return answer;
      }
      
      throw new Error('DeepSeek API 响应格式异常');
      
    } catch (error) {
      console.error('❌ DeepSeek 生成答案失败:', error.message);
      throw new Error(`答案生成失败: ${error.message}`);
    }
  }

  /**
   * 降级到纯 DeepSeek 模式
   */
  async fallbackToDeepSeek(question, options = {}) {
    try {
      console.log('🔄 降级到 DeepSeek 模式...');
      
      const fallbackPrompt = `你是一个专业的学业指导AI助手。请为以下问题提供专业建议：

${question}

请提供具体可行的建议和指导。`;
      
      const answer = await this.generateAnswerWithDeepSeek(fallbackPrompt, options);
      
      return {
        success: true,
        answer: answer,
        source: 'deepseek_fallback',
        documents: [],
        retrieval_count: 0,
        has_knowledge_base: false
      };
      
    } catch (error) {
      console.error('❌ DeepSeek 降级模式失败:', error.message);
      throw new Error(`所有查询方式都失败了: ${error.message}`);
    }
  }

  /**
   * 检查系统状态
   */
  async checkStatus() {
    try {
      const difyStatus = await this.difyClient.checkHealth();
      
      // 检查 DeepSeek API
      const deepseekTest = await this.deepseekClient.get('/models');
      
      return {
        dify: {
          status: 'healthy',
          ...difyStatus
        },
        deepseek: {
          status: deepseekTest.status === 200 ? 'healthy' : 'error'
        },
        system: 'operational'
      };
    } catch (error) {
      console.error('❌ 系统状态检查失败:', error.message);
      return {
        dify: { status: 'error' },
        deepseek: { status: 'error' },
        system: 'degraded'
      };
    }
  }
}

export default DifyRAG;
