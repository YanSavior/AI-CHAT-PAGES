// PDF文本提取工具
export const extractTextFromPDF = async (file) => {
  try {
    console.log('🔍 开始提取PDF文本:', file.name);
    
    // 检查PDF.js是否可用
    if (!window.pdfjsLib) {
      throw new Error('PDF.js库未加载');
    }

    // 将文件转换为ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // 加载PDF文档
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    console.log(`📖 PDF加载成功，共 ${pdf.numPages} 页`);
    
    let fullText = '';
    
    // 逐页提取文本
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // 将文本项组合成字符串
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ')
          .trim();
        
        if (pageText) {
          fullText += `\n\n=== 第${pageNum}页 ===\n${pageText}`;
          console.log(`✅ 第${pageNum}页文本提取成功，长度: ${pageText.length}`);
        }
      } catch (pageError) {
        console.error(`❌ 第${pageNum}页文本提取失败:`, pageError);
      }
    }
    
    if (fullText.trim()) {
      console.log(`🎉 PDF文本提取完成，总长度: ${fullText.length}`);
      return {
        success: true,
        text: fullText.trim(),
        pageCount: pdf.numPages
      };
    } else {
      throw new Error('PDF中没有提取到任何文本');
    }
    
  } catch (error) {
    console.error('❌ PDF文本提取失败:', error);
    return {
      success: false,
      error: error.message,
      text: null
    };
  }
};

// 检查文件是否为PDF
export const isPDFFile = (file) => {
  return file.type === 'application/pdf' || 
         file.name.toLowerCase().endsWith('.pdf');
};

// 格式化PDF文本用于RAG
export const formatPDFTextForRAG = (fileName, extractedText, pageCount) => {
  return `PDF文档: ${fileName}
页数: ${pageCount}
内容:
${extractedText}

--- PDF文档结束 ---`;
}; 