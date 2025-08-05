// 简化版前端RAG系统实现
// 使用关键词匹配，无需复杂的机器学习库

class SimpleFrontendRAG {
  constructor() {
    this.knowledgeBase = [];
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log('初始化简化版前端RAG系统...');
      
      // 加载知识库数据
      await this.loadKnowledgeBase();
      
      this.isInitialized = true;
      console.log('简化版前端RAG系统初始化完成');
    } catch (error) {
      console.error('简化版前端RAG系统初始化失败:', error);
    }
  }

  async loadKnowledgeBase() {
    try {
      // 加载本地知识库数据
      const response = await fetch('/data/knowledge_base.json');
      const data = await response.json();
      
      this.knowledgeBase = data.documents || [];
      
      console.log(`加载了 ${this.knowledgeBase.length} 个文档`);
    } catch (error) {
      console.error('加载知识库失败:', error);
      // 使用默认知识库
      this.knowledgeBase = [
        "计算机科学专业主要学习编程、算法、数据结构等课程",
        "软件工程专业注重软件开发和项目管理",
        "人工智能专业学习机器学习、深度学习等前沿技术",
        "数据科学专业结合统计学、编程和领域知识",
        "网络工程专业主要学习网络协议、网络安全等技术",
        "信息安全专业培养网络安全、密码学等方面的人才",
        "数字媒体技术专业结合艺术设计和计算机技术",
        "物联网工程专业学习传感器技术、嵌入式系统等",
        "云计算专业学习虚拟化技术、分布式系统等",
        "大数据专业专注于海量数据处理、分布式计算等",
        "大学一年级通常需要学习高等数学、线性代数等公共课程",
        "大学二年级开始学习专业核心课程，如数据结构、算法分析",
        "大学三年级深入学习专业方向课程，如软件工程、数据库系统",
        "大学四年级主要进行毕业设计、实习和就业准备",
        "计算机专业就业方向包括软件开发、系统架构、数据分析等",
        "软件工程师需要掌握多种编程语言，如Java、Python、C++等",
        "前端开发主要使用HTML、CSS、JavaScript等技术栈",
        "后端开发需要掌握服务器端编程、数据库设计、API开发等技能",
        "移动开发包括Android开发和iOS开发",
        "全栈开发需要同时掌握前端和后端技术",
        "数据库管理包括关系型数据库和NoSQL数据库",
        "云计算平台包括AWS、Azure、阿里云、腾讯云等",
        "DevOps工程师需要掌握自动化部署、容器化技术等",
        "网络安全工程师需要了解网络协议、加密算法等",
        "数据科学家需要掌握Python、R、SQL等工具",
        "人工智能工程师需要深度学习框架和算法优化能力",
        "产品经理需要了解技术实现，同时具备用户需求分析能力",
        "技术管理岗位需要技术背景和团队管理能力",
        "创业需要技术能力、商业思维和团队协作能力",
        "研究生阶段可以选择学术研究或专业硕士",
        "博士阶段主要进行学术研究，发表论文",
        "实习是了解行业和积累经验的重要途径",
        "参加技术竞赛可以提升算法能力和团队协作能力",
        "开源项目贡献可以提升技术能力，建立技术影响力",
        "技术博客写作可以总结学习经验，建立个人品牌",
        "技术会议和Meetup是了解行业动态和扩展人脉的好机会",
        "持续学习是IT行业的基本要求，需要关注新技术和行业趋势",
        "英语能力对技术学习和国际交流很重要",
        "团队协作能力在软件开发中非常重要",
        "时间管理能力对平衡学习和工作很重要",
        "健康管理很重要，长时间编程需要注意颈椎和眼睛健康",
        "心理调节能力对应对工作压力很重要",
        "职业规划需要结合个人兴趣和市场需求"
      ];
    }
  }

  // 简单的关键词匹配算法
  extractKeywords(text) {
    const keywords = [
      '计算机', '软件', '人工智能', '数据', '网络', '安全', '数字媒体', '物联网', '云计算', '大数据',
      '编程', '算法', '数据结构', '操作系统', '数据库', '机器学习', '深度学习', '前端', '后端', '移动开发',
      'Java', 'Python', 'C++', 'JavaScript', 'HTML', 'CSS', 'MySQL', 'MongoDB', 'Redis',
      'AWS', 'Azure', '阿里云', '腾讯云', 'Docker', 'Kubernetes', 'DevOps',
      '大学', '一年级', '二年级', '三年级', '四年级', '课程', '学习', '专业',
      '就业', '工作', '实习', '创业', '研究生', '博士', '竞赛', '开源', '博客',
      '英语', '团队', '时间管理', '健康', '心理', '职业规划'
    ];
    
    const foundKeywords = keywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return foundKeywords;
  }

  // 计算文本相似度（基于关键词匹配）
  calculateSimilarity(query, document) {
    const queryKeywords = this.extractKeywords(query);
    const documentKeywords = this.extractKeywords(document);
    
    if (queryKeywords.length === 0) return 0;
    
    const commonKeywords = queryKeywords.filter(keyword => 
      documentKeywords.includes(keyword)
    );
    
    return commonKeywords.length / queryKeywords.length;
  }

  async query(question, topK = 3) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // 计算每个文档的相似度
      const similarities = this.knowledgeBase.map((document, index) => ({
        index,
        similarity: this.calculateSimilarity(question, document),
        document: document
      }));

      // 过滤掉相似度为0的结果，并排序
      const relevantResults = similarities
        .filter(result => result.similarity > 0)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

      return {
        question,
        relevant_docs: relevantResults.map(r => r.document),
        scores: relevantResults.map(r => r.similarity)
      };
    } catch (error) {
      console.error('查询失败:', error);
      return {
        question,
        relevant_docs: [],
        scores: []
      };
    }
  }

  // 添加新文档到知识库
  addDocument(document) {
    this.knowledgeBase.push(document);
  }
}

export default SimpleFrontendRAG; 