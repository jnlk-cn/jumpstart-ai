---
outline: [2, 3]
---

# 附录B 常见报错与解决方案索引

本书涵盖的AI应用开发技术栈中，从环境搭建、代码编写到生产部署，每个环节都可能遇到形形色色的错误。本附录按照技术领域分类整理了开发过程中最常见的报错场景，给出根因分析和具体解决方案，并标注了对应的正文章节，方便读者快速定位查阅。

> **使用提示**：遇到报错时，可先通过 Ctrl+F 搜索错误信息中的关键词定位到本附录的相关条目，再根据「对应章节」跳转至正文深入理解原理。

---

## B.1 API调用类

调用大模型API是最基础也最容易出错的环节。403/429/401等HTTP状态码错误、上下文长度超限、连接超时等问题几乎每个开发者都会遇到。

### B.1.1 429 Rate Limit（请求速率超限）

**错误信息关键词**：`429 Client Error: Too Many Requests`、`rate limit exceeded`、`请求过于频繁`

**出现场景**：短时间内发送大量API请求，如循环调用、补全操作或高并发场景。

**根因分析**：大模型API服务对单位时间内的请求次数有严格限制，不同服务商的免费额度（如OpenAI 3.5 rpm=3）和付费档位差异很大。429本质是服务端熔断保护。

**解决方案**：

```python
import time
import tenacity
from openai import OpenAI

client = OpenAI()

@tenacity.retry(
    stop=tenacity.stop_after_attempt(3),
    wait=tenacity.wait_exponential(multiplier=1, min=2, max=60)
)
def call_with_retry(prompt, model="gpt-3.5-turbo"):
    try:
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}]
        )
        return response
    except Exception as e:
        print(f"调用失败: {e}")
        raise

# 调用示例
result = call_with_retry("你好")
```

关键措施：添加指数退避重试机制（exponential backoff），合理设置 `max_tokens` 避免无谓的token消耗，或升级API套餐提升速率限制。

**对应章节**：第4章「调用大模型API」

---

### B.1.2 401 Unauthorized（认证失败）

**错误信息关键词**：`401 Authentication Error`、`Invalid API key`、`API密钥无效`

**出现场景**：首次配置API密钥、密钥过期、使用了错误的密钥格式、环境变量未正确加载。

**根因分析**：API请求未通过身份验证，可能是密钥填错、密钥被禁用或删除、环境变量命名错误（如误写成 `OPENAI_API_KEY ` 多了一个空格）。

**解决方案**：

```python
import os

# 方案1：直接设置
os.environ["OPENAI_API_KEY"] = "sk-xxxxxxxxxxxxxxxxxxxxxxxx"

# 方案2：从.env文件加载
from dotenv import load_dotenv
load_dotenv()  # 自动读取当前目录下的.env文件
api_key = os.getenv("OPENAI_API_KEY")
print(f"密钥前5位: {api_key[:5]}...")  # 确认加载成功

# 方案3：验证密钥是否有效
from openai import OpenAI
client = OpenAI()
try:
    models = client.models.list()
    print(f"API连接成功，当前可用模型数: {len(models.data)}")
except Exception as e:
    print(f"认证失败: {e}")
```

推荐在项目根目录创建 `.env` 文件管理密钥，并将其加入 `.gitignore`：

```
# .gitignore
.env
```

**对应章节**：第4章「调用大模型API」

---

### B.1.3 Context Length Exceeded（上下文超限）

**错误信息关键词**：`context_length_exceeded`、`maximum context length`、`token limit`、`超过最大上下文长度`

**出现场景**：处理长文档、进行多轮对话或使用128K以上长上下文模型时。

**根因分析**：单次请求的Token数超过了模型支持的最大上下文窗口，不同模型差异显著：GPT-3.5-Turbo是4K/16K，GPT-4是8K/32K/128K，Claude 3支持200K。

**解决方案**：

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter
from openai import OpenAI

client = OpenAI()

def chunked_completion(text, chunk_size=4000, model="gpt-3.5-turbo"):
    """
    分块处理长文本
    chunk_size设为4000以留出空间给prompt和回复
    """
    # 1. 文本分块
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=200,  # 块之间保留重叠，保证语义连贯
        separators=["\n\n", "\n", "。", "！", "？", " "]
    )
    chunks = splitter.split_text(text)
    
    # 2. 逐块处理
    results = []
    for i, chunk in enumerate(chunks):
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "你是一个专业的文档分析助手。"},
                {"role": "user", "content": f"请分析以下内容（第{i+1}/{len(chunks)}块）：\n\n{chunk}"}
            ],
            max_tokens=500
        )
        results.append(response.choices[0].message.content)
    
    return results

# 使用示例
long_document = "..."  # 你的长文档
summaries = chunked_completion(long_document)
final_summary = "\n".join(summaries)
```

注意：`chunk_size` 不是固定值，需根据模型上下文窗口和单次请求的prompt长度动态计算。

**对应章节**：第4章、第7章「文档分割」

---

### B.1.4 Timeout（请求超时）

**错误信息关键词**：`timeout`、`ReadTimeout`、`ConnectTimeout`、`Request Timeout`

**出现场景**：网络不稳定、大模型服务端负载高或请求内容过大时。

**根因分析**：HTTP请求在默认超时时间内未收到响应，可能因服务端排队、模型推理耗时过长或网络链路问题。

**解决方案**：

```python
from openai import OpenAI
from openai import APITimeoutError

client = OpenAI(
    timeout=120.0,  # 总体超时120秒
    max_retries=2   # 自动重试次数
)

try:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": "分析最近的AI发展趋势"}],
        timeout=60.0  # 单次请求超时
    )
except APITimeoutError:
    print("请求超时，模型推理耗时过长")
except Exception as e:
    print(f"其他错误: {e}")

# 如果需要流式输出
from openai import OpenAI
client = OpenAI()

stream = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "写一个Python快速排序"}],
    stream=True,
    timeout=60.0
)
for chunk in stream:
    print(chunk.choices[0].delta.content or "", end="")
```

**对应章节**：第4章「调用大模型API」

---

### B.1.5 API Key无效或未正确配置

**错误信息关键词**：`API key must be a string`、`Missing API key`、`openai.api_key`

**出现场景**：代码中使用了非字符串类型的API Key、环境变量未设置、IDE未正确加载环境变量。

**根因分析**：SDK期望API Key是字符串类型，但传入的是None、空字符串或非字符串对象。

**解决方案**：

```python
import os
from openai import OpenAI

# 检查环境变量是否设置
api_key = os.environ.get("OPENAI_API_KEY")

if not api_key:
    raise ValueError("请设置环境变量 OPENAI_API_KEY")

if not isinstance(api_key, str):
    raise TypeError(f"API Key必须是字符串类型，当前类型: {type(api_key)}")

# 如果使用代理或其他自定义端点
client = OpenAI(
    api_key=api_key,
    base_url="https://api.openai.com/v1",  # 默认官方地址
    # 国内代理示例
    # base_url="https://your-proxy.com/v1"
    http_client=None  # 可自定义HTTP客户端
)
```

确保在运行脚本前导出环境变量：
```bash
export OPENAI_API_KEY="sk-xxxxxx"  # Linux/Mac
set OPENAI_API_KEY="sk-xxxxxx"     # Windows CMD
$env:OPENAI_API_KEY="sk-xxxxxx"    # Windows PowerShell
```

**对应章节**：第4章「调用大模型API」

---

## B.2 RAG类

检索增强生成（Retrieval-Augmented Generation）是AI应用的核心架构。向量检索、Embedding生成、文档解析等环节都可能出现问题。

### B.2.1 检索结果为空

**错误信息关键词**：`No relevant documents found`、`empty results`、`检索结果为空`

**出现场景**：向量化后的查询与文档库语义不匹配、分块策略不当或文档未被正确索引。

**根因分析**：查询文本的向量表示与文档Chunk的向量在语义空间中距离过远，通常是因为Embedding模型不适配、分块过大/过小、或领域词汇差异。

**解决方案**：

```python
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_community.vectorstores import FAISS

# 1. 使用更适合中文的Embedding模型
embeddings = HuggingFaceBgeEmbeddings(
    model_name="BAAI/bge-large-zh-v1.5",  # 中文优化Embedding
    model_kwargs={'device': 'cpu'},
    encode_kwargs={'normalize_embeddings': True}
)

# 2. 构建向量库
vectorstore = FAISS.from_texts(chunks, embeddings)

# 3. 使用多种检索策略提升召回率
retriever = vectorstore.as_retriever(
    search_type="mmr",  # 最大边际相关性，增加多样性
    search_kwargs={
        "k": 5,              # 召回数量
        "fetch_k": 20,       # MMR候选池大小
        "lambda_mult": 0.7   # 0.5=注重多样性，1=注重相关性
    }
)

# 4. 如果仍有空结果，使用HyDE（假设性文档嵌入）
# 参考 LangChain 官方文档 HyDE 示例
```

检查清单：
- [ ] 文档是否正确加载（print(chunks)检查）
- [ ] 使用的Embedding模型是否支持目标语言
- [ ] 分块大小是否合理（通常256-512字符）
- [ ] 查询文本是否使用了与文档相似的表述

**对应章节**：第7章「RAG核心架构」

---

### B.2.2 检索质量差（结果相关但不准）

**错误信息关键词**：`irrelevant results`、`低相关性`、`检索不准`

**出现场景**：语义相近但实际不同的查询、领域术语理解偏差。

**根因分析**：Embedding模型对特定领域的语义理解不足，或Top-K设置过小导致候选集有限。

**解决方案**：

```python
# 方案1：增加检索数量，让LLM做二次筛选
retriever = vectorstore.as_retriever(
    search_kwargs={"k": 10}  # 召回更多，人工或LLM筛选
)

# 方案2：使用Query Expansion扩展查询
def expand_query(query):
    """将单一查询扩展为多个相关查询"""
    expansion_prompt = f"""针对这个问题，请生成3个不同角度的搜索查询：
    原问题：{query}
    要求：生成简短、具体的查询关键词"""
    # 调用LLM生成扩展查询
    expansions = call_llm(expansion_prompt)
    return [query] + expansions.split('\n')

# 方案3：重排序（Re-ranking）
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import CohereRerank

compressor = CohereRerank(top_n=3, model="rerank-multilingual-v2.0")
compression_retriever = ContextualCompressionRetriever(
    base_compressor=compressor,
    base_retriever=base_retriever
)
```

**对应章节**：第7章「RAG进阶优化」

---

### B.2.3 Embedding维度不匹配

**错误信息关键词**：`dimension mismatch`、`向量维度不匹配`、`incompatible embeddings`

**出现场景**：使用不同Embedding模型生成的向量进行相似度计算或向量库查询。

**根因分析**：不同Embedding模型输出的向量维度不同，如BGE-large是1024维，text-embedding-ada-002是1536维，混用会导致维度错误。

**解决方案**：

```python
from langchain_community.embeddings import OpenAIEmbeddings, HuggingFaceBgeEmbeddings

# 方案1：统一使用同一个Embedding模型
# 索引时用什么，查询时必须用同样的
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

# 索引
vectorstore = FAISS.from_documents(documents, embeddings)

# 查询（必须使用相同的embeddings对象！）
query_embedding = embeddings.embed_query("你的查询")
results = vectorstore.similarity_search_by_vector(query_embedding, k=3)

# 方案2：如果需要切换Embedding模型，必须重建向量库
# 加载原始文档 → 使用新Embedding重新索引

# 方案3：检查向量维度是否一致
def verify_dimension(embedding_model, texts):
    """验证Embedding输出维度"""
    sample_vector = embedding_model.embed_query(texts[0])
    print(f"当前模型向量维度: {len(sample_vector)}")
    return len(sample_vector)

dim = verify_dimension(embeddings, chunks)
assert dim == expected_dimension, f"维度不匹配: 实际{dim}, 期望{expected_dimension}"
```

**对应章节**：第7章「Embedding与向量化」

---

### B.2.4 向量库连接失败

**错误信息关键词**：`connection refused`、`FaissException`、`Milvus connection failed`、`ChromaDB error`

**出现场景**：使用远程向量数据库（Milvus、Weaviate、Qdrant）或本地向量库初始化时。

**根因分析**：数据库服务未启动、网络不可达、端口未开放、认证信息错误或Docker容器未正确配置。

**解决方案**：

```python
# 方案1：Docker启动向量服务（以Qdrant为例）
# docker-compose.yml
"""
version: '3.8'
services:
  qdrant:
    image: qdrant/qdrant:v1.7.0
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - ./qdrant_storage:/qdrant/storage
"""

# 启动
# docker-compose up -d

# 方案2：Python连接Qdrant
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

client = QdrantClient(host="localhost", port=6333)

# 验证连接
try:
    collections = client.get_collections()
    print(f"连接成功，当前集合: {[c.name for c in collections.collections]}")
except Exception as e:
    print(f"连接失败: {e}")
    # 检查服务是否启动
    # docker ps | grep qdrant

# 方案3：使用内存向量库作为替代（开发调试用）
from langchain_community.vectorstores import FAISS
vectorstore = FAISS.from_texts(chunks, embeddings)  # 完全本地，无需连接
```

**对应章节**：第8章「向量数据库」

---

### B.2.5 文档解析失败

**错误信息关键词**：`PDF parsing error`、`docx parse failed`、`UnstructuredImporterError`

**出现场景**：加载PDF、Word、Excel等非纯文本文件时。

**根因分析**：缺少对应的解析库、文件格式不被支持、文件损坏或密码保护。

**解决方案**：

```python
# 方案1：使用unstructured库统一处理多格式
from langchain_community.document_loaders import UnstructuredFileLoader

loader = UnstructuredFileLoader("document.pdf", mode="elements")
documents = loader.load()

# 方案2：PDF专用加载器
from langchain_community.document_loaders import PyPDFLoader

loader = PyPDFLoader("document.pdf")
pages = loader.load_and_split()  # 按页分割
print(f"成功加载 {len(pages)} 页")

# 方案3：Word文档
from langchain_community.document_loaders import UnstructuredWordDocumentLoader

loader = UnstructuredWordDocumentLoader("document.docx")
docs = loader.load()

# 方案4：图片型PDF（扫描件）需要OCR
from langchain_community.document_loaders import OnlinePDFLoader

loader = OnlinePDFLoader("scanned.pdf")  # 配合OCR工具使用

# 安装依赖
# pip install pypdf python-docx unstructured
```

**对应章节**：第6章「文档加载与解析」

---

## B.3 Agent类

Agent开发中常见的错误包括工具调用失败、死循环、输出格式解析错误等，这些问题往往源于prompt设计或工具定义不当。

### B.3.1 工具调用失败

**错误信息关键词**：`tool call failed`、`Function calling error`、`Tool execution failed`

**出现场景**：Agent调用自定义工具或外部API时。

**根因分析**：工具定义格式错误（JSON Schema不规范）、工具执行超时、工具内部代码异常。

**解决方案**：

```python
from openai import OpenAI
import json

client = OpenAI()

def get_weather(location: str) -> dict:
    """获取天气信息"""
    # 模拟天气API调用
    return {"location": location, "temperature": "25°C", "weather": "晴"}

def get_news(category: str = "tech") -> list:
    """获取最新新闻"""
    return [{"title": "AI新突破", "category": category}]

# 定义工具列表
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "获取指定地点的天气信息",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "城市名称，如北京、上海"
                    }
                },
                "required": ["location"]
            }
        }
    }
]

def execute_tool(tool_name: str, tool_args: dict) -> str:
    """安全执行工具"""
    tool_map = {
        "get_weather": get_weather,
        "get_news": get_news
    }
    
    if tool_name not in tool_map:
        return f"错误：未找到工具 {tool_name}"
    
    try:
        result = tool_map[tool_name](**tool_args)
        return json.dumps(result, ensure_ascii=False)
    except Exception as e:
        return f"工具执行失败: {str(e)}"

# 使用示例
messages = [{"role": "user", "content": "北京今天天气怎么样？"}]

response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=messages,
    tools=tools,
    tool_choice="auto"
)

# 处理工具调用
assistant_message = response.choices[0].message
if assistant_message.tool_calls:
    for tool_call in assistant_message.tool_calls:
        tool_name = tool_call.function.name
        tool_args = json.loads(tool_call.function.arguments)
        
        # 执行工具
        tool_result = execute_tool(tool_name, tool_args)
        
        # 将结果添加到对话
        messages.append(assistant_message)
        messages.append({
            "role": "tool",
            "tool_call_id": tool_call.id,
            "content": tool_result
        })

# 二次调用获取最终回复
final_response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=messages
)
print(final_response.choices[0].message.content)
```

**对应章节**：第10章「ReAct Agent开发」

---

### B.3.2 Agent死循环

**错误信息关键词**：`maximum iterations`、`token limit exceeded`、`stuck in loop`

**出现场景**：Agent在复杂推理任务中反复调用同一工具、陷入无效循环。

**根因分析**：缺少循环终止条件、工具返回结果被忽视导致重复决策、prompt引导不足。

**解决方案**：

```python
from typing import Literal

class ControlledAgent:
    def __init__(self, max_iterations=10):
        self.max_iterations = max_iterations
        self.iteration_count = 0
    
    def run(self, task: str) -> str:
        messages = [{"role": "user", "content": task}]
        
        while self.iteration_count < self.max_iterations:
            self.iteration_count += 1
            
            response = self.chat(messages)
            
            # 检查是否应该终止
            if self.should_stop(response):
                return self.extract_final_answer(response)
            
            # 执行工具或继续对话
            result = self.process_response(response)
            messages.extend(result)
            
            # 检查是否有进展（避免无效循环）
            if not self.has_progress(messages):
                print(f"第{self.iteration_count}次迭代无进展，强制终止")
                break
        
        return "任务超时或达到最大迭代次数"
    
    def should_stop(self, response) -> bool:
        """判断是否应该终止"""
        # 检查是否有finish标记
        if "最终答案" in response.content or "[DONE]" in response.content:
            return True
        return False
    
    def has_progress(self, messages: list) -> bool:
        """检查是否有实质性进展"""
        # 简单策略：比较最后两条消息的差异
        if len(messages) < 4:
            return True
        
        tool_results = [m for m in messages if m.get("role") == "tool"]
        if not tool_results:
            return True
        
        # 检查最新工具调用结果是否与之前不同
        latest_result = tool_results[-1]["content"]
        previous_results = [r["content"] for r in tool_results[:-1]]
        
        return latest_result not in previous_results

# 使用示例
agent = ControlledAgent(max_iterations=5)
result = agent.run("计算1到100的质数之和")
```

**对应章节**：第11章「Agent开发进阶」

---

### B.3.3 输出格式不对

**错误信息关键词**：`json.decoder.JSONDecodeError`、`output format error`、`Invalid output`

**出现场景**：Agent需要输出结构化数据（JSON）时，LLM输出不符合预期格式。

**根因分析**：prompt未明确指定输出格式、LLM固有随机性导致格式漂移、缺少输出验证。

**解决方案**：

```python
import json
import re
from typing import Optional

def extract_json(text: str) -> Optional[dict]:
    """从文本中提取JSON并验证"""
    # 策略1：查找 ```json ``` 包裹的内容
    json_pattern = r'```(?:json)?\s*([\s\S]*?)\s*```'
    matches = re.findall(json_pattern, text)
    
    if matches:
        try:
            return json.loads(matches[0])
        except json.JSONDecodeError:
            pass
    
    # 策略2：查找原始JSON对象
    json_pattern = r'\{[\s\S]*\}'
    matches = re.findall(json_pattern, text)
    
    for match in matches:
        try:
            return json.loads(match)
        except json.JSONDecodeError:
            continue
    
    return None

def structured_output(prompt: str, schema: dict) -> dict:
    """强制结构化输出"""
    schema_str = json.dumps(schema, ensure_ascii=False, indent=2)
    
    full_prompt = f"""{prompt}

请严格按照以下JSON Schema输出，不要包含任何其他内容：
{schema_str}

输出格式示例：
```json
{json.dumps(schema, ensure_ascii=False)}
```"""
    
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": full_prompt}],
        temperature=0  # 降低随机性
    )
    
    result = extract_json(response.choices[0].message.content)
    
    if result is None:
        raise ValueError("无法解析LLM输出为有效JSON")
    
    return result

# 使用示例
schema = {
    "name": "姓名",
    "age": "年龄",
    "skills": ["技能列表"]
}

result = structured_output(
    "介绍你自己",
    schema
)
```

**对应章节**：第9章「Function Calling」

---

### B.3.4 Token超预算

**错误信息关键词**：`Token limit`、`exceeds budget`、`maximum tokens`

**出现场景**：多轮对话积累过多历史消息、长文档处理、复杂推理任务。

**根因分析**：对话历史无限增长超出模型上下文窗口、或单次请求的token数超过预算限制。

**解决方案**：

```python
from langchain.schema import HumanMessage, AIMessage, SystemMessage
from langchain.chat_models import ChatOpenAI
from langchain.memory import ConversationBufferWindowMemory

# 方案1：使用窗口记忆，自动截断旧消息
memory = ConversationBufferWindowMemory(
    k=10,  # 只保留最近10轮对话
    return_messages=True
)

# 方案2：Token计数截断
def truncate_messages(messages: list, max_tokens: int = 3000) -> list:
    """根据token数截断历史消息"""
    tokenizer = None  # 可使用 tiktoken 或 client.tokenizer
    
    truncated = []
    current_tokens = 0
    
    # 从最新消息开始，保留最新的
    for msg in reversed(messages):
        msg_tokens = estimate_tokens(msg.content)  # 估算token数
        if current_tokens + msg_tokens <= max_tokens:
            truncated.insert(0, msg)
            current_tokens += msg_tokens
        else:
            break
    
    return truncated

def estimate_tokens(text: str) -> int:
    """简单估算：中文约1字=1token，英文约4字符=1token"""
    chinese_chars = sum(1 for c in text if '\u4e00' <= c <= '\u9fff')
    other_chars = len(text) - chinese_chars
    return chinese_chars + other_chars // 4

# 方案3：摘要记忆
from langchain.memory import ConversationSummaryMemory

memory = ConversationSummaryMemory(
    llm=ChatOpenAI(model="gpt-3.5-turbo"),
    memory_key="chat_history",
    return_messages=True
)
```

**对应章节**：第10章「Agent记忆管理」

---

## B.4 LangChain类

LangChain是强大的框架，但版本迭代快、API变更频繁，import报错和执行中断是高频问题。

### B.4.1 Import报错（版本问题）

**错误信息关键词**：`ImportError`、`cannot import name`、`ModuleNotFoundError`、`No module named`

**出现场景**：安装依赖后import时报错，常见于langchain 0.1.x/0.2.x/0.3.x版本差异。

**根因分析**：LangChain从0.1升级到0.2后大量API重命名，第三方集成包的版本与LangChain Core版本不兼容。

**解决方案**：

```python
# 检查当前版本
# pip show langchain langchain-core langchain-community

# 方案1：统一版本（推荐LangChain 0.1.x稳定版）
# requirements.txt
"""
langchain==0.1.20
langchain-core==0.1.52
langchain-community==0.0.38
langchain-openai==0.1.14
openai==1.12.0
"""

# 方案2：如果需要使用最新版，确保所有包同步升级
# pip install --upgrade langchain langchain-core langchain-community

# 方案3：处理0.1到0.2的API变更
# 旧版 (0.1.x)
from langchain import OpenAI
llm = OpenAI(temperature=0.9)

# 新版 (0.2.x)
from langchain_openai import OpenAI
llm = OpenAI(temperature=0.9)

# 方案4：使用pip-compile锁定依赖版本
# pip install pip-tools
# pip-compile requirements.in  # 生成requirements.txt
```

常见变更对照：

| 旧版 (0.1.x) | 新版 (0.2.x) |
|--------------|---------------|
| `from langchain import OpenAI` | `from langchain_openai import OpenAI` |
| `from langchain import PromptTemplate` | `from langchain_core.prompts import PromptTemplate` |
| `chain.run()` | `chain.invoke()` |
| `ConversationChain` | `ConversationalRetrievalChain` |

**对应章节**：第12章「LangChain基础」

---

### B.4.2 Chain执行中断

**错误信息关键词**：`Chain failed`、`output parser error`、`callback error`

**出现场景**：LCEL链式调用执行过程中报错。

**根因分析**：中间步骤返回类型不匹配、输出解析器无法处理上游输出、异常未捕获。

**解决方案**：

```python
from langchain_core.output_parsers import StrOutputParser, JsonOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnablePassthrough

llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0)

# 方案1：添加异常处理
def safe_invoke(chain, input_dict, max_retries=3):
    """带重试的链式调用"""
    for attempt in range(max_retries):
        try:
            return chain.invoke(input_dict)
        except Exception as e:
            print(f"第{attempt+1}次尝试失败: {e}")
            if attempt == max_retries - 1:
                raise
    return None

# 方案2：使用fallback处理模型不可用
from langchain_core.callbacks import CallbackManager

chain = (
    {"topic": RunnablePassthrough()}
    | PromptTemplate.from_template("讲一个关于{topic}的笑话")
    | llm
    | StrOutputParser()
)

# 添加备用链
fallback_chain = PromptTemplate.from_template("讲一个笑话") | llm | StrOutputParser()
chain = chain.with_fallbacks([fallback_chain])

# 方案3：检查中间输出类型
def debug_chain():
    """调试链式调用"""
    prompt = PromptTemplate.from_template("讲一个关于{topic}的笑话")
    
    # 逐步执行并打印输出
    prompt_result = prompt.invoke({"topic": "程序员"})
    print(f"Prompt输出: {prompt_result}")
    
    llm_result = llm.invoke(prompt_result)
    print(f"LLM输出: {llm_result}")
    
    final_result = StrOutputParser().invoke(llm_result)
    print(f"最终输出: {final_result}")
    
    return final_result
```

**对应章节**：第13章「LCEL链式调用」

---

### B.4.3 LCEL语法错误

**错误信息关键词**：`LCEL error`、`cannot pipe`、`Runnable type error`

**出现场景**：使用 `|` 管道符连接Runnable对象时类型不匹配。

**根因分析**：LCEL要求管道符两侧的对象必须是Runnable类型，且输入输出类型要兼容。

**解决方案**：

```python
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from langchain_core.runnables import RunnablePassthrough, RunnableLambda

llm = ChatOpenAI(model="gpt-3.5-turbo")

# 错误示例：函数没有包装成RunnableLambda
# chain = {"topic": lambda x: x["topic"]} | prompt | llm  # TypeError!

# 正确示例1：使用RunnableLambda包装
chain = (
    {"topic": RunnablePassthrough()}
    | PromptTemplate.from_template("讲一个关于{topic}的笑话")
    | llm
    | StrOutputParser()
)

# 正确示例2：使用RunnableLambda处理字典
def extract_topic(input_dict):
    return input_dict.get("topic", "默认话题")

chain = (
    RunnableLambda(extract_topic)
    | PromptTemplate.from_template("讲一个关于{topic}的笑话")
    | llm
    | StrOutputParser()
)

# 正确示例3：多输入处理
multi_input_chain = (
    {
        "topic": lambda x: x["topic"],
        "style": lambda x: x.get("style", "幽默")
    }
    | PromptTemplate.from_template(
        "用{style}的风格讲一个关于{topic}的笑话"
    )
    | llm
    | StrOutputParser()
)

result = multi_input_chain.invoke({
    "topic": "程序员",
    "style": "冷笑话"
})
print(result)
```

**对应章节**：第13章「LCEL链式调用」

---

### B.4.4 Callback回调错误

**错误信息关键词**：`CallbackError`、`callback manager not set`

**出现场景**：需要追踪Chain执行过程、添加自定义日志或监控时。

**根因分析**：未正确配置CallbackManager、回调函数签名不匹配。

**解决方案**：

```python
from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.callbacks.manager import CallbackManager
from langchain_core.outputs import LLMResult

class MyCallbackHandler(BaseCallbackHandler):
    """自定义回调处理器"""
    
    def on_llm_start(self, serialized, prompts, **kwargs):
        print(f"LLM开始处理，Prompt数量: {len(prompts)}")
    
    def on_llm_end(self, response: LLMResult, **kwargs):
        print(f"LLM处理完成，Token消耗: {response.llm_output}")
    
    def on_chain_start(self, serialized, inputs, **kwargs):
        print(f"Chain开始执行，输入: {inputs}")
    
    def on_chain_end(self, outputs, **kwargs):
        print(f"Chain执行完成，输出: {outputs}")
    
    def on_tool_start(self, serialized, input_str, **kwargs):
        print(f"工具开始执行: {serialized.get('name')}")
    
    def on_tool_end(self, output, **kwargs):
        print(f"工具执行完成: {output}")

# 使用回调
callback_handler = MyCallbackHandler()
callback_manager = CallbackManager([callback_handler])

chain = prompt | llm | StrOutputParser()
result = chain.invoke(
    {"topic": "AI"},
    config={"callbacks": callback_manager}
)
```

**对应章节**：第14章「LangChainCallbacks」

---

## B.5 部署类

将AI应用部署到生产环境时，Docker、GPU、内存等问题会集中爆发。

### B.5.1 Docker构建失败

**错误信息关键词**：`Docker build failed`、`cannot find requirements.txt`、`python version mismatch`

**出现场景**：`docker build` 构建镜像时找不到文件、依赖安装失败或版本冲突。

**根因分析**：Dockerfile路径配置错误、COPY指令顺序不当、基础镜像不支持项目Python版本。

**解决方案**：

```dockerfile
# 正确的Dockerfile示例
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 先复制依赖文件，再复制代码（利用Docker缓存）
COPY requirements.txt .

# 安装依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制代码
COPY . .

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

常见问题处理：

```bash
# 问题1：找不到requirements.txt
# 确保requirements.txt在项目根目录
# COPY指令的源路径相对于Dockerfile所在目录

# 问题2：依赖安装超时
# 使用国内镜像
RUN pip install --no-cache-dir -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt

# 问题3：构建缓存导致问题
docker build --no-cache -t my-ai-app:latest .

# 问题4：多阶段构建（减小镜像体积）
FROM python:3.11-slim as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --target=/app/pkgs -r requirements.txt

FROM python:3.11-slim
WORKDIR /app
COPY --from=builder /app/pkgs /usr/local/lib/python3.11/site-packages/
COPY . .
CMD ["python", "main.py"]
```

**对应章节**：第18章「Docker容器化部署」

---

### B.5.2 GPU不可用

**错误信息关键词**：`CUDA out of memory`、`GPU not available`、`No CUDA-capable device`

**出现场景**：运行需要GPU加速的模型（如embedding服务、本地LLM推理）时。

**根因分析**：未安装NVIDIA驱动、CUDA版本与PyTorch不匹配、Docker未配置GPU访问。

**解决方案**：

```bash
# 检查1：确认GPU可见性
nvidia-smi

# 检查2：确认CUDA版本
nvcc --version

# 检查3：确认PyTorch GPU支持
python -c "import torch; print(torch.cuda.is_available()); print(torch.version.cuda)"
```

```python
# PyTorch GPU检测
import torch

if torch.cuda.is_available():
    print(f"GPU可用: {torch.cuda.get_device_name(0)}")
    print(f"显存: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
else:
    print("GPU不可用，将使用CPU")
    # 降级方案：使用CPU或量化模型
```

Docker GPU配置：

```bash
# 安装NVIDIA Container Toolkit
# https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/install-guide.html

# 运行带GPU的容器
docker run --gpus all -it my-ai-app:latest python train.py
```

降级方案（无GPU时）：

```python
# 使用量化模型减少显存需求
from langchain_community.llms import Ollama

llm = Ollama(
    model="llama2:13b",  # 或更小的7b模型
    base_url="http://localhost:11434",
    # 量化选项：q4_0, q4_1, q5_0, q5_1, q8_0
)

# 或使用CPU友好的embedding模型
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
embeddings = HuggingFaceBgeEmbeddings(
    model_name="all-MiniLM-L6-v2",  # 轻量级模型
    model_kwargs={'device': 'cpu'}
)
```

**对应章节**：第19章「GPU部署与优化」

---

### B.5.3 端口冲突

**错误信息关键词**：`Port is already allocated`、`bind failed`、`Address already in use`

**出现场景**：启动多个服务、复用之前未正确关闭的服务端口时。

**解决方案**：

```bash
# 检查端口占用
# Linux/Mac
lsof -i :8000
netstat -tulpn | grep 8000

# Windows
netstat -ano | findstr :8000

# 杀死占用进程
kill -9 <PID>
```

```yaml
# docker-compose.yml 多服务配置
version: '3.8'
services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - PORT=8000

  vector-db:
    image: qdrant/qdrant
    ports:
      - "6333:6333"
      - "6334:6334"
```

```python
# FastAPI动态端口
from fastapi import FastAPI
import uvicorn
import os

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello AI"}

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
```

**对应章节**：第18章「服务化部署」

---

### B.5.4 OOM（内存不足）

**错误信息关键词**：`OutOfMemoryError`、`CUDA out of memory`、`Killed`

**出现场景**：加载大模型、处理大文档或高并发请求时。

**根因分析**：模型体积超过可用显存/内存、单进程内存泄漏、Docker容器内存限制过小。

**解决方案**：

```python
# 方案1：模型量化（减少显存占用）
from langchain_community.llms import Ollama

llm = Ollama(
    model="llama2:13b-q4_0",  # 4位量化，显存需求降低约75%
)

# 方案2：批处理限制
from langchain_core.callbacks import BaseCallbackHandler

class BatchSizeLimiter(BaseCallbackHandler):
    def __init__(self, max_batch_size=5):
        self.current_batch = 0
        self.max_batch_size = max_batch_size
    
    def on_llm_start(self, *args):
        self.current_batch += 1
        if self.current_batch > self.max_batch_size:
            raise Exception("批次超限，请等待前一批完成")

# 方案3：流式输出（降低峰值内存）
response = client.chat.completions.create(
    model="gpt-3.5-turbo",
    messages=[{"role": "user", "content": "长文本生成"}],
    stream=True  # 流式输出减少等待期间的内存占用
)

for chunk in response:
    print(chunk.choices[0].delta.content or "", end="")
```

Docker内存限制调整：

```bash
# docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 4G
        reservations:
          memory: 2G
```

系统级优化：

```bash
# Linux：增加swap
sudo fallocate -l 8G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 或调整OOM killer策略
echo -15 > /proc/self/oom_score_adj
```

**对应章节**：第19章「性能优化与资源管理」

---

## B.6 环境类

环境配置问题是新手入行的高频障碍，依赖冲突、Python版本问题、虚拟环境混乱往往让人花费大量时间排查。

### B.6.1 依赖冲突

**错误信息关键词**：`Conflicting dependencies`、`Cannot install X==1.0 because Y==2.0`、`pip install failed`

**出现场景**：安装多个包时版本不兼容、升级某个包导致其他包不可用。

**解决方案**：

```bash
# 诊断1：检查冲突
pip check

# 诊断2：查看依赖树
pipdeptree
# 或
pip install pipdeptree && pipdeptree

# 诊断3：查看具体冲突
pip install packageA==1.0 packageB==2.0 --dry-run
```

```toml
# pyproject.toml 使用现代依赖管理
[project]
name = "ai-app"
version = "0.1.0"
requires-python = ">=3.10"

dependencies = [
    "langchain>=0.1.0,<0.2.0",
    "langchain-openai>=0.0.5",
    "fastapi>=0.100.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "black>=23.0.0",
]
```

```bash
# 方案1：使用虚拟环境隔离
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  Windows
pip install -r requirements.txt

# 方案2：使用pip-tools锁定版本
pip install pip-tools
pip-compile requirements.in  # 生成requirements.txt
pip-sync requirements.txt

# 方案3：使用Poetry
pip install poetry
poetry init
poetry add langchain openai
poetry install
```

常见冲突处理：

```bash
# LangChain与Tiktoken冲突
pip install tiktoken==0.5.2  # 指定兼容版本

# Transformers与PyTorch版本冲突
pip install transformers torch --upgrade
```

**对应章节**：第2章「开发环境配置」

---

### B.6.2 Python版本不兼容

**错误信息关键词**：`Python version mismatch`、`requires Python X.Y`、`SyntaxError`

**出现场景**：运行代码时遇到语法错误或模块不支持当前Python版本。

**根因分析**：项目使用较新Python特性（如match语句、类型标注泛化）、或依赖包仅支持特定Python版本。

**解决方案**：

```bash
# 检查Python版本
python --version
python3 --version

# 方案1：使用pyenv管理多版本
# 安装
brew install pyenv  # Mac
# 或
curl pyenv.installer | bash  # Linux

# 使用
pyenv install 3.11.7
pyenv local 3.11.7
pyenv versions

# 方案2：Docker指定版本（推荐生产环境）
# Dockerfile
FROM python:3.11-slim

# 方案3：使用conda
conda create -n ai-env python=3.11
conda activate ai-env
```

```python
# 代码兼容性处理
import sys

if sys.version_info < (3, 10):
    # Python 3.9 兼容处理
    from typing import Union
    def match(value):
        # 手动实现match逻辑
        if value == "case1": return result1
        ...
else:
    # Python 3.10+ 使用原生match
    pass

# 类型标注兼容
from __future__ import annotations  # Python 3.9需要
```

**对应章节**：第2章「开发环境配置」

---

### B.6.3 虚拟环境问题

**错误信息关键词**：`venv not activated`、`Wrong environment`、`Module not found`

**出现场景**：安装了包但import时报错，或在IDE中运行代码找不到已安装的模块。

**根因分析**：虚拟环境未激活、IDE未关联正确的Python解释器、pip install位置错误。

**解决方案**：

```bash
# 检查当前环境
which python
which pip
pip show package-name

# 方案1：重新创建虚拟环境
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 方案2：确认IDE解释器（VS Code）
# Ctrl+Shift+P → Python: Select Interpreter → 选择venv中的Python

# 方案3：Jupyter关联虚拟环境
source venv/bin/activate
pip install ipykernel
python -m ipykernel install --user --name=ai-env
# Jupyter中切换内核

# 方案4：pip安装到用户目录（避免venv问题）
pip install --user package-name
```

```python
# 在代码中验证环境
import sys
import site

print(f"Python: {sys.executable}")
print(f"Site packages: {site.getsitepackages()}")
print(f"User site: {site.getusersitepackages()}")

# 确认模块路径
import importlib
spec = importlib.util.find_spec("langchain")
print(f"LangChain位置: {spec.origin if spec else '未找到'}")
```

**对应章节**：第2章「开发环境配置」

---

### B.6.4 .env文件不生效

**错误信息关键词**：`dotenv not found`、`environ not defined`、`API key is None`

**出现场景**：使用python-dotenv加载环境变量但变量未生效。

**根因分析**：.env文件位置不对、文件名错误（.env.local等需特殊处理）、变量名前后有空格。

**解决方案**：

```python
# 调试：打印所有加载的环境变量
from dotenv import load_dotenv
import os

# 明确指定.env文件路径
load_dotenv(".env")  # 或绝对路径
load_dotenv("/path/to/project/.env")

# 检查加载结果
print("OPENAI_API_KEY:", os.getenv("OPENAI_API_KEY"))
print("所有环境变量:", dict(os.environ))

# 常见错误
# 1. .env.local 只加载特定前缀的变量
# load_dotenv(".env.local", override=True)

# 2. 变量值有空格
# .env文件: API_KEY=sk-xxx (无引号)
# 不要写成: API_KEY= "sk-xxx"

# 3. .env在子目录但脚本在根目录运行
# 使用相对路径 + 项目根目录
from pathlib import Path
project_root = Path(__file__).parent
load_dotenv(project_root / ".env")
```

```bash
# 命令行测试
# 确保运行脚本前.env已加载
source .env && python main.py

# 或使用python-dotenv CLI
pip install python-dotenv
dotenv run python main.py
```

**对应章节**：第4章「API密钥管理」

---

## B.7 快速索引表

为方便快速查询，下表按错误关键词首字母排序列出所有条目：

| 关键词 | 错误类型 | 解决方案概要 | 章节 |
|--------|----------|--------------|------|
| `401` | API认证 | 检查API Key配置 | B.1.2 |
| `429` | 限流 | 指数退避重试 | B.1.1 |
| `Address already in use` | 端口冲突 | 杀死占用进程 | B.5.3 |
| `cannot find module` | 导入错误 | 统一LangChain版本 | B.4.1 |
| `Conflicting dependencies` | 依赖冲突 | 使用venv或pip-tools | B.6.1 |
| `Context length exceeded` | 上下文超限 | 分块处理 | B.1.3 |
| `CUDA out of memory` | GPU内存 | 模型量化 | B.5.4 |
| `dimension mismatch` | 向量维度 | 统一Embedding模型 | B.2.3 |
| `ImportError` | 导入错误 | 升级/降级包版本 | B.4.1 |
| `JSONDecodeError` | 格式解析 | 结构化输出+正则提取 | B.3.3 |
| `Killed` | 内存不足 | 增加swap或量化 | B.5.4 |
| `maximum iterations` | Agent死循环 | 添加终止条件 | B.3.2 |
| `ModuleNotFoundError` | 模块缺失 | pip install | B.6.1 |
| `No relevant documents` | 检索为空 | 调整检索策略 | B.2.1 |
| `OutOfMemoryError` | 内存不足 | 分批处理+量化 | B.5.4 |
| `Port is already allocated` | 端口冲突 | 查看并释放端口 | B.5.3 |
| `Python version mismatch` | 版本不兼容 | 使用pyenv | B.6.2 |
| `Rate limit exceeded` | 限流 | 添加重试+限速 | B.1.1 |
| `Timeout` | 请求超时 | 设置timeout参数 | B.1.4 |
| `Tool call failed` | 工具调用 | 异常处理+日志 | B.3.1 |
| `vector DB connection` | 向量库连接 | 检查服务状态 | B.2.4 |
| `venv not activated` | 环境未激活 | 激活venv | B.6.3 |

---

## B.8 求助资源

如果在排查本附录后仍未解决问题，建议按以下顺序寻求帮助：

1. **官方文档**：LangChain、OpenAI、Milvus等框架都有详尽的Troubleshooting指南
2. **GitHub Issues**：搜索类似问题，通常能找到临时解决方案
3. **社区论坛**：Stack Overflow、Reddit r/MachineLearning、知乎相关话题
4. **GitHub Discussions**：LangChain等活跃项目有专门的讨论区
5. **技术社群**：加入AI开发交流群，与同行互助

> **记住**：遇到报错是正常的，每个AI开发者都是在不断解决问题的过程中成长的。本附录会随技术迭代持续更新，欢迎读者反馈实际遇到的疑难问题。

---

*本附录最后更新：2025年*
