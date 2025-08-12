/**
 * 培养方案文件移动脚本
 * 将培养方案文件从源目录复制到public目录，以便前端可以访问
 */

const fs = require('fs');
const path = require('path');

// 源目录和目标目录
const sourceDir = path.resolve(__dirname, '../培养方案');
const chineseTargetDir = path.resolve(__dirname, '../public/培养方案');
const englishTargetDir = path.resolve(__dirname, '../public/data/training-plans');

// 确保目标目录存在
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`创建目录: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
}

// 复制文件并重命名（移除空格和括号）
function copyFileWithRename(source, targetDir, originalName) {
  try {
    // 生成新的文件名，移除空格和括号
    const newName = originalName.replace(/ \(/g, '-').replace(/\)/g, '');
    const targetPath = path.join(targetDir, newName);
    
    const data = fs.readFileSync(source);
    fs.writeFileSync(targetPath, data);
    console.log(`成功复制文件: ${originalName} -> ${targetPath}`);
    return true;
  } catch (error) {
    console.error(`复制文件失败 ${source}: ${error.message}`);
    return false;
  }
}

// 主函数
function moveCultivationPlans() {
  console.log('开始移动培养方案文件...');
  
  // 确保目标目录存在
  ensureDirectoryExists(chineseTargetDir);
  ensureDirectoryExists(englishTargetDir);
  
  try {
    // 读取源目录中的所有文件
    const files = fs.readdirSync(sourceDir);
    
    // 过滤出JSON文件
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      console.log('没有找到培养方案JSON文件');
      return;
    }
    
    console.log(`找到 ${jsonFiles.length} 个培养方案文件`);
    
    // 复制每个文件到两个目标位置
    let successCount = 0;
    for (const file of jsonFiles) {
      const sourcePath = path.join(sourceDir, file);
      const chineseTargetPath = path.join(chineseTargetDir, file);
      const englishTargetPath = path.join(englishTargetDir, file);
      
      let fileSuccessCount = 0;
      
      // 复制到中文路径
      if (copyFileWithRename(sourcePath, chineseTargetDir, file)) {
        fileSuccessCount++;
      }
      
      // 复制到英文路径
      if (copyFileWithRename(sourcePath, englishTargetDir, file)) {
        fileSuccessCount++;
      }
      
      if (fileSuccessCount > 0) {
        successCount++;
      }
    }
    
    console.log(`完成! 成功处理 ${successCount}/${jsonFiles.length} 个文件`);
    console.log(`中文路径: ${chineseTargetDir}`);
    console.log(`英文路径: ${englishTargetDir}`);
  } catch (error) {
    console.error(`移动培养方案文件失败: ${error.message}`);
  }
}

// 执行
moveCultivationPlans(); 