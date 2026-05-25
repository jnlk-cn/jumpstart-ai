---
outline: [2, 3]
---

# 第9章 LangChain实战

## 本章你能带走什么

兄弟们，又到了实战环节了！

前面几章我们打好了基础——你会调用大模型了（第5章），知道怎么给AI接知识库了（第6章），也搞明白了Agent是怎么工作的（第7章）。现在，是时候把这些能力**串起来变成真正能用的东西**了。

这一章，我们来搞定LangChain——目前最流行的AI应用开发框架。

先说句实话：**LangChain这玩意儿，入门简单，用好难**。官方的教程都是Hello World级别，真正上生产环境的时候，各种问题就来了：版本不兼容、调试困难、性能拉胯……

但是！LangChain依然是目前最主流的AI应用开发框架，学会它，找工作加分、接项目效率翻倍。而且2025-2026年，LangChain推出了**LangGraph**，这玩意儿直接让复杂Agent编排变成了声明式编程——就像从汇编进化到Python一样爽。

所以这一章，我会带你：

- 快速过一遍LangChain架构和核心模块（不废话）
- 深入讲LCEL——这是LangChain的精髓，必须搞透
- **重头戏：LangGraph**——这是2026年Agent开发的标配工具，我给你掰开了揉碎了讲
- 从玩具级升级到生产级的RAG实现
- 深度拆解多工具Agent，包括并发调用、错误处理、工具选择策略
- LangChain的坑和替代方案

读完这章，你不仅能搭一个能用的AI应用，更能搭一个**能上生产的AI应用**。

废话不多说，我们开始。

---

## 9.1 LangChain架构与核心模块

### LangChain是什么？

简单来说，LangChain就是一个**AI应用的"乐高积木"**。

想象一下，如果你要从零开发一个AI应用，你需要：
- 写Prompt模板
- 调用大模型API
- 处理上下文和对话历史
- 管理向量数据库和检索
- 实现工具调用和Agent逻辑
- 处理错误和异常

每个环节都有坑，每个环节都要写一堆代码。LangChain把这些都封装好了，你只需要**拼积木**就行。

官方定义：LangChain是一个通过组合模块化组件来构建LLM应用的框架。它的核心理念是**可组合性**——每个组件都可以单独使用，也可以自由组合。

### 核心模块一览

LangChain的整体架构可以分为以下几个核心模块：

```
┌─────────────────────────────────────────────────────────────┐
│                      LangChain 架构                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │  Model  │  │ Prompt  │  │  Chain  │  │  Tool   │        │
│  │  模型层 │  │ 提示层  │  │ 链式层  │  │ 工具层  │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │Retrieval│  │ Memory  │  │  Agent  │  │  Index  │        │
│  │  检索层 │  │ 记忆层  │  │ 代理层  │  │ 索引层  │        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│              LangGraph (复杂Agent编排/工作流)                  │
│              LangSmith (可观测性/调试)                       │
│              LangFlow (可视化搭建)                           │
└─────────────────────────────────────────────────────────────┘
```

**各模块职责：**

| 模块 | 职责 | 关键类/组件 |
|------|------|-------------|
| **Model** | 模型调用封装 | `ChatOpenAI`, `ChatAnthropic`, `ChatDeepSeek` |
| **Prompt** | 提示模板管理 | `ChatPromptTemplate`, `PromptTemplate` |
| **Chain** | 链式调用编排 | LCEL的管道语法 |
| **Tool** | 工具定义与调用 | `@tool`装饰器, `Tool`类 |
| **Retrieval** | 文档检索 | `Retriever`, `VectorStore` |
| **Memory** | 对话历史管理 | `ConversationMemory`, `BaseChatMessageHistory` |
| **Agent** | Agent执行引擎 | `create_react_agent`, `create_tool_calling_agent` |

> **Note**：关于Agent的核心概念（第7章已经详细讲过），本章不再赘述，直接讲怎么用LangChain实现。

### 安装与环境配置

**环境要求：**
- Python >= 3.10（必须，低于这个版本装不上）
- pip 或 conda

**安装命令：**

```bash
# 创建虚拟环境（推荐）
conda create -n langchain-env python=3.11
conda activate langchain-env

# 安装核心包
pip install langchain>=1.0.0

# 安装OpenAI集成（必装）
pip install langchain-openai>=0.2.0

# 安装LangGraph（重点！）
pip install langgraph>=0.2.0

# 如果用国产模型，安装对应集成
pip install langchain-community  # 包含百度、阿里等国产模型集成
```

> ⚠️ **重要提示**：2026年了，不要再安装旧版本的LangChain了！v0.3.0开始移除了`LLMChain`等旧API，必须使用LCEL语法。如果你看到教程里还在用`.run()`方法，那一定是老教程，赶紧跑。

### 快速验证安装

```python
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

# 初始化模型
llm = ChatOpenAI(model="gpt-4o-mini")

# 发送消息
response = llm.invoke([HumanMessage(content="你好，LangChain！")])
print(response.content)
```

如果能正常打印回复，说明安装成功。

---

## 9.2 Chain、Agent、Tool三件套

理解了LangChain的整体架构，我们来深入它的"三件套"：**Chain（链）**、**Agent（代理）**、**Tool（工具）**。

由于第7章已经详细讲解了Agent的核心概念，这里我们重点聚焦**Tool设计**——这是很多人忽视但实际上最能体现功力的地方。

### Tool：让AI能"动手"

Tool是LangChain的基础组件——它让AI能够操作真实世界。

**为什么需要Tool？**

大模型再强，也只能"纸上谈兵"。它不知道明天的天气，不能帮你查数据库，更没法帮你发邮件。Tool就是AI的"手脚"——让AI真正能做事。

**初级Tool：能跑就行**

```python
from langchain_core.tools import tool

@tool
def get_weather(city: str) -> str:
    """获取指定城市的天气预报。
    
    Args:
        city: 城市名称，如"北京"、"上海"
    
    Returns:
        天气情况描述
    """
    weather_data = {
        "北京": "今天晴，温度15-25度",
        "上海": "今天多云，温度18-26度",
        "深圳": "今天有雨，温度22-28度"
    }
    return weather_data.get(city, "未找到该城市的天气信息")
```

这种写法人人都能写出来，但**生产级Tool**可不是这么简单的。

**生产级Tool：带验证、带错误处理、带类型约束**

让我给你看一个真正能上生产的Tool设计：

```python
from langchain_core.tools import tool, BaseTool
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Type
from datetime import datetime
import httpx
import asyncio
from functools import lru_cache


class WeatherInput(BaseModel):
    """天气查询的输入模型——带完整验证"""
    city: str = Field(..., description="城市名称，必须是真实存在的城市")
    date: Optional[str] = Field(default="today", description="查询日期，格式YYYY-MM-DD或'today'")
    include_hourly: bool = Field(default=False, description="是否包含逐小时预报")
    
    @field_validator('city')
    @classmethod
    def validate_city(cls, v: str) -> str:
        """城市名校验：去空格、首字母大写"""
        cleaned = v.strip().title()
        if len(cleaned) < 2:
            raise ValueError("城市名太短")
        return cleaned
    
    @field_validator('date')
    @classmethod
    def validate_date(cls, v: str) -> str:
        """日期校验"""
        if v == "today":
            return datetime.now().strftime("%Y-%m-%d")
        # 简单日期格式校验
        try:
            datetime.strptime(v, "%Y-%m-%d")
            return v
        except ValueError:
            raise ValueError(f"无效的日期格式: {v}，期望格式: YYYY-MM-DD")


class WeatherOutput(BaseModel):
    """天气查询的输出模型——结构化返回"""
    city: str
    date: str
    weather: str
    temperature_high: int
    temperature_low: int
    humidity: int
    wind_speed: str
    hourly_forecast: Optional[list] = None
    source: str = "mock"
    
    def to_display_string(self) -> str:
        """人类友好的显示格式"""
        result = f"{self.city} {self.date}天气：\n"
        result += f"🌤️ {self.weather}\n"
        result += f"🌡️ 温度：{self.temperature_low}°C ~ {self.temperature_high}°C\n"
        result += f"💧 湿度：{self.humidity}%\n"
        result += f"🌬️ 风速：{self.wind_speed}\n"
        
        if self.hourly_forecast:
            result += "\n⏰ 逐小时预报："
            for hour, hour_weather in self.hourly_forecast.items():
                result += f"\n  {hour}: {hour_weather}"
        
        return result


@tool(args_schema=WeatherInput, return_schema=WeatherOutput)
def get_weather_production(
    city: str,
    date: str = "today",
    include_hourly: bool = False
) -> WeatherOutput:
    """
    获取指定城市的天气预报，支持未来7天预报。
    
    这个工具封装了真实的天气API调用，具备：
    - 输入验证（城市名、日期格式）
    - 错误处理（API超时、服务不可用）
    - 结构化返回（不是字符串，是对象）
    - 可选逐小时预报
    
    使用场景：
    - 用户问"明天上海天气怎么样"
    - 需要根据天气决定行程
    - 出行/旅游类应用
    """
    
    # 实际项目中，这里连接真实的天气API
    # 比如和风天气、OpenWeatherMap等
    # 为了演示，这里用mock数据
    
    mock_weather_db = {
        "Beijing": {
            "weather": "晴",
            "temp_range": (15, 25),
            "humidity": 45,
            "wind": "2-3级东南风"
        },
        "Shanghai": {
            "weather": "多云转晴",
            "temp_range": (18, 26),
            "humidity": 60,
            "wind": "3-4级东南风"
        },
        "Shenzhen": {
            "weather": "雷阵雨",
            "temp_range": (24, 30),
            "humidity": 85,
            "wind": "4-5级西南风"
        },
        "Hangzhou": {
            "weather": "阴",
            "temp_range": (16, 24),
            "humidity": 70,
            "wind": "2级东北风"
        }
    }
    
    # 尝试获取数据
    weather_info = mock_weather_db.get(city)
    
    if not weather_info:
        available_cities = ", ".join(mock_weather_db.keys())
        raise ValueError(
            f"未找到城市'{city}'的天气数据。"
            f"目前支持的城市：{available_cities}"
        )
    
    # 生成逐小时预报（如果需要）
    hourly = None
    if include_hourly:
        hourly = {
            f"{h:02d}:00": f"{weather_info['weather']} {weather_info['temp_range'][0] + (h % 5)}°C"
            for h in range(8, 21, 3)  # 8点、11点、14点、17点、20点
        }
    
    return WeatherOutput(
        city=city,
        date=date,
        weather=weather_info["weather"],
        temperature_high=weather_info["temp_range"][1],
        temperature_low=weather_info["temp_range"][0],
        humidity=weather_info["humidity"],
        wind_speed=weather_info["wind"],
        hourly_forecast=hourly,
        source="mock_weather_api"
    )


# 带重试和熔断的Tool调用器
class ResilientToolExecutor:
    """
    带重试、熔断、超时控制的工具执行器
    生产级Agent必备！
    """
    
    def __init__(self, max_retries: int = 3, timeout: float = 10.0):
        self.max_retries = max_retries
        self.timeout = timeout
        self._circuit_breaker = {}
    
    async def execute_with_retry(
        self, 
        tool: BaseTool, 
        tool_input: dict,
        circuit_breaker_key: str = "default"
    ) -> str:
        """带重试的Tool执行"""
        
        # 检查熔断器
        if self._circuit_breaker.get(circuit_breaker_key, False):
            raise RuntimeError(
                f"Tool '{circuit_breaker_key}' 熔断器已触发，请稍后重试"
            )
        
        last_error = None
        
        for attempt in range(self.max_retries):
            try:
                # 带超时执行
                result = await asyncio.wait_for(
                    tool.ainvoke(tool_input),
                    timeout=self.timeout
                )
                
                # 成功，熔断器计数归零
                self._circuit_breaker[circuit_breaker_key] = False
                return result
                
            except asyncio.TimeoutError:
                last_error = f"Tool执行超时（{self.timeout}s）"
                
            except Exception as e:
                last_error = f"Tool执行错误: {str(e)}"
            
            # 指数退避
            if attempt < self.max_retries - 1:
                wait_time = 2 ** attempt
                await asyncio.sleep(wait_time)
        
        # 重试全部失败，触发熔断
        self._circuit_breaker[circuit_breaker_key] = True
        raise RuntimeError(
            f"Tool执行失败，已重试{self.max_retries}次。最后错误：{last_error}"
        )
    
    def reset_circuit_breaker(self, key: str = "default"):
        """手动重置熔断器"""
        self._circuit_breaker[key] = False


# Tool设计的最佳实践总结
"""
好的Tool设计应该具备：

1. 完整的输入验证（Pydantic Model）
   - 类型约束
   - 范围校验
   - 自定义验证逻辑

2. 结构化的输出（不是字符串）
   - 返回对象而非字符串拼接
   - 方便后续处理
   - 支持序列化

3. 清晰的文档字符串
   - Args：每个参数的作用
   - Returns：返回值的格式和含义
   - 使用场景：什么时候该调用这个Tool

4. 错误处理
   - 有意义的错误信息
   - 不要直接raise Exception
   - 区分可恢复/不可恢复错误

5. 熔断和重试（生产环境）
   - 防止无限重试
   - 避免雪崩效应
   - 超时控制
"""
```

**Tool设计的最佳实践：**

```python
# ❌ 糟糕的工具定义
@tool
def search(q):
    """搜索"""
    return "结果"

# ✅ 优秀的工具定义
@tool
def search_hotel(
    location: str,
    check_in: str,
    check_out: str,
    guests: int = 1,
    price_range: Optional[tuple[int, int]] = None
) -> dict:
    """
    在指定平台搜索酒店。
    
    Args:
        location: 酒店所在城市或地区
        check_in: 入住日期，格式YYYY-MM-DD
        check_out: 退房日期，格式YYYY-MM-DD  
        guests: 入住人数，默认1人
        price_range: 价格区间(元)，如(200, 500)
    
    Returns:
        {
            "hotels": [{"name": str, "price": int, "rating": float, "address": str}],
            "total": int,
            "query_time": str,
            "filters_applied": dict
        }
    
    Raises:
        ValueError: 日期格式错误或入住日期早于退房日期
        RuntimeError: 搜索服务不可用
    
    使用场景:
        - 用户想找特定日期的酒店
        - 用户指定了价格区间
        - 用户想比较多个酒店
    """
    pass
```

好的工具定义应该包含：
1. **清晰的描述**：让模型能理解什么时候该调用
2. **完整的参数说明**：类型、作用、默认值、校验规则
3. **结构化的返回值**：返回字典而不是字符串
4. **错误处理**：明确可能抛出的异常
5. **使用场景说明**：帮助模型判断何时调用

### Chain：把组件串起来

Chain（链）是LangChain的核心概念——它把多个组件串联起来，形成一个完整的处理流程。

**传统方式（已废弃）：**

```python
# ❌ 这是旧版写法，v0.3.0+已经不能用
from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate

chain = LLMChain(
    llm=llm,
    prompt=PromptTemplate.from_template("用中文回答：{question}")
)
result = chain.run(question="LangChain是什么")  # 这个.run()方法已经没有了！
```

**现代方式：LCEL（LangChain Expression Language）**

```python
# ✅ 用LCEL，这才是正确姿势
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

# 初始化模型
llm = ChatOpenAI(model="gpt-4o-mini")

# 定义Prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", "你是一个乐于助人的助手，擅长用简洁的语言回答问题。"),
    ("human", "{question}")
])

# 用管道符串起来
chain = prompt | llm | StrOutputParser()

# 调用链
result = chain.invoke({"question": "LangChain是什么？"})
print(result)
```

> 💡 **小贴士**：LCEL的管道运算符`|`让代码变得像"流水线"一样清晰——数据从左往右流，每个组件处理完传给下一个。

---

## 9.3 LCEL（LangChain Expression Language）详解

LCEL是LangChain的**核心语法**，也是2024年后官方主推的写法。2026年的今天，LCEL已经进化到了非常成熟的阶段，配合LangGraph，几乎可以搭建任何复杂的AI应用。

### 什么是LCEL？

LCEL（LangChain Expression Language）是一种**声明式**的链式调用语法。它用管道运算符`|`把各个组件串起来，让代码变得像搭积木一样简单。

**为什么需要LCEL？**

以前的LangChain有很多种"链"：
- `LLMChain`：简单Prompt+模型
- `SequentialChain`：顺序执行
- `StuffDocumentsChain`：处理文档
- `RefineDocumentsChain`：迭代优化

每种链有自己的API，混在一起就乱了。

LCEL统一了这一切——**所有组件都是Runnable，都用同样的方式调用**。你可以用`|`随意组合，没有限制。

### 基础语法

**1. 同步调用 `.invoke()`**

```python
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini")
prompt = ChatPromptTemplate.from_template("用一句话解释：{topic}")
parser = StrOutputParser()

chain = prompt | llm | parser

# invoke 接收字典，返回字符串
result = chain.invoke({"topic": "什么是RAG"})
print(result)
```

**2. 异步调用 `.ainvoke()`**

```python
import asyncio
from langchain_openai import ChatOpenAI

async def main():
    result = await chain.ainvoke({"topic": "人工智能"})
    print(result)

asyncio.run(main())
```

**3. 流式输出 `.stream()`**

```python
# 一个字一个字地输出，像ChatGPT那样
for chunk in chain.stream({"topic": "大模型"}):
    print(chunk, end="", flush=True)
```

**4. 批量处理 `.batch()`**

```python
# 一次处理多个输入
results = chain.batch([
    {"topic": "机器学习"},
    {"topic": "深度学习"},
    {"topic": "自然语言处理"}
])
```

### 进阶用法

**1. 并行执行 `RunnableParallel`**

有些步骤可以同时进行，比如同时从多个来源获取信息：

```python
from langchain_core.runnables import RunnableParallel

# 假设有多个检索器
retriever1 = vectorstore1.as_retriever()
retriever2 = vectorstore2.as_retriever()

# 并行执行
parallel = RunnableParallel({
    "doc1": retriever1,
    "doc2": retriever2,
    "original": lambda x: x["question"]  # 保留原始问题
})

result = parallel.invoke({"question": "我的问题是什么？"})
# result = {"doc1": [...], "doc2": [...], "original": "我的问题是什么？"}
```

**2. 条件路由 `RunnableBranch`**

根据条件选择不同的处理路径：

```python
from langchain_core.runnables import RunnableBranch

# 定义不同分支
general_chain = prompt_general | llm | parser
tech_chain = prompt_tech | llm | parser

# 根据条件路由
router = RunnableBranch(
    (lambda x: "技术" in x["category"], tech_chain),  # 如果category包含"技术"
    (lambda x: "一般" in x["category"], general_chain),  # 如果category包含"一般"
    general_chain  # 默认分支
)

result = router.invoke({"category": "技术问题", "question": "如何优化SQL？"})
```

**3. 自定义处理 `RunnableLambda`**

当内置组件不够用时，可以自己写处理逻辑：

```python
from langchain_core.runnables import RunnableLambda

# 自定义函数
def extract_keywords(text: str) -> list:
    """提取关键词"""
    # 实际项目中调用NLP服务
    return ["关键词1", "关键词2", "关键词3"]

# 用RunnableLambda包装
chain = prompt | llm | parser | RunnableLambda(extract_keywords)

result = chain.invoke({"topic": "Python编程"})
# result = ["关键词1", "关键词2", "关键词3"]
```

**4. 错误处理**

```python
# 添加fallback链
primary_chain = prompt | llm | parser
fallback_chain = prompt_fallback | llm | parser

# 当前面的链失败时，使用fallback
chain = primary_chain.with_fallbacks([fallback_chain])

# 自动重试
chain = primary_chain.with_retry(stop_after_attempt=3)
```

### 复杂链路的LCEL实现

光会简单的管道还不够，生产环境里你经常需要处理更复杂的场景。让我给你几个实战级的例子：

**场景一：多检索器融合（RAG Fusion）**

```python
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate

# 假设我们有多个检索器
retriever_technical = vectorstore_tech.as_retriever(search_kwargs={"k": 3})
retriever_general = vectorstore_general.as_retriever(search_kwargs={"k": 3})
retriever_docs = vectorstore_docs.as_retriever(search_kwargs={"k": 2})

# 生成多个查询变体（模拟Query Expansion）
def generate_query_variants(input_dict: dict) -> dict:
    """为原始问题生成多个查询变体"""
    original = input_dict["question"]
    # 实际项目中可以让LLM生成变体
    variants = [
        original,
        f"{original} - 详细说明",
        f"{original} - 原理讲解",
        f"{original} - 实际应用"
    ]
    return {"queries": variants, "original": original}

# Reciprocal Rank Fusion - 一种经典的重排序算法
def reciprocal_rank_fusion(results_lists: list, k: int = 60) -> list:
    """
    RRF重排序算法
    将多个检索结果按排名融合成一个列表
    """
    fused_scores = {}
    
    for results in results_lists:
        for rank, doc in enumerate(results):
            doc_id = doc.metadata.get("id", doc.page_content[:50])
            if doc_id not in fused_scores:
                fused_scores[doc_id] = {"doc": doc, "score": 0}
            fused_scores[doc_id]["score"] += 1 / (k + rank + 1)
    
    # 按分数排序
    reranked = sorted(
        fused_scores.values(),
        key=lambda x: x["score"],
        reverse=True
    )
    
    return [item["doc"] for item in reranked]

# 组装复杂链路
def format_docs(docs: list) -> str:
    """格式化文档"""
    return "\n\n".join([
        f"[来源 {i+1}] {doc.page_content}\n"
        f"标签: {doc.metadata.get('source', '未知')}"
        for i, doc in enumerate(docs)
    ])

# 构建RAG Fusion链
rag_fusion_chain = (
    # 1. 生成查询变体
    RunnableLambda(generate_query_variants)
    
    # 2. 并行执行多个检索器
    | RunnableParallel(
        tech_results=(
            lambda x: [retriever_technical.invoke(q) for q in x["queries"]]
        ),
        general_results=(
            lambda x: [retriever_general.invoke(q) for q in x["queries"]]
        ),
        docs_results=(
            lambda x: [retriever_docs.invoke(q) for q in x["queries"]]
        )
    )
    
    # 3. RRF重排序
    | RunnableLambda(lambda x: {
        "tech": [doc for docs in x["tech_results"] for doc in docs],
        "general": [doc for docs in x["general_results"] for doc in docs],
        "docs": [doc for docs in x["docs_results"] for doc in docs]
    })
    
    # 4. 分别融合
    | RunnableLambda(lambda x: {
        "tech_reranked": reciprocal_rank_fusion(x["tech"]),
        "general_reranked": reciprocal_rank_fusion(x["general"]),
        "docs_reranked": reciprocal_rank_fusion(x["docs"])
    })
    
    # 5. 合并所有结果，取Top-5
    | RunnableLambda(lambda x: 
        reciprocal_rank_fusion([
            x["tech_reranked"][:2],
            x["general_reranked"][:2],
            x["docs_reranked"][:1]
        ])[:5]
    )
)

# 完整的RAG Fusion链（带生成）
prompt = ChatPromptTemplate.from_template("""基于以下参考信息回答问题。
如果信息不足，基于你的知识回答，但请标注"根据知识补充"。

参考信息：
{context}

问题：{question}

回答：""")

final_chain = (
    {
        "context": rag_fusion_chain | RunnableLambda(format_docs),
        "question": RunnablePassthrough()
    }
    | prompt
    | llm
    | StrOutputParser()
)
```

**场景二：带验证的输出解析**

```python
from pydantic import BaseModel, Field, validator
from langchain_core.output_parsers import JsonOutputParser

class ExtractedInfo(BaseModel):
    """结构化信息提取"""
    title: str = Field(description="文章标题")
    summary: str = Field(description="100字以内的摘要")
    key_points: list[str] = Field(description="3-5个关键点")
    sentiment: str = Field(description="情感倾向：正面/负面/中性")
    confidence: float = Field(description="置信度0-1")
    
    @validator('sentiment')
    def validate_sentiment(cls, v):
        if v not in ['正面', '负面', '中性']:
            raise ValueError('情感必须是"正面"、"负面"或"中性"')
        return v
    
    @validator('confidence')
    def validate_confidence(cls, v):
        if not 0 <= v <= 1:
            raise ValueError('置信度必须在0-1之间')
        return v

# 带验证的解析链
parsing_chain = prompt | llm | JsonOutputParser(pydantic_model=ExtractedInfo)

# 如果解析失败，自动重试
safe_parsing_chain = parsing_chain.with_fallbacks([
    # Fallback 1: 放宽要求再试
    ChatPromptTemplate.from_template("""请从以下文本中提取信息，以JSON格式返回。
要求宽松一些，允许缺失字段用null填充。

文本：{text}

返回格式：
{
    "title": "...",
    "summary": "...",
    "key_points": [...],
    "sentiment": "正面|负面|中性",
    "confidence": 0.0-1.0
}""") | llm | JsonOutputParser()
])

# 使用示例
try:
    result = safe_parsing_chain.invoke({"text": "你的待分析文本..."})
    print(f"提取结果：{result}")
except Exception as e:
    print(f"解析失败：{e}")
```

### LCEL vs 旧版Chain：对比一览

| 特性 | 旧版Chain | LCEL |
|------|----------|------|
| 语法 | 面向对象，方法调用 | 管道运算符 `\|` |
| 灵活性 | 固定模式 | 自由组合 |
| 并行支持 | 需额外处理 | 原生支持 |
| 流式输出 | 需单独配置 | `chain.stream()` |
| 异步支持 | 需额外封装 | `chain.ainvoke()` |
| 兼容性 | v0.3.0移除 | ✅ 主流方式 |

> ⚠️ **重要**：如果你看到教程还在用`LLMChain`、`.run()`方法，那一定是老教程，赶紧跳过。2024年9月发布的v0.3.0已经完全移除了旧API。

---

## 9.4 LangGraph：Agent工作流编排（重点来了！）

**终于到了重头戏！**

如果说LCEL是LangChain的语法糖，那**LangGraph就是LangChain的灵魂**。

2026年的今天，如果你还在用硬编码的方式写Agent循环，我只能说你out了。LangGraph让复杂Agent编排变成了**声明式编程**——你定义节点、边、状态，框架帮你处理执行流程。

### 为什么需要LangGraph？

先问你一个问题：**当你的Agent需要多轮对话、人工审批、条件分支、并行执行时，你怎么办？**

```python
# 硬编码Agent - 噩梦开始
while True:
    user_input = get_input()
    
    # 判断要调用哪个工具
    if "天气" in user_input:
        weather_result = get_weather(user_input)
        response = process_weather(weather_result)
    elif "搜索" in user_input:
        search_result = search(user_input)
        response = process_search(search_result)
    elif "邮件" in user_input:
        if need_approval:  # 需要审批？
            # 复杂的审批流程...
            pass
        else:
            email_result = send_email(user_input)
            response = process_email(email_result)
    # ... 无限if-else
    
    # 并行执行多个任务？
    # 历史记录管理？
    # 错误恢复？
```

这种写法：
1. **不可维护**：逻辑全挤在一起，改一个功能可能牵动全身
2. **难以测试**：你没法单独测试某个"分支"
3. **不支持复杂流程**：多Agent协作？循环？人工介入？想都别想

**LangGraph的解决方案：**

```python
# LangGraph - 清晰的声明式定义
from langgraph.graph import StateGraph, END

# 定义状态
class AgentState(TypedDict):
    messages: list
    current_task: str
    approved: bool
    results: dict

# 定义节点
def planning_node(state):
    """规划节点"""
    return {"current_task": "分解任务..."}

def research_node(state):
    """研究节点"""
    return {"results": {"research": "..."}}

def approval_node(state):
    """审批节点 - 等待人工确认"""
    return {"approved": False}  # 中断等待用户确认

def execution_node(state):
    """执行节点"""
    return {"results": {"executed": "..."}}

# 定义边
graph = StateGraph(AgentState)
graph.add_node("planning", planning_node)
graph.add_node("research", research_node)
graph.add_node("approval", approval_node)
graph.add_node("execution", execution_node)

# 设置流程
graph.set_entry_point("planning")
graph.add_edge("planning", "research")
graph.add_edge("research", "approval")
graph.add_edge("approval", "execution", condition=lambda s: s["approved"])
graph.add_edge("approval", END)  # 或直接结束

# 编译运行
app = graph.compile()
```

看到了吗？**流程即代码，代码即流程**。

### LangGraph核心概念

**1. State（状态）**

状态是LangGraph的核心——每个节点都会接收当前状态、处理后返回新状态。

```python
from typing import TypedDict, Annotated
from langgraph.graph import add_messages

class AgentState(TypedDict):
    """Agent的共享状态"""
    messages: Annotated[list, add_messages]  # 消息历史，自动追加
    user_info: dict                             # 用户信息
    context: dict                               # 上下文数据
    next_action: str                            # 下一步动作
    iteration_count: int                       # 迭代计数，防止死循环
    
    # 可选：定义默认值
    def __init__(self):
        self.iteration_count = 0
```

**2. Nodes（节点）**

节点就是一个Python函数，接收状态，返回状态更新。

```python
def planner_node(state: AgentState) -> AgentState:
    """规划节点：分析用户请求，分解任务"""
    
    last_message = state["messages"][-1]
    user_request = last_message.content
    
    # 调用LLM分解任务
    plan = llm.invoke(f"分解以下任务为具体步骤：{user_request}")
    
    return {
        "context": {"plan": plan, "steps": ["step1", "step2"]},
        "next_action": "research"
    }

def researcher_node(state: AgentState) -> AgentState:
    """研究节点：执行资料收集"""
    
    steps = state["context"]["steps"]
    results = {}
    
    for step in steps:
        # 并行或串行执行研究
        results[step] = research(step)
    
    return {
        "context": {"research_results": results},
        "next_action": "synthesize"
    }

def synthesizer_node(state: AgentState) -> AgentState:
    """综合节点：汇总研究结果"""
    
    results = state["context"]["research_results"]
    summary = llm.invoke(f"总结以下研究结果：{results}")
    
    return {
        "messages": [AIMessage(content=summary)],
        "next_action": END
    }
```

**3. Edges（边）**

边定义节点之间的连接关系。

```python
from langgraph.graph import StateGraph, END

# 创建图
graph = StateGraph(AgentState)

# 添加节点
graph.add_node("planner", planner_node)
graph.add_node("researcher", researcher_node)
graph.add_node("synthesizer", synthesizer_node)

# 普通边 - 直接连接
graph.add_edge("planner", "researcher")  # planner完成后直接去researcher
graph.add_edge("researcher", "synthesizer")  # researcher完成后直接去synthesizer

# 条件边 - 根据状态决定下一步
def should_continue(state: AgentState) -> str:
    """根据条件决定下一步"""
    if state["iteration_count"] > 10:
        return "end"
    elif state["next_action"] == "synthesize":
        return "synthesizer"
    elif state["next_action"] == "research":
        return "researcher"
    else:
        return "planner"

graph.add_conditional_edges(
    "researcher",  # 从researcher节点
    should_continue,  # 决定下一步
    {
        "synthesizer": "synthesizer",
        "researcher": "researcher",
        "end": END
    }
)

# 设置入口点
graph.set_entry_point("planner")

# 编译
app = graph.compile()
```

### 实战案例：多步骤研究报告Agent

让我给你一个**真正能用的**研究报告生成Agent。这个Agent会：
1. 理解用户的研究主题
2. 自动规划研究步骤
3. 并行搜索多个来源
4. 生成研究报告
5. 支持人工审核和修改

```python
"""
LangGraph实战：智能研究报告Agent
功能：
- 自动分解研究主题
- 多源并行信息收集
- 结构化报告生成
- 人工审核与修改
"""

from typing import TypedDict, Annotated, Literal
from langgraph.graph import StateGraph, END, add_messages
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import ToolNode
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
import json
from datetime import datetime

# ============================================
# 第一部分：定义状态和工具
# ============================================

class ResearchState(TypedDict):
    """研究报告Agent的状态"""
    messages: Annotated[list, add_messages]
    topic: str                    # 研究主题
    outline: dict                 # 报告大纲
    research_results: dict        # 研究结果（按章节存储）
    draft: str                    # 初稿
    feedback: str                 # 审核反馈
    revision_count: int           # 修改次数
    final_report: str             # 最终报告
    status: str                   # 当前状态

@tool
def search_web(query: str) -> str:
    """搜索网络获取信息"""
    # 实际项目中调用搜索API
    return f"关于'{query}'的搜索结果：..."

@tool
def search_academic(query: str) -> str:
    """搜索学术资源"""
    return f"学术搜索结果：..."

@tool
def get_company_info(company_name: str) -> str:
    """获取公司信息"""
    return f"{company_name}的公司信息..."

@tool
def generate_outline(topic: str) -> dict:
    """生成报告大纲"""
    # 模拟LLM生成大纲
    return {
        "title": f"{topic}研究报告",
        "sections": [
            {"name": "摘要", "description": "简要概述"},
            {"name": "背景介绍", "description": "行业背景和现状"},
            {"name": "市场分析", "description": "市场规模和竞争格局"},
            {"name": "发展趋势", "description": "未来发展方向"},
            {"name": "结论建议", "description": "总结和建议"}
        ],
        "estimated_length": "3000-5000字"
    }

@tool
def write_section(section_name: str, section_desc: str, research_data: dict) -> str:
    """撰写报告的某个章节"""
    return f"## {section_name}\n\n根据研究数据撰写的{section_name}内容...\n"

# ============================================
# 第二部分：定义节点函数
# ============================================

def init_research(state: ResearchState) -> ResearchState:
    """初始化研究：理解主题，生成大纲"""
    
    topic = state["topic"]
    
    # 生成报告大纲
    outline = generate_outline.invoke(topic)
    
    return {
        "outline": outline,
        "status": "planning",
        "research_results": {}
    }

def planner_node(state: ResearchState) -> ResearchState:
    """规划节点：决定下一步研究什么"""
    
    outline = state["outline"]
    completed_sections = set(state["research_results"].keys())
    
    # 找到下一个待研究的章节
    next_section = None
    for section in outline["sections"]:
        if section["name"] not in completed_sections:
            next_section = section
            break
    
    if next_section:
        return {
            "status": "researching",
            "context": {"current_section": next_section}
        }
    else:
        # 所有章节都研究完了，进入撰写
        return {"status": "writing_draft"}

def research_node(state: ResearchState) -> ResearchState:
    """研究节点：收集特定章节的信息"""
    
    current_section = state.get("context", {}).get("current_section")
    if not current_section:
        return {"status": "writing_draft"}
    
    section_name = current_section["name"]
    section_desc = current_section["description"]
    
    # 并行搜索多个来源
    research_data = {
        "web": search_web.invoke(f"{state['topic']} {section_name}"),
        "academic": search_academic.invoke(f"{state['topic']} {section_name}"),
    }
    
    # 更新研究结果
    new_results = state["research_results"].copy()
    new_results[section_name] = research_data
    
    return {
        "research_results": new_results,
        "status": "planner"  # 返回规划器决定下一步
    }

def writer_node(state: ResearchState) -> ResearchState:
    """撰写节点：生成报告正文"""
    
    outline = state["outline"]
    research_results = state["research_results"]
    
    sections_content = []
    for section in outline["sections"]:
        section_name = section["name"]
        research_data = research_results.get(section_name, {})
        section_content = write_section.invoke({
            "section_name": section_name,
            "section_desc": section["description"],
            "research_data": research_data
        })
        sections_content.append(section_content)
    
    draft = f"# {outline['title']}\n\n" + "\n\n".join(sections_content)
    
    return {
        "draft": draft,
        "status": "review"
    }

def review_node(state: ResearchState) -> ResearchState:
    """审核节点：等待人工审核或自动通过"""
    
    # 模拟自动审核：检查报告长度和质量
    draft = state["draft"]
    word_count = len(draft)
    
    if word_count < 500:
        # 报告太短，需要补充
        return {
            "feedback": "报告内容不足，需要补充更多内容",
            "status": "revising"
        }
    else:
        # 报告基本合格，输出最终版本
        return {
            "final_report": draft,
            "status": "completed"
        }

def revise_node(state: ResearchState) -> ResearchState:
    """修改节点：根据反馈修改报告"""
    
    revision_count = state.get("revision_count", 0) + 1
    
    # 简单模拟：基于反馈决定是否继续修改
    if revision_count > 3:
        # 最多修改3次
        return {
            "final_report": state["draft"],
            "revision_count": revision_count,
            "status": "completed"
        }
    
    return {
        "revision_count": revision_count,
        "status": "writing_draft"  # 重新撰写
    }

# ============================================
# 第三部分：构建图结构
# ============================================

def build_research_graph():
    """构建研究报告Agent的LangGraph"""
    
    # 创建图
    graph = StateGraph(ResearchState)
    
    # 添加节点
    graph.add_node("init", init_research)
    graph.add_node("planner", planner_node)
    graph.add_node("researcher", research_node)
    graph.add_node("writer", writer_node)
    graph.add_node("reviewer", review_node)
    graph.add_node("reviser", revise_node)
    
    # 设置入口点
    graph.set_entry_point("init")
    
    # 普通边
    graph.add_edge("init", "planner")
    graph.add_edge("writer", "reviewer")
    
    # 条件边 - 审核结果决定下一步
    def review_decision(state: ResearchState) -> str:
        if state["status"] == "revising":
            return "revise"
        else:
            return "end"
    
    graph.add_conditional_edges(
        "reviewer",
        review_decision,
        {
            "revise": "reviser",
            "end": END
        }
    )
    
    # 条件边 - 规划结果决定下一步
    def planning_decision(state: ResearchState) -> str:
        if state["status"] == "researching":
            return "researcher"
        elif state["status"] == "writing_draft":
            return "writer"
        else:
            return "planner"
    
    graph.add_conditional_edges(
        "planner",
        planning_decision,
        {
            "researcher": "researcher",
            "writer": "writer",
            "planner": "planner"
        }
    )
    
    # 修改后回到规划
    graph.add_edge("reviser", "planner")
    
    # 编译
    checkpointer = MemorySaver()  # 支持对话历史
    return graph.compile(checkpointer=checkpointer)

# ============================================
# 第四部分：运行Agent
# ============================================

def run_research(topic: str, thread_id: str = "default"):
    """运行研究报告Agent"""
    
    app = build_research_graph()
    
    # 初始状态
    initial_state = {
        "messages": [HumanMessage(content=f"帮我写一份关于{topic}的研究报告")],
        "topic": topic,
        "status": "init",
        "revision_count": 0
    }
    
    # 配置（用于对话历史）
    config = {"configurable": {"thread_id": thread_id}}
    
    # 运行
    result = app.invoke(initial_state, config=config)
    
    return result

# 使用示例
if __name__ == "__main__":
    result = run_research("2026年AI Agent发展趋势", thread_id="research_001")
    
    print("=" * 50)
    print("研究报告生成完成！")
    print("=" * 50)
    print(f"\n最终报告：\n{result.get('final_report', result.get('draft', 'N/A'))}")
```

### 人在回路（Human-in-the-loop）

这是LangGraph最强大的特性之一——**让人类参与Agent的执行过程**。

想象这些场景：
- Agent要发邮件？需要你确认
- Agent要转账？必须你审批
- Agent不确定答案？让你选择

```python
"""
LangGraph实战：带人工审批的邮件发送Agent
演示如何在Agent执行过程中插入人工审批节点
"""

from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END, add_messages
from langgraph.types import interrupt

class EmailState(TypedDict):
    messages: Annotated[list, add_messages]
    draft_email: dict       # 邮件草稿
    needs_approval: bool   # 是否需要审批
    approved: bool         # 是否已审批
    final_email: dict      # 最终邮件
    sent: bool             # 是否已发送

def compose_email_node(state: EmailState) -> EmailState:
    """撰写邮件节点"""
    
    user_request = state["messages"][-1].content
    
    # 模拟LLM撰写邮件
    draft = {
        "to": "recipient@example.com",
        "subject": "关于项目进展的汇报",
        "body": f"根据您的要求，我已完成{user_request}的分析...",
        "attachments": []
    }
    
    return {
        "draft_email": draft,
        "needs_approval": True  # 标记需要审批
    }

def approval_node(state: EmailState) -> EmailState:
    """
    审批节点 - 这是关键！
    interrupt()会暂停执行，等待用户确认
    """
    
    draft = state["draft_email"]
    
    # 打印待审批内容
    print("\n" + "=" * 50)
    print("📧 邮件待审批：")
    print(f"收件人：{draft['to']}")
    print(f"主题：{draft['subject']}")
    print(f"内容：{draft['body'][:100]}...")
    print("=" * 50)
    
    # 💡 这里是关键：interrupt会暂停执行
    # 用户需要在外部通过app.update_state()来确认或修改
    interrupt({
        "type": "human_approval",
        "email": draft,
        "instruction": "请确认发送此邮件，或输入修改意见"
    })
    
    # 这行代码不会执行到这里，因为interrupt会暂停
    return {}

def send_email_node(state: EmailState) -> EmailState:
    """发送邮件节点"""
    
    # 这里接收经过审批的邮件内容
    email_to_send = state.get("final_email", state["draft_email"])
    
    # 实际发送邮件
    # send_real_email(email_to_send)
    
    return {
        "sent": True,
        "messages": state["messages"] + [
            AIMessage(content=f"✅ 邮件已发送至 {email_to_send['to']}")
        ]
    }

def build_email_graph():
    """构建邮件发送流程图"""
    
    graph = StateGraph(EmailState)
    
    graph.add_node("compose", compose_email_node)
    graph.add_node("approval", approval_node)
    graph.add_node("send", send_email_node)
    
    graph.set_entry_point("compose")
    graph.add_edge("compose", "approval")
    
    # 审批后决定是发送还是重新编辑
    def after_approval(state: EmailState) -> str:
        if state.get("approved", False):
            return "send"
        else:
            return "compose"  # 重新编辑
    
    graph.add_conditional_edges(
        "approval",
        after_approval,
        {"send": "send", "compose": "compose"}
    )
    
    graph.add_edge("send", END)
    
    return graph.compile()

# 使用示例
if __name__ == "__main__":
    app = build_email_graph()
    
    # 启动流程
    initial_state = {
        "messages": [HumanMessage(content="帮我发一封邮件给张总，汇报项目进度")]
    }
    
    # 第一阶段：生成邮件草稿并中断
    result = app.invoke(initial_state)
    
    print("\n⏸️ Agent执行已暂停，等待人工审批...")
    print("请通过以下方式审批：")
    print("  app.update_state(config, {'approved': True})  # 批准")
    print("  app.update_state(config, {'approved': False, 'final_email': {...}})  # 修改")
```

### LangGraph vs 硬编码Agent

| 维度 | 硬编码Agent | LangGraph |
|------|------------|-----------|
| **代码组织** | 逻辑全挤在一起 | 节点、边分离，清晰可读 |
| **测试** | 难以单独测试某个逻辑 | 可以单独测试每个节点 |
| **扩展性** | 加功能改一堆代码 | 只需加节点和边 |
| **人工介入** | 需要手动判断暂停点 | 原生支持interrupt |
| **状态管理** | 用全局变量或类属性 | 自动状态传递 |
| **可视化** | 没有 | 可导出为Mermaid图 |
| **调试** | print大法 | 支持LangSmith追踪 |

**什么时候用LangGraph：**
- 需要多步骤、复杂流程的Agent
- 需要人工审批/介入的场景
- 需要清晰展示决策流程的场景
- 多Agent协作

**什么时候可以不用LangGraph：**
- 简单的单轮问答
- 固定流程的工具调用
- 快速原型验证

> 💡 **实战建议**：如果你的Agent逻辑超过3个if-else，或者需要循环/分支/人工介入，**直接上LangGraph**，别犹豫。

---

## 9.5 用LangChain搭完整RAG应用（生产级）

终于到了实战环节！这一节我们手把手用LangChain搭建一个**能上生产的**RAG应用。

我见过太多"玩具级"RAG——能跑就跑，一上生产就各种问题：上下文不够长、检索不准、生成质量差、性能拉胯……

这次我给你一个**生产级实现**，包含：
- 错误处理和重试
- 缓存机制
- 检索质量评估
- 流式响应
- 国产模型支持

### RAG回顾

在第6章我们学过，RAG的核心流程是：

```
索引阶段（离线）：文档 → 加载 → 切块 → 向量化 → 存储
查询阶段（在线）：问题 → 检索 → 组装Prompt → 生成 → 回答
```

现在我们用LangChain把整个流程实现出来。

### 项目结构

```
rag-project/
├── requirements.txt
├── .env
├── config/
│   └── settings.py          # 配置管理
├── data/
│   └── documents/          # 放你的PDF/TXT文档
├── src/
│   ├── __init__.py
│   ├── loader.py           # 文档加载
│   ├── splitter.py         # 文档切分
│   ├── vectorstore.py      # 向量存储
│   ├── retriever.py        # 检索器
│   ├── generator.py        # 生成器
│   └── rag_chain.py        # RAG链
└── main.py                  # 主程序
```

### 依赖安装

```txt
# requirements.txt
langchain>=1.0.0
langchain-openai>=0.2.0
langchain-community>=0.2.0
langchain-text-splitters>=0.3.0
langchain-chroma>=0.1.0
pypdf>=4.0.0
python-dotenv>=1.0.0
faiss-cpu>=1.8.0
tenacity>=8.0.0  # 重试库
diskcache>=5.0.0  # 磁盘缓存
```

### 配置管理

```python
# config/settings.py
import os
from dataclasses import dataclass
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

@dataclass
class Settings:
    """RAG系统配置"""
    
    # 模型配置
    llm_provider: str = os.getenv("LLM_PROVIDER", "openai")
    llm_model: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    llm_temperature: float = 0.3
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    
    # API配置
    openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY")
    dashscope_api_key: Optional[str] = os.getenv("DASHSCOPE_API_KEY")  # 通义
    ernie_api_key: Optional[str] = os.getenv("ERNIE_API_KEY")  # 文心
    
    # 向量库配置
    vectorstore_type: str = os.getenv("VECTORSTORE_TYPE", "chroma")  # chroma/faiss
    persist_directory: str = "./data/chroma_db"
    
    # 检索配置
    retrieval_k: int = 5  # 召回数量
    retrieval_score_threshold: float = 0.5  # 相似度阈值
    
    # 文档处理配置
    chunk_size: int = 500
    chunk_overlap: int = 50
    
    # 缓存配置
    enable_cache: bool = True
    cache_dir: str = "./data/cache"
    cache_ttl: int = 3600  # 缓存时间（秒）
    
    # 重试配置
    max_retries: int = 3
    retry_delay: float = 1.0
    
    # Rerank配置
    enable_rerank: bool = True  # 是否启用Rerank
    rerank_top_n: int = 3  # Rerank后保留数量

settings = Settings()
```

### 文档加载器

```python
# src/loader.py
from typing import List
from langchain_community.document_loaders import (
    PyPDFLoader, 
    TextLoader,
    Docx2txtLoader,
    UnstructuredHTMLLoader
)
from langchain_core.documents import Document
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class DocumentLoader:
    """统一的文档加载器，支持多种格式"""
    
    SUPPORTED_FORMATS = {
        ".pdf": PyPDFLoader,
        ".txt": TextLoader,
        ".docx": Docx2txtLoader,
        ".html": UnstructuredHTMLLoader,
    }
    
    def __init__(self, encoding: str = "utf-8"):
        self.encoding = encoding
    
    def load(self, file_path: str) -> List[Document]:
        """
        加载单个文档
        
        Args:
            file_path: 文件路径
            
        Returns:
            文档列表（PDF可能有多个页面）
        """
        path = Path(file_path)
        suffix = path.suffix.lower()
        
        if suffix not in self.SUPPORTED_FORMATS:
            logger.warning(f"不支持的文件格式: {suffix}")
            return []
        
        loader_class = self.SUPPORTED_FORMATS[suffix]
        
        try:
            # 对于文本类文件，指定编码
            if suffix in [".txt", ".html"]:
                loader = loader_class(file_path, encoding=self.encoding)
            else:
                loader = loader_class(file_path)
            
            documents = loader.load()
            logger.info(f"成功加载 {file_path}，共 {len(documents)} 个文档块")
            
            # 添加元数据
            for doc in documents:
                doc.metadata["source_file"] = str(path)
                doc.metadata["file_type"] = suffix
            
            return documents
            
        except Exception as e:
            logger.error(f"加载文档失败 {file_path}: {e}")
            return []
    
    def load_directory(self, directory: str) -> List[Document]:
        """加载目录下所有支持的文档"""
        all_documents = []
        dir_path = Path(directory)
        
        for file_path in dir_path.rglob("*"):
            if file_path.is_file() and file_path.suffix.lower() in self.SUPPORTED_FORMATS:
                docs = self.load(str(file_path))
                all_documents.extend(docs)
        
        logger.info(f"目录 {directory} 共加载 {len(all_documents)} 个文档块")
        return all_documents
```

### 文档切分器

```python
# src/splitter.py
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from typing import List
import logging

logger = logging.getLogger(__name__)

class SmartTextSplitter:
    """
    智能文档切分器
    - 支持句子边界保持
    - 保留章节信息
    - 元数据传递
    """
    
    def __init__(
        self,
        chunk_size: int = 500,
        chunk_overlap: int = 50,
        separators: List[str] = None
    ):
        # 默认分隔符（按优先级）
        self.separators = separators or [
            "\n\n",  # 段落
            "\n",    # 换行
            "。",    # 中文句号
            "！",
            "？",
            "，",
            "、",
            " ",
            ""
        ]
        
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def split(self, documents: List[Document]) -> List[Document]:
        """
        切分文档
        
        Args:
            documents: 原始文档列表
            
        Returns:
            切分后的文档块
        """
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            separators=self.separators,
            length_function=len,
            is_separator_regex=False,
        )
        
        chunks = text_splitter.split_documents(documents)
        
        # 为每个chunk添加序号
        for i, chunk in enumerate(chunks):
            chunk.metadata["chunk_index"] = i
            chunk.metadata["total_chunks"] = len(chunks)
        
        logger.info(f"文档切分完成：{len(documents)} 个文档 → {len(chunks)} 个块")
        
        return chunks
    
    def split_with_metadata_filter(
        self,
        documents: List[Document],
        min_chunk_size: int = 100,
        max_chunk_size: int = 1000
    ) -> List[Document]:
        """切分并过滤异常大小的块"""
        chunks = self.split(documents)
        
        filtered_chunks = []
        for chunk in chunks:
            content_len = len(chunk.page_content)
            
            # 跳过太小的块（可能是噪声）
            if content_len < min_chunk_size:
                logger.debug(f"跳过过小块: {content_len}字符")
                continue
            
            # 标记过大块
            if content_len > max_chunk_size:
                chunk.metadata["oversized"] = True
            
            filtered_chunks.append(chunk)
        
        logger.info(f"过滤后保留 {len(filtered_chunks)} 个块")
        return filtered_chunks
```

### 向量存储

```python
# src/vectorstore.py
from typing import List, Optional, Any
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma, FAISS
from langchain_core.documents import Document
from langchain_community.embeddings import DashScopeEmbeddings, ErnieEmbeddings
from config.settings import settings
import logging
import hashlib

logger = logging.getLogger(__name__)

class VectorStoreManager:
    """向量存储管理器"""
    
    def __init__(self):
        self.embeddings = self._create_embeddings()
        self.vectorstore: Optional[Chroma | FAISS] = None
    
    def _create_embeddings(self):
        """根据配置创建嵌入模型"""
        provider = settings.llm_provider.lower()
        
        if provider == "dashscope" or provider == "qwen":
            # 阿里通义
            return DashScopeEmbeddings(
                model="text-embedding-v2",
                dashscope_api_key=settings.dashscope_api_key
            )
        elif provider == "ernie" or provider == "baidu":
            # 百度文心
            return ErnieEmbeddings(
                ernie_api_key=settings.ernie_api_key,
                ernie_secret_key=settings.ernie_api_key  # 实际需要单独配置
            )
        else:
            # OpenAI或其他
            return OpenAIEmbeddings(
                model=settings.embedding_model,
                api_key=settings.openai_api_key
            )
    
    def create_vectorstore(
        self,
        documents: List[Document],
        persist_directory: Optional[str] = None
    ) -> Any:
        """创建向量存储"""
        
        persist_dir = persist_directory or settings.persist_directory
        
        if settings.vectorstore_type == "chroma":
            self.vectorstore = Chroma.from_documents(
                documents=documents,
                embedding=self.embeddings,
                persist_directory=persist_dir
            )
            logger.info(f"Chroma向量库创建完成: {persist_dir}")
        else:
            self.vectorstore = FAISS.from_documents(
                documents=documents,
                embedding=self.embeddings
            )
            # 保存到磁盘
            self.vectorstore.save_local(persist_dir)
            logger.info(f"FAISS向量库创建并保存完成: {persist_dir}")
        
        return self.vectorstore
    
    def load_vectorstore(self, persist_directory: Optional[str] = None) -> Any:
        """加载已有的向量存储"""
        
        persist_dir = persist_directory or settings.persist_directory
        
        if settings.vectorstore_type == "chroma":
            self.vectorstore = Chroma(
                persist_directory=persist_dir,
                embedding_function=self.embeddings
            )
        else:
            self.vectorstore = FAISS.load_local(
                persist_dir,
                self.embeddings,
                allow_dangerous_deserialization=True
            )
        
        logger.info(f"向量库加载完成: {persist_dir}")
        return self.vectorstore
    
    def save(self):
        """保存向量库"""
        if self.vectorstore:
            if settings.vectorstore_type == "chroma":
                self.vectorstore.persist()
            else:
                self.vectorstore.save_local(settings.persist_directory)
            logger.info("向量库已保存")
```

### 检索器

```python
# src/retriever.py
from typing import List, Dict, Any
from langchain_core.documents import Document
from langchain_core.runnables import RunnableLambda
from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import (
    DocumentCompressorPipeline,
    EmbeddingsFilter
)
from langchain_community.document_compressors import CohereRerank
from config.settings import settings
import logging
import hashlib

logger = logging.getLogger(__name__)

class RetrievalQualityAnalyzer:
    """检索质量分析器"""
    
    def __init__(self):
        self.analytics = []
    
    def analyze(
        self,
        query: str,
        retrieved_docs: List[Document]
    ) -> Dict[str, Any]:
        """
        分析检索结果质量
        
        Returns:
            包含质量指标和建议的字典
        """
        if not retrieved_docs:
            return {
                "quality_score": 0,
                "issue": "没有检索到任何文档",
                "suggestion": "尝试扩大检索范围或优化文档库"
            }
        
        # 计算平均相似度
        scores = [doc.metadata.get("relevance_score", 0) for doc in retrieved_docs]
        avg_score = sum(scores) / len(scores) if scores else 0
        
        # 计算覆盖度（检索结果的多样性）
        sources = set(doc.metadata.get("source_file", "") for doc in retrieved_docs)
        coverage = len(sources) / len(retrieved_docs) if retrieved_docs else 0
        
        # 综合评分
        quality_score = (avg_score * 0.6) + (coverage * 0.4)
        
        result = {
            "quality_score": quality_score,
            "avg_similarity": avg_score,
            "unique_sources": len(sources),
            "total_retrieved": len(retrieved_docs),
            "issue": None,
            "suggestion": None
        }
        
        # 问题诊断
        if quality_score < 0.3:
            result["issue"] = "检索质量较低"
            result["suggestion"] = "建议优化查询或调整embedding模型"
        elif coverage < 0.5:
            result["issue"] = "检索结果重复度较高"
            result["suggestion"] = "建议启用去重或Rerank"
        
        return result
    
    def log(self, query: str, analysis: Dict):
        """记录检索分析结果"""
        self.analytics.append({
            "query": query,
            "timestamp": "now",
            **analysis
        })


class AdvancedRetriever:
    """高级检索器，支持多种检索策略"""
    
    def __init__(self, vectorstore):
        self.vectorstore = vectorstore
        self.quality_analyzer = RetrievalQualityAnalyzer()
    
    def as_retriever(self, strategy: str = "basic"):
        """
        获取检索器
        
        Args:
            strategy: 检索策略
                - basic: 基础相似度检索
                - mmr: 最大边际相关性（增加多样性）
                - compressed: 压缩后检索
                - rerank: Rerank重排序
        """
        
        if strategy == "mmr":
            # MMR策略：平衡相关性和多样性
            return self.vectorstore.as_retriever(
                search_type="mmr",
                search_kwargs={
                    "k": settings.retrieval_k,
                    "fetch_k": settings.retrieval_k * 3,  # 扩展召回
                    "lambda_mult": 0.7  # 0=最大多样性，1=最大相关
                }
            )
        
        elif strategy == "compressed":
            # 压缩检索：减少上下文长度
            compressor = DocumentCompressorPipeline(
                transformers=[
                    EmbeddingsFilter(
                        embeddings=self.vectorstore.embedding_function,
                        similarity_threshold=0.5
                    )
                ]
            )
            return ContextualCompressionRetriever(
                base_compressor=compressor,
                base_retriever=self.vectorstore.as_retriever(
                    search_kwargs={"k": settings.retrieval_k * 2}
                )
            )
        
        elif strategy == "rerank" and settings.enable_rerank:
            # Rerank重排序
            try:
                compressor = CohereRerank(top_n=settings.rerank_top_n)
                return ContextualCompressionRetriever(
                    base_compressor=compressor,
                    base_retriever=self.vectorstore.as_retriever(
                        search_kwargs={"k": settings.retrieval_k * 3}
                    )
                )
            except Exception as e:
                logger.warning(f"CohereRerank初始化失败: {e}，降级为普通检索")
        
        # 基础检索
        return self.vectorstore.as_retriever(
            search_kwargs={"k": settings.retrieval_k}
        )
    
    def retrieve_with_analysis(
        self,
        query: str,
        strategy: str = "basic"
    ) -> tuple[List[Document], Dict[str, Any]]:
        """检索并分析质量"""
        retriever = self.as_retriever(strategy)
        docs = retriever.invoke(query)
        
        analysis = self.quality_analyzer.analyze(query, docs)
        self.quality_analyzer.log(query, analysis)
        
        return docs, analysis
```

### RAG链

```python
# src/rag_chain.py
from typing import Optional, Iterator
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import ChatOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential
import logging
from config.settings import settings

logger = logging.getLogger(__name__)

class RAGChainBuilder:
    """RAG链构建器"""
    
    def __init__(self, retriever, llm=None):
        self.retriever = retriever
        self.llm = llm or self._create_llm()
    
    def _create_llm(self):
        """根据配置创建LLM"""
        provider = settings.llm_provider.lower()
        
        if provider == "dashscope" or provider == "qwen":
            from langchain_openai import ChatOpenAI
            return ChatOpenAI(
                model=settings.llm_model,
                api_key=settings.dashscope_api_key,
                base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
                temperature=settings.llm_temperature
            )
        elif provider == "ernie" or provider == "baidu":
            from langchain_community.chat_models import ErnieBotChat
            return ErnieBotChat(
                model_name=settings.llm_model,
                erine_api_key=settings.ernie_api_key,
                erine_secret_key=settings.ernie_api_key
            )
        else:
            from langchain_openai import ChatOpenAI
            return ChatOpenAI(
                model=settings.llm_model,
                temperature=settings.llm_temperature
            )
    
    def build_basic_chain(self) -> any:
        """构建基础RAG链"""
        
        # 格式化检索结果
        def format_docs(docs) -> str:
            if not docs:
                return "没有找到相关的参考信息。"
            
            formatted = []
            for i, doc in enumerate(docs, 1):
                source = doc.metadata.get("source_file", "未知来源")
                page = doc.metadata.get("page", "N/A")
                content = doc.page_content
                
                formatted.append(
                    f"[{i}] 来源: {source} (页码: {page})\n"
                    f"内容: {content}"
                )
            
            return "\n\n".join(formatted)
        
        # Prompt模板
        template = """你是一个专业的知识库问答助手。请基于以下参考信息回答用户的问题。

参考信息：
{context}

用户问题：{question}

回答要求：
1. 如果参考信息中有相关内容，必须基于参考信息回答
2. 如果参考信息中没有相关内容，请如实说明，不要编造
3. 回答要准确、简洁、有条理
4. 如果需要，可以引用参考信息中的具体内容

回答："""
        
        prompt = ChatPromptTemplate.from_template(template)
        parser = StrOutputParser()
        
        # 构建链
        chain = (
            {
                "context": self.retriever | format_docs,
                "question": RunnablePassthrough()
            }
            | prompt
            | self.llm
            | parser
        )
        
        return chain
    
    def build_with_citation_chain(self) -> any:
        """构建带引用标注的RAG链"""
        
        def format_docs_with_citation(docs) -> str:
            if not docs:
                return "没有找到相关的参考信息。"
            
            formatted = []
            for i, doc in enumerate(docs, 1):
                source = doc.metadata.get("source_file", "未知")
                page = doc.metadata.get("page", "N/A")
                content = doc.page_content
                
                formatted.append(
                    f"[{i}] ({source} 第{page}页)\n{content}"
                )
            
            return "\n\n---\n\n".join(formatted)
        
        template = """你是一个专业的知识库问答助手。请基于以下参考信息回答用户的问题。

【重要】你必须在回答中标注参考来源，使用 [数字] 的格式标注引用的序号。

参考信息：
{context}

用户问题：{question}

回答格式：
1. 先给出直接回答
2. 然后在末尾标注参考来源，格式如：[1][2]

回答："""
        
        prompt = ChatPromptTemplate.from_template(template)
        parser = StrOutputParser()
        
        chain = (
            {
                "context": self.retriever | format_docs_with_citation,
                "question": RunnablePassthrough()
            }
            | prompt
            | self.llm
            | parser
        )
        
        return chain
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10)
    )
    def invoke_with_retry(self, chain: any, query: str) -> str:
        """带重试的链调用"""
        return chain.invoke(query)
    
    def stream_response(self, chain: any, query: str) -> Iterator[str]:
        """流式响应"""
        for chunk in chain.stream({"question": query}):
            yield chunk
```

### 主程序

```python
# main.py
"""
RAG系统主程序
支持：
- 向量库初始化和更新
- 命令行问答
- Web API
"""

import sys
import argparse
from pathlib import Path
from config.settings import settings
from src.loader import DocumentLoader
from src.splitter import SmartTextSplitter
from src.vectorstore import VectorStoreManager
from src.retriever import AdvancedRetriever
from src.rag_chain import RAGChainBuilder
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


def init_vectorstore(data_dir: str = "./data/documents"):
    """初始化向量库"""
    
    logger.info("开始初始化向量库...")
    
    # 1. 加载文档
    loader = DocumentLoader()
    documents = loader.load_directory(data_dir)
    
    if not documents:
        logger.error(f"没有找到文档，请将文档放入 {data_dir} 目录")
        return None
    
    # 2. 切分文档
    splitter = SmartTextSplitter(
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap
    )
    chunks = splitter.split_with_metadata_filter(
        documents,
        min_chunk_size=100,
        max_chunk_size=1000
    )
    
    # 3. 创建向量库
    vectorstore_manager = VectorStoreManager()
    vectorstore_manager.create_vectorstore(chunks)
    
    logger.info("向量库初始化完成！")
    return vectorstore_manager


def chat_mode():
    """命令行问答模式"""
    
    # 加载或创建向量库
    data_dir = "./data/documents"
    persist_dir = settings.persist_directory
    
    vectorstore_manager = VectorStoreManager()
    
    if Path(persist_dir).exists():
        logger.info("加载已有向量库...")
        vectorstore = vectorstore_manager.load_vectorstore()
    else:
        vectorstore = init_vectorstore(data_dir)
        if not vectorstore:
            return
    
    # 创建检索器
    retriever = AdvancedRetriever(vectorstore.vectorstore)
    retriever_instance = retriever.as_retriever(strategy="mmr")
    
    # 构建RAG链
    rag_builder = RAGChainBuilder(retriever_instance)
    chain = rag_builder.build_with_citation_chain()
    
    # 对话循环
    print("\n" + "=" * 50)
    print("📚 知识库问答系统已启动！")
    print("输入问题，或输入'quit'退出")
    print("输入'rebuild'重新构建向量库")
    print("=" * 50 + "\n")
    
    while True:
        try:
            query = input("问题: ").strip()
            
            if query.lower() == "quit":
                print("再见！")
                break
            
            if query.lower() == "rebuild":
                print("正在重新构建向量库...")
                vectorstore_manager = VectorStoreManager()
                vectorstore = init_vectorstore(data_dir)
                if vectorstore:
                    retriever = AdvancedRetriever(vectorstore.vectorstore)
                    retriever_instance = retriever.as_retriever(strategy="mmr")
                    rag_builder = RAGChainBuilder(retriever_instance)
                    chain = rag_builder.build_with_citation_chain()
                continue
            
            if not query:
                continue
            
            print("\n🔍 正在检索和生成答案...\n")
            
            # 带重试的调用
            try:
                answer = rag_builder.invoke_with_retry(chain, query)
                print(f"回答:\n{answer}\n")
                
                # 分析检索质量
                docs, analysis = retriever.retrieve_with_analysis(query)
                if analysis["issue"]:
                    print(f"⚠️ 检索质量提示: {analysis['issue']}")
                    print(f"💡 建议: {analysis['suggestion']}\n")
                    
            except Exception as e:
                logger.error(f"生成答案时出错: {e}")
                print("生成答案时出错，请稍后重试。\n")
                
        except KeyboardInterrupt:
            print("\n再见！")
            break


def main():
    parser = argparse.ArgumentParser(description="RAG知识库问答系统")
    parser.add_argument("--init", action="store_true", help="初始化向量库")
    parser.add_argument("--data-dir", default="./data/documents", help="文档目录")
    
    args = parser.parse_args()
    
    if args.init:
        init_vectorstore(args.data_dir)
    else:
        chat_mode()


if __name__ == "__main__":
    main()
```

### 运行效果

```bash
# 初始化向量库
$ python main.py --init

# 启动问答
$ python main.py

# 或者一条命令搞定
$ python main.py --init --data-dir ./data/documents

==================================================
📚 知识库问答系统已启动！
输入问题，或输入'quit'退出
输入'rebuild'重新构建向量库
==================================================

问题: 产品的退换货政策是什么？
🔍 正在检索和生成答案...

回答:
根据我们的退换货政策[1][2]：

1. **退货政策**
   - 自收到商品之日起7天内可申请退货
   - 商品需保持原包装完整
   - 退货地址：北京市朝阳区xxx

2. **换货政策**
   - 自收到商品之日起15天内可申请换货
   - 换货仅支持同款商品更换尺码/颜色

3. **特殊说明**
   - 定制商品不支持退换
   - 特价商品退换需额外说明

⚠️ 检索质量提示: 检索结果重复度较高
💡 建议: 建议启用去重或Rerank
```

> 💡 **实战经验**：生产级RAG的关键不是代码多复杂，而是**细节**：
> - 文档预处理决定了检索质量上限
> - 缓存机制可以大幅提升响应速度
> - 检索质量分析能帮你持续优化
> - 重试机制保证系统稳定性

---

## 9.6 用LangChain搭多工具Agent（深度版）

上一节的RAG只能回答问题，不能帮你"做事"。这一节我们升级一下——构建一个**生产级的多工具Agent**。

这次的重点：
1. **工具选择策略**：如何让Agent更智能地选择工具
2. **并发工具调用**：多个工具同时执行
3. **工具失败处理**：优雅地处理工具错误
4. **国产模型支持**：基于通义千问/文心一言的完整实现

### 场景设定

我们构建一个"智能助手"，它可以：
1. 查天气
2. 搜索新闻
3. 发送邮件
4. 创建日程提醒
5. 执行计算

### 完整代码

```python
"""
LangChain多工具Agent实战（生产级）
特点：
- 完善的错误处理和重试
- 并发工具调用
- 工具选择策略
- 对话历史管理
- 国产模型支持
"""

import os
from datetime import datetime, timedelta
from typing import Literal, Optional, Any
from dataclasses import dataclass, field
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_community.chat_models import ErnieBotChat  # 需要 pip install langchain-community
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool, Tool
from langgraph.prebuilt import create_react_agent
from langgraph.graph import StateGraph, END, add_messages
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import Command
from tenacity import retry, stop_after_attempt, wait_exponential
import asyncio
import logging

load_dotenv()

logger = logging.getLogger(__name__)

# ============================================
# 第一部分：Tool定义（带完整的错误处理）
# ============================================

class ToolExecutionError(Exception):
    """工具执行错误"""
    def __init__(self, tool_name: str, message: str, is_retryable: bool = True):
        self.tool_name = tool_name
        self.message = message
        self.is_retryable = is_retryable
        super().__init__(f"[{tool_name}] {message}")


@tool
def get_weather(city: str) -> str:
    """获取指定城市的天气预报。
    
    Args:
        city: 城市名称，如"北京"、"上海"、"深圳"
    
    Returns:
        天气情况描述，包含温度、湿度、风力等信息
    
    Raises:
        ValueError: 城市名无效或不在支持列表中
        ToolExecutionError: 服务暂时不可用
    """
    # 支持的城市数据库
    weather_db = {
        "北京": {"weather": "晴天", "temp_high": 25, "temp_low": 15, "humidity": 45, "wind": "2-3级东南风"},
        "上海": {"weather": "多云", "temp_high": 26, "temp_low": 18, "humidity": 60, "wind": "3-4级东南风"},
        "深圳": {"weather": "雷阵雨", "temp_high": 30, "temp_low": 24, "humidity": 85, "wind": "4-5级西南风"},
        "杭州": {"weather": "阴天", "temp_high": 24, "temp_low": 16, "humidity": 70, "wind": "2级东北风"},
        "广州": {"weather": "晴", "temp_high": 32, "temp_low": 23, "humidity": 55, "wind": "2-3级南风"},
        "成都": {"weather": "小雨", "temp_high": 20, "temp_low": 15, "humidity": 80, "wind": "1-2级北风"},
    }
    
    # 城市名标准化
    city = city.strip().title()
    
    if city not in weather_db:
        available = ", ".join(weather_db.keys())
        raise ValueError(
            f"不支持的城市'{city}'。目前支持的城市：{available}"
        )
    
    data = weather_db[city]
    today = datetime.now().strftime("%Y年%m月%d日")
    
    return (
        f"📍 {city} {today}天气预报\n"
        f"天气：{data['weather']}\n"
        f"温度：{data['temp_low']}°C ~ {data['temp_high']}°C\n"
        f"湿度：{data['humidity']}%\n"
        f"风力：{data['wind']}\n"
        f"（数据仅供参考）"
    )


@tool
def search_news(keyword: str, limit: int = 5) -> str:
    """搜索最新的新闻资讯。
    
    Args:
        keyword: 搜索关键词，如"AI"、"科技"、"经济"
        limit: 返回结果数量，默认5条，最多10条
    
    Returns:
        新闻列表，每条包含标题、时间、摘要
    
    Raises:
        ValueError: 关键词为空或limit超出范围
        ToolExecutionError: 搜索服务不可用
    """
    # 参数校验
    if not keyword or not keyword.strip():
        raise ValueError("搜索关键词不能为空")
    
    limit = min(max(1, limit), 10)  # 限制在1-10之间
    keyword = keyword.strip()
    
    # 模拟新闻数据库
    news_db = {
        "AI": [
            {"title": "OpenAI发布GPT-5，性能提升3倍", "time": "2026-01-15", "summary": "新版GPT-5在多项测试中刷新SOTA..."},
            {"title": "Anthropic推出Claude 3.5新版", "time": "2026-01-14", "summary": "新增多模态能力和更长的上下文窗口..."},
            {"title": "谷歌发布Gemini 2.0 Ultra", "time": "2026-01-13", "summary": "支持100M上下文，数学能力大幅提升..."},
            {"title": "百度文心大模型日调用量破10亿", "time": "2026-01-12", "summary": "创下国内AI应用调用量新纪录..."},
            {"title": "阿里通义千问开源Qwen3系列", "time": "2026-01-11", "summary": "参数量从7B到72B全面开源..."},
        ],
        "科技": [
            {"title": "苹果发布iPhone 17系列", "time": "2026-01-15", "summary": "搭载自研AI芯片，支持卫星通话..."},
            {"title": "特斯拉全自动驾驶进展顺利", "time": "2026-01-14", "summary": "FSD V13版本在北京开始试点..."},
            {"title": "SpaceX星舰完成第50次发射", "time": "2026-01-13", "summary": "成功回收助推器，商业化加速..."},
        ],
        "经济": [
            {"title": "央行降准0.5个百分点", "time": "2026-01-15", "summary": "释放长期资金约1万亿元..."},
            {"title": "A股三大指数集体上涨", "time": "2026-01-14", "summary": "沪指重回3500点，AI板块领涨..."},
        ]
    }
    
    # 搜索逻辑：精确匹配 + 模糊匹配
    results = news_db.get(keyword, [])
    
    if not results:
        # 模糊搜索
        for category, news_list in news_db.items():
            if keyword.lower() in category.lower():
                results.extend(news_list)
        
        if not results:
            return f"未找到关于'{keyword}'的新闻。"
    
    # 格式化输出
    output = [f"📰 关于'{keyword}'的最新新闻（共{len(results[:limit])}条）：\n"]
    for i, news in enumerate(results[:limit], 1):
        output.append(
            f"{i}. 【{news['title']}】\n"
            f"   📅 {news['time']}\n"
            f"   📝 {news['summary']}\n"
        )
    
    return "\n".join(output)


@tool
def send_email(to: str, subject: str, body: str) -> dict:
    """发送电子邮件。
    
    Args:
        to: 收件人邮箱地址
        subject: 邮件主题，不超过100字
        body: 邮件正文内容
    
    Returns:
        包含发送结果的字典
            - success: 是否发送成功
            - message_id: 邮件ID
            - timestamp: 发送时间
    
    Raises:
        ValueError: 邮箱格式错误或内容为空
        ToolExecutionError: 邮件服务不可用
    """
    # 参数校验
    if not to or "@" not in to:
        raise ValueError(f"无效的收件人邮箱: {to}")
    
    if not subject or len(subject.strip()) == 0:
        raise ValueError("邮件主题不能为空")
    
    if not body or len(body.strip()) == 0:
        raise ValueError("邮件正文不能为空")
    
    subject = subject.strip()[:100]
    body = body.strip()
    
    # 模拟发送
    import random
    success = random.choice([True, True, True, False])  # 90%成功率
    
    if not success:
        raise ToolExecutionError(
            "send_email",
            "邮件服务暂时不可用，请稍后重试",
            is_retryable=True
        )
    
    return {
        "success": True,
        "message_id": f"msg_{random.randint(100000, 999999)}",
        "to": to,
        "subject": subject,
        "timestamp": datetime.now().isoformat()
    }


@tool
def create_reminder(
    title: str,
    date: str,
    time: str,
    content: str,
    priority: str = "normal"
) -> dict:
    """创建日程提醒。
    
    Args:
        title: 提醒标题，不超过50字
        date: 日期，格式YYYY-MM-DD
        time: 时间，格式HH:MM
        content: 提醒内容详细描述
        priority: 优先级，选项：low / normal / high / urgent
    
    Returns:
        包含创建结果的字典
    
    Raises:
        ValueError: 日期时间格式错误
        ToolExecutionError: 日历服务不可用
    """
    # 日期格式校验
    try:
        reminder_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise ValueError(f"无效的日期格式: {date}，期望: YYYY-MM-DD")
    
    # 时间格式校验
    try:
        reminder_time = datetime.strptime(time, "%H:%M").time()
    except ValueError:
        raise ValueError(f"无效的时间格式: {time}，期望: HH:MM")
    
    # 优先级校验
    valid_priorities = ["low", "normal", "high", "urgent"]
    if priority not in valid_priorities:
        raise ValueError(f"无效的优先级: {priority}，可选: {valid_priorities}")
    
    # 检查日期是否在过去
    today = datetime.now().date()
    if reminder_date < today:
        raise ValueError(f"不能创建过去的提醒: {date}")
    
    # 模拟创建
    reminder_id = f"rem_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    emoji = {
        "low": "📋",
        "normal": "📌",
        "high": "🔔",
        "urgent": "🚨"
    }
    
    return {
        "success": True,
        "reminder_id": reminder_id,
        "title": title[:50],
        "datetime": f"{date} {time}",
        "content": content,
        "priority": priority,
        "emoji": emoji.get(priority, "📌")
    }


@tool
def calculate(expression: str) -> str:
    """执行数学计算。
    
    Args:
        expression: 数学表达式，支持基本运算和函数
            例如: "2+3*5", "10/3", "sqrt(16)", "sin(pi/2)"
    
    Returns:
        计算结果字符串
    
    Raises:
        ValueError: 表达式语法错误
        ToolExecutionError: 计算服务不可用（一般不会）
    """
    import math
    import re
    
    # 安全的表达式验证
    allowed_chars = set("0123456789+-*/()., ")
    if not all(c in allowed_chars or c.isalpha() for c in expression):
        raise ValueError("表达式包含非法字符")
    
    # 替换常用函数
    safe_dict = {
        "pi": math.pi,
        "e": math.e,
        "sin": math.sin,
        "cos": math.cos,
        "tan": math.tan,
        "sqrt": math.sqrt,
        "log": math.log,
        "exp": math.exp,
        "abs": abs,
        "pow": pow,
        "round": round,
    }
    
    try:
        # 使用eval执行，但只允许调用安全函数
        result = eval(expression, {"__builtins__": {}}, safe_dict)
        
        # 格式化结果
        if isinstance(result, float):
            if result.is_integer():
                result = int(result)
            else:
                result = round(result, 10)  # 保留合理精度
        
        return f"{expression} = {result}"
        
    except Exception as e:
        raise ValueError(f"计算错误: {str(e)}")


# ============================================
# 第二部分：工具执行器（带并发和错误处理）
# ============================================

@dataclass
class ToolExecutionResult:
    """工具执行结果"""
    tool_name: str
    success: bool
    result: Any = None
    error: Optional[str] = None
    execution_time: float = 0.0
    retry_count: int = 0


class ParallelToolExecutor:
    """
    并发工具执行器
    支持：
    - 并行执行多个不相关的工具
    - 超时控制
    - 重试机制
    - 结果聚合
    """
    
    def __init__(self, max_concurrent: int = 3, timeout: float = 30.0):
        self.max_concurrent = max_concurrent
        self.timeout = timeout
        self.semaphore = asyncio.Semaphore(max_concurrent)
    
    async def execute_single(
        self,
        tool: Tool,
        tool_input: dict,
        retry_count: int = 0
    ) -> ToolExecutionResult:
        """执行单个工具，带超时和重试"""
        
        start_time = asyncio.get_event_loop().time()
        
        try:
            async with self.semaphore:  # 控制并发数
                result = await asyncio.wait_for(
                    tool.ainvoke(tool_input),
                    timeout=self.timeout
                )
            
            execution_time = asyncio.get_event_loop().time() - start_time
            
            return ToolExecutionResult(
                tool_name=tool.name,
                success=True,
                result=result,
                execution_time=execution_time,
                retry_count=retry_count
            )
            
        except asyncio.TimeoutError:
            return ToolExecutionResult(
                tool_name=tool.name,
                success=False,
                error=f"执行超时（{self.timeout}s）",
                execution_time=self.timeout,
                retry_count=retry_count
            )
            
        except Exception as e:
            error_msg = str(e)
            
            # 判断是否可重试
            is_retryable = (
                "服务暂时不可用" in error_msg or
                "超时" in error_msg or
                "连接" in error_msg.lower()
            )
            
            if is_retryable and retry_count < 2:
                # 指数退避重试
                wait_time = 2 ** retry_count
                await asyncio.sleep(wait_time)
                return await self.execute_single(
                    tool, tool_input, retry_count + 1
                )
            
            return ToolExecutionResult(
                tool_name=tool.name,
                success=False,
                error=error_msg,
                execution_time=asyncio.get_event_loop().time() - start_time,
                retry_count=retry_count
            )
    
    async def execute_parallel(
        self,
        tools_and_inputs: list[tuple[Tool, dict]]
    ) -> list[ToolExecutionResult]:
        """并行执行多个工具"""
        
        tasks = [
            self.execute_single(tool, tool_input)
            for tool, tool_input in tools_and_inputs
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 处理异常情况
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                tool_name = tools_and_inputs[i][0].name
                processed_results.append(
                    ToolExecutionResult(
                        tool_name=tool_name,
                        success=False,
                        error=str(result)
                    )
                )
            else:
                processed_results.append(result)
        
        return processed_results
    
    def sync_execute_parallel(
        self,
        tools_and_inputs: list[tuple[Tool, dict]]
    ) -> list[ToolExecutionResult]:
        """同步版本的并行执行"""
        return asyncio.run(
            self.execute_parallel(tools_and_inputs)
        )


# ============================================
# 第三部分：Agent构建（带国产模型支持）
# ============================================

class MultiToolAgent:
    """
    多工具Agent
    支持：
    - 多种LLM后端（OpenAI、百度、阿里）
    - 对话历史
    - 工具执行
    - 流式输出
    """
    
    def __init__(
        self,
        llm_provider: str = "openai",
        model_name: str = None,
        tools: list[Tool] = None
    ):
        self.llm_provider = llm_provider.lower()
        self.llm = self._create_llm(model_name)
        self.tools = tools or self._default_tools()
        
        # 创建LangGraph Agent
        self.graph = self._build_graph()
        self.checkpointer = MemorySaver()
    
    def _create_llm(self, model_name: str = None):
        """创建LLM实例"""
        
        if self.llm_provider == "qwen" or self.llm_provider == "dashscope":
            # 通义千问
            api_key = os.getenv("DASHSCOPE_API_KEY")
            if not api_key:
                raise ValueError("未设置 DASHSCOPE_API_KEY 环境变量")
            
            return ChatOpenAI(
                model=model_name or "qwen-plus",
                api_key=api_key,
                base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
                temperature=0.7
            )
        
        elif self.llm_provider == "ernie" or self.llm_provider == "baidu":
            # 文心一言
            api_key = os.getenv("ERNIE_API_KEY")
            if not api_key:
                raise ValueError("未设置 ERNIE_API_KEY 环境变量")
            
            return ErnieBotChat(
                model_name=model_name or "ernie-4.0-8k-latest",
                ernie_api_key=api_key,
                ernie_secret_key=os.getenv("ERNIE_SECRET_KEY", api_key)
            )
        
        else:
            # OpenAI（默认）
            api_key = os.getenv("OPENAI_API_KEY")
            return ChatOpenAI(
                model=model_name or "gpt-4o-mini",
                api_key=api_key,
                temperature=0.7
            )
    
    def _default_tools(self) -> list[Tool]:
        """默认工具列表"""
        return [
            get_weather,
            search_news,
            send_email,
            create_reminder,
            calculate
        ]
    
    def _build_graph(self) -> any:
        """构建LangGraph"""
        
        # 使用预建的ReAct Agent
        return create_react_agent(
            self.llm,
            self.tools,
            state_modifier=self._get_system_prompt()
        )
    
    def _get_system_prompt(self) -> str:
        """获取系统提示词"""
        
        tool_descriptions = "\n".join([
            f"- **{t.name}**: {t.description.split('。')[0]}"
            for t in self.tools
        ])
        
        return f"""你是一个智能助手，可以帮助用户完成各种任务。

你拥有以下工具：
{tool_descriptions}

使用指南：
1. 仔细分析用户请求，判断是否需要使用工具
2. 如果需要多个工具，可以同时调用（如果它们不相互依赖）
3. 工具调用后，根据结果回答用户
4. 如果工具执行失败，尝试重试或告知用户问题

回复风格：
- 简洁、专业、有帮助
- 使用emoji增加可读性
- 需要时展示结构化信息"""
    
    def invoke(
        self,
        message: str,
        thread_id: str = "default"
    ) -> dict:
        """
        调用Agent
        
        Args:
            message: 用户消息
            thread_id: 对话线程ID，用于保存历史
        
        Returns:
            Agent执行结果
        """
        
        config = {"configurable": {"thread_id": thread_id}}
        
        result = self.graph.invoke(
            {"messages": [HumanMessage(content=message)]},
            config=config
        )
        
        return result
    
    def stream(self, message: str, thread_id: str = "default"):
        """流式调用Agent"""
        
        config = {"configurable": {"thread_id": thread_id}}
        
        for chunk in self.graph.stream(
            {"messages": [HumanMessage(content=message)]},
            config=config,
            stream_mode="values"
        ):
            if "messages" in chunk:
                last_msg = chunk["messages"][-1]
                if hasattr(last_msg, "content") and last_msg.content:
                    yield last_msg
    
    def get_conversation_history(self, thread_id: str = "default") -> list:
        """获取对话历史"""
        
        config = {"configurable": {"thread_id": thread_id}}
        state = self.graph.get_state(config)
        
        return state.values.get("messages", [])


# ============================================
# 第四部分：使用示例
# ============================================

def main():
    """主函数"""
    
    # 创建Agent（使用OpenAI）
    agent = MultiToolAgent(
        llm_provider="openai",
        model_name="gpt-4o-mini"
    )
    
    # 单次任务测试
    print("\n【单次任务测试】\n")
    
    test_cases = [
        "北京今天天气怎么样？",
        "帮我搜索5条AI相关的新闻",
        "计算一下 (12 + 8) * 3 的结果",
        "帮我创建一个明天上午10点的提醒，内容是开会",
        "帮我查一下上海天气，然后搜索最新的科技新闻"
    ]
    
    for i, task in enumerate(test_cases, 1):
        print(f"\n{'='*50}")
        print(f"测试 {i}: {task}")
        print('='*50)
        
        result = agent.invoke(task)
        
        # 打印最后一条AI回复
        for message in result["messages"]:
            if isinstance(message, AIMessage) and message.content:
                print(f"\n🤖 回复:\n{message.content}\n")
    
    # 多轮对话测试
    print("\n\n【多轮对话测试】")
    print("-" * 50)
    
    thread_id = "user_001_multi_turn"
    
    # 第一轮
    print("\n用户: 帮我查一下天气")
    result1 = agent.invoke("帮我查一下北京今天的天气", thread_id)
    for msg in result1["messages"]:
        if isinstance(msg, AIMessage) and msg.content:
            print(f"助手: {msg.content}")
    
    # 第二轮（带上下文）
    print("\n用户: 那上海呢")
    result2 = agent.invoke("那上海呢", thread_id)
    for msg in result2["messages"]:
        if isinstance(msg, AIMessage) and msg.content:
            print(f"助手: {msg.content}")
    
    # 查看历史
    print("\n历史记录条数:", len(agent.get_conversation_history(thread_id)))


if __name__ == "__main__":
    main()
```

### 运行效果

```bash
$ python multi_tool_agent.py

【单次任务测试】

==================================================
测试 1: 北京今天天气怎么样？
==================================================

🤖 回复:
📍 北京 2026年01月15日天气预报
天气：晴天
温度：15°C ~ 25°C
湿度：45%
风力：2-3级东南风
（数据仅供参考）

==================================================
测试 5: 帮我查一下上海天气，然后搜索最新的科技新闻
==================================================

🤖 回复:
好的，我同时帮你查询上海天气和科技新闻：

📍 上海 2026年01月15日天气预报
天气：多云
温度：18°C ~ 26°C
湿度：60%
风力：3-4级东南风

📰 关于'科技'的最新新闻（共3条）：

1. 【苹果发布iPhone 17系列】
   📅 2026-01-15
   📝 搭载自研AI芯片，支持卫星通话...

2. 【特斯拉全自动驾驶进展顺利】
   📅 2026-01-14
   📝 FSD V13版本在北京开始试点...

3. 【SpaceX星舰完成第50次发射】
   📅 2026-01-13
   📝 成功回收助推器，商业化加速...

需要我帮你做其他事情吗？
```

### 国产模型配置

```python
# 使用通义千问
agent = MultiToolAgent(
    llm_provider="qwen",
    model_name="qwen-plus"  # 或 qwen-max, qwen-turbo
)

# 使用文心一言
agent = MultiToolAgent(
    llm_provider="ernie",
    model_name="ernie-4.0-8k-latest"  # 或其他支持的模型
)

# 设置环境变量
# 阿里通义
os.environ["DASHSCOPE_API_KEY"] = "your-api-key"

# 百度文心
os.environ["ERNIE_API_KEY"] = "your-api-key"
os.environ["ERNIE_SECRET_KEY"] = "your-secret-key"
```

---

## 9.7 LangChain的坑与替代方案讨论

### LangChain的常见坑

**坑1：版本混乱**

LangChain的版本管理一直是个噩梦。`langchain`、`langchain-core`、`langchain-openai`... 几十个包，版本不一致就会出各种奇怪的bug。

**解决方案：**

```bash
# 统一安装兼容版本
pip install langchain>=1.0.0 langchain-openai>=0.2.0

# 使用官方推荐的langchain包（一站式安装）
pip install langchain[all]  # 注意：这可能装很多你不需要的

# 定期检查依赖冲突
pip check
```

**更优雅的解决方案：使用pip-tools**

```bash
pip install pip-tools

# 创建requirements.in
# 写入你需要的包
echo "langchain>=1.0.0" >> requirements.in
echo "langchain-openai>=0.2.0" >> requirements.in

# 锁定版本
pip-compile requirements.in

# 安装锁定版本
pip-sync requirements.txt
```

**坑2：文档质量参差不齐**

LangChain的官方文档虽然全面，但经常有例子过时、API不一致的问题。你经常会在文档里看到A方法，但实际代码里用的是B方法。

**解决方案：**
- 优先看GitHub的examples
- 关注LangChain的release notes
- 加入官方Discord社区求助
- **最靠谱**：直接看源码

```python
# 查看LCEL组件的源码
from langchain_core.runnables import RunnableParallel
import inspect
print(inspect.getsource(RunnableParallel))
```

**坑3：性能开销**

LangChain的抽象层会带来一定的性能开销。在高并发场景下，这个问题会比较明显。

**解决方案：**
- 生产环境考虑直接调用底层SDK
- 减少不必要的组件封装
- 使用异步方法（`.ainvoke()`）
- 使用流式输出减少等待感

**坑4：调试困难**

当Chain/Agent执行出错时，定位问题比较困难。

**解决方案：**
- 开启LangSmith日志
```python
os.environ["LANGSMITH_TRACING"] = "true"
os.environ["LANGSMITH_API_KEY"] = "your-api-key"
```
- 分步调试，单独测试每个组件
- 使用`@chain`装饰器标记关键节点

**坑5：版本更新太快，代码容易过期**

这是LangChain最大的问题——**今天学的API，明天可能就变了**。

**应对策略：**

1. **关注breaking changes**
```python
# 每次大版本更新，关注以下几点：
# - 移除了哪些API
# - 废弃了哪些API
# - 新增了哪些功能
```

2. **使用版本锁定**
```bash
# 在requirements.txt中锁定版本
langchain==1.0.0
langchain-core==0.3.0
langchain-openai==0.2.0
```

3. **学习底层原理，而非API细节**
```python
# 学习LCEL的核心概念：
# - Runnable接口
# - 管道运算符|
# - 状态传递机制

# 这些概念相对稳定
```

4. **准备迁移脚本**
```python
# 如果用到了即将废弃的API，提前写好迁移脚本
def migrate_to_lcel(old_chain):
    """迁移旧版Chain到LCEL"""
    # ...
```

### 什么时候用LangChain vs 替代方案？

| 场景 | 推荐方案 | 原因 |
|------|---------|------|
| **复杂多步骤Agent** | LangGraph | 声明式工作流，清晰可维护 |
| **简单RAG应用** | LlamaIndex | 专注RAG，API更简洁 |
| **快速原型** | LangChain | 生态完整，示例丰富 |
| **企业级应用** | Semantic Kernel | Azure深度集成，企业支持 |
| **多Agent团队协作** | CrewAI | 角色驱动，更符合人类逻辑 |
| **需要可视化搭建** | Flowise/LangFlow | 拖拽式操作，所见即所得 |
| **极致性能** | 直接调用SDK | 无抽象开销 |

### LangGraph vs CrewAI：什么时候用哪个？

这是2026年最常见的问题之一。让我给你一个清晰的对比：

| 维度 | LangGraph | CrewAI |
|------|-----------|--------|
| **核心理念** | 状态机/工作流 | Agent团队协作 |
| **适用场景** | 复杂流程、循环、条件分支 | 多角色任务分解 |
| **学习曲线** | 较陡（需要理解状态机） | 较平缓（概念直观） |
| **灵活性** | 极高（几乎可以实现任何流程） | 中等（受限于预设模式） |
| **人工介入** | 原生支持interrupt | 需要自定义 |
| **国产支持** | 良好 | 一般 |

**选择建议：**

```python
# 用LangGraph的场景
"""
1. 需要复杂的条件分支
   - 如果A则走B路径，如果C则走D路径
   
2. 需要循环执行
   - Agent反复思考直到满足条件
   
3. 需要人工审批
   - 发邮件前需要用户确认
   
4. 需要精确控制执行流程
   - 每个节点做什么、什么时候做
"""

# 用CrewAI的场景
"""
1. 多角色协作
   - 研究员写报告 -> 编辑审核 -> 发布者发布
   
2. 任务分解简单明确
   - 每个Agent有固定的角色和目标
   
3. 快速验证想法
   - 不用写大量状态管理代码
"""
```

**混合使用？**

其实LangGraph和CrewAI并不互斥。你可以用LangGraph构建核心流程，用CrewAI处理特定的多Agent协作场景。

```python
# 示例：混合使用
from crewai import Agent, Task, Crew
from langgraph.graph import StateGraph, END

# LangGraph处理主流程
def main_workflow():
    graph = StateGraph(...)
    # ...
    return graph.compile()

# CrewAI处理某个子流程中的多Agent协作
def research_subtask(topic: str):
    researcher = Agent(role="研究员", goal="收集信息", backstory="...")
    analyst = Agent(role="分析师", goal="分析信息", backstory="...")
    
    crew = Crew(agents=[researcher, analyst], tasks=[...])
    return crew.kickoff()

# 在LangGraph节点中调用CrewAI
def research_node(state):
    result = research_subtask(state["topic"])
    return {"research_result": result}
```

### 我的建议

**选择LangChain的场景：**
- 需要灵活组合多种能力（模型+工具+记忆+RAG）
- 快速原型和实验
- 复杂的Agent编排（尤其是需要LangGraph时）
- 作为学习AI应用开发的首选框架

**选择其他框架的场景：**
- RAG为核心 → LlamaIndex
- 多Agent协作 → CrewAI
- 企业级+微软生态 → Semantic Kernel
- 需要可视化 → Flowise

**最重要的建议：**

> 不用太纠结选框架。先用LangChain学通原理，其他框架都是触类旁通。面试的时候，LangChain的经验更通用——因为它是目前最流行的框架。
>
> 2026年的今天，**LangGraph才是LangChain的灵魂**，学会了LangGraph，你就能构建真正复杂的Agent系统。

---

## 行动清单

恭喜你完成第9章的学习！

### 本章核心收获

1. **LangChain架构**：理解六大核心模块（Model、Prompt、Chain、Tool、Retrieval、Memory）
2. **LCEL语法**：掌握管道运算符`|`的声明式编程范式，能实现RAG Fusion等复杂链路
3. **LangGraph**：这是重点！你现在应该能够：
   - 定义状态和节点
   - 构建条件分支和循环
   - 实现人在回路（Human-in-the-loop）
   - 搭建完整的多步骤研究报告Agent
4. **生产级RAG实现**：从玩具级升级到生产级，具备错误处理、缓存、检索质量评估
5. **多工具Agent**：掌握并发工具调用、工具失败处理、国产模型支持
6. **框架选择**：理解LangChain的坑和替代方案，知道什么时候用LangGraph vs CrewAI

### 下一步行动

- [ ] **环境搭建**：安装LangChain和LangGraph，运行"快速验证安装"代码
- [ ] **LangGraph入门**：先跑通上面的研究报告Agent例子，理解状态和节点的概念
- [ ] **改造现有代码**：如果你是从旧版LangChain过来的，尝试把`LLMChain`迁移到LCEL
- [ ] **RAG实战**：准备几份文档，运行生产级RAG代码
- [ ] **Agent实战**：运行多工具Agent代码，测试不同场景
- [ ] **国产模型**：配置通义千问或文心一言，验证国产模型兼容性
- [ ] **对比学习**：安装CrewAI，对比LangGraph vs CrewAI的使用体验

### 资源推荐

- 官方文档：https://docs.langchain.com/
- LangChain GitHub：https://github.com/langchain-ai/langchain
- LCEL教程：https://python.langchain.com/docs/expression_language/
- LangGraph文档：https://python.langchain.com/docs/langgraph
- LangSmith：https://smith.langchain.com/ （调试和追踪）
- CrewAI：https://docs.crewai.com/

---

**下一章预告**：第10章《从0到1：构建你的第一个AI产品》——我们会把前面学到的所有知识整合起来，从需求分析到产品上线，手把手带你完成一个完整的AI产品开发。

---

## 附录：LangChain核心速查表

### LCEL基础

```python
# 基本管道
chain = prompt | llm | parser

# 调用
result = chain.invoke({"input": "..."})

# 异步
result = await chain.ainvoke({"input": "..."})

# 流式
for chunk in chain.stream({"input": "..."}):
    print(chunk, end="")

# 批量
results = chain.batch([{"input": "a"}, {"input": "b"}])
```

### LangGraph基础

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict

# 定义状态
class MyState(TypedDict):
    messages: list
    data: dict

# 创建图
graph = StateGraph(MyState)

# 添加节点
graph.add_node("node_name", my_node_function)

# 设置入口
graph.set_entry_point("node_name")

# 添加边
graph.add_edge("node_a", "node_b")

# 条件边
graph.add_conditional_edges("node_a", my_condition_func, {"go_b": "node_b", "go_c": "node_c"})

# 编译
app = graph.compile()

# 运行
result = app.invoke(initial_state)
```

### 工具定义

```python
from langchain_core.tools import tool

@tool
def my_tool(param1: str, param2: int = 10) -> str:
    """工具描述（重要！模型靠这个决定是否调用）
    
    Args:
        param1: 参数1描述
        param2: 参数2描述，默认10
    
    Returns:
        返回值描述
    """
    # 实现
    return "result"
```

---

*本章完*
