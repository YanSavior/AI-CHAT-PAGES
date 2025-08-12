// 专业培养方案加载工具
// 用于加载和管理所有专业的培养方案数据

// 专业名称映射表
const MAJOR_MAP = {
  '微电子科学与工程': 'showPyfaPdf.json',
  '微电子科学与工程英才班': 'showPyfaPdf-1 (1).json',
  '机械设计制造及其自动化': 'showPyfaPdf-1 (2).json',
  '计算机科学与技术': 'showPyfaPdf-1 (3).json',
  '通信工程': 'showPyfaPdf-1 (4).json',
  '电子信息工程': 'showPyfaPdf-1 (5).json',
  '软件工程': 'showPyfaPdf-1 (6).json',
  '人工智能': 'showPyfaPdf-1 (7).json',
  '网络工程': 'showPyfaPdf-1 (8).json',
  '数据科学与大数据技术': 'showPyfaPdf-1 (9).json'
};

// 专业培养方案缓存
let plansCache = {};

/**
 * 加载指定专业的培养方案
 * @param {string} majorName - 专业名称
 * @returns {Promise<string>} - 培养方案文本
 */
export const loadMajorPlan = async (majorName) => {
  try {
    // 如果缓存中已有该专业的培养方案，直接返回
    if (plansCache[majorName]) {
      console.log(`从缓存中获取 ${majorName} 培养方案`);
      return plansCache[majorName];
    }

    // 获取专业对应的文件名
    const fileName = MAJOR_MAP[majorName];
    if (!fileName) {
      console.error(`未找到专业 ${majorName} 的培养方案文件`);
      return '';
    }

    // 尝试从培养方案文件夹加载数据
    const possiblePaths = [
      `/培养方案/${fileName}`,
      `./培养方案/${fileName}`,
      `培养方案/${fileName}`,
      `/public/培养方案/${fileName}`,
      `./public/培养方案/${fileName}`
    ];

    let data = null;
    for (const path of possiblePaths) {
      try {
        console.log(`尝试从路径加载: ${path}`);
        const response = await fetch(path);
        
        if (response.ok) {
          data = await response.json();
          console.log(`成功从 ${path} 加载培养方案`);
          break;
        } else {
          console.log(`路径 ${path} 返回状态: ${response.status}`);
        }
      } catch (pathError) {
        console.log(`路径 ${path} 加载失败:`, pathError.message);
      }
    }

    // 如果成功加载数据
    if (data && Array.isArray(data)) {
      // 将数组中的文本拼接成一个字符串
      const planText = data.join('\n\n');
      // 缓存培养方案
      plansCache[majorName] = planText;
      return planText;
    }
    
    console.error(`未能加载 ${majorName} 的培养方案`);
    return '';
  } catch (error) {
    console.error(`加载培养方案失败:`, error);
    return '';
  }
};

/**
 * 获取所有可用专业名称
 * @returns {string[]} - 专业名称列表
 */
export const getAllMajors = () => {
  return Object.keys(MAJOR_MAP);
};

/**
 * 智能匹配专业名称
 * @param {string} text - 输入文本
 * @returns {string|null} - 匹配到的专业名称，未匹配到则返回null
 */
export const extractMajorFromText = (text) => {
  if (!text) return null;
  
  // 直接匹配完整专业名称
  for (const major of Object.keys(MAJOR_MAP)) {
    if (text.includes(major)) {
      return major;
    }
  }
  
  // 关键词匹配
  const majorKeywords = {
    '微电子科学与工程': ['微电子', '集成电路', '半导体'],
    '微电子科学与工程英才班': ['微电子英才', '集成电路英才'],
    '机械设计制造及其自动化': ['机械', '机电', '自动化'],
    '计算机科学与技术': ['计算机', '计科'],
    '通信工程': ['通信', '通信工程'],
    '电子信息工程': ['电子信息', '电信'],
    '软件工程': ['软件', '软工'],
    '人工智能': ['人工智能', 'AI', '智能'],
    '网络工程': ['网络', '网工'],
    '数据科学与大数据技术': ['数据科学', '大数据']
  };
  
  for (const [major, keywords] of Object.entries(majorKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        return major;
      }
    }
  }
  
  return null;
};

/**
 * 预加载所有专业的培养方案
 * @returns {Promise<void>}
 */
export const preloadAllMajorPlans = async () => {
  const majors = getAllMajors();
  console.log(`开始预加载 ${majors.length} 个专业的培养方案...`);
  
  const promises = majors.map(major => loadMajorPlan(major));
  await Promise.allSettled(promises);
  
  console.log('专业培养方案预加载完成');
};

export default {
  loadMajorPlan,
  getAllMajors,
  extractMajorFromText,
  preloadAllMajorPlans
}; 