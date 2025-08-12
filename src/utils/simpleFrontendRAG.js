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
      console.log('尝试加载知识库数据...');
      
      // 主知识库文件路径
      const mainKnowledgeBasePaths = [
        `${window.location.origin}/data/knowledge_base.json`,
        '/data/knowledge_base.json'
      ];

      // 额外知识库文件路径
      const additionalKnowledgeBasePaths = [
        `${window.location.origin}/data/cqupt_knowledge.json`,
        '/data/cqupt_knowledge.json'
      ];

      // 初始化知识库
      this.knowledgeBase = [];
      
      // 加载主知识库
      for (const path of mainKnowledgeBasePaths) {
        try {
          console.log(`尝试从路径加载主知识库: ${path}`);
          const response = await fetch(path);
          console.log(`主知识库加载响应状态: ${response.status}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log('主知识库数据:', data);
            if (data && Array.isArray(data.documents)) {
              this.knowledgeBase = [...this.knowledgeBase, ...data.documents];
              console.log(`成功从 ${path} 加载主知识库，包含 ${data.documents.length} 个文档`);
              // mainDataLoaded = true; // 移除未使用的变量
              break;
            } else {
              console.log('主知识库数据格式无效');
            }
          } else {
            console.log(`路径 ${path} 返回状态: ${response.status}`);
          }
        } catch (pathError) {
          console.log(`路径 ${path} 加载失败:`, pathError.message);
        }
      }

      // 尝试加载额外知识库
      for (const path of additionalKnowledgeBasePaths) {
        try {
          console.log(`尝试从路径加载额外知识库: ${path}`);
          const response = await fetch(path);
          console.log(`额外知识库加载响应状态: ${response.status}`);
          
          if (response.ok) {
            const data = await response.json();
            console.log('额外知识库数据:', data);
            if (data && Array.isArray(data.documents)) {
              this.knowledgeBase = [...this.knowledgeBase, ...data.documents];
              console.log(`成功从 ${path} 加载额外知识库，包含 ${data.documents.length} 个文档`);
            } else {
              console.log('额外知识库数据格式无效');
            }
          }
        } catch (pathError) {
          console.log(`额外知识库路径 ${path} 加载失败:`, pathError.message);
        }
      }

      // 如果没有加载到任何知识库，使用默认知识库
      if (this.knowledgeBase.length === 0) {
        console.log('所有路径都失败，使用默认知识库');
        this.useDefaultKnowledgeBase();
      } else {
        console.log(`成功加载了总计 ${this.knowledgeBase.length} 个文档`);
        console.log('当前知识库内容:', this.knowledgeBase);
      }
      
    } catch (error) {
      console.error('加载知识库失败:', error);
      this.useDefaultKnowledgeBase();
    }
  }

  useDefaultKnowledgeBase() {
    console.log('使用默认知识库');
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
    console.log(`默认知识库加载完成，包含 ${this.knowledgeBase.length} 个文档`);
  }

  // 改进的文本相似度计算（基于内容而非关键词列表）
  calculateSimilarity(query, document) {
    // 转换为小写进行比较
    const queryLower = query.toLowerCase().trim();
    const documentLower = document.toLowerCase().trim();
    
    // 策略1：直接完全匹配或包含匹配（最高权重）
    if (queryLower === documentLower) {
      return 1.0;
    }
    
    if (documentLower.includes(queryLower) || queryLower.includes(documentLower)) {
      return 0.9;
    }
    
    // 策略2：智能分词和部分匹配
    const queryTokens = this.tokenizeText(query);
    const documentTokens = this.tokenizeText(document);
    
    if (queryTokens.length === 0) return 0;
    
    // 计算词汇重叠度
    let exactMatches = 0;
    let partialMatches = 0;
    
    for (const queryToken of queryTokens) {
      // 完全匹配
      if (documentTokens.includes(queryToken)) {
        exactMatches++;
        continue;
      }
      
      // 部分匹配
      for (const docToken of documentTokens) {
        if (queryToken.length >= 2 && docToken.length >= 2) {
          if (queryToken.includes(docToken) || docToken.includes(queryToken)) {
            partialMatches += 0.5;
            break;
          }
        }
      }
    }
    
    // 策略3：字符级相似度（用于捕获拼写变化）
    const charSimilarity = this.calculateCharSimilarity(queryLower, documentLower);
    
    // 综合计算相似度
    const exactScore = exactMatches / queryTokens.length;
    const partialScore = partialMatches / queryTokens.length;
    const charScore = charSimilarity * 0.3; // 降低字符匹配的权重
    
    const finalScore = exactScore * 0.6 + partialScore * 0.3 + charScore;
    
    return Math.min(finalScore, 1.0);
  }

  // 改进的文本分词（中文友好）
  tokenizeText(text) {
    if (!text) return [];
    
    // 基本清理和分割
    const cleaned = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s]/g, ' ');
    
    // 按空格分割
    const spaceTokens = cleaned.split(/\s+/).filter(token => token.length > 0);
    
    // 中文n-gram分词（2-3字符组合）
    const ngramTokens = [];
    for (const token of spaceTokens) {
      if (token.length >= 2) {
        // 添加完整词
        ngramTokens.push(token);
        
        // 为长词添加子串
        if (token.length >= 3) {
          for (let i = 0; i <= token.length - 2; i++) {
            ngramTokens.push(token.substring(i, i + 2));
            if (i <= token.length - 3) {
              ngramTokens.push(token.substring(i, i + 3));
            }
          }
        }
      }
    }
    
    return [...new Set(ngramTokens)]; // 去重
  }

  // 字符级相似度计算
  calculateCharSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0 || len2 === 0) return 0;
    
    // 计算公共字符数
    let commonChars = 0;
    const chars1 = str1.split('');
    const chars2 = str2.split('');
    
    for (const char of chars1) {
      const index = chars2.indexOf(char);
      if (index !== -1) {
        commonChars++;
        chars2.splice(index, 1); // 避免重复计算
      }
    }
    
    return commonChars / Math.max(len1, len2);
  }

  // 移除原来基于固定关键词列表的方法
  extractKeywords(text) {
    // 简化版：直接返回文本的所有token
    return this.tokenizeText(text);
  }

  async query(question, topK = 3) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`查询问题: ${question}`);
      console.log(`知识库文档数量: ${this.knowledgeBase.length}`);
      
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

      console.log(`找到 ${relevantResults.length} 个相关文档`);
      
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

  // 获取知识库状态
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      documentCount: this.knowledgeBase.length,
      hasDocuments: this.knowledgeBase.length > 0
    };
  }
}

export default SimpleFrontendRAG; 