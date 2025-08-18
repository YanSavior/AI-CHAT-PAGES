// 混合语义RAG系统 - 免费版
class HybridSemanticRAG {
  constructor() {
    this.localRAG = null; // 你现有的前端RAG
    this.huggingFaceToken = null; // 免费的Hugging Face token
  }

  async initialize() {
    // 初始化本地RAG
    this.localRAG = new SimpleFrontendRAG();
    await this.localRAG.initialize();
    
    // 获取免费的Hugging Face token
    // 注册 https://huggingface.co/ 获取免费API token
  }

  async semanticSearch(query, topK = 3) {
    try {
      // 调用Hugging Face免费语义搜索API
      const response = await fetch('https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2', {
        headers: {
          'Authorization': `Bearer ${this.huggingFaceToken}`,
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: {
            source_sentence: query,
            sentences: this.localRAG.knowledgeBase.slice(0, 100) // 限制数量避免超限
          }
        })
      });

      const similarities = await response.json();
      
      // 结合语义相似度和本地匹配
      const results = this.localRAG.knowledgeBase
        .map((doc, index) => ({
          document: doc,
          semanticScore: similarities[index] || 0,
          localScore: this.localRAG.calculateSimilarity(query, doc)
        }))
        .sort((a, b) => (b.semanticScore * 0.7 + b.localScore * 0.3) - (a.semanticScore * 0.7 + a.localScore * 0.3))
        .slice(0, topK);

      return {
        relevant_docs: results.map(r => r.document),
        scores: results.map(r => r.semanticScore * 0.7 + r.localScore * 0.3)
      };

    } catch (error) {
      console.log('语义搜索失败，回退到本地RAG:', error);
      return await this.localRAG.query(query, topK);
    }
  }
}

export default HybridSemanticRAG;