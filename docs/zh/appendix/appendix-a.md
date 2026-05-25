---
outline: deep
---

##### 附录A AI应用开发工具速查表

本附录整理了AI应用开发全流程中常用的工具，按功能类别分组。每个工具均提供官方链接、核心定位、适用场景及快速上手命令，方便在实际项目中快速查阅。

---

#### A.1 大模型服务

###### A.1.1 OpenAI

| 项目 | 内容 |
|------|------|
| **官网** | https://platform.openai.com |
| **一句话定位** | 全球领先的通用大模型服务，GPT-4系列模型行业标杆 |
| **适用场景** | 对话生成、代码编写、复杂推理、内容创作 |
| **快速上手** | ```python
import openairesponse = openai.ChatCompletion.create(    model="gpt-4",    messages=[{"role": "user", "content": "Hello!"}])print(response.choices[0].message.content)``` |

###### A.1.2 通义千问（Qwen）

| 项目 | 内容 |
|------|------|
| **官网** | https://tongyi.aliyun.com/qianwen/ |
| **GitHub** | https://github.com/QwenLM/Qwen |
| **一句话定位** | 阿里云开源大模型，中文能力强，支持长上下文 |
| **适用场景** | 中文对话、文档分析、Agent开发、私有部署 |
| **快速上手** | ```python
from openai import OpenAIclient = OpenAI(api_key="sk-xxx", base_url="https://dashscope.aliyuncs.com/compatible-mode/v1")response = client.chat.completions.create(model="qwen-plus", messages=[{"role": "user", "content": "你好"}])
print(response.choices[0].message.content)``` |

###### A.1.3 文心一言（ERNIE Bot）

| 项目 | 内容 |
|------|------|
| **官网** | https://yiyan.baidu.com/ |
| **文档** | https://cloud.baidu.com/doc/wenxinworkshop/s/6lkhf37n9 |
| **一句话定位** | 百度自研大模型，深度融合中文知识与搜索能力 |
| **适用场景** | 中文智能问答、内容生成、百度生态集成 |
| **快速上手** | ```python
import ernieboterniebot.api_type = 'aistudio'erniebot.access_token = ''
response = erniebot.ChatCompletion.create(model='ernie-4.0-8k-latest', messages=[{'role': 'user', 'content': '你好'}])``` |

###### A.1.4 DeepSeek

| 项目 | 内容 |
|------|------|
| **官网** | https://www.deepseek.com/ |
| **API文档** | https://platform.deepseek.com/docs |
| **一句话定位** | 国产开源大模型，代码能力出色，推理成本低 |
| **适用场景** | 代码生成、数学推理、高性价比私有部署 |
| **快速上手** | ```python
from openai import OpenAIclient = OpenAI(api_key="sk-xxx", base_url="https://api.deepseek.com")response = client.chat.completions.create(model="deepseek-chat", messages=[{"role": "user", "content": "用Python实现快速排序"}])
print(response.choices[0].message.content)``` |

###### A.1.5 智谱AI（GLM）

| 项目 | 内容 |
|------|------|
| **官网** | https://www.zhipuai.cn/ |
| **API文档** | https://open.bigmodel.cn/dev/api |
| **一句话定位** | 清华智谱自研大模型，ChatGLM系列开源影响力大 |
| **适用场景** | 对话交互、Agent开发、中英双语任务 |
| **快速上手** | ```python
from zhipuai import ZhipuAIclient = ZhipuAI(api_key="xxx")response = client.chat.completions.create(model="glm-4", messages=[{"role": "user", "content": "你好"}])
print(response.choices[0].message.content)``` |

###### A.1.6 Moonshot（月之暗面Kimi）

| 项目 | 内容 |
|------|------|
| **官网** | https://www.moonshot.cn/ |
| **API文档** | https://platform.moonshot.cn/docs |
| **一句话定位** | 支持超长上下文（128K），擅长长文档处理 |
| **适用场景** | 长文本分析、合同审核、论文总结 |
| **快速上手** | ```python
from openai import OpenAI
client = OpenAI(api_key="sk-xxx", base_url="https://api.moonshot.cn/v1")response = client.chat.completions.create(model="moonshot-v1-128k", messages=[{"role": "user", "content": "分析这份长文档的核心观点"}])
print(response.choices[0].message.content)``` |

###### A.1.7 vLLM

| 项目 | 内容 |
|------|------|
| **官网** | https://docs.vllm.ai/ |
| **GitHub** | https://github.com/vllm-project/vllm |
| **一句话定位** | 高性能LLM推理框架，PagedAttention实现高效显存管理 |
| **适用场景** | 生产环境LLM服务、高并发推理、私有模型部署 |
| **快速上手** | ```bash# 启动vLLM服务
python -m vllm.entrypoints.openai.api_server --model Qwen/Qwen2-7B-Instruct --port 8000``` |

###### A.1.8 Ollama

| 项目 | 内容 |
|------|------|
| **官网** | https://ollama.com/ |
| **GitHub** | https://github.com/ollama/ollama |
| **一句话定位** | 本地大模型运行工具，一键部署开源模型 |
| **适用场景** | 本地开发测试、个人学习、离线环境 |
| **快速上手** | ```bash# 安装并运行模型
ollama pull llama3
ollama run llama3 "解释什么是RAG"``` |

---

#### A.2 框架与编排

###### A.2.1 LangChain

| 项目 | 内容 |
|------|------|
| **官网** | https://www.langchain.com/ |
| **GitHub** | https://github.com/langchain-ai/langchain |
| **一句话定位** | 大模型应用开发基础框架，提供组件化抽象 |
| **适用场景** | Chain构建、Prompt管理、工具调用、多模态处理 |
| **快速上手** | ```python
from langchain_openai import ChatOpenAI
from langchain.prompts import PromptTemplate
llm = ChatOpenAI(model="gpt-4")prompt = PromptTemplate.from_template("用{language}实现{algorithm}")chain = prompt | llm
print(chain.invoke({"language": "Python", "algorithm": "快速排序"}))``` |

###### A.2.2 LangGraph

| 项目 | 内容 |
|------|------|
| **官网** | https://langchain-ai.github.io/langgraph/ |
| **GitHub** | https://github.com/langchain-ai/langgraph |
| **一句话定位** | 基于LangChain的循环任务编排，支撑复杂Agent流程 |
| **适用场景** | 多步骤Agent、循环推理、工作流编排、状态机开发 |
| **快速上手** | ```python
from langgraph.graph import StateGraph, START, END
from langgraph.graph import MessagesState
def should_continue(state): return "end" if len(state["messages"]) > 5 else "continue"
workflow = StateGraph(MessagesState)
workflow.add_node("call_model", lambda state: {"messages": [llm.invoke(state["messages"])]})
workflow.add_edge(START, "call_model")
workflow.add_edge("call_model", should_continue)
app = workflow.compile()``` |

###### A.2.3 LlamaIndex

| 项目 | 内容 |
|------|------|
| **官网** | https://www.llamaindex.ai/ |
| **GitHub** | https://github.com/run-llama/llama_index |
| **一句话定位** | 专注RAG的数据框架，提供强大的数据索引与检索能力 |
| **适用场景** | RAG开发、私域知识库、文档问答、上下文增强 |
| **快速上手** | ```python
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader
documents = SimpleDirectoryReader("./data").load_data()index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()
print(query_engine.query("核心内容是什么？"))``` |

###### A.2.4 CrewAI

| 项目 | 内容 |
|------|------|
| **官网** | https://www.crewai.io/ |
| **GitHub** | https://github.com/joaomdmoura/crewai |
| **一句话定位** | 多Agent协作框架，强调角色分工与任务委派 |
| **适用场景** | 多Agent团队协作、复杂任务分解与并行执行 |
| **快速上手** | ```python
from crewai import Agent, Task, Crew
researcher = Agent(role="研究员", goal="调研AI趋势", backstory="专业科技分析师", verbose=True)
research_task = Task(description="分析2024年AI大模型进展", agent=researcher)
crew = Crew(agents=[researcher], tasks=[research_task])
result = crew.kickoff()``` |

###### A.2.5 AutoGen

| 项目 | 内容 |
|------|------|
| **官网** | https://microsoft.github.io/autogen/ |
| **GitHub** | https://github.com/microsoft/autogen |
| **一句话定位** | 微软开源多Agent对话框架，支持人机协作 |
| **适用场景** | 多Agent对话、代码生成与执行、人机协同任务 |
| **快速上手** | ```python
from autogen import ConversableAgent
assistant = ConversableAgent("assistant", llm_config={"model": "gpt-4"})user_proxy = ConversableAgent("user", human_input_mode="NEVER")
chat_result = user_proxy.initiate_chat(assistant, message="帮我写一个Hello World程序")``` |

###### A.2.6 Dify

| 项目 | 内容 |
|------|------|
| **官网** | https://dify.ai/ |
| **GitHub** | https://github.com/langgenius/dify |
| **一句话定位** | 开源LLM应用开发平台，低代码构建AI工作流 |
| **适用场景** | 快速原型开发、企业级AI应用、非技术人员友好 |
| **快速上手** | ```bash# Docker部署Dify
git clone https://github.com/langgenius/dify.git
cd dify/docker
docker-compose up -d
# 访问 http://localhost:80``` |

###### A.2.7 Coze（扣子）

| 项目 | 内容 |
|------|------|
| **官网** | https://www.coze.cn/ |
| **一句话定位** | 字节跳动一站式AI应用开发平台，集成Bot开发与发布 |
| **适用场景** | 快速搭建聊天机器人、工作流编排、插件开发 |
| **快速上手** | ```python# Coze API调用示例
import requests
response = requests.post("https://api.coze.com/v1/chat", headers={"Authorization": "Bearer $API_TOKEN"}, json={"bot_id": "$BOT_ID", "user_id": "user_123", "query": "你好"})``` |

---

#### A.3 向量数据库

###### A.3.1 Chroma

| 项目 | 内容 |
|------|------|
| **官网** | https://www.trychroma.com/ |
| **GitHub** | https://github.com/chroma-core/chroma |
| **一句话定位** | 轻量级嵌入式向量数据库，开发友好，适合快速原型 |
| **适用场景** | 原型开发、Small Data RAG、Python原生集成 |
| **快速上手** | ```python
import chromadb
client = chromadb.Client()collection = client.create_collection("documents")collection.add(ids=["1"], embeddings=[[0.1, 0.2]], documents=["示例文档"])
results = collection.query(query_embeddings=[[0.1, 0.2]], n_results=1)``` |

###### A.3.2 Qdrant

| 项目 | 内容 |
|------|------|
| **官网** | https://qdrant.tech/ |
| **GitHub** | https://github.com/qdrant/qdrant |
| **一句话定位** | 高性能向量数据库，支持过滤条件与混合搜索 |
| **适用场景** | 生产级RAG、密集检索+稀疏检索混合、实时推荐 |
| **快速上手** | ```python
from qdrant_client import QdrantClient
client = QdrantClient(url="http://localhost:6333")client.upload_collection(collection_name="docs", vectors={"1": [0.1, 0.2]}, payload=[{"text": "文档内容"}])
results = client.search(collection_name="docs", query_vector=[0.1, 0.2], limit=5)``` |

###### A.3.3 Milvus

| 项目 | 内容 |
|------|------|
| **官网** | https://milvus.io/ |
| **GitHub** | https://github.com/milvus-io/milvus |
| **一句话定位** | 云原生分布式向量数据库，支撑十亿级向量检索 |
| **适用场景** | 超大规模向量检索、企业级应用、多模态搜索 |
| **快速上手** | ```python
from pymilvus import connections, Collection
connections.connect(host="localhost", port="19530")
collection = Collection("documents")collection.load()
results = collection.search(data=[[0.1, 0.2]], anns_field="vector", limit=10)``` |

###### A.3.4 Pinecone

| 项目 | 内容 |
|------|------|
| **官网** | https://www.pinecone.io/ |
| **一句话定位** | 全托管云向量数据库，零运维即用的Serverless服务 |
| **适用场景** | 云原生应用、快速上线、无需运维基础设施 |
| **快速上手** | ```python
import pinecone
pinecone.init(api_key="xxx", environment="us-west1-gcp")pinecone.create_index("documents", dimension=1536)index = pinecone.Index("documents")index.upsert([("1", [0.1]*1536, {"text": "文档内容"})])
results = index.query(vector=[0.1]*1536, top_k=5)``` |

###### A.3.5 Weaviate

| 项目 | 内容 |
|------|------|
| **官网** | https://weaviate.io/ |
| **GitHub** | https://github.com/weaviate/weaviate |
| **一句话定位** | 矢量搜索引擎，原生支持混合搜索与知识图谱 |
| **适用场景** | 混合搜索（向量+关键词）、知识图谱增强、多模态 |
| **快速上手** | ```python
import weaviate
client = weaviate.Client("http://localhost:8080")client.data_object.create(class_name="Document", properties={"content": "文档内容"})
results = client.query.get("Document", ["content"]).with_near_vector({"vector": [0.1, 0.2]}).do()``` |

---

#### A.4 Embedding模型

###### A.4.1 OpenAI Embeddings

| 项目 | 内容 |
|------|------|
| **官网** | https://platform.openai.com/docs/guides/embeddings |
| **一句话定位** | text-embedding-ada-002/text-embedding-3系列，标准化程度高 |
| **适用场景** | 通用文本嵌入、跨模态应用、快速集成 |
| **快速上手** | ```python
import openai
response = openai.Embedding.create(input="要嵌入的文本", model="text-embedding-3-small")
embedding = response.data[0].embedding``` |

###### A.4.2 BGE（BAAI General Embedding）

| 项目 | 内容 |
|------|------|
| **官网** | https://github.com/FlagOpen/FlagEmbedding |
| **一句话定位** | 智谱BGE系列开源模型，中文能力优秀，支持多语言 |
| **适用场景** | 中文RAG、私有部署、国产化适配 |
| **快速上手** | ```python
from FlagEmbedding import BGEM3FlagModel
model = BGEM3FlagModel("BAAI/bge-m3", use_fp16=True)
embeddings = model.encode("要嵌入的文本")["dense_vectors"]``` |

###### A.4.3 GTE（General Text Embedding）

| 项目 | 内容 |
|------|------|
| **官网** | https://modelscope.cn/models/TongyiFinance/gte-collection |
| **一句话定位** | 阿里通义开源Embedding模型，支持中英双语 |
| **适用场景** | 双语文档检索、跨境应用、阿里云集成 |
| **快速上手** | ```python
from modelscope import AutoModelForSequenceEmbedding
model = AutoModelForSequenceEmbedding.from_pretrained("gte-large-zh")
result = model.encode([["中文文本", "English text"]])``` |

###### A.4.4 Jina Embeddings

| 项目 | 内容 |
|------|------|
| **官网** | https://jina.ai/embeddings/ |
| **一句话定位** | Jina AI开源Embedding服务，支持长上下文与多语言 |
| **适用场景** | 长文档嵌入、开发者友好、多语言应用 |
| **快速上手** | ```python
import requests
response = requests.post("https://api.jina.ai/v1/embeddings", headers={"Authorization": "Bearer jina_xxx"}, json={"input": "文本", "model": "jina-embeddings-v3"})``` |

###### A.4.5 Cohere Embeddings

| 项目 | 内容 |
|------|------|
| **官网** | https://cohere.com/embed |
| **一句话定位** | Cohere Embed v3支持100+语言，高维嵌入精度优异 |
| **适用场景** | 多语言应用、企业级搜索、国际化RAG |
| **快速上手** | ```python
import cohere
co = cohere.Client("xxx")
response = co.embed(texts=["文本"], model="embed-english-v3.0")
embedding = response.embeddings[0]``` |

---

#### A.5 重排序模型

###### A.5.1 Cohere Rerank

| 项目 | 内容 |
|------|------|
| **官网** | https://cohere.com/rerank |
| **一句话定位** | 基于LLM的排序模型，显著提升检索结果相关性 |
| **适用场景** | 检索结果精排、多候选排序、搜索增强 |
| **快速上手** | ```python
response = co.rerank(query="查询", documents=["文档1", "文档2"], model="rerank-multilingual-v3.0", top_n=3)
for result in response.results:
    print(f"文档: {result.document.text}, 分数: {result.relevance_score}")``` |

###### A.5.2 BGE-Reranker

| 项目 | 内容 |
|------|------|
| **GitHub** | https://github.com/FlagOpen/FlagEmbedding |
| **一句话定位** | BAAI开源重排序模型，中文场景效果好 |
| **适用场景** | 国产化RAG流水线、中文检索精排 |
| **快速上手** | ```python
from FlagEmbedding import FlagReranker
reranker = FlagReranker("BAAI/bge-reranker-v2-m3", use_fp16=True)
scores = reranker.compute_score([[query, doc] for doc in documents])``` |

###### A.5.3 BCE Reranker

| 项目 | 内容 |
|------|------|
| **GitHub** | https://github.com/netease-youdao/bce-reranker |
| **一句话定位** | 网易有道开源中文重排序模型，高效易用 |
| **适用场景** | 中文文档精排、教育/知识库场景 |
| **快速上手** | ```python
from bcere Reranker import BCEReranker
reranker = BCEReranker("bce-reranker-base-v1")
scores = reranker rerank(query, documents, top_k=10)``` |

---

#### A.6 部署工具

###### A.6.1 FastAPI

| 项目 | 内容 |
|------|------|
| **官网** | https://fastapi.tiangolo.com/ |
| **GitHub** | https://github.com/tiangolo/fastapi |
| **一句话定位** | 现代Python Web框架，自动生成API文档，性能优秀 |
| **适用场景** | LLM API封装、RAG服务发布、模型推理接口 |
| **快速上手** | ```python
from fastapi import FastAPI
app = FastAPI()
@app.post("/chat")
async def chat(message: str):
    return {"response": f"收到: {message}"}``` |

###### A.6.2 Docker

| 项目 | 内容 |
|------|------|
| **官网** | https://www.docker.com/ |
| **一句话定位** | 容器化平台，实现应用与环境的一致性交付 |
| **适用场景** | 模型服务打包、环境隔离、一键部署 |
| **快速上手** | ```dockerfile# Dockerfile示例
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]``` |

###### A.6.3 Docker Compose

| 项目 | 内容 |
|------|------|
| **官网** | https://docs.docker.com/compose/ |
| **一句话定位** | 多容器编排工具，定义和管理多服务应用 |
| **适用场景** | RAG全链路部署（LLM+向量库+API）、本地开发环境 |
| **快速上手** | ```yamlversion: '3.8'
services:
  api:
    build: .
    ports:
      - "8000:8000"
  qdrant:
    image: qdrant/qdrant
    ports:
      - "6333:6333"``` |

###### A.6.4 Kubernetes

| 项目 | 内容 |
|------|------|
| **官网** | https://kubernetes.io/ |
| **一句话定位** | 容器编排平台，支撑生产级弹性扩缩容 |
| **适用场景** | 企业级AI服务编排、微服务治理、高可用部署 |
| **快速上手** | ```yamlapiVersion: apps/v1
kind: Deployment
metadata:
  name: llm-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: llm
  template:
    spec:
      containers:
      - name: api
        image: my-llm-api:latest
        ports:
        - containerPort: 8000``` |

---

#### A.7 数据与文档处理

###### A.7.1 LlamaParse

| 项目 | 内容 |
|------|------|
| **官网** | https://cloud.llamaindex.ai/parse |
| **一句话定位** | 专为LLM优化的文档解析服务，支持复杂PDF结构 |
| **适用场景** | 复杂文档RAG、表格提取、多页布局解析 |
| **快速上手** | ```python
from llama_parse import LlamaParse
parser = LlamaParse(api_key="llx-xxx", result_type="markdown") **使用提示**：
> - 本速查表按开发流程排列，建议从「大模型服务」→「框架编排」→「向量数据库」→「Embedding」→「文档处理」→「部署工具」的顺序了解工具链全貌。
> - 快速上手代码均为最小可运行示例，实际使用时需替换API Key、模型名等配置。
> - 生产环境建议关注各工具的官方文档更新，获取最新版本特性和最佳实践。
