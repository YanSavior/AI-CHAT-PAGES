// 前端RAG系统实现
import { pipeline } from '@xenova/transformers';

class FrontendRAG {
  constructor() {
    this.embedder = null;
    this.knowledgeBase = [];
    this.embeddings = [];
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log('初始化前端RAG系统...');
      
      // 加载嵌入模型
      this.embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      
      // 加载知识库数据
      await this.loadKnowledgeBase();
      
      this.isInitialized = true;
      console.log('前端RAG系统初始化完成');
    } catch (error) {
      console.error('前端RAG系统初始化失败:', error);
    }
  }

  async loadKnowledgeBase() {
    try {
      // 加载本地知识库数据
      const response = await fetch('/data/knowledge_base.json');
      const data = await response.json();
      
      this.knowledgeBase = data.documents || [];
      
      // 预计算嵌入向量
      await this.computeEmbeddings();
      
      console.log(`加载了 ${this.knowledgeBase.length} 个文档`);
    } catch (error) {
      console.error('加载知识库失败:', error);
      // 使用默认知识库
      this.knowledgeBase = [
        "计算机科学专业主要学习编程、算法、数据结构等课程",
        "软件工程专业注重软件开发和项目管理",
        "人工智能专业学习机器学习、深度学习等前沿技术"
      ];
      await this.computeEmbeddings();
    }
  }

  async computeEmbeddings() {
    if (!this.embedder) return;
    
    console.log('计算文档嵌入向量...');
    this.embeddings = [];
    
    for (const doc of this.knowledgeBase) {
      const embedding = await this.embedder(doc, { pooling: 'mean', normalize: true });
      this.embeddings.push(Array.from(embedding.data));
    }
    
    console.log('嵌入向量计算完成');
  }

  async query(question, topK = 3) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // 计算问题的嵌入向量
      const questionEmbedding = await this.embedder(question, { pooling: 'mean', normalize: true });
      const questionVector = Array.from(questionEmbedding.data);

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

  // 添加新文档到知识库
  async addDocument(document) {
    this.knowledgeBase.push(document);
    const embedding = await this.embedder(document, { pooling: 'mean', normalize: true });
    this.embeddings.push(Array.from(embedding.data));
  }
}

export default FrontendRAG; 