// 全局RAG系统单例
// 确保所有组件使用同一个RAG实例，实现知识库的真正共享

import SimpleFrontendRAG from './simpleFrontendRAG';

class GlobalRAGSystem {
  constructor() {
    this.ragInstance = null;
    this.isInitialized = false;
    this.initPromise = null;
  }

  async initialize() {
    // 如果正在初始化，返回现有的Promise
    if (this.initPromise) {
      return this.initPromise;
    }

    // 如果已经初始化，直接返回
    if (this.isInitialized && this.ragInstance) {
      return this.ragInstance;
    }

    console.log('🔄 初始化全局RAG系统...');
    
    this.initPromise = this._doInitialize();
    await this.initPromise;
    this.initPromise = null;
    
    return this.ragInstance;
  }

  async _doInitialize() {
    try {
      this.ragInstance = new SimpleFrontendRAG();
      await this.ragInstance.initialize();
      this.isInitialized = true;
      console.log('✅ 全局RAG系统初始化成功');
      
      // 加载用户自定义知识库
      await this.loadCustomKnowledge();
      
    } catch (error) {
      console.error('❌ 全局RAG系统初始化失败:', error);
      throw error;
    }
  }

  async loadCustomKnowledge() {
    try {
      // 清空当前知识库，重新加载
      this.ragInstance.knowledgeBase = [];
      
      // 重新初始化默认知识库
      this.ragInstance.useDefaultKnowledgeBase();
      
      // 1. 加载用户自定义知识条目
      const savedKnowledge = localStorage.getItem('customKnowledgeBase');
      if (savedKnowledge) {
        const parsedKnowledge = JSON.parse(savedKnowledge);
        if (Array.isArray(parsedKnowledge) && parsedKnowledge.length > 0) {
          console.log('📚 加载用户自定义知识库:', parsedKnowledge.length + '个条目');
          
          // 添加用户自定义知识
          parsedKnowledge.forEach(item => {
            this.ragInstance.addDocument(item);
          });
          
          console.log('✅ 用户自定义知识库加载完成');
        }
      }
      
      // 2. 加载用户上传的文件内容
      const savedFiles = localStorage.getItem('customFiles');
      if (savedFiles) {
        const parsedFiles = JSON.parse(savedFiles);
        if (Array.isArray(parsedFiles) && parsedFiles.length > 0) {
          console.log('📁 加载用户上传的文件:', parsedFiles.length + '个文件');
          
          let fileContentCount = 0;
          parsedFiles.forEach(file => {
            if (file.isGraduateData && file.graduateData) {
              // 新的毕业生数据文件：使用解析后的结构化数据
              file.graduateData.forEach(graduate => {
                const ragDocument = this.createGraduateRAGDocument(graduate);
                this.ragInstance.addDocument(ragDocument);
              });
              fileContentCount++;
              console.log(`✅ 已加载毕业生数据文件: ${file.name} (${file.graduateData.length}条记录)`);
            } else if (file.content && file.content.trim()) {
              // 兼容其他类型的文件
              if (!file.content.startsWith('[PDF文件:') || file.pdfTextExtracted) {
                if (file.isPdf && file.pdfTextExtracted) {
                  // PDF文件：使用提取的文本
                  this.ragInstance.addDocument(`PDF文档: ${file.name}\n页数: ${file.pageCount || '未知'}\n内容:\n${file.content}`);
                  fileContentCount++;
                  console.log('✅ 已加载PDF文件内容:', file.name);
                } else if (!file.isPdf && !file.isGraduateData) {
                  // 其他文本文件
                  this.ragInstance.addDocument(`文档: ${file.name}\n类型: ${file.type}\n内容:\n${file.content}`);
                  fileContentCount++;
                  console.log('✅ 已加载文件内容:', file.name);
                }
              } else {
                console.log('⚠️ 跳过无效文件内容:', file.name);
              }
            } else {
              console.log('⚠️ 跳过空文件:', file.name);
            }
          });
          
          console.log(`✅ 用户上传文件加载完成，共加载 ${fileContentCount} 个有效文件的内容`);
        }
      }
      
      // 显示最终知识库状态
      console.log(`🎉 全局RAG系统知识库重新加载完成，总计 ${this.ragInstance.knowledgeBase.length} 个文档`);
      
    } catch (error) {
      console.error('❌ 加载用户自定义知识库失败:', error);
    }
  }

  // 为毕业生创建RAG文档（与FileManager中的方法保持一致）
  createGraduateRAGDocument(graduate) {
    const fields = Object.keys(graduate);
    const info = fields.map(field => `${field}: ${graduate[field]}`).join(', ');
    
    return `毕业生档案 - ${graduate['姓名'] || graduate['name'] || '未知'}
专业信息: ${graduate['专业'] || graduate['major'] || '未知'}
学业表现: GPA ${graduate['GPA'] || graduate['gpa'] || '未知'}
就业去向: ${graduate['就业单位'] || graduate['company'] || graduate['工作单位'] || '未知'}
薪资待遇: ${graduate['薪资'] || graduate['salary'] || graduate['年薪'] || '未知'}
毕业年份: ${graduate['毕业年份'] || graduate['year'] || graduate['届'] || '未知'}
详细信息: ${info}
--- 毕业生档案结束 ---`;
  }

  getInstance() {
    return this.ragInstance;
  }

  getStatus() {
    return {
      isInitialized: this.isInitialized,
      hasInstance: !!this.ragInstance,
      documentCount: this.ragInstance ? this.ragInstance.knowledgeBase.length : 0
    };
  }

  // 添加文档到全局知识库
  addDocument(document) {
    if (this.ragInstance) {
      this.ragInstance.addDocument(document);
      console.log('📝 文档已添加到全局RAG系统');
    } else {
      console.warn('⚠️ RAG系统未初始化，无法添加文档');
    }
  }

  // 查询知识库
  async query(question, topK = 3) {
    if (!this.ragInstance) {
      console.log('🔄 RAG实例未初始化，正在初始化...');
      await this.initialize();
    }
    
    console.log('🔍 全局RAG查询详情:');
    console.log('📝 查询问题:', question);
    console.log('📚 当前知识库大小:', this.ragInstance.knowledgeBase.length);
    console.log('🗂️ 知识库内容预览:', this.ragInstance.knowledgeBase.slice(0, 3));
    
    const result = await this.ragInstance.query(question, topK);
    
    console.log('🎯 查询结果:', result);
    console.log('📊 匹配分数:', result.scores);
    
    return result;
  }

  // 重新加载知识库
  async reloadKnowledge() {
    try {
      console.log('🔄 手动重新加载全局RAG知识库...');
      await this.loadCustomKnowledge();
      console.log('✅ 全局RAG知识库重新加载完成');
      return true;
    } catch (error) {
      console.error('❌ 重新加载知识库失败:', error);
      return false;
    }
  }

  // 强制刷新知识库（用于调试）
  async forceRefresh() {
    try {
      console.log('🔥 强制刷新全局RAG系统...');
      this.isInitialized = false;
      this.ragInstance = null;
      await this.initialize();
      console.log('✅ 全局RAG系统强制刷新完成');
      return true;
    } catch (error) {
      console.error('❌ 强制刷新失败:', error);
      return false;
    }
  }
}

// 创建全局单例实例
const globalRAGSystem = new GlobalRAGSystem();

export default globalRAGSystem; 