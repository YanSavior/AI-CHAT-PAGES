#!/usr/bin/env node
/**
 * 测试前端RAG连接
 * 运行方式: node test_frontend_rag_connection.js
 */

const axios = require('axios');

// RAG配置
const RAG_CONFIG = {
  DEV_URL: 'http://localhost:8000',
  PROD_URL: 'https://335266e2e75a.ngrok-free.app',
  
  getApiBaseURL: () => {
    // 模拟生产环境
    return RAG_CONFIG.PROD_URL;
  },
  
  ENDPOINTS: {
    HEALTH: '/api/health',
    QUERY: '/api/query',
    BUILD_KB: '/api/build_knowledge_base',
    ROOT: '/'
  }
};

// 创建RAG API客户端
const ragApi = axios.create({
  baseURL: RAG_CONFIG.getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

async function testRAGConnection() {
  console.log('🚀 开始测试前端RAG连接');
  console.log('=' * 50);
  console.log(`🌐 RAG API地址: ${RAG_CONFIG.getApiBaseURL()}`);
  console.log('=' * 50);
  
  try {
    // 1. 测试健康检查
    console.log('\n🔍 测试健康检查...');
    const healthResponse = await ragApi.get(RAG_CONFIG.ENDPOINTS.HEALTH);
    console.log('✅ 健康检查成功');
    console.log(`   状态: ${healthResponse.data.status}`);
    console.log(`   RAG系统初始化: ${healthResponse.data.rag_system_initialized}`);
    
    // 2. 测试根端点
    console.log('\n🔍 测试根端点...');
    const rootResponse = await ragApi.get(RAG_CONFIG.ENDPOINTS.ROOT);
    console.log('✅ 根端点访问成功');
    console.log(`   消息: ${rootResponse.data.message}`);
    console.log(`   状态: ${rootResponse.data.status}`);
    
    // 3. 测试查询接口
    console.log('\n🔍 测试查询接口...');
    const queryPayload = {
      question: "什么是RAG系统？",
      top_k_retrieve: 5,
      top_k_final: 3
    };
    
    const queryResponse = await ragApi.post(RAG_CONFIG.ENDPOINTS.QUERY, queryPayload);
    console.log('✅ 查询接口测试成功');
    console.log(`   问题: ${queryResponse.data.question}`);
    console.log(`   答案: ${queryResponse.data.answer.substring(0, 100)}...`);
    console.log(`   相关文档数: ${queryResponse.data.relevant_docs.length}`);
    
    // 4. 测试知识库构建
    console.log('\n🔍 测试知识库构建...');
    const buildResponse = await ragApi.post(RAG_CONFIG.ENDPOINTS.BUILD_KB);
    console.log('✅ 知识库构建测试成功');
    console.log(`   响应: ${buildResponse.data.message}`);
    
    console.log('\n🎉 所有测试通过！前端可以正常连接到RAG系统');
    
  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    
    if (error.response) {
      console.error(`   状态码: ${error.response.status}`);
      console.error(`   错误信息: ${error.response.data}`);
    }
    
    console.log('\n🔧 故障排除建议:');
    console.log('1. 确认RAG服务器正在运行');
    console.log('2. 检查ngrok隧道是否正常');
    console.log('3. 验证API端点是否正确');
    console.log('4. 检查网络连接');
  }
}

// 运行测试
testRAGConnection(); 