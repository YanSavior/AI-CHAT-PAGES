import os
import json
from PyPDF2 import PdfReader

# PDF文件所在目录
pdf_dir = os.path.join(os.path.dirname(__file__), '../培养方案')
# 输出JSON文件也放在同一目录

for filename in os.listdir(pdf_dir):
    if filename.lower().endswith('.pdf'):
        pdf_path = os.path.join(pdf_dir, filename)
        json_path = os.path.splitext(pdf_path)[0] + '.json'
        try:
            reader = PdfReader(pdf_path)
            pages = [page.extract_text() for page in reader.pages]
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(pages, f, ensure_ascii=False, indent=2)
            print(f"已保存: {json_path}")
        except Exception as e:
            print(f"处理 {filename} 时出错: {e}") 