---
outline: [2, 3]
---

# 第12章 服务部署与工程化

## 本章你能带走什么

你有没有这种感觉：跟着教程跑了几个Demo，代码能跑通了，心里美滋滋的。然后你想把成果分享给同事或者部署上线——

"等等，这玩意儿怎么部署？"

"怎么让其他人也能用？"

"上线之后服务挂了怎么办？"

这是AI应用开发最容易被忽视、但又至关重要的环节。多少人跟面试官吹自己"独立负责RAG系统"，结果一问"怎么部署的"、"QPS多少"、"怎么做容灾"，就支支吾吾了。

这一章，我会用一个真实项目的架构演进过程，带你完成从本地Demo到生产环境的完整旅程。不是什么"五大支柱"的概念罗列，而是一个具体项目是怎么一步步从单文件脚本，走到日均百万调用的生产系统的。

读完这章，你会带走：
- FastAPI的完整实战经验（不是Hello World）
- Docker容器化AI应用的独门秘籍（GPU透传、大模型分层）
- 异步编程和流式响应的实战方法（SSE vs WebSocket怎么选）
- AI应用特有的监控指标（Token消耗、幻觉率、工具调用成功率）
- 用vLLM部署私有模型服务的完整流程
- 一个真实项目的架构演进思维（这才是面试加分项）

准备好了吗？我们开始。

---

## 12.1 FastAPI搭建AI服务接口

### 为什么是FastAPI？

在Python Web框架领域，Flask和Django是老牌选手。但对于AI应用开发，FastAPI几乎是唯一选择，原因很简单：

- **性能炸裂**：基于Starlette异步框架，单节点QPS可达3000+
- **原生异步**：完美支持async/await，处理高并发AI请求游刃有余
- **类型安全**：深度集成Pydantic，请求/响应自动校验
- **自动文档**：Swagger UI和ReDoc自动生成，不用单独维护
- **生态友好**：LangChain、LlamaIndex、vLLM这些框架对FastAPI的支持最好

> 💡 一句话：Flask是手动挡，FastAPI是自动挡，AI应用场景下自动挡完胜。

### 安装和环境

```bash
pip install fastapi uvicorn[standard] pydantic pydantic-settings
```

运行环境：Python 3.9+，FastAPI 0.110+

### 完整项目结构：不是Hello World

先看一个**真实可用**的项目结构，而不是教材里的单文件示例：

```
ai-chat-service/
├── main.py                      # 应用入口
├── config.py                    # 配置管理（从环境变量读取）
├── routers/                      # 路由模块
│   ├── __init__.py
│   ├── chat.py                  # 对话接口
│   ├── rag.py                   # RAG检索接口
│   └── admin.py                 # 管理接口
├── services/                    # 业务逻辑层
│   ├── __init__.py
│   ├── llm_service.py           # 大模型服务（封装LLM调用）
│   ├── vector_service.py        # 向量检索服务
│   └── conversation_manager.py  # 会话管理
├── models/                      # 数据模型
│   ├── __init__.py
│   ├── schemas.py               # Pydantic请求/响应模型
│   └── db_models.py            # 数据库模型（可选）
├── middleware/                   # 中间件
│   ├── __init__.py
│   ├── auth.py                  # 认证中间件
│   └── logging.py              # 日志中间件
├── utils/                       # 工具函数
│   ├── __init__.py
│   └── logger.py               # 日志配置
├── core/                        # 核心依赖
│   ├── __init__.py
│   └── dependencies.py         # 依赖注入定义
├── tests/                       # 测试
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── .env.example                # 环境变量示例
```

这个结构有三个关键点：
1. **路由和服务分离**：路由只处理HTTP，服务层处理业务逻辑，方便测试
2. **依赖注入集中管理**：认证、数据库连接等通过Depends注入
3. **配置从环境变量读取**：12-Factor App原则，方便部署

### 配置管理：12-Factor App

```python
"""
config.py - 配置管理
遵循12-Factor App原则，配置从环境变量读取
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """应用配置"""
    
    # 应用信息
    APP_NAME: str = "AI Chat Service"
    VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # 服务配置
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # 大模型配置
    LLM_PROVIDER: str = "openai"  # openai / azure / vllm / anthropic
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_API_KEY: str = ""
    LLM_BASE_URL: str = "https://api.openai.com/v1"
    LLM_TIMEOUT: int = 60  # 秒
    
    # 向量数据库配置
    VECTOR_DB_TYPE: str = "chroma"  # chroma / qdrant / milvus
    VECTOR_DB_PATH: str = "./data/chroma_db"
    EMBEDDING_MODEL: str = "text-embedding-3-small"
    
    # Redis配置（会话缓存）
    REDIS_URL: str = "redis://localhost:6379"
    SESSION_EXPIRE_SECONDS: int = 3600
    
    # 安全配置
    API_KEY_HEADER: str = "X-API-Key"
    ALLOWED_ORIGINS: list[str] = ["*"]
    
    # 限流配置
    RATE_LIMIT_PER_MINUTE: int = 60
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """获取配置单例"""
    return Settings()
```

### Pydantic数据模型：请求校验的核心

```python
"""
models/schemas.py - Pydantic数据模型
"""

from pydantic import BaseModel, Field, model_validator
from typing import Optional, Literal
from datetime import datetime


class ChatMessage(BaseModel):
    """单条消息"""
    role: Literal["system", "user", "assistant"] = Field(..., description="角色")
    content: str = Field(..., min_length=1, max_length=10000, description="消息内容")
    
    @field_validator("content")
    @classmethod
    def strip_content(cls, v: str) -> str:
        """自动去除首尾空白"""
        return v.strip()


class ChatRequest(BaseModel):
    """对话请求"""
    messages: list[ChatMessage] = Field(..., min_length=1, description="消息历史")
    session_id: Optional[str] = Field(None, description="会话ID，用于上下文关联")
    
    temperature: float = Field(default=0.7, ge=0.0, le=2.0, description="温度参数")
    max_tokens: int = Field(default=2048, ge=1, le=8192, description="最大生成token数")
    stream: bool = Field(default=False, description="是否流式输出")
    
    @model_validator(mode="after")
    def validate_messages(self) -> "ChatRequest":
        """确保消息列表以user消息结尾（对话逻辑）"""
        if self.messages[-1].role != "user":
            raise ValueError("最后一条消息必须是用户消息")
        return self


class ChatResponse(BaseModel):
    """对话响应（非流式）"""
    response: str = Field(..., description="AI回复内容")
    session_id: str = Field(..., description="会话ID")
    model: str = Field(..., description="使用的模型")
    usage: "TokenUsage" = Field(..., description="Token使用量")
    latency_ms: int = Field(..., description="响应延迟（毫秒）")
    created_at: datetime = Field(default_factory=datetime.now, description="创建时间")


class TokenUsage(BaseModel):
    """Token使用量"""
    prompt_tokens: int = Field(..., ge=0, description="输入token数")
    completion_tokens: int = Field(..., ge=0, description="输出token数")
    total_tokens: int = Field(..., ge=0, description="总token数")


class RAGRequest(BaseModel):
    """RAG检索请求"""
    query: str = Field(..., min_length=1, max_length=1000, description="检索问题")
    top_k: int = Field(default=5, ge=1, le=20, description="返回文档数量")
    filter_metadata: Optional[dict] = Field(None, description="元数据过滤条件")
    mode: Literal["semantic", "keyword", "hybrid"] = Field(default="hybrid", description="检索模式")
    
    @field_validator("query")
    @classmethod
    def query_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("查询不能为空")
        return v.strip()


class RAGResponse(BaseModel):
    """RAG检索响应"""
    answer: str = Field(..., description="基于检索结果的回答")
    sources: list["DocumentChunk"] = Field(..., description="引用的文档片段")
    retrieval_time_ms: int = Field(..., description="检索耗时")


class DocumentChunk(BaseModel):
    """文档片段"""
    content: str = Field(..., description="文档内容")
    score: float = Field(..., ge=0, le=1, description="相似度分数")
    metadata: dict = Field(default_factory=dict, description="元数据")
```

### 依赖注入：让AI服务更优雅

依赖注入是FastAPI的精髓。用好了，代码解耦、测试方便、逻辑清晰。在AI场景下，有几个经典用法：

```python
"""
core/dependencies.py - 依赖注入
"""

from fastapi import Depends, HTTPException, Header, Request
from typing import AsyncGenerator, Optional
import httpx
import redis.asyncio as redis
from functools import lru_cache

from config import get_settings
from services.llm_service import LLMService
from services.vector_service import VectorService
from services.conversation_manager import ConversationManager

settings = get_settings()


# ============ HTTP客户端依赖 ============

@lru_cache()
def get_http_client() -> httpx.AsyncClient:
    """HTTP客户端单例"""
    return httpx.AsyncClient(
        timeout=httpx.Timeout(settings.LLM_TIMEOUT, connect=5.0),
        limits=httpx.Limits(max_keepalive_connections=20, max_connections=100)
    )


# ============ 认证依赖 ============

async def verify_api_key(
    x_api_key: Optional[str] = Header(None, alias=settings.API_KEY_HEADER)
) -> dict:
    """验证API Key"""
    if not x_api_key:
        raise HTTPException(
            status_code=401,
            detail=f"缺少API Key，请通过 {settings.API_KEY_HEADER} header传递"
        )
    
    # 实际项目：查数据库验证
    # 这里用简化逻辑
    if not x_api_key.startswith("sk-"):
        raise HTTPException(status_code=401, detail="无效的API Key格式")
    
    return {"api_key": x_api_key, "tier": "basic"}


async def verify_admin_key(
    api_key: dict = Depends(verify_api_key)
) -> dict:
    """验证管理员权限"""
    admin_keys = ["sk-admin-xxx", "sk-admin-yyy"]
    if api_key["api_key"] not in admin_keys:
        raise HTTPException(status_code=403, detail="需要管理员权限")
    return api_key


# ============ 服务层依赖 ============

async def get_llm_service(
    http_client: httpx.AsyncClient = Depends(get_http_client)
) -> LLMService:
    """获取LLM服务实例"""
    return LLMService(http_client=http_client)


async def get_vector_service() -> VectorService:
    """获取向量检索服务"""
    return VectorService()


async def get_conversation_manager() -> ConversationManager:
    """获取会话管理器（带Redis连接）"""
    redis_client = redis.from_url(
        settings.REDIS_URL,
        encoding="utf-8",
        decode_responses=True
    )
    return ConversationManager(redis_client)


# ============ 请求上下文依赖 ============

async def get_request_id(request: Request) -> str:
    """获取请求ID（用于链路追踪）"""
    return request.state.request_id if hasattr(request.state, "request_id") else "unknown"
```

### 服务层实现

```python
"""
services/llm_service.py - 大模型服务封装
"""

import time
import json
from typing import AsyncGenerator, Optional
import httpx

from models.schemas import ChatMessage, TokenUsage


class LLMService:
    """大模型服务封装"""
    
    def __init__(self, http_client: httpx.AsyncClient):
        self.http_client = http_client
        self.base_url = "https://api.openai.com/v1"
        self.model = "gpt-4o-mini"
        self.api_key = ""
    
    async def chat(
        self,
        messages: list[ChatMessage],
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> tuple[str, TokenUsage, int]:
        """同步调用（返回完整响应）"""
        start_time = time.time()
        
        payload = {
            "model": self.model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        response = await self.http_client.post(
            f"{self.base_url}/chat/completions",
            json=payload,
            headers=headers
        )
        response.raise_for_status()
        
        data = response.json()
        latency_ms = int((time.time() - start_time) * 1000)
        
        content = data["choices"][0]["message"]["content"]
        usage = TokenUsage(
            prompt_tokens=data["usage"]["prompt_tokens"],
            completion_tokens=data["usage"]["completion_tokens"],
            total_tokens=data["usage"]["total_tokens"]
        )
        
        return content, usage, latency_ms
    
    async def stream_chat(
        self,
        messages: list[ChatMessage],
        temperature: float = 0.7,
        max_tokens: int = 2048
    ) -> AsyncGenerator[dict, None]:
        """流式调用（逐块返回）"""
        payload = {
            "model": self.model,
            "messages": [{"role": m.role, "content": m.content} for m in messages],
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        async with self.http_client.stream(
            "POST",
            f"{self.base_url}/chat/completions",
            json=payload,
            headers=headers
        ) as response:
            response.raise_for_status()
            
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    if line.startswith("data: [DONE]"):
                        yield {"type": "done"}
                        break
                    
                    data = json.loads(line[6:])
                    if chunk := data["choices"][0].get("delta", {}).get("content"):
                        yield {"type": "content", "content": chunk}
```

### 路由层实现

```python
"""
routers/chat.py - 对话路由
"""

from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
import time

from models.schemas import ChatRequest, ChatResponse, TokenUsage
from services.llm_service import LLMService
from services.conversation_manager import ConversationManager
from core.dependencies import verify_api_key, get_llm_service, get_conversation_manager, get_request_id
from utils.logger import logger

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    api_key: dict = Depends(verify_api_key),
    llm_service: LLMService = Depends(get_llm_service),
    conversation_mgr: ConversationManager = Depends(get_conversation_manager),
    request_id: str = Depends(get_request_id)
):
    """对话接口"""
    logger.info(
        f"收到对话请求",
        extra={
            "request_id": request_id,
            "api_key_tier": api_key["tier"],
            "message_count": len(request.messages),
            "stream": request.stream
        }
    )
    
    # 如果有session_id，加载历史上下文
    messages = request.messages
    if request.session_id:
        history = await conversation_mgr.get_history(request.session_id)
        if history:
            # 将历史消息插入到当前消息之前
            messages = history + messages
    
    try:
        start_time = time.time()
        response_text, usage, llm_latency = await llm_service.chat(
            messages=messages,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        
        total_latency_ms = int((time.time() - start_time) * 1000)
        
        # 保存会话历史
        if request.session_id:
            await conversation_mgr.append_message(
                session_id=request.session_id,
                messages=[
                    {"role": "user", "content": request.messages[-1].content},
                    {"role": "assistant", "content": response_text}
                ]
            )
        
        logger.info(
            f"对话请求完成",
            extra={
                "request_id": request_id,
                "latency_ms": total_latency_ms,
                "llm_latency_ms": llm_latency,
                "tokens": usage.total_tokens
            }
        )
        
        return ChatResponse(
            response=response_text,
            session_id=request.session_id or "new",
            model=llm_service.model,
            usage=usage,
            latency_ms=llm_latency,
            created_at=datetime.now()
        )
        
    except httpx.HTTPStatusError as e:
        logger.error(f"LLM API错误: {e.response.status_code}", extra={"request_id": request_id})
        raise HTTPException(status_code=502, detail="AI服务暂时不可用")
    except Exception as e:
        logger.exception(f"对话请求失败", extra={"request_id": request_id})
        raise HTTPException(status_code=500, detail="服务内部错误")
```

### 应用入口

```python
"""
main.py - FastAPI应用入口
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uuid
import time

from config import get_settings
from routers import chat, rag, admin
from utils.logger import logger

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时
    logger.info(f"{settings.APP_NAME} v{settings.VERSION} 启动中...")
    
    yield
    
    # 关闭时
    logger.info("服务关闭中...")


# 创建应用
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# ============ 中间件 ============

@app.middleware("http")
async def add_request_id(request: Request, call_next):
    """给每个请求添加唯一ID"""
    request.state.request_id = str(uuid.uuid4())[:8]
    start_time = time.time()
    
    try:
        response = await call_next(request)
    finally:
        duration = (time.time() - start_time) * 1000
        logger.info(
            f"{request.method} {request.url.path}",
            extra={
                "request_id": request.state.request_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": int(duration)
            }
        )
    
    response.headers["X-Request-ID"] = request.state.request_id
    return response


# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# ============ 路由注册 ============

app.include_router(chat.router, prefix="/api/v1")
app.include_router(rag.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1/admin")


# ============ 健康检查 ============

@app.get("/health")
async def health_check():
    """健康检查接口（K8s/负载均衡需要）"""
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "timestamp": time.time()
    }


@app.get("/ready")
async def readiness_check():
    """就绪检查（K8s readiness probe需要）"""
    # 这里可以检查依赖服务是否可用
    return {"ready": True}


# ============ 全局异常处理 ============

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """全局异常捕获"""
    logger.exception(f"未处理的异常")
    return JSONResponse(
        status_code=500,
        content={"detail": "服务内部错误", "request_id": getattr(request.state, "request_id", None)}
    )


# 启动命令：uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 响应模型：让API文档更清晰

FastAPI的response_model不只是类型提示，还能自动过滤字段、转换数据：

```python
class User:
    """数据库模型"""
    id: int
    username: str
    email: str
    password_hash: str  # 这个不应该暴露给客户端
    created_at: datetime

# 使用response_model_exclude过滤敏感字段
@router.get("/users/{user_id}", response_model=UserInResponse)
async def get_user(user_id: int):
    user = db.get_user(user_id)
    return user

# 或者在模型定义中控制
class UserInResponse(BaseModel):
    """对外暴露的用户信息"""
    id: int
    username: str
    email: str
    # password_hash 不包含在内
    
    class Config:
        from_attributes = True  # 支持从ORM对象转换
```

---

## 12.2 Docker容器化部署

### AI应用的Docker特殊考量

Docker对AI应用来说不只是"环境一致性"那么简单。有几个AI场景的特殊挑战：

1. **GPU透传**：模型推理需要GPU，怎么让容器用上宿主机的NVIDIA显卡？
2. **大模型文件**：7B模型15GB、72B模型150GB，镜像怎么管理？
3. **分层优化**：每次改代码都要重新拉取整个模型，太慢了

### GPU透传：nvidia-docker配置

要让容器访问GPU，需要nvidia-container-toolkit（nvidia-docker的继任者）：

```dockerfile
# ai-service/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# 安装CUDA运行时依赖（不需要完整的CUDA toolkit）
RUN apt-get update && apt-get install -y \
    libcublasLt.so.12 \
    libcublas.so.12 \
    libcurand.so.12 \
    && rm -rf /var/lib/apt/lists/*

# 复制应用代码
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

运行时加`--gpus`参数：

```bash
# 单GPU
docker run --gpus '"device=0"' -p 8000:8000 ai-service:latest

# 多GPU（Tensor Parallelism）
docker run --gpus '"device=0,1,2,3"' ai-service:latest
```

或者用docker-compose：

```yaml
# docker-compose.yml
version: '3.8'

services:
  ai-service:
    build: .
    ports:
      - "8000:8000"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    environment:
      - CUDA_VISIBLE_DEVICES=0
```

### 大模型文件的分层管理

这是AI应用Docker化的核心难点。常见做法：

**方案1：模型挂载到Volume（推荐）**

```bash
# 启动时挂载预下载的模型
docker run -v /path/to/models:/models \
    -e MODEL_PATH=/models/Qwen2.5-7B \
    ai-service:latest
```

**方案2：Model Registry（生产级）**

```yaml
# docker-compose.yml - 带Model Registry
services:
  ai-service:
    build: .
    environment:
      - MODEL_NAME=Qwen2.5-7B-Instruct
    volumes:
      - huggingface_cache:/root/.cache/huggingface
      # 模型不在镜像里，从HF Hub拉取并缓存

volumes:
  huggingface_cache:
```

**方案3：提前下载到镜像（适合小模型）**

```dockerfile
# 小模型可以打包进镜像
FROM python:3.11-slim

WORKDIR /app

# 下载模型（只在构建时执行）
RUN pip install huggingface_hub && \
    huggingface-cli download sentence-transformers/all-MiniLM-L6-v2

COPY app app/
CMD ["python", "app/server.py"]
```

### 多阶段构建：减小镜像体积

```dockerfile
# Dockerfile - 多阶段构建
# 阶段1：构建
FROM python:3.11-slim as builder

WORKDIR /app

# 先复制依赖，利用Docker缓存
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# 复制代码
COPY . .

# 阶段2：运行
FROM python:3.11-slim

WORKDIR /app

# 安全：创建非root用户
RUN groupadd -r appgroup && useradd -r -g appgroup appuser

# 从builder复制Python包（不复制源码目录，减少体积）
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# 只复制运行需要的代码
COPY --from=builder --chown=appuser:appgroup /app/main.py /app/config.py /app/routers /app/services /app/models /app/core /app/utils ./

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Docker Compose编排AI服务栈

一个完整的AI服务不止是API服务，还有向量数据库、Redis、可能还有vLLM：

```yaml
# docker-compose.yml - 完整AI服务栈
version: '3.8'

services:
  # API服务
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - VECTOR_DB_TYPE=chroma
      - VECTOR_DB_PATH=/data/chroma
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./data:/data
      - ./logs:/app/logs
    depends_on:
      redis:
        condition: service_healthy
      chroma:
        condition: service_started
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G

  # vLLM推理服务（GPU）
  vllm:
    image: vllm/vllm-openai:latest
    ports:
      - "8001:8000"
    environment:
      - MODEL_NAME=Qwen/Qwen2.5-7B-Instruct
      - GPU_MEMORY_UTILIZATION=0.9
      - MAX_MODEL_LEN=8192
    volumes:
      - huggingface_cache:/root/.cache/huggingface
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 120s  # 模型加载很慢

  # Redis（会话缓存）
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Chroma向量数据库
  chroma:
    image: chromadb/chroma:latest
    ports:
      - "8002:8000"
    volumes:
      - chroma_data:/chroma/chroma
    environment:
      - IS_PERSISTENT=TRUE

volumes:
  redis_data:
  chroma_data:
  huggingface_cache:
```

启动和运维命令：

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看特定服务日志
docker-compose logs -f api
docker-compose logs -f vllm

# 扩缩容（API服务）
docker-compose up -d --scale api=3

# 进入容器调试
docker-compose exec api /bin/bash

# 停止和清理
docker-compose down
docker-compose down -v  # 同时删除数据卷
```

### .dockerignore优化构建

```
# Git
.git
.gitignore

# Python
__pycache__
*.py[cod]
*$py.class
.Python
*.egg-info/
.eggs/
build/
dist/
*.egg

# 测试
tests/
pytest.ini
.pytest_cache/

# 环境
.env
.env.local

# 大文件和数据
data/
logs/
*.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# Docker相关
Dockerfile*
docker-compose*.yml
.docker/
```

---

## 12.3 异步处理与流式响应

### 为什么AI服务必须异步？

大模型调用的特点是**IO密集且等待时间长**。一次GPT-4的调用可能要2-30秒，期间线程是空闲的。

同步模式下：
- 100个并发请求 → 100个线程 → 内存爆炸
- 大部分时间线程在等待，CPU利用率极低

异步模式下：
- 100个并发请求 → 1个线程 → 内存友好
- await期间线程去处理其他请求，效率极高

```python
# 同步写法 - 不推荐
@app.post("/chat")
def chat_sync(request: ChatRequest):
    response = llm.invoke(messages)  # 阻塞30秒，这30秒线程干不了别的
    return {"response": response}

# 异步写法 - 推荐
@app.post("/chat")
async def chat_async(request: ChatRequest):
    response = await llm.ainvoke(messages)  # 异步等待，线程可以处理其他请求
    return {"response": response}
```

### 并发调用多个服务

异步的另一个好处是**并发调用**：

```python
import asyncio
import time

async def demo_parallel_calls():
    """演示并发调用的时间优势"""
    
    # 模拟三个IO操作
    async def vector_search():
        await asyncio.sleep(1.0)  # 假设向量检索耗时1秒
        return ["doc1", "doc2", "doc3"]
    
    async def keyword_search():
        await asyncio.sleep(0.5)  # 关键词检索耗时0.5秒
        return ["doc4", "doc5"]
    
    async def knowledge_graph():
        await asyncio.sleep(1.5)  # 知识图谱耗时1.5秒
        return ["doc6"]
    
    start = time.time()
    
    # 串行执行：1.0 + 0.5 + 1.5 = 3.0秒
    # r1 = await vector_search()
    # r2 = await keyword_search()
    # r3 = await knowledge_graph()
    
    # 并发执行：max(1.0, 0.5, 1.5) = 1.5秒
    results = await asyncio.gather(
        vector_search(),
        keyword_search(),
        knowledge_graph()
    )
    
    print(f"总耗时: {time.time() - start:.2f}秒")  # 输出: 总耗时: 1.50秒
    
    # results[0] 是 vector_search 的结果
    # results[1] 是 keyword_search 的结果
    # results[2] 是 knowledge_graph 的结果
    return results
```

### SSE vs WebSocket：怎么选？

这是面试常考题。简单说：

| 特性 | SSE (Server-Sent Events) | WebSocket |
|------|--------------------------|-----------|
| 方向 | 单向（服务器→客户端） | 双向 |
| 适用场景 | AI流式输出、实时通知 | 聊天室、游戏、交互式应用 |
| 实现复杂度 | 简单 | 复杂 |
| 自动重连 | 支持 | 需要自己实现 |
| HTTP/2 | 支持多路复用 | 需要HTTP/2单独通道 |
| 防火墙 | 通常畅通 | 可能被阻止 |

对于AI对话场景，**SSE就够了**。用户发一条消息，AI逐字返回——这是单向的，不需要双向通信。

### SSE流式响应实战

```python
"""
routers/chat.py - 流式对话
"""

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
import json
import asyncio

from models.schemas import ChatRequest
from services.llm_service import LLMService
from core.dependencies import verify_api_key, get_llm_service

router = APIRouter()


@router.post("/chat/stream")
async def chat_stream(
    request: ChatRequest,
    api_key: dict = Depends(verify_api_key),
    llm_service: LLMService = Depends(get_llm_service)
):
    """流式对话接口 - SSE实现"""
    
    async def event_generator():
        """SSE事件生成器"""
        try:
            # 使用流式LLM调用
            async for chunk in llm_service.stream_chat(
                messages=request.messages,
                temperature=request.temperature,
                max_tokens=request.max_tokens
            ):
                if chunk["type"] == "content":
                    # 发送内容块
                    data = json.dumps({
                        "type": "content",
                        "content": chunk["content"],
                        "session_id": request.session_id or "new"
                    })
                    yield f"data: {data}\n\n"
                    
                elif chunk["type"] == "done":
                    # 发送完成信号
                    data = json.dumps({"type": "done"})
                    yield f"data: {data}\n\n"
                    break
                    
        except Exception as e:
            # 发送错误信号
            error_data = json.dumps({
                "type": "error",
                "message": str(e)
            })
            yield f"data: {error_data}\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # 关键：禁用nginx缓冲，否则看不到打字效果
        }
    )
```

### 前端调用流式接口

```javascript
// 使用fetch + ReadableStream
async function chatStream(messages) {
    const response = await fetch('/api/v1/chat/stream', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-Key': 'your-api-key'
        },
        body: JSON.stringify({
            messages: messages,
            temperature: 0.7,
            max_tokens: 2048,
            session_id: 'user-123'
        })
    });
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        const lines = text.split('\n');
        
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'content') {
                    fullContent += data.content;
                    // 更新UI，显示打字效果
                    updateMessageContent(fullContent);
                } else if (data.type === 'done') {
                    console.log('生成完成');
                    // 保存消息到历史
                    saveToHistory(data.session_id, fullContent);
                } else if (data.type === 'error') {
                    showError(data.message);
                }
            }
        }
    }
    
    return fullContent;
}
```

### 异步Agent调用的完整模式

Agent场景下，异步更复杂——要处理工具调用：

```python
"""
services/agent_service.py - 异步Agent
"""

from typing import AsyncGenerator
import asyncio

class AsyncAgentService:
    """异步Agent服务"""
    
    def __init__(self, llm_service, tools: list):
        self.llm_service = llm_service
        self.tools = tools
    
    async def run_stream(self, query: str) -> AsyncGenerator[dict, None]:
        """异步运行Agent，流式返回"""
        
        messages = [
            {"role": "user", "content": query}
        ]
        
        while True:
            # 1. 调用LLM
            async for chunk in self.llm_service.stream_chat(messages):
                if chunk["type"] == "content":
                    yield {"type": "content", "content": chunk["content"]}
                elif chunk["type"] == "done":
                    # 检查是否需要调用工具
                    tool_calls = self._parse_tool_calls(messages)
                    if tool_calls:
                        # 执行工具调用
                        for tool_call in tool_calls:
                            yield {"type": "tool_start", "tool": tool_call["name"]}
                            result = await self._execute_tool(tool_call)
                            yield {"type": "tool_result", "tool": tool_call["name"], "result": result}
                            
                            # 添加工具结果到上下文
                            messages.append({
                                "role": "tool",
                                "tool_call_id": tool_call["id"],
                                "content": str(result)
                            })
                        continue  # 继续LLM调用
                    else:
                        yield {"type": "done"}
                        return
    
    def _parse_tool_calls(self, messages: list) -> list:
        """解析LLM输出的工具调用（简化版）"""
        # 实际需要解析函数调用格式
        pass
    
    async def _execute_tool(self, tool_call: dict) -> str:
        """执行工具调用"""
        tool_name = tool_call["name"]
        tool_args = tool_call["arguments"]
        
        # 查找工具
        tool = next((t for t in self.tools if t.name == tool_name), None)
        if not tool:
            return f"Error: Tool {tool_name} not found"
        
        # 执行工具
        if asyncio.iscoroutinefunction(tool.func):
            return await tool.func(**tool_args)
        else:
            return tool.func(**tool_args)
```

---

## 12.4 日志、监控与告警

### AI应用特有的监控指标

通用服务的监控指标（QPS、延迟、错误率）当然要有，但AI应用还有几个独特的：

| 指标 | 说明 | 重要性 |
|------|------|--------|
| **Token消耗** | prompt_tokens、completion_tokens、按模型分组 | 成本控制 |
| **模型延迟P99** | P50/P90/P99 latency，按模型区分 | 用户体验 |
| **幻觉率** | 引用文档不准确的比例 | 质量监控 |
| **工具调用成功率** | Agent工具调用失败率 | 稳定性 |
| **RAG召回率** | 检索结果的相关性 | 系统效果 |

### 结构化日志实战

```python
"""
utils/logger.py - 结构化日志配置
"""

from loguru import logger
import sys
import json
from datetime import datetime
from pathlib import Path

# 移除默认handler
logger.remove()

# 控制台输出（彩色，简洁）
logger.add(
    sys.stdout,
    colorize=True,
    format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <level>{message}</level>",
    level="INFO"
)

# 文件输出（JSON格式，便于分析）
log_dir = Path("logs")
log_dir.mkdir(exist_ok=True)

logger.add(
    log_dir / "app_{time:YYYY-MM-DD}.log",
    rotation="00:00",  # 每天轮转
    retention="30 days",  # 保留30天
    compression="zip",  # 压缩旧日志
    format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {name}:{function}:{line} | {message}",
    serialize=True,  # JSON格式！
)


# 业务日志函数
def log_ai_request(
    request_id: str,
    user_id: str,
    model: str,
    prompt_tokens: int,
    completion_tokens: int,
    latency_ms: float,
    success: bool,
    error: str = None
):
    """记录AI请求"""
    logger.info(
        "ai_request",
        extra={
            "event_type": "ai_request",
            "request_id": request_id,
            "user_id": user_id,
            "model": model,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
            "total_tokens": prompt_tokens + completion_tokens,
            "latency_ms": latency_ms,
            "success": success,
            "error": error
        }
    )


def log_rag_query(
    request_id: str,
    query: str,
    docs_retrieved: int,
    retrieval_time_ms: float,
    generation_time_ms: float,
    citation_accuracy: float = None
):
    """记录RAG查询"""
    logger.info(
        "rag_query",
        extra={
            "event_type": "rag_query",
            "request_id": request_id,
            "query_length": len(query),
            "docs_retrieved": docs_retrieved,
            "retrieval_time_ms": retrieval_time_ms,
            "generation_time_ms": generation_time_ms,
            "total_time_ms": retrieval_time_ms + generation_time_ms,
            "citation_accuracy": citation_accuracy  # 幻觉率辅助指标
        }
    )


def log_tool_call(
    request_id: str,
    tool_name: str,
    success: bool,
    duration_ms: float,
    error: str = None
):
    """记录工具调用"""
    logger.info(
        "tool_call",
        extra={
            "event_type": "tool_call",
            "request_id": request_id,
            "tool_name": tool_name,
            "success": success,
            "duration_ms": duration_ms,
            "error": error
        }
    )
```

### Prometheus指标暴露

```python
"""
middleware/metrics.py - Prometheus指标
"""

from prometheus_client import Counter, Histogram, Gauge, Info
from starlette.middleware.base import BaseHTTPMiddleware
import time


# ============ 定义指标 ============

# 应用信息
APP_INFO = Info("ai_service", "AI Service Info")
APP_INFO.info({"version": "1.0.0", "name": "ai-chat-service"})

# 请求计数
REQUEST_COUNT = Counter(
    "ai_service_requests_total",
    "总请求数",
    ["method", "endpoint", "status"]
)

# 请求延迟
REQUEST_LATENCY = Histogram(
    "ai_service_request_duration_seconds",
    "请求延迟（秒）",
    ["method", "endpoint"],
    buckets=[0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0, 30.0]
)

# 当前活跃请求数
ACTIVE_REQUESTS = Gauge(
    "ai_service_active_requests",
    "当前活跃请求数",
    ["endpoint"]
)

# Token消耗
TOKEN_USAGE = Counter(
    "ai_service_token_usage_total",
    "Token使用量",
    ["model", "type"]  # type: prompt / completion
)

# LLM调用延迟（专门记录模型耗时）
LLM_LATENCY = Histogram(
    "ai_service_llm_duration_seconds",
    "LLM调用延迟",
    ["model"],
    buckets=[0.5, 1.0, 2.0, 5.0, 10.0, 20.0, 30.0, 60.0]
)

# RAG指标
RAG_RETRIEVAL_LATENCY = Histogram(
    "ai_service_rag_retrieval_seconds",
    "RAG检索延迟",
    buckets=[0.01, 0.05, 0.1, 0.25, 0.5, 1.0]
)

RAG_DOCS_RETRIEVED = Histogram(
    "ai_service_rag_docs_retrieved",
    "RAG检索返回文档数",
    buckets=[1, 2, 3, 5, 10, 15, 20]
)

# 工具调用
TOOL_CALL_COUNT = Counter(
    "ai_service_tool_calls_total",
    "工具调用次数",
    ["tool_name", "status"]  # status: success / failure
)

TOOL_CALL_LATENCY = Histogram(
    "ai_service_tool_duration_seconds",
    "工具调用延迟",
    ["tool_name"],
    buckets=[0.01, 0.05, 0.1, 0.5, 1.0, 5.0]
)


# ============ 中间件：自动埋点 ============

class PrometheusMiddleware(BaseHTTPMiddleware):
    """自动埋点中间件"""
    
    async def dispatch(self, request, call_next):
        endpoint = request.url.path
        
        # 跳过metrics端点本身
        if endpoint == "/metrics":
            return await call_next(request)
        
        ACTIVE_REQUESTS.labels(endpoint=endpoint).inc()
        start_time = time.time()
        
        try:
            response = await call_next(request)
            status = response.status_code
        except Exception:
            status = 500
            raise
        finally:
            ACTIVE_REQUESTS.labels(endpoint=endpoint).dec()
            duration = time.time() - start_time
            
            REQUEST_COUNT.labels(
                method=request.method,
                endpoint=endpoint,
                status=status
            ).inc()
            
            REQUEST_LATENCY.labels(
                method=request.method,
                endpoint=endpoint
            ).observe(duration)
        
        return response
```

### 告警规则

```yaml
# prometheus/rules.yml
groups:
  - name: ai_service_alerts
    rules:
      # 服务宕机
      - alert: ServiceDown
        expr: up{job="ai-service"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "AI服务宕机"
          description: "服务已停止响应超过1分钟"
        
      # LLM延迟过高
      - alert: LLMLatencyHigh
        expr: histogram_quantile(0.99, rate(ai_service_llm_duration_seconds_bucket[5m])) > 30
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "LLM响应延迟过高"
          description: "P99延迟超过30秒，请检查模型服务状态"
        
      # Token消耗异常（可能被攻击）
      - alert: TokenUsageAnomaly
        expr: rate(ai_service_token_usage_total[1h]) > 100000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Token消耗异常"
          description: "最近1小时Token消耗过高，请确认是否为正常流量"
        
      # 错误率飙升
      - alert: HighErrorRate
        expr: rate(ai_service_requests_total{status=~"5.."}[5m]) / rate(ai_service_requests_total[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "错误率超过5%"
          description: "大量请求失败，请立即检查"
        
      # 工具调用失败
      - alert: ToolCallFailure
        expr: rate(ai_service_tool_calls_total{status="failure"}[5m]) / rate(ai_service_tool_calls_total[5m]) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "工具调用失败率过高"
          description: "工具调用失败率超过10%"
```

---

## 12.5 vLLM推理加速

### 什么时候需要自部署模型？

不是所有场景都要自己部署。但如果有以下需求，vLLM是个好选择：

- **日均调用量>100万token**，API成本hold不住
- **数据安全要求高**，不能把数据发给第三方
- **需要定制优化**，比如微调后的模型
- **需要部署开源模型**，比如Llama 3、Qwen 2.5

### vLLM的核心优势

vLLM用PagedAttention技术，把GPU显存当内存一样分页管理，显存利用率提升2-4倍。截至2025年底：

- DeepSeek模型单卡可达 **2.2k tokens/s**（H200）
- 支持多节点分布式部署
- 原生兼容OpenAI API格式

### 快速启动vLLM

```bash
# 安装（需要NVIDIA GPU + CUDA 11.8+）
pip install vllm>=0.6.0

# 单卡启动（7B模型，至少16GB显存）
vllm serve Qwen/Qwen2.5-7B-Instruct \
    --host 0.0.0.0 \
    --port 8000 \
    --tensor-parallel-size 1 \
    --gpu-memory-utilization 0.9 \
    --max-model-len 8192

# 多卡启动（72B模型，需要4卡）
vllm serve Qwen/Qwen2.5-72B-Instruct \
    --host 0.0.0.0 \
    --port 8000 \
    --tensor-parallel-size 4 \
    --gpu-memory-utilization 0.9 \
    --max-model-len 8192

# 常用参数
# --tensor-parallel-size: 张量并行数（几块卡）
# --gpu-memory-utilization: GPU显存使用率（0.9留点给KV缓存）
# --max-model-len: 最大上下文长度
# --enable-chunked-prefill: 分块预填充，长序列友好
```

### vLLM Docker部署

```dockerfile
# vllm/Dockerfile
FROM nvidia/cuda:12.4.1-runtime-ubuntu22.04

WORKDIR /app

# 安装Python
RUN apt-get update && apt-get install -y \
    python3.10 \
    python3-pip \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 安装vLLM
RUN pip3 install vllm>=0.6.0

# 复制启动脚本
COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 8000

ENTRYPOINT ["bash", "/start.sh"]
```

```bash
#!/bin/bash
# vllm/start.sh
python3 -m vllm.entrypoints.openai.api_server \
    --host 0.0.0.0 \
    --port 8000 \
    --model ${MODEL_NAME:-Qwen/Qwen2.5-7B-Instruct} \
    --tensor-parallel-size ${TP_SIZE:-1} \
    --gpu-memory-utilization 0.9 \
    --max-model-len 8192 \
    --enforce-eager  # 调试模式禁用CUDA图
```

### 使用vLLM（兼容OpenAI API）

最大的好处是**API完全兼容**，改个base_url就能用：

```python
from openai import OpenAI

# 连接vLLM（和OpenAI一样的接口）
client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="EMPTY"  # vLLM不需要API Key
)

# 同步调用
response = client.chat.completions.create(
    model="Qwen/Qwen2.5-7B-Instruct",
    messages=[
        {"role": "system", "content": "你是一个友好的AI助手"},
        {"role": "user", "content": "用一句话介绍Python"}
    ],
    temperature=0.7,
    max_tokens=100
)
print(response.choices[0].message.content)

# 流式调用
stream = client.chat.completions.create(
    model="Qwen/Qwen2.5-7B-Instruct",
    messages=[{"role": "user", "content": "写一首诗"}],
    stream=True
)
for chunk in stream:
    if chunk.choices[0].delta.content:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

### vLLM Router（大规模部署）

要服务多个模型副本，需要负载均衡：

```bash
# 启动3个vLLM工作节点
vllm serve Qwen/Qwen2.5-7B --host 192.168.1.10 --port 8000
vllm serve Qwen/Qwen2.5-7B --host 192.168.1.11 --port 8000
vllm serve Qwen/Qwen2.5-7B --host 192.168.1.12 --port 8000

# 启动Router（一致性哈希，复用KV缓存）
vllm router \
    --host 0.0.0.0 --port 8000 \
    --backend vllm \
    --nodes 192.168.1.10:8000,192.168.1.11:8000,192.168.1.12:8000 \
    --policy consistent-hash
```

---

## 12.6 从本地Demo到生产环境：一个真实项目的架构演进

这一节不用"五大支柱"的概念罗列，而是讲一个**真实项目**是怎么一步步演进过来的。

### 故事背景

小李是一个AI创业公司的后端工程师。公司要做一款**AI客服机器人**，基于RAG架构，能回答产品相关问题，还能查询订单状态。

小李接手这个项目时，只有一个本地跑的Python脚本。让我们跟着他，看看这个系统是怎么一步步成长为能扛住日均百万调用的生产系统的。

---

### 阶段1：本地脚本（Week 1）

**起点：一个能跑通的脚本**

```python
# v1_chatbot.py - 最初的代码
from llama_index import VectorStoreIndex, SimpleDirectoryReader
from openai import OpenAI

# 加载文档
documents = SimpleDirectoryReader("./docs").load_data()
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()

# 初始化LLM
llm = OpenAI(model="gpt-4o-mini")

def chat(question: str) -> str:
    """简单对话函数"""
    # 检索相关文档
    docs = query_engine.query(question)
    
    # 构建提示词
    prompt = f"""基于以下文档回答问题。如果文档中没有相关信息，请说"我不知道"。
    
    文档: {docs}
    
    问题: {question}
    """
    
    # 调用LLM
    response = llm.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    
    return response.choices[0].message.content

# 测试
if __name__ == "__main__":
    while True:
        question = input("你: ")
        if question.lower() in ["quit", "exit"]:
            break
        print(f"AI: {chat(question)}")
```

**问题**：
- 每次运行都要重新加载文档（VectorStoreIndex初始化慢）
- 没有API接口，测试要手动输入
- 没有日志，不知道系统发生了什么
- 没有错误处理，挂了就是挂了

**什么时候演进到阶段2**：Demo演示通过了，领导觉得可以给客户试试了。

---

### 阶段2：FastAPI单服务（Week 2-3）

**加了API层，可以给别人用了**

```
ai-service/
├── main.py
├── config.py
├── routers/
│   ├── chat.py
│   └── admin.py
├── services/
│   ├── llm_service.py
│   └── index_service.py
├── models/
│   └── schemas.py
└── requirements.txt
```

```python
# services/index_service.py - 优化后的索引服务
from llama_index import VectorStoreIndex, SimpleDirectoryReader
from llama_index.core import Settings
from llama_index.embeddings.openai import OpenAIEmbedding
import os
from pathlib import Path
from functools import lru_cache

# 全局索引（避免重复加载）
_global_index = None

@lru_cache()
def get_embed_model():
    """获取嵌入模型（缓存）"""
    return OpenAIEmbedding(model="text-embedding-3-small")

def load_index():
    """加载或获取索引"""
    global _global_index
    
    if _global_index is None:
        print("正在加载索引（首次加载较慢）...")
        Settings.embed_model = get_embed_model()
        documents = SimpleDirectoryReader("./docs").load_data()
        _global_index = VectorStoreIndex.from_documents(documents)
        print("索引加载完成")
    
    return _global_index

def query_index(question: str, top_k: int = 5) -> str:
    """查询索引"""
    index = load_index()
    query_engine = index.as_query_engine(similarity_top_k=top_k)
    return str(query_engine.query(question))
```

```python
# routers/chat.py
from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse
from services.llm_service import LLMService
from services.index_service import query_index
import time

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    start_time = time.time()
    
    try:
        # 1. RAG检索（从最后一条用户消息检索）
        question = request.messages[-1].content
        docs = query_index(question, request.top_k)
        
        # 2. 构建提示词
        prompt = f"基于以下文档回答问题：\n{docs}\n\n问题：{question}"
        
        # 3. 调用LLM
        llm = LLMService()
        response = await llm.chat(prompt)
        
        return ChatResponse(
            answer=response,
            latency_ms=int((time.time() - start_time) * 1000)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat, admin

app = FastAPI(title="AI客服服务", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(chat.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1/admin")

@app.get("/health")
async def health():
    return {"status": "ok"}

# 启动：uvicorn main:app --host 0.0.0.0 --port 8000
```

**解决了什么问题**：
- ✅ 有API接口，可以给前端调用
- ✅ 全局索引，只加载一次
- ✅ 有健康检查接口
- ✅ 有基础的错误处理

**还存在的问题**：
- 多个用户同时请求会阻塞（只有一个索引实例）
- 没有认证，谁都能调用
- 没有监控，不知道调用量和延迟
- 配置文件写死在代码里

**什么时候演进到阶段3**：第一个客户上线了，发现并发一高就卡，而且需要区分不同客户的功能。

---

### 阶段3：微服务拆分（Month 2）

**为什么拆**：随着功能增加，单服务变得臃肿：
- RAG检索逻辑越来越复杂
- 需要对接多个LLM（GPT、Claude、本地vLLM）
- 要支持多租户，不同客户配置不同
- 需要单独管理会话状态

**拆分方案**：

```
                    ┌─────────────┐
                    │   Gateway   │
                    │  (认证/限流) │
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
    │ Search Svc  │ │ LLM Svc     │ │ Chat Svc    │
    │ (检索服务)   │ │ (推理服务)  │ │ (对话编排)  │
    └──────┬──────┘ └──────┬──────┘ └─────────────┘
           │               │
    ┌──────▼──────┐ ┌──────▼──────┐
    │  ChromaDB   │ │   vLLM      │
    │ (向量数据库)│ │ (本地模型)  │
    └─────────────┘ └─────────────┘
```

**Search Service（检索服务）**

```python
# search_service/main.py
"""
检索服务 - 专注RAG检索
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import time

app = FastAPI(title="检索服务", version="1.0.0")

class SearchRequest(BaseModel):
    query: str
    top_k: int = 5
    tenant_id: str  # 多租户支持
    filters: dict = {}

class SearchResponse(BaseModel):
    results: list[dict]
    retrieval_time_ms: int

@app.post("/search", response_model=SearchResponse)
async def search(request: SearchRequest):
    start = time.time()
    
    # 根据tenant_id加载对应的索引
    index = get_index_for_tenant(request.tenant_id)
    
    # 检索
    results = await index.query(
        request.query,
        top_k=request.top_k,
        filters=request.filters
    )
    
    return SearchResponse(
        results=results,
        retrieval_time_ms=int((time.time() - start) * 1000)
    )
```

**LLM Service（推理服务）**

```python
# llm_service/main.py
"""
LLM服务 - 专注模型推理
支持多后端：OpenAI / Anthropic / vLLM / Azure
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Literal

app = FastAPI(title="LLM服务", version="1.0.0")

class CompletionRequest(BaseModel):
    prompt: str
    model: Literal["gpt-4o-mini", "claude-3-haiku", "qwen-7b"] = "gpt-4o-mini"
    temperature: float = 0.7
    max_tokens: int = 2048
    stream: bool = False

class CompletionResponse(BaseModel):
    text: str
    model: str
    tokens_used: int
    latency_ms: int

# 根据模型类型路由到不同后端
@app.post("/completion", response_model=CompletionResponse)
async def complete(request: CompletionRequest):
    if request.model.startswith("gpt-"):
        return await openai_completion(request)
    elif request.model.startswith("claude-"):
        return await anthropic_completion(request)
    elif request.model.startswith("qwen-"):
        return await vllm_completion(request)
    else:
        raise HTTPException(status_code=400, detail=f"不支持的模型: {request.model}")
```

**API Gateway（网关）**

```python
# gateway/main.py
"""
API网关 - 认证、限流、路由
"""
from fastapi import FastAPI, Request, HTTPException, Depends, Header
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
import httpx

app = FastAPI(title="API网关", version="1.0.0")
limiter = Limiter(key_func=get_remote_address)

# 认证
async def verify_api_key(x_api_key: str = Header(...)):
    # 验证API Key（实际查数据库）
    if not x_api_key.startswith("sk-"):
        raise HTTPException(status_code=401, detail="无效的API Key")
    return {"api_key": x_api_key}

# 路由配置
ROUTES = {
    "/search": "http://search-service:8001",
    "/completion": "http://llm-service:8002",
    "/chat": "http://chat-service:8003"
}

@app.api_route("/{path:path}", methods=["POST"])
@limiter.limit("60/minute")
async def proxy(path: str, request: Request, auth: dict = Depends(verify_api_key)):
    """通用代理"""
    base_url = ROUTES.get(f"/{path}")
    if not base_url:
        raise HTTPException(status_code=404, detail="路由不存在")
    
    async with httpx.AsyncClient(timeout=60) as client:
        response = await client.post(
            f"{base_url}/{path}",
            json=await request.json(),
            headers={
                "X-Tenant-ID": auth["api_key"].split("-")[1],  # 从Key提取租户
                "X-API-Key": auth["api_key"]
            }
        )
    
    return JSONResponse(
        content=response.json(),
        status_code=response.status_code
    )

@app.get("/health")
async def health():
    return {"gateway": "ok"}
```

**Docker Compose编排**

```yaml
# docker-compose.yml
version: '3.8'

services:
  gateway:
    build: ./gateway
    ports:
      - "8000:8000"
    depends_on:
      - search-service
      - llm-service
      - chat-service

  search-service:
    build: ./search_service
    ports:
      - "8001:8000"
    volumes:
      - ./data/indexes:/app/indexes
    environment:
      - CHROMA_HOST=chroma

  llm-service:
    build: ./llm_service
    ports:
      - "8002:8000"
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]

  chat-service:
    build: ./chat_service
    ports:
      - "8003:8000"
    depends_on:
      - search-service
      - llm-service
      - redis

  chroma:
    image: chromadb/chroma:latest
    ports:
      - "8004:8000"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

**解决了什么问题**：
- ✅ 服务可以独立扩展（检索瓶颈就扩检索服务）
- ✅ 多租户隔离（每个租户独立的索引）
- ✅ API Gateway统一认证限流
- ✅ 支持多LLM后端

**还存在的问题**：
- 需要手动扩缩容
- 没有自动故障恢复
- 监控还不完善
- 部署在单机上，容灾能力差

**什么时候演进到阶段4**：客户数量增加到10+，高峰期并发超过1000，单机扛不住了。

---

### 阶段4：Kubernetes弹性伸缩（Month 4-6）

**K8s部署架构**：

```
┌─────────────────────────────────────────────────────────────────┐
│                     Kubernetes Cluster                          │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐        │
│  │  Gateway    │    │  Gateway    │    │  Gateway    │        │
│  │   Pod       │    │   Pod       │    │   Pod       │        │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘        │
│         │                   │                   │               │
│         └───────────────────┼───────────────────┘               │
│                             │                                   │
│         ┌───────────────────┼───────────────────┐               │
│         │                   │                   │               │
│  ┌──────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐        │
│  │  Chat Svc   │    │  Chat Svc   │    │  Chat Svc   │        │
│  │  (x3)       │    │             │    │             │        │
│  └──────┬──────┘    └─────────────┘    └─────────────┘        │
│         │                                                        │
│  ┌──────▼──────┐                         ┌─────────────┐        │
│  │ Search Svc  │                         │ LLM Svc     │        │
│  │  (GPU x2)   │                         │ (GPU x2)    │        │
│  └──────┬──────┘                         └──────┬──────┘        │
│         │                                        │               │
│  ┌──────▼──────┐                         ┌──────▼──────┐        │
│  │   ChromaDB  │                         │   vLLM     │        │
│  │  (Stateful) │                         │  (Stateful)│        │
│  └─────────────┘                         └─────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**K8s Deployment（Chat Service）**

```yaml
# k8s/chat-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chat-service
  labels:
    app: chat-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: chat-service
  template:
    metadata:
      labels:
        app: chat-service
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8000"
    spec:
      containers:
      - name: chat-service
        image: registry.example.com/chat-service:v1.2.0
        ports:
        - containerPort: 8000
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "2000m"
        env:
        - name: SEARCH_SERVICE_URL
          value: "http://search-service"
        - name: LLM_SERVICE_URL
          value: "http://llm-service"
        - name: REDIS_URL
          value: "redis://redis"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: chat-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: chat-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

**K8s Deployment（LLM Service - GPU）**

```yaml
# k8s/llm-service.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: llm-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: llm-service
  template:
    metadata:
      labels:
        app: llm-service
    spec:
      containers:
      - name: llm-service
        image: registry.example.com/llm-service:v1.2.0
        ports:
        - containerPort: 8000
        env:
        - name: MODEL_NAME
          value: "Qwen/Qwen2.5-7B-Instruct"
        - name: CUDA_VISIBLE_DEVICES
          valueFrom:
            fieldRef:
              fieldPath: spec.containers[0].resources.requests.nvidia.com/gpu
        resources:
          requests:
            memory: "8Gi"
            cpu: "4"
            nvidia.com/gpu: "1"
          limits:
            memory: "16Gi"
            cpu: "8"
            nvidia.com/gpu: "1"
        volumeMounts:
        - name: model-cache
          mountPath: /root/.cache/huggingface
      volumes:
      - name: model-cache
        persistentVolumeClaim:
          claimName: model-cache-pvc
      nodeSelector:
        nvidia.com/gpu.product: NVIDIA-A100-PCIE-40GB
      tolerations:
      - key: "nvidia.com/gpu"
        operator: "Exists"
        effect: "NoSchedule"
```

**HPA基于自定义指标（AI特定）**

```yaml
# k8s/hpa-ai-metrics.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: llm-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: llm-service
  minReplicas: 2
  maxReplicas: 8
  metrics:
  # 基于GPU利用率
  - type: Resource
    resource:
      name: nvidia.com/gpu
      target:
        type: Utilization
        averageUtilization: 80
  # 基于队列长度（需要Prometheus Adapter）
  - type: Pods
    pods:
      metric:
        name: llm_service_pending_requests
      target:
        type: AverageValue
        averageValue: "10"
```

**ConfigMap和Secrets**

```yaml
# k8s/config.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: chat-service-config
data:
  LOG_LEVEL: "INFO"
  MAX_RETRIES: "3"
  DEFAULT_MODEL: "gpt-4o-mini"
---
apiVersion: v1
kind: Secret
metadata:
  name: chat-service-secrets
type: Opaque
stringData:
  OPENAI_API_KEY: "sk-xxx"
  ANTHROPIC_API_KEY: "sk-ant-xxx"
```

**Helm部署（生产级）**

```bash
# 使用Helm Chart部署
helm install ai-chat-service ./charts/ai-chat-service \
    --set gateway.replicas=3 \
    --set chatService.replicas=5 \
    --set llmService.replicas=2 \
    --set llmService.gpuCount=1 \
    --set searchService.replicas=3 \
    --values ./values-prod.yaml

# 升级
helm upgrade ai-chat-service ./charts/ai-chat-service \
    --set image.tag=v1.3.0

# 回滚
helm rollback ai-chat-service
```

**解决了什么问题**：
- ✅ 自动弹性伸缩，高峰自动扩容
- ✅ GPU服务独立扩缩容
- ✅ 配置管理（ConfigMap/Secret）
- ✅ 滚动更新（不停机部署）
- ✅ 自动故障恢复
- ✅ 多副本负载均衡

**现在的系统能力**：
- 日均处理请求：100万+
- 峰值并发：2000+
- 可用性：99.9%
- 平均响应延迟：2-5秒

---

### 架构演进总结

| 阶段 | 部署方式 | 适用规模 | 关键改进 |
|------|----------|----------|----------|
| 1 | 单机脚本 | 个人Demo | 能跑通 |
| 2 | FastAPI单服务 | <100并发 | 有API、有认证雏形 |
| 3 | Docker Compose微服务 | <1000并发 | 服务拆分、多租户 |
| 4 | Kubernetes | 1000+并发 | 自动伸缩、容灾 |

**演进的驱动力**：
1. **并发量增长** → 需要更多副本 → K8s
2. **功能复杂度增加** → 服务拆分
3. **成本控制** → 需要弹性伸缩
4. **可靠性要求** → 需要自动恢复

> 💡 **关键认知**：架构演进不是一步到位的，是被业务需求"逼"出来的。不要过度设计，先解决当前问题，再为未来留好扩展点。

---

## 行动清单

恭喜你完成第12章！这可能是全书写得最"干"的一章，涵盖了大量实战经验。

### 你学到了什么

1. **FastAPI深度实战**：完整的项目结构、依赖注入、Pydantic数据模型、响应模型
2. **Docker高级技巧**：GPU透传、大模型分层、多阶段构建、Compose编排
3. **异步和流式**：SSE vs WebSocket的选择、流式响应实现、异步Agent模式
4. **AI监控体系**：Token消耗追踪、模型延迟P99、工具调用监控、告警规则
5. **vLLM部署**：从安装到生产部署的完整流程
6. **架构演进思维**：用真实案例展示从脚本到K8s的完整历程

### 立即可做

1. 把你在第8-9章写的LangChain/LlamaIndex代码封装成FastAPI服务
2. 写一个Dockerfile，支持GPU透传
3. 给服务加上日志中间件和健康检查
4. 用docker-compose把API服务+向量数据库跑起来
5. 实现一个流式响应接口，让前端能看到打字效果

### 进阶挑战

1. 部署一个vLLM服务（需要GPU），体验本地跑模型
2. 搭建Prometheus + Grafana监控体系
3. 用K8s部署你的AI服务（minikube本地练手也行）
4. 思考：如果你负责的项目要扩展到日均1000万请求，架构要怎么调整？

### 持续修炼

- 学习Kubernetes，这是面试高频考点，也是生产部署标配
- 研究istio/Linkerd服务网格（大规模微服务必备）
- 关注vLLM更新，这个领域迭代极快
- 学习Terraform/Ansible等基础设施即代码工具

### 恭喜你

完成这一章，你已经掌握了AI应用开发从"能跑"到"能上线"的全套技能。

记住：**能跑Demo的人很多，能搞定生产的人很少**。你正在成为那少数人。

---

**相关章节**：
- 第5章：大模型API调用（FastAPI里会用到）
- 第6章：RAG（本章的服务化示例）
- 第8章：LangChain实战（服务层会封装LangChain）
- 第9章：LlamaIndex与向量数据库（配套的向量数据库）
