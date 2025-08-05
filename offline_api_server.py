#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
离线RAG系统API服务器
支持离线模式，不依赖HuggingFace模型
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import uvicorn
import json
import os

# 导入简化的RAG系统
from rag_system import RAGSystem

app = FastAPI(title="离线RAG系统API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

rag_system = None

class QueryRequest(BaseModel):
    question: str
    top_k_retrieve: Optional[int] = 20
    top_k_final: Optional[int] = 5

class QueryResponse(BaseModel):
    question: str
    answer: str
    relevant_docs: List[str]
    scores: List[float]
    mode: str

class BuildRequest(BaseModel):
    student_csv: Optional[str] = "data/students.csv"
    plan_txt: Optional[str] = "data/cultivation_plan.txt"

@app.on_event("startup")
async def startup_event():
    global rag_system
    print("🚀 初始化离线RAG系统...")
    try:
        # 使用简化的模型名称，系统会自动切换到TF-IDF模式
        rag_system = RAGSystem(
            bi_encoder_model="local_model",  # 这会触发离线模式
            cross_encoder_model="local_model"  # 这会触发离线模式
        )
        print("✅ 离线RAG系统初始化完成")
    except Exception as e:
        print(f"❌ RAG系统初始化失败: {e}")
        rag_system = None

@app.get("/")
async def root():
    return {
        "message": "离线RAG系统API服务", 
        "status": "running",
        "mode": "offline",
        "version": "1.0.0"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "rag_system_initialized": rag_system is not None,
        "mode": "offline"
    }

@app.post("/api/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    try:
        if not rag_system:
            raise HTTPException(status_code=500, detail="RAG系统未初始化")
        
        print(f"🔍 处理查询: {request.question}")
        
        result = rag_system.query(
            question=request.question,
            top_k_retrieve=request.top_k_retrieve,
            top_k_final=request.top_k_final
        )
        
        # 添加模式信息
        result["mode"] = "offline"
        
        return QueryResponse(**result)
        
    except Exception as e:
        print(f"❌ 查询失败: {e}")
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")

@app.post("/api/build_knowledge_base")
async def build_knowledge_base(request: BuildRequest):
    try:
        if not rag_system:
            raise HTTPException(status_code=500, detail="RAG系统未初始化")
        
        print("🔨 开始构建知识库...")
        
        # 检查文件是否存在
        if not os.path.exists(request.student_csv):
            return {"error": f"学生数据文件不存在: {request.student_csv}"}
        
        if not os.path.exists(request.plan_txt):
            return {"error": f"培养方案文件不存在: {request.plan_txt}"}
        
        rag_system.build_knowledge_base(
            student_csv=request.student_csv,
            plan_txt=request.plan_txt
        )
        
        return {"message": "知识库构建成功", "mode": "offline"}
        
    except Exception as e:
        print(f"❌ 构建失败: {e}")
        raise HTTPException(status_code=500, detail=f"构建失败: {str(e)}")

@app.get("/api/system_info")
async def system_info():
    """获取系统信息"""
    return {
        "system": "离线RAG系统",
        "version": "1.0.0",
        "mode": "offline",
        "features": [
            "TF-IDF向量化",
            "余弦相似度检索",
            "本地向量数据库",
            "无需网络连接"
        ],
        "status": "running" if rag_system else "not_initialized"
    }

@app.get("/api/test")
async def test_query():
    """测试查询"""
    test_question = "什么是计算机科学专业？"
    try:
        if not rag_system:
            return {"error": "RAG系统未初始化"}
        
        result = rag_system.query(question=test_question)
        result["mode"] = "offline"
        return result
        
    except Exception as e:
        return {"error": f"测试失败: {str(e)}"}

if __name__ == "__main__":
    print("🚀 启动离线RAG API服务器...")
    print("📡 服务器地址: http://localhost:8000")
    print("🔗 API文档: http://localhost:8000/docs")
    uvicorn.run("offline_api_server:app", host="0.0.0.0", port=8000, reload=True) 