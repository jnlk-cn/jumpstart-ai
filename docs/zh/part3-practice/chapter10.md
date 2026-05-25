---
outline: deep
---

##### 第10章 LlamaIndex与向量数据库

#### 本章你能带走什么

上一章我们学了LangChain，这家伙擅长的是**把各种组件串起来**——搭Agent、调工具、编排复杂流程。

但你有没有发现一个问题：LangChain虽然能做RAG，但在**数据处理和索引**这块，其实挺薄弱的。文档怎么切、怎么高效存储、怎么精准检索——这些脏活累活，LangChain做起来总有点力不从心。

这就是LlamaIndex的专场了。

如果说LangChain是"流程编排大师"，那LlamaIndex就是"数据索引专家"。它的核心理念是：**让你的私有数据能被大模型高效查询**。

读完这章你会带走：

- LlamaIndex的核心架构和设计理念（与LangChain的分工）
- **高级索引类型详解**：Summary Index、Keyword Table Index、Knowledge Graph Index的选择策略
- **LlamaIndex与LangChain协作**：各自优势边界与混合架构实战
- 向量数据库的选型策略：Chroma / Qdrant / Milvus / Pinecone各自适用场景
- **自建 vs 云服务的成本和运维对比**
- **向量数据库性能优化**：HNSW参数调优、量化技术、分片副本策略
- 索引构建与查询优化的实战技巧
- **混合检索实现**：向量+BM25+知识图谱的融合策略
- **查询路由**：自动选择最佳检索策略
- 用LlamaIndex + 向量数据库搭一个**生产级**私有文档检索系统
- 什么时候用LlamaIndex、什么时候用LangChain、什么时候两者结合

---

#### 10.1 LlamaIndex：专注数据索引与检索

###### LlamaIndex是什么？

先说官话：LlamaIndex是一个专注于**数据连接、索引、检索**的框架，它让大模型能够高效访问你的私有数据。

用人话讲：LangChain告诉你"怎么让AI干活"，LlamaIndex告诉你"怎么让AI知道你的数据"。

###### 核心定位对比

| 维度 | LangChain | LlamaIndex |
|------|-----------|------------|
| **核心定位** | 通用型LLM应用框架 | 文档智能处理框架 |
| **设计理念** | 链（Chain）+ 工具（Tool）组合 | 数据框架（Data Framework）+ 智能索引 |
| **主战场** | 复杂逻辑流、多工具调用、Agent协作 | 文档问答、知识库构建、长文本处理 |
| **数据处理** | 把数据当"资源"接入链 | 把数据当"主角"精心组织 |

打个比方：
- **LangChain** = 乐队指挥，协调各种乐器（模型、工具、记忆）
- **LlamaIndex** = 图书管理员，精心整理书架（文档、索引、检索）

###### 安装与环境配置

```bash
##### 创建虚拟环境
conda create -n llamaindex-env python=3.10
conda activate llamaindex-env

##### 安装核心包
pip install llama-index>=0.11.0

##### 如果用OpenAI模型
pip install llama-index-llms-openai>=0.3.0

##### 常见可选包
pip install llama-index-vector-stores-chroma  # Chroma向量存储
pip install llama-index-vector-stores-qdrant  # Qdrant向量存储
pip install llama-index-embeddings-huggingface  # HuggingFace嵌入
pip install llama-index-readers-file  # 文件读取
pip install llama-index-graph-stores-neo4j  # 知识图谱存储
```

> ⚠️ **版本提示**：LlamaIndex 2025年后更新频繁，建议用0.11以上版本。旧版本API变动较大，碰到问题先查官方文档。

###### 快速上手：5行代码搭建文档问答

```python
"""
LlamaIndex快速上手
运行环境：Python 3.10+, llama-index>=0.11.0
"""

from llama_index.core import VectorStoreIndex, SimpleDirectoryReader

##### 1. 加载文档（丢进data目录的PDF/TXT/MD都会自动识别）
documents = SimpleDirectoryReader("./data").load_data()

##### 2. 构建索引（自动切块 + 向量化 + 存储）
index = VectorStoreIndex.from_documents(documents)

##### 3. 查询（就这3行代码，完事）
query_engine = index.as_query_engine()
response = query_engine.query("这份文档讲了什么？")
print(response)
```

对比一下用LangChain写RAG的代码量，你就知道LlamaIndex在数据处理上有多省心了。

###### 核心概念：Document、Node、Index、QueryEngine

LlamaIndex有四个核心概念，理解它们就理解了大半：

##### 1. Document（文档）

Document是原始数据的载体，可以是PDF、网页、数据库记录等。

```python
from llama_index.core import Document

##### 手动创建文档
doc = Document(
    text="这是一段要索引的文本内容",
    metadata={
        "source": "产品手册.pdf",
        "page": 3,
        "author": "张三",
        "date": "2024-01-15"
    },
    id_="doc_001"  # 可选的唯一ID
)

##### 从文件加载时自动生成metadata
##### metadata包含：file_name, file_type, file_size, page_numbers等
```

##### 2. Node（节点）

Node是Document被切分后的最小数据单元。**Node和Document的区别**：

| 特性 | Document | Node |
|------|----------|------|
| 粒度 | 原始文件级 | 切分后的段落/块 |
| 关系 | 独立存在 | 可以有父子/兄弟关系 |
| 用途 | 加载原始数据 | 构建索引的原子单元 |
| 元信息 | 包含文件级metadata | 包含chunk级metadata |

```python
from llama_index.core.schema import TextNode, NodeRelationship

##### 节点是最小的数据单元
node = TextNode(
    text="这是文档的一段内容",
    metadata={"source": "产品手册.pdf", "page": 3},
    id_="node_001"
)

##### 节点之间可以有"父子"关系（用于保持上下文）
child_node = TextNode(
    text="这是详细的内容部分",
    metadata={"source": "产品手册.pdf", "page": 3}
)
child_node.relationships = {
    NodeRelationship.PARENT: "parent_node_id"
}

##### 也可以创建兄弟关系（用于章节结构）
node1 = TextNode(text="第一章内容...", id_="chapter_1")
node2 = TextNode(text="第二章内容...", id_="chapter_2")

##### 带关系地构建索引节点
from llama_index.core.node_parser import RelationshipNodeParser

parser = RelationshipNodeParser(
    text_splitter=SentenceSplitter(chunk_size=500),
    node_types=[NodeRelationship.SOURCE, NodeRelationship.PARENT, NodeRelationship.PREVIOUS, NodeRelationship.NEXT]
)
nodes = parser.build_nodes_from_documents(documents)
```

##### 3. Index（索引）—— 高级类型详解

**这是本章的重点**，原版讲得太浅。LlamaIndex提供了多种索引类型，每种都有其最佳使用场景。

##### VectorStoreIndex：语义检索之王

最常用的索引类型，适合95%的场景。

```python
from llama_index.core import VectorStoreIndex

##### 默认行为：全部文档向量化存储
index = VectorStoreIndex.from_documents(documents)

##### 自定义配置
index = VectorStoreIndex.from_documents(
    documents,
    embed_model=embed_model,  # 指定Embedding模型
    show_progress=True,  # 显示索引进度
    # 存储相关参数
    storage_context=storage_context,
)
```

**内部原理**：
1. 文档 → Document
2. Document → Node（通过切分器）
3. Node.text → Embedding（通过Embedding模型）
4. (Node, Embedding) → 存入VectorStore

##### SummaryIndex：快速概览

适合需要**快速了解文档全貌**的场景，比如：

- 用户问"这份文档大概讲了什么？"
- 生成文档摘要
- 快速浏览多个文档

```python
from llama_index.core import SummaryIndex

##### 摘要索引不存储向量，只保留原文
summary_index = SummaryIndex.from_documents(documents)

##### 使用摘要查询引擎
query_engine = summary_index.as_query_engine(
    response_mode="tree_summarize"  # 树形汇总模式
)

response = query_engine.query("这份文档的主要内容是什么？")
```

**适用场景**：
- ✅ "请总结一下这份年报的核心要点"
- ✅ "这份合同的主要条款有哪些？"
- ❌ "查找关于XXX的具体描述"（用VectorStoreIndex）

##### KeywordTableIndex：精准关键词匹配

适合需要**精确匹配**的场景，比如：

- 产品型号检索（"iPhone 15 Pro" vs "iPhone 15"）
- 人名、地名、专有名词检索
- 代码片段检索

```python
from llama_index.core import KeywordTableIndex

##### 基于关键词的精确匹配
keyword_index = KeywordTableIndex.from_documents(documents)

query_engine = keyword_index.as_query_engine()

##### 精确匹配"Transformer"这个词
response = query_engine.query("Transformer 架构的具体参数")
```

**注意**：LlamaIndex会从文档中提取关键词建立倒排索引。但它不会理解语义——"深度学习"和"机器学习"是不同的关键词。

**适用场景**：
- ✅ "iPhone 15的电池容量是多少"（精确匹配产品名）
- ✅ "查找第5.2.3条的内容"（精确匹配章节号）
- ❌ "什么是深度学习"（用VectorStoreIndex）

##### KnowledgeGraphIndex：知识图谱索引

适合需要**关系推理**的场景，比如：

- "谁是谁的老板？"
- "A公司和B公司是什么关系？"
- "这个概念隶属于哪个理论体系？"

```python
from llama_index.core import KnowledgeGraphIndex
from llama_index.core.kg_registry import SimpleKeywordTableKGRegistry

##### 创建知识图谱索引
kg_index = KnowledgeGraphIndex.from_documents(
    documents,
    max_triplets_per_chunk=10,  # 每个chunk最多提取的关系数
    kg_registry=SimpleKeywordTableKGRegistry(),
    embed_model=embed_model,
)

##### 查询
query_engine = kg_index.as_query_engine(
    include_text=True,  # 是否返回原始文本
    response_mode="compact"  # compact/treemap
)

response = query_engine.query("BERT和Transformer是什么关系？")
```

**内部原理**：
1. 解析文档，提取三元组（实体1, 关系, 实体2）
2. 存入图数据库（如Neo4j）或内存KGStore
3. 查询时构建子图，返回相关实体和关系

**适用场景**：
- ✅ 复杂关系查询
- ✅ 多跳推理（"A的老板的老板是谁？"）
- ❌ 简单的事实检索（用VectorStoreIndex更快）

##### 索引类型选择策略

```
query = "用户的问题"
        │
        ▼
┌─────────────────────────────────────────────────────┐
│                    问题类型判断                      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  需要语义理解？                                       │
│   ├── 否 → 需要精确匹配？                            │
│   │      ├── 是 → KeywordTableIndex                 │
│   │      └── 否 → SummaryIndex                      │
│   │                                               │
│   └── 是 → 需要关系推理？                            │
│          ├── 是 → KnowledgeGraphIndex              │
│          └── 否 → VectorStoreIndex ← 默认选这个      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**实战建议**：

| 场景 | 推荐索引 | 原因 |
|------|---------|------|
| 通用问答 | VectorStoreIndex | 语义理解强 |
| 文档摘要 | SummaryIndex | 轻量快速 |
| 产品检索 | KeywordTableIndex | 精确匹配 |
| 关系查询 | KnowledgeGraphIndex | 图推理 |
| 复杂系统 | **多索引组合** | 混合路由 |

##### 4. QueryEngine（查询引擎）

查询引擎是索引 + 检索策略 + LLM的组合。

```python
##### 最基础的查询引擎
query_engine = vector_index.as_query_engine()

##### 带重排序的查询引擎
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.postprocessor.cohere_rerank import CohereRerank

query_engine = RetrieverQueryEngine.from_args(
    vector_index.as_retriever(),
    node_postprocessors=[CohereRerank(api_key="xxx", top_n=5)]
)

##### 混合查询引擎（路由选择）
from llama_index.core.query_engine import RouterQueryEngine
from llama_index.core.selectors import LLMSingleSelector

query_engine = RouterQueryEngine(
    selector=LLMSingleSelector(),
    query_engine_tools=[
        vector_index.as_query_engine(description="向量检索-语义理解"),
        keyword_index.as_query_engine(description="关键词检索-精确匹配")
    ]
)

##### 带上下文的查询引擎
from llama_index.core import get_response_synthesizer

response_synthesizer = get_response_synthesizer(
    response_mode="compact_accumulate",  # 累积式回答
    text_qa_template=qa_prompt,  # 自定义QA模板
)

query_engine = RetrieverQueryEngine.from_args(
    retriever=retriever,
    response_synthesizer=response_synthesizer
)
```

###### LlamaIndex vs LangChain：什么时候选谁？

| 场景 | 推荐框架 | 原因 |
|------|---------|------|
| 快速搭建知识库问答 | **LlamaIndex** | 5行代码搞定，数据处理更专业 |
| 复杂多工具Agent | **LangChain** | 工具生态更完善 |
| 文档需要复杂切分 | **LlamaIndex** | 多种切分策略，原生支持 |
| 需要对接多种模型/工具 | **LangChain** | 集成更广 |
| 生产级RAG系统 | **两者结合** | LlamaIndex处理数据，LangChain编排流程 |

###### LlamaIndex与LangChain协作：混合架构实战

这是原版没讲的重点。很多面试官喜欢问这个问题：**"LlamaIndex和LangChain哪个更好？你怎么选？"**

答案是：**两个都要，根据场景分工**。

##### 各自的优势边界

```
┌─────────────────────────────────────────────────────────────────┐
│                        能力对比图                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   LangChain                        LlamaIndex                   │
│   ─────────                        ──────────                   │
│                                                                 │
│   ✓ Agent编排                       ✓ 数据索引                   │
│   ✓ 工具调用                        ✓ 文档切分                   │
│   ✓ 记忆管理                        ✓ 多种检索策略                │
│   ✓ 链式组合                        ✓ 索引类型丰富                 │
│   ✓ Prompt模板                      ✓ Embedding管理              │
│                                                                 │
│   ✗ 复杂数据处理                      ✗ Agent能力弱              │
│   ✗ 多种索引类型                      ✗ 工具生态有限              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

##### 协作模式一：LlamaIndex做索引 + LangChain做Agent

**最推荐的模式**，适合大多数生产系统。

```python
"""
混合架构：LlamaIndex索引 + LangChain Agent
运行环境：Python 3.10+, llama-index>=0.11.0, langchain>=0.1.0
"""

from llama_index.core import VectorStoreIndex
from llama_index.core.retrievers import VectorIndexRetriever
from langchain_core.tools import tool
from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_tool_calling_agent

##### ==================== 第一步：LlamaIndex构建索引 ====================
##### LlamaIndex负责数据处理——加载、切分、向量化、存储
index = VectorStoreIndex.from_documents(documents)

##### 自定义检索器（可选）
retriever = VectorIndexRetriever(
    index=index,
    similarity_top_k=5,
)

##### 包装成LangChain工具
@tool
def retrieve_documents(query: str) -> str:
    """
    检索相关文档片段。
    输入：自然语言查询
    输出：最相关的文档内容
    """
    nodes = retriever.retrieve(query)
    
    if not nodes:
        return "没有找到相关文档"
    
    # 格式化结果
    results = []
    for i, node in enumerate(nodes, 1):
        results.append(f"[文档{i}]\n{node.text[:500]}")
    
    return "\n\n".join(results)

##### ==================== 第二步：LangChain负责Agent编排 ====================
##### LangChain负责Agent逻辑——理解意图、调用工具、生成回答
tools = [retrieve_documents]

llm = ChatOpenAI(model="gpt-4", temperature=0)

##### 创建Agent
agent = create_tool_calling_agent(llm, tools, prompt)

##### 运行Agent
agent_executor = AgentExecutor(agent=agent, tools=tools)
result = agent_executor.invoke({"input": "这份文档的主要观点是什么？"})
```

##### 协作模式二：LlamaIndex查询引擎 + LangChain Chain

适合需要**结构化流程**的场景。

```python
"""
混合架构：LlamaIndex QueryEngine + LangChain LCEL
运行环境：Python 3.10+, llama-index>=0.11.0, langchain>=0.1.0
"""

from llama_index.core.query_engine import RetrieverQueryEngine
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

##### ==================== 第一步：LlamaIndex查询引擎 ====================
query_engine = index.as_query_engine(similarity_top_k=10)

##### ==================== 第二步：LangChain后处理 ====================
##### 自定义RAG Prompt
RAG_PROMPT = ChatPromptTemplate.from_template("""
基于以下上下文回答问题。如果上下文中没有相关信息，请说明不知道。

上下文：
{context}

问题：{question}

回答：
""")

##### 构建LCEL Chain
llm = ChatOpenAI(model="gpt-4", temperature=0)
rag_chain = RAG_PROMPT | llm | StrOutputParser()

##### ==================== 第三步：组合使用 ====================
def rag_answer(question: str) -> str:
    # LlamaIndex检索
    response = query_engine.query(question)
    context = "\n\n".join([node.text for node in response.source_nodes])
    
    # LangChain生成
    return rag_chain.invoke({
        "context": context,
        "question": question
    })
```

##### 协作模式三：完全集成（LlamaIndex作为LangChain组件）

适合LangChain主导的系统。

```python
"""
LangChain主导：LlamaIndex作为Tool
运行环境：Python 3.10+, langchain>=0.1.0, llama-index>=0.11.0
"""

from langchain.agents import AgentType, initialize_agent
from langchain.tools import Tool
from llama_index.core import VectorStoreIndex

##### LlamaIndex构建索引
index = VectorStoreIndex.from_documents(documents)
query_engine = index.as_query_engine()

##### 包装成LangChain Tool
llamaindex_tool = Tool.from_function(
    func=query_engine.query,
    name="document_qa",
    description="回答关于文档内容的问题。当用户询问文档中的具体信息时使用。",
    return_direct=True  # 直接返回结果，不经过Agent处理
)

##### LangChain Agent使用
tools = [llamaindex_tool, other_tools...]
agent = initialize_agent(
    tools=tools,
    llm=llm,
    agent=AgentType.OPENAI_FUNCTIONS,
    verbose=True
)

result = agent.run("这份合同的关键条款有哪些？")
```

##### 协作选择指南

```
┌─────────────────────────────────────────────────────────────┐
│                      架构选择决策树                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  系统类型？                                                  │
│   │                                                         │
│   ├── 纯RAG系统                                              │
│   │    └── 选 LlamaIndex（简单直接）                          │
│   │                                                         │
│   ├── RAG + 工具调用                                         │
│   │    └── LlamaIndex索引 + LangChain Agent（推荐）           │
│   │                                                         │
│   ├── 复杂工作流                                             │
│   │    └── LangChain主导 + LlamaIndex作为Tool                │
│   │                                                         │
│   └── 知识图谱 + RAG                                         │
│        └── LlamaIndex KG Index + 自定义图查询（推荐）         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

###### LlamaParse：文档解析的黑科技

LlamaIndex团队还有一个杀手级产品——**LlamaParse**，专门解决PDF解析这个世界难题。

```python
from llama_parse import LlamaParse

##### 初始化（需要API Key，免费额度够用）
parser = LlamaParse(
    api_key="你的API_KEY",  # 去 llamaIndex.ai 申请
    result_type="markdown",
    num_workers=4
)

##### 解析PDF（自动识别表格、图表、布局）
documents = parser.load_data("./合同.pdf")

##### 解析结果包含结构化信息
for doc in documents:
    print(f"页码: {doc.metadata['page_num']}")
    print(f"内容: {doc.text[:200]}...")
```

LlamaParse v2（2025年12月发布）的特点：
- 简化分层：Fast / Cost Effective / Agentic / Agentic Plus
- 成本降低50%，精度提升
- 自动识别表格、图表、图片区域

---

#### 10.2 向量数据库选型：Chroma / Qdrant / Milvus / Pinecone

向量数据库是RAG系统的"仓库"，负责存储和检索向量化的文档。你可能会问：为什么要专门的向量数据库？我用MySQL存文本不行吗？

**不行。** 普通数据库是精确匹配，向量数据库是"语义匹配"。你说"苹果"，普通数据库只认识"苹果"这两个字，向量数据库认识"苹果"是水果还是手机。

###### 四大向量数据库对比

| 数据库 | 类型 | 规模 | 优点 | 缺点 | 推荐场景 |
|-------|------|------|------|------|---------|
| **Chroma** | 开源本地 | <100万 | 零配置、API简单 | 分布式弱 | 快速原型、本地开发 |
| **Qdrant** | 开源+云 | 百万~10亿 | Rust性能高、过滤强 | 社区较小 | 生产级中型RAG |
| **Milvus** | 开源分布式 | 10亿~千亿 | 性能最强、GPU支持 | 运维复杂 | 大规模检索系统 |
| **Pinecone** | 商业托管 | 百万~百亿 | 免运维、SLA保障 | 成本高、锁定 | 企业级生产环境 |

###### Chroma：快速原型首选

Chroma是最"轻"的向量数据库，**5行代码就能跑起来**。

```python
"""
Chroma快速上手
运行环境：Python 3.10+, chromadb>=0.5.0
"""

import chromadb

##### 1. 创建客户端（使用持久化客户端）
client = chromadb.PersistentClient(path="./chroma_db")

##### 2. 创建集合（类似表）
collection = client.create_collection(
    name="my_docs",
    metadata={"hnsw:space": "cosine"}  # cosine余弦相似度
)

##### 3. 添加文档
collection.add(
    documents=[
        "苹果是一种水果",
        "苹果公司生产iPhone",
        "香蕉富含钾元素"
    ],
    ids=["1", "2", "3"],
    metadatas=[
        {"source": "水果百科", "type": "fruit"},
        {"source": "科技新闻", "type": "tech"},
        {"source": "水果百科", "type": "fruit"}
    ]
)

##### 4. 查询
results = collection.query(
    query_texts=["手机公司"],
    n_results=2  # 返回2条最相关的
)

print(results)
```

> ⚠️ **注意**：Chroma v0.5+版本使用 `chromadb.PersistentClient()` 而不是已弃用的 `chromadb.Client()`。

**什么时候选Chroma：**
- ✅ 快速验证RAG想法
- ✅ 本地开发调试
- ✅ 小规模应用（<10万向量）
- ❌ 生产环境（需要高可用）
- ❌ 大规模数据（>100万向量）

###### Qdrant：生产环境性价比之选

Qdrant用Rust写的，性能炸裂，API设计也很优雅。它支持**过滤条件**和**混合检索**。

```python
"""
Qdrant快速上手
运行环境：Python 3.10+, qdrant-client>=1.7.0
需要先安装Qdrant服务：docker run -p 6333:6333 qdrant/qdrant
"""

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, Filter

##### 1. 连接Qdrant服务
client = QdrantClient("localhost", port=6333)

##### 2. 创建集合
client.create_collection(
    collection_name="my_collection",
    vectors_config=VectorParams(size=384, distance=Distance.COSINE)
)

##### 3. 添加向量（带元数据）
import uuid
vectors = [
    [0.1, 0.2, ...],  # 你的embedding向量
    [0.3, 0.4, ...],
]
metadatas = [
    {"source": "文档A", "page": 1},
    {"source": "文档B", "page": 5}
]

client.upsert(
    collection_name="my_collection",
    points=[
        {
            "id": str(uuid.uuid4()),
            "vector": vector,
            "payload": metadata
        }
        for vector, metadata in zip(vectors, metadatas)
    ]
)

##### 4. 带过滤的检索
results = client.search(
    collection_name="my_collection",
    query_vector=query_embedding,
    query_filter=Filter(
        must=[{"key": "source", "match": {"value": "文档A"}}]
    ),
    limit=5
)
```

**Qdrant的杀手级功能——混合检索：**
```python
##### 结合向量相似度和关键词匹配
client.search(
    collection_name="my_collection",
    query_vector=query_embedding,
    query_filter=None,
    limit=10,
    search_params={
        "hnsw": {"ef": 128},
        "exact": False
    }
)
##### Qdrant支持 sparse+dense 混合检索，兼顾语义和关键词
```

###### Milvus：大规模场景的不二之选

Milvus是**十亿级向量**的首选，支持分布式部署、GPU加速、多种索引算法。

```python
"""
Milvus快速上手
运行环境：Python 3.10+, pymilvus>=2.3.0
需要先安装Milvus：推荐用Milvus Lite（单机）或Docker（生产）
"""

from pymilvus import MilvusClient, DataType

##### 1. 连接（Lite模式不需要启动服务）
client = MilvusClient(uri="./milvus_demo.db")

##### 2. 创建集合（带schema）
schema = MilvusClient.create_schema(
    auto_id=True,
    enable_dynamic_field=True,
    description="文档集合"
)
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="embedding", datatype=DataType.FLOAT_VECTOR, dim=384)
schema.add_field(field_name="content", datatype=DataType.VARCHAR, max_length=65535)
schema.add_field(field_name="source", datatype=DataType.VARCHAR, max_length=256)

client.create_collection(
    collection_name="docs",
    schema=schema,
    index_params={
        "embedding": {"index_type": "AUTOINDEX", "metric_type": "COSINE"}
    }
)

##### 3. 插入数据
client.insert(
    collection_name="docs",
    data=[
        {"embedding": [0.1, 0.2, ...], "content": "文档内容", "source": "手册.pdf"},
        # 更多文档...
    ]
)

##### 4. 检索
results = client.search(
    collection_name="docs",
    data=[query_embedding],
    limit=10,
    output_fields=["content", "source"]
)
```

**Milvus的分布式能力：**
```python
##### 生产环境使用Kubernetes部署
##### 配置文件：milvus-operator.yaml
apiVersion: milvus.io/v1beta1
kind: Milvus
metadata:
  name: my-milvus
spec:
  mode: cluster
  components:
    queryNode:
      replicas: 3
      resources:
        limits:
          nvidia.com/gpu: "1"
```

###### Pinecone：企业级免运维

Pinecone是**全托管服务**，你不需要运维，专注业务逻辑。但价格也是最贵的。

```python
"""
Pinecone快速上手
运行环境：Python 3.10+, pinecone-client>=3.0.0
"""

from pinecone import Pinecone

##### 1. 初始化
pc = Pinecone(api_key="your-api-key")
index = pc.Index("my-index")

##### 2. 写入向量
index.upsert(vectors=[
    ("vec1", [0.1, 0.2, ...], {"source": "doc1", "text": "内容"}),
    ("vec2", [0.3, 0.4, ...], {"source": "doc2", "text": "内容2"})
])

##### 3. 查询
results = index.query(
    vector=query_embedding,
    top_k=10,
    filter={"source": {"$eq": "doc1"}},
    include_metadata=True
)
```

**Serverless架构（2025年新特性）：**
```python
##### Pinecone Serverless：自动扩缩容，按使用付费
pc.create_index(
    name="serverless-index",
    dimension=1536,
    metric="cosine",
    spec={
        "serverless": {
            "cloud": "aws",  # aws / gcp / azure
            "region": "us-east-1"
        }
    }
)
```

###### 选型决策树

```
需要自托管还是托管服务？
├── 托管（不想运维）
│   ├── 预算充足 → Pinecone Serverless
│   └── 追求性价比 → Qdrant Cloud
│
└── 自托管（要控制成本/数据）
    ├── 数据量级？
    │   ├── <100万向量
    │   │   ├── 快速原型 → Chroma（本地）
    │   │   └── 生产环境 → Qdrant（Docker）
    │   │
    │   ├── 100万~10亿向量
    │   │   └── Qdrant（推荐）或 Milvus Lite
    │   │
    │   └── >10亿向量
    │       └── Milvus 分布式集群
    │
    └── 特殊需求？
        ├── 需要GPU加速 → Milvus
        ├── 需要知识图谱 → Weaviate
        └── 需要pg生态 → pgvector
```

###### 自建 vs 云服务：成本与运维对比

这是原版缺失的重要内容。选型不只是看功能，还要看**钱**和**人**。

##### 成本对比（以100万向量/月计算）

| 方案 | 月成本 | 年成本 | 适用规模 |
|------|--------|--------|----------|
| **Chroma本地** | ~$0 | ~$0 | <100万 |
| **Qdrant自托管** | ~$50-200 | ~$600-2400 | 任意规模 |
| **Milvus自托管** | ~$200-500 | ~$2400-6000 | >1000万 |
| **Qdrant Cloud** | ~$150-500 | ~$1800-6000 | 任意规模 |
| **Pinecone Serverless** | ~$200-1000+ | ~$2400-12000+ | 任意规模 |
| **Pinecone Standard** | ~$500-2000 | ~$6000-24000+ | 任意规模 |

**成本构成分析：**

```
自托管成本 = 云服务器 + 运维人力 + 网络流量 + 备份存储
           = ($50-500/月) + (1/4运维工程师) + 流量费 + 存储费
           ≈ $200-1000/月

云服务成本 = 按量付费 or 包月订阅
           ≈ $150-2000/月
```

##### 运维对比

| 维度 | 自托管 | 云服务 |
|------|--------|--------|
| **初始配置** | 复杂，需要自己搭环境 | 简单，点几个按钮 |
| **日常运维** | 需要DBA/运维人员 | 不需要 |
| **扩容** | 需要手动扩缩容 | 自动扩缩容 |
| **高可用** | 需要自己配置主从/集群 | 通常内置 |
| **备份恢复** | 需要自己实现 | 通常一键恢复 |
| **安全合规** | 完全可控 | 依赖服务商 |
| **数据主权** | 数据在自己服务器 | 数据在服务商 |
| **故障处理** | 自己排查 | 联系客服 |
| **版本升级** | 自己维护 | 自动更新 |

##### 选择建议

```
┌─────────────────────────────────────────────────────────────┐
│                       决策矩阵                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  选自托管的理由：                                            │
│   ✓ 数据敏感，不能放第三方                                   │
│   ✓ 有专职运维团队                                          │
│   ✓ 想控制长期成本                                         │
│   ✓ 需要深度定制                                           │
│                                                             │
│  选云服务的理由：                                            │
│   ✓ 快速上线，不想被运维拖累                                │
│   ✓ 没有运维团队                                           │
│   ✓ 流量波动大，需要弹性扩缩                                │
│   ✓ 愿意为便利性付溢价                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**实战建议**：
- **初创公司/个人项目**：Chroma本地 → Qdrant Cloud（起步）
- **中小企业**：Qdrant Cloud或自托管Qdrant
- **大企业**：Milvus自托管 + 专职DBA
- **金融/医疗等强合规行业**：必须自托管

###### 向量数据库性能优化（深度篇）

这是原版缺失的另一重要内容。生产环境中，优化向量数据库性能至关重要。

##### HNSW参数调优

HNSW（Hierarchical Navigable Small World）是向量索引的核心算法。大多数向量数据库都用它。

**核心参数解释：**

```python
##### Qdrant HNSW配置
hnsw_config = HnswConfig(
    m=16,              # 每个节点的最大连接数
    ef_construct=200, # 索引构建时的搜索范围
    ef=128,            # 查询时的搜索范围
    full_scan_threshold=10000,  # 超过多少向量走全表扫描
)
```

| 参数 | 默认值 | 调大效果 | 调小效果 | 推荐值 |
|------|--------|----------|----------|--------|
| **m** | 16 | 召回率↑、内存↑、索引构建时间↑ | 召回率↓、内存↓、速度↑ | 8-64 |
| **ef_construct** | 100 | 召回率↑、索引构建时间↑ | 召回率↓、索引构建快 | 64-512 |
| **ef** | 128 | 召回率↑、查询延迟↑ | 召回率↓、查询快 | 动态调整 |

**调优经验**：
```python
##### 追求召回率（生产环境推荐）
hnsw_config = HnswConfig(
    m=32,           # 加大
    ef_construct=400,  # 加大
    ef=256,          # 加大
)

##### 追求速度（高并发场景）
hnsw_config = HnswConfig(
    m=16,
    ef_construct=100,
    ef=64,  # 减小
)

##### 内存紧张
hnsw_config = HnswConfig(
    m=8,  # 减小
    ef_construct=64,
    ef=64,
)
```

**内存占用估算**：
```
HNSW内存 ≈ 向量数 × 维度 × 4字节 × (1 + m/2)

示例：
- 100万向量 × 384维 × 4字节 × 9 = ~1.4GB
- 100万向量 × 1536维 × 4字节 × 9 = ~5.5GB
```

##### 量化技术：减少内存占用

量化是**用更少bit表示向量**的技术，是大模型时代必须掌握的优化手段。

| 量化类型 | 压缩率 | 精度损失 | 适用场景 |
|---------|--------|----------|----------|
| **FP32（默认）** | 1x | 无 | 追求精度 |
| **FP16** | 2x | 极小 | 平衡场景 |
| **INT8** | 4x | 较小 | 内存敏感 |
| **INT4** | 8x | 较大 | 超大规模 |
| **PQ（产品量化）** | 4-64x | 可控 | 大规模检索 |

```python
##### Milvus量化配置
from pymilvus import Collection, CollectionSchema, Field, DataType

##### INT8量化示例
collection = Collection("my_collection")
collection.create_index(
    field_name="embedding",
    index_params={
        "index_type": "AUTOINDEX",
        "metric_type": "COSINE",
        "params": {}
    },
    index_type="IVF_FLAT",
    params={"nlist": 1024}
)

##### Pinecone量化配置
index = pc.Index("my-index")
index.configure(
    Pod(
        type="s1",
        size="1",
        quantum_num_dimensions=384  # 量子化维度
    )
)
```

**量化选择建议**：
- 数据量 < 100万 → 不需要量化
- 数据量 100万-1000万 → INT8量化
- 数据量 > 1000万 → PQ量化

##### 分片和副本策略

这是分布式向量数据库的核心特性。

```python
##### Milvus分片配置
client.create_collection(
    collection_name="docs",
    schema=schema,
    num_shards=4,  # 分片数 = 最大查询并发
    consistency_level="Eventually",  # 最终一致性
)

##### Qdrant副本配置
client.create_collection(
    collection_name="docs",
    vectors_config=VectorParams(size=384, distance=Distance.COSINE),
    replication_factor=2,  # 副本数 = 数据冗余度
    write_consistency_factor=1,  # 写确认数
)

##### 副本策略建议
replication_factor = {
    # 开发测试
    "dev": 1,
    # 生产环境（容错）
    "prod_low_traffic": 2,
    # 生产环境（高可用）
    "prod_high_traffic": 3,
    # 金融级（零容忍）
    "fintech": 5,
}
```

**分片 vs 副本：**

| 特性 | 分片（Sharding） | 副本（Replication） |
|------|-----------------|---------------------|
| 目的 | 水平扩容 | 容错高可用 |
| 数据 | 分区存储 | 完整复制 |
| 写 | 分散写入 | 同步写入 |
| 读 | 分散读取 | 负载均衡 |
| 故障 | 单分片挂→部分不可用 | 单副本挂→自动切换 |

---

#### 10.3 索引构建与查询优化

###### 与RAG框架的区别（衔接说明）

在第6章我们学了RAG的原理——文档怎么切块、向量化、检索、生成。本章则是**用LlamaIndex把这些原理落地成代码**。

如果说第6章是"设计图"，本章就是"施工队"。

###### 索引类型选型

LlamaIndex支持多种索引类型，根据场景选对索引事半功倍：

| 索引类型 | 适用场景 | 特点 |
|---------|---------|------|
| **VectorStoreIndex** | 通用场景，语义检索 | 最常用 |
| **SummaryIndex** | 需要全文摘要 | 轻量，但不支持复杂检索 |
| **TreeIndex** | 层级结构文档 | 适合目录式文档 |
| **KeywordTableIndex** | 精确关键词匹配 | 不支持语义检索 |
| **SQLIndex** | 结构化数据问答 | 支持SQL相关问答 |

```python
from llama_index.core import (
    VectorStoreIndex,
    SummaryIndex,
    TreeIndex,
    KeywordTableIndex
)

##### 最常用的向量索引
index = VectorStoreIndex.from_documents(documents)

##### 树形索引（适合书籍、文档）
tree_index = TreeIndex.from_documents(documents)

##### 关键词索引（适合需要精确匹配的场景）
keyword_index = KeywordTableIndex.from_documents(documents)

##### 组合索引（同时支持多种检索方式）
from llama_index.core.query_engine import RouterQueryEngine
from llama_index.core.selectors import LLMSingleSelector

combo_engine = RouterQueryEngine(
    selector=LLMSingleSelector(),
    query_engine_tools=[
        vector_index.as_query_engine(),
        keyword_index.as_query_engine()
    ]
)
```

###### 文本切块策略

切块是RAG效果的关键。太短语义不完整，太长噪声太多。

```python
from llama_index.core.node_parser import (
    SentenceSplitter,
    SemanticSplitterNodeParser,
    MarkdownNodeParser
)

##### 1. 简单字符级切分（默认）
simple_splitter = SentenceSplitter(
    chunk_size=500,
    chunk_overlap=50
)

##### 2. 语义切分（根据句子边界智能切分）
semantic_splitter = SemanticSplitterNodeParser(
    buffer_size=1,
    breakpoint_threshold_amount=75,
    embed_model=embed_model
)

##### 3. Markdown感知切分（保留标题层级）
markdown_parser = MarkdownNodeParser()

##### 4. 自定义切分规则
from llama_index.core.node_parser import NodeParser

class MyNodeParser(NodeParser):
    """自定义节点解析器"""
    
    def _parse_nodes(self, documents, ...):
        nodes = []
        for doc in documents:
            # 按章节切分
            sections = doc.text.split("## ")
            for i, section in enumerate(sections):
                nodes.append(TextNode(
                    text=section,
                    metadata={
                        "section": i,
                        "title": section.split("\n")[0]
                    }
                ))
        return nodes
```

**切块参数经验值：**

| 场景 | chunk_size | chunk_overlap |
|------|------------|---------------|
| 通用问答 | 500-800 | 50-100 |
| 长文档摘要 | 1000-1500 | 100-200 |
| 代码检索 | 200-500 | 20-50 |
| 表格密集型 | 300-500 | 30-50 |

###### Embedding模型选择

中文场景**必须用中文Embedding**，这是铁律。

```python
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

##### 中文首选：BGE-M3（性能最强）
embed_model = HuggingFaceEmbedding(
    model_name="BAAI/bge-m3",
    device="cpu"  # CPU或cuda
)

##### 备选：轻量版（低配机器）
embed_model = HuggingFaceEmbedding(
    model_name="BAAI/bge-small-zh-v1.5"
)

##### OpenAI API（追求稳定）
from llama_index.embeddings.openai import OpenAIEmbedding
embed_model = OpenAIEmbedding(
    model="text-embedding-3-large",
    api_key="your-key"
)
```

###### 混合检索实现（深度篇）

这是原版缺失的重要内容。**单一检索方式往往不够，需要多种检索融合**。

##### 混合检索的三种模式

```python
"""
混合检索实现
运行环境：Python 3.10+, llama-index>=0.11.0
"""

from llama_index.core.retrievers import QueryFusionRetriever
from llama_index.core import VectorStoreIndex, KeywordTableIndex
from llama_index.core.query_engine import RouterQueryEngine

##### ==================== 模式一：QueryFusionRetriever ====================
##### 将多个检索器的结果融合

vector_index = VectorStoreIndex.from_documents(documents)
keyword_index = KeywordTableIndex.from_documents(documents)

##### 融合检索器
fusion_retriever = QueryFusionRetriever(
    retrievers=[
        vector_index.as_retriever(search_type="similarity"),
        keyword_index.as_retriever(),
    ],
    mode="reciprocal_rerank",  # 互惠重排序模式
    k=5,  # 最终返回数量
    # 其他模式：
    # mode="dist_based_score"  # 基于距离的分数
    # mode="simple_fuzzy"     # 简单模糊融合
    # mode="relative_score"   # 相对分数融合
)

results = fusion_retriever.retrieve("你的查询")
```

```python
##### ==================== 模式二：RouterQueryEngine ====================
##### 让LLM根据问题类型选择检索器

router_engine = RouterQueryEngine(
    selector=LLMSingleSelector(),
    query_engine_tools=[
        vector_index.as_query_engine(
            description="语义检索，适合问概念、原因等问题"
        ),
        keyword_index.as_query_engine(
            description="关键词检索，适合找具体条款、型号等"
        ),
        summary_index.as_query_engine(
            description="摘要检索，适合问整体概览"
        ),
    ]
)

##### LLM会自动选择最合适的检索器
response = router_engine.query("你的问题")
```

```python
##### ==================== 模式三：自定义融合逻辑 ====================
##### 实现向量+BM25+知识图谱的三路融合

from llama_index.core.retrievers import BaseRetriever

class HybridRetriever(BaseRetriever):
    """混合检索器：向量 + BM25 + 知识图谱"""
    
    def __init__(self, vector_retriever, bm25_retriever, kg_retriever):
        self.vector_retriever = vector_retriever
        self.bm25_retriever = bm25_retriever
        self.kg_retriever = kg_retriever
    
    def _retrieve(self, query_bundle):
        # 三路并行检索
        vector_results = self.vector_retriever.retrieve(query_bundle)
        bm25_results = self.bm25_retriever.retrieve(query_bundle)
        kg_results = self.kg_retriever.retrieve(query_bundle)
        
        # RRF融合算法（Reciprocal Rank Fusion）
        k = 60  # 融合参数
        scores = {}
        
        for i, result in enumerate(vector_results):
            doc_id = result.node.id_
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + i + 1)
        
        for i, result in enumerate(bm25_results):
            doc_id = result.node.id_
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + i + 1)
        
        for i, result in enumerate(kg_results):
            doc_id = result.node.id_
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + i + 1)
        
        # 按融合分数排序
        sorted_ids = sorted(scores.keys(), key=lambda x: scores[x], reverse=True)
        
        # 返回前k个结果
        all_results = vector_results + bm25_results + kg_results
        id_to_result = {r.node.id_: r for r in all_results}
        
        return [id_to_result[doc_id] for doc_id in sorted_ids[:k] if doc_id in id_to_result]

##### 使用
hybrid_retriever = HybridRetriever(
    vector_retriever=vector_index.as_retriever(),
    bm25_retriever=bm25_index.as_retriever(),
    kg_retriever=kg_index.as_retriever(),
)
```

##### BM25检索器实现

BM25是一种经典的关键词检索算法，补充向量检索的好帮手。

```python
from llama_index.core.retriever import BaseRetriever
from llama_index.core.schema import NodeWithScore, QueryBundle
from rank_bm25 import BM25Okapi
import re

class BM25Retriever(BaseRetriever):
    """BM25关键词检索器"""
    
    def __init__(self, nodes, tokenizer=None):
        self.nodes = nodes
        self.tokenizer = tokenizer or (lambda x: x.lower().split())
        
        # 构建BM25索引
        corpus = [node.text for node in nodes]
        tokenized_corpus = [self.tokenizer(doc) for doc in corpus]
        self.bm25 = BM25Okapi(tokenized_corpus)
    
    def _retrieve(self, query_bundle: QueryBundle, **kwargs):
        query = query_bundle.query_str
        tokenized_query = self.tokenizer(query)
        
        # 获取BM25分数
        scores = self.bm25.get_scores(tokenized_query)
        
        # 构建结果
        results = []
        for i, score in enumerate(scores):
            if score > 0:
                results.append(NodeWithScore(
                    node=self.nodes[i],
                    score=score
                ))
        
        # 按分数排序
        results.sort(key=lambda x: x.score, reverse=True)
        return results[:10]  # 返回前10

##### 使用
bm25_retriever = BM25Retriever(nodes)
```

###### 查询路由：自动选择最佳检索策略（深度篇）

这是另一个原版缺失的重要话题。**查询路由是生产级RAG系统的标配**。

```python
"""
查询路由实现
运行环境：Python 3.10+, llama-index>=0.11.0
"""

from llama_index.core.query_engine import RouterQueryEngine
from llama_index.core.selectors import (
    LLMSingleSelector, 
    LLMMultiSelector,
    PydanticSingleSelector,
    PydanticMultiSelector
)
from llama_index.core.tools import QueryEngineTool, RetrieverTool

##### ==================== 方案一：LLM路由（基于意图分类） ====================

##### 定义工具
vector_tool = QueryEngineTool(
    query_engine=vector_index.as_query_engine(),
    description="向量检索工具：当用户询问概念、原因、解释等问题时使用",
)

keyword_tool = QueryEngineTool(
    query_engine=keyword_index.as_query_engine(),
    description="关键词检索工具：当用户询问具体条款、型号、数字等问题时使用",
)

summary_tool = QueryEngineTool(
    query_engine=summary_index.as_query_engine(),
    description="摘要检索工具：当用户询问整体概览、总结等问题时使用",
)

##### 创建路由器
router = RouterQueryEngine.from_defaults(
    tools=[vector_tool, keyword_tool, summary_tool],
    selector=LLMSingleSelector(),  # 单选
    # selector=LLMMultiSelector()  # 多选
)

##### 查询会自动路由
response = router.query("什么是Transformer架构？")  # → 向量检索
response = router.query("合同第5条的内容是什么？")  # → 关键词检索
response = router.query("总结一下这份文档")  # → 摘要检索
```

```python
##### ==================== 方案二：规则路由（基于正则/关键词） ====================

from llama_index.core.query_engine import RouterQueryEngine
from llama_index.core.tools import Tool, AdHocQueryTool

class RuleBasedSelector:
    """基于规则的查询路由"""
    
    def __init__(self, tools):
        self.tools = tools
        self.rules = [
            (r"第\d+条|条款|第\d+章", "keyword"),  # 章节号匹配 → 关键词检索
            (r"总结|概括|概述|大概讲", "summary"),  # 摘要词匹配 → 摘要检索
            (r"\d{3,}.*?[A-Z]|\d+寸|\d+GB", "keyword"),  # 数字+字母 → 关键词检索
        ]
    
    async def aselect(self, query: str) -> List[ToolWithScore]:
        for pattern, tool_name in self.rules:
            if re.search(pattern, query):
                for tool in self.tools:
                    if tool.metadata.name == tool_name:
                        return [ToolWithScore(tool=tool, score=1.0)]
        
        # 默认走向量检索
        for tool in self.tools:
            if tool.metadata.name == "vector":
                return [ToolWithScore(tool=tool, score=0.8)]
        
        return []

##### 使用
selector = RuleBasedSelector([vector_tool, keyword_tool, summary_tool])
```

```python
##### ==================== 方案三：语义路由（基于Embedding相似度） ====================

class SemanticRouter:
    """基于语义的查询路由"""
    
    def __init__(self, tools, tool_descriptions, embed_model):
        self.tools = tools
        self.embed_model = embed_model
        
        # 预计算工具描述的Embedding
        self.tool_embeddings = [
            embed_model.get_text_embedding(desc) 
            for desc in tool_descriptions
        ]
    
    def route(self, query: str) -> Tool:
        # 计算查询的Embedding
        query_embedding = self.embed_model.get_text_embedding(query)
        
        # 计算与各工具的相似度
        scores = [
            cosine_similarity(query_embedding, tool_emb)
            for tool_emb in self.tool_embeddings
        ]
        
        # 返回得分最高的工具
        best_idx = scores.index(max(scores))
        return self.tools[best_idx]

##### 使用
router = SemanticRouter(
    tools=[vector_tool, keyword_tool, summary_tool],
    tool_descriptions=[
        "向量检索工具，适合概念性问题",
        "关键词检索工具，适合具体条款",
        "摘要检索工具，适合概览问题"
    ],
    embed_model=embed_model
)

selected_tool = router.route("什么是深度学习？")
```

```python
##### ==================== 方案四：流水线路由（多阶段选择） ====================

class PipelineRouter:
    """流水线式查询路由"""
    
    def __init__(self, llm):
        self.llm = llm
    
    async def route(self, query: str) -> dict:
        """
        返回路由决策和理由
        """
        prompt = f"""
        分析以下查询，确定最佳检索策略：
        
        查询：{query}
        
        分析维度：
        1. 查询类型：事实类/概念类/对比类/总结类
        2. 精确度要求：高（具体条款）/中（一般问题）/低（概览）
        3. 是否需要多跳推理
        
        输出JSON格式：
        {{
            "strategy": "vector|keyword|summary|hybrid",
            "reason": "选择理由",
            "fallback": "备选策略"
        }}
        """
        
        response = await self.llm.ainvoke(prompt)
        return json.loads(response.content)

##### 使用
pipeline_router = PipelineRouter(llm)
decision = await pipeline_router.route("iPhone 15的电池容量是多少？对比一下竞品")

if decision["strategy"] == "hybrid":
    # 使用混合检索
    response = hybrid_engine.query(decision["query"])
else:
    # 使用单一检索器
    response = get_engine(decision["strategy"]).query(decision["query"])
```

###### 查询优化：检索结果质量提升

**1. 元数据过滤**
```python
##### 只在特定来源中检索
query_engine = index.as_query_engine(
    filters=MetadataFilters(
        filters=[ExactMatchFilter(key="source", value="产品手册")]
    )
)
```

**2. 混合检索**
```python
##### 结合向量检索和关键词检索
from llama_index.core.retrievers import QueryFusionRetriever

retriever = QueryFusionRetriever(
    retrievers=[
        vector_index.as_retriever(search_type="similarity"),
        keyword_index.as_retriever()
    ],
    mode="reciprocal_rerank",  # 或 "dist_based_score"
    k=5
)
```

**3. 重排序（Rerank）**
```python
from llama_index.postprocessor.cohere_rerank import CohereRerank

##### 用更强的模型对初步结果重新排序
query_engine = index.as_query_engine(
    similarity_top_k=20,  # 先召回20条
    node_postprocessors=[
        CohereRerank(api_key="xxx", top_n=5)  # 再精排5条
    ]
)
```

**4. 查询变换（Query Transformation）**
```python
##### 把复杂问题拆解
from llama_index.core.query_engine import SubQuestionQueryEngine

query_engine = SubQuestionQueryEngine.from_defaults(
    index=index,
    sub_question_options={
        "max_iterations": 5,
        "max_chunks": 3
    }
)

##### "苹果公司的产品和竞争对手的对比" 
##### → 自动拆解为两个子问题
##### → 分别检索 → 合并答案
```

###### 性能优化

```python
##### 1. 批量索引（加快索引速度）
index = VectorStoreIndex.from_documents(
    documents,
    show_progress=True,  # 显示进度条
    workers=4  # 并行worker数
)

##### 2. 缓存Embedding（避免重复计算）
from llama_index.core import load_index_from_storage

storage_context = StorageContext.from_defaults(
    persist_dir="./storage",
    docstore=SimpleDocumentStore(usecache=True)
)

##### 3. 近似最近邻（ANN）加速
index = VectorStoreIndex.from_documents(
    documents,
    vector_store_kwargs={
        "hnsw": {
            "m": 16,  # 内存-速度权衡
            "ef_construction": 200  # 索引质量
        }
    }
)
```

---

#### 10.4 实战：搭一个生产级私有文档检索系统

终于到了实战环节！这一节我们用LlamaIndex + Qdrant搭建一个**生产级**私有文档检索系统。

相比原版的"玩具级"代码，我们新增：
- 完整的API层和错误处理
- 检索质量监控
- 健康检查和指标暴露
- 增量索引和更新机制
- 完整的日志记录

###### 项目需求

- 目标：上传PDF文档，支持语义问答
- 功能：文档上传 → 自动解析 → 向量化 → 语义检索 → 生成回答
- 技术栈：LlamaIndex + Qdrant + OpenAI
- **新增**：质量监控、健康检查、错误处理

###### 项目结构

```
doc-retrieval-prod/
├── requirements.txt
├── .env
├── .env.example
├── config.py              # 配置管理
├── app.py                  # FastAPI主程序
├── services/
│   ├── __init__.py
│   ├── index_service.py    # 索引服务
│   ├── query_service.py    # 查询服务
│   └── monitoring.py       # 监控服务
├── models/
│   ├── __init__.py
│   └── schemas.py          # Pydantic模型
├── utils/
│   ├── __init__.py
│   ├── logger.py           # 日志配置
│   └── exceptions.py       # 自定义异常
├── data/                   # 上传文档目录
├── storage/                # 持久化存储
└── tests/
    └── test_api.py         # API测试
```

###### 依赖安装

```txt
##### requirements.txt
llama-index>=0.11.0
llama-index-llms-openai>=0.3.0
llama-index-vector-stores-qdrant>=0.3.0
llama-index-readers-file>=0.2.0
llama-index-embeddings-huggingface>=0.2.0
llama-index-postprocessor-cohere-rerank>=0.2.0
qdrant-client>=1.7.0
fastapi>=0.110.0
uvicorn>=0.27.0
python-multipart>=0.0.9
python-dotenv>=1.0.0
pydantic>=2.0.0
pydantic-settings>=2.0.0
prometheus-client>=0.19.0  # 监控指标
structlog>=23.0.0          # 结构化日志
httpx>=0.25.0              # 异步HTTP客户端
tenacity>=8.2.0           # 重试机制
```

###### 配置管理

```python
"""
config.py
生产级配置管理
"""

import os
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Literal

class Settings(BaseSettings):
    """应用配置"""
    
    # 环境
    ENVIRONMENT: Literal["development", "production", "staging"] = "development"
    DEBUG: bool = False
    
    # LLM配置
    OPENAI_API_KEY: str
    LLM_MODEL: Literal["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"] = "gpt-4o-mini"
    LLM_TEMPERATURE: float = 0.7
    LLM_MAX_RETRIES: int = 3
    
    # Embedding配置
    EMBEDDING_MODEL: str = "BAAI/bge-m3"
    EMBEDDING_DIM: int = 1024
    EMBEDDING_BATCH_SIZE: int = 32
    
    # Qdrant配置
    QDRANT_HOST: str = "localhost"
    QDRANT_PORT: int = 6333
    QDRANT_GRPC_PORT: int = 6334
    QDRANT_COLLECTION_NAME: str = "doc_retrieval"
    QDRANT_USE_HTTPS: bool = False
    
    # 索引配置
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    RETRIEVAL_TOP_K: int = 10
    RERANK_TOP_K: int = 3
    
    # 性能配置
    INDEX_WORKERS: int = 4
    QUERY_TIMEOUT: int = 60
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    
    # 监控配置
    ENABLE_METRICS: bool = True
    METRICS_PORT: int = 9090
    
    # CORS配置
    CORS_ORIGINS: list = ["*"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    """获取配置单例"""
    return Settings()

##### 全局配置实例
settings = get_settings()
```

###### 日志和异常处理

```python
"""
utils/logger.py
结构化日志配置
"""

import structlog
import logging
from settings import settings

def configure_logging():
    """配置结构化日志"""
    logging.basicConfig(
        format="%(message)s",
        level=logging.DEBUG if settings.DEBUG else logging.INFO,
    )
    
    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            structlog.processors.JSONRenderer() if settings.PRODUCTION else structlog.dev.ConsoleRenderer(),
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

def get_logger(name: str):
    """获取logger"""
    return structlog.get_logger(name)
```

```python
"""
utils/exceptions.py
自定义异常类
"""

class DocumentRetrievalError(Exception):
    """文档检索基础异常"""
    def __init__(self, message: str, code: str = "RETRIEVAL_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)

class DocumentNotFoundError(DocumentRetrievalError):
    """文档未找到"""
    def __init__(self, doc_id: str):
        super().__init__(
            message=f"Document not found: {doc_id}",
            code="DOC_NOT_FOUND"
        )

class IndexingError(DocumentRetrievalError):
    """索引构建失败"""
    def __init__(self, message: str):
        super().__init__(message=message, code="INDEXING_ERROR")

class QueryTimeoutError(DocumentRetrievalError):
    """查询超时"""
    def __init__(self, timeout: int):
        super().__init__(
            message=f"Query timeout after {timeout}s",
            code="QUERY_TIMEOUT"
        )

class VectorStoreConnectionError(DocumentRetrievalError):
    """向量数据库连接失败"""
    def __init__(self, message: str):
        super().__init__(message=message, code="VECTOR_STORE_ERROR")

class UnsupportedFileTypeError(DocumentRetrievalError):
    """不支持的文件类型"""
    def __init__(self, file_type: str):
        super().__init__(
            message=f"Unsupported file type: {file_type}",
            code="UNSUPPORTED_FILE_TYPE"
        )
```

###### 监控服务

```python
"""
services/monitoring.py
检索质量监控
"""

from prometheus_client import Counter, Histogram, Gauge, CollectorRegistry
from typing import Optional
import time
from functools import wraps

##### 创建自定义注册表
registry = CollectorRegistry()

##### 请求指标
request_counter = Counter(
    'doc_retrieval_requests_total',
    'Total number of requests',
    ['endpoint', 'status'],
    registry=registry
)

request_duration = Histogram(
    'doc_retrieval_request_duration_seconds',
    'Request duration in seconds',
    ['endpoint'],
    registry=registry
)

##### 检索指标
retrieval_similarity = Histogram(
    'retrieval_similarity_score',
    'Retrieval similarity scores',
    ['source'],
    buckets=[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
    registry=registry
)

retrieval_count = Gauge(
    'retrieval_count',
    'Number of documents in vector store',
    registry=registry
)

##### 错误指标
error_counter = Counter(
    'doc_retrieval_errors_total',
    'Total number of errors',
    ['error_type'],
    registry=registry
)


class MonitoringService:
    """监控服务"""
    
    def __init__(self):
        self.start_time = time.time()
    
    def track_request(self, endpoint: str):
        """请求追踪装饰器"""
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                start = time.time()
                status = "success"
                
                try:
                    result = await func(*args, **kwargs)
                    return result
                except Exception as e:
                    status = "error"
                    error_counter.labels(error_type=type(e).__name__).inc()
                    raise
                finally:
                    duration = time.time() - start
                    request_counter.labels(endpoint=endpoint, status=status).inc()
                    request_duration.labels(endpoint=endpoint).observe(duration)
            
            return wrapper
        return decorator
    
    def record_similarity_scores(self, scores: list, source: str = "retrieval"):
        """记录相似度分数"""
        for score in scores:
            retrieval_similarity.labels(source=source).observe(score)
    
    def update_vector_count(self, count: int):
        """更新向量数量"""
        retrieval_count.set(count)
    
    def get_uptime(self) -> float:
        """获取服务运行时间"""
        return time.time() - self.start_time
    
    def get_metrics_text(self) -> str:
        """获取Prometheus格式的指标"""
        from prometheus_client import generate_latest
        return generate_latest(registry).decode('utf-8')


##### 全局监控实例
monitoring = MonitoringService()
```

###### 索引服务

```python
"""
services/index_service.py
文档索引服务（生产级）
"""

import logging
from typing import List, Optional, Dict, Any
from pathlib import Path
import hashlib
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential

from llama_index.core import VectorStoreIndex, Document
from llama_index.core.node_parser import SentenceSplitter
from llama_index.core.storage.docstore import SimpleDocumentStore
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.vector_stores.qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, OptimizersConfig, HnswConfig
from qdrant_client.exceptions import UnexpectedResponse

from config import settings
from utils.logger import get_logger
from utils.exceptions import IndexingError, VectorStoreConnectionError

logger = get_logger(__name__)


class IndexService:
    """生产级文档索引服务"""
    
    def __init__(self):
        self._initialized = False
        self._embedding_model = None
        self._qdrant_client = None
        self._vector_store = None
        self._index = None
        self._docstore = None
        
        # 文档元数据存储
        self._doc_metadata: Dict[str, Dict] = {}
    
    def _get_embedding_model(self) -> HuggingFaceEmbedding:
        """获取或初始化Embedding模型"""
        if self._embedding_model is None:
            logger.info("初始化Embedding模型", model=settings.EMBEDDING_MODEL)
            self._embedding_model = HuggingFaceEmbedding(
                model_name=settings.EMBEDDING_MODEL,
                model_kwargs={"device": "cpu"},
                encode_kwargs={
                    "normalize_embeddings": True,
                    "batch_size": settings.EMBEDDING_BATCH_SIZE
                }
            )
        return self._embedding_model
    
    def _get_qdrant_client(self) -> QdrantClient:
        """获取或初始化Qdrant客户端"""
        if self._qdrant_client is None:
            logger.info(
                "初始化Qdrant客户端",
                host=settings.QDRANT_HOST,
                port=settings.QDRANT_PORT
            )
            self._qdrant_client = QdrantClient(
                host=settings.QDRANT_HOST,
                port=settings.QDRANT_PORT,
                timeout=30,
                prefer_grpc=True,
            )
            
            # 验证连接
            try:
                self._qdrant_client.get_collections()
                logger.info("Qdrant连接成功")
            except Exception as e:
                logger.error("Qdrant连接失败", error=str(e))
                raise VectorStoreConnectionError(f"Qdrant连接失败: {e}")
        
        return self._qdrant_client
    
    def _ensure_collection(self):
        """确保集合存在"""
        client = self._get_qdrant_client()
        collections = client.get_collections().collections
        collection_names = [c.name for c in collections]
        
        if settings.QDRANT_COLLECTION_NAME not in collection_names:
            logger.info("创建集合", collection=settings.QDRANT_COLLECTION_NAME)
            client.create_collection(
                collection_name=settings.QDRANT_COLLECTION_NAME,
                vectors_config=VectorParams(
                    size=settings.EMBEDDING_DIM,
                    distance=Distance.COSINE
                ),
                optimizers_config=OptimizersConfig(
                    indexing_threshold=0,
                    memmap_threshold=20000
                ),
                hnsw_config=HnswConfig(
                    m=16,
                    ef_construct=200,
                    full_scan_threshold=10000
                )
            )
            logger.info("集合创建成功")
        else:
            logger.info("集合已存在")
    
    async def initialize(self):
        """异步初始化服务"""
        if self._initialized:
            return
        
        logger.info("初始化索引服务")
        
        try:
            # 初始化Embedding模型
            embed_model = self._get_embedding_model()
            
            # 确保集合存在
            self._ensure_collection()
            
            # 初始化向量存储
            client = self._get_qdrant_client()
            self._vector_store = QdrantVectorStore(
                client=client,
                collection_name=settings.QDRANT_COLLECTION_NAME,
                embedding_model=embed_model,
                batch_size=settings.EMBEDDING_BATCH_SIZE
            )
            
            # 初始化文档存储
            self._docstore = SimpleDocumentStore()
            
            # 加载已存在的文档元数据
            await self._load_existing_metadata()
            
            self._initialized = True
            logger.info("索引服务初始化完成")
            
        except Exception as e:
            logger.error("索引服务初始化失败", error=str(e))
            raise IndexingError(f"初始化失败: {e}")
    
    async def _load_existing_metadata(self):
        """加载已存在的文档元数据"""
        # 从文件加载元数据
        metadata_file = Path("./storage/doc_metadata.json")
        if metadata_file.exists():
            import json
            with open(metadata_file) as f:
                self._doc_metadata = json.load(f)
            logger.info("加载文档元数据", count=len(self._doc_metadata))
    
    def _save_metadata(self):
        """保存文档元数据"""
        import json
        metadata_file = Path("./storage/doc_metadata.json")
        metadata_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(metadata_file, "w") as f:
            json.dump(self._doc_metadata, f, indent=2, ensure_ascii=False)
    
    def _generate_doc_id(self, file_path: str, content_hash: str) -> str:
        """生成文档ID"""
        return hashlib.sha256(f"{file_path}:{content_hash}".encode()).hexdigest()[:16]
    
    def _compute_file_hash(self, file_path: str) -> str:
        """计算文件内容哈希"""
        import hashlib
        with open(file_path, "rb") as f:
            return hashlib.sha256(f.read()).hexdigest()
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    async def index_documents(
        self, 
        file_paths: List[str],
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        索引文档（支持增量更新）
        
        Args:
            file_paths: 文件路径列表
            metadata: 额外元数据
        
        Returns:
            索引结果统计
        """
        await self.initialize()
        
        logger.info("开始索引文档", count=len(file_paths))
        total_nodes = 0
        indexed_files = []
        skipped_files = []
        
        for file_path in file_paths:
            try:
                # 计算文件哈希
                file_hash = self._compute_file_hash(file_path)
                doc_id = self._generate_doc_id(file_path, file_hash)
                
                # 检查是否已索引（增量更新）
                if doc_id in self._doc_metadata:
                    existing_hash = self._doc_metadata[doc_id].get("content_hash")
                    if existing_hash == file_hash:
                        logger.info("文档未变化，跳过", file=file_path, doc_id=doc_id)
                        skipped_files.append(file_path)
                        continue
                
                # 加载文档
                from llama_index.core import SimpleDirectoryReader
                reader = SimpleDirectoryReader(input_files=[file_path])
                documents = reader.load_data()
                
                # 添加文档元数据
                for doc in documents:
                    doc.metadata.update({
                        "doc_id": doc_id,
                        "file_path": file_path,
                        "file_name": Path(file_path).name,
                        **(metadata or {})
                    })
                
                # 切分文档
                parser = SentenceSplitter(
                    chunk_size=settings.CHUNK_SIZE,
                    chunk_overlap=settings.CHUNK_OVERLAP
                )
                nodes = parser.get_nodes_from_documents(documents)
                
                # 添加节点元数据
                for i, node in enumerate(nodes):
                    node.metadata["chunk_index"] = i
                    node.metadata["total_chunks"] = len(nodes)
                
                logger.info(
                    "文档切分完成",
                    file=file_path,
                    chunks=len(nodes)
                )
                
                # 构建索引
                if self._index is None:
                    self._index = VectorStoreIndex.from_documents(
                        documents=nodes,
                        vector_store=self._vector_store,
                        embed_model=self._get_embedding_model(),
                        show_progress=True
                    )
                else:
                    # 增量添加节点
                    for node in nodes:
                        self._index.insert_nodes([node])
                
                # 更新元数据
                self._doc_metadata[doc_id] = {
                    "file_path": file_path,
                    "content_hash": file_hash,
                    "indexed_at": asyncio.get_event_loop().time(),
                    "node_count": len(nodes),
                    "status": "indexed"
                }
                
                total_nodes += len(nodes)
                indexed_files.append(file_path)
                logger.info("文档索引完成", file=file_path, nodes=len(nodes))
                
            except Exception as e:
                logger.error("文档索引失败", file=file_path, error=str(e))
                raise IndexingError(f"索引 {file_path} 失败: {e}")
        
        # 保存元数据
        self._save_metadata()
        
        result = {
            "total_files": len(file_paths),
            "indexed": len(indexed_files),
            "skipped": len(skipped_files),
            "total_nodes": total_nodes,
            "indexed_files": indexed_files,
            "skipped_files": skipped_files,
            "total_documents": len(self._doc_metadata)
        }
        
        logger.info("索引完成", result=result)
        return result
    
    async def delete_document(self, doc_id: str) -> bool:
        """删除文档"""
        await self.initialize()
        
        if doc_id not in self._doc_metadata:
            return False
        
        # TODO: 实现从向量存储中删除向量
        del self._doc_metadata[doc_id]
        self._save_metadata()
        
        logger.info("文档已删除", doc_id=doc_id)
        return True
    
    async def get_stats(self) -> Dict[str, Any]:
        """获取索引统计"""
        await self.initialize()
        
        client = self._get_qdrant_client()
        
        try:
            collection_info = client.get_collection(settings.QDRANT_COLLECTION_NAME)
            
            return {
                "vectors_count": collection_info.vectors_count,
                "indexed_points": collection_info.indexed_vectors_count,
                "status": str(collection_info.status),
                "documents": len(self._doc_metadata),
                "indexed_files": list(self._doc_metadata.keys())
            }
        except Exception as e:
            logger.error("获取统计失败", error=str(e))
            return {"error": str(e)}


##### 全局服务实例
index_service = IndexService()
```

###### 查询服务

```python
"""
services/query_service.py
文档查询服务（生产级）
"""

import logging
from typing import Optional, List, Dict, Any
import asyncio
from datetime import datetime

from llama_index.core import VectorStoreIndex
from llama_index.core.query_engine import RetrieverQueryEngine
from llama_index.core.retrievers import VectorIndexRetriever
from llama_index.llms.openai import OpenAI
from llama_index.postprocessor.cohere_rerank import CohereRerank
from llama_index.vector_stores.qdrant import QdrantVectorStore
from llama_index.core.vector_stores import VectorStoreQueryMode
from llama_index.core.schema import NodeWithScore
from qdrant_client import QdrantClient

from config import settings
from utils.logger import get_logger
from utils.exceptions import QueryTimeoutError
from services.monitoring import monitoring

logger = get_logger(__name__)


class QueryService:
    """生产级文档查询服务"""
    
    def __init__(self):
        self._initialized = False
        self._llm = None
        self._embed_model = None
        self._query_engine = None
        self._index = None
    
    def _get_llm(self) -> OpenAI:
        """获取LLM实例"""
        if self._llm is None:
            logger.info("初始化LLM", model=settings.LLM_MODEL)
            self._llm = OpenAI(
                model=settings.LLM_MODEL,
                api_key=settings.OPENAI_API_KEY,
                temperature=settings.LLM_TEMPERATURE,
                max_retries=settings.LLM_MAX_RETRIES
            )
        return self._llm
    
    def _get_embed_model(self):
        """获取Embedding模型"""
        if self._embed_model is None:
            from llama_index.embeddings.huggingface import HuggingFaceEmbedding
            self._embed_model = HuggingFaceEmbedding(
                model_name=settings.EMBEDDING_MODEL,
                model_kwargs={"device": "cpu"},
                encode_kwargs={"normalize_embeddings": True}
            )
        return self._embed_model
    
    async def initialize(self):
        """初始化服务"""
        if self._initialized:
            return
        
        logger.info("初始化查询服务")
        
        # 初始化组件
        embed_model = self._get_embed_model()
        llm = self._get_llm()
        
        # 初始化向量存储
        qdrant_client = QdrantClient(
            host=settings.QDRANT_HOST,
            port=settings.QDRANT_PORT,
            timeout=30,
            prefer_grpc=True
        )
        
        vector_store = QdrantVectorStore(
            client=qdrant_client,
            collection_name=settings.QDRANT_COLLECTION_NAME,
            embedding_model=embed_model
        )
        
        # 构建索引
        self._index = VectorStoreIndex.from_vector_store(
            vector_store=vector_store,
            embed_model=embed_model
        )
        
        # 配置检索器
        retriever = VectorIndexRetriever(
            index=self._index,
            similarity_top_k=settings.RETRIEVAL_TOP_K,
            vector_store_query_mode=VectorStoreQueryMode.DEFAULT
        )
        
        # 配置查询引擎（带重排序）
        self._query_engine = RetrieverQueryEngine.from_args(
            retriever=retriever,
            llm=llm,
            node_postprocessors=[
                CohereRerank(
                    api_key=settings.OPENAI_API_KEY,
                    top_n=settings.RERANK_TOP_K
                )
            ],
            verbose=settings.DEBUG
        )
        
        self._initialized = True
        logger.info("查询服务初始化完成")
    
    @monitoring.track_request("query")
    async def query(
        self, 
        question: str, 
        mode: str = "compact",
        timeout: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        查询文档
        
        Args:
            question: 用户问题
            mode: 查询模式（compact/detail/raw）
            timeout: 超时时间（秒）
        
        Returns:
            查询结果
        """
        await self.initialize()
        
        timeout = timeout or settings.QUERY_TIMEOUT
        logger.info("执行查询", question=question, mode=mode)
        
        try:
            # 设置超时
            result = await asyncio.wait_for(
                self._query(question, mode),
                timeout=timeout
            )
            
            # 记录相似度分数
            if result.get("sources"):
                scores = [s.get("score", 0) for s in result["sources"]]
                monitoring.record_similarity_scores(scores)
            
            return result
            
        except asyncio.TimeoutError:
            logger.error("查询超时", timeout=timeout, question=question)
            raise QueryTimeoutError(timeout)
    
    async def _query(self, question: str, mode: str) -> Dict[str, Any]:
        """内部查询方法"""
        if mode == "raw":
            # 返回原始检索结果
            response = self._query_engine.retrieve(question)
            return {
                "sources": [
                    {
                        "text": node.text[:500] + "..." if len(node.text) > 500 else node.text,
                        "score": node.score,
                        "metadata": node.node.metadata
                    }
                    for node in response
                ],
                "count": len(response)
            }
        
        elif mode == "detail":
            # 返回详细结果（包含答案）
            response = self._query_engine.query(question)
            
            # 提取源文档
            sources = []
            if hasattr(response, 'source_nodes') and response.source_nodes:
                for node in response.source_nodes:
                    sources.append({
                        "text": node.node.text[:300] + "..." if len(node.node.text) > 300 else node.node.text,
                        "score": node.score,
                        "metadata": node.node.metadata
                    })
            
            return {
                "answer": str(response),
                "sources": sources,
                "timedelta": getattr(response, 'delta', None)
            }
        
        else:  # compact
            # 返回紧凑答案
            response = self._query_engine.query(question)
            
            sources = []
            if hasattr(response, 'source_nodes') and response.source_nodes:
                for node in response.source_nodes:
                    sources.append({
                        "text": node.node.text[:200] + "..." if len(node.node.text) > 200 else node.node.text,
                        "score": node.score,
                        "metadata": node.node.metadata
                    })
            
            return {
                "answer": str(response),
                "sources": sources
            }
    
    async def batch_query(self, questions: List[str]) -> List[Dict[str, Any]]:
        """批量查询"""
        logger.info("批量查询", count=len(questions))
        
        tasks = [self.query(q) for q in questions]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        return [
            r if not isinstance(r, Exception) else {"error": str(r)}
            for r in results
        ]


##### 全局服务实例
query_service = QueryService()
```

###### API层

```python
"""
models/schemas.py
Pydantic模型定义
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Literal, Any
from datetime import datetime

class QueryRequest(BaseModel):
    """查询请求"""
    question: str = Field(..., min_length=1, max_length=2000, description="问题内容")
    mode: Literal["compact", "detail", "raw"] = Field(default="compact", description="查询模式")
    timeout: Optional[int] = Field(default=60, ge=1, le=300, description="超时时间(秒)")

class SourceDocument(BaseModel):
    """来源文档"""
    text: str
    score: float = Field(..., ge=0, le=1)
    metadata: dict = Field(default_factory=dict)

class QueryResponse(BaseModel):
    """查询响应"""
    answer: str
    sources: List[SourceDocument]
    query_time: datetime = Field(default_factory=datetime.now)

class QueryStatsResponse(BaseModel):
    """查询统计响应"""
    vectors_count: int
    indexed_points: int
    status: str
    documents: int
    indexed_files: List[str]

class IndexRequest(BaseModel):
    """索引请求"""
    metadata: Optional[dict] = Field(default=None, description="额外元数据")

class IndexResponse(BaseModel):
    """索引响应"""
    total_files: int
    indexed: int
    skipped: int
    total_nodes: int
    indexed_files: List[str]
    skipped_files: List[str]
    total_documents: int

class HealthResponse(BaseModel):
    """健康检查响应"""
    status: str
    version: str
    uptime: float
    qdrant_connected: bool
    llm_configured: bool

class ErrorResponse(BaseModel):
    """错误响应"""
    error: str
    code: str
    detail: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)
```

```python
"""
app.py
FastAPI主程序（生产级）
运行方式：uvicorn app:app --reload --port 8000
"""

import os
import time
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, UploadFile, File, HTTPException, Query, BackgroundTasks
from fastapi.responses import JSONResponse, PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from models.schemas import (
    QueryRequest, QueryResponse, QueryStatsResponse,
    IndexRequest, IndexResponse, HealthResponse, ErrorResponse,
    SourceDocument
)
from services.index_service import index_service
from services.query_service import query_service
from services.monitoring import monitoring
from utils.logger import configure_logging, get_logger
from utils.exceptions import (
    DocumentRetrievalError, QueryTimeoutError,
    VectorStoreConnectionError, UnsupportedFileTypeError
)

##### 配置日志
configure_logging()
logger = get_logger(__name__)

##### 启动和关闭事件
@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    logger.info("应用启动", environment=settings.ENVIRONMENT)
    
    # 初始化服务
    try:
        await index_service.initialize()
    except Exception as e:
        logger.error("索引服务初始化失败", error=str(e))
    
    yield
    
    logger.info("应用关闭")

##### 创建应用
app = FastAPI(
    title="私有文档检索系统",
    description="基于LlamaIndex + Qdrant的生产级文档问答API",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None
)

##### CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

##### 数据目录
DATA_DIR = Path("./data")
DATA_DIR.mkdir(exist_ok=True)

##### 支持的文件类型
SUPPORTED_EXTENSIONS = {".pdf", ".txt", ".md", ".docx", ".doc", ".html", ".csv"}


##### ==================== 异常处理 ====================

@app.exception_handler(DocumentRetrievalError)
async def document_error_handler(request, exc: DocumentRetrievalError):
    """文档错误处理"""
    logger.error("业务异常", code=exc.code, message=exc.message)
    return JSONResponse(
        status_code=400,
        content=ErrorResponse(
            error=exc.message,
            code=exc.code
        ).model_dump()
    )

@app.exception_handler(QueryTimeoutError)
async def timeout_handler(request, exc: QueryTimeoutError):
    """超时处理"""
    logger.error("查询超时", timeout=exc.message)
    return JSONResponse(
        status_code=504,
        content=ErrorResponse(
            error=exc.message,
            code="QUERY_TIMEOUT"
        ).model_dump()
    )

@app.exception_handler(VectorStoreConnectionError)
async def connection_handler(request, exc: VectorStoreConnectionError):
    """连接错误处理"""
    logger.error("向量存储连接失败", error=exc.message)
    return JSONResponse(
        status_code=503,
        content=ErrorResponse(
            error="向量数据库连接失败，请稍后重试",
            code="SERVICE_UNAVAILABLE"
        ).model_dump()
    )


##### ==================== API端点 ====================

@app.get("/", response_model=HealthResponse)
async def root():
    """健康检查"""
    uptime = monitoring.get_uptime()
    
    # 检查Qdrant连接
    qdrant_connected = False
    try:
        from qdrant_client import QdrantClient
        client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
        client.get_collections()
        qdrant_connected = True
    except:
        pass
    
    return HealthResponse(
        status="healthy" if qdrant_connected else "degraded",
        version="2.0.0",
        uptime=uptime,
        qdrant_connected=qdrant_connected,
        llm_configured=bool(settings.OPENAI_API_KEY)
    )


@app.get("/health/detailed")
async def detailed_health():
    """详细健康检查"""
    stats = await index_service.get_stats()
    
    return {
        "status": "healthy",
        "components": {
            "api": "healthy",
            "qdrant": "healthy" if "error" not in stats else "unhealthy",
            "llm": "healthy" if settings.OPENAI_API_KEY else "unconfigured"
        },
        "stats": stats
    }


@app.post("/upload", response_model=IndexResponse)
async def upload_documents(
    background_tasks: BackgroundTasks,
    files: list[UploadFile] = File(...)
):
    """
    上传并索引文档
    
    支持格式：PDF, TXT, Markdown, DOCX, HTML, CSV
    """
    logger.info("收到上传请求", file_count=len(files))
    
    saved_paths = []
    errors = []
    
    for file in files:
        try:
            # 检查文件类型
            suffix = Path(file.filename).suffix.lower()
            if suffix not in SUPPORTED_EXTENSIONS:
                errors.append({
                    "filename": file.filename,
                    "error": f"不支持的文件格式: {suffix}"
                })
                continue
            
            # 检查文件大小
            content = await file.read()
            if len(content) > settings.MAX_FILE_SIZE:
                errors.append({
                    "filename": file.filename,
                    "error": f"文件过大: {len(content) / 1024 / 1024:.1f}MB > {settings.MAX_FILE_SIZE / 1024 / 1024}MB"
                })
                continue
            
            # 保存文件
            file_path = DATA_DIR / file.filename
            with open(file_path, "wb") as f:
                f.write(content)
            
            saved_paths.append(str(file_path))
            logger.info("文件保存成功", filename=file.filename)
            
        except Exception as e:
            logger.error("文件处理失败", filename=file.filename, error=str(e))
            errors.append({
                "filename": file.filename,
                "error": str(e)
            })
    
    if not saved_paths:
        raise HTTPException(
            status_code=400,
            detail={
                "message": "没有可处理的文档",
                "errors": errors
            }
        )
    
    # 索引文档
    result = await index_service.index_documents(saved_paths)
    result["errors"] = errors
    
    return IndexResponse(**result)


@app.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """
    查询文档
    
    Args:
        question: 问题内容
        mode: 查询模式
            - compact: 紧凑答案（默认）
            - detail: 详细结果（包含答案和来源）
            - raw: 原始检索结果
        timeout: 超时时间（秒）
    """
    logger.info("收到查询请求", question=request.question[:100])
    
    result = await query_service.query(
        question=request.question,
        mode=request.mode,
        timeout=request.timeout
    )
    
    # 转换为Pydantic模型
    sources = [
        SourceDocument(**src) for src in result.get("sources", [])
    ]
    
    return QueryResponse(
        answer=result.get("answer", ""),
        sources=sources
    )


@app.post("/query/batch")
async def batch_query_documents(
    questions: list[str] = Query(..., min_length=1, max_length=50)
):
    """批量查询文档"""
    results = await query_service.batch_query(questions)
    
    return {
        "results": results,
        "count": len(results)
    }


@app.get("/stats", response_model=QueryStatsResponse)
async def get_stats():
    """获取系统统计"""
    stats = await index_service.get_stats()
    
    if "error" in stats:
        raise HTTPException(status_code=500, detail=stats["error"])
    
    return QueryStatsResponse(**stats)


@app.delete("/document/{doc_id}")
async def delete_document(doc_id: str):
    """删除已索引的文档"""
    success = await index_service.delete_document(doc_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return {"message": "Document deleted", "doc_id": doc_id}


##### ==================== 监控端点 ====================

@app.get("/metrics", response_class=PlainTextResponse)
async def metrics():
    """Prometheus指标端点"""
    if not settings.ENABLE_METRICS:
        raise HTTPException(status_code=404, detail="Metrics disabled")
    
    return PlainTextResponse(
        content=monitoring.get_metrics_text(),
        media_type="text/plain"
    )


##### ==================== 启动 ====================

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info"
    )
```

###### 运行指南

**1. 启动Qdrant服务：**

```bash
##### 使用Docker（推荐）
docker run -d \
  --name qdrant \
  -p 6333:6333 \
  -p 6334:6334 \
  -v $(pwd)/qdrant_storage:/qdrant/storage \
  qdrant/qdrant

##### 或使用Docker Compose
##### docker-compose.yml:
version: '3.8'
services:
  qdrant:
    image: qdrant/qdrant
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - ./qdrant_storage:/qdrant/storage
    environment:
      - QDRANT__SERVICE__GRPC_PORT=6334
```

**2. 配置环境变量：**

```bash
##### .env
OPENAI_API_KEY=sk-xxxxx  # 你的OpenAI API Key
QDRANT_HOST=localhost
QDRANT_PORT=6333
ENVIRONMENT=production  # development / production
DEBUG=false
```

**3. 启动服务：**

```bash
##### 开发环境
uvicorn app:app --reload --port 8000

##### 生产环境（推荐使用gunicorn）
pip install gunicorn
gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

**4. 测试API：**

```bash
##### 健康检查
curl http://localhost:8000/

##### 上传文档
curl -X POST "http://localhost:8000/upload" \
  -F "files=@./文档.pdf"

##### 查询（紧凑模式）
curl -X POST "http://localhost:8000/query" \
  -H "Content-Type: application/json" \
  -d '{"question": "这份文档的主要内容是什么？"}'

##### 查询（详细模式）
curl -X POST "http://localhost:8000/query" \
  -H "Content-Type: application/json" \
  -d '{"question": "这份文档的主要内容是什么？", "mode": "detail"}'

##### 查看统计
curl http://localhost:8000/stats

##### 查看监控指标
curl http://localhost:8000/metrics
```

**5. API文档：**

启动后访问 http://localhost:8000/docs 查看交互式API文档（仅开发环境）。

###### 常见问题排查

| 问题 | 原因 | 解决方案 |
|------|------|---------|
| 索引后查不到结果 | Qdrant服务未启动 | `docker ps` 检查容器状态 |
| 检索结果不相关 | Embedding模型选错 | 中文场景必须用中文模型 |
| 查询超时 | 向量维度不匹配/数据量大 | 检查Embedding维度和HNSW配置 |
| 上传PDF失败 | 文件太大 | 检查FastAPI文件大小限制 |
| 重排序失败 | Cohere API Key问题 | 检查API Key配置 |
| 内存占用高 | 量化未启用 | 启用INT8/PQ量化 |

---

#### 行动清单

1. **安装并体验LlamaIndex**（30分钟）
   ```bash
   pip install llama-index>=0.11.0
   # 用官方5行代码体验一下
   ```

2. **选择一个向量数据库开始学习**
   - 快速原型 → Chroma
   - 生产环境 → Qdrant
   - 大规模系统 → Milvus

3. **理解高级索引类型**（2小时）
   - VectorStoreIndex：通用语义检索
   - SummaryIndex：文档概览
   - KeywordTableIndex：精确匹配
   - KnowledgeGraphIndex：关系推理

4. **动手搭建本地文档检索Demo**（3小时）
   - 参考10.4节的完整代码
   - 尝试上传自己的PDF文档
   - 测试问答效果

5. **实现混合检索**（2小时）
   - 向量+BM25融合
   - 查询路由配置
   - 重排序调优

6. **学习性能优化**（2小时）
   - HNSW参数调优
   - 量化技术
   - 分片副本策略

7. **深入学习推荐**
   - LlamaIndex官方文档：https://docs.llamaindex.ai/
   - Qdrant官方文档：https://qdrant.tech/documentation/
   - Milvus官方文档：https://milvus.io/docs

8. **面试准备要点**
   - 熟练讲解LlamaIndex vs LangChain的区别
   - 能根据场景推荐向量数据库
   - 理解各种索引类型的适用场景
   - 掌握混合检索和查询路由原理
   - 理解HNSW和量化优化技术

---

**本章小结**

这一章我们深入学习了：

- **LlamaIndex核心架构**：Document、Node、Index、QueryEngine四层设计
- **高级索引类型**：Summary Index、Keyword Table Index、Knowledge Graph Index的选择策略
- **LlamaIndex与LangChain协作**：各自优势边界与三种混合架构实战
- **向量数据库**：Chroma（原型）、Qdrant（生产）、Milvus（大规模）、Pinecone（托管）
- **自建 vs 云服务**：成本和运维对比分析
- **向量数据库性能优化**：HNSW参数调优、量化技术、分片副本策略
- **混合检索**：向量+BM25+知识图谱的融合实现
- **查询路由**：LLM路由、规则路由、语义路由三种策略
- **索引优化**：切块策略、Embedding选型、混合检索、重排序
- **实战项目**：生产级文档检索系统，包含监控、错误处理、增量索引

下一章我们将学习**服务部署与工程化**，把你的RAG应用从Demo变成能抗住真实流量的生产系统。
