---
outline: [2, 3]
---

# 第7章 AI Agent核心逻辑

## 本章你能带走什么

恭喜你来到基础篇的最后一章！

如果前面的章节是教你"怎么用AI"，那这一章要教你"怎么让AI自己干活"。

我先问你一个问题：大模型和AI Agent的核心区别是什么？

大模型是被动的——你问，它答，一问一答，天花板很低。AI Agent是主动的——你给它一个目标，它自己想办法、自己查资料、自己调用工具、自己验证结果，直到任务完成。

从"你告诉我怎么做"到"你自己看着办"，这是质的飞跃。

读完这章你会带走：

- **Agent的本质理解**：为什么Agent是AI应用的未来
- **Agent架构全貌**：感知、推理、行动、记忆四大组件
- **工具调用能力**：让AI能够操作真实世界（含生产级代码）
- **规划推理模式**：ReAct完整追踪、LangGraph 2026实战、Plan-and-Execute
- **多Agent协作**：两个真实可用的案例（CrewAI + LangGraph）
- **Agent可靠性工程**：失败的6种模式、成本控制、输出校验

更重要的是，你会对前面几章的内容有一个融会贯通的认知——Prompt工程是Agent的"思考方式"，RAG是Agent的"知识库"，而Agent则是把它们串起来的"执行引擎"。

准备好了？我们开始。

---

## 7.1 什么是AI Agent：从被动应答到主动执行

### 一句话解释Agent

AI Agent（智能体）是一个能够自主规划、使用工具、逐步执行以达成目标的AI系统。

关键词是**自主**——不是等着你一步步指挥，而是你告诉它"帮我把这份合同的风险点整理出来"，它自己就能：
1. 先读合同
2. 识别条款
3. 查相关法规
4. 对比行业惯例
5. 输出风险报告

整个过程你只需要下一条指令。

### 为什么2026年Agent彻底爆发了？

说实话，2023-2024年Agent概念刚起来的时候，大多数产品都是"套壳"——套一个大模型的壳，加几个工具接口，就敢叫Agent。那时候的效果嘛，说实话，噱头大于实质。

但2025-2026年不一样了。原因有三个：

**第一，模型能力真的够了。** GPT-4.5、Claude 4、通义千问2.5这批模型，不仅能生成文本，还能做复杂推理、调用工具、保持多轮上下文。这为Agent提供了真正能"思考"的大脑。

**第二，Function Calling标准化了。** OpenAI带头，各大厂商跟进，现在函数调用成了行业标准。AI不再只是"说"，还能"做"。

**第三，框架成熟了。** LangChain、LangGraph、CrewAI这些框架，经过两年多的迭代，终于从"demo能用，生产必崩"进化到了"基本可用"。

**第四，市场需求到了临界点。** 企业不是要聊天机器人，而是要能自动处理流程、完成任务的系统。Agent正好满足这个需求。

所以，2026年不是Agent元年，而是Agent的"工程化元年"——终于可以正经干活了。

### Agent的核心价值

| 场景 | 不用Agent | 用Agent |
|------|----------|---------|
| 查资料 | 你问一句，它答一句，来回几十轮 | "帮我整理竞品分析"，Agent自动查完所有信息 |
| 处理文档 | 你复制粘贴，它修改，来回折腾 | "把这份合同转成标准模板"，Agent自动完成 |
| 自动化流程 | 你手动触发每一步 | "每天早上生成数据报告"，Agent定时自动执行 |

**Agent的价值在于：把人类的"监督执行"变成"目标导向的自动执行"。**

---

## 7.2 Agent架构拆解：感知→推理→行动→记忆

理解了什么是Agent，我们来看它的内部构造。任何Agent都离不开四个核心组件：

```
┌─────────────────────────────────────────────────────────┐
│                        AI Agent                          │
│                                                         │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐          │
│   │   感知   │───▶│   推理   │───▶│   行动   │          │
│   │ (Perceive)│   │ (Reason) │   │ (Act)    │          │
│   └──────────┘    └──────────┘    └──────────┘          │
│        │                                  │              │
│        │            ┌──────────┐           │              │
│        └───────────▶│   记忆   │◀──────────┘              │
│                     │ (Memory) │                          │
│                     └──────────┘                          │
└─────────────────────────────────────────────────────────┘
```

### 感知（Perception）：Agent的眼睛和耳朵

感知是Agent获取信息的方式。在AI应用里，主要包括：

**1. 用户输入**：用户说的一句话、发的一个文件、提的一个需求。这是Agent的"耳朵"。

**2. 工具返回**：Agent调用搜索工具返回的结果、调用API获取的数据、读文件得到的内容。这是Agent的"实时情报"。

**3. 系统状态**：当前时间、已完成的步骤、之前的操作结果。这是Agent的"环境感知"。

**4. 多模态输入（2026年必备）**：图片、音频、PDF、表格。你可能收到一张截图、一段录音、一份PDF年报，Agent都需要能处理。

```python
# 生产级感知层：支持多模态输入
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Union
from enum import Enum

class ContentType(Enum):
    TEXT = "text"
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"
    DOCUMENT = "document"

@dataclass
class UserInput:
    """标准化的用户输入"""
    content_type: ContentType
    content: Any  # 文本、URL、文件路径、base64等
    metadata: Dict[str, Any] = field(default_factory=dict)
    
@dataclass
class ToolResult:
    """标准化的工具返回"""
    tool_name: str
    success: bool
    data: Any
    error: Optional[str] = None
    timestamp: str = ""  # ISO格式

@dataclass
class Perception:
    """完整的感知状态"""
    user_inputs: List[UserInput] = field(default_factory=list)
    tool_results: List[ToolResult] = field(default_factory=list)
    conversation_history: List[Dict[str, str]] = field(default_factory=list)
    system_context: Dict[str, Any] = field(default_factory=dict)
    
    def add_user_input(self, input_data: Union[str, Dict]):
        """添加用户输入，自动识别类型"""
        if isinstance(input_data, str):
            self.user_inputs.append(UserInput(
                content_type=ContentType.TEXT,
                content=input_data
            ))
        elif isinstance(input_data, dict):
            self.user_inputs.append(UserInput(
                content_type=ContentType(input_data.get("type", "text")),
                content=input_data.get("content"),
                metadata=input_data.get("metadata", {})
            ))
    
    def add_tool_result(self, result: ToolResult):
        """添加工具返回结果"""
        self.tool_results.append(result)
    
    def get_full_context(self) -> str:
        """整合所有感知信息，用于大模型推理"""
        parts = []
        
        # 用户输入
        if self.user_inputs:
            parts.append("【用户输入】")
            for inp in self.user_inputs:
                parts.append(f"[{inp.content_type.value}] {inp.content}")
        
        # 工具返回
        if self.tool_results:
            parts.append("\n【工具执行结果】")
            for res in self.tool_results:
                status = "✅" if res.success else "❌"
                parts.append(f"{status} {res.tool_name}: {res.data}")
        
        # 历史对话（最近10轮）
        if self.conversation_history:
            parts.append("\n【对话历史】")
            for msg in self.conversation_history[-10:]:
                role = msg.get("role", "user")
                content = msg.get("content", "")[:200]
                parts.append(f"{role}: {content}...")
        
        return "\n".join(parts)
```

### 推理（Reasoning）：Agent的大脑

推理是Agent的核心——它要决定"现在该做什么"。

Agent的推理不像传统程序那样写死逻辑，而是由大模型驱动。大模型根据当前状态和目标，生成下一步行动。

**常见的推理模式：**
1. **ReAct**：边想边做（7.4节详讲）
2. **Chain of Thought**：展示思考过程
3. **Plan-and-Execute**：先规划再执行
4. **Tree of Thought**：探索多种可能（复杂决策场景）

```python
# 生产级推理层：支持多种推理模式
from abc import ABC, abstractmethod
from typing import Literal

class ReasoningMode(Enum):
    REACT = "react"           # 边想边做
    CHAIN_OF_THOUGHT = "cot" # 思维链
    PLAN_EXECUTE = "plan"     # 先规划后执行
    TREE_OF_THOUGHT = "tot"  # 思维树

class AgentReasoning(ABC):
    """推理层抽象基类"""
    
    @abstractmethod
    def think(self, state: Perception, goal: str, tools: List[dict]) -> Dict[str, Any]:
        """核心推理方法"""
        pass

class ReActReasoning(AgentReasoning):
    """ReAct推理模式"""
    
    def think(self, state: Perception, goal: str, tools: List[dict]) -> Dict[str, Any]:
        prompt = f"""
当前目标：{goal}

{state.get_full_context()}

可用的工具：
{self._format_tools(tools)}

请按以下格式思考和决定：

Thought: 我现在需要做什么？基于什么考虑？
Action: 调用哪个工具（如果有）
Action Input: 工具的输入参数
"""
        response = self.llm.invoke(prompt)
        return self._parse_response(response)
    
    def _format_tools(self, tools: List[dict]) -> str:
        """格式化工具列表"""
        return "\n".join([
            f"- {t['name']}: {t['description']}"
            for t in tools
        ])
    
    def _parse_response(self, response: str) -> Dict[str, Any]:
        """解析LLM响应"""
        lines = response.split("\n")
        result = {}
        for line in lines:
            if line.startswith("Thought:"):
                result["thought"] = line[7:].strip()
            elif line.startswith("Action:"):
                result["action"] = line[7:].strip()
            elif line.startswith("Action Input:"):
                result["action_input"] = line[13:].strip()
        return result
```

### 行动（Action）：Agent的手脚

行动是Agent实际执行操作的部分。在AI应用里，主要包括：

**1. 调用工具**：搜索、计算、读写文件、发送消息、调用API...

**2. 生成回复**：向用户返回结果、解释进展、请求更多信息...

**3. 更新状态**：记录已完成步骤、更新上下文、保存中间结果...

```python
# 生产级行动层：支持重试、超时、熔断
import asyncio
from functools import wraps
from typing import Callable, Any
import time

def with_retry(max_attempts: int = 3, delay: float = 1.0):
    """重试装饰器"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            last_error = None
            for attempt in range(max_attempts):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    last_error = e
                    if attempt < max_attempts - 1:
                        await asyncio.sleep(delay * (attempt + 1))
            raise last_error
        return wrapper
    return decorator

def with_timeout(seconds: float):
    """超时装饰器"""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                return await asyncio.wait_for(func(*args, **kwargs), timeout=seconds)
            except asyncio.TimeoutError:
                return {"error": f"执行超时（{seconds}秒）", "status": "timeout"}
        return wrapper
    return decorator

class AgentAction:
    """行动层：执行工具调用"""
    
    def __init__(self, tools_registry: Dict[str, Callable]):
        self.tools = tools_registry
        self.execution_history = []
    
    async def execute(
        self, 
        action_name: str, 
        action_input: Any,
        timeout: float = 30.0
    ) -> ToolResult:
        """执行工具调用（带超时和重试）"""
        
        if action_name == "FINISH":
            return ToolResult(
                tool_name="FINISH",
                success=True,
                data=action_input
            )
        
        tool = self.tools.get(action_name)
        if not tool:
            return ToolResult(
                tool_name=action_name,
                success=False,
                data=None,
                error=f"未知工具: {action_name}"
            )
        
        # 记录执行
        self.execution_history.append({
            "tool": action_name,
            "input": action_input,
            "timestamp": time.time()
        })
        
        try:
            # 带超时执行
            if asyncio.iscoroutinefunction(tool):
                result = await asyncio.wait_for(tool(action_input), timeout=timeout)
            else:
                result = tool(action_input)
            
            return ToolResult(
                tool_name=action_name,
                success=True,
                data=result
            )
        except asyncio.TimeoutError:
            return ToolResult(
                tool_name=action_name,
                success=False,
                data=None,
                error=f"工具执行超时（{timeout}秒）"
            )
        except Exception as e:
            return ToolResult(
                tool_name=action_name,
                success=False,
                data=None,
                error=f"工具执行失败: {str(e)}"
            )
```

### 记忆（Memory）：Agent的经验

记忆让Agent能够"记住"之前发生的事。分为三类：

**1. 短期记忆（Working Memory）**：当前对话的上下文、已完成的步骤、中间结果。类似于人类的工作记忆，关机就忘。

**2. 长期记忆（Long-term Memory）**：Agent学到的知识、用户的偏好、之前的经验。需要持久化存储（向量数据库）。

**3. 工作记忆（Scratchpad）**：Agent在推理过程中的"草稿纸"，记录中间计算结果、临时变量等。

```python
# 生产级记忆层：三层记忆架构
from datetime import datetime
from typing import List, Optional
import json

class ShortTermMemory:
    """短期记忆：对话上下文"""
    
    def __init__(self, max_entries: int = 50):
        self.entries = []
        self.max_entries = max_entries
    
    def add(self, entry_type: str, content: Any, metadata: dict = None):
        """添加记忆"""
        self.entries.append({
            "type": entry_type,  # thought, action, observation, user_input, result
            "content": content,
            "metadata": metadata or {},
            "timestamp": datetime.now().isoformat()
        })
        
        # 防止溢出，自动清理
        if len(self.entries) > self.max_entries:
            self.entries = self.entries[-self.max_entries:]
    
    def get_recent(self, n: int = 10) -> List[dict]:
        """获取最近的N条记忆"""
        return self.entries[-n:]
    
    def get_context_window(self) -> str:
        """获取格式化上下文"""
        return "\n".join([
            f"[{e['type']}] {e['content']}"
            for e in self.entries
        ])
    
    def summarize_and_compress(self, llm) -> str:
        """上下文太长时，总结压缩"""
        if len(self.entries) <= 20:
            return self.get_context_window()
        
        # 取最近5条 + 总结中间部分
        recent = self.entries[-5:]
        middle = self.entries[:-5]
        
        summary_prompt = f"""
请总结以下对话/执行历史的核心要点：

{chr(10).join([f"{i+1}. [{e['type']}] {e['content'][:100]}" for i, e in enumerate(middle)])}

要求：
1. 提取关键信息和已完成的重要步骤
2. 保留对当前任务有影响的内容
3. 格式简洁
"""
        summary = llm.invoke(summary_prompt)
        
        return summary + "\n\n" + "\n".join([
            f"[{e['type']}] {e['content']}"
            for e in recent
        ])

class LongTermMemory:
    """长期记忆：向量存储"""
    
    def __init__(self, vector_store=None):
        self.vector_store = vector_store
        self.memory_index = {}  # 内存索引，快速查找
    
    def add(self, content: str, metadata: dict):
        """添加到长期记忆"""
        if self.vector_store:
            self.vector_store.add_texts([content], [metadata])
        
        # 内存索引
        memory_id = f"{metadata.get('type', 'unknown')}_{len(self.memory_index)}"
        self.memory_index[memory_id] = {
            "content": content,
            "metadata": metadata,
            "created_at": datetime.now().isoformat()
        }
    
    def search(self, query: str, limit: int = 5) -> List[dict]:
        """语义搜索"""
        if self.vector_store:
            results = self.vector_store.similarity_search(query, k=limit)
            return [{"content": r.page_content, "metadata": r.metadata} for r in results]
        return []
    
    def get_user_preferences(self, user_id: str) -> dict:
        """获取用户偏好"""
        # 从索引中查找
        prefs = []
        for mem in self.memory_index.values():
            if mem["metadata"].get("user_id") == user_id and mem["metadata"].get("type") == "preference":
                prefs.append(mem["content"])
        return {"preferences": prefs}

class Scratchpad:
    """工作记忆：推理过程中的临时存储"""
    
    def __init__(self):
        self.data = {}
        self.call_stack = []
    
    def set(self, key: str, value: Any):
        """设置临时变量"""
        self.data[key] = value
    
    def get(self, key: str, default: Any = None) -> Any:
        """获取临时变量"""
        return self.data.get(key, default)
    
    def push_context(self, context: str):
        """推入上下文（用于嵌套推理）"""
        self.call_stack.append({
            "context": context,
            "timestamp": datetime.now().isoformat()
        })
    
    def pop_context(self) -> Optional[str]:
        """弹出上下文"""
        if self.call_stack:
            return self.call_stack.pop().get("context")
        return None

class AgentMemory:
    """三层记忆整合"""
    
    def __init__(self, vector_store=None):
        self.short_term = ShortTermMemory()
        self.long_term = LongTermMemory(vector_store)
        self.scratchpad = Scratchpad()
    
    def add_interaction(self, entry_type: str, content: Any, metadata: dict = None):
        """添加到短期记忆"""
        self.short_term.add(entry_type, content, metadata)
    
    def learn(self, content: str, metadata: dict):
        """添加到长期记忆"""
        self.long_term.add(content, metadata)
    
    def remember(self, query: str) -> List[dict]:
        """从长期记忆中检索"""
        return self.long_term.search(query)
```

### 四组件协作示例

把这四个组件串起来，就是一个完整的Agent循环：

```python
# 完整Agent主循环（简化版，便于理解）
class SimpleAgent:
    """一个简化的Agent实现"""
    
    def __init__(self, llm, tools, memory=None):
        self.llm = llm
        self.tools = tools
        self.memory = memory or AgentMemory()
        self.max_iterations = 10
    
    async def run(self, goal: str, initial_input: str = None):
        """Agent的主循环"""
        
        # 初始化感知
        perception = Perception()
        if initial_input:
            perception.add_user_input(initial_input)
        
        for i in range(self.max_iterations):
            # 1. 推理：根据当前状态决定下一步
            decision = await self.reason(perception, goal)
            
            # 2. 行动：执行决策
            if decision.get("action") == "FINISH":
                return decision.get("result")
            
            result = await self.act(decision)
            perception.add_tool_result(result)
            
            # 3. 感知更新：把结果加入上下文
            self.memory.add_interaction("thought", decision.get("thought"))
            self.memory.add_interaction("action", f"{decision.get('action')}({decision.get('action_input')})")
            self.memory.add_interaction("observation", result.data)
            
            # 4. 检查是否陷入循环
            if self._is_looping():
                return "执行陷入循环，请重新描述任务"
        
        return "达到最大迭代次数，请简化任务"
    
    async def reason(self, perception, goal):
        """调用大模型进行推理（ReAct模式）"""
        prompt = f"""
当前目标：{goal}

{perception.get_full_context()}

可用的工具：
{list(self.tools.keys())}

请按以下格式思考：

Thought: 
Action: 
Action Input: 
"""
        response = self.llm.invoke(prompt)
        return self._parse_response(response)
    
    async def act(self, decision):
        """执行工具调用"""
        action = decision.get("action")
        action_input = decision.get("action_input")
        
        if action in self.tools:
            return await AgentAction(self.tools).execute(action, action_input)
        return ToolResult(tool_name=action, success=False, error="未知工具")
    
    def _is_looping(self) -> bool:
        """检测是否陷入循环"""
        recent = self.memory.short_term.get_recent(6)
        if len(recent) < 6:
            return False
        
        # 检查最近的动作是否重复
        actions = [e["content"] for e in recent if e["type"] == "action"]
        return len(set(actions[-3:])) == 1  # 最近3个动作相同 = 循环
```

这就是Agent的基本工作原理。理解了四组件，后面的内容就顺理成章了。

---

## 7.3 工具调用（Tool Use / Function Calling）

### 为什么Agent需要工具？

大模型再强，本质上还是"纸上谈兵"——它只能生成文本，没有办法真正操作世界。

工具就是Agent的"手脚"——让它能够：
- 搜索互联网获取实时信息
- 读写文件、操作数据库
- 调用外部API完成实际任务
- 执行代码、运行命令

没有工具，Agent就是一个"聪明的废话生成器"。有了工具，Agent才能真正"做事"。

### Function Calling的完整生命周期

很多教程只讲"怎么定义工具"，不讲"工具调用的完整生命周期"。我来给你补上这课：

```
用户请求 → 模型决定调用工具 → 提取函数名和参数 → 参数校验 → 
执行工具 → 处理结果 → 返回给模型 → 模型生成回答
         ↑                                      ↓
         ←──────── 出错？重试或降级？ ←────────────
```

每一个环节都可能出问题，每一个环节都需要认真处理。

**第一阶段：模型决定调用**

```python
# 阶段1：让模型决定调用什么工具
response = client.chat.completions.create(
    model="gpt-4.1-mini",
    messages=[{"role": "user", "content": user_message}],
    tools=tools,  # 工具定义
    tool_choice="auto"  # 模型自己决定，也可以强制指定
)
```

**第二阶段：解析工具调用**

```python
# 阶段2：解析模型的选择
assistant_message = response.choices[0].message

if assistant_message.tool_calls:
    for tool_call in assistant_message.tool_calls:
        function_name = tool_call.function.name
        function_args = json.loads(tool_call.function.arguments)
        # function_args 是个字典，直接传给工具
```

**第三阶段：参数校验（重要！）**

```python
# 阶段3：参数校验（必须做！不然可能传错参数）
from pydantic import BaseModel, ValidationError

class SearchNewsParams(BaseModel):
    query: str
    limit: int = 5

def validate_and_execute(function_name, function_args, tools_registry):
    """带校验的工具执行"""
    tool = tools_registry.get(function_name)
    if not tool:
        return {"error": f"未知工具: {function_name}"}
    
    # 获取工具的参数模式
    params_schema = tool.get("parameters", {})
    
    try:
        # 校验参数
        validated_args = validate_arguments(function_args, params_schema)
        # 执行
        return tool["func"](**validated_args)
    except ValidationError as e:
        return {"error": f"参数错误: {e}"}
```

**第四阶段：执行与重试**

```python
# 阶段4：执行工具（带重试）
import asyncio

async def execute_with_retry(func, args, max_retries=3):
    """带重试的执行"""
    last_error = None
    
    for attempt in range(max_retries):
        try:
            if asyncio.iscoroutinefunction(func):
                return await func(**args)
            else:
                return func(**args)
        except Exception as e:
            last_error = e
            await asyncio.sleep(0.5 * (attempt + 1))  # 指数退避
    
    return {"error": f"执行失败（重试{max_retries}次）: {last_error}"}
```

**第五阶段：结果处理**

```python
# 阶段5：处理结果并返回给模型
tool_results = []
if assistant_message.tool_calls:
    for tool_call in assistant_message.tool_calls:
        result = await execute_with_retry(
            tools_registry[tool_call.function.name],
            json.loads(tool_call.function.arguments)
        )
        
        tool_results.append({
            "tool_call_id": tool_call.id,
            "role": "tool",
            "content": json.dumps(result) if isinstance(result, dict) else str(result)
        })

# 第二次调用：把结果传回模型
messages = [
    {"role": "user", "content": user_message},
    assistant_message,  # 模型的决定
    *tool_results       # 工具执行结果
]

final_response = client.chat.completions.create(
    model="gpt-4.1-mini",
    messages=messages
)
```

### 工具设计模式：原子工具 vs 组合工具

**原子工具**：做一件简单的事，比如"搜索"、"读文件"、"发邮件"。每个工具职责单一，容易测试和复用。

**组合工具**：把多个原子工具组合起来，做一件复杂的事。比如"竞品分析" = 搜索竞品信息 + 读取官网 + 分析数据 + 生成报告。

**原则：让Agent自己决定用原子工具，还是用组合工具。**

```python
# ============ 原子工具示例 ============
@tool
def search_google(query: str, num_results: int = 10) -> str:
    """
    使用Google搜索获取最新信息。
    
    Args:
        query: 搜索关键词
        num_results: 返回结果数量，默认10条
    
    Returns:
        搜索结果列表，每条包含标题、链接和摘要
    """
    # 实际实现连接Google Search API
    pass

@tool
def read_file(file_path: str, max_lines: int = 1000) -> str:
    """
    读取文件内容。
    
    Args:
        file_path: 文件路径
        max_lines: 最大读取行数，默认1000行
    
    Returns:
        文件内容
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()[:max_lines]
    return ''.join(lines)

@tool
def execute_python(code: str) -> str:
    """
    执行Python代码。
    
    Args:
        code: 要执行的Python代码
    
    Returns:
        执行结果或错误信息
    """
    # 实际实现需要沙箱环境
    pass

# ============ 组合工具示例 ============
@tool
def analyze_competitor(competitor_name: str) -> dict:
    """
    完整的竞品分析（组合工具）。
    内部调用搜索、读文件、分析等多种原子工具。
    
    Args:
        competitor_name: 竞品名称
    
    Returns:
        {
            "overview": "概述",
            "products": [...],
            "pricing": "定价策略",
            "market_share": "市场份额",
            "swot": "SWOT分析"
        }
    """
    # 1. 搜索竞品基本信息
    basic_info = search_google(f"{competitor_name} 官网 公司介绍")
    
    # 2. 搜索产品线
    products = search_google(f"{competitor_name} 产品线")
    
    # 3. 搜索定价
    pricing = search_google(f"{competitor_name} 定价 价格")
    
    # 4. 综合分析
    analysis = llm.invoke(f"""
请分析以下竞品信息，输出结构化报告：

{basic_info}
{products}
{pricing}

输出格式：
{{
    "overview": "一句话概述",
    "products": ["产品1", "产品2"],
    "pricing": "定价策略",
    "market_position": "市场定位",
    "swot": {{"优势": "", "劣势": "", "机会": "", "威胁": ""}}
}}
""")
    return analysis
```

### 实战：设计一套AI开发助手工具集

给你一个实用的工具集示例，直接可用于你的AI编程助手：

```python
# ============ AI开发助手工具集 ============
from langchain.tools import tool
from langchain_community.tools.file_management import (
    ReadFileTool, WriteFileTool, ListDirectoryTool
)
from langchain_community.tools import ShellScope
from pydantic import BaseModel, Field
from typing import Optional, List
import subprocess
import json

# ============ 1. 文件操作工具 ============
class WriteFileInput(BaseModel):
    file_path: str = Field(description="文件路径，要写入的文件的完整路径")
    content: str = Field(description="文件内容，要写入的完整文本")
    append: bool = Field(default=False, description="是否追加模式，默认覆盖")

@tool(args_schema=WriteFileInput)
def write_file(file_path: str, content: str, append: bool = False) -> str:
    """
    写入或追加文件内容。用于创建新文件或更新现有文件。
    
    使用场景：
    - 创建源代码文件
    - 更新配置文件
    - 追加日志
    - 写入报告文档
    
    示例：
    - write_file("src/main.py", "print('hello')")  # 覆盖写入
    - write_file("logs/app.log", "error occurred", append=True)  # 追加
    """
    mode = "a" if append else "w"
    try:
        with open(file_path, mode, encoding="utf-8") as f:
            f.write(content)
        return f"✅ 成功{'追加写入' if append else '写入'}文件: {file_path}"
    except Exception as e:
        return f"❌ 文件写入失败: {str(e)}"

class ReadFileInput(BaseModel):
    file_path: str = Field(description="要读取的文件路径")
    start_line: int = Field(default=1, description="起始行号，从1开始")
    max_lines: int = Field(default=500, description="最多读取行数")

@tool(args_schema=ReadFileInput)
def read_file(file_path: str, start_line: int = 1, max_lines: int = 500) -> str:
    """
    读取文件内容，支持分片读取大文件。
    
    使用场景：
    - 查看源代码
    - 读取配置文件
    - 查看日志
    - 读取文档
    
    示例：
    - read_file("src/app.py")  # 读取整个文件
    - read_file("src/app.py", start_line=100, max_lines=50)  # 读取100-150行
    """
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
        
        total_lines = len(lines)
        start_idx = max(0, start_line - 1)
        end_idx = min(total_lines, start_idx + max_lines)
        
        content = "".join(lines[start_idx:end_idx])
        
        result = f"📄 文件: {file_path}\n总行数: {total_lines}\n显示: 第{start_line}-{end_idx}行\n\n{content}"
        if end_idx < total_lines:
            result += f"\n... (还有 {total_lines - end_idx} 行未显示)"
        
        return result
    except FileNotFoundError:
        return f"❌ 文件不存在: {file_path}"
    except Exception as e:
        return f"❌ 读取失败: {str(e)}"

@tool
def list_directory(directory_path: str = ".") -> str:
    """
    列出目录下的文件和文件夹。
    
    使用场景：
    - 查看项目结构
    - 确认文件是否存在
    - 浏览文件夹
    
    示例：
    - list_directory(".")  # 列出当前目录
    - list_directory("src")  # 列出src目录
    """
    try:
        import os
        items = os.listdir(directory_path)
        formatted = []
        for item in sorted(items):
            full_path = os.path.join(directory_path, item)
            if os.path.isdir(full_path):
                formatted.append(f"📁 {item}/")
            else:
                size = os.path.getsize(full_path)
                formatted.append(f"📄 {item} ({size} bytes)")
        return "\n".join(formatted) if formatted else "📭 目录为空"
    except Exception as e:
        return f"❌ 列出目录失败: {str(e)}"

# ============ 2. 代码执行工具 ============
class ExecutePythonInput(BaseModel):
    code: str = Field(description="要执行的Python代码")
    timeout: int = Field(default=30, description="超时时间（秒）")

@tool(args_schema=ExecutePythonInput)
def execute_python(code: str, timeout: int = 30) -> str:
    """
    执行Python代码。用于测试代码片段、运行脚本。
    
    ⚠️ 安全警告：此工具在沙箱环境中执行，请勿执行恶意代码。
    
    使用场景：
    - 测试代码片段
    - 运行数据处理脚本
    - 执行算法验证
    
    示例：
    - execute_python("print('Hello, World!')")
    - execute_python("result = [x**2 for x in range(10)]; print(result)")
    """
    import sys
    from io import StringIO
    
    try:
        # 捕获输出
        old_stdout = sys.stdout
        sys.stdout = StringIO()
        
        # 执行代码
        exec_globals = {"__name__": "__main__"}
        exec(code, exec_globals)
        
        # 获取输出
        output = sys.stdout.getvalue()
        sys.stdout = old_stdout
        
        return f"✅ 执行成功\n\n输出:\n{output}" if output else "✅ 执行成功（无输出）"
    except Exception as e:
        import traceback
        sys.stdout = old_stdout
        return f"❌ 执行错误:\n{traceback.format_exc()}"

@tool
def execute_shell(command: str, timeout: int = 60) -> str:
    """
    执行Shell命令。用于运行npm、git、docker等命令行工具。
    
    ⚠️ 安全警告：只执行可信命令，不要执行 rm -rf / 等危险操作。
    
    使用场景：
    - 安装依赖 (npm install, pip install)
    - Git操作 (git status, git commit)
    - 运行测试
    - Docker操作
    
    示例：
    - execute_shell("npm install")
    - execute_shell("git status")
    """
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        
        output = []
        if result.stdout:
            output.append(f"📤 标准输出:\n{result.stdout}")
        if result.stderr:
            output.append(f"📥 标准错误:\n{result.stderr}")
        if result.returncode != 0:
            output.append(f"⚠️ 退出码: {result.returncode}")
        
        return "\n".join(output) if output else "✅ 命令执行成功（无输出）"
    except subprocess.TimeoutExpired:
        return f"❌ 命令执行超时（{timeout}秒）"
    except Exception as e:
        return f"❌ 执行失败: {str(e)}"

# ============ 3. 搜索工具 ============
@tool
def search_web(query: str, num_results: int = 5) -> str:
    """
    搜索互联网获取最新信息。
    
    使用场景：
    - 查找技术文档
    - 搜索错误解决方案
    - 获取最新资讯
    
    示例：
    - search_web("Python async await best practices")
    - search_web("React 19 new features")
    """
    # 实际实现连接搜索API
    # 这里用模拟返回
    return f"""
搜索结果: "{query}"
1. 示例链接1 - 描述...
2. 示例链接2 - 描述...
3. 示例链接3 - 描述...
"""

@tool
def search_code(query: str, language: str = "python") -> str:
    """
    搜索代码示例。用于查找特定功能的代码实现。
    
    使用场景：
    - 查找API用法
    - 学习最佳实践
    - 找到错误修复方法
    
    示例：
    - search_code("read file async", "python")
    - search_code("docker compose nginx", "yaml")
    """
    # 实际实现连接代码搜索API
    return f"""
代码示例搜索: "{query}" (语言: {language})
找到以下相关代码...
"""

# ============ 注册所有工具 ============
dev_tools = [
    write_file,
    read_file,
    list_directory,
    execute_python,
    execute_shell,
    search_web,
    search_code,
]

# 工具描述汇总（用于给模型选择）
DEV_TOOL_DESCRIPTIONS = """
=== AI开发助手工具集 ===

【文件操作】
- write_file: 写入或追加文件
- read_file: 读取文件内容
- list_directory: 列出目录内容

【代码执行】
- execute_python: 执行Python代码
- execute_shell: 执行Shell命令

【搜索】
- search_web: 搜索互联网
- search_code: 搜索代码示例

当你需要：
- 创建或修改文件 → 用 write_file
- 查看文件内容 → 用 read_file
- 了解目录结构 → 用 list_directory
- 测试代码 → 用 execute_python
- 运行命令行工具 → 用 execute_shell
- 查资料或文档 → 用 search_web
- 找代码示例 → 用 search_code
"""
```

### 工具安全：沙箱执行、权限控制

工具调用，安全是大事。你不会想让Agent执行`rm -rf /`或者把你的密码发到外网吧？

**1. 沙箱执行**

```python
# 安全的代码执行环境
import subprocess
import resource
import os

class SafeSandbox:
    """安全的代码执行沙箱"""
    
    @staticmethod
    def execute_python(code: str, timeout: int = 10) -> dict:
        """限制CPU、内存、执行时间的Python执行"""
        
        # 设置资源限制
        def set_limits():
            # 限制CPU时间（秒）
            resource.setrlimit(resource.RLIMIT_CPU, (timeout, timeout))
            # 限制内存（100MB）
            resource.setrlimit(resource.RLIMIT_AS, (100 * 1024 * 1024, 100 * 1024 * 1024))
            # 禁止创建新进程
            resource.setrlimit(resource.RLIMIT_NPROC, (0, 0))
        
        try:
            result = subprocess.run(
                ["python3", "-c", code],
                capture_output=True,
                text=True,
                timeout=timeout,
                preexec_fn=set_limits
            )
            return {
                "success": True,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "returncode": result.returncode
            }
        except subprocess.TimeoutExpired:
            return {"success": False, "error": "执行超时"}
        except Exception as e:
            return {"success": False, "error": str(e)}

# Shell命令白名单
ALLOWED_COMMANDS = {
    "git": ["status", "diff", "log", "branch", "checkout", "add", "commit", "pull", "push"],
    "npm": ["install", "run", "test", "build"],
    "pip": ["install", "list", "show", "freeze"],
    "docker": ["ps", "images", "logs", "build"],
    "ls": [],  # 不带参数
    "cat": [],  # 不带参数
    "head": [],  # 不带参数
    "grep": [],
}

def safe_execute_shell(command: str) -> dict:
    """安全的Shell执行（白名单+参数限制）"""
    
    parts = command.strip().split()
    if not parts:
        return {"success": False, "error": "空命令"}
    
    cmd = parts[0]
    args = parts[1:]
    
    # 检查命令是否在白名单
    if cmd not in ALLOWED_COMMANDS:
        return {"success": False, "error": f"命令 '{cmd}' 不在白名单中"}
    
    # 检查参数
    allowed_args = ALLOWED_COMMANDS[cmd]
    if allowed_args and args and args[0] not in allowed_args:
        return {"success": False, "error": f"参数 '{args[0]}' 不被允许"}
    
    # 危险命令检查
    dangerous_patterns = ["rm -rf", ">", "|", ";", "&", "$(", "`"]
    if any(p in command for p in dangerous_patterns):
        return {"success": False, "error": "命令包含危险模式"}
    
    # 执行
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=30
        )
        return {
            "success": result.returncode == 0,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode
        }
    except Exception as e:
        return {"success": False, "error": str(e)}
```

**2. 权限控制**

```python
# 工具调用权限系统
from enum import Enum
from typing import Set

class Permission(Enum):
    READ_FILE = "read_file"
    WRITE_FILE = "write_file"
    EXECUTE_CODE = "execute_code"
    EXECUTE_SHELL = "execute_shell"
    ACCESS_NETWORK = "access_network"
    SEND_MESSAGE = "send_message"

class ToolPermissionManager:
    """工具权限管理器"""
    
    def __init__(self):
        # 默认权限配置
        self.role_permissions = {
            "developer": {
                Permission.READ_FILE,
                Permission.WRITE_FILE,
                Permission.EXECUTE_CODE,
                Permission.EXECUTE_SHELL,
                Permission.ACCESS_NETWORK,
            },
            "reader": {
                Permission.READ_FILE,
                Permission.ACCESS_NETWORK,
            },
            "restricted": {
                Permission.READ_FILE,
            },
        }
        
        self.current_role = "developer"
    
    def set_role(self, role: str):
        """设置当前角色"""
        if role in self.role_permissions:
            self.current_role = role
    
    def check_permission(self, permission: Permission) -> bool:
        """检查是否有权限"""
        return permission in self.role_permissions.get(self.current_role, set())
    
    def check_tool_permission(self, tool_name: str) -> bool:
        """检查工具权限"""
        tool_permission_map = {
            "read_file": Permission.READ_FILE,
            "write_file": Permission.WRITE_FILE,
            "execute_python": Permission.EXECUTE_CODE,
            "execute_shell": Permission.EXECUTE_SHELL,
            "search_web": Permission.ACCESS_NETWORK,
            "send_email": Permission.SEND_MESSAGE,
        }
        
        perm = tool_permission_map.get(tool_name)
        if not perm:
            return True  # 未定义的工具默认允许
        
        return self.check_permission(perm)

# 使用示例
perm_manager = ToolPermissionManager()

def execute_with_permission(tool_name: str, *args, **kwargs):
    """带权限检查的工具执行"""
    
    if not perm_manager.check_tool_permission(tool_name):
        return {"error": f"没有执行 {tool_name} 的权限"}
    
    # 执行工具
    return actual_tool_execution(tool_name, *args, **kwargs)
```

---

## 7.4 规划与推理：ReAct完整追踪 + LangGraph 2026实战

### 为什么Agent需要"规划"？

当你让Agent完成一个复杂任务时，它不能只靠"直觉"——它需要：

1. **理解目标**：我要达成什么？
2. **分解任务**：这个目标可以分成哪几步？
3. **制定计划**：先做什么，后做什么？
4. **执行验证**：每一步做对了没有？
5. **动态调整**：走不通了怎么办？

这就是"规划"的价值。

### ReAct模式：边想边做（完整debug级追踪）

ReAct = Reason + Act，核心理念是：AI在执行过程中，不仅要"做"，还要"想"。每做一个动作前，先说出自己在想什么。

**循环流程：**
```
Thought（想）→ Action（做）→ Observation（观察结果）→ Thought（想）→ ...
```

为什么有效？
- 强制展示思考过程，减少"跳步"错误
- 让AI能够"自我纠正"
- 每一步可追踪，方便调试

```python
# ============ 完整ReAct Agent（debug级追踪）============
import json
import time
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Callable
from enum import Enum
from datetime import datetime

class StepStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    SKIPPED = "skipped"

@dataclass
class ExecutionStep:
    """执行步骤记录"""
    step_number: int
    thought: str = ""
    action: str = ""
    action_input: Any = None
    observation: Any = None
    status: StepStatus = StepStatus.PENDING
    error: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    duration_ms: Optional[float] = None
    
    def to_dict(self) -> dict:
        return {
            "step": self.step_number,
            "thought": self.thought,
            "action": self.action,
            "action_input": str(self.action_input)[:200] if self.action_input else None,
            "observation": str(self.observation)[:200] if self.observation else None,
            "status": self.status.value,
            "error": self.error,
            "duration_ms": self.duration_ms
        }

class ReActAgent:
    """带完整调试追踪的ReAct Agent"""
    
    def __init__(
        self,
        llm: Any,
        tools: Dict[str, Callable],
        max_iterations: int = 15,
        max_token_budget: Optional[int] = None
    ):
        self.llm = llm
        self.tools = tools
        self.max_iterations = max_iterations
        self.max_token_budget = max_token_budget
        self.total_tokens_used = 0
        self.total_cost = 0.0
        
        # 执行追踪
        self.execution_log: List[ExecutionStep] = []
        self.current_step: Optional[ExecutionStep] = None
    
    async def run(self, goal: str, initial_input: Any = None) -> Dict[str, Any]:
        """运行ReAct Agent"""
        
        print(f"\n{'='*60}")
        print(f"🚀 启动 ReAct Agent")
        print(f"目标: {goal}")
        print(f"可用工具: {list(self.tools.keys())}")
        print(f"{'='*60}\n")
        
        # 初始化状态
        context = {
            "goal": goal,
            "input": initial_input,
            "tool_results": [],
            "history": []
        }
        
        for i in range(self.max_iterations):
            step = ExecutionStep(step_number=i + 1)
            step.start_time = datetime.now().isoformat()
            self.current_step = step
            self.execution_log.append(step)
            
            print(f"\n📍 步骤 {i + 1}/{self.max_iterations}")
            print("-" * 40)
            
            try:
                # 1. Thought：推理下一步
                step.status = StepStatus.RUNNING
                decision = await self._reason(context)
                
                step.thought = decision.get("thought", "")
                step.action = decision.get("action", "")
                step.action_input = decision.get("action_input")
                
                print(f"💭 思考: {step.thought[:150]}...")
                print(f"🎯 行动: {step.action}({str(step.action_input)[:50]}...)")
                
                # 2. 检查是否结束
                if step.action == "FINISH":
                    step.status = StepStatus.SUCCESS
                    step.end_time = datetime.now().isoformat()
                    print(f"\n✅ 任务完成!")
                    return {
                        "success": True,
                        "result": decision.get("action_input"),
                        "steps": [s.to_dict() for s in self.execution_log],
                        "total_steps": len(self.execution_log),
                        "total_tokens": self.total_tokens_used,
                        "total_cost": self.total_cost
                    }
                
                # 3. Action：执行工具
                result = await self._act(step.action, step.action_input)
                step.observation = result
                
                if result.get("status") == "error":
                    step.status = StepStatus.FAILED
                    step.error = result.get("message", "Unknown error")
                    print(f"❌ 执行失败: {step.error}")
                    
                    # 失败后重试或继续
                    if i >= self.max_iterations - 1:
                        break
                    continue
                
                print(f"📥 观察: {str(result.get('observation', ''))[:100]}...")
                
                # 4. 更新上下文
                context["tool_results"].append({
                    "tool": step.action,
                    "result": result.get("observation")
                })
                context["history"].append({
                    "thought": step.thought,
                    "action": step.action,
                    "observation": result.get("observation")
                })
                
                step.status = StepStatus.SUCCESS
                
                # 5. 检查Token预算
                if self.max_token_budget and self.total_tokens_used > self.max_token_budget:
                    print(f"\n⚠️ 超过Token预算 ({self.total_tokens_used} > {self.max_token_budget})")
                    break
                
            except Exception as e:
                step.status = StepStatus.FAILED
                step.error = str(e)
                print(f"❌ 异常: {step.error}")
            
            finally:
                step.end_time = datetime.now().isoformat()
                if step.start_time and step.end_time:
                    start = datetime.fromisoformat(step.start_time)
                    end = datetime.fromisoformat(step.end_time)
                    step.duration_ms = (end - start).total_seconds() * 1000
        
        # 超时或达到最大迭代
        return {
            "success": False,
            "result": None,
            "reason": f"达到最大迭代次数 ({self.max_iterations})",
            "steps": [s.to_dict() for s in self.execution_log],
            "total_steps": len(self.execution_log)
        }
    
    async def _reason(self, context: Dict) -> Dict[str, Any]:
        """调用LLM进行推理"""
        
        tools_description = self._format_tools()
        history_text = self._format_history(context["history"])
        
        prompt = f"""你是一个AI助手，正在帮助用户完成任务。

当前目标：{context['goal']}

已执行步骤：
{history_text}

可用工具：
{tools_description}

请按以下JSON格式回答（不要输出其他内容）：
{{
    "thought": "你现在的思考和分析",
    "action": "工具名称（不在可用列表中则填FINISH）",
    "action_input": "工具参数（JSON格式字符串）"
}}

规则：
- 如果任务已完成或无法完成，action填"FINISH"，action_input填最终结果
- 只选择一个工具调用
- 思考要简洁明了
"""
        
        response = self.llm.invoke(prompt)
        self.total_tokens_used += response.usage.total_tokens if hasattr(response, 'usage') else 0
        
        # 解析JSON响应
        try:
            return json.loads(response.content)
        except:
            return {
                "thought": response.content,
                "action": "FINISH",
                "action_input": response.content
            }
    
    async def _act(self, action: str, action_input: Any) -> Dict[str, Any]:
        """执行工具"""
        
        if action == "FINISH":
            return {"status": "success", "observation": action_input}
        
        tool = self.tools.get(action)
        if not tool:
            return {"status": "error", "message": f"未知工具: {action}"}
        
        try:
            # 解析参数
            if isinstance(action_input, str):
                args = json.loads(action_input) if action_input != "-" else {}
            else:
                args = action_input or {}
            
            # 执行
            if hasattr(tool, "__call__"):
                result = tool(**args)
            else:
                result = tool.invoke(args)
            
            return {"status": "success", "observation": result}
            
        except json.JSONDecodeError as e:
            return {"status": "error", "message": f"参数解析失败: {e}"}
        except TypeError as e:
            return {"status": "error", "message": f"参数类型错误: {e}"}
        except Exception as e:
            return {"status": "error", "message": f"执行失败: {e}"}
    
    def _format_tools(self) -> str:
        """格式化工具列表"""
        lines = []
        for name, tool in self.tools.items():
            desc = getattr(tool, "description", "无描述")
            args = getattr(tool, "parameters", {})
            lines.append(f"- {name}: {desc}")
        return "\n".join(lines) if lines else "无"
    
    def _format_history(self, history: List[Dict]) -> str:
        """格式化执行历史"""
        if not history:
            return "（暂无）"
        
        lines = []
        for i, h in enumerate(history[-5:], 1):  # 只显示最近5步
            lines.append(f"{i}. [{h['action']}] {h['observation'][:100]}...")
        return "\n".join(lines)

# 使用示例
async def demo_react():
    """ReAct Agent演示"""
    
    # 模拟LLM
    class MockLLM:
        def invoke(self, prompt):
            class Response:
                content = '{"thought": "思考内容", "action": "search", "action_input": "{}"}'
                usage = type('obj', (object,), {'total_tokens': 100})()
            return Response()
    
    # 模拟工具
    tools = {
        "search": lambda query: f"搜索'{query}'的结果：xxx",
        "calculate": lambda expr: eval(expr),
        "read_file": lambda path: f"文件{path}的内容...",
    }
    
    agent = ReActAgent(
        llm=MockLLM(),
        tools=tools,
        max_iterations=10
    )
    
    result = await agent.run("帮我分析特斯拉最近的股价")
    print(json.dumps(result, indent=2, ensure_ascii=False))

# 运行演示
# asyncio.run(demo_react())
```

### LangGraph工作流实战（2026年Agent开发标配）

LangGraph是LangChain团队出品的专门用于构建复杂Agent工作流的库。相比于LangChain Agent，LangGraph的优势在于：

1. **状态管理更清晰**：用StateGraph定义状态和状态转换
2. **流程控制更灵活**：支持条件边、并行节点、人在回路
3. **可持久化**：内置checkpointing，支持暂停和恢复
4. **调试方便**：每一步状态都可见

**为什么2026年必须学LangGraph？**

因为2025-2026年的Agent应用，复杂度已经超出了"一个循环"能处理的范围。你需要：
- 条件分支（如果A则走这条线，如果B则走那条线）
- 并行执行（同时执行多个任务）
- 人工审核（某些步骤需要人确认）
- 状态持久化（任务中途断了能恢复）

这些，LangGraph都能优雅地处理。

#### StateGraph基础

```python
# ============ LangGraph StateGraph 基础 ============
from langgraph.graph import StateGraph, END, START
from langgraph.prebuilt import create_react_agent
from typing import TypedDict, List, Annotated
from langchain_openai import ChatOpenAI
import operator

# 1. 定义状态
class ResearchState(TypedDict):
    """研究报告生成Agent的状态"""
    query: str                      # 用户查询
    search_results: List[str]        # 搜索结果
    analysis: str                    # 分析结果
    report: str                      # 最终报告
    feedback: str                    # 用户反馈
    iteration: int                   # 迭代次数
    quality_score: float             # 质量评分
    needs_revision: bool             # 是否需要修改
    approved: bool                   # 是否已批准

# 2. 创建图
workflow = StateGraph(ResearchState)

# 3. 定义节点函数
def search_node(state: ResearchState) -> dict:
    """搜索节点"""
    print(f"🔍 搜索: {state['query']}")
    # 实际实现调用搜索API
    results = [f"关于'{state['query']}'的相关信息..."]
    return {"search_results": results, "iteration": state.get("iteration", 0) + 1}

def analyze_node(state: ResearchState) -> dict:
    """分析节点"""
    print(f"📊 分析搜索结果...")
    # 实际实现调用LLM分析
    analysis = f"基于搜索结果的深度分析..."
    return {"analysis": analysis}

def write_report_node(state: ResearchState) -> dict:
    """写报告节点"""
    print(f"📝 撰写报告...")
    report = f"""
# {state['query']}研究报告

## 搜索结果摘要
{chr(10).join(state.get('search_results', []))}

## 分析
{state.get('analysis', '')}

---
报告生成时间：{pd.Timestamp.now().strftime('%Y-%m-%d %H:%M')}
"""
    return {"report": report}

def review_node(state: ResearchState) -> dict:
    """审核节点"""
    print(f"👀 审核报告...")
    # 模拟评分
    score = 0.8 if len(state.get('report', '')) > 100 else 0.5
    needs_revision = score < 0.7
    
    feedback = "报告质量良好" if not needs_revision else "报告需要补充更多细节"
    
    return {
        "quality_score": score,
        "needs_revision": needs_revision,
        "feedback": feedback,
        "approved": not needs_revision
    }

def revision_node(state: ResearchState) -> dict:
    """修改节点"""
    print(f"✏️ 根据反馈修改报告...")
    revision_note = f"\n\n---\n根据反馈修改（{state['iteration']}次迭代）\n{state['feedback']}"
    updated_report = state.get('report', '') + revision_note
    return {"report": updated_report, "needs_revision": False}

# 4. 添加节点
workflow.add_node("search", search_node)
workflow.add_node("analyze", analyze_node)
workflow.add_node("write_report", write_report_node)
workflow.add_node("review", review_node)
workflow.add_node("revision", revision_node)

# 5. 设置入口和出口
workflow.set_entry_point("search")
workflow.add_edge("search", "analyze")
workflow.add_edge("analyze", "write_report")
workflow.add_edge("write_report", "review")

# 6. 条件边：审核后的分支
def should_continue(state: ResearchState) -> str:
    """决定是否继续循环"""
    if state.get("approved", False):
        return "end"
    elif state.get("iteration", 0) >= 3:
        # 最多迭代3次
        return "end"
    else:
        return "revise"

workflow.add_conditional_edges(
    "review",
    should_continue,
    {
        "revise": "revision",
        "end": END
    }
)

workflow.add_edge("revision", "search")  # 修改后重新搜索

# 7. 编译图
app = workflow.compile()

# 8. 运行
result = app.invoke({
    "query": "特斯拉2026年Q1财报分析",
    "search_results": [],
    "analysis": "",
    "report": "",
    "feedback": "",
    "iteration": 0,
    "quality_score": 0.0,
    "needs_revision": False,
    "approved": False
})

print("\n" + "="*60)
print("📄 最终报告:")
print(result["report"])
```

#### 条件边、并行节点

```python
# ============ LangGraph 条件边 + 并行执行 ============
from langgraph.graph import StateGraph, END, START
from typing import TypedDict, List
import asyncio

class ComplexTaskState(TypedDict):
    """复杂任务状态"""
    task: str
    # 并行任务结果
    web_search: List[str]
    doc_analysis: str
    code_review: str
    # 汇总
    summary: str
    # 人工审核
    human_approved: bool
    revision_notes: str

def web_search_node(state: ComplexTaskState) -> dict:
    """网页搜索（模拟）"""
    print("🌐 执行网页搜索...")
    return {"web_search": ["搜索结果1", "搜索结果2", "搜索结果3"]}

def doc_analysis_node(state: ComplexTaskState) -> dict:
    """文档分析（模拟）"""
    print("📄 执行文档分析...")
    return {"doc_analysis": "文档分析结果..."}

def code_review_node(state: ComplexTaskState) -> dict:
    """代码审查（模拟）"""
    print("🔍 执行代码审查...")
    return {"code_review": "代码审查结果..."}

def parallel_wrapper(state: ComplexTaskState) -> dict:
    """并行执行多个节点"""
    # 使用asyncio并行执行
    results = asyncio.run(asyncio.gather(
        web_search_node(state),
        doc_analysis_node(state),
        code_review_node(state)
    ))
    
    combined = {}
    for r in results:
        combined.update(r)
    return combined

def summarize_node(state: ComplexTaskState) -> dict:
    """汇总结果"""
    print("📋 汇总所有结果...")
    summary = f"""
## 任务汇总

### 网页搜索结果
{chr(10).join(state.get('web_search', []))}

### 文档分析
{state.get('doc_analysis', '')}

### 代码审查
{state.get('code_review', '')}

---
所有子任务已完成，等待人工审核。
"""
    return {"summary": summary}

def human_review_node(state: ComplexTaskState) -> dict:
    """人工审核节点（人在回路）"""
    print("\n" + "="*60)
    print("👤 需要人工审核!")
    print(f"任务摘要:\n{state.get('summary', '')[:500]}")
    print("="*60 + "\n")
    
    # 实际应用中，这里会暂停等待用户输入
    # 这里用模拟值
    return {
        "human_approved": True,  # 模拟用户批准
        "revision_notes": ""
    }

def final_delivery_node(state: ComplexTaskState) -> dict:
    """最终交付"""
    print("✅ 任务完成，生成最终交付物...")
    return {
        "summary": state.get("summary", "") + "\n\n## 最终交付\n✅ 已审核通过"
    }

# 构建图
workflow = StateGraph(ComplexTaskState)

# 添加节点
workflow.add_node("parallel_tasks", parallel_wrapper)
workflow.add_node("summarize", summarize_node)
workflow.add_node("human_review", human_review_node)
workflow.add_node("final_delivery", final_delivery_node)

# 设置流程
workflow.set_entry_point("parallel_tasks")
workflow.add_edge("parallel_tasks", "summarize")
workflow.add_edge("summarize", "human_review")

# 条件边：审核结果决定下一步
def after_review(state: ComplexTaskState) -> str:
    if state.get("human_approved"):
        return "approved"
    else:
        return "needs_revision"

workflow.add_conditional_edges(
    "human_review",
    after_review,
    {
        "approved": "final_delivery",
        "needs_revision": "parallel_tasks"  # 重新执行
    }
)

workflow.add_edge("final_delivery", END)

# 编译
app = workflow.compile()

# 运行
result = app.invoke({
    "task": "完成XX项目的技术评估",
    "web_search": [],
    "doc_analysis": "",
    "code_review": "",
    "summary": "",
    "human_approved": False,
    "revision_notes": ""
})

print("\n最终结果:", result["summary"][:200], "...")
```

#### 人在回路（Human-in-the-loop）

```python
# ============ LangGraph 人在回路完整实现 ============
from langgraph.graph import StateGraph, END, START, Interrupt
from langgraph.checkpoint.memory import MemorySaver
from typing import Literal
import operator

class HumanInLoopState(TypedDict):
    """带人工审核的状态"""
    user_request: str
    draft_content: str
    user_feedback: str
    revision_count: int
    final_output: str

def draft_node(state: HumanInLoopState) -> dict:
    """生成初稿"""
    print("📝 生成初稿...")
    draft = f"这是关于'{state['user_request']}'的初稿内容..."
    return {"draft_content": draft}

def human_review_node(state: HumanInLoopState) -> dict:
    """人工审核节点 - 这里会暂停等待用户输入"""
    print("\n" + "="*60)
    print("🔔 人工审核环节")
    print(f"内容:\n{state['draft_content']}")
    print("="*60)
    print("请输入反馈（输入'批准'完成审核）...")
    
    # 中断执行，等待用户输入
    # 在LangGraph中，这会暂停图执行
    raise Interrupt(value={
        "prompt": "请审核以上内容并提供反馈",
        "current_content": state["draft_content"]
    })

def revise_node(state: HumanInLoopState) -> dict:
    """根据反馈修改"""
    print(f"✏️ 根据反馈修改 (第{state['revision_count']}次)...")
    revision = f"\n\n--- 修订 {state['revision_count']} ---\n反馈: {state['user_feedback']}"
    updated_draft = state["draft_content"] + revision
    return {
        "draft_content": updated_draft,
        "revision_count": state["revision_count"] + 1
    }

def finalize_node(state: HumanInLoopState) -> dict:
    """最终定稿"""
    return {"final_output": state["draft_content"]}

# 构建图
workflow = StateGraph(HumanInLoopState)

workflow.add_node("draft", draft_node)
workflow.add_node("human_review", human_review_node)
workflow.add_node("revise", revise_node)
workflow.add_node("finalize", finalize_node)

workflow.set_entry_point("draft")
workflow.add_edge("draft", "human_review")

# 条件边：检查是否批准
def check_approval(state: HumanInLoopState) -> str:
    if "批准" in state.get("user_feedback", ""):
        return "approved"
    else:
        return "needs_revision"

workflow.add_conditional_edges(
    "human_review",
    check_approval,
    {
        "approved": "finalize",
        "needs_revision": "revise"
    }
)

workflow.add_edge("revise", "human_review")  # 修改后重新审核
workflow.add_edge("finalize", END)

# 使用MemorySaver支持暂停和恢复
checkpointer = MemorySaver()
app = workflow.compile(checkpointer=checkpointer)

# 模拟运行流程
async def run_with_human_loop():
    """带人工循环的运行"""
    
    config = {"configurable": {"thread_id": "1"}}
    
    # 第一轮：生成初稿并审核
    print("🚀 启动工作流...")
    
    try:
        # 运行到人工审核节点
        result = app.invoke(
            {
                "user_request": "撰写产品需求文档",
                "draft_content": "",
                "user_feedback": "",
                "revision_count": 0,
                "final_output": ""
            },
            config=config
        )
    except Interrupt as e:
        print(f"\n⏸️ 工作流暂停，等待人工输入...")
        interrupt_value = e.value
        print(f"中断信息: {interrupt_value}")
        
        # 模拟用户输入反馈
        user_input = "内容不错，但请补充技术实现方案"
        
        # 恢复执行，注入用户反馈
        result = app.invoke(
            {"user_feedback": user_input},
            config=config
        )
    
    print("\n✅ 最终输出:")
    print(result.get("final_output", result.get("draft_content", "")))

# asyncio.run(run_with_human_loop())
```

#### 完整案例：用LangGraph构建多步骤研究报告Agent

```python
# ============ LangGraph 多步骤研究报告Agent（生产级）============
from langgraph.graph import StateGraph, END, START
from langgraph.checkpoint.memory import MemorySaver
from langchain_openai import ChatOpenAI
from langchain_community.tools.tavily_search import TavilySearchResults
from typing import TypedDict, List, Optional, Annotated
import operator
from datetime import datetime
import json

# ============ 1. 定义状态 ============
class ResearchReportState(TypedDict):
    """研究报告Agent状态"""
    # 输入
    topic: str
    requirements: str
    
    # 中间状态
    search_queries: List[str]
    search_results: Annotated[List[dict], operator.add]
    outline: str
    sections: Annotated[List[dict], operator.add]  # 每个section的内容
    current_section: int
    
    # 审核相关
    review_comments: List[str]
    needs_revision: bool
    revision_round: int
    
    # 输出
    final_report: str
    metadata: dict

# ============ 2. 初始化工具 ============
# 搜索工具
tavily_tool = TavilySearchResults(max_results=5)

# LLM
llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0.7)

# ============ 3. 定义节点函数 ============
def generate_queries(state: ResearchReportState) -> dict:
    """生成搜索查询"""
    print(f"📋 生成搜索查询: {state['topic']}")
    
    prompt = f"""
用户需要撰写关于"{state['topic']}"的研究报告。
要求：{state['requirements']}

请生成3-5个搜索查询，用于收集相关信息。
每个查询应该覆盖报告的不同方面。

请以JSON数组格式输出：
["查询1", "查询2", ...]
"""
    
    response = llm.invoke(prompt)
    queries = json.loads(response.content)
    
    return {"search_queries": queries}

def search_web(state: ResearchReportState) -> dict:
    """执行搜索"""
    print(f"🔍 执行搜索，共 {len(state['search_queries'])} 个查询")
    
    all_results = []
    for query in state['search_queries']:
        try:
            results = tavily_tool.invoke(query)
            all_results.append({
                "query": query,
                "results": results,
                "timestamp": datetime.now().isoformat()
            })
            print(f"  ✅ {query}: {len(results)} 条结果")
        except Exception as e:
            print(f"  ❌ {query}: {str(e)}")
    
    return {"search_results": all_results}

def create_outline(state: ResearchReportState) -> dict:
    """创建报告大纲"""
    print(f"📝 创建报告大纲")
    
    # 汇总搜索结果
    summary_text = "\n".join([
        f"【{r['query']}】\n{chr(10).join([item.get('content', '')[:200] for item in r['results']])}"
        for r in state['search_results']
    ])
    
    prompt = f"""
基于以下搜索结果，为"{state['topic']}"研究报告创建大纲。

搜索摘要：
{summary_text[:3000]}

要求：
1. 大纲应该全面覆盖主题的各个方面
2. 每个章节应该有明确的主题
3. 考虑以下要求：{state['requirements']}

请以Markdown格式输出大纲。
"""
    
    outline = lll.invoke(prompt)
    
    return {
        "outline": outline.content,
        "current_section": 0,
        "sections": []
    }

def write_section(state: ResearchReportState) -> dict:
    """撰写章节"""
    current = state['current_section']
    sections = state.get('sections', [])
    outline = state['outline']
    
    # 解析大纲获取当前章节
    lines = outline.split('\n')
    section_headers = [l for l in lines if l.startswith('## ')]
    
    if current >= len(section_headers):
        return {"needs_revision": False}  # 所有章节已完成
    
    section_title = section_headers[current].replace('## ', '')
    print(f"✍️ 撰写章节 {current + 1}: {section_title}")
    
    # 获取相关搜索结果
    relevant_results = []
    for search_batch in state['search_results']:
        for item in search_batch.get('results', []):
            content = item.get('content', '')
            if section_title.lower() in content.lower() or state['topic'].lower() in content.lower():
                relevant_results.append(content)
    
    prompt = f"""
请撰写"{state['topic']}"研究报告的"{section_title}"章节。

参考信息：
{chr(10).join(relevant_results[:5])}

要求：
1. 内容详实，有深度
2. 引用可靠的参考资料
3. 符合学术或商业报告规范

请输出Markdown格式的章节内容。
"""
    
    section_content = llm.invoke(prompt)
    
    new_section = {
        "title": section_title,
        "content": section_content.content,
        "order": current + 1
    }
    
    return {
        "sections": [new_section],
        "current_section": current + 1
    }

def review_report(state: ResearchReportState) -> dict:
    """审核报告"""
    print(f"🔍 审核报告 (第 {state['revision_round'] + 1} 轮)")
    
    # 组装报告
    report_parts = [f"# {state['topic']}\n"]
    report_parts.append(f"\n*报告生成时间：{datetime.now().strftime('%Y-%m-%d %H:%M')}*\n")
    report_parts.append(f"\n## 大纲\n{state['outline']}\n")
    
    for section in sorted(state.get('sections', []), key=lambda x: x['order']):
        report_parts.append(f"\n## {section['title']}\n{section['content']}\n")
    
    full_report = "".join(report_parts)
    
    # 质量评估
    quality_prompt = f"""
请评估以下研究报告的质量：

{full_report[:2000]}...

评估维度：
1. 内容完整性
2. 信息准确性
3. 逻辑清晰度
4. 实用性

如果需要修改，返回JSON：
{{"needs_revision": true, "comments": ["问题1", "问题2"]}}

如果质量合格：
{{"needs_revision": false, "comments": []}}
"""
    
    quality_response = llm.invoke(quality_prompt)
    
    try:
        quality = json.loads(quality_response.content)
    except:
        quality = {"needs_revision": False, "comments": []}
    
    return {
        "final_report": full_report,
        "needs_revision": quality.get("needs_revision", False),
        "review_comments": quality.get("comments", []),
        "revision_round": state.get("revision_round", 0) + 1
    }

def revise_section(state: ResearchReportState) -> dict:
    """修改章节"""
    comments = state.get('review_comments', [])
    if not comments:
        return {}
    
    print(f"✏️ 根据反馈修改章节...")
    
    # 这里简化处理，实际应用中会更复杂
    revision_note = f"\n\n---\n*根据第{state['revision_round']}轮审核修改*\n"
    revision_note += chr(10).join([f"- {c}" for c in comments])
    
    return {
        "sections": [{
            "title": "补充说明",
            "content": revision_note,
            "order": 999
        }]
    }

# ============ 4. 构建图 ============
workflow = StateGraph(ResearchReportState)

# 添加节点
workflow.add_node("generate_queries", generate_queries)
workflow.add_node("search_web", search_web)
workflow.add_node("create_outline", create_outline)
workflow.add_node("write_section", write_section)
workflow.add_node("review_report", review_report)
workflow.add_node("revise_section", revise_section)

# 设置入口
workflow.set_entry_point("generate_queries")

# 设置流程
workflow.add_edge("generate_queries", "search_web")
workflow.add_edge("search_web", "create_outline")
workflow.add_edge("create_outline", "write_section")

# 条件边：是否所有章节已完成
def should_write_more(state: ResearchReportState) -> str:
    total_sections = len([l for l in state['outline'].split('\n') if l.startswith('## ')])
    current = state['current_section']
    
    if current >= total_sections:
        return "done"
    else:
        return "continue"

workflow.add_conditional_edges(
    "write_section",
    should_write_more,
    {
        "continue": "write_section",  # 继续写下一节
        "done": "review_report"       # 所有章节完成，进入审核
    }
)

# 审核后的条件边
def after_review(state: ResearchReportState) -> str:
    max_rounds = 3
    
    if not state.get("needs_revision", False):
        return "end"
    elif state.get("revision_round", 0) >= max_rounds:
        print(f"⚠️ 达到最大修改轮次 ({max_rounds})，强制结束")
        return "end"
    else:
        return "revise"

workflow.add_conditional_edges(
    "review_report",
    after_review,
    {
        "revise": "revise_section",
        "end": END
    }
)

workflow.add_edge("revise_section", "write_section")  # 修改后重新写入

# ============ 5. 编译和运行 ============
checkpointer = MemorySaver()
app = workflow.compile(checkpointer=checkpointer)

# 运行示例
async def run_research():
    """运行研究报告生成"""
    
    config = {"configurable": {"thread_id": "research-001"}}
    
    initial_state = {
        "topic": "2026年AI Agent发展趋势分析",
        "requirements": "涵盖技术进步、市场应用、主要玩家、挑战与机遇",
        "search_queries": [],
        "search_results": [],
        "outline": "",
        "sections": [],
        "current_section": 0,
        "review_comments": [],
        "needs_revision": False,
        "revision_round": 0,
        "final_report": "",
        "metadata": {"created_at": datetime.now().isoformat()}
    }
    
    print("🚀 启动研究报告生成Agent...")
    print("="*60)
    
    result = app.invoke(initial_state, config=config)
    
    print("\n" + "="*60)
    print("✅ 研究报告生成完成!")
    print(f"📊 统计:")
    print(f"   - 搜索查询: {len(result['search_queries'])} 个")
    print(f"   - 搜索批次: {len(result['search_results'])} 次")
    print(f"   - 章节数量: {len(result['sections'])} 个")
    print(f"   - 修改轮次: {result['revision_round']} 轮")
    print(f"   - 最终字数: {len(result['final_report'])} 字符")
    print("="*60)
    
    return result

# asyncio.run(run_research())
```

### Plan-and-Execute：给完整实现

Plan-and-Execute的核心思想是"谋定而后动"：先让模型把整个任务分解成步骤，制定执行计划，然后再按计划逐个执行。

```python
# ============ Plan-and-Execute 完整实现 ============
from typing import List, TypedDict, Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum
import json
import asyncio

class StepStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"

@dataclass
class PlanStep:
    """计划步骤"""
    order: int
    description: str
    tool: Optional[str] = None
    tool_args: Optional[Dict] = None
    status: StepStatus = StepStatus.PENDING
    result: Any = None
    error: Optional[str] = None
    reasoning: str = ""

class PlanExecuteAgent:
    """Plan-and-Execute Agent"""
    
    def __init__(self, llm, tools: Dict[str, callable], max_plan_retries: int = 3):
        self.llm = llm
        self.tools = tools
        self.max_plan_retries = max_plan_retries
    
    async def run(self, goal: str) -> Dict[str, Any]:
        """运行Plan-and-Execute"""
        
        print(f"\n{'='*60}")
        print(f"🎯 Plan-and-Execute Agent")
        print(f"目标: {goal}")
        print(f"{'='*60}\n")
        
        # ============ PLAN阶段 ============
        plan = await self._create_plan(goal)
        
        if not plan:
            return {"success": False, "error": "无法创建计划"}
        
        print(f"\n📋 执行计划（共 {len(plan)} 个步骤）:")
        for step in plan:
            print(f"  {step.order}. {step.description}")
            if step.tool:
                print(f"     → 工具: {step.tool}")
        print()
        
        # ============ EXECUTE阶段 ============
        all_results = []
        
        for step in plan:
            print(f"\n🔧 执行步骤 {step.order}: {step.description}")
            step.status = StepStatus.IN_PROGRESS
            
            try:
                if step.tool and step.tool in self.tools:
                    # 调用工具
                    tool_func = self.tools[step.tool]
                    args = step.tool_args or {}
                    
                    if asyncio.iscoroutinefunction(tool_func):
                        result = await tool_func(**args)
                    else:
                        result = tool_func(**args)
                    
                    step.result = result
                    step.status = StepStatus.COMPLETED
                    print(f"   ✅ 完成")
                    
                else:
                    # 纯推理步骤（调用LLM）
                    reasoning_result = await self._execute_reasoning_step(step, all_results)
                    step.result = reasoning_result
                    step.status = StepStatus.COMPLETED
                    print(f"   ✅ 完成")
                
                all_results.append({
                    "step": step.order,
                    "description": step.description,
                    "result": step.result
                })
                
            except Exception as e:
                step.status = StepStatus.FAILED
                step.error = str(e)
                print(f"   ❌ 失败: {e}")
                
                # 失败后的处理策略
                if step.order < len(plan):
                    # 尝试跳过失败步骤继续执行
                    print(f"   ⚠️ 跳过此步骤，继续执行...")
                    step.status = StepStatus.SKIPPED
                else:
                    # 最后一步失败，整体失败
                    return {
                        "success": False,
                        "error": f"关键步骤失败: {step.description}",
                        "partial_results": all_results
                    }
        
        # ============ 汇总结果 ============
        print(f"\n{'='*60}")
        print(f"📊 执行完成")
        print(f"✅ 成功: {sum(1 for s in plan if s.status == StepStatus.COMPLETED)}/{len(plan)}")
        print(f"⏭️ 跳过: {sum(1 for s in plan if s.status == StepStatus.SKIPPED)}")
        print(f"❌ 失败: {sum(1 for s in plan if s.status == StepStatus.FAILED)}")
        print(f"{'='*60}\n")
        
        final_output = await self._summarize_results(goal, all_results)
        
        return {
            "success": True,
            "goal": goal,
            "plan": [
                {
                    "order": s.order,
                    "description": s.description,
                    "tool": s.tool,
                    "status": s.status.value,
                    "result": str(s.result)[:200] if s.result else None
                }
                for s in plan
            ],
            "final_output": final_output
        }
    
    async def _create_plan(self, goal: str) -> List[PlanStep]:
        """创建执行计划"""
        
        prompt = f"""
用户目标：{goal}

请将这个目标分解成具体的执行步骤。

要求：
1. 每个步骤应该清晰、可执行
2. 步骤之间有明确的依赖关系
3. 考虑可能的异常情况和处理方式
4. 如果某步骤需要调用工具，请指定工具名称

请输出JSON格式的计划：
{{
    "steps": [
        {{
            "order": 1,
            "description": "步骤描述",
            "tool": "工具名称（如果没有则填null）",
            "tool_args": {{"参数名": "参数值"}}（如果没有则填{{}}）,
            "reasoning": "为什么需要这个步骤"
        }},
        ...
    ],
    "estimated_difficulty": "简单/中等/复杂"
}}
"""
        
        for attempt in range(self.max_plan_retries):
            try:
                response = self.llm.invoke(prompt)
                plan_data = json.loads(response.content)
                
                steps = [
                    PlanStep(
                        order=s["order"],
                        description=s["description"],
                        tool=s.get("tool"),
                        tool_args=s.get("tool_args", {}),
                        reasoning=s.get("reasoning", "")
                    )
                    for s in plan_data["steps"]
                ]
                
                return sorted(steps, key=lambda x: x.order)
                
            except json.JSONDecodeError as e:
                print(f"⚠️ 计划解析失败（尝试 {attempt + 1}/{self.max_plan_retries}）")
                if attempt == self.max_plan_retries - 1:
                    return []
        
        return []
    
    async def _execute_reasoning_step(self, step: PlanStep, context: List[dict]) -> str:
        """执行纯推理步骤"""
        
        context_text = "\n".join([
            f"[步骤{i['step']}] {i['description']}: {str(i['result'])[:200]}"
            for i in context
        ])
        
        prompt = f"""
请完成以下任务步骤：

任务背景：{step.reasoning}

当前步骤：{step.description}

已知结果：
{context_text or "（暂无）"}

请输出任务结果。
"""
        
        response = self.llm.invoke(prompt)
        return response.content
    
    async def _summarize_results(self, goal: str, results: List[dict]) -> str:
        """汇总所有步骤结果"""
        
        results_text = "\n".join([
            f"### 步骤 {r['step']}: {r['description']}\n{r['result']}"
            for r in results
        ])
        
        prompt = f"""
原始目标：{goal}

执行过程：
{results_text}

请根据执行结果，给出完整的最终回答。回答应该：
1. 直接回应原始目标
2. 综合各步骤的执行结果
3. 格式清晰，语言流畅
"""
        
        response = self.llm.invoke(prompt)
        return response.content

# 使用示例
async def demo_plan_execute():
    """Plan-and-Execute演示"""
    
    # 模拟LLM
    class MockLLM:
        def invoke(self, prompt):
            class Response:
                content = '{"steps": [{"order": 1, "description": "搜索信息", "tool": "search", "tool_args": {"query": "AI"}, "reasoning": "需要先收集信息"}, {"order": 2, "description": "分析数据", "tool": null, "tool_args": {}, "reasoning": "基于搜索结果分析"}], "estimated_difficulty": "medium"}'
            return Response()
    
    # 模拟工具
    tools = {
        "search": lambda query: f"搜索'{query}'的结果..."
    }
    
    agent = PlanExecuteAgent(llm=MockLLM(), tools=tools)
    result = await agent.run("分析AI发展趋势")
    
    print("\n最终结果:")
    print(result["final_output"])

# asyncio.run(demo_plan_execute())
```

### 两种模式对比

| 维度 | ReAct | Plan-and-Execute | LangGraph StateGraph |
|------|-------|-------------------|---------------------|
| **适用场景** | 开放式、探索性任务 | 目标明确、步骤清晰的任务 | 复杂工作流、多分支 |
| **优点** | 灵活、实时调整 | 全局视角、执行可控 | 状态管理清晰、支持持久化 |
| **缺点** | 可能走弯路 | 前期规划消耗多 | 学习曲线较陡 |
| **Token消耗** | 逐步消耗 | 前期规划消耗多 | 可优化（checkpoint） |
| **调试难度** | 容易（每步可见） | 容易（按计划执行） | 容易（状态追踪） |
| **2026年推荐** | ✅ 简单任务 | ✅ 中等复杂度 | ✅ 复杂生产系统 |

**实战建议**：
- 简单任务用ReAct
- 中等复杂度用Plan-and-Execute
- 复杂生产系统用LangGraph StateGraph
- 也可以组合：Plan制定大方向，ReAct执行细节

---

## 7.5 多Agent协作：从单兵作战到团队配合

### 为什么需要多Agent？

当任务变得复杂时，单个Agent会遇到问题：

1. **工具太多**：一个Agent有20个工具，模型调用错误率飙升
2. **上下文太长**：多个领域的知识混在一起，模型"顾此失彼"
3. **专业性不足**：一个通用的Agent在各领域都是"半吊子"

解决方案：**让专业的人做专业的事**。

拆分成多个专门的Agent：
- 搜索引擎Agent
- 代码执行Agent
- 数据分析Agent
- 文档撰写Agent
- 审核校验Agent

然后协调它们工作。

### 多Agent的四大架构

#### 模式一：Supervisor模式（主管模式）

一个"主管Agent"负责任务分发，下面的"执行Agent"各司其职。

```
           用户请求
               ↓
         ┌──────────┐
         │  主管    │
         │ Supervisor│
         └────┬─────┘
              │
    ┌─────────┼─────────┐
    ↓         ↓         ↓
┌───────┐ ┌───────┐ ┌───────┐
│ 搜索  │ │ 代码  │ │ 报告  │
│ Agent │ │ Agent │ │ Agent │
└───────┘ └───────┘ └───────┘
```

**适用场景**：任务可以明确分解，每个子任务相对独立。

#### 模式二：去中心化Swarm模式

没有固定的主管，Agent之间可以自由"交接"。

```
Agent A ──┬──→ Agent B ──→ Agent C ──→ 用户
          │         ↑                    ↓
          └─────────┘ ←── Agent D ←────┘
```

**适用场景**：任务流程不固定，需要动态协作。

#### 模式三：层级化指挥链

模拟组织架构，多级Supervisor层层管理。

```
          CEO Agent
              │
    ┌─────────┼─────────┐
    ↓         ↓         ↓
  CTO       CFO       COO
    │         │         │
  前端      财务      运营
  Agent    Agent    Agent
```

**适用场景**：超大型系统，需要明确汇报关系。

#### 模式四：协作式（Collaborative）

多个Agent共同完成同一个任务，边沟通边协作。

### 真实案例一：用CrewAI搭一个"AI日报生成团队"

CrewAI是2024-2025年崛起的多Agent框架，主打"让多个AI Agent像团队一样工作"。语法简洁，上手快。

```python
# ============ CrewAI 实战：AI日报生成团队 ============
"""
团队成员：
1. 新闻收集员(Researcher)：负责从多个渠道收集今日热点
2. 数据分析师(Analyst)：负责分析数据、提炼趋势
3. 编辑(Editor)：负责撰写最终日报
"""

from crewai import Agent, Task, Crew
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_openai import ChatOpenAI
import os

# 配置API
os.environ["OPENAI_API_KEY"] = "your-key"
os.environ["TAVILY_API_KEY"] = "your-key"

# 初始化LLM
llm = ChatOpenAI(model="gpt-4.1-mini", temperature=0.7)

# 初始化搜索工具
search_tool = TavilySearchResults(max_results=5)
web_search = DuckDuckGoSearchRun()

# ============ 1. 定义Agent ============

# 新闻收集员
researcher = Agent(
    role="新闻收集专家",
    goal="全面收集今日最重要的科技和AI领域新闻",
    backstory="""
你是一个资深新闻收集专家，擅长从多个渠道快速获取最新资讯。
你关注：AI技术、大模型、应用落地、创业投资、政策监管等方向。
你的工作原则是：信息全面、来源可靠、重点突出。
""",
    verbose=True,
    allow_delegation=False,  # 不委托给他人
    tools=[search_tool, web_search]
)

# 数据分析师
analyst = Agent(
    role="数据分析师",
    goal="从海量信息中提炼关键趋势和洞察",
    backstory="""
你是一个经验丰富的数据分析师，擅长从纷繁复杂的信息中找出规律。
你善于发现趋势、分析因果、提炼要点。
你的分析报告简洁有力，用数据说话。
""",
    verbose=True,
    allow_delegation=False,
    tools=[]  # 不需要额外工具，主要靠LLM分析
)

# 编辑
editor = Agent(
    role="资深编辑",
    goal="将分析结果整合成一份专业的日报",
    backstory="""
你是一个资深的科技媒体编辑，曾在36氪、虎嗅等平台工作多年。
你擅长将复杂的技术内容转化为通俗易懂的文字。
你的文章逻辑清晰、可读性强，深受读者喜爱。
""",
    verbose=True,
    allow_delegation=False,
    tools=[]
)

# ============ 2. 定义Task ============

# 任务1：收集新闻
research_task = Task(
    description="""
请收集今日最重要的科技和AI领域新闻。

要求：
1. 覆盖至少5个不同的主题方向
2. 每个主题列出2-3条关键新闻
3. 标注信息来源和时间
4. 突出有重大影响的事件

输出格式：Markdown
""",
    agent=researcher,
    expected_output="一份结构化的新闻汇总，包含时间线、事件分类和来源标注"
)

# 任务2：分析趋势（依赖任务1）
analysis_task = Task(
    description="""
基于新闻收集员提供的素材，进行深度分析。

要求：
1. 识别3个最重要的趋势
2. 分析每个趋势背后的原因
3. 预测可能的影响
4. 给出简短的点评

输出格式：Markdown
""",
    agent=analyst,
    expected_output="一份趋势分析报告，包含趋势识别、原因分析和影响预测",
    context=[research_task]  # 依赖research_task的输出
)

# 任务3：撰写日报（依赖任务1和任务2）
write_task = Task(
    description="""
根据新闻汇总和趋势分析，撰写一份完整的AI日报。

日报结构：
1. 今日头条（最重要的1件事）
2. 热点速递（5-8条简讯）
3. 深度解读（1-2个深度分析）
4. 明日展望（对明天的预测）
5. 投融资快报（如有）

要求：
1. 语言简洁、专业
2. 适合科技从业者阅读
3. 突出实用价值
4. 总字数2000-3000字

输出格式：Markdown
""",
    agent=editor,
    expected_output="一份完整的AI日报，格式规范，内容专业",
    context=[research_task, analysis_task]  # 依赖前两个任务
)

# ============ 3. 组建团队并执行 ============

# 创建团队
crew = Crew(
    agents=[researcher, analyst, editor],
    tasks=[research_task, analysis_task, write_task],
    process="sequential",  # 顺序执行（也可以用"hierarchical"层级执行）
    verbose=True,
    memory=True,  # 启用记忆（Agent可以看到之前的对话）
    embedder={
        "provider": "openai",
        "config": {"model": "text-embedding-3-small"}
    }
)

# 启动团队
print("🚀 启动AI日报生成团队...")
print("="*60)

result = crew.kickoff(
    inputs={
        "date": "2026年1月15日",
        "focus_areas": ["AI大模型", "应用落地", "创业投资", "政策监管", "技术突破"]
    }
)

print("\n" + "="*60)
print("✅ 日报生成完成!")
print("="*60)
print(result)

# ============ 4. 查看执行过程 ============
print("\n📊 团队执行回顾:")
print(f"最终结果:\n{result.raw}")

# 查看各Agent的工作
print("\n--- 新闻收集员的工作 ---")
print(research_task.output.raw if hasattr(research_task.output, 'raw') else research_task.output)

print("\n--- 数据分析师的工作 ---")
print(analysis_task.output.raw if hasattr(analysis_task.output, 'raw') else analysis_task.output)
```

### 真实案例二：用LangGraph搭一个"代码Review流水线"

```python
# ============ LangGraph 实战：代码Review流水线 ============
"""
流水线角色：
1. 代码解析器(CodeParser)：解析代码，提取关键信息
2. 静态分析器(StaticAnalyzer)：检查代码质量问题
3. 安全审计员(SecurityAuditor)：检查安全漏洞
4. 代码审查员(CodeReviewer)：提出改进建议
5. 最终汇总(FinalReview)：生成完整Review报告
"""

from langgraph.graph import StateGraph, END, START
from typing import TypedDict, List, Annotated, Optional
import operator
import re

class CodeReviewState(TypedDict):
    """代码Review状态"""
    # 输入
    code: str
    language: str
    file_path: str
    
    # 解析结果
    parsed_code: dict
    
    # 分析结果
    quality_issues: List[dict]
    security_issues: List[dict]
    style_issues: List[dict]
    
    # 改进建议
    suggestions: List[dict]
    
    # 最终报告
    final_report: str
    
    # 统计
    issue_count: int
    severity_breakdown: dict

# ============ 节点定义 ============

def parse_code(state: CodeReviewState) -> dict:
    """解析代码结构"""
    print(f"📖 解析代码: {state['file_path']}")
    
    code = state['code']
    language = state['language']
    
    # 统计信息
    lines = code.split('\n')
    total_lines = len(lines)
    blank_lines = sum(1 for l in lines if not l.strip())
    comment_lines = sum(1 for l in lines if l.strip().startswith(('//', '#', '/*', '*', '''')))
    
    # 函数/方法提取
    functions = []
    if language in ['python']:
        func_pattern = r'def (\w+)\s*\(([^)]*)\):'
        for match in re.finditer(func_pattern, code):
            functions.append({
                "name": match.group(1),
                "params": match.group(2),
                "line": code[:match.start()].count('\n') + 1
            })
    elif language in ['javascript', 'typescript', 'java']:
        func_pattern = r'(?:function|const|let|var)\s+(\w+)\s*(?:=\s*(?:async\s+)?(?:\([^)]*\)|[^;]+)\s*=>|\s*\(([^)]*)\))'
        for match in re.finditer(func_pattern, code):
            functions.append({
                "name": match.group(1),
                "params": match.group(2) or "",
                "line": code[:match.start()].count('\n') + 1
            })
    
    parsed = {
        "total_lines": total_lines,
        "code_lines": total_lines - blank_lines,
        "blank_lines": blank_lines,
        "comment_lines": comment_lines,
        "functions": functions,
        "imports": extract_imports(code, language)
    }
    
    print(f"   解析完成: {total_lines}行, {len(functions)}个函数")
    return {"parsed_code": parsed}

def extract_imports(code: str, language: str) -> List[str]:
    """提取导入语句"""
    imports = []
    if language == 'python':
        for line in code.split('\n'):
            if re.match(r'^(import|from)\s+', line.strip()):
                imports.append(line.strip())
    elif language in ['javascript', 'typescript', 'java']:
        for line in code.split('\n'):
            if re.match(r'^import\s+', line.strip()):
                imports.append(line.strip())
    return imports

def static_analysis(state: CodeReviewState) -> dict:
    """静态代码分析"""
    print(f"🔍 执行静态分析...")
    
    code = state['code']
    issues = []
    
    # 检查点1：重复代码（简化版）
    lines = [l.strip() for l in code.split('\n') if l.strip()]
    seen = {}
    for i, line in enumerate(lines):
        if len(line) > 30 and line in seen:
            issues.append({
                "type": "duplication",
                "severity": "low",
                "message": f"发现重复代码行: 第{i+1}行和第{seen[line]+1}行",
                "line": i + 1
            })
        seen[line] = i
    
    # 检查点2：过长函数
    for func in state['parsed_code'].get('functions', []):
        # 简化：假设每个函数平均5行，这里用行数估算
        if func['name'] and 'too_long_function' in code:  # 实际需要更复杂的分析
            pass
    
    # 检查点3：硬编码值
    hardcoded = re.findall(r'["\'][\w\-./:]+["\']', code)
    if len(hardcoded) > 10:
        issues.append({
            "type": "hardcoded_values",
            "severity": "info",
            "message": f"发现{len(hardcoded)}个硬编码值，考虑使用配置",
            "count": len(hardcoded)
        })
    
    # 检查点4：TODO/FIXME
    todos = []
    for i, line in enumerate(code.split('\n')):
        if 'TODO' in line or 'FIXME' in line:
            todos.append({"line": i + 1, "content": line.strip()})
    
    if todos:
        issues.append({
            "type": "todos",
            "severity": "info",
            "message": f"发现{len(todos)}个TODO/FIXME",
            "items": todos
        })
    
    print(f"   发现{len(issues)}个质量问题")
    return {"quality_issues": issues}

def security_audit(state: CodeReviewState) -> dict:
    """安全审计"""
    print(f"🔒 执行安全审计...")
    
    code = state['code']
    issues = []
    
    # 检查SQL注入风险
    if re.search(r'(execute|query|cursor)\s*\(.*\%|\+.*\+', code, re.IGNORECASE):
        issues.append({
            "type": "sql_injection",
            "severity": "high",
            "message": "可能的SQL注入风险：避免使用字符串拼接构建SQL"
        })
    
    # 检查硬编码密码
    if re.search(r'(password|passwd|pwd)\s*=\s*["\'][^"\']+["\']', code, re.IGNORECASE):
        issues.append({
            "type": "hardcoded_password",
            "severity": "critical",
            "message": "发现硬编码密码！必须使用环境变量或密钥管理服务"
        })
    
    # 检查不安全的随机数
    if 'random.random()' in code or 'Math.random()' in code:
        issues.append({
            "type": "weak_random",
            "severity": "medium",
            "message": "使用弱随机数生成器，考虑使用密码学安全的随机数"
        })
    
    # 检查eval使用
    if 'eval(' in code:
        issues.append({
            "type": "dangerous_eval",
            "severity": "high",
            "message": "使用eval()存在安全风险，考虑使用ast.literal_eval或json.loads"
        })
    
    # 检查敏感信息打印
    if re.search(r'print\s*\(.*(?:password|token|secret|key)', code, re.IGNORECASE):
        issues.append({
            "type": "sensitive_logging",
            "severity": "medium",
            "message": "日志中可能包含敏感信息，请确保生产环境关闭调试日志"
        })
    
    print(f"   发现{len(issues)}个安全问题")
    return {"security_issues": issues}

def style_check(state: CodeReviewState) -> dict:
    """代码风格检查"""
    print(f"🎨 检查代码风格...")
    
    code = state['code']
    issues = []
    
    # 检查命名规范
    camel_case = re.findall(r'\b[a-z][a-z0-9]+[A-Z]\w*\b', code)
    snake_case = re.findall(r'\b[a-z]+_[a-z]+[a-z0-9]*\b', code)
    
    # 检查过长行
    long_lines = []
    for i, line in enumerate(code.split('\n')):
        if len(line) > 120:
            long_lines.append({"line": i + 1, "length": len(line)})
    
    if long_lines:
        issues.append({
            "type": "line_too_long",
            "severity": "info",
            "message": f"发现{len(long_lines)}行超过120字符",
            "details": long_lines[:5]  # 只显示前5个
        })
    
    # 检查缺少docstring
    functions = state['parsed_code'].get('functions', [])
    missing_docs = [f for f in functions if 'def ' + f['name'] not in code]
    if len(functions) > 3 and len(missing_docs) > len(functions) * 0.5:
        issues.append({
            "type": "missing_docstrings",
            "severity": "info",
            "message": f"{len(functions)}个函数中{len(missing_docs)}个缺少文档字符串"
        })
    
    print(f"   发现{len(issues)}个风格问题")
    return {"style_issues": issues}

def generate_suggestions(state: CodeReviewState) -> dict:
    """生成改进建议"""
    print(f"💡 生成改进建议...")
    
    all_issues = (
        state.get('quality_issues', []) +
        state.get('security_issues', []) +
        state.get('style_issues', [])
    )
    
    suggestions = []
    
    for issue in all_issues:
        severity = issue.get('severity', 'info')
        
        if severity == 'critical':
            suggestions.append({
                "priority": 1,
                "type": issue['type'],
                "suggestion": f"【严重】{issue['message']} - 必须立即修复",
                "impact": "可能导致系统安全问题或功能故障"
            })
        elif severity == 'high':
            suggestions.append({
                "priority": 2,
                "type": issue['type'],
                "suggestion": f"【高】{issue['message']} - 建议尽快修复",
                "impact": "影响代码质量和可维护性"
            })
        elif severity == 'medium':
            suggestions.append({
                "priority": 3,
                "type": issue['type'],
                "suggestion": f"【中】{issue['message']} - 考虑修复",
                "impact": "可能导致未来的问题"
            })
        else:
            suggestions.append({
                "priority": 4,
                "type": issue['type'],
                "suggestion": f"【低】{issue['message']} - 可选择性优化",
                "impact": "提升代码可读性和团队协作效率"
            })
    
    # 按优先级排序
    suggestions.sort(key=lambda x: x['priority'])
    
    print(f"   生成{len(suggestions)}条建议")
    return {"suggestions": suggestions}

def final_review(state: CodeReviewState) -> dict:
    """最终汇总"""
    print(f"📝 生成最终Review报告...")
    
    # 统计
    quality_count = len(state.get('quality_issues', []))
    security_count = len(state.get('security_issues', []))
    style_count = len(state.get('style_issues', []))
    total_count = quality_count + security_count + style_count
    
    # 严重程度分布
    all_issues = (
        state.get('quality_issues', []) +
        state.get('security_issues', []) +
        state.get('style_issues', [])
    )
    
    severity_breakdown = {"critical": 0, "high": 0, "medium": 0, "info": 0}
    for issue in all_issues:
        sev = issue.get('severity', 'info')
        if sev in severity_breakdown:
            severity_breakdown[sev] += 1
    
    # 生成报告
    report = f"""# 代码Review报告

## 基本信息
- **文件**: {state['file_path']}
- **语言**: {state['language']}
- **总行数**: {state['parsed_code']['total_lines']}
- **代码行数**: {state['parsed_code']['code_lines']}
- **函数数量**: {len(state['parsed_code']['functions'])}

## 问题统计

| 类别 | 数量 |
|------|------|
| 代码质量问题 | {quality_count} |
| 安全问题 | {security_count} |
| 风格问题 | {style_count} |
| **总计** | **{total_count}** |

### 严重程度分布
- 🔴 Critical: {severity_breakdown['critical']}
- 🟠 High: {severity_breakdown['high']}
- 🟡 Medium: {severity_breakdown['medium']}
- 🔵 Info: {severity_breakdown['info']}

## 问题详情

"""
    
    # 分类列出问题
    if security_count > 0:
        report += "### 🔒 安全问题\n\n"
        for issue in state.get('security_issues', []):
            report += f"- **[{issue['severity'].upper()}]** {issue['message']}\n"
        report += "\n"
    
    if quality_count > 0:
        report += "### 🔍 代码质量问题\n\n"
        for issue in state.get('quality_issues', []):
            report += f"- **[{issue['severity'].upper()}]** {issue['message']}\n"
        report += "\n"
    
    if style_count > 0:
        report += "### 🎨 风格问题\n\n"
        for issue in state.get('style_issues', []):
            report += f"- **[{issue['severity'].upper()}]** {issue['message']}\n"
        report += "\n"
    
    # 改进建议
    suggestions = state.get('suggestions', [])
    if suggestions:
        report += "## 💡 改进建议\n\n"
        for i, s in enumerate(suggestions[:10], 1):  # 最多显示10条
            report += f"{i}. {s['suggestion']}\n"
            report += f"   - 影响: {s['impact']}\n\n"
    
    # 总结
    if severity_breakdown['critical'] > 0:
        conclusion = "⚠️ **存在严重安全问题，建议立即修复后再合并**"
    elif severity_breakdown['high'] > 0:
        conclusion = "🔶 **存在较高风险问题，建议修复后再合并**"
    elif total_count > 0:
        conclusion = "✅ **代码整体质量良好，建议修复低优先级问题**"
    else:
        conclusion = "✅ **代码质量优秀，可以合并**"
    
    report += f"---\n\n## 总结\n\n{conclusion}\n"
    
    print(f"   报告生成完成: {total_count}个问题")
    return {
        "final_report": report,
        "issue_count": total_count,
        "severity_breakdown": severity_breakdown
    }

# ============ 构建LangGraph ============
workflow = StateGraph(CodeReviewState)

# 添加节点
workflow.add_node("parse_code", parse_code)
workflow.add_node("static_analysis", static_analysis)
workflow.add_node("security_audit", security_audit)
workflow.add_node("style_check", style_check)
workflow.add_node("generate_suggestions", generate_suggestions)
workflow.add_node("final_review", final_review)

# 设置入口
workflow.set_entry_point("parse_code")

# 并行执行分析节点
workflow.add_edge("parse_code", "static_analysis")
workflow.add_edge("parse_code", "security_audit")
workflow.add_edge("parse_code", "style_check")

# 汇总到建议生成
workflow.add_edge("static_analysis", "generate_suggestions")
workflow.add_edge("security_audit", "generate_suggestions")
workflow.add_edge("style_check", "generate_suggestions")

# 最终汇总
workflow.add_edge("generate_suggestions", "final_review")
workflow.add_edge("final_review", END)

# 编译
app = workflow.compile()

# ============ 运行 ============
if __name__ == "__main__":
    # 示例代码
    sample_code = '''
import os
import random

def process_user_data(user_id: str, data: dict) -> dict:
    """处理用户数据"""
    # TODO: 添加数据验证
    password = "admin123"  # 硬编码密码 - 安全问题！
    
    result = {
        "user_id": user_id,
        "processed": True,
        "timestamp": "2026-01-15"
    }
    
    # SQL注入风险
    query = "SELECT * FROM users WHERE id = " + user_id
    
    # 打印敏感信息
    print(f"Processing user {user_id} with password {password}")
    
    return result

def calculate_stats(numbers):
    # 计算统计数据
    if not numbers:
        return None
    
    total = sum(numbers)
    count = len(numbers)
    
    # TODO: 计算更多统计指标
    # FIXME: 处理负数情况
    
    return {
        "total": total,
        "count": count,
        "average": total / count if count > 0 else 0,
        "random_id": str(random.random())  # 使用弱随机数
    }

def save_config(config_data):
    """保存配置到文件"""
    # 硬编码路径
    file_path = "/tmp/config.txt"
    
    with open(file_path, 'w') as f:
        f.write(str(config_data))
    
    # 使用eval - 危险！
    result = eval("config_data")
    
    return True
'''
    
    # 运行Review
    print("🚀 启动代码Review流水线...")
    print("="*60)
    
    result = app.invoke({
        "code": sample_code,
        "language": "python",
        "file_path": "src/user_service.py",
        "parsed_code": {},
        "quality_issues": [],
        "security_issues": [],
        "style_issues": [],
        "suggestions": [],
        "final_report": "",
        "issue_count": 0,
        "severity_breakdown": {}
    })
    
    print("\n" + "="*60)
    print("📊 Review报告:")
    print("="*60)
    print(result["final_report"])
```

### 多Agent的调试和可观测性

多Agent系统比单Agent复杂得多，调试也更困难。以下是几个实战技巧：

```python
# ============ 多Agent调试技巧 ============

# 1. 统一的日志格式
class AgentLogger:
    """统一的Agent日志"""
    
    def __init__(self, agent_name: str):
        self.agent_name = agent_name
        self.logs = []
    
    def log(self, level: str, message: str, data: dict = None):
        """记录日志"""
        entry = {
            "agent": self.agent_name,
            "level": level,
            "message": message,
            "data": data,
            "timestamp": datetime.now().isoformat()
        }
        self.logs.append(entry)
        
        # 打印带颜色的日志
        colors = {"INFO": "\033[94m", "WARN": "\033[93m", "ERROR": "\033[91m"}
        color = colors.get(level, "\033[0m")
        print(f"{color}[{self.agent_name}] {message}\033[0m")
    
    def get_full_log(self) -> str:
        """获取完整日志"""
        return json.dumps(self.logs, indent=2, ensure_ascii=False)

# 2. 消息追踪
class MessageTracer:
    """追踪Agent间的消息传递"""
    
    def __init__(self):
        self.messages = []
        self.trace_id = str(uuid.uuid4())[:8]
    
    def trace(self, from_agent: str, to_agent: str, message: str, msg_type: str):
        """记录消息传递"""
        entry = {
            "trace_id": self.trace_id,
            "from": from_agent,
            "to": to_agent,
            "type": msg_type,  # task, result, feedback, error"
            "content": message[:500],  # 截断长消息
            "timestamp": datetime.now().isoformat()
        }
        self.messages.append(entry)
        print(f"📨 [{self.trace_id}] {from_agent} → {to_agent}: {msg_type}")

# 3. 状态可视化（用于调试）
def visualize_agent_state(state: dict):
    """可视化Agent状态"""
    print("\n┌" + "─" * 50 + "┐")
    print("│ Agent状态快照".ljust(51) + "│")
    print("├" + "─" * 50 + "┤")
    
    for key, value in state.items():
        if isinstance(value, str) and len(value) > 40:
            value = value[:40] + "..."
        print(f"│ {key}: {str(value)[:40]}".ljust(51) + "│")
    
    print("└" + "─" * 50 + "┘")
```

---

## 7.6 Agent的边界与局限：什么时候不该用Agent

### Agent不是万能的

吹了这么多Agent，你以为它什么都能干？错了。Agent有很多局限，用错了地方不仅没用，还会有副作用。

### Agent失败的6种典型模式及应对策略

**模式1：陷入死循环**

```python
# Agent总是调用搜索→搜索结果不够→再搜索→...
# 原因：没有终止条件，或者每次结果都触发新的搜索

# 解决方案：
MAX_ITERATIONS = 10

# 检测循环：记录最近N个动作
def detect_loop(actions: List[str], window: int = 3) -> bool:
    """检测是否陷入循环"""
    if len(actions) < window:
        return False
    recent = actions[-window:]
    return len(set(recent)) == 1  # 最近N个动作相同

# 或者使用状态哈希检测
def detect_state_loop(state_sequence: List[dict]) -> bool:
    """检测状态循环"""
    seen = set()
    for state in state_sequence:
        state_hash = hash(str(sorted(state.items())))
        if state_hash in seen:
            return True
        seen.add(state_hash)
    return False
```

**模式2：任务理解偏差**

```python
# Agent理解错了你的目标，做了半天发现不对
# 原因：目标描述不够清晰，或者缺少中途确认

# 解决方案：
# 1. 明确的目标描述
goal = """
帮我整理竞品分析报告，包含：
1) 市场份额（数据来源+更新时间）
2) 产品特点（功能对比表）
3) 定价策略（收费模式+价格区间）
4) SWOT分析

输出格式：Markdown
"""

# 2. 中途确认机制
def confirm_with_user(understanding: str) -> bool:
    """让用户确认理解是否正确"""
    print(f"我的理解是这样的，对吗？")
    print(understanding)
    response = input("确认请按Y，重新描述请按N: ")
    return response.upper() == "Y"
```

**模式3：上下文爆炸**

```python
# Agent处理了很多步骤后，上下文变得很长，开始"遗忘"原始目标
# 原因：没有上下文压缩机制

# 解决方案：定期总结
if len(context) > 20:
    # 压缩上下文
    summary_prompt = """
请总结以下对话的核心要点，保留关键信息：

{context}

输出格式：
- 已完成的任务：...
- 当前状态：...
- 关键结论：...
"""
    summary = llm.invoke(summary_prompt)
    context = [summary] + context[-5:]  # 保留总结 + 最近5条
```

**模式4：工具调用错误**

```python
# Agent调用了不存在的工具，或传了错误参数
# 原因：工具描述不清晰，或者参数校验缺失

# 解决方案：
@tool
def safe_search(query: str, max_results: int = 10) -> dict:
    """
    搜索工具。
    
    Args:
        query: 搜索关键词（必填，2-100字符）
        max_results: 最大结果数（可选，默认10，最大50）
    
    Returns:
        {"success": bool, "results": List, "error": str}
    """
    # 参数校验
    if not query or len(query) < 2:
        return {"success": False, "error": "搜索关键词至少2个字符"}
    if len(query) > 100:
        return {"success": False, "error": "搜索关键词最多100个字符"}
    max_results = min(max(max_results, 1), 50)
    
    # 执行搜索...
    return {"success": True, "results": [...]}
```

**模式5：过早终止**

```python
# Agent觉得差不多了就停了，但实际上任务没完成
# 原因：缺少验证步骤，或者自我评估标准过低

# 解决方案：强制验证
def verify_completion(goal: str, result: Any) -> dict:
    """验证任务是否真正完成"""
    
    verification_prompt = f"""
请验证以下任务是否真正完成：

原始目标：{goal}

执行结果：{result}

请检查：
1. 是否覆盖了目标的所有要求？
2. 结果是否准确可信？
3. 是否有遗漏的重要信息？

返回JSON：
{{"complete": bool, "issues": ["问题1", "问题2"], "confidence": 0.0-1.0}}
"""
    
    return llm.invoke(verification_prompt)
```

**模式6：成本失控**

```python
# Agent疯狂调用工具，Token消耗远超预期
# 原因：没有预算控制，或者工具粒度太细

# 解决方案：
class TokenBudgetManager:
    """Token预算管理器"""
    
    def __init__(self, max_tokens: int, warning_threshold: float = 0.7):
        self.max_tokens = max_tokens
        self.warning_threshold = warning_threshold
        self.used_tokens = 0
    
    def record(self, tokens: int):
        """记录Token使用"""
        self.used_tokens += tokens
        
        if self.used_tokens > self.max_tokens:
            raise BudgetExceededError(f"超过Token预算: {self.used_tokens}/{self.max_tokens}")
        
        if self.used_tokens > self.max_tokens * self.warning_threshold:
            print(f"⚠️ Token使用超过{self.warning_threshold*100}%: {self.used_tokens}/{self.max_tokens}")
    
    def get_remaining(self) -> int:
        """获取剩余Token"""
        return max(0, self.max_tokens - self.used_tokens)

# 使用示例
budget = TokenBudgetManager(max_tokens=100000)

# 在每次LLM调用前检查
def call_llm_with_budget(prompt: str):
    estimated_tokens = len(prompt.split()) * 1.3  # 粗略估算
    
    if budget.get_remaining() < estimated_tokens:
        return {"error": "Token预算不足，终止执行"}
    
    result = llm.invoke(prompt)
    budget.record(result.usage.total_tokens)
    return result
```

### Agent可靠性工程

除了处理失败模式，还要从系统层面提升Agent的可靠性：

**1. 超时和重试机制**

```python
import asyncio
from tenacity import retry, stop_after_attempt, wait_exponential

@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10)
)
async def resilient_tool_call(tool_func, *args, **kwargs):
    """带重试的工具调用"""
    try:
        return await tool_func(*args, **kwargs)
    except TimeoutError:
        raise  # 让tenacity重试
    except RateLimitError:
        await asyncio.sleep(60)  # 等待速率限制
        raise  # 让tenacity重试
```

**2. 输出校验和自我修复**

```python
class OutputValidator:
    """输出校验器"""
    
    @staticmethod
    def validate_json(output: str) -> dict:
        """验证JSON输出"""
        try:
            return json.loads(output)
        except json.JSONDecodeError:
            # 尝试修复
            return {"raw": output, "error": "JSON解析失败"}
    
    @staticmethod
    def validate_schema(data: dict, schema: dict) -> tuple:
        """验证数据结构"""
        errors = []
        
        for key, expected_type in schema.items():
            if key not in data:
                errors.append(f"缺少字段: {key}")
            elif not isinstance(data[key], expected_type):
                errors.append(f"字段类型错误: {key} (期望{expected_type}, 实际{type(data[key])})")
        
        return len(errors) == 0, errors
    
    @staticmethod
    def self_correct(output: str, error: str, max_attempts: int = 2) -> str:
        """尝试自我修复"""
        for _ in range(max_attempts):
            correction_prompt = f"""
请修正以下输出的错误：

原始输出：{output}

错误：{error}

请输出修正后的内容。
"""
            corrected = llm.invoke(correction_prompt)
            
            # 验证修正是否有效
            if Validator.validate_json(corrected):
                return corrected
        
        return output  # 返回原始输出，不再尝试
```

**3. 成本控制：Token预算管理**

```python
class CostController:
    """成本控制器"""
    
    def __init__(self):
        self.budget = BudgetManager()
        self.cost_history = []
    
    def estimate_cost(self, model: str, input_tokens: int, output_tokens: int) -> float:
        """估算成本（美元）"""
        pricing = {
            "gpt-4": {"input": 0.03, "output": 0.06},
            "gpt-4.1-mini": {"input": 0.00015, "output": 0.0006},
            "claude-3": {"input": 0.003, "output": 0.015},
        }
        
        p = pricing.get(model, {"input": 0.001, "output": 0.002})
        cost = (input_tokens / 1000) * p["input"] + (output_tokens / 1000) * p["output"]
        return cost
    
    def check_budget(self, estimated_cost: float) -> bool:
        """检查预算"""
        remaining = self.budget.get_remaining()
        
        if estimated_cost > remaining:
            print(f"⚠️ 预估成本 ${estimated_cost:.4f} 超过剩余预算 ${remaining:.4f}")
            return False
        
        return True
    
    def record_cost(self, actual_cost: float, context: dict):
        """记录实际成本"""
        self.cost_history.append({
            "cost": actual_cost,
            "timestamp": datetime.now().isoformat(),
            "context": context
        })
    
    def get_cost_report(self) -> dict:
        """生成成本报告"""
        total = sum(e["cost"] for e in self.cost_history)
        
        by_context = {}
        for e in self.cost_history:
            ctx = e["context"].get("type", "unknown")
            by_context[ctx] = by_context.get(ctx, 0) + e["cost"]
        
        return {
            "total_cost": total,
            "by_category": by_context,
            "transaction_count": len(self.cost_history),
            "average_cost": total / len(self.cost_history) if self.cost_history else 0
        }
```

### 什么时候该用Agent？

| 场景 | 建议 |
|------|------|
| 复杂、多步骤、需要规划 | ✅ 用Agent |
| 需要调用多个外部API | ✅ 用Agent |
| 探索性、开放式任务 | ✅ 用Agent |
| 简单、一次性、低价值 | ❌ 不用Agent |
| 要求100%准确性 | ❌ 单独用Agent |
| 成本敏感、响应要求高 | ❌ 不用Agent |
| 固定流程、规则明确 | ❌ 不用Agent |

---

## 本章小结

这一章我们系统学习了AI Agent的核心逻辑：

1. **Agent是什么**：从被动应答到主动执行，让AI自己完成目标
2. **四组件架构**：感知、推理、行动、记忆，构成了Agent的"身体"
3. **工具调用**：Function Calling的完整生命周期 + 生产级工具设计
4. **规划推理**：ReAct完整追踪 + LangGraph StateGraph + Plan-and-Execute
5. **多Agent协作**：CrewAI团队实战 + LangGraph流水线实战
6. **Agent边界**：6种失败模式 + 可靠性工程

作为基础篇的收尾，我希望你记住一个核心观点：

> **Agent不是魔法，而是工程。**

它不是"什么都不用管，AI自己搞定"。它需要你设计工具、定义流程、处理异常、优化成本。Agent的智能来自于你的工程设计。

前面几章学的Prompt工程、RAG检索，都是Agent的组成部分。理解了这一章，你就有了AI应用开发的"全局视野"。

---

## 行动清单

**✅ 理解Agent的本质**
- Agent = 目标驱动 + 自主规划 + 工具执行
- 和传统大模型的核心区别：被动应答 vs 主动执行

**✅ 掌握Agent四组件**
- 感知：获取用户输入、工具结果、系统状态（含多模态）
- 推理：大模型驱动，决定下一步行动
- 行动：调用工具、生成回复、更新状态（含超时重试）
- 记忆：短期（对话上下文）+ 长期（向量存储）+ 工作记忆（scratchpad）

**✅ 学会工具调用**
- Function Calling的完整生命周期（5个阶段）
- 原子工具 vs 组合工具的设计模式
- 工具安全：沙箱执行、权限控制、白名单

**✅ 掌握规划推理模式**
- ReAct：边想边做，Thought→Action→Observation循环（含完整debug追踪）
- LangGraph StateGraph：2026年生产级Agent开发标配
  - 条件边：不同情况走不同流程
  - 并行节点：同时执行多个任务
  - 人在回路：人工审核和介入
- Plan-and-Execute：先规划全局，再逐个执行

**✅ 了解多Agent架构**
- Supervisor：主管负责调度，执行Agent各司其职
- Swarm：去中心化，Agent自由交接
- 层级化：多层Supervisor，管理复杂组织
- 协作式：多Agent共同完成，迭代改进

**✅ 真实案例实践**
- 用CrewAI搭AI日报生成团队（3个Agent，顺序执行）
- 用LangGraph搭代码Review流水线（5个节点，并行分析）

**✅ 知道Agent的边界**
- 简单任务不需要Agent，直接调API
- 高准确性场景需要人工兜底
- 成本敏感、实时性要求高的场景慎用
- 固定流程优先用规则引擎

**✅ 掌握Agent可靠性工程**
- 6种典型失败模式及应对策略
- 超时和重试机制
- 输出校验和自我修复
- Token预算管理

**✅ 完成实践任务**
- 用LangGraph实现一个多步骤研究报告Agent
- 设计一个AI开发助手工具集
- （进阶）用CrewAI搭建一个多Agent团队
