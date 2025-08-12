/**
 * 混合RAG系统
 * 结合本地RAG和DeepSeek API，无需依赖内网穿透
 */

import axios from 'axios';

class HybridRAG {
  constructor() {
    this.knowledgeBase = [];
    this.isInitialized = false;
    this.api = axios.create({
      baseURL: 'https://api.deepseek.com',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-7f5214ed15764dfea0b45c84c6d0c961'
      }
    });
  }

  async initialize() {
    try {
      console.log('初始化混合RAG系统...');
      
      // 加载本地知识库
      await this.loadLocalKnowledgeBase();
      
      this.isInitialized = true;
      console.log('混合RAG系统初始化完成');
      return true;
    } catch (error) {
      console.error('混合RAG系统初始化失败:', error);
      return false;
    }
  }

  async loadLocalKnowledgeBase() {
    try {
      console.log('加载本地知识库...');
      
      // 尝试从本地文件加载
      const possiblePaths = [
        '/data/knowledge_base.json',
        './data/knowledge_base.json',
        'data/knowledge_base.json',
        '/knowledge_base.json'
      ];

      let data = null;

      for (const path of possiblePaths) {
        try {
          console.log(`尝试从路径加载: ${path}`);
          const response = await fetch(path);
          
          if (response.ok) {
            data = await response.json();
            console.log(`成功从 ${path} 加载知识库`);
            break;
          }
        } catch (pathError) {
          console.log(`路径 ${path} 加载失败:`, pathError.message);
        }
      }

      if (data && data.documents) {
        this.knowledgeBase = data.documents;
        console.log(`成功加载了 ${this.knowledgeBase.length} 个文档`);
      } else {
        console.log('使用默认知识库');
        this.useDefaultKnowledgeBase();
      }
      
    } catch (error) {
      console.error('加载知识库失败:', error);
      this.useDefaultKnowledgeBase();
    }
  }

  useDefaultKnowledgeBase() {
    console.log('使用默认知识库');
    // 这里可以添加更多专业相关的知识
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
      "微电子科学与工程专业主要学习集成电路设计、半导体器件等",
      "机械设计制造及其自动化专业学习机械设计、制造工艺等",
      "电子信息工程专业学习电子电路、信号处理等",
      "通信工程专业学习通信原理、网络技术等",
      "自动化专业学习控制理论、自动控制系统等",
      "计算机科学与技术专业课程包括数据结构、操作系统、计算机网络、数据库系统等",
      "软件工程专业课程包括软件工程、需求分析、软件测试、项目管理等",
      "人工智能专业课程包括机器学习、深度学习、自然语言处理、计算机视觉等",
      "数据科学专业课程包括统计学、数据挖掘、大数据处理、数据可视化等",
      "网络工程专业课程包括计算机网络、网络安全、网络编程、路由交换技术等",
      "信息安全专业课程包括密码学、网络安全、安全协议、渗透测试等",
      "数字媒体技术专业课程包括计算机图形学、多媒体技术、交互设计、数字内容创作等",
      "物联网工程专业课程包括嵌入式系统、传感器技术、无线通信、物联网应用等",
      "云计算专业课程包括分布式系统、虚拟化技术、云平台架构、容器技术等",
      "大数据专业课程包括分布式计算、数据仓库、Hadoop生态系统、数据治理等"
    ];
    console.log(`默认知识库加载完成，包含 ${this.knowledgeBase.length} 个文档`);
  }

  // 简单的关键词匹配算法
  extractKeywords(text) {
    const keywords = [
      '计算机', '软件', '人工智能', '数据', '网络', '安全', '数字媒体', '物联网', '云计算', '大数据',
      '微电子', '机械', '电子', '通信', '自动化', '集成电路', '半导体', '机电',
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

  // 本地RAG查询
  async localQuery(question, topK = 3) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log(`本地RAG查询: ${question}`);
      
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
      console.error('本地查询失败:', error);
      return {
        question,
        relevant_docs: [],
        scores: []
      };
    }
  }

  // DeepSeek API查询
  async deepSeekQuery(question, context, systemPrompt, chatHistory = []) {
    try {
      console.log('调用DeepSeek API...');
      
      const response = await this.api.post('/v1/chat/completions', {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `${systemPrompt}\n\n${context}`
          },
          ...chatHistory,
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
        top_p: 0.9,
        frequency_penalty: 0.3,
        presence_penalty: 0.3
      });

      if (response.data && response.data.choices && response.data.choices[0]) {
        return {
          text: response.data.choices[0].message.content,
          success: true
        };
      } else {
        throw new Error('无效的API响应格式');
      }
    } catch (error) {
      console.error('DeepSeek API查询失败:', error);
      return {
        text: "抱歉，AI服务暂时不可用，请稍后再试。",
        success: false,
        error: error.message
      };
    }
  }

  // 混合查询（结合本地RAG和DeepSeek）
  async hybridQuery(question, systemPrompt, chatHistory = [], additionalContext = '') {
    try {
      // 1. 先进行本地RAG查询
      const ragResult = await this.localQuery(question, 5);
      
      // 2. 构建上下文
      let context = additionalContext || '';
      
      if (ragResult.relevant_docs && ragResult.relevant_docs.length > 0) {
        context += `\n\n相关专业知识库信息：\n${ragResult.relevant_docs.join('\n\n')}`;
      }
      
      // 3. 调用DeepSeek API
      const aiResponse = await this.deepSeekQuery(question, context, systemPrompt, chatHistory);
      
      return {
        answer: aiResponse.text,
        success: aiResponse.success,
        relevant_docs: ragResult.relevant_docs,
        error: aiResponse.error
      };
    } catch (error) {
      console.error('混合查询失败:', error);
      return {
        answer: "抱歉，查询过程中发生错误，请稍后再试。",
        success: false,
        relevant_docs: [],
        error: error.message
      };
    }
  }

  // 获取系统状态
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      documentCount: this.knowledgeBase.length,
      hasDocuments: this.knowledgeBase.length > 0
    };
  }
}

export default HybridRAG; 