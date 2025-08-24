/**
 * Service Worker for 重邮AI问答系统
 * 提供离线支持和缓存管理
 */

const CACHE_NAME = 'cqupt-ai-v1.0.0';
const STATIC_CACHE = 'cqupt-ai-static-v1.0.0';
const DYNAMIC_CACHE = 'cqupt-ai-dynamic-v1.0.0';

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/'
  // 暂时不缓存任何静态资源，避免404错误
];

// 需要缓存的数据文件
const DATA_ASSETS = [
  '/data/graduateData.js',
  '/data/pyfaData.json',
  '/data/pyfaData-1.json'
];

// API 端点配置
const API_ENDPOINTS = {
  deepseek: 'https://api.deepseek.com',
  rag: '/api/rag'
};

// 安装事件
self.addEventListener('install', event => {
  console.log('Service Worker: 安装中...');
  
  event.waitUntil(
    Promise.all([
      // 缓存静态资源
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Service Worker: 缓存静态资源');
        return cache.addAll(STATIC_ASSETS.concat(DATA_ASSETS));
      })
    ]).then(() => {
      console.log('Service Worker: 安装完成');
      return self.skipWaiting();
    }).catch(error => {
      console.error('Service Worker: 安装失败', error);
    })
  );
});

// 激活事件
self.addEventListener('activate', event => {
  console.log('Service Worker: 激活中...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // 删除旧版本缓存
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: 删除旧缓存', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: 激活完成');
      return self.clients.claim();
    })
  );
});

// 拦截网络请求
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 跳过非 GET 请求
  if (request.method !== 'GET') {
    return;
  }
  
  // 跳过 Chrome 扩展请求
  if (url.protocol === 'chrome-extension:') {
    return;
  }
  
  // API 请求处理
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // 静态资源请求处理
  if (isStaticAsset(request.url)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }
  
  // 页面请求处理（SPA 路由支持）
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
  
  // 其他请求使用网络优先策略
  event.respondWith(handleOtherRequest(request));
});

// 处理 API 请求
async function handleApiRequest(request) {
  try {
    // API 请求总是尝试网络请求
    const response = await fetch(request);
    
    // 如果是成功的响应，缓存到动态缓存
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('Service Worker: API 请求失败，尝试缓存', error);
    
    // 网络失败时尝试从缓存获取
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 返回离线页面或错误响应
    return new Response(
      JSON.stringify({
        error: '网络连接失败，请检查网络设置',
        offline: true,
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// 处理静态资源请求
async function handleStaticRequest(request) {
  // 缓存优先策略
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    
    // 缓存成功的响应
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('Service Worker: 静态资源请求失败', error);
    
    // 返回离线提示
    if (request.destination === 'image') {
      return new Response('', { status: 404 });
    }
    
    return new Response('资源加载失败', { status: 404 });
  }
}

// 处理页面导航请求
async function handleNavigationRequest(request) {
  try {
    // 尝试网络请求
    const response = await fetch(request);
    return response;
  } catch (error) {
    console.log('Service Worker: 页面请求失败，返回缓存的首页', error);
    
    // 网络失败时返回缓存的首页
    const cachedResponse = await caches.match('/');
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 返回离线页面
    return new Response(`
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>离线模式 - 重邮AI问答系统</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 20px;
          }
          .offline-icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          .offline-title {
            font-size: 32px;
            margin-bottom: 16px;
          }
          .offline-message {
            font-size: 18px;
            margin-bottom: 24px;
            opacity: 0.9;
          }
          .retry-button {
            background: white;
            color: #667eea;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
          }
          .retry-button:hover {
            transform: translateY(-2px);
          }
        </style>
      </head>
      <body>
        <div class="offline-icon">📱</div>
        <h1 class="offline-title">离线模式</h1>
        <p class="offline-message">
          网络连接不可用，但您仍可以使用已缓存的功能。<br>
          请检查网络连接后重试。
        </p>
        <button class="retry-button" onclick="window.location.reload()">
          重新连接
        </button>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// 处理其他请求
async function handleOtherRequest(request) {
  try {
    const response = await fetch(request);
    
    // 缓存成功的响应
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    // 尝试从缓存获取
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// 判断是否为静态资源
function isStaticAsset(url) {
  return url.includes('/static/') || 
         url.includes('/data/') ||
         url.includes('/培养方案/') ||
         url.endsWith('.js') ||
         url.endsWith('.css') ||
         url.endsWith('.png') ||
         url.endsWith('.jpg') ||
         url.endsWith('.jpeg') ||
         url.endsWith('.gif') ||
         url.endsWith('.svg') ||
         url.endsWith('.ico') ||
         url.endsWith('.json');
}

// 消息处理
self.addEventListener('message', event => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({
        version: CACHE_NAME,
        timestamp: new Date().toISOString()
      });
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches().then(() => {
        event.ports[0].postMessage({ success: true });
      });
      break;
      
    default:
      console.log('Service Worker: 未知消息类型', type);
  }
});

// 清除所有缓存
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('Service Worker: 所有缓存已清除');
}

// 后台同步（如果支持）
if ('sync' in self.registration) {
  self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
      event.waitUntil(doBackgroundSync());
    }
  });
}

async function doBackgroundSync() {
  console.log('Service Worker: 执行后台同步');
  // 这里可以添加后台同步逻辑，比如同步离线时的操作
}

console.log('Service Worker: 脚本加载完成');