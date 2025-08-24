/**
 * Netlify 无服务器函数 - Dify API 代理
 * 解决前端 CORS 限制问题，支持Dify知识库查询
 */

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
  };

  // 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  console.log('🔄 收到Dify代理请求:', event.httpMethod, event.path);

  try {
    let requestData;
    
    // 解析请求体
    if (event.body) {
      try {
        requestData = JSON.parse(event.body);
      } catch (e) {
        requestData = event.body;
      }
    }

    // 处理健康检查
    if (event.httpMethod === 'GET') {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'healthy',
          message: 'Dify代理服务运行正常',
          service: 'netlify-dify-proxy',
          timestamp: new Date().toISOString(),
          functionPath: '/.netlify/functions/dify-proxy'
        })
      };
    }

    // 处理Dify API请求
    if (event.httpMethod === 'POST') {
      const { method, url, headers: requestHeaders, body: requestBody } = requestData || {};
      
      // 验证请求参数
      if (!url || !method) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: '缺少必要参数: url 和 method' })
        };
      }

      // 构建Dify API URL
      const difyUrl = url.startsWith('http') ? url : `https://api.dify.ai/v1${url}`;
      
      // 设置Dify API Key
      const difyApiKey = process.env.DIFY_API_KEY || 'dataset-AdiXWdxe8pPYcQX3cu20arf7';
      
      // 构建请求头
      const difyHeaders = {
        'Authorization': `Bearer ${difyApiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'CQUPT-AI-Chat/1.0.0',
        ...requestHeaders
      };

      console.log(`🔄 代理到Dify: ${method} ${difyUrl}`);
      console.log(`🔑 使用API Key: ${difyApiKey.substring(0, 20)}...`);

      // 发送请求到Dify API
      const fetchOptions = {
        method: method,
        headers: difyHeaders
      };

      // 添加请求体（非GET请求）
      if (method !== 'GET' && requestBody) {
        fetchOptions.body = typeof requestBody === 'string' ? requestBody : JSON.stringify(requestBody);
      }

      const response = await fetch(difyUrl, fetchOptions);
      const responseData = await response.text();
      
      let jsonData;
      try {
        jsonData = JSON.parse(responseData);
      } catch (e) {
        jsonData = { data: responseData };
      }

      if (!response.ok) {
        console.error('❌ Dify API 错误:', response.status, jsonData);
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({
            error: 'Dify API 错误',
            status: response.status,
            message: jsonData.message || responseData,
            details: jsonData
          })
        };
      }

      console.log('✅ Dify API 响应成功');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(jsonData)
      };
    }

    // 不支持的方法
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: '不支持的HTTP方法' })
    };

  } catch (error) {
    console.error('❌ Dify代理服务器错误:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: '代理服务器错误',
        message: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
