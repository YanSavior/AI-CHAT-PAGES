#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 准备部署到 Netlify...');

// 检查build文件夹是否存在
const buildPath = path.join(__dirname, 'build');
if (!fs.existsSync(buildPath)) {
  console.error('❌ build文件夹不存在，请先运行 npm run build');
  process.exit(1);
}

// 检查必要的文件
const requiredFiles = [
  'index.html',
  'static/css/main.b923cbfc.css',
  'static/js/main.e0476f61.js',
  'asset-manifest.json'
];

console.log('📋 检查构建文件...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(buildPath, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - 文件缺失`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('❌ 构建文件不完整，请重新运行 npm run build');
  process.exit(1);
}

// 检查netlify.toml配置
const netlifyConfig = path.join(__dirname, 'netlify.toml');
if (fs.existsSync(netlifyConfig)) {
  console.log('✅ netlify.toml 配置文件存在');
} else {
  console.log('⚠️  netlify.toml 配置文件不存在，将使用默认配置');
}

console.log('\n🎉 构建文件检查完成！');
console.log('\n📝 部署步骤：');
console.log('1. 将整个项目文件夹上传到 GitHub');
console.log('2. 在 Netlify 中连接 GitHub 仓库');
console.log('3. 设置构建命令：npm run build');
console.log('4. 设置发布目录：build');
console.log('5. 点击部署！');

console.log('\n🔗 或者使用 Netlify CLI：');
console.log('npm install -g netlify-cli');
console.log('netlify deploy --dir=build --prod');

console.log('\n✨ 部署完成后，您的应用将可以通过 Netlify 提供的域名访问！'); 