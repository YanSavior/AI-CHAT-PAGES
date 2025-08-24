/**
 * Dify 适配器
 * 替换 anythingLLMAdapter，保持接口兼容性
 * 实现 Dify RAG + DeepSeek 润色的完整流程
 */

import DifyRAG from './difyRAG.js';
import { RAG_CONFIG } from '../config/ragConfig.js';

class DifyAdapter {
  constructor() {
    console.log('🔧 初始化 Dify 适配器...');
    
    this.ragSystem = new DifyRAG({
      difyApiKey: RAG_CONFIG.DIFY?.API_KEY || 'dataset-AdiXWdxe8pPYcQX3cu20arf7',
      difyBaseURL: RAG_CONFIG.DIFY?.BASE_URL || 'https://api.dify.ai/v1',
      datasetId: RAG_CONFIG.DIFY?.DATASET_ID || '4b03f4127e3011f0a2a51a264d04a702',
      timeout: RAG_CONFIG.DIFY?.TIMEOUT || 30000
    });
    
    this.isInitialized = false;
  }

  /**
   * 检查健康状态
   */
  async checkHealth() {
    try {
      console.log('🔍 检查 Dify 系统健康状态...');
      
      // 检查配置
      if (!RAG_CONFIG.DIFY?.ENABLED) {
        console.log('⚠️ Dify 功能已禁用，将使用 DeepSeek 备用方案');
        return {
          status: 'degraded',
          message: 'Dify 功能已禁用，使用 DeepSeek 备用方案',
          service: 'deepseek_only'
        };
      }
      
      // 初始化 Dify RAG 系统
      await this.ragSystem.initialize();
      this.isInitialized = true;
      
      // 获取系统状态
      const status = await this.ragSystem.checkStatus();
      
      console.log('✅ Dify 系统健康检查完成:', status);
      
      return {
        status: 'healthy',
        message: 'Dify RAG 系统运行正常',
        service: 'dify_rag',
        details: status
      };
      
    } catch (error) {
      console.error('❌ Dify 健康检查失败:', error.message);
      this.isInitialized = false;
      
      return {
        status: 'error',
        message: `Dify 系统不可用: ${error.message}`,
        service: 'fallback',
        error: error.message
      };
    }
  }

  /**
   * 混合查询方法 - 兼容原有接口
   */
  async hybridQuery(question, options = {}) {
    try {
      console.log('🚀 Dify 适配器处理查询:', question);
      
      // 确保系统已初始化
      if (!this.isInitialized) {
        console.log('🔄 系统未初始化，尝试重新初始化...');
        await this.ragSystem.initialize();
        this.isInitialized = true;
      }
      
      // 调用 Dify RAG 系统
      const result = await this.ragSystem.query(question, {
        top_k: options.top_k || 5,
        score_threshold: options.score_threshold || 0.3,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 2000,
        ...options
      });
      
      if (result.success) {
        console.log('✅ Dify 查询成功:', {
          source: result.source,
          has_knowledge_base: result.has_knowledge_base,
          retrieval_count: result.retrieval_count
        });
        
        // 格式化响应以兼容原有接口
        return {
          success: true,
          answer: result.answer,
          source: result.source,
          hasKnowledgeBase: result.has_knowledge_base,
          sourcesCount: result.retrieval_count,
          sources: this.formatSources(result.documents),
          metadata: {
            service: 'dify',
            retrieval_method: 'vector_search',
            generation_model: 'deepseek-chat',
            timestamp: new Date().toISOString()
          }
        };
      }
      
      throw new Error('Dify 查询返回失败状态');
      
    } catch (error) {
      console.error('❌ Dify 适配器查询失败:', error.message);
      
      // 返回错误信息，让上层处理降级
      throw new Error(`Dify 查询失败: ${error.message}`);
    }
  }

  /**
   * 格式化文档来源信息
   */
  formatSources(documents) {
    if (!documents || documents.length === 0) {
      return [];
    }
    
    return documents.map((doc, index) => ({
      id: `dify_doc_${index}`,
      title: doc.source || `文档 ${index + 1}`,
      content: doc.content,
      score: doc.score,
      metadata: doc.metadata || {},
      source_type: 'dify_knowledge_base'
    }));
  }

  /**
   * 重置会话 - 兼容原有接口
   */
  async resetSession() {
    try {
      console.log('🔄 重置 Dify 会话...');
      // Dify 使用无状态查询，无需特殊处理
      return {
        success: true,
        message: 'Dify 会话已重置'
      };
    } catch (error) {
      console.error('❌ 重置会话失败:', error.message);
      return {
        success: false,
        message: `重置会话失败: ${error.message}`
      };
    }
  }

  /**
   * 获取工作空间信息 - 兼容原有接口
   */
  async getWorkspaceInfo() {
    try {
      const status = await this.ragSystem.checkStatus();
      
      return {
        success: true,
        workspace: {
          name: 'Dify Knowledge Base',
          description: '基于 Dify 的知识库系统',
          status: status.system,
          documents_count: 'unknown',
          last_updated: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ 获取工作空间信息失败:', error.message);
      return {
        success: false,
        message: `获取工作空间信息失败: ${error.message}`
      };
    }
  }

  /**
   * 获取状态信息 - 兼容原有接口
   */
  async getStatus() {
    try {
      const status = await this.ragSystem.checkStatus();
      
      return {
        success: true,
        status: {
          service: 'dify_rag',
          health: status.system,
          dify_api: status.dify?.status || 'unknown',
          deepseek_api: status.deepseek?.status || 'unknown',
          initialized: this.isInitialized,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ 获取状态失败:', error.message);
      return {
        success: false,
        message: `获取状态失败: ${error.message}`
      };
    }
  }

  /**
   * 获取文档列表 - 兼容原有接口
   */
  async getDocuments() {
    try {
      // Dify API 可能需要不同的端点来获取文档列表
      // 暂时返回模拟数据
      return {
        success: true,
        documents: [{
          id: 'dify_kb_1',
          name: 'Dify Knowledge Base',
          type: 'knowledge_base',
          status: 'active',
          created_at: new Date().toISOString()
        }]
      };
    } catch (error) {
      console.error('❌ 获取文档列表失败:', error.message);
      return {
        success: false,
        message: `获取文档列表失败: ${error.message}`
      };
    }
  }
}

// 创建全局实例
const difyAdapter = new DifyAdapter();

export default difyAdapter;
