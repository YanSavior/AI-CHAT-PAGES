#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RAG系统API服务器 - Vercel版本
简化版本，先确保基本部署成功
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
import sys

app = FastAPI(title="RAG系统API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str
    top_k_retrieve: Optional[int] = 20
    top_k_final: Optional[int] = 5

class QueryResponse(BaseModel):
    question: str
    answer: str
    relevant_docs: List[str]
    scores: List[float]

@app.get("/")
async def root():
    return {"message": "RAG系统API服务", "status": "running"}

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "API服务正常运行"
    }

@app.post("/api/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    try:
        # 简化的RAG实现：基于关键词匹配
        question = request.question.lower()
        
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
                scores.append(score / len(words))
        
        # 排序并取前N个
        if relevant_docs:
            paired = list(zip(relevant_docs, scores))
            paired.sort(key=lambda x: x[1], reverse=True)
            relevant_docs = [doc for doc, _ in paired[:request.top_k_final]]
            scores = [score for _, score in paired[:request.top_k_final]]
        else:
            relevant_docs = ["抱歉，没有找到相关信息"]
            scores = [0.0]
        
        return QueryResponse(
            question=request.question,
            answer=f"基于知识库检索到 {len(relevant_docs)} 条相关信息",
            relevant_docs=relevant_docs,
            scores=scores
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")

@app.post("/api/build_knowledge_base")
async def build_knowledge_base():
    try:
        return {"message": "知识库构建功能正在开发中"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"构建失败: {str(e)}")

# Vercel需要这个函数
def handler(request, context):
    """Vercel函数处理器"""
    return app(request, context)

# 本地开发时使用
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 