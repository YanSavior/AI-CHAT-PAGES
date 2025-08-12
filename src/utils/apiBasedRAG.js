// 基于API的前端RAG系统实现
// 使用第三方Embedding API服务

class ApiBasedRAG {
  constructor() {
    this.knowledgeBase = [];
    this.embeddings = [];
    this.isInitialized = false;
    this.apiKey = null; // 可以配置API密钥
  }

  async initialize() {
    try {
      console.log('初始化API前端RAG系统...');
      
      // 加载知识库数据
      await this.loadKnowledgeBase();
      
      this.isInitialized = true;
      console.log('API前端RAG系统初始化完成');
    } catch (error) {
      console.error('API前端RAG系统初始化失败:', error);
    }
  }

  async getEmbedding(text) {
    try {
      // 使用免费的Embedding API
      // 这里可以使用HuggingFace Inference API或其他免费服务
      const response = await fetch('https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey || 'hf_xxx'}` // 需要配置API密钥
        },
        body: JSON.stringify({ inputs: text })
      });
      
      if (!response.ok) {
        throw new Error('Embedding API请求失败');
      }
      
      const result = await response.json();
      return result[0]; // 返回嵌入向量
    } catch (error) {
      console.error('获取Embedding失败:', error);
      // 降级到简单特征提取
      return this.simpleFeatureExtraction(text);
    }
  }

  simpleFeatureExtraction(text) {
    // 简单的文本特征提取作为降级方案
    const words = text.toLowerCase().split(/\s+/);
    const features = new Array(128).fill(0);
    
    words.forEach(word => {
      const hash = this.simpleHash(word);
      features[hash % 128] += 1;
    });
    
    const norm = Math.sqrt(features.reduce((sum, val) => sum + val * val, 0));
    return features.map(val => val / norm);
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  async loadKnowledgeBase() {
    try {
      const response = await fetch('/data/knowledge_base.json');
      const data = await response.json();
      
      this.knowledgeBase = data.documents || [];
      
      // 预计算嵌入向量
      await this.computeEmbeddings();
      
      console.log(`加载了 ${this.knowledgeBase.length} 个文档`);
    } catch (error) {
      console.error('加载知识库失败:', error);
      this.knowledgeBase = [
        "计算机科学专业主要学习编程、算法、数据结构等课程",
        "软件工程专业注重软件开发和项目管理",
        "人工智能专业学习机器学习、深度学习等前沿技术"
      ];
      await this.computeEmbeddings();
    }
  }

  async computeEmbeddings() {
    console.log('计算文档嵌入向量...');
    this.embeddings = [];
    
    for (const doc of this.knowledgeBase) {
      const embedding = await this.getEmbedding(doc);
      this.embeddings.push(Array.from(embedding));
    }
    
    console.log('嵌入向量计算完成');
  }

  async query(question, topK = 3) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // 计算问题的嵌入向量
      const questionEmbedding = await this.getEmbedding(question);
      const questionVector = Array.from(questionEmbedding);

      // 计算相似度
      const similarities = this.embeddings.map((embedding, index) => ({
        index,
        similarity: this.cosineSimilarity(questionVector, embedding),
        document: this.knowledgeBase[index]
      }));

      // 排序并返回topK结果
      similarities.sort((a, b) => b.similarity - a.similarity);
      const topResults = similarities.slice(0, topK);

      return {
        question,
        relevant_docs: topResults.map(r => r.document),
        scores: topResults.map(r => r.similarity)
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

  cosineSimilarity(vecA, vecB) {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (normA * normB);
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      documentCount: this.knowledgeBase.length,
      hasDocuments: this.knowledgeBase.length > 0
    };
  }
}

export default ApiBasedRAG; 