// RAG系统配置文件
export const RAG_CONFIG = {
  // 传统RAG API配置（保留用于向后兼容）
  // 开发环境地址
  DEV_URL: 'http://localhost:8000',
  
  // 生产环境地址（ngrok公网地址）
  PROD_URL: 'https://335266e2e75a.ngrok-free.app',
  
  // 根据环境自动选择地址
  getApiBaseURL: () => {
    if (process.env.NODE_ENV === 'development') {
      return RAG_CONFIG.DEV_URL;
    }
    return RAG_CONFIG.PROD_URL;
  },
  
  // API端点
  ENDPOINTS: {
    HEALTH: '/api/health',
    QUERY: '/api/query',
    BUILD_KB: '/api/build_knowledge_base',
    ROOT: '/'
  },
  
  // 查询参数
  QUERY_PARAMS: {
    DEFAULT_TOP_K_RETRIEVE: 20,
    DEFAULT_TOP_K_FINAL: 5
  },
  
  // 混合RAG模式配置（已弃用，保留用于向后兼容）
  HYBRID_MODE: {
    ENABLED: false, // 禁用旧的混合模式
    DEFAULT_TOP_K: 3,
    USE_LOCAL_FALLBACK: true,
    DEEPSEEK_API_KEY: 'sk-7f5214ed15764dfea0b45c84c6d0c961'
  },
  
  // Anything LLM配置（已弃用）
  ANYTHING_LLM: {
    ENABLED: false, // 禁用Anything LLM，改用Dify
    API_KEY: '5DW5A42-8K7400V-NP3XPHT-MPHMMRP',
    WORKSPACE_NAME: 'test',
    BASE_URL: 'http://localhost:3001',
    TIMEOUT: 30000,
    DEFAULT_MODE: 'chat',
    SESSION_PERSISTENCE: true,
    FALLBACK_TO_DEEPSEEK: true,
    DEEPSEEK_API_KEY: 'sk-7f5214ed15764dfea0b45c84c6d0c961'
  },
  
  // Dify RAG配置
  DIFY: {
    ENABLED: true, // 始终启用，后端代理处理 API Key
    API_KEY: process.env.REACT_APP_DIFY_API_KEY || 'dataset-AdiXWdxe8pPYcQX3cu20arf7',
    BASE_URL: process.env.REACT_APP_DIFY_BASE_URL || 'https://api.dify.ai/v1',
    DATASET_ID: process.env.REACT_APP_DIFY_DATASET_ID || '4b03f4127e3011f0a2a51a264d04a702',
    TIMEOUT: 30000, // 30秒超时
    
    // Dify特定配置
    DEFAULT_TOP_K: 5, // 默认检索文档数量
    DEFAULT_SCORE_THRESHOLD: 0.3, // 默认相似度阈值
    
    // 生成配置
    GENERATION: {
      MODEL: 'deepseek-chat',
      TEMPERATURE: 0.7,
      MAX_TOKENS: 2000
    },
    
    // 备用配置
    FALLBACK_TO_DEEPSEEK: true, // 当Dify不可用时是否回退到DeepSeek
    DEEPSEEK_API_KEY: 'sk-7f5214ed15764dfea0b45c84c6d0c961'
  }
};

// 导出默认配置
export default RAG_CONFIG; 