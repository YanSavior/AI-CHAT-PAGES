/**
 * Vercel 无服务器函数 - Dify API 代理
 * 解决前端 CORS 限制问题
 */

export default async function handler(req, res) {
  console.log('🔄 收到代理请求:', req.method, req.url);
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { method, url, headers, body } = req.body;
    
    // 验证请求
    if (!url || !method) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    // 构建 Dify API 请求
    const difyUrl = `https://api.dify.ai/v1${url}`;
    const difyHeaders = {
      'Authorization': `Bearer ${process.env.DIFY_API_KEY}`,
      'Content-Type': 'application/json',
      ...headers
    };

    console.log(`🔄 代理请求: ${method} ${difyUrl}`);

    // 发送请求到 Dify API
    const response = await fetch(difyUrl, {
      method: method,
      headers: difyHeaders,
      body: method !== 'GET' ? JSON.stringify(body) : undefined
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Dify API 错误:', data);
      return res.status(response.status).json(data);
    }

    console.log('✅ Dify API 响应成功');
    res.status(200).json(data);

  } catch (error) {
    console.error('❌ 代理服务器错误:', error);
    res.status(500).json({ 
      error: '代理服务器错误',
      message: error.message 
    });
  }
}
