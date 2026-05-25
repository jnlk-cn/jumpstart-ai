---
outline: [2, 3]
---

# 附录A AI应用开发工具速查表

本附录整理了AI应用开发全流程中常用的工具，按功能类别分组。每个工具均提供官方链接、核心定位、适用场景及快速上手命令，方便在实际项目中快速查阅。

---

## A.1 大模型服务

### A.1.1 OpenAI

| 项目 | 内容 |
|------|------|
| **官网** | https://platform.openai.com |
| **一句话定位** | 全球领先的通用大模型服务，GPT-4系列模型行业标杆 |
| **适用场景** | 对话生成、代码编写、复杂推理、内容创作 |
| **快速上手** | ```python<br/>import openai<br/>response = openai.ChatCompletion.create(<br/>    model="gpt-4",<br/>    messages=[{"role": "user", "content": "Hello!"}]<br/>)<br/>print(response.choices[0].message.content)``` |

### A.1.2 通义千问（Qwen）

| 项目 | 内容 |
|------|------|
| **官网** | https://tongyi.aliyun.com/qianwen/ |
| **GitHub** | https://github.com/QwenLM/Qwen |
| **一句话定位** | 阿里云开源大模型，中文能力强，支持长上下文 |
| **适用场景** | 中文对话、文档分析、Agent开发、私有部署 |
| **快速上手** | ```python<br/>from openai import OpenAI<br/>client = OpenAI(api_key="sk-xxx", base_url="https://dashscope.aliyuncs.com/compatible-mode/v1")<br/>response = client.chat.completions.create(model="qwen-plus", messages=[{"role": "user", "content": "你好"}])\nprint(response.choices[0].message.content)``` |

### A.1.3 文心一言（ERNIE Bot）

| 项目 | 内容 |
|------|------|
| **官网** | https://yiyan.baidu.com/ |
| **文档** | https://cloud.baidu.com/doc/wenxinworkshop/s/6lkhf37n9 |
| **一句话定位** | 百度自研大模型，深度融合中文知识与搜索能力 |
| **适用场景** | 中文智能问答、内容生成、百度生态集成 |
| **快速上手** | ```python<br/>import erniebot<br/>erniebot.api_type = 'aistudio'<br/>erniebot.access_token = '<access_token>'\nresponse = erniebot.ChatCompletion.create(model='ernie-4.0-8k-latest', messages=[{'role': 'user', 'content': '你好'}])``` |

### A.1.4 DeepSeek

| 项目 | 内容 |
|------|------|
| **官网** | https://www.deepseek.com/ |
| **API文档** | https://platform.deepseek.com/docs |
| **一句话定位** | 国产开源大模型，代码能力出色，推理成本低 |
| **适用场景** | 代码生成、数学推理、高性价比私有部署 |
| **快速上手** | ```python<br/>from openai import OpenAI<br/>client = OpenAI(api_key="sk-xxx", base_url="https://api.deepseek.com")<br/>response = client.chat.completions.create(model="deepseek-chat", messages=[{"role": "user", "content": "用Python实现快速排序"}])\nprint(response.choices[0].message.content)``` |

### A.1.5 智谱AI（GLM）

| 项目 | 内容 |
|------|------|
| **官网** | https://www.zhipuai.cn/ |
| **API文档** | https://open.bigmodel.cn/dev/api |
| **一句话定位** | 清华智谱自研大模型，ChatGLM系列开源影响力大 |
| **适用场景** | 对话交互、Agent开发、中英双语任务 |
| **快速上手** | ```python<br/>from zhipuai import ZhipuAI<br/>client = ZhipuAI(api_key="xxx")response = client.chat.completions.create(model="glm-4", messages=[{"role": "user", "content": "你好"}])\nprint(response.choices[0].message.content)``` |

### A.1.6 Moonshot（月之暗面Kimi）

| 项目 | 内容 |
|------|------|
| **官网** | https://www.moonshot.cn/ |
| **API文档** | https://platform.moonshot.cn/docs |
| **一句话定位** | 支持超长上下文（128K），擅长长文档处理 |
| **适用场景** | 长文本分析、合同审核、论文总结 |
| **快速上手** | ```python<br/>from openai import OpenAI\nclient = OpenAI(api_key="sk-xxx", base_url="https://api.moonshot.cn/v1")<br/>response = client.chat.completions.create(model="moonshot-v1-128k", messages=[{"role": "user", "content": "分析这份长文档的核心观点"}])\nprint(response.choices[0].message.content)``` |

### A.1.7 vLLM

| 项目 | 内容 |
|------|------|
| **官网** | https://docs.vllm.ai/ |
| **GitHub** | https://github.com/vllm-project/vllm |
| **一句话定位** | 高性能LLM推理框架，PagedAttention实现高效显存管理 |
| **适用场景** | 生产环境LLM服务、高并发推理、私有模型部署 |
| **快速上手** | ```bash<br/># 启动vLLM服务\npython -m vllm.entrypoints.openai.api_server --model Qwen/Qwen2-7B-Instruct --port 8000``` |

### A.1.8 Ollama

| 项目 | 内容 |
|------|------|
| **官网** | https://ollama.com/ |
| **GitHub** | https://github.com/ollama/ollama |
| **一句话定位** | 本地大模型运行工具，一键部署开源模型 |
| **适用场景** | 本地开发测试、个人学习、离线环境 |
| **快速上手** | ```bash<br/># 安装并运行模型\nollama pull llama3\nollama run llama3 "解释什么是RAG"``` |

---

## A.2 框架与编排

### A.2.1 LangChain

| 项目 | 内容 |
|------|------|
| **官网** | https://www.langchain.com/ |
| **GitHub** | https://github.com/langchain-ai/langchain |
| **一句话定位** | 大模型应用开发基础框架，提供组件化抽象 |
| **适用场景** | Chain构建、Prompt管理、工具调用、多模态处理 |
| **快速上手** | ```python<br/>from langchain_openai import ChatOpenAI\nfrom langchain.prompts import PromptTemplate\nllm = ChatOpenAI(model="gpt-4")prompt = PromptTemplate.from_template("用{language}实现{algorithm}")chain = prompt | llm\nprint(chain.invoke({"language": "Python", "algorithm": "快速排序"}))``` |

### A.2.2 LangGraph

| 项目 | 内容 |
|------|------|
| **官网** | https://langchain-ai.github.io/langgraph/ |
| **GitHub** | https://github.com/langchain-ai/langgraph |
| **一句话定位** | 基于LangChain的循环任务编排，支撑复杂Agent流程 |
| **适用场景** | 多步骤Agent、循环推理、工作流编排、状态机开发 |
| **快速上手** | ```python<br/>from langgraph.graph import StateGraph, START, END\nfrom langgraph.graph import MessagesState\ndef should_continue(state): return "end" if len(state["messages"]) > 5 else "continue"\nworkflow = StateGraph(MessagesState)\nworkflow.add_node("call_model", lambda state: {"messages": [llm.invoke(state["messages"])]})\nworkflow.add_edge(START, "call_model")\nworkflow.add_edge("call_model", should_continue)\napp = workflow.compile()``` |

### A.2.3 LlamaIndex

| 项目 | 内容 |
|------|------|
| **官网** | https://www.llamaindex.ai/ |
| **GitHub** | https://github.com/run-llama/llama_index |
| **一句话定位** | 专注RAG的数据框架，提供强大的数据索引与检索能力 |
| **适用场景** | RAG开发、私域知识库、文档问答、上下文增强 |
| **快速上手** | ```python<br/>from llama_index.core import VectorStoreIndex, SimpleDirectoryReader\ndocuments = SimpleDirectoryReader("./data").load_data()index = VectorStoreIndex.from_documents(documents)\nquery_engine = index.as_query_engine()\nprint(query_engine.query("核心内容是什么？"))``` |

### A.2.4 CrewAI

| 项目 | 内容 |
|------|------|
| **官网** | https://www.crewai.io/ |
| **GitHub** | https://github.com/joaomdmoura/crewai |
| **一句话定位** | 多Agent协作框架，强调角色分工与任务委派 |
| **适用场景** | 多Agent团队协作、复杂任务分解与并行执行 |
| **快速上手** | ```python<br/>from crewai import Agent, Task, Crew\nresearcher = Agent(role="研究员", goal="调研AI趋势", backstory="专业科技分析师", verbose=True)\nresearch_task = Task(description="分析2024年AI大模型进展", agent=researcher)\ncrew = Crew(agents=[researcher], tasks=[research_task])\nresult = crew.kickoff()``` |

### A.2.5 AutoGen

| 项目 | 内容 |
|------|------|
| **官网** | https://microsoft.github.io/autogen/ |
| **GitHub** | https://github.com/microsoft/autogen |
| **一句话定位** | 微软开源多Agent对话框架，支持人机协作 |
| **适用场景** | 多Agent对话、代码生成与执行、人机协同任务 |
| **快速上手** | ```python<br/>from autogen import ConversableAgent\nassistant = ConversableAgent("assistant", llm_config={"model": "gpt-4"})user_proxy = ConversableAgent("user", human_input_mode="NEVER")\nchat_result = user_proxy.initiate_chat(assistant, message="帮我写一个Hello World程序")``` |

### A.2.6 Dify

| 项目 | 内容 |
|------|------|
| **官网** | https://dify.ai/ |
| **GitHub** | https://github.com/langgenius/dify |
| **一句话定位** | 开源LLM应用开发平台，低代码构建AI工作流 |
| **适用场景** | 快速原型开发、企业级AI应用、非技术人员友好 |
| **快速上手** | ```bash<br/># Docker部署Dify\ngit clone https://github.com/langgenius/dify.git\ncd dify/docker\ndocker-compose up -d\n# 访问 http://localhost:80``` |

### A.2.7 Coze（扣子）

| 项目 | 内容 |
|------|------|
| **官网** | https://www.coze.cn/ |
| **一句话定位** | 字节跳动一站式AI应用开发平台，集成Bot开发与发布 |
| **适用场景** | 快速搭建聊天机器人、工作流编排、插件开发 |
| **快速上手** | ```python<br/># Coze API调用示例\nimport requests\nresponse = requests.post("https://api.coze.com/v1/chat", headers={"Authorization": "Bearer $API_TOKEN"}, json={"bot_id": "$BOT_ID", "user_id": "user_123", "query": "你好"})``` |

---

## A.3 向量数据库

### A.3.1 Chroma

| 项目 | 内容 |
|------|------|
| **官网** | https://www.trychroma.com/ |
| **GitHub** | https://github.com/chroma-core/chroma |
| **一句话定位** | 轻量级嵌入式向量数据库，开发友好，适合快速原型 |
| **适用场景** | 原型开发、Small Data RAG、Python原生集成 |
| **快速上手** | ```python<br/>import chromadb\nclient = chromadb.Client()collection = client.create_collection("documents")collection.add(ids=["1"], embeddings=[[0.1, 0.2]], documents=["示例文档"])\nresults = collection.query(query_embeddings=[[0.1, 0.2]], n_results=1)``` |

### A.3.2 Qdrant

| 项目 | 内容 |
|------|------|
| **官网** | https://qdrant.tech/ |
| **GitHub** | https://github.com/qdrant/qdrant |
| **一句话定位** | 高性能向量数据库，支持过滤条件与混合搜索 |
| **适用场景** | 生产级RAG、密集检索+稀疏检索混合、实时推荐 |
| **快速上手** | ```python<br/>from qdrant_client import QdrantClient\nclient = QdrantClient(url="http://localhost:6333")client.upload_collection(collection_name="docs", vectors={"1": [0.1, 0.2]}, payload=[{"text": "文档内容"}])\nresults = client.search(collection_name="docs", query_vector=[0.1, 0.2], limit=5)``` |

### A.3.3 Milvus

| 项目 | 内容 |
|------|------|
| **官网** | https://milvus.io/ |
| **GitHub** | https://github.com/milvus-io/milvus |
| **一句话定位** | 云原生分布式向量数据库，支撑十亿级向量检索 |
| **适用场景** | 超大规模向量检索、企业级应用、多模态搜索 |
| **快速上手** | ```python<br/>from pymilvus import connections, Collection\nconnections.connect(host="localhost", port="19530")\ncollection = Collection("documents")collection.load()\nresults = collection.search(data=[[0.1, 0.2]], anns_field="vector", limit=10)``` |

### A.3.4 Pinecone

| 项目 | 内容 |
|------|------|
| **官网** | https://www.pinecone.io/ |
| **一句话定位** | 全托管云向量数据库，零运维即用的Serverless服务 |
| **适用场景** | 云原生应用、快速上线、无需运维基础设施 |
| **快速上手** | ```python<br/>import pinecone\npinecone.init(api_key="xxx", environment="us-west1-gcp")pinecone.create_index("documents", dimension=1536)index = pinecone.Index("documents")index.upsert([("1", [0.1]*1536, {"text": "文档内容"})])\nresults = index.query(vector=[0.1]*1536, top_k=5)``` |

### A.3.5 Weaviate

| 项目 | 内容 |
|------|------|
| **官网** | https://weaviate.io/ |
| **GitHub** | https://github.com/weaviate/weaviate |
| **一句话定位** | 矢量搜索引擎，原生支持混合搜索与知识图谱 |
| **适用场景** | 混合搜索（向量+关键词）、知识图谱增强、多模态 |
| **快速上手** | ```python<br/>import weaviate\nclient = weaviate.Client("http://localhost:8080")client.data_object.create(class_name="Document", properties={"content": "文档内容"})\nresults = client.query.get("Document", ["content"]).with_near_vector({"vector": [0.1, 0.2]}).do()``` |

---

## A.4 Embedding模型

### A.4.1 OpenAI Embeddings

| 项目 | 内容 |
|------|------|
| **官网** | https://platform.openai.com/docs/guides/embeddings |
| **一句话定位** | text-embedding-ada-002/text-embedding-3系列，标准化程度高 |
| **适用场景** | 通用文本嵌入、跨模态应用、快速集成 |
| **快速上手** | ```python<br/>import openai\nresponse = openai.Embedding.create(input="要嵌入的文本", model="text-embedding-3-small")\nembedding = response.data[0].embedding``` |

### A.4.2 BGE（BAAI General Embedding）

| 项目 | 内容 |
|------|------|
| **官网** | https://github.com/FlagOpen/FlagEmbedding |
| **一句话定位** | 智谱BGE系列开源模型，中文能力优秀，支持多语言 |
| **适用场景** | 中文RAG、私有部署、国产化适配 |
| **快速上手** | ```python<br/>from FlagEmbedding import BGEM3FlagModel\nmodel = BGEM3FlagModel("BAAI/bge-m3", use_fp16=True)\nembeddings = model.encode("要嵌入的文本")["dense_vectors"]``` |

### A.4.3 GTE（General Text Embedding）

| 项目 | 内容 |
|------|------|
| **官网** | https://modelscope.cn/models/TongyiFinance/gte-collection |
| **一句话定位** | 阿里通义开源Embedding模型，支持中英双语 |
| **适用场景** | 双语文档检索、跨境应用、阿里云集成 |
| **快速上手** | ```python<br/>from modelscope import AutoModelForSequenceEmbedding\nmodel = AutoModelForSequenceEmbedding.from_pretrained("gte-large-zh")\nresult = model.encode([["中文文本", "English text"]])``` |

### A.4.4 Jina Embeddings

| 项目 | 内容 |
|------|------|
| **官网** | https://jina.ai/embeddings/ |
| **一句话定位** | Jina AI开源Embedding服务，支持长上下文与多语言 |
| **适用场景** | 长文档嵌入、开发者友好、多语言应用 |
| **快速上手** | ```python<br/>import requests\nresponse = requests.post("https://api.jina.ai/v1/embeddings", headers={"Authorization": "Bearer jina_xxx"}, json={"input": "文本", "model": "jina-embeddings-v3"})``` |

### A.4.5 Cohere Embeddings

| 项目 | 内容 |
|------|------|
| **官网** | https://cohere.com/embed |
| **一句话定位** | Cohere Embed v3支持100+语言，高维嵌入精度优异 |
| **适用场景** | 多语言应用、企业级搜索、国际化RAG |
| **快速上手** | ```python<br/>import cohere\nco = cohere.Client("xxx")\nresponse = co.embed(texts=["文本"], model="embed-english-v3.0")\nembedding = response.embeddings[0]``` |

---

## A.5 重排序模型

### A.5.1 Cohere Rerank

| 项目 | 内容 |
|------|------|
| **官网** | https://cohere.com/rerank |
| **一句话定位** | 基于LLM的排序模型，显著提升检索结果相关性 |
| **适用场景** | 检索结果精排、多候选排序、搜索增强 |
| **快速上手** | ```python<br/>response = co.rerank(query="查询", documents=["文档1", "文档2"], model="rerank-multilingual-v3.0", top_n=3)\nfor result in response.results:\n    print(f"文档: {result.document.text}, 分数: {result.relevance_score}")``` |

### A.5.2 BGE-Reranker

| 项目 | 内容 |
|------|------|
| **GitHub** | https://github.com/FlagOpen/FlagEmbedding |
| **一句话定位** | BAAI开源重排序模型，中文场景效果好 |
| **适用场景** | 国产化RAG流水线、中文检索精排 |
| **快速上手** | ```python<br/>from FlagEmbedding import FlagReranker\nreranker = FlagReranker("BAAI/bge-reranker-v2-m3", use_fp16=True)\nscores = reranker.compute_score([[query, doc] for doc in documents])``` |

### A.5.3 BCE Reranker

| 项目 | 内容 |
|------|------|
| **GitHub** | https://github.com/netease-youdao/bce-reranker |
| **一句话定位** | 网易有道开源中文重排序模型，高效易用 |
| **适用场景** | 中文文档精排、教育/知识库场景 |
| **快速上手** | ```python<br/>from bcere Reranker import BCEReranker\nreranker = BCEReranker("bce-reranker-base-v1")\nscores = reranker rerank(query, documents, top_k=10)``` |

---

## A.6 部署工具

### A.6.1 FastAPI

| 项目 | 内容 |
|------|------|
| **官网** | https://fastapi.tiangolo.com/ |
| **GitHub** | https://github.com/tiangolo/fastapi |
| **一句话定位** | 现代Python Web框架，自动生成API文档，性能优秀 |
| **适用场景** | LLM API封装、RAG服务发布、模型推理接口 |
| **快速上手** | ```python<br/>from fastapi import FastAPI\napp = FastAPI()\n@app.post("/chat")\nasync def chat(message: str):\n    return {"response": f"收到: {message}"}``` |

### A.6.2 Docker

| 项目 | 内容 |
|------|------|
| **官网** | https://www.docker.com/ |
| **一句话定位** | 容器化平台，实现应用与环境的一致性交付 |
| **适用场景** | 模型服务打包、环境隔离、一键部署 |
| **快速上手** | ```dockerfile<br/># Dockerfile示例\nFROM python:3.11-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nCMD ["uvicorn", "main:app", "--host", "0.0.0.0"]``` |

### A.6.3 Docker Compose

| 项目 | 内容 |
|------|------|
| **官网** | https://docs.docker.com/compose/ |
| **一句话定位** | 多容器编排工具，定义和管理多服务应用 |
| **适用场景** | RAG全链路部署（LLM+向量库+API）、本地开发环境 |
| **快速上手** | ```yaml<br/>version: '3.8'\nservices:\n  api:\n    build: .\n    ports:\n      - "8000:8000"\n  qdrant:\n    image: qdrant/qdrant\n    ports:\n      - "6333:6333"``` |

### A.6.4 Kubernetes

| 项目 | 内容 |
|------|------|
| **官网** | https://kubernetes.io/ |
| **一句话定位** | 容器编排平台，支撑生产级弹性扩缩容 |
| **适用场景** | 企业级AI服务编排、微服务治理、高可用部署 |
| **快速上手** | ```yaml<br/>apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: llm-service\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: llm\n  template:\n    spec:\n      containers:\n      - name: api\n        image: my-llm-api:latest\n        ports:\n        - containerPort: 8000``` |

---

## A.7 数据与文档处理

### A.7.1 LlamaParse

| 项目 | 内容 |
|------|------|
| **官网** | https://cloud.llamaindex.ai/parse |
| **一句话定位** | 专为LLM优化的文档解析服务，支持复杂PDF结构 |
| **适用场景** | 复杂文档RAG、表格提取、多页布局解析 |
| **快速上手** | ```python<br/>from llama_parse import LlamaParse\nparser = LlamaParse(api_key="llx-xxx", result_type="markdown")<ndocs = parser.load_data("document.pdf")``` |

### A.7.2 Unstructured

| 项目 | 内容 |
|------|------|
| **官网** | https://unstructured.io/ |
| **GitHub** | https://github.com/Unstructured-IO/unstructured |
| **一句话定位** | 通用文档解析库，支持PDF/Word/HTML等50+格式 |
| **适用场景** | 多格式文档统一处理、企业文档批处理 |
| **快速上手** | ```python<br/>from unstructured.partition.pdf import partition_pdf\nelements = partition_pdf("document.pdf")<nfor el in elements:\n    print(el.text, el.category)``` |

### A.7.3 PyPDF2 / PyMuPDF

| 项目 | 内容 |
|------|------|
| **PyPDF2** | https://github.com/pypdf/pypdf |
| **PyMuPDF** | https://github.com/pymupdf/PyMuPDF |
| **一句话定位** | Python PDF处理库，文本提取与页面操作 |
| **适用场景** | 简单PDF文本提取、页面裁剪、合并拆分 |
| **快速上手** | ```python<br/># PyMuPDF示例\nimport fitz\ndoc = fitz.open("document.pdf")\nfor page in doc:\n    print(page.get_text())\ndoc.close()``` |

### A.7.4 python-docx

| 项目 | 内容 |
|------|------|
| **官网** | https://python-docx.readthedocs.io/ |
| **一句话定位** | Word文档创建与编辑库 |
| **适用场景** | 生成分析报告、批量文档处理、结构化输出 |
| **快速上手** | ```python<br/>from docx import Document\ndoc = Document()\ndoc.add_heading("AI应用开发报告", 0)\ndoc.add_paragraph("本报告分析了RAG技术的最新进展。")\ndoc.save("report.docx")``` |

---

## A.8 监控与调试

### A.8.1 LangSmith

| 项目 | 内容 |
|------|------|
| **官网** | https://docs.smith.langchain.com/ |
| **一句话定位** | LangChain官方调试平台，完整链路追踪与评估 |
| **适用场景** | Chain调试、Prompt优化、离线评估、数据回流 |
| **快速上手** | ```python<br/>import os\nos.environ["LANGCHAIN_TRACING_V2"] = "true"\nos.environ["LANGCHAIN_API_KEY"] = "xxx"\n# 正常使用LangChain，自动追踪所有调用``` |

### A.8.2 Prometheus

| 项目 | 内容 |
|------|------|
| **官网** | https://prometheus.io/ |
| **一句话定位** | 开源监控系统，采集时序指标数据 |
| **适用场景** | 服务指标监控、告警规则配置、数据采集 |
| **快速上手** | ```yaml<br/># prometheus.yml\nscrape_configs:\n  - job_name: 'llm-service'\n    static_configs:\n      - targets: ['localhost:8000']``` |

### A.8.3 Grafana

| 项目 | 内容 |
|------|------|
| **官网** | https://grafana.com/ |
| **一句话定位** | 可视化监控平台，仪表盘与告警一体化 |
| **适用场景** | 监控大屏构建、性能趋势分析、告警通知 |
| **快速上手** | ```bash<br/># Docker快速启动Grafana\ndocker run -d -p 3000:3000 --name=grafana grafana/grafana``` |

---

## A.9 开发工具

### A.9.1 uv

| 项目 | 内容 |
|------|------|
| **官网** | https://astral.sh/uv/ |
| **GitHub** | https://github.com/astral-sh/uv |
| **一句话定位** | Rust编写的极速Python包管理器，替代pip/poetry |
| **适用场景** | 依赖快速安装、项目初始化、环境隔离 |
| **快速上手** | ```bash<br/># 安装uv\ncurl -LsSf https://astral.sh/uv/install.sh | sh\n# 创建项目\nuv init ai-project\ncd ai-project\nuv add langchain-openai\nuv run python main.py``` |

### A.9.2 Jupyter

| 项目 | 内容 |
|------|------|
| **官网** | https://jupyter.org/ |
| **一句话定位** | 交互式Python环境，代码块单元格执行 |
| **适用场景** | 数据探索、模型实验、快速原型验证 |
| **快速上手** | ```bash<br/># 启动Jupyter Lab\npip install jupyterlab\njupyter lab\n# 或使用Jupyter Notebook\npip install notebook\njupyter notebook``` |

### A.9.3 HTTPie

| 项目 | 内容 |
|------|------|
| **官网** | https://httpie.io/ |
| **GitHub** | https://github.com/httpie/httpie |
| **一句话定位** | 人类友好的命令行HTTP客户端 |
| **适用场景** | API调试、LLM服务测试、快速请求验证 |
| **快速上手** | ```bash<br/># 测试OpenAI API\nhttp POST https://api.openai.com/v1/chat/completions \<br/>    Authorization:"Bearer $OPENAI_API_KEY" \<br/>    model="gpt-4" \<br/>    messages:='[{"role": "user", "content": "Hello"}]'``` |

### A.9.4 Git

| 项目 | 内容 |
|------|------|
| **官网** | https://git-scm.com/ |
| **一句话定位** | 分布式版本控制系统，代码协作基础工具 |
| **适用场景** | 代码版本管理、团队协作、分支开发 |
| **快速上手** | ```bash<br/># 初始化仓库\ngit init\n# 添加文件并提交\ngit add .\ngit commit -m "feat: 初始化RAG项目"\n# 关联远程仓库\ngit remote add origin https://github.com/user/repo.git\ngit push -u origin main``` |

---

## 附录工具速查总表

| 类别 | 工具名称 | 官网/GitHub | 核心用途 |
|------|----------|-------------|----------|
| **大模型服务** | OpenAI | platform.openai.com | GPT系列模型API |
| | 通义千问 | tongyi.aliyun.com | 阿里开源模型 |
| | DeepSeek | deepseek.com | 高性价比推理 |
| | 智谱GLM | zhipuai.cn | 清华开源模型 |
| | Moonshot | moonshot.cn | 长上下文处理 |
| | vLLM | vllm.ai | 高性能推理框架 |
| | Ollama | ollama.com | 本地模型运行 |
| **框架编排** | LangChain | langchain.com | 基础开发框架 |
| | LangGraph | langchain-ai.github.io/langgraph | 循环任务编排 |
| | LlamaIndex | llamaindex.ai | RAG数据框架 |
| | CrewAI | crewai.io | 多Agent协作 |
| | AutoGen | microsoft.github.io/autogen | 微软多Agent框架 |
| | Dify | dify.ai | 低代码AI平台 |
| | Coze | coze.cn | 一站式Bot开发 |
| **向量数据库** | Chroma | trychroma.com | 轻量级向量库 |
| | Qdrant | qdrant.tech | 高性能向量引擎 |
| | Milvus | milvus.io | 分布式向量库 |
| | Pinecone | pinecone.io | Serverless向量服务 |
| | Weaviate | weaviate.io | 混合搜索引擎 |
| **Embedding** | OpenAI Embed | platform.openai.com | 通用文本嵌入 |
| | BGE | FlagOpen/FlagEmbedding | 中文Embedding |
| | GTE | modelscope.cn | 通义双语嵌入 |
| | Jina | jina.ai | 长上下文嵌入 |
| | Cohere | cohere.com | 多语言嵌入 |
| **重排序** | Cohere Rerank | cohere.com/rerank | 检索结果精排 |
| | BGE-Reranker | FlagOpen/FlagEmbedding | 中文重排序 |
| | BCE-Reranker | netease-youdao/bce-reranker | 有道重排序 |
| **部署工具** | FastAPI | fastapi.tiangolo.com | Python Web框架 |
| | Docker | docker.com | 容器化平台 |
| | Docker Compose | docs.docker.com/compose | 容器编排 |
| | Kubernetes | kubernetes.io | K8s容器编排 |
| **文档处理** | LlamaParse | cloud.llamaindex.ai | LLM优化解析 |
| | Unstructured | unstructured.io | 多格式解析 |
| | PyMuPDF | github.com/pymupdf | PDF文本提取 |
| | python-docx | python-docx.readthedocs.io | Word文档处理 |
| **监控调试** | LangSmith | smith.langchain.com | LLM链路追踪 |
| | Prometheus | prometheus.io | 指标监控系统 |
| | Grafana | grafana.com | 可视化监控 |
| **开发工具** | uv | astral.sh/uv | 极速包管理 |
| | Jupyter | jupyter.org | 交互式环境 |
| | HTTPie | httpie.io | HTTP调试工具 |
| | Git | git-scm.com | 版本控制 |

---

> **使用提示**：
> - 本速查表按开发流程排列，建议从「大模型服务」→「框架编排」→「向量数据库」→「Embedding」→「文档处理」→「部署工具」的顺序了解工具链全貌。
> - 快速上手代码均为最小可运行示例，实际使用时需替换API Key、模型名等配置。
> - 生产环境建议关注各工具的官方文档更新，获取最新版本特性和最佳实践。
