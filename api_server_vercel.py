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
        # 简化的响应，暂时不包含RAG功能
        return QueryResponse(
            question=request.question,
            answer="这是一个测试响应。RAG功能正在开发中。",
            relevant_docs=["测试文档1", "测试文档2"],
            scores=[0.8, 0.6]
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