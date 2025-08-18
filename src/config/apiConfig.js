/**
 * API 配置文件
 * 针对 Netlify 部署优化的 API 配置
 */

// 环境检测
const isProduction = process.env.NODE_ENV === 'production';
const isNetlify = process.env.NETLIFY === 'true' || window.location.hostname.includes('netlify');

// DeepSeek API 配置
export const DEEPSEEK_CONFIG = {
  // 直接使用DeepSeek API，避免Netlify代理问题
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.REACT_APP_DEEPSEEK_API_KEY || 'sk-7f5214ed15764dfea0b45c84c6d0c961',
  model: 'deepseek-chat',
  timeout: 60000, // 增加超时时间到60秒
  headers: {
    'Content-Type': 'application/json'
    // 移除User-Agent，因为浏览器不允许设置
  }
};

// RAGflow API 配置
export const RAG_CONFIG = {
  // RAGflow本地部署的API地址
  baseURL: process.env.REACT_APP_RAGFLOW_API_URL || 'http://localhost:9380',
  timeout: 30000, // RAGflow可能需要更长时间处理
  retryAttempts: 2,
  retryDelay: 1000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.REACT_APP_RAGFLOW_TOKEN || ''}`
  }
};

// 应用配置
export const APP_CONFIG = {
  name: process.env.REACT_APP_APP_NAME || '重邮AI问答系统',
  version: process.env.REACT_APP_VERSION || '1.0.0',
  environment: process.env.REACT_APP_ENVIRONMENT || (isProduction ? 'production' : 'development'),
  buildTime: process.env.REACT_APP_BUILD_TIME || new Date().toISOString(),
  
  // 功能开关
  features: {
    adminMode: process.env.REACT_APP_ENABLE_ADMIN_MODE !== 'false',
    fileUpload: process.env.REACT_APP_ENABLE_FILE_UPLOAD !== 'false',
    knowledgeExport: process.env.REACT_APP_ENABLE_KNOWLEDGE_EXPORT !== 'false',
    localRAG: process.env.REACT_APP_ENABLE_LOCAL_RAG !== 'false'
  },
  
  // 限制配置
  limits: {
    maxMessageLength: parseInt(process.env.REACT_APP_MAX_MESSAGE_LENGTH) || 5000,
    maxKnowledgeItems: parseInt(process.env.REACT_APP_MAX_KNOWLEDGE_ITEMS) || 1000,
    sessionTimeout: parseInt(process.env.REACT_APP_SESSION_TIMEOUT) || 3600000, // 1小时
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['.txt', '.md', '.pdf', '.doc', '.docx', '.json']
  }
};

// 登录配置
export const AUTH_CONFIG = {
  // 管理员账户
  admin: {
    username: 'cqupt',
    password: '1950'
  },
  
  // 学生账户验证规则
  student: {
    usernamePattern: /^2024215\d{3}$/,
    passwordRule: 'last3digits' // 密码为账号后三位
  },
  
  // 会话配置
  session: {
    storageKey: 'cqupt_ai_session',
    timeout: APP_CONFIG.limits.sessionTimeout
  }
};

// 网络配置
export const NETWORK_CONFIG = {
  // 请求超时配置
  timeouts: {
    api: 30000,
    rag: 15000,
    upload: 60000
  },
  
  // 重试配置
  retry: {
    attempts: 3,
    delay: 1000,
    backoff: 2
  },
  
  // 错误处理
  errorHandling: {
    showUserFriendlyMessages: true,
    logErrors: isProduction,
    fallbackToLocal: true
  }
};

// 开发配置
export const DEV_CONFIG = {
  enableDebugLogs: !isProduction,
  enablePerformanceMonitoring: isProduction,
  enableErrorBoundary: true,
  mockAPIs: false // 设置为 true 可以使用模拟 API
};

// 配置对象
const config = {
  deepseek: DEEPSEEK_CONFIG,
  rag: RAG_CONFIG,
  app: APP_CONFIG,
  auth: AUTH_CONFIG,
  network: NETWORK_CONFIG,
  dev: DEV_CONFIG,
  
  // 环境信息
  environment: {
    isProduction,
    isNetlify,
    isDevelopment: !isProduction,
    platform: isNetlify ? 'netlify' : 'local'
  }
};

// 导出默认配置对象
export default config;

// 配置验证函数
export function validateConfig() {
  const errors = [];
  
  // 检查必需的环境变量
  if (!DEEPSEEK_CONFIG.apiKey || DEEPSEEK_CONFIG.apiKey === 'your_api_key_here') {
    errors.push('DeepSeek API Key 未配置或使用默认值');
  }
  
  // 检查API Key格式
  if (DEEPSEEK_CONFIG.apiKey && !DEEPSEEK_CONFIG.apiKey.startsWith('sk-')) {
    errors.push('DeepSeek API Key 格式不正确，应该以 sk- 开头');
  }
  
  // 检查API Key是否包含变量名（常见错误）
  if (DEEPSEEK_CONFIG.apiKey && DEEPSEEK_CONFIG.apiKey.includes('REACT_APP_DEEPSEEK_API_KEY')) {
    errors.push('DeepSeek API Key 包含变量名，请检查环境变量配置');
  }
  
  // 检查 API URLs
  if (!DEEPSEEK_CONFIG.baseURL) {
    errors.push('DeepSeek API URL 未配置');
  }
  
  if (errors.length > 0) {
    console.warn('⚠️ 配置验证警告:', errors);
    return { valid: false, errors };
  }
  
  console.log('✅ 配置验证通过');
  return { valid: true, errors: [] };
}

// 获取运行时配置信息
export function getRuntimeInfo() {
  return {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    platform: isNetlify ? 'Netlify' : 'Local',
    version: APP_CONFIG.version,
    buildTime: APP_CONFIG.buildTime,
    features: APP_CONFIG.features,
    apiEndpoints: {
      deepseek: DEEPSEEK_CONFIG.baseURL,
      rag: RAG_CONFIG.baseURL
    }
  };
}