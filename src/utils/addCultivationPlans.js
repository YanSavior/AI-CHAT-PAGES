// 培养方案知识库添加工具
// eslint-disable-next-line no-unused-vars
import HybridRAGSystem from './hybridRAGSystem';
// eslint-disable-next-line no-unused-vars
import SimpleFrontendRAG from './simpleFrontendRAG';

// 培养方案文件路径
const CULTIVATION_PLAN_PATHS = [
  '/培养方案/showPyfaPdf.json',
  '/培养方案/showPyfaPdf-1 (1).json',
  '/培养方案/showPyfaPdf-1 (2).json',
  '/培养方案/showPyfaPdf-1 (3).json',
  '/培养方案/showPyfaPdf-1 (4).json',
  '/培养方案/showPyfaPdf-1 (5).json',
  '/培养方案/showPyfaPdf-1 (6).json',
  '/培养方案/showPyfaPdf-1 (7).json',
  '/培养方案/showPyfaPdf-1 (8).json',
  '/培养方案/showPyfaPdf-1 (9).json'
];

/**
 * 加载培养方案文件并添加到知识库
 * @param {HybridRAGSystem|SimpleFrontendRAG} ragSystem - RAG系统实例
 * @returns {Promise<{success: boolean, count: number, error: string|null}>}
 */
export async function addCultivationPlansToKnowledgeBase(ragSystem) {
  console.log('开始添加培养方案到知识库...');
  
  let addedCount = 0;
  let errors = [];

  try {
    // 确保RAG系统已初始化
    if (!ragSystem.isInitialized) {
      await ragSystem.initialize();
    }
    
    // 遍历所有培养方案文件
    for (const path of CULTIVATION_PLAN_PATHS) {
      try {
        console.log(`加载培养方案文件: ${path}`);
        const response = await fetch(path);
        
        if (!response.ok) {
          throw new Error(`文件加载失败: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 处理培养方案数据
        if (Array.isArray(data)) {
          // 每个培养方案可能包含多个文本块
          for (const item of data) {
            if (typeof item === 'string' && item.trim()) {
              // 将培养方案文本添加到知识库
              ragSystem.addDocument(item);
              addedCount++;
            }
          }
        }
        
        console.log(`成功处理培养方案文件: ${path}`);
      } catch (fileError) {
        console.error(`处理文件 ${path} 时出错:`, fileError);
        errors.push(`${path}: ${fileError.message}`);
      }
    }
    
    console.log(`培养方案添加完成，共添加 ${addedCount} 个文档`);
    
    return {
      success: addedCount > 0,
      count: addedCount,
      error: errors.length > 0 ? errors.join('; ') : null
    };
  } catch (error) {
    console.error('添加培养方案失败:', error);
    return {
      success: false,
      count: addedCount,
      error: error.message
    };
  }
} 