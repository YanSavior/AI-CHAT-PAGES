#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RAG API服务器 - 连接前端和RAGflow的中间层
前端 → 本API → RAGflow → 本API → 前端
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import httpx
import asyncio
import json
import os
import logging
from datetime import datetime

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="RAG API服务器",
    description="连接前端聊天界面和RAGflow的中间层API",
    version="1.0.0"
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境中应该限制为具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# RAGflow配置
RAGFLOW_CONFIG = {
    "base_url": os.getenv("RAGFLOW_API_URL", "http://localhost:9380"),
    "token": os.getenv("RAGFLOW_TOKEN", ""),
    "timeout": 30.0
}

# 请求模型
class QueryRequest(BaseModel):
    question: str
    conversation_id: Optional[str] = None
    quote: Optional[bool] = True
    stream: Optional[bool] = False
    temperature: Optional[float] = 0.1
    top_p: Optional[float] = 0.3
    max_tokens: Optional[int] = 512

class QueryResponse(BaseModel):
    question: str
    answer: str
    relevant_docs: List[str]
    scores: List[float]
    conversation_id: str
    reference: List[Dict[str, Any]]
    processing_time: float
    source: str = "ragflow"

# RAGflow客户端类
class RAGflowClient:
    def __init__(self):
        self.base_url = RAGFLOW_CONFIG["base_url"]
        self.token = RAGFLOW_CONFIG["token"]
        self.timeout = RAGFLOW_CONFIG["timeout"]
        
        # 设置请求头
        self.headers = {
            "Content-Type": "application/json"
        }
        if self.token:
            self.headers["Authorization"] = f"Bearer {self.token}"
    
    async def health_check(self):
        """检查RAGflow服务健康状态"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(
                    f"{self.base_url}/api/v1/health",
                    headers=self.headers
                )
                response.raise_for_status()
                return response.json()
        except Exception as e:
            logger.error(f"RAGflow健康检查失败: {e}")
            raise HTTPException(status_code=503, detail=f"RAGflow服务不可用: {str(e)}")
    
    async def query(self, request: QueryRequest):
        """向RAGflow发送查询请求"""
        try:
            start_time = datetime.now()
            
            # 构建RAGflow请求数据
            ragflow_request = {
                "question": request.question,
                "conversation_id": request.conversation_id or self.generate_conversation_id(),
                "quote": request.quote,
                "stream": request.stream,
                "temperature": request.temperature,
                "top_p": request.top_p,
                "max_tokens": request.max_tokens
            }
            
            logger.info(f"发送请求到RAGflow: {ragflow_request}")
            
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/api/v1/completion",
                    headers=self.headers,
                    json=ragflow_request
                )
                response.raise_for_status()
                ragflow_response = response.json()
            
            processing_time = (datetime.now() - start_time).total_seconds()
            logger.info(f"RAGflow响应成功，耗时: {processing_time:.2f}秒")
            
            # 格式化响应
            return self.format_response(ragflow_response, request.question, processing_time)
            
        except httpx.HTTPStatusError as e:
            logger.error(f"RAGflow API错误: {e.response.status_code} - {e.response.text}")
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"RAGflow API错误: {e.response.text}"
            )
        except Exception as e:
            logger.error(f"查询RAGflow失败: {e}")
            raise HTTPException(status_code=500, detail=f"查询失败: {str(e)}")
    
    def format_response(self, ragflow_response: dict, original_question: str, processing_time: float) -> QueryResponse:
        """格式化RAGflow响应为标准格式"""
        try:
            # 提取回答
            answer = ragflow_response.get("answer", "")
            if not answer:
                answer = ragflow_response.get("data", {}).get("answer", "抱歉，没有找到相关回答")
            
            # 提取相关文档
            relevant_docs = []
            scores = []
            reference = []
            
            # 处理引用信息
            if "reference" in ragflow_response and isinstance(ragflow_response["reference"], list):
                reference = ragflow_response["reference"]
                for ref in reference:
                    # 提取文档内容
                    content = ref.get("content") or ref.get("chunk_content") or ref.get("text", "")
                    if content:
                        relevant_docs.append(content)
                        scores.append(ref.get("similarity", ref.get("score", 0.8)))
            
            # 如果没有reference，尝试从chunks中提取
            elif "chunks" in ragflow_response and isinstance(ragflow_response["chunks"], list):
                for chunk in ragflow_response["chunks"]:
                    content = chunk.get("content") or chunk.get("text", "")
                    if content:
                        relevant_docs.append(content)
                        scores.append(chunk.get("similarity", chunk.get("score", 0.8)))
            
            # 获取对话ID
            conversation_id = ragflow_response.get("conversation_id", self.generate_conversation_id())
            
            return QueryResponse(
                question=original_question,
                answer=answer,
                relevant_docs=relevant_docs,
                scores=scores,
                conversation_id=conversation_id,
                reference=reference,
                processing_time=processing_time
            )
            
        except Exception as e:
            logger.error(f"格式化响应失败: {e}")
            # 返回基本响应
            return QueryResponse(
                question=original_question,
                answer=ragflow_response.get("answer", "处理响应时出现错误"),
                relevant_docs=[],
                scores=[],
                conversation_id=ragflow_response.get("conversation_id", self.generate_conversation_id()),
                reference=[],
                processing_time=processing_time
            )
    
    def generate_conversation_id(self) -> str:
        """生成对话ID"""
        import uuid
        return f"conv_{int(datetime.now().timestamp())}_{str(uuid.uuid4())[:8]}"

# 创建RAGflow客户端实例
ragflow_client = RAGflowClient()

# API路由
@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "RAG API服务器运行中",
        "version": "1.0.0",
        "ragflow_url": RAGFLOW_CONFIG["base_url"],
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/health")
async def health_check():
    """健康检查"""
    try:
        # 检查RAGflow连接
        ragflow_health = await ragflow_client.health_check()
        
        return {
            "status": "healthy",
            "message": "RAG API服务正常运行",
            "ragflow_status": "connected",
            "ragflow_health": ragflow_health,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "degraded",
            "message": "RAG API服务运行中，但RAGflow连接异常",
            "ragflow_status": "disconnected",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

@app.post("/api/query", response_model=QueryResponse)
async def query_rag(request: QueryRequest):
    """
    RAG查询接口
    前端发送问题 → 本API → RAGflow → 本API → 前端
    """
    try:
        logger.info(f"收到查询请求: {request.question}")
        
        # 验证请求
        if not request.question or not request.question.strip():
            raise HTTPException(status_code=400, detail="问题不能为空")
        
        # 调用RAGflow
        response = await ragflow_client.query(request)
        
        logger.info(f"查询完成，返回 {len(response.relevant_docs)} 个相关文档")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"查询处理失败: {e}")
        raise HTTPException(status_code=500, detail=f"查询处理失败: {str(e)}")

@app.get("/api/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    """获取对话历史（如果RAGflow支持）"""
    try:
        # 这里可以实现获取对话历史的逻辑
        # 具体实现取决于RAGflow的API
        return {
            "conversation_id": conversation_id,
            "message": "对话历史功能待实现",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """删除对话（如果RAGflow支持）"""
    try:
        # 这里可以实现删除对话的逻辑
        return {
            "message": f"对话 {conversation_id} 删除成功",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 启动配置
if __name__ == "__main__":
    import uvicorn
    
    # 从环境变量获取配置
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    
    print(f"🚀 启动RAG API服务器...")
    print(f"📍 服务地址: http://{host}:{port}")
    print(f"🔗 RAGflow地址: {RAGFLOW_CONFIG['base_url']}")
    print(f"📚 API文档: http://{host}:{port}/docs")
    
    uvicorn.run(
        "rag_api_server:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )