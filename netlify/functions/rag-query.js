exports.handler = async (event, context) => {
  // 处理CORS
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
        message: 'RAG API服务正常运行'
      })
    };
  }

  if (event.httpMethod === 'POST') {
    try {
      const { question } = JSON.parse(event.body);
      
      // 简单的知识库
      const knowledgeBase = [
        "重庆邮电大学是一所以信息科技为特色的高校，在通信工程领域具有较高声誉",
        "重庆邮电大学软件工程专业是国家级一流专业建设点",
        "机械工程专业毕业生主要就业方向包括制造业、汽车行业、航空航天等",
        "三一重工是中国工程机械行业的龙头企业，提供良好的职业发展机会",
        "计算机专业学生建议掌握编程语言、数据结构、算法等核心技能",
        "心理调节能力对应对工作压力很重要，建议培养兴趣爱好"
      ];
      
      // 简单的关键词匹配
      const questionLower = question.toLowerCase();
      const relevantDocs = [];
      const scores = [];
      
      for (const doc of knowledgeBase) {
        let score = 0;
        const words = questionLower.split(' ');
        for (const word of words) {
          if (doc.toLowerCase().includes(word)) {
            score += 1;
          }
        }
        
        if (score > 0) {
          relevantDocs.push(doc);
          scores.push(score / words.length);
        }
      }
      
      // 排序并取前3个
      const paired = relevantDocs.map((doc, i) => ({ doc, score: scores[i] }));
      paired.sort((a, b) => b.score - a.score);
      
      const finalDocs = paired.slice(0, 3).map(p => p.doc);
      const finalScores = paired.slice(0, 3).map(p => p.score);
      
      if (finalDocs.length === 0) {
        finalDocs.push("抱歉，没有找到相关信息");
        finalScores.push(0.0);
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          question,
          answer: `基于知识库检索到 ${finalDocs.length} 条相关信息`,
          relevant_docs: finalDocs,
          scores: finalScores
        })
      };
      
    } catch (error) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: `查询失败: ${error.message}` })
      };
    }
  }

  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};