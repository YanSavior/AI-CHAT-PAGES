#!/usr/bin/env node

/**
 * Netlify 部署构建脚本
 * 为重邮AI问答系统创建完整的生产环境构建
 * 包含：DeepSeek API集成、RAG系统、登录界面、聊天界面、管理员界面
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 开始构建重邮AI问答系统 for Netlify...');

// 构建配置
const BUILD_CONFIG = {
  outputDir: 'build',
  sourceDir: 'src',
  publicDir: 'public',
  dataDir: 'data',
  componentsDir: 'src/components',
  pagesDir: 'src/pages',
  utilsDir: 'src/utils',
  configDir: 'src/config'
};

// 确保目录存在
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 创建目录: ${dir}`);
  }
}

// 复制文件
function copyFile(src, dest) {
  try {
    const destDir = path.dirname(dest);
    ensureDir(destDir);
    fs.copyFileSync(src, dest);
    console.log(`📄 复制文件: ${src} -> ${dest}`);
  } catch (error) {
    console.warn(`⚠️  复制文件失败: ${src} -> ${dest}`, error.message);
  }
}

// 复制目录
function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`⚠️  源目录不存在: ${src}`);
    return;
  }
  
  ensureDir(dest);
  const items = fs.readdirSync(src);
  
  items.forEach(item => {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  });
}

// 主构建流程
async function buildForNetlify() {
  try {
    console.log('🧹 清理旧的构建文件...');
    if (fs.existsSync(BUILD_CONFIG.outputDir)) {
      execSync(`rmdir /s /q ${BUILD_CONFIG.outputDir}`, { stdio: 'inherit' });
    }
    
    console.log('📦 执行 React 构建...');
    execSync('npm run build', { stdio: 'inherit' });
    
    console.log('🔧 优化构建文件...');
    
    // 1. 确保数据文件被正确复制
    console.log('📊 复制数据文件...');
    if (fs.existsSync(BUILD_CONFIG.dataDir)) {
      copyDir(BUILD_CONFIG.dataDir, path.join(BUILD_CONFIG.outputDir, 'data'));
    }
    
    // 2. 复制培养方案文件
    console.log('🎓 复制培养方案文件...');
    const trainingPlansDir = '培养方案';
    if (fs.existsSync(trainingPlansDir)) {
      copyDir(trainingPlansDir, path.join(BUILD_CONFIG.outputDir, '培养方案'));
    }
    
    // 3. 创建 Netlify 配置文件
    console.log('⚙️  创建 Netlify 配置...');
    createNetlifyConfig();
    
    // 4. 创建环境变量模板
    console.log('🔐 创建环境变量配置...');
    createEnvConfig();
    
    // 5. 优化静态资源
    console.log('🎨 优化静态资源...');
    optimizeStaticAssets();
    
    // 6. 创建 API 代理配置
    console.log('🌐 配置 API 代理...');
    createApiProxyConfig();
    
    // 7. 生成部署信息
    console.log('📋 生成部署信息...');
    generateDeploymentInfo();
    
    console.log('✅ Netlify 构建完成！');
    console.log(`📁 构建文件位于: ${BUILD_CONFIG.outputDir}`);
    console.log('🚀 现在可以部署到 Netlify 了！');
    
  } catch (error) {
    console.error('❌ 构建失败:', error.message);
    process.exit(1);
  }
}

// 创建 Netlify 配置
function createNetlifyConfig() {
  const netlifyConfig = {
    build: {
      publish: "build",
      command: "npm run build"
    },
    redirects: [
      {
        from: "/api/*",
        to: "https://api.deepseek.com/:splat",
        status: 200,
        force: true,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      },
      {
        from: "/*",
        to: "/index.html",
        status: 200
      }
    ],
    headers: [
      {
        for: "/*",
        values: {
          "X-Frame-Options": "DENY",
          "X-XSS-Protection": "1; mode=block",
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "strict-origin-when-cross-origin"
        }
      },
      {
        for: "/static/*",
        values: {
          "Cache-Control": "public, max-age=31536000, immutable"
        }
      }
    ]
  };
  
  fs.writeFileSync(
    path.join(BUILD_CONFIG.outputDir, 'netlify.toml'),
    `[build]
  publish = "build"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

# API 代理配置
[[redirects]]
  from = "/api/deepseek/*"
  to = "https://api.deepseek.com/:splat"
  status = 200
  force = true
  headers = {Access-Control-Allow-Origin = "*"}

# SPA 路由配置
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# 安全头配置
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

# 静态资源缓存
[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# 数据文件缓存
[[headers]]
  for = "/data/*"
  [headers.values]
    Cache-Control = "public, max-age=3600"
`
  );
}

// 创建环境变量配置
function createEnvConfig() {
  const envTemplate = `# 重邮AI问答系统 - 环境变量配置
# 请在 Netlify 控制台的 Environment Variables 中设置这些变量

# DeepSeek API 配置
REACT_APP_DEEPSEEK_API_KEY=your_deepseek_api_key_here
REACT_APP_DEEPSEEK_API_URL=https://api.deepseek.com

# RAG 系统配置
REACT_APP_RAG_API_URL=http://localhost:8000
REACT_APP_ENABLE_LOCAL_RAG=true

# 应用配置
REACT_APP_APP_NAME=重邮AI问答系统
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production

# 功能开关
REACT_APP_ENABLE_ADMIN_MODE=true
REACT_APP_ENABLE_FILE_UPLOAD=true
REACT_APP_ENABLE_KNOWLEDGE_EXPORT=true

# 安全配置
REACT_APP_MAX_MESSAGE_LENGTH=5000
REACT_APP_MAX_KNOWLEDGE_ITEMS=1000
REACT_APP_SESSION_TIMEOUT=3600000

# 部署配置
REACT_APP_BUILD_TIME=${new Date().toISOString()}
REACT_APP_COMMIT_HASH=${process.env.COMMIT_REF || 'unknown'}
`;

  fs.writeFileSync(path.join(BUILD_CONFIG.outputDir, '.env.example'), envTemplate);
  
  // 创建生产环境配置
  const prodEnv = `REACT_APP_DEEPSEEK_API_URL=https://api.deepseek.com
REACT_APP_ENABLE_LOCAL_RAG=true
REACT_APP_APP_NAME=重邮AI问答系统
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production
REACT_APP_ENABLE_ADMIN_MODE=true
REACT_APP_ENABLE_FILE_UPLOAD=true
REACT_APP_ENABLE_KNOWLEDGE_EXPORT=true
REACT_APP_MAX_MESSAGE_LENGTH=5000
REACT_APP_MAX_KNOWLEDGE_ITEMS=1000
REACT_APP_SESSION_TIMEOUT=3600000
REACT_APP_BUILD_TIME=${new Date().toISOString()}
`;

  fs.writeFileSync(path.join(BUILD_CONFIG.outputDir, '.env.production'), prodEnv);
}

// 优化静态资源
function optimizeStaticAssets() {
  const staticDir = path.join(BUILD_CONFIG.outputDir, 'static');
  
  if (fs.existsSync(staticDir)) {
    // 创建资源清单
    const assetManifest = {
      version: "1.0.0",
      buildTime: new Date().toISOString(),
      assets: {}
    };
    
    // 递归扫描静态资源
    function scanAssets(dir, basePath = '') {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const itemPath = path.join(dir, item);
        const relativePath = path.join(basePath, item).replace(/\\/g, '/');
        
        if (fs.statSync(itemPath).isDirectory()) {
          scanAssets(itemPath, relativePath);
        } else {
          const stats = fs.statSync(itemPath);
          assetManifest.assets[relativePath] = {
            size: stats.size,
            modified: stats.mtime.toISOString()
          };
        }
      });
    }
    
    scanAssets(staticDir);
    
    fs.writeFileSync(
      path.join(BUILD_CONFIG.outputDir, 'asset-manifest.json'),
      JSON.stringify(assetManifest, null, 2)
    );
  }
}

// 创建 API 代理配置
function createApiProxyConfig() {
  const proxyConfig = {
    name: "重邮AI问答系统 API 代理",
    version: "1.0.0",
    proxies: {
      deepseek: {
        target: "https://api.deepseek.com",
        changeOrigin: true,
        secure: true,
        headers: {
          "User-Agent": "CQUPT-AI-Chat/1.0.0"
        }
      },
      rag: {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        fallback: "local"
      }
    },
    cors: {
      origin: true,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      headers: ["Content-Type", "Authorization", "X-Requested-With"]
    }
  };
  
  fs.writeFileSync(
    path.join(BUILD_CONFIG.outputDir, 'proxy-config.json'),
    JSON.stringify(proxyConfig, null, 2)
  );
}

// 生成部署信息
function generateDeploymentInfo() {
  const deploymentInfo = {
    name: "重邮AI问答系统",
    version: "1.0.0",
    description: "基于DeepSeek和RAG技术的智能问答系统",
    buildTime: new Date().toISOString(),
    buildEnvironment: "netlify",
    features: [
      "DeepSeek API 集成",
      "混合RAG系统",
      "用户登录认证",
      "智能聊天界面",
      "管理员知识库管理",
      "文件上传处理",
      "响应式设计",
      "PWA支持"
    ],
    requirements: {
      node: ">=18.0.0",
      npm: ">=9.0.0"
    },
    deployment: {
      platform: "Netlify",
      buildCommand: "npm run build",
      publishDirectory: "build",
      nodeVersion: "18"
    },
    apis: {
      deepseek: {
        url: "https://api.deepseek.com",
        required: true,
        description: "DeepSeek AI API for chat completions"
      },
      rag: {
        url: "configurable",
        required: false,
        description: "RAG system for knowledge retrieval"
      }
    },
    configuration: {
      environmentVariables: [
        "REACT_APP_DEEPSEEK_API_KEY",
        "REACT_APP_DEEPSEEK_API_URL",
        "REACT_APP_RAG_API_URL"
      ],
      netlifySettings: {
        buildCommand: "npm run build",
        publishDirectory: "build",
        nodeVersion: "18"
      }
    }
  };
  
  fs.writeFileSync(
    path.join(BUILD_CONFIG.outputDir, 'deployment-info.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  // 创建 README 文件
  const readmeContent = `# 重邮AI问答系统 - Netlify 部署版本

## 🚀 快速部署

1. **Fork 此仓库**到你的 GitHub 账户

2. **连接到 Netlify**
   - 登录 [Netlify](https://netlify.com)
   - 点击 "New site from Git"
   - 选择你的 GitHub 仓库

3. **配置构建设置**
   - Build command: \`npm run build\`
   - Publish directory: \`build\`
   - Node version: \`18\`

4. **设置环境变量**
   在 Netlify 控制台的 Environment Variables 中添加：
   \`\`\`
   REACT_APP_DEEPSEEK_API_KEY=your_deepseek_api_key_here
   REACT_APP_DEEPSEEK_API_URL=https://api.deepseek.com
   \`\`\`

5. **部署**
   - 点击 "Deploy site"
   - 等待构建完成

## 🎯 功能特性

- ✅ **智能聊天**: 基于 DeepSeek API 的对话系统
- ✅ **RAG 检索**: 混合检索增强生成系统
- ✅ **用户认证**: 学生和管理员登录系统
- ✅ **知识管理**: 管理员可管理知识库
- ✅ **文件上传**: 支持文档上传和处理
- ✅ **响应式设计**: 适配各种设备
- ✅ **PWA 支持**: 可安装为应用

## 🔧 配置说明

### 登录账户
- **管理员**: 账号 \`cqupt\`, 密码 \`1950\`
- **学生**: 账号格式 \`2024215XXX\`, 密码为账号后三位

### API 配置
系统会自动处理 API 代理，无需额外配置。

### 知识库
- 支持自定义知识条目
- 支持文档文件上传
- 支持培养方案数据

## 📱 使用指南

1. **访问系统**: 打开部署后的网址
2. **登录**: 使用提供的账户信息登录
3. **开始对话**: 学生用户可直接开始聊天
4. **管理知识库**: 管理员可管理知识库内容

## 🛠️ 技术栈

- **前端**: React 18 + Ant Design + Tailwind CSS
- **AI**: DeepSeek API
- **检索**: 混合 RAG 系统
- **构建**: Create React App + Craco
- **部署**: Netlify

## 📞 支持

如有问题，请查看部署日志或联系技术支持。

---
构建时间: ${new Date().toLocaleString('zh-CN')}
版本: 1.0.0
`;

  fs.writeFileSync(path.join(BUILD_CONFIG.outputDir, 'README.md'), readmeContent);
}

// 执行构建
if (require.main === module) {
  buildForNetlify();
}

module.exports = { buildForNetlify, BUILD_CONFIG };