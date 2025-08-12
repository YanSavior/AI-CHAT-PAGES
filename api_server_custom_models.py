#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RAG系统API服务器（自定义模型路径版本）
提供RESTful API接口
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import uvicorn
import os

from rag_system import RAGSystem

app = FastAPI(title="RAG系统API", version="1.0.0")

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

@app.on_event("startup")
async def startup_event():
    global rag_system
    print("初始化RAG系统...")
    
    # 使用自定义模型路径
    bi_encoder_path = "D:/bge_models/bge-small-zh-v1.5"
    cross_encoder_path = "D:/bge_models/bge-reranker-v2-m3"
    
    # 检查模型路径
    if not os.path.exists(bi_encoder_path):
        print(f"❌ Bi-Encoder模型路径不存在: {bi_encoder_path}")
        raise Exception("Bi-Encoder模型路径不存在")
    
    if not os.path.exists(cross_encoder_path):
        print(f"❌ Cross-Encoder模型路径不存在: {cross_encoder_path}")
        raise Exception("Cross-Encoder模型路径不存在")
    
    print(f"✅ 使用Bi-Encoder模型: {bi_encoder_path}")
    print(f"✅ 使用Cross-Encoder模型: {cross_encoder_path}")
    
    try:
        rag_system = RAGSystem(
            bi_encoder_model=bi_encoder_path,
            cross_encoder_model=cross_encoder_path,
            persist_directory="./vector_db"
        )
        print("✅ RAG系统初始化完成")
    except Exception as e:
        print(f"❌ RAG系统初始化失败: {e}")
        raise e

@app.get("/")
async def root():
    return {"message": "RAG系统API服务", "status": "running"}

@app.post("/api/query", response_model=QueryResponse)
async def query(request: QueryRequest):
    try:
        if not rag_system:
            raise HTTPException(status_code=500, detail="RAG系统未初始化")
        
        result = rag_system.query(
            question=request.question,
            top_k_retrieve=request.top_k_retrieve,
            top_k_final=request.top_k_final
        )
        
        return QueryResponse(**result)
        
    except Exception as e:
        print(f"查询错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")

@app.post("/api/build_knowledge_base")
async def build_knowledge_base():
    try:
        if not rag_system:
            raise HTTPException(status_code=500, detail="RAG系统未初始化")
        
        # 检查文件是否存在
        student_csv = "data/students.csv"
        plan_txt = "data/cultivation_plan.txt"
        
        if not os.path.exists(student_csv):
            raise HTTPException(status_code=400, detail=f"学生数据文件不存在: {student_csv}")
        
        if not os.path.exists(plan_txt):
            raise HTTPException(status_code=400, detail=f"培养方案文件不存在: {plan_txt}")
        
        print(f"开始构建知识库...")
        print(f"使用学生数据文件: {student_csv}")
        print(f"使用培养方案文件: {plan_txt}")
        
        rag_system.build_knowledge_base(
            student_csv=student_csv,
            plan_txt=plan_txt
        )
        
        return {"message": "知识库构建成功"}
        
    except Exception as e:
        print(f"构建知识库错误: {str(e)}")
        raise HTTPException(status_code=500, detail=f"构建失败: {str(e)}")

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "rag_system_initialized": rag_system is not None
    }

if __name__ == "__main__":
    uvicorn.run("api_server_custom_models:app", host="0.0.0.0", port=8000, reload=True) 