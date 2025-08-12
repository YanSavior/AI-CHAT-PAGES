import React, { useState, useEffect } from 'react';
import globalRAGSystem from '../utils/GlobalRAGSystem';
import FileManager from './FileManager';

const KnowledgeBaseManager = () => {
  const [knowledgeItems, setKnowledgeItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editText, setEditText] = useState('');
  const [ragSystem, setRagSystem] = useState(null);
  const [message, setMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('knowledge'); // 'knowledge' 或 'files'
  const [stats, setStats] = useState({
    totalItems: 0,
    totalCharacters: 0,
    lastUpdated: null
  });
  const [fileStats, setFileStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    lastUpdated: null
  });

  // 初始化RAG系统并加载知识库
  useEffect(() => {
    const initRAG = async () => {
      setIsLoading(true);
      try {
        console.log('开始初始化RAG系统...');
        const rag = globalRAGSystem;
        await rag.initialize();
        setRagSystem(rag);
        
        // 尝试从localStorage加载知识库
        const savedKnowledge = localStorage.getItem('customKnowledgeBase');
        console.log('从localStorage加载的知识库:', savedKnowledge);
        
        if (savedKnowledge) {
          try {
            const parsedKnowledge = JSON.parse(savedKnowledge);
            console.log('解析后的知识库数据:', parsedKnowledge);
            
            if (Array.isArray(parsedKnowledge) && parsedKnowledge.length > 0) {
              console.log('设置知识库条目:', parsedKnowledge);
              setKnowledgeItems(parsedKnowledge);
              rag.knowledgeBase = parsedKnowledge;
              setMessage('✅ 已从本地存储加载自定义知识库');
              updateStats(parsedKnowledge);
              return;
            }
          } catch (e) {
            console.error('解析本地存储的知识库失败:', e);
          }
        }
        
        // 如果没有本地存储的知识库或解析失败，使用RAG系统加载的知识库
        const defaultKnowledge = rag.knowledgeBase || [];
        console.log('使用RAG系统的默认知识库:', defaultKnowledge);
        setKnowledgeItems(defaultKnowledge);
        setMessage('🎉 知识库加载成功');
        updateStats(defaultKnowledge);
        
        // 加载培养方案文件到RAG系统
        await loadTrainingPlansToRAG(rag);
      } catch (error) {
        console.error('初始化RAG系统失败:', error);
        setMessage('❌ 知识库加载失败');
      } finally {
        setIsLoading(false);
      }
    };

    initRAG();
  }, []);

  // 加载培养方案文件到RAG系统
  const loadTrainingPlansToRAG = async (rag) => {
    // 这些是实际的不同专业培养方案文件：
    // 1. 微电子科学与工程
    // 2. 微电子科学与工程英才班  
    // 3. 机械设计制造及其自动化
    // 4. 智能制造工程
    // 5. 集成电路制造产学合作班
    // 6. 集成电路设计与集成系统
    // 7. 机械设计制造及其自动化（二学位）
    // 8. 机械设计制造及其自动化（辅修）
    // 9. 智能制造工程（辅修）
    // 10. 3D打印创意设计与制作（微专业）
    const trainingPlanFiles = [
      'data/training-plans/showPyfaPdf.json',
      'data/training-plans/showPyfaPdf-1-1.json',
      'data/training-plans/showPyfaPdf-1-2.json',
      'data/training-plans/showPyfaPdf-1-3.json',
      'data/training-plans/showPyfaPdf-1-4.json',
      'data/training-plans/showPyfaPdf-1-5.json',
      'data/training-plans/showPyfaPdf-1-6.json',
      'data/training-plans/showPyfaPdf-1-7.json',
      'data/training-plans/showPyfaPdf-1-8.json',
      'data/training-plans/showPyfaPdf-1-9.json'
    ];

    console.log('🎓 开始加载培养方案文件到RAG系统...');
    for (const filePath of trainingPlanFiles) {
      try {
        const fullUrl = `${window.location.origin}/${filePath}`;
        console.log(`📖 尝试加载培养方案文件: ${fullUrl}`);
        const response = await fetch(fullUrl);
        if (response.ok) {
          const content = await response.text();
          const jsonData = JSON.parse(content);
          
          // 将JSON内容转换为可搜索的文本
          let textContent = '';
          if (Array.isArray(jsonData)) {
            // 如果是数组，连接所有文本
            textContent = jsonData.join('\n\n');
          } else if (jsonData.content) {
            textContent = jsonData.content;
          } else if (typeof jsonData === 'object') {
            textContent = JSON.stringify(jsonData, null, 2);
          } else {
            textContent = content;
          }
          
          // 添加到RAG系统
          rag.addDocument(`培养方案文档: ${textContent}`);
          console.log(`✅ 已加载培养方案文件: ${filePath} (${textContent.length} 字符)`);
        } else {
          console.warn(`⚠️ 培养方案文件加载失败: ${filePath}, 状态码: ${response.status}`);
        }
      } catch (error) {
        console.error(`💥 加载培养方案文件失败 ${filePath}:`, error);
      }
    }
    console.log('🎯 培养方案文件加载完成');
  };

  // 更新统计信息
  const updateStats = (items) => {
    const totalCharacters = items.reduce((sum, item) => sum + (item ? item.length : 0), 0);
    setStats({
      totalItems: items.length,
      totalCharacters,
      lastUpdated: new Date().toLocaleString('zh-CN')
    });
  };

  // 保存知识库到localStorage
  const saveToLocalStorage = (items) => {
    try {
      localStorage.setItem('customKnowledgeBase', JSON.stringify(items));
      setSaveStatus('💾 已保存到本地存储');
      updateStats(items);
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('保存到本地存储失败:', error);
      setSaveStatus('❌ 保存失败');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  // 文件更新回调
  const handleFileUpdate = (newFileStats) => {
    // 文件更新时可以触发一些操作，比如刷新统计信息
    if (newFileStats) {
      setFileStats(newFileStats);
      console.log('📊 文件统计信息已更新:', newFileStats);
    }
    setMessage('📁 文件已更新并同步到知识库');
    setTimeout(() => setMessage(''), 3000);
  };

  // 添加新的知识条目
  const handleAddItem = () => {
    if (!newItem.trim()) return;
    
    const updatedItems = [...knowledgeItems, newItem];
    setKnowledgeItems(updatedItems);
    setNewItem('');
    
    // 更新全局RAG系统的知识库
    if (ragSystem) {
      // 使用全局RAG系统的addDocument方法
      globalRAGSystem.addDocument(newItem);
      setMessage('✨ 条目已添加到全局知识库');
      
      // 保存到本地存储
      saveToLocalStorage(updatedItems);
    }
  };

  // 删除知识条目
  const handleDeleteItem = (index) => {
    const updatedItems = knowledgeItems.filter((_, i) => i !== index);
    setKnowledgeItems(updatedItems);
    
    // 更新全局RAG系统的知识库
    if (ragSystem) {
      // 保存到本地存储后重新加载全局RAG系统
      saveToLocalStorage(updatedItems);
      // 通知全局RAG系统重新加载知识库
      globalRAGSystem.reloadKnowledge();
      setMessage('🗑️ 条目已从全局知识库中删除');
    }
  };

  // 开始编辑条目
  const handleStartEdit = (index) => {
    setEditingIndex(index);
    setEditText(knowledgeItems[index]);
  };

  // 保存编辑后的条目
  const handleSaveEdit = () => {
    if (editingIndex >= 0) {
      const updatedItems = [...knowledgeItems];
      updatedItems[editingIndex] = editText;
      setKnowledgeItems(updatedItems);
      
      // 更新全局RAG系统的知识库
      if (ragSystem) {
        // 保存到本地存储后重新加载全局RAG系统
        saveToLocalStorage(updatedItems);
        // 通知全局RAG系统重新加载知识库
        globalRAGSystem.reloadKnowledge();
        setMessage('✏️ 条目已在全局知识库中更新');
      }
      
      setEditingIndex(-1);
      setEditText('');
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingIndex(-1);
    setEditText('');
  };

  // 导出知识库到JSON文件
  const handleExportKnowledge = () => {
    const data = {
      documents: knowledgeItems,
      exportDate: new Date().toISOString(),
      totalItems: knowledgeItems.length
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge_base_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    setMessage('📤 知识库已导出');
  };

  // 重置知识库到原始状态
  const handleResetKnowledge = async () => {
    if (window.confirm('⚠️ 确定要重置知识库到原始状态吗？这将删除所有自定义条目。')) {
      setIsLoading(true);
      try {
        localStorage.removeItem('customKnowledgeBase');
        
        // 重新初始化RAG系统
        const rag = globalRAGSystem;
        await rag.initialize();
        setRagSystem(rag);
        setKnowledgeItems(rag.knowledgeBase || []);
        setMessage('🔄 知识库已重置为原始状态');
        updateStats(rag.knowledgeBase || []);
        
        // 重新加载培养方案文件
        await loadTrainingPlansToRAG(rag);
      } catch (error) {
        console.error('重置知识库失败:', error);
        setMessage('❌ 重置知识库失败');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 导入知识库文件
  const handleImportKnowledge = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data && Array.isArray(data.documents)) {
          setKnowledgeItems(data.documents);
          
          // 更新RAG系统的知识库
          if (ragSystem) {
            ragSystem.knowledgeBase = data.documents;
            setMessage('📥 知识库已导入');
            
            // 保存到本地存储
            saveToLocalStorage(data.documents);
          }
        } else {
          setMessage('❌ 导入失败：无效的知识库文件格式');
        }
      } catch (error) {
        console.error('导入知识库失败:', error);
        setMessage('❌ 导入失败：无法解析文件');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
    
    // 重置文件输入
    event.target.value = null;
  };

  return (
    <div className="knowledge-manager-container">
      {/* 顶部统计卡片 */}
      <div className="stats-grid">
        {activeTab === 'knowledge' ? (
          // 知识条目统计
          <>
            <div className="stat-card stat-card-primary">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalItems}</div>
                <div className="stat-label">知识条目</div>
              </div>
            </div>
            <div className="stat-card stat-card-success">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalCharacters.toLocaleString()}</div>
                <div className="stat-label">总字符数</div>
              </div>
            </div>
            <div className="stat-card stat-card-info">
              <div className="stat-icon">🕒</div>
              <div className="stat-content">
                <div className="stat-value">{stats.lastUpdated ? '已更新' : '未更新'}</div>
                <div className="stat-label">最后更新: {stats.lastUpdated}</div>
              </div>
            </div>
          </>
        ) : (
          // 文档文件统计
          <>
            <div className="stat-card stat-card-primary">
              <div className="stat-icon">📁</div>
              <div className="stat-content">
                <div className="stat-value">{fileStats.totalFiles}</div>
                <div className="stat-label">文档文件</div>
              </div>
            </div>
            <div className="stat-card stat-card-success">
              <div className="stat-icon">💾</div>
              <div className="stat-content">
                <div className="stat-value">
                  {fileStats.totalSize > 0 ? 
                    (fileStats.totalSize / 1024 > 1024 ? 
                      `${(fileStats.totalSize / 1024 / 1024).toFixed(1)} MB` : 
                      `${(fileStats.totalSize / 1024).toFixed(1)} KB`) 
                    : '0 B'}
                </div>
                <div className="stat-label">总大小</div>
              </div>
            </div>
            <div className="stat-card stat-card-info">
              <div className="stat-icon">🕒</div>
              <div className="stat-content">
                <div className="stat-value">{fileStats.lastUpdated ? '已更新' : '未更新'}</div>
                <div className="stat-label">最后更新: {fileStats.lastUpdated}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 标签页导航 */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'knowledge' ? 'active' : ''}`}
          onClick={() => setActiveTab('knowledge')}
        >
          <span className="tab-icon">💡</span>
          知识条目管理
        </button>
        <button
          className={`tab-button ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          <span className="tab-icon">📁</span>
          文档文件管理
        </button>
      </div>

      {/* 消息提示 */}
      {message && (
        <div className="message message-info">
          {message}
        </div>
      )}

      {/* 标签页内容 */}
      {activeTab === 'knowledge' ? (
        <div className="tab-content">
          {/* 原有的知识条目管理内容 */}
          <div className="main-content">
            {/* 标题和操作按钮 */}
            <div className="section-header">
              <div className="header-content">
                <h2 className="section-title">
                  <span className="title-icon">🎯</span>
                  知识库管理
                </h2>
                <p className="section-subtitle">管理您的AI知识库，添加、编辑、删除知识条目</p>
              </div>
              
              <div className="action-buttons">
                {saveStatus && (
                  <div className="status-badge status-success">
                    <span className="status-icon">✓</span>
                    {saveStatus}
                  </div>
                )}
                
                <label className="action-button action-button-import">
                  <span className="button-icon">📥</span>
                  导入知识库
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportKnowledge}
                    className="hidden"
                  />
                </label>
                
                <button
                  onClick={handleExportKnowledge}
                  className="action-button action-button-export"
                  disabled={knowledgeItems.length === 0}
                >
                  <span className="button-icon">📤</span>
                  导出知识库
                </button>
                
                <button
                  onClick={handleResetKnowledge}
                  className="action-button action-button-reset"
                >
                  <span className="button-icon">🔄</span>
                  重置知识库
                </button>
              </div>
            </div>

            {/* 添加新条目区域 */}
            <div className="add-item-section">
              <div className="section-card">
                <div className="card-header">
                  <h3 className="card-title">
                    <span className="title-icon">➕</span>
                    添加新条目
                  </h3>
                  <div className="card-badge">新建</div>
                </div>
                
                <div className="input-group">
                  <textarea
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    className="knowledge-textarea"
                    placeholder="在这里输入新的知识条目内容..."
                    rows="4"
                  />
                  <div className="input-footer">
                    <div className="char-count">
                      {newItem.length} 字符
                    </div>
                    <button
                      onClick={handleAddItem}
                      className="add-button"
                      disabled={!newItem.trim() || isLoading}
                    >
                      <span className="button-icon">✨</span>
                      {isLoading ? '添加中...' : '添加条目'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 知识库条目列表 */}
            <div className="knowledge-list-section">
              <div className="section-card">
                <div className="card-header">
                  <h3 className="card-title">
                    <span className="title-icon">📋</span>
                    知识库条目
                  </h3>
                  <div className="card-badge card-badge-count">
                    {knowledgeItems.length} 项
                  </div>
                </div>
                
                <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
                  {isLoading ? (
                    <div className="loading-state">
                      <div className="loading-spinner"></div>
                      <p>正在加载知识库...</p>
                    </div>
                  ) : knowledgeItems.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">📭</div>
                      <h4>知识库为空</h4>
                      <p>开始添加您的第一个知识条目吧！</p>
                    </div>
                  ) : (
                    <div className="knowledge-items">
                      {knowledgeItems.map((item, index) => (
                        <div 
                          key={index} 
                          className="knowledge-item"
                        >
                          {editingIndex === index ? (
                            <div className="edit-mode">
                              <textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="edit-textarea"
                                rows="3"
                              />
                              <div className="edit-actions">
                                <button
                                  onClick={handleCancelEdit}
                                  className="edit-button edit-button-cancel"
                                >
                                  <span className="button-icon">❌</span>
                                  取消
                                </button>
                                <button
                                  onClick={handleSaveEdit}
                                  className="edit-button edit-button-save"
                                >
                                  <span className="button-icon">💾</span>
                                  保存
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="item-content">
                              <div className="item-text">{item}</div>
                              <div className="item-meta">
                                <span className="item-length">{item.length} 字符</span>
                                <div className="item-actions">
                                  <button
                                    onClick={() => handleStartEdit(index)}
                                    className="item-button item-button-edit"
                                    title="编辑条目"
                                  >
                                    <span className="button-icon">✏️</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteItem(index)}
                                    className="item-button item-button-delete"
                                    title="删除条目"
                                  >
                                    <span className="button-icon">🗑️</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="tab-content">
          {/* 文档文件管理内容 */}
          <FileManager 
            ragSystem={ragSystem} 
            onFileUpdate={handleFileUpdate}
          />
        </div>
      )}
    </div>
  );
};

export default KnowledgeBaseManager; 