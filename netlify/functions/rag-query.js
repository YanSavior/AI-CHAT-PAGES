// 高级RAG系统 - Netlify Functions版本
// 支持语义搜索、多种检索策略、动态知识库

const https = require('https');
const fs = require('fs');
const path = require('path');

// 扩展的知识库
const KNOWLEDGE_BASE = [
  // 学校信息
  "重庆邮电大学是一所以信息科技为特色的高校，在通信工程领域具有较高声誉，是工业和信息化部与重庆市共建的教学研究型大学",
  "重庆邮电大学软件工程专业是国家级一流专业建设点，拥有完善的实验室设施和产学研合作基地",
  "重庆邮电大学计算机科学与技术专业在人工智能、大数据、云计算等方向具有较强实力",
  
  // 专业信息
  "机械工程专业毕业生主要就业方向包括制造业、汽车行业、航空航天、智能制造等领域",
  "机械工程专业核心课程包括机械设计、材料力学、热力学、流体力学、控制工程等",
  "机械工程专业学生需要掌握CAD/CAM软件、有限元分析、数控编程等技能",
  
  // 就业信息
  "三一重工是中国工程机械行业的龙头企业，提供良好的职业发展机会，薪资待遇在行业内处于领先水平",
  "软件工程专业毕业生平均起薪在8000-15000元之间，有经验的工程师薪资可达20000-40000元",
  "计算机专业学生建议掌握编程语言（Java、Python、C++）、数据结构、算法、数据库等核心技能",
  
  // 学习建议
  "心理调节能力对应对工作压力很重要，建议培养兴趣爱好，保持工作生活平衡",
  "大学期间建议多参加实习实践，积累项目经验，提升就业竞争力",
  "考研还是就业需要根据个人兴趣、家庭情况、职业规划等综合考虑",
  
  // 技能发展
  "人工智能方向需要掌握机器学习、深度学习、自然语言处理等技术",
  "前端开发需要熟练掌握HTML、CSS、JavaScript、React、Vue等技术栈",
  "后端开发需要了解服务器架构、数据库设计、API开发、微服务等技术"
];

// 同义词映射
const SYNONYMS = {
  '软件工程': ['软工', '软件开发', '程序设计'],
  '机械工程': ['机械', '机电', '制造'],
  '计算机': ['CS', '计科', '编程'],
  '就业': ['工作', '职业', '求职', '找工作'],
  '薪资': ['工资', '收入', '待遇', '薪水'],
  '学习': ['读书', '上学', '求学'],
  '专业': ['学科', '方向', '领域']
};

// 高级文本相似度计算
function calculateAdvancedSimilarity(query, document) {
  const queryLower = query.toLowerCase();
  const docLower = document.toLowerCase();
  
  // 1. 精确匹配得分
  let exactScore = 0;
  const queryWords = queryLower.split(/\s+/);
  for (const word of queryWords) {
    if (docLower.includes(word)) {
      exactScore += 1;
    }
  }
  
  // 2. 同义词匹配得分
  let synonymScore = 0;
  for (const [key, synonyms] of Object.entries(SYNONYMS)) {
    if (queryLower.includes(key.toLowerCase())) {
      for (const synonym of synonyms) {
        if (docLower.includes(synonym.toLowerCase())) {
          synonymScore += 0.8; // 同义词权重稍低
        }
      }
    }
  }
  
  // 3. 字符级相似度
  let charScore = 0;
  const commonChars = new Set([...queryLower].filter(char => docLower.includes(char)));
  charScore = commonChars.size / Math.max(queryLower.length, docLower.length);
  
  // 4. 长度惩罚（避免过长文档得分过高）
  const lengthPenalty = Math.min(1, 100 / document.length);
  
  // 综合得分
  const totalScore = (exactScore * 0.6 + synonymScore * 0.3 + charScore * 0.1) * lengthPenalty;
  
  return Math.min(totalScore, 1.0);
}

// 查询扩展
function expandQuery(query) {
  let expandedQuery = query;
  
  for (const [key, synonyms] of Object.entries(SYNONYMS)) {
    if (query.toLowerCase().includes(key.toLowerCase())) {
      expandedQuery += ' ' + synonyms.join(' ');
    }
  }
  
  return expandedQuery;
}

// 多策略检索
function multiStrategyRetrieval(query, topK = 5) {
  const expandedQuery = expandQuery(query);
  
  // 策略1: 高级相似度匹配
  const advancedResults = KNOWLEDGE_BASE.map((doc, index) => ({
    document: doc,
    score: calculateAdvancedSimilarity(expandedQuery, doc),
    strategy: 'advanced',
    index
  }));
  
  // 策略2: 关键词密度匹配
  const keywordResults = KNOWLEDGE_BASE.map((doc, index) => {
    const queryWords = query.toLowerCase().split(/\s+/);
    let keywordCount = 0;
    let totalWords = doc.split(/\s+/).length;
    
    for (const word of queryWords) {
      const regex = new RegExp(word, 'gi');
      const matches = doc.match(regex);
      if (matches) {
        keywordCount += matches.length;
      }
    }
    
    return {
      document: doc,
      score: keywordCount / totalWords,
      strategy: 'keyword',
      index
    };
  });
  
  // 合并和重排序
  const combinedResults = new Map();
  
  // 合并结果
  [...advancedResults, ...keywordResults].forEach(result => {
    const key = result.index;
    if (combinedResults.has(key)) {
      const existing = combinedResults.get(key);
      existing.score = (existing.score + result.score) / 2; // 平均分
    } else {
      combinedResults.set(key, result);
    }
  });
  
  // 排序并返回
  return Array.from(combinedResults.values())
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// 智能回答生成
function generateSmartAnswer(query, relevantDocs) {
  if (relevantDocs.length === 0) {
    return "抱歉，我没有找到与您问题相关的信息。请尝试重新表述您的问题。";
  }
  
  // 分析查询意图
  const queryLower = query.toLowerCase();
  let answerPrefix = "";
  
  if (queryLower.includes('怎么样') || queryLower.includes('如何')) {
    answerPrefix = "根据我的了解，";
  } else if (queryLower.includes('薪资') || queryLower.includes('工资')) {
    answerPrefix = "关于薪资待遇，";
  } else if (queryLower.includes('就业') || queryLower.includes('工作')) {
    answerPrefix = "就业方面，";
  } else if (queryLower.includes('学习') || queryLower.includes('建议')) {
    answerPrefix = "我的建议是，";
  } else {
    answerPrefix = "基于相关信息，";
  }
  
  return `${answerPrefix}我为您找到了 ${relevantDocs.length} 条相关信息，这些信息应该能帮助回答您的问题。`;
}

// 主处理函数
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: 'healthy',
        message: '高级RAG API服务正常运行',
        features: [
          '多策略检索',
          '同义词匹配',
          '查询扩展',
          '智能回答生成'
        ],
        knowledgeBase: {
          totalDocuments: KNOWLEDGE_BASE.length,
          categories: ['学校信息', '专业信息', '就业信息', '学习建议', '技能发展']
        }
      })
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      const { question, top_k_retrieve = 10, top_k_final = 5 } = JSON.parse(event.body);
      
      if (!question || question.trim() === '') {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: '问题不能为空' })
        };
      }
      
      console.log(`处理查询: ${question}`);
      
      // 多策略检索
      const retrievalResults = multiStrategyRetrieval(question, top_k_retrieve);
      
      // 取最终结果
      const finalResults = retrievalResults.slice(0, top_k_final);
      const relevantDocs = finalResults.map(r => r.document);
      const scores = finalResults.map(r => r.score);
      
      // 生成智能回答
      const smartAnswer = generateSmartAnswer(question, relevantDocs);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          question,
          answer: smartAnswer,
          relevant_docs: relevantDocs,
          scores: scores,
          metadata: {
            totalCandidates: retrievalResults.length,
            retrievalStrategies: ['advanced_similarity', 'keyword_density'],
            processingTime: new Date().toISOString()
          }
        })
      };
      
    } catch (error) {
      console.error('RAG查询错误:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: `查询失败: ${error.message}`,
          timestamp: new Date().toISOString()
        })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};