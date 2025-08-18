import json

def handler(request):
    # 处理CORS预检请求
    if request.get('method') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    try:
        # 解析请求体
        body = request.get('body', '{}')
        if isinstance(body, str):
            request_data = json.loads(body)
        else:
            request_data = body
            
        question = request_data.get('question', '').lower()
        
        # 简单的知识库
        knowledge_base = [
            "重庆邮电大学是一所以信息科技为特色的高校，在通信工程领域具有较高声誉",
            "重庆邮电大学软件工程专业是国家级一流专业建设点",
            "机械工程专业毕业生主要就业方向包括制造业、汽车行业、航空航天等",
            "三一重工是中国工程机械行业的龙头企业，提供良好的职业发展机会",
            "计算机专业学生建议掌握编程语言、数据结构、算法等核心技能",
            "心理调节能力对应对工作压力很重要，建议培养兴趣爱好"
        ]
        
        # 简单的关键词匹配
        relevant_docs = []
        scores = []
        
        for doc in knowledge_base:
            score = 0
            words = question.split()
            for word in words:
                if word in doc.lower():
                    score += 1
            
            if score > 0:
                relevant_docs.append(doc)
                scores.append(score / len(words) if words else 0)
        
        # 排序并取前3个
        if relevant_docs:
            paired = list(zip(relevant_docs, scores))
            paired.sort(key=lambda x: x[1], reverse=True)
            relevant_docs = [doc for doc, _ in paired[:3]]
            scores = [score for _, score in paired[:3]]
        else:
            relevant_docs = ["抱歉，没有找到相关信息"]
            scores = [0.0]
        
        response = {
            "question": request_data.get('question', ''),
            "answer": f"基于知识库检索到 {len(relevant_docs)} 条相关信息",
            "relevant_docs": relevant_docs,
            "scores": scores
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(response, ensure_ascii=False)
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({"error": f"查询失败: {str(e)}"})
        }