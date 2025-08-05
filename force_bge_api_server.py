#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
强制BGE模型的RAG系统API服务器
尝试使用BGE模型，如果失败会提供详细错误信息
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import uvicorn
import json
import os

# 导入RAG系统
from rag_system import RAGSystem

app = FastAPI(title="BGE RAG系统API", version="1.0.0")

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
    model_info: Dict

class BuildRequest(BaseModel):
    student_csv: Optional[str] = "data/students.csv"
    plan_txt: Optional[str] = "data/cultivation_plan.txt"

@app.on_event("startup")
async def startup_event():
    global rag_system
    print("🚀 初始化BGE RAG系统...")
    try:
        # 强制使用BGE模型
        rag_system = RAGSystem(
            bi_encoder_model="BAAI/bge-small-zh-v1.5",
            cross_encoder_model="BAAI/bge-reranker-v2-m3"
        )
        print("✅ BGE RAG系统初始化完成")
    except Exception as e:
        print(f"❌ BGE RAG系统初始化失败: {e}")
        rag_system = None

@app.get("/")
async def root():
    return {
        "message": "BGE RAG系统API服务", 
        "status": "running",
        "mode": "bge_force",
        "version": "1.0.0",
        "note": "强制使用BGE模型，需要网络连接"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy" if rag_system else "failed",
        "rag_system_initialized": rag_system is not None,
        "mode": "bge_force",
        "network_required": True
    }

@app.get("/api/model_info")
async def model_info():
    """获取模型信息"""
    if not rag_system:
        return {"error": "RAG系统未初始化"}
    
    try:
        bi_encoder_info = rag_system.vectorizer.bi_encoder.get_model_info()
        cross_encoder_info = rag_system.vectorizer.cross_encoder.get_model_info()
        
        return {
            "bi_encoder": bi_encoder_info,
            "cross_encoder": cross_encoder_info,
            "system_status": "running"
        }
    except Exception as e:
        return {"error": f"获取模型信息失败: {str(e)}"}

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
        
        # 添加模型信息
        bi_encoder_info = rag_system.vectorizer.bi_encoder.get_model_info()
        cross_encoder_info = rag_system.vectorizer.cross_encoder.get_model_info()
        
        result["model_info"] = {
            "bi_encoder": bi_encoder_info,
            "cross_encoder": cross_encoder_info
        }
        
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
        
        return {"message": "知识库构建成功", "mode": "bge_force"}
        
    except Exception as e:
        print(f"❌ 构建失败: {e}")
        raise HTTPException(status_code=500, detail=f"构建失败: {str(e)}")

@app.get("/api/system_info")
async def system_info():
    """获取系统信息"""
    return {
        "system": "BGE RAG系统",
        "version": "1.0.0",
        "mode": "bge_force",
        "features": [
            "BGE Bi-Encoder向量化",
            "BGE Cross-Encoder重排",
            "本地向量数据库",
            "需要网络连接下载模型"
        ],
        "status": "running" if rag_system else "failed",
        "network_required": True
    }

@app.get("/api/test")
async def test_query():
    """测试查询"""
    test_question = "什么是计算机科学专业？"
    try:
        if not rag_system:
            return {"error": "RAG系统未初始化"}
        
        result = rag_system.query(question=test_question)
        
        # 添加模型信息
        bi_encoder_info = rag_system.vectorizer.bi_encoder.get_model_info()
        cross_encoder_info = rag_system.vectorizer.cross_encoder.get_model_info()
        
        result["model_info"] = {
            "bi_encoder": bi_encoder_info,
            "cross_encoder": cross_encoder_info
        }
        
        return result
        
    except Exception as e:
        return {"error": f"测试失败: {str(e)}"}

if __name__ == "__main__":
    print("🚀 启动BGE RAG API服务器...")
    print("📡 服务器地址: http://localhost:8001")
    print("🔗 API文档: http://localhost:8001/docs")
    print("⚠️  注意：需要网络连接下载BGE模型")
    uvicorn.run("force_bge_api_server:app", host="0.0.0.0", port=8001, reload=True) 