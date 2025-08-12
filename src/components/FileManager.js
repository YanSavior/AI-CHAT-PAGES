import React, { useState, useEffect } from 'react';

const FileManager = ({ ragSystem, onFileUpdate }) => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({
    totalFiles: 0,
    totalSize: 0,
    lastUpdated: null
  });

  // 预定义的文件列表
  const predefinedFiles = [
    {
      name: '微电子科学与工程专业培养方案.json',
      path: 'data/training-plans/showPyfaPdf.json',
      type: 'application/json',
      category: '培养方案',
      description: '微电子科学与工程专业培养方案文档'
    },
    {
      name: '微电子科学与工程英才班专业培养方案.json',
      path: 'data/training-plans/showPyfaPdf-1-1.json',
      type: 'application/json',
      category: '培养方案',
      description: '微电子科学与工程英才班专业培养方案'
    },
    {
      name: '机械设计制造及其自动化专业培养方案.json',
      path: 'data/training-plans/showPyfaPdf-1-2.json',
      type: 'application/json',
      category: '培养方案',
      description: '机械设计制造及其自动化专业培养方案'
    },
    {
      name: '智能制造工程专业培养方案.json',
      path: 'data/training-plans/showPyfaPdf-1-3.json',
      type: 'application/json',
      category: '培养方案',
      description: '智能制造工程专业培养方案'
    },
    {
      name: '集成电路制造产学合作班专业培养方案.json',
      path: 'data/training-plans/showPyfaPdf-1-4.json',
      type: 'application/json',
      category: '培养方案',
      description: '集成电路制造产学合作班专业培养方案'
    },
    {
      name: '集成电路设计与集成系统专业培养方案.json',
      path: 'data/training-plans/showPyfaPdf-1-5.json',
      type: 'application/json',
      category: '培养方案',
      description: '集成电路设计与集成系统专业培养方案'
    },
    {
      name: '机械设计制造及其自动化（二学位）专业培养方案.json',
      path: 'data/training-plans/showPyfaPdf-1-6.json',
      type: 'application/json',
      category: '培养方案',
      description: '机械设计制造及其自动化（二学位）专业培养方案'
    },
    {
      name: '机械设计制造及其自动化（辅修）专业培养方案.json',
      path: 'data/training-plans/showPyfaPdf-1-7.json',
      type: 'application/json',
      category: '培养方案',
      description: '机械设计制造及其自动化（辅修）专业培养方案'
    },
    {
      name: '智能制造工程（辅修）专业培养方案.json',
      path: 'data/training-plans/showPyfaPdf-1-8.json',
      type: 'application/json',
      category: '培养方案',
      description: '智能制造工程（辅修）专业培养方案'
    },
    {
      name: '3D打印创意设计与制作（微专业）专业培养方案.json',
      path: 'data/training-plans/showPyfaPdf-1-9.json',
      type: 'application/json',
      category: '培养方案',
      description: '3D打印创意设计与制作（微专业）专业培养方案'
    },
    {
      name: '毕业生就业数据.csv',
      path: 'data/graduates/real_graduates.csv',
      type: 'text/csv',
      category: '毕业生数据',
      description: '真实毕业生就业去向、薪资、发展方向等统计数据'
    },
    {
      name: '学生信息数据.csv',
      path: 'data/graduates/students.csv',
      type: 'text/csv',
      category: '毕业生数据',
      description: '学生基本信息、GPA、地域分布等数据'
    }
  ];

  // 初始化文件列表
  useEffect(() => {
    loadFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 当onFileUpdate回调函数变化时，重新发送当前统计信息
  useEffect(() => {
    if (onFileUpdate && files.length > 0) {
      const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
      const currentStats = {
        totalFiles: files.length,
        totalSize,
        lastUpdated: stats.lastUpdated || new Date().toLocaleString('zh-CN')
      };
      onFileUpdate(currentStats);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onFileUpdate, files.length]);

  // 加载文件列表
  const loadFiles = async () => {
    setIsLoading(true);
    console.log('🔍 开始加载文件列表...');
    console.log('🌐 当前URL:', window.location.href);
    
    try {
      // 加载预定义文件信息
      const fileList = [];
      let successCount = 0;
      
      for (const file of predefinedFiles) {
        try {
          const fullUrl = `${window.location.origin}/${file.path}`;
          console.log(`📂 尝试加载文件: ${file.name}`);
          console.log(`🔗 完整URL: ${fullUrl}`);
          
          const response = await fetch(fullUrl);
          console.log(`📊 响应状态: ${response.status} ${response.statusText}`);
          
          if (response.ok) {
            const content = await response.text();
            const size = content.length;
            console.log(`✅ 文件 ${file.name} 加载成功，大小: ${size} bytes`);
            
            fileList.push({
              ...file,
              size: size,
              lastModified: new Date().toISOString(),
              exists: true,
              content: content // 保存内容以便后续使用
            });
            successCount++;
          } else {
            console.error(`❌ 文件 ${file.name} 加载失败，状态码: ${response.status}`);
            console.error(`🔍 响应头:`, Object.fromEntries(response.headers.entries()));
            
            // 即使加载失败，也添加到列表中，但标记为不存在
            fileList.push({
              ...file,
              size: 0,
              lastModified: new Date().toISOString(),
              exists: false,
              error: `加载失败 (${response.status})`
            });
          }
        } catch (error) {
          console.error(`💥 文件 ${file.name} 加载异常:`, error);
          // 添加错误信息到列表
          fileList.push({
            ...file,
            size: 0,
            lastModified: new Date().toISOString(),
            exists: false,
            error: error.message
          });
        }
      }

      // 加载用户上传的文件
      const customFiles = JSON.parse(localStorage.getItem('customFiles') || '[]');
      console.log(`📥 用户上传的文件数量: ${customFiles.length}`);
      
      // 修正用户上传文件的状态
      const correctedCustomFiles = customFiles.map(file => ({
        ...file,
        exists: true, // 用户上传的文件在localStorage中，总是存在的
        error: null   // 清除任何错误状态
      }));
      
      fileList.push(...correctedCustomFiles);

      console.log(`📋 最终文件列表: ${fileList.length} 个文件`);
      console.log(`✅ 成功加载: ${successCount} 个预定义文件`);
      console.log('📋 文件详情:', fileList);
      
      // 无论是否成功，都更新文件列表
      setFiles(fileList);
      updateStats(fileList);
      
      if (fileList.length > 0) {
        setMessage(`📁 文件列表加载完成 (${fileList.length}个文件，${successCount}个预定义文件成功加载)`);
      } else {
        setMessage('⚠️ 没有找到任何文件，请检查文件路径或上传新文件');
      }
      
    } catch (error) {
      console.error('💥 加载文件列表失败:', error);
      setMessage('❌ 文件列表加载失败: ' + error.message);
      // 至少加载用户上传的文件
      try {
        const customFiles = JSON.parse(localStorage.getItem('customFiles') || '[]');
        setFiles(customFiles);
        updateStats(customFiles);
      } catch (e) {
        console.error('加载用户文件也失败:', e);
        setFiles([]);
        updateStats([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 更新统计信息
  const updateStats = (fileList) => {
    const totalSize = fileList.reduce((sum, file) => sum + (file.size || 0), 0);
    const newStats = {
      totalFiles: fileList.length,
      totalSize,
      lastUpdated: new Date().toLocaleString('zh-CN')
    };
    setStats(newStats);
    
    // 通知父组件更新统计信息
    if (onFileUpdate) {
      onFileUpdate(newStats);
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // 下载文件
  const handleDownloadFile = async (file) => {
    try {
      setMessage('📥 正在下载文件...');
      
      // 检查是否是PDF文件且是用户上传的
      if (file.isCustom && (file.isPdf || file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf'))) {
        // PDF文件特殊处理 - 无法重新创建原始PDF文件
        setMessage('❌ PDF文件下载暂不支持，因为无法重建原始PDF内容。建议保留原始文件。');
        setTimeout(() => setMessage(''), 5000);
        return;
      }
      
      let content;
      if (file.content && !file.isPdf) {
        // 使用已保存的内容
        content = file.content;
        console.log(`🔗 使用缓存内容下载文件: ${file.name}`);
      } else if (file.path) {
        // 重新从服务器加载
        const fullUrl = `${window.location.origin}/${file.path}`;
        console.log(`🔗 下载文件URL: ${fullUrl}`);
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error(`文件下载失败 (${response.status})`);
        content = await response.text();
      } else {
        throw new Error('文件内容不可用');
      }
      
      const blob = new Blob([content], { type: file.type || 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setMessage('✅ 文件下载成功');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('下载文件失败:', error);
      setMessage('❌ 文件下载失败: ' + error.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // 查看文件内容
  const handleViewFile = async (file) => {
    try {
      setMessage('👀 正在加载文件内容...');
      
      // 检查是否是PDF文件
      if (file.isPdf || file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        // PDF文件特殊处理
        const extractedText = file.pdfTextExtracted && file.content && !file.content.startsWith('[PDF文件:') 
          ? file.content 
          : null;

        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
          <html>
            <head>
              <title>${file.name}</title>
              <style>
                body { font-family: 'Microsoft YaHei', Arial, sans-serif; padding: 40px; background: #f5f5f5; }
                .container { background: white; padding: 40px; border-radius: 12px; border: 1px solid #ddd; max-width: 800px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 30px; }
                .pdf-icon { font-size: 4rem; margin-bottom: 20px; }
                .status-success { color: #059669; font-weight: bold; }
                .status-error { color: #dc2626; font-weight: bold; }
                .info-item { margin: 15px 0; padding: 15px; background: #f8fafc; border-radius: 8px; }
                .label { font-weight: 600; color: #374151; }
                .value { color: #6b7280; margin-left: 10px; }
                .content-section { margin-top: 30px; padding: 20px; background: #fafafa; border-radius: 8px; }
                .content-text { 
                  max-height: 400px; 
                  overflow-y: auto; 
                  white-space: pre-wrap; 
                  line-height: 1.6;
                  border: 1px solid #e5e7eb;
                  padding: 15px;
                  background: white;
                  border-radius: 6px;
                }
                .alert { margin-top: 30px; padding: 20px; border-radius: 8px; }
                .alert-warning { background: #fffbeb; border: 1px solid #fbbf24; color: #92400e; }
                .alert-success { background: #f0fdf4; border: 1px solid #22c55e; color: #166534; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="pdf-icon">📄</div>
                  <h2>${file.name}</h2>
                  <p><strong>状态:</strong> <span class="${file.pdfTextExtracted ? 'status-success' : 'status-error'}">
                    ${file.pdfTextExtracted ? '✅ PDF文本已提取' : '❌ PDF文本提取失败'}
                  </span></p>
                </div>
                
                <div class="info-item">
                  <span class="label">类别:</span>
                  <span class="value">${file.category}</span>
                </div>
                
                <div class="info-item">
                  <span class="label">描述:</span>
                  <span class="value">${file.description}</span>
                </div>
                
                <div class="info-item">
                  <span class="label">大小:</span>
                  <span class="value">${formatFileSize(file.size)}</span>
                </div>
                
                <div class="info-item">
                  <span class="label">上传时间:</span>
                  <span class="value">${new Date(file.lastModified).toLocaleString('zh-CN')}</span>
                </div>
                
                ${extractedText ? `
                  <div class="content-section">
                    <h3>📖 提取的文本内容</h3>
                    <div class="content-text">${extractedText}</div>
                  </div>
                  <div class="alert alert-success">
                    <strong>✅ 成功:</strong> PDF文本已成功提取并添加到AI知识库！AI现在可以根据这些内容回答相关问题。
                  </div>
                ` : `
                  <div class="alert alert-warning">
                    <strong>⚠️ 提示:</strong> PDF文本提取失败，AI无法访问PDF中的具体内容。建议重新上传或检查PDF文件是否包含可提取的文本。
                  </div>
                `}
              </div>
            </body>
          </html>
        `);
        
        setMessage(file.pdfTextExtracted ? '✅ PDF文件信息和内容已在新窗口中打开' : '⚠️ PDF文件信息已打开，但文本提取失败');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      
      // 检查是否是毕业生数据文件
      if (file.isGraduateData) {
        // 毕业生数据文件特殊处理
        const newWindow = window.open('', '_blank');
        newWindow.document.write(`
          <html>
            <head>
              <title>${file.name}</title>
              <style>
                body { font-family: 'Microsoft YaHei', Arial, sans-serif; padding: 40px; background: #f5f5f5; }
                .container { background: white; padding: 40px; border-radius: 12px; border: 1px solid #ddd; max-width: 1000px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 30px; }
                .icon { font-size: 4rem; margin-bottom: 20px; }
                .status { color: #059669; font-weight: bold; }
                .info-item { margin: 15px 0; padding: 15px; background: #f8fafc; border-radius: 8px; }
                .label { font-weight: 600; color: #374151; }
                .value { color: #6b7280; margin-left: 10px; }
                .data-table { margin-top: 30px; width: 100%; border-collapse: collapse; }
                .data-table th, .data-table td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
                .data-table th { background: #f9fafb; font-weight: 600; }
                .data-table tbody tr:nth-child(even) { background: #f9fafb; }
                .alert-success { margin-top: 30px; padding: 20px; background: #f0fdf4; border: 1px solid #22c55e; border-radius: 8px; color: #166534; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="icon">👨‍🎓</div>
                  <h2>${file.name}</h2>
                  <p><strong>状态:</strong> <span class="status">✅ 毕业生数据已成功解析</span></p>
                </div>
                
                <div class="info-item">
                  <span class="label">类别:</span>
                  <span class="value">${file.category}</span>
                </div>
                
                <div class="info-item">
                  <span class="label">描述:</span>
                  <span class="value">${file.description}</span>
                </div>
                
                <div class="info-item">
                  <span class="label">文件大小:</span>
                  <span class="value">${formatFileSize(file.size)}</span>
                </div>
                
                <div class="info-item">
                  <span class="label">毕业生记录数:</span>
                  <span class="value">${file.graduateData ? file.graduateData.length : '未知'} 条</span>
                </div>
                
                <div class="info-item">
                  <span class="label">上传时间:</span>
                  <span class="value">${new Date(file.lastModified).toLocaleString('zh-CN')}</span>
                </div>
                
                ${file.graduateData && file.graduateData.length > 0 ? `
                  <div style="margin-top: 30px;">
                    <h3>📊 毕业生数据预览 (前10条记录)</h3>
                    <table class="data-table">
                      <thead>
                        <tr>
                          ${Object.keys(file.graduateData[0]).map(key => `<th>${key}</th>`).join('')}
                        </tr>
                      </thead>
                      <tbody>
                        ${file.graduateData.slice(0, 10).map(grad => `
                          <tr>
                            ${Object.values(grad).map(value => `<td>${value}</td>`).join('')}
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                    ${file.graduateData.length > 10 ? `<p style="margin-top: 10px; color: #6b7280;">显示前10条记录，共${file.graduateData.length}条</p>` : ''}
                  </div>
                ` : ''}
                
                <div class="alert-success">
                  <strong>✅ 成功:</strong> 毕业生数据已成功解析并添加到AI知识库！AI现在可以根据这些毕业生案例提供更精准的职业规划建议。
                </div>
              </div>
            </body>
          </html>
        `);
        
        setMessage('✅ 毕业生数据详情已在新窗口中打开');
        setTimeout(() => setMessage(''), 3000);
        return;
      }
      
      let content;
      if (file.content) {
        // 使用已保存的内容
        content = file.content;
        console.log(`🔗 使用缓存内容查看文件: ${file.name}`);
      } else if (file.path) {
        // 重新从服务器加载
        const fullUrl = `${window.location.origin}/${file.path}`;
        console.log(`🔗 查看文件URL: ${fullUrl}`);
        const response = await fetch(fullUrl);
        if (!response.ok) throw new Error(`文件加载失败 (${response.status})`);
        content = await response.text();
      } else {
        throw new Error('文件内容不可用');
      }
      
      // 格式化JSON内容
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(content);
          content = JSON.stringify(parsed, null, 2);
        } catch (e) {
          // 如果解析失败，保持原内容
          console.warn('JSON解析失败，显示原始内容:', e);
        }
      }
      
      // 创建新窗口显示内容
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`
        <html>
          <head>
            <title>${file.name}</title>
            <style>
              body { font-family: monospace; padding: 20px; background: #f5f5f5; }
              pre { background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; overflow: auto; }
              .header { background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 15px; }
              .status { color: ${file.exists ? '#059669' : '#dc2626'}; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>${file.name}</h2>
              <p><strong>类别:</strong> ${file.category}</p>
              <p><strong>描述:</strong> ${file.description}</p>
              <p><strong>大小:</strong> ${formatFileSize(file.size || content.length)}</p>
              <p><strong>状态:</strong> <span class="status">${file.exists ? '✅ 正常' : '❌ 加载失败'}</span></p>
              ${file.error ? `<p><strong>错误:</strong> <span style="color: #dc2626;">${file.error}</span></p>` : ''}
            </div>
            <pre>${content}</pre>
          </body>
        </html>
      `);
      
      setMessage('✅ 文件内容已在新窗口中打开');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('查看文件失败:', error);
      setMessage('❌ 文件内容加载失败: ' + error.message);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // 上传新的毕业生数据
  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    // 验证文件类型
    if (!uploadedFile.name.toLowerCase().endsWith('.csv')) {
      setMessage('❌ 请上传CSV格式的毕业生数据文件');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setIsLoading(true);
    try {
      setMessage('📊 正在处理毕业生数据...');
      
      // 读取CSV文件内容
      const content = await uploadedFile.text();
      console.log('📄 CSV文件内容预览:', content.substring(0, 200) + '...');
      
      // 解析CSV数据
      const graduateData = parseCSVGraduateData(content);
      console.log('👨‍🎓 解析到的毕业生数据:', graduateData);
      
      if (graduateData.length === 0) {
        throw new Error('CSV文件中没有找到有效的毕业生数据');
      }
      
      const newFile = {
        name: uploadedFile.name,
        type: 'text/csv',
        size: uploadedFile.size,
        category: '毕业生数据',
        description: `毕业生数据文件 (${graduateData.length}条记录)`,
        content: content,
        graduateData: graduateData,
        lastModified: new Date().toISOString(),
        isCustom: true,
        exists: true,
        isGraduateData: true
      };

      // 添加到RAG系统
      if (ragSystem) {
        // 为每个毕业生创建详细的RAG文档
        graduateData.forEach(graduate => {
          const ragDocument = createGraduateRAGDocument(graduate);
          ragSystem.addDocument(ragDocument);
        });
        
        setMessage(`✨ 毕业生数据上传成功！已解析 ${graduateData.length} 条毕业生记录并添加到知识库`);
      } else {
        setMessage(`✨ 毕业生数据上传成功！已解析 ${graduateData.length} 条记录`);
      }

      // 保存到本地存储
      const customFiles = JSON.parse(localStorage.getItem('customFiles') || '[]');
      customFiles.push(newFile);
      localStorage.setItem('customFiles', JSON.stringify(customFiles));

      // 更新文件列表
      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);
      updateStats(updatedFiles);

      // 通知父组件更新
      if (onFileUpdate) {
        onFileUpdate();
      }

      setTimeout(() => setMessage(''), 5000);
    } catch (error) {
      console.error('上传毕业生数据失败:', error);
      setMessage('❌ 毕业生数据上传失败: ' + error.message);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setIsLoading(false);
      event.target.value = null; // 重置文件输入
    }
  };

  // 解析CSV毕业生数据
  const parseCSVGraduateData = (csvContent) => {
    try {
      const lines = csvContent.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV文件格式不正确，至少需要标题行和数据行');
      }
      
      // 解析标题行
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      console.log('📋 CSV标题行:', headers);
      
      const graduates = [];
      
      // 解析数据行
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        
        if (values.length !== headers.length) {
          console.warn(`⚠️ 第${i + 1}行数据列数不匹配，跳过`);
          continue;
        }
        
        // 创建毕业生对象
        const graduate = {};
        headers.forEach((header, index) => {
          graduate[header] = values[index];
        });
        
        graduates.push(graduate);
      }
      
      return graduates;
    } catch (error) {
      console.error('CSV解析失败:', error);
      throw new Error('CSV文件解析失败: ' + error.message);
    }
  };

  // 为毕业生创建RAG文档
  const createGraduateRAGDocument = (graduate) => {
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
  };

  // 删除用户上传的文件
  const handleDeleteFile = async (fileIndex) => {
    const file = files[fileIndex];
    if (!file.isCustom) {
      setMessage('❌ 无法删除系统预置文件');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (!window.confirm(`确定要删除文件 "${file.name}" 吗？`)) {
      return;
    }

    try {
      // 从本地存储中删除
      const customFiles = JSON.parse(localStorage.getItem('customFiles') || '[]');
      const updatedCustomFiles = customFiles.filter((_, index) => {
        // 找到对应的自定义文件索引
        const customFileIndex = files.slice(0, fileIndex).filter(f => f.isCustom).length;
        return index !== customFileIndex;
      });
      localStorage.setItem('customFiles', JSON.stringify(updatedCustomFiles));

      // 更新文件列表
      const updatedFiles = files.filter((_, index) => index !== fileIndex);
      setFiles(updatedFiles);
      updateStats(updatedFiles);

      setMessage('🗑️ 文件删除成功');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('删除文件失败:', error);
      setMessage('❌ 文件删除失败');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // 获取文件图标
  const getFileIcon = (file) => {
    if (file.type === 'application/json' || file.name.endsWith('.json')) {
      return '📄';
    } else if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
      return '📊';
    } else if (file.type.startsWith('image/')) {
      return '🖼️';
    } else if (file.type === 'application/pdf') {
      return '📕';
    } else if (file.type.startsWith('text/')) {
      return '📝';
    } else {
      return '📁';
    }
  };

  // 获取类别颜色
  const getCategoryColor = (category) => {
    switch (category) {
      case '培养方案': return 'bg-blue-100 text-blue-800';
      case '毕业生数据': return 'bg-purple-100 text-purple-800';
      case '用户上传': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="file-manager-container">
      {/* 文件统计卡片 */}
      <div className="stats-grid mb-6">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon">📁</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalFiles}</div>
            <div className="stat-label">文档文件</div>
          </div>
        </div>
        <div className="stat-card stat-card-success">
          <div className="stat-icon">💾</div>
          <div className="stat-content">
            <div className="stat-value">{formatFileSize(stats.totalSize)}</div>
            <div className="stat-label">总大小</div>
          </div>
        </div>
        <div className="stat-card stat-card-info">
          <div className="stat-icon">🕒</div>
          <div className="stat-content">
            <div className="stat-value">{stats.lastUpdated ? '已更新' : '未更新'}</div>
            <div className="stat-label">最后更新: {stats.lastUpdated}</div>
          </div>
        </div>
      </div>

      {/* 上传文件区域 */}
      <div className="input-section">
        <h3 className="section-title">
          <span className="title-icon">👨‍🎓</span>
          上传新的毕业生数据
        </h3>
        <p className="section-subtitle">
          上传CSV格式的毕业生数据文件，将自动集成到AI的毕业生知识库中，用于职业规划分析
        </p>
        
        <label className="file-upload-area">
          <input
            type="file"
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
            disabled={isLoading}
          />
          <div className="upload-content">
            <div className="upload-icon">📊</div>
            <div className="upload-text">
              <div className="upload-title">点击选择CSV毕业生数据文件</div>
              <div className="upload-subtitle">支持CSV格式，包含姓名、专业、GPA、就业单位、薪资等信息</div>
            </div>
          </div>
        </label>
      </div>

      {/* 消息提示 */}
      {message && (
        <div className="message message-info">
          {message}
        </div>
      )}

      {/* 文件列表 */}
      <div className="file-list-section">
        <h3 className="section-title">
          <span className="title-icon">📊</span>
          毕业生数据文件列表
        </h3>
        
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner">⏳</div>
            <p>正在加载文件列表...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👨‍🎓</div>
            <div className="empty-state-text">暂无毕业生数据文件</div>
            <div className="empty-state-subtext">上传您的第一个毕业生数据文件吧！</div>
          </div>
        ) : (
          <div className="file-items">
            {files.map((file, index) => (
              <div key={index} className={`file-item ${!file.exists ? 'file-error' : ''}`}>
                <div className="file-content">
                  <div className="file-header">
                    <div className="file-info">
                      <div className="file-icon">{getFileIcon(file)}</div>
                      <div className="file-details">
                        <div className="file-name">
                          {file.name}
                          {!file.exists && <span className="error-indicator"> ❌</span>}
                        </div>
                        <div className="file-meta">
                          <span className={`file-category ${getCategoryColor(file.category)}`}>
                            {file.category}
                          </span>
                          <span className="file-size">{formatFileSize(file.size)}</span>
                          {file.isCustom && (
                            <span className="file-status-msg">✅ 已保存到本地</span>
                          )}
                          {file.error && !file.isCustom && (
                            <span className="file-error-msg">错误: {file.error}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="file-actions">
                      <button
                        onClick={() => handleViewFile(file)}
                        className="btn btn-sm btn-secondary"
                        title="查看文件内容"
                        disabled={!file.exists && !file.content && !file.isCustom}
                      >
                        <span className="button-icon">👁️</span>
                        查看
                      </button>
                      <button
                        onClick={() => handleDownloadFile(file)}
                        className="btn btn-sm btn-primary"
                        title="下载文件"
                        disabled={!file.exists && !file.content && !file.isCustom}
                      >
                        <span className="button-icon">⬇️</span>
                        下载
                      </button>
                      {file.isCustom && (
                        <button
                          onClick={() => handleDeleteFile(index)}
                          className="btn btn-sm btn-danger"
                          title="删除文件"
                        >
                          <span className="button-icon">🗑️</span>
                          删除
                        </button>
                      )}
                    </div>
                  </div>
                  {file.description && (
                    <div className="file-description">{file.description}</div>
                  )}
                  {file.error && (
                    <div className="file-error-details">
                      <strong>加载错误:</strong> {file.error}
                      <br />
                      <small>文件路径: {file.path}</small>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileManager; 