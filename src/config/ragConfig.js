// RAG系统配置文件
export const RAG_CONFIG = {
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
  
  // 混合RAG模式配置
  HYBRID_MODE: {
    ENABLED: true,
    DEFAULT_TOP_K: 3,
    USE_LOCAL_FALLBACK: true,
    DEEPSEEK_API_KEY: 'sk-7f5214ed15764dfea0b45c84c6d0c961'
  }
};

// 导出默认配置
export default RAG_CONFIG; 