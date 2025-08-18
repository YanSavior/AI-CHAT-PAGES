from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 简单的知识库
KNOWLEDGE_BASE = [
    "重庆邮电大学是一所以信息科技为特色的高校，在通信工程领域具有较高声誉",
    "重庆邮电大学软件工程专业是国家级一流专业建设点",
    "机械工程专业毕业生主要就业方向包括制造业、汽车行业、航空航天等",
    "三一重工是中国工程机械行业的龙头企业，提供良好的职业发展机会",
    "计算机专业学生建议掌握编程语言、数据结构、算法等核心技能",
    "心理调节能力对应对工作压力很重要，建议培养兴趣爱好"
]

@app.route('/')
def root():
    return jsonify({"message": "RAG API服务", "status": "running"})

@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy", "message": "API服务正常运行"})

@app.route('/api/query', methods=['POST'])
def query():
    try:
        data = request.get_json()
        question = data.get('question', '').lower()
        top_k_final = data.get('top_k_final', 3)
        
        # 简单的关键词匹配
        relevant_docs = []
        scores = []
        
        for doc in KNOWLEDGE_BASE:
            score = 0
            words = question.split()
            for word in words:
                if word in doc.lower():
                    score += 1
            
            if score > 0:
                relevant_docs.append(doc)
                scores.append(score / len(words) if words else 0)
        
        # 排序并取前N个
        if relevant_docs:
            paired = list(zip(relevant_docs, scores))
            paired.sort(key=lambda x: x[1], reverse=True)
            relevant_docs = [doc for doc, _ in paired[:top_k_final]]
            scores = [score for _, score in paired[:top_k_final]]
        else:
            relevant_docs = ["抱歉，没有找到相关信息"]
            scores = [0.0]
        
        return jsonify({
            "question": data.get('question', ''),
            "answer": f"基于知识库检索到 {len(relevant_docs)} 条相关信息",
            "relevant_docs": relevant_docs,
            "scores": scores
        })
        
    except Exception as e:
        return jsonify({"error": f"查询失败: {str(e)}"}), 500

# Vercel处理器
def handler(event, context):
    return app