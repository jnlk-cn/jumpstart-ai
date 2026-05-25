---
outline: deep
---

##### 第11章 Agent助理开发实战与Skill开发

> **本章你能带走什么**
> 
> - 理解Agent助理与普通Agent的本质区别，以及为什么这种区别决定了产品的上限
> - 掌握记忆系统的三层架构：短期记忆、长期记忆、工作记忆
> - 学会从0开发一个完整的Skill，包括设计原则、接口规范、错误处理
> - 理解Skill的注册发现机制和组合工作流的设计方法
> - 对比Coze、Dify、LangGraph三大框架的适用场景
> - 拿到一个可运行的AI开发助理完整代码
> - 了解Agent助理的评测体系和商业化路径

---

2024年是Agent元年。这句话你可能在无数篇文章里看过了，但我要说的是另一件事：2024年也是Agent助理产品经理噩梦的开始。

因为"Agent"这三个字被用烂了。什么都能叫Agent，什么都不是真正的Agent。你打开任何一个AI产品的官网，恨不得把"智能Agent"写在最显眼的位置，但用户真正用起来，发现它就是个套了皮的聊天机器人。

所以这一章，我要干一件可能得罪人的事：搞清楚到底什么是Agent助理，它和普通Agent的区别在哪里，为什么这种区别重要。然后，带着你从设计到代码，把一个真正的Agent助理做出来。

特别要重点讲的是Skill开发——这是让Agent从"能说会道"变成"能干活"的关键能力单元。

准备好了吗？我们开始。

---

#### 11.1 Agent助理 vs 普通Agent：区别在哪里？

###### 11.1.1 四个维度看透本质差异

我在面试候选人的时候喜欢问一个问题："你觉得Siri是不是一个Agent？"大部分人会犹豫，说"应该是吧"。但如果追问"Siri和真正的Agent助理有什么区别"，能说清楚的人寥寥无几。

让我来给你一个清晰的判断框架。普通Agent和Agent助理，本质区别体现在四个维度：

**第一个维度：被动响应 vs 主动建议**

普通Agent是个"问一句答一句"的工具。你问天气，它告诉你天气。你让它写代码，它给你写代码。你不问，它就安静地待着，像个没有灵魂的复读机。

Agent助理不一样。它会主动思考你接下来可能需要什么，然后提前行动。比如你在写一个API，它检测到你漏掉了错误处理，会主动提示"你可能需要考虑添加异常捕获逻辑"。比如你的代码提交记录显示连续加班一周，它会在周五下午提醒你"该提交周报了，别忘了总结这周的进展"。

**第二个维度：无记忆 vs 有记忆**

这是最关键的区分点。普通Agent每次对话都是全新的开始，像金鱼一样只有7秒记忆。你昨天让它分析过一个数据报表，今天换个格式再发一遍，它会像第一次看到一样重新分析，完全不记得你上次说了什么偏好。

Agent助理有完整的记忆系统。它记得你上次用的是哪种图表风格，记得你在数据清洗时踩过的坑，记得你偏好用pandas还是polars，记得你公司的数据源对接方式。这些记忆会持续累积，形成对用户越来越精准的理解。

**第三个维度：无个性 vs 有人格**

普通Agent没有一致性。你今天问它一个问题得到一个答案，明天再问同样的问题，可能因为提示词微调或者模型版本更新，得到完全不同的表述风格。它没有稳定的性格，没有一致的行为模式。

Agent助理有明确的人格设定。这种人格不是简单的"你是一个友好的助手"能定义的，而是体现在具体的交互细节里：它用什么语气说话，遇到问题时的第一反应是什么，面对模糊需求时的处理方式是什么，犯错了是直接承认还是找借口。这些细节构成了一个可信赖的"同事"形象。

**第四个维度：短视 vs 长期目标**

普通Agent的目光只停留在当前这一轮对话。它不知道这次任务和用户之前做过的什么事有关联，不知道这次对话结束后用户要去做什么，不知道怎么把一个大目标拆解成一系列的小步骤。

Agent助理有全局视野。当你说"帮我准备下周的述职"时，它知道这是你季度末述职的一部分，会提醒你"和上个月的中期回顾保持口径一致"；当你说"优化一下这个模块的性能"时，它会先问你"你想优先优化启动速度还是降低内存占用"，因为这两者可能需要不同的方案。

###### 11.1.2 一个例子看穿两种"智能"

让我用一个具体的场景来展示这种差异。

**场景**：用户发来一个Excel文件，里面是上个月的销售数据。用户说"帮我分析一下"。

**普通Agent的反应**：
```
1. 读取文件
2. 生成一些基础的统计指标
3. 画几张图表
4. 返回结果
```

看起来完成了任务，但实际上它对用户的了解为零。它不知道用户上次分析的是月报还是周报，不知道用户的汇报对象是老板还是客户，不知道用户更关注的是增长率还是市场占有率。它的输出是标准化的，没有针对性。

**Agent助理的反应**：
```
1. 调取用户的记忆：上次分析报告时用户要求突出"环比增长率"
2. 调取项目上下文：这是Q3季度复盘的一部分
3. 主动确认：分析重点是按产品线还是按区域？老板更关注哪个维度？
4. 制定分析计划：先做总体概览，再按维度拆解，最后给出建议
5. 执行并持续汇报进度
6. 完成后更新记忆：这次分析用了XX分钟，用户确认了XX个指标
```

你发现区别了吗？Agent助理把"分析数据"这件事，放在了一个更大的上下文中去理解，然后给出了一个有针对性的、主动的、持续跟进的服务。

###### 11.1.3 Agent助理的能力模型图

如果用一张图来表示Agent助理的能力模型，它应该是这样的：

```
                    ┌─────────────────────────────────────────┐
                    │           Agent 助理                    │
                    │  ┌───────────────────────────────────┐  │
                    │  │         人格系统                   │  │
                    │  │  专业度 × 主动性 × 沟通风格        │  │
                    │  └───────────────────────────────────┘  │
                    │  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
                    │  │短期记忆 │ │长期记忆 │ │工作记忆 │   │
                    │  │上下文窗口│ │向量存储 │ │任务State│   │
                    │  └─────────┘ └─────────┘ └─────────┘   │
                    │  ┌───────────────────────────────────┐  │
                    │  │         工具系统 (Skill)           │  │
                    │  │  内置工具 + 可扩展Skill + 工作流   │  │
                    │  └───────────────────────────────────┘  │
                    │  ┌───────────────────────────────────┐  │
                    │  │         规划系统                   │  │
                    │  │  目标分解 + 进度追踪 + 主动推进    │  │
                    │  └───────────────────────────────────┘  │
                    └─────────────────────────────────────────┘
```

这张图告诉我们一个重要的认知：Agent助理不是一个大模型加一个提示词就能搞定的。它的每一个能力模块都需要独立设计和实现。

接下来，让我们逐一拆解这些模块。

---

#### 11.2 Agent助理的核心能力

###### 11.2.1 记忆系统：让AI记住你是谁

记忆系统是Agent助理的灵魂。没有记忆，AI就永远是一个陌生人，每次对话都要从零开始。

我把记忆系统分成三层：短期记忆、长期记忆和工作记忆。这个分层不是学术概念，而是实实在在的工程实现。

##### 短期记忆：上下文窗口的善加利用

短期记忆就是我们常说的大模型上下文窗口(Context Window)。它决定了AI在同一时间能"看到"多少信息。

目前主流模型的上下文窗口：
- GPT-4o: 128K tokens
- Claude 3.5 Sonnet: 200K tokens  
- Gemini 1.5 Pro: 2M tokens

但这里有个陷阱：上下文窗口大不等于用好上下文窗口。很多人把大量历史对话都塞进去，结果模型被噪音淹没，真正重要的信息反而被稀释了。

实战技巧：**用摘要而非原始对话填充上下文**。

不要把过去50轮对话的原始内容都塞进去，而是定期把对话精华提炼成一段200字的摘要：

```python
class ConversationSummarizer:
    """对话摘要器：将长对话压缩成精华记忆"""
    
    def __init__(self, llm):
        self.llm = llm
    
    def summarize(self, conversation_history: list[dict]) -> str:
        """
        输入: [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]
        输出: 一段精炼的摘要
        """
        prompt = f"""你是一个记忆提炼专家。请从以下对话中提取关键信息，生成一段200字以内的摘要。
        
要求：
1. 记录用户的核心需求和偏好
2. 记录已确定的重要决策
3. 记录未解决的关键问题
4. 用第一人称"用户"来描述用户的信息

对话内容：
{self._format_conversation(conversation_history)}

摘要："""
        
        response = self.llm.invoke(prompt)
        return response.content
    
    def _format_conversation(self, history: list[dict]) -> str:
        return "\n".join([
            f"{'用户' if msg['role']=='user' else '助理'}: {msg['content'][:200]}"
            for msg in history[-10:]  # 只取最近10轮，避免过长
        ])
```

##### 长期记忆：向量数据库的妙用

长期记忆解决的是"跨对话记住用户"的问题。你上周让AI帮你写过一篇公众号文章，这周又让它帮你写，它应该记得你上次写的什么主题、什么风格、发了什么平台、效果怎么样。

实现长期记忆的核心是**向量数据库**。当用户做出重要表述或我们形成重要洞察时，把这些内容编码成向量存进去。下次对话时，把相关记忆取出来作为上下文。

```python
from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from datetime import datetime

class LongTermMemory:
    """长期记忆系统：基于向量数据库的用户偏好存储"""
    
    def __init__(self, persist_directory: str = "./memory_store"):
        self.embeddings = OpenAIEmbeddings()
        self.vectorstore = Chroma(
            persist_directory=persist_directory,
            embedding_function=self.embeddings
        )
    
    def store(self, content: str, memory_type: str, metadata: dict = None):
        """
        存储一条记忆
        - content: 记忆内容
        - memory_type: 记忆类型 (preference|project|habit|feedback)
        - metadata: 附加元信息
        """
        doc = {
            "content": content,
            "type": memory_type,
            "created_at": datetime.now().isoformat(),
            **(metadata or {})
        }
        
        # 存储到向量数据库
        self.vectorstore.add_texts(
            texts=[content],
            metadatas=[doc]
        )
    
    def recall(self, query: str, memory_type: str = None, top_k: int = 5) -> list[dict]:
        """
        检索相关记忆
        """
        filter_dict = {"type": memory_type} if memory_type else None
        
        results = self.vectorstore.similarity_search_with_score(
            query=query,
            k=top_k,
            filter=filter_dict
        )
        
        return [
            {"content": doc.page_content, "metadata": doc.metadata, "score": score}
            for doc, score in results
        ]
    
    def get_user_profile(self) -> dict:
        """
        获取用户画像：汇总所有偏好类记忆
        """
        prefs = self.recall("", memory_type="preference", top_k=10)
        habits = self.recall("", memory_type="habit", top_k=10)
        
        return {
            "preferences": [p["content"] for p in prefs],
            "habits": [h["content"] for h in habits]
        }
```

**什么时候该存长期记忆？**

不是所有对话都要存。存太多会让检索结果变得嘈杂。以下场景值得存储：

1. 用户明确表达偏好："我更喜欢这种风格"
2. 完成了重要任务："这是我们公司第三季度的数据报表模板"
3. 踩过的坑："上次在这个字段上出过bug"
4. 关键决策："我们决定用PostgreSQL而不是MySQL"

##### 工作记忆：任务状态的临时存储

工作记忆是Agent在执行当前任务时的"草稿纸"。它记录当前任务的执行状态、中间结果、下一步计划。

```python
from typing import TypedDict, Optional
from enum import Enum

class TaskState(TypedDict):
    """工作记忆：记录当前任务的执行状态"""
    
    task_id: str
    original_goal: str
    current_step: int
    total_steps: int
    steps_completed: list[str]
    steps_pending: list[str]
    intermediate_results: dict
    errors_encountered: list[str]
    context_window_summary: str  # 压缩后的上下文摘要

class WorkingMemory:
    """工作记忆管理器"""
    
    def __init__(self):
        self.states: dict[str, TaskState] = {}
    
    def create_task(self, goal: str) -> str:
        task_id = f"task_{datetime.now().timestamp()}"
        self.states[task_id] = TaskState(
            task_id=task_id,
            original_goal=goal,
            current_step=0,
            total_steps=0,
            steps_completed=[],
            steps_pending=[],
            intermediate_results={},
            errors_encountered=[],
            context_window_summary=""
        )
        return task_id
    
    def update_step(self, task_id: str, step_name: str, result: any = None):
        state = self.states.get(task_id)
        if not state:
            return
        
        state["current_step"] += 1
        state["steps_completed"].append(step_name)
        if result:
            state["intermediate_results"][step_name] = result
    
    def plan_next_steps(self, task_id: str, steps: list[str]):
        """制定下一步计划"""
        state = self.states.get(task_id)
        if state:
            state["steps_pending"] = steps
            state["total_steps"] = len(steps)
    
    def get_progress_report(self, task_id: str) -> str:
        """生成进度报告"""
        state = self.states.get(task_id)
        if not state:
            return "任务不存在"
        
        progress = f"任务进度：{state['current_step']}/{state['total_steps']}\n"
        progress += f"已完成：{', '.join(state['steps_completed'])}\n"
        if state["steps_pending"]:
            progress += f"待完成：{', '.join(state['steps_pending'])}"
        
        return progress
```

###### 11.2.2 人格设定：不是角色扮演，是行为契约

很多人在做人格设定时容易犯一个错误：把人格当成一个角色设定，塞一堆形容词进去就觉得完事了。"你是一个专业、友好、高效的AI助手"——这种描述对模型行为的指导作用约等于零。

真正的人格设定，是一份**行为契约**，明确规定在不同情境下应该怎么做。

人格由三个维度构成：

**专业度维度**：这个助理在专业问题上能走多深？

```python
PERSONA_PROFESSIONALISM = """
#### 专业度设定

###### 知识边界
- 熟悉领域：Python、Web开发、数据分析、产品设计
- 谨慎领域：金融投资建议、医疗诊断、法律条文
- 未知领域：明确表示不知道，不编造

###### 专业行为准则
1. 遇到不确定的技术问题时，先说"我理解你的需求是...，有几个可能的方案"，而不是直接给出一个可能错误的答案
2. 涉及敏感决策时，给出权衡分析而非单一建议
3. 代码示例必须包含错误处理和边界情况考虑
"""
```

**主动性维度**：这个助理在什么情况下该主动出击？

```python
PERSONA_PROACTIVITY = """
#### 主动性设定

###### 主动行为触发条件
1. 检测到用户可能遗漏的重要步骤时
2. 发现用户反复遇到同一个问题时
3. 任务完成或阶段性完成后
4. 检测到潜在风险或错误时

###### 不主动行为
1. 不主动提供与当前任务无关的建议
2. 不主动纠正用户非关键性的选择
3. 不主动询问过多问题(超过3个连续提问视为过界)

###### 主动行为示例
正确：检测到用户代码没有try-except，主动提示
错误：突然跟用户聊起天气
"""
```

**沟通风格维度**：这个助理怎么说人话？

```python
PERSONA_COMMUNICATION = """
#### 沟通风格设定

###### 语气规则
- 技术问题：直接、精准、不绕弯子
- 安慰鼓励：简短、真诚、不油腻
- 解释概念：用类比、举例子、避免术语轰炸
- 承认错误：直接承认、说明原因、提出补救

###### 禁止用语
- "作为一个AI模型..."
- "根据我的分析..."
- 过度使用"当然"、"当然可以"等客套话

###### 鼓励用语
- 简洁的技术表达
- 直接的肯定或否定
- 适度的幽默感(允许自嘲)
"""
```

把三个维度组合起来，就是一个完整的人格设定。在实际使用时，把这些规则整合到系统提示词中：

```python
def build_system_prompt(user_name: str = None, custom_rules: list[str] = None) -> str:
    """构建完整的系统提示词"""
    
    base = f"""
你是一个AI开发助理，名字叫DevBuddy。

#### 核心定位
帮助用户高效完成软件开发相关的任务，包括代码编写、调试优化、架构设计、技术调研等。

#### 人格规则
{PERSONA_PROFESSIONALISM}

{PERSONA_PROACTIVITY}

{PERSONA_COMMUNICATION}

#### 当前用户
{f"当前用户是{user_name}" if user_name else "新用户，暂无信息"}
"""
    
    if custom_rules:
        base += f"\n\n## 用户自定义规则\n" + "\n".join(custom_rules)
    
    return base
```

###### 11.2.3 工具系统：Agent的"手和脚"

一个只能说话的Agent助理，价值有限。真正的助理得有"手脚"——能执行操作的工具系统。

工具分为两类：**内置工具**和**外置Skill**。

**内置工具**是Agent助理自带的基础能力，比如：

```python
class BuiltInTools:
    """内置工具集"""
    
    @staticmethod
    def calculator(expression: str) -> str:
        """数学计算"""
        try:
            result = eval(expression)
            return str(result)
        except Exception as e:
            return f"计算错误: {e}"
    
    @staticmethod
    def datetime_now() -> str:
        """获取当前时间"""
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    @staticmethod
    def file_reader(path: str, encoding: str = "utf-8") -> str:
        """读取文件"""
        with open(path, "r", encoding=encoding) as f:
            return f.read()
    
    @staticmethod
    def search_web(query: str) -> str:
        """网络搜索"""
        # 实际实现会调用搜索API
        pass
```

**外置Skill**是更复杂的扩展能力，我们下一节会重点讲。

工具的调用遵循一个标准流程：

```
用户请求 → 模型判断需要哪些工具 → 按顺序调用 → 收集结果 → 整合响应
```

这其中有个关键问题：**工具描述的质量直接决定调用准确性**。

```python
##### 好的工具描述
good_tool_desc = {
    "name": "code_search",
    "description": "在项目代码库中搜索包含特定关键词的文件和代码段。适用于：查找某个函数的实现、定位特定功能的代码位置、搜索使用了某个API的代码。当用户说"帮我找一下处理登录的代码在哪里"时使用。",
    "parameters": {
        "type": "object",
        "properties": {
            "keyword": {"type": "string", "description": "搜索关键词"},
            "file_type": {"type": "string", "description": "文件类型，如.py、.js等，可不填"}
        },
        "required": ["keyword"]
    }
}

##### 不好的工具描述
bad_tool_desc = {
    "name": "search",
    "description": "搜索代码",
    "parameters": {
        "keyword": "搜索词"
    }
}
```

###### 11.2.4 长期规划：让Agent不只是低头干活

普通Agent是"低头干活型"，给什么任务就干什么，不会抬头看路。Agent助理需要具备**长期规划能力**。

长期规划包括三个核心能力：

**目标分解**：把大目标拆成可执行的小步骤

```python
class GoalDecomposer:
    """目标分解器"""
    
    def __init__(self, llm):
        self.llm = llm
    
    def decompose(self, goal: str, context: str = "") -> list[dict]:
        """
        分解目标为可执行步骤
        返回: [{"step": 1, "description": "...", "tool_needed": None}]
        """
        prompt = f"""将以下目标分解为具体的执行步骤。

目标：{goal}

{context}

请按以下JSON格式返回步骤列表：
[
  {{"step": 1, "description": "步骤描述", "tool_needed": "需要的工具(如有)"}},
  ...
]

规则：
1. 每个步骤应该可以在一个对话轮次内完成
2. 步骤之间有明确的依赖关系
3. 考虑可能的异常情况和边界条件
"""
        
        response = self.llm.invoke(prompt)
        # 解析JSON响应
        import json
        try:
            return json.loads(response.content)
        except:
            return [{"step": 1, "description": goal, "tool_needed": None}]
```

**进度追踪**：记住做到哪了

进度追踪依赖于我们之前讲的工作记忆系统。Agent助理在执行过程中持续更新任务状态：

```python
async def execute_with_tracking(self, task_id: str, goal: str):
    """带进度追踪的任务执行"""
    
    # 1. 分解目标
    steps = self.goal_decomposer.decompose(goal)
    self.working_memory.plan_next_steps(task_id, [s["description"] for s in steps])
    
    # 2. 按步骤执行
    for step in steps:
        try:
            # 执行当前步骤
            result = await self.execute_step(step)
            
            # 更新进度
            self.working_memory.update_step(task_id, step["description"], result)
            
            # 向用户汇报进度
            progress = self.working_memory.get_progress_report(task_id)
            await self.notify_user(f"✅ {step['description']} 完成\n{progress}")
            
        except Exception as e:
            self.working_memory["errors_encountered"].append(str(e))
            await self.notify_user(f"⚠️ 步骤 {step['step']} 遇到问题: {e}")
            # 决定是否继续或暂停
            if not await self.ask_continue():
                break
```

**主动推进**：不是等用户问，而是主动汇报

这是区分普通Agent和Agent助理的关键能力。Agent助理会在以下时刻主动行动：

1. **阶段性完成时**：自动汇报进展，不需要用户催
2. **发现问题时**：主动提示风险，不等问题爆发
3. **用户可能忘记时**：适时提醒，比如周报提交日的前一天
4. **任务长期无进展时**：主动询问是否需要帮助

```python
class ProactiveNotifier:
    """主动通知系统"""
    
    def __init__(self, agent):
        self.agent = agent
    
    async def on_step_complete(self, task_id: str, step: dict, result: any):
        """步骤完成通知"""
        message = f"""
✨ 任务更新

**{step['description']}** 已完成

{self.format_result_preview(result)}

{self.agent.working_memory.get_progress_report(task_id)}
"""
        await self.send_message(message)
    
    async def on_error_detected(self, task_id: str, error: str, context: str):
        """发现问题通知"""
        message = f"""
⚠️ 需要注意

检测到以下问题：
{error}

相关上下文：
{context}

建议：
1. 检查配置是否正确
2. 查看是否有遗漏的前置步骤
3. 需要我帮你排查吗？
"""
        await self.send_message(message)
    
    async def on_long_inactivity(self, task_id: str, hours: int):
        """长期无进展提醒"""
        message = f"""
💤 任务暂停提醒

您有一个任务已经{hours}小时没有进展了：
{self.agent.working_memory.states[task_id]['original_goal']}

{self.agent.working_memory.get_progress_report(task_id)}

是否需要我继续推进，或者有其他问题需要解决？
"""
        await self.send_message(message)
```

---

#### 11.3 Skill开发：让Agent拥有可复用的能力模块

终于到了这章最核心的部分：Skill开发。

如果你理解了前面讲的内容，Agent助理的骨架已经清楚了。但光有骨架不够，你需要给它装上真正的"能力"——这就是Skill的作用。

###### 11.3.1 什么是Skill：从函数到能力的抽象

**普通函数 vs Skill的区别**

很多人可能会问：Skill不就是写个函数吗？我直接在代码里写函数不就行了？

这个问题问得好。让我用一个对比来说明：

```python
##### 普通函数
def get_weather(city: str) -> str:
    """获取天气"""
    response = requests.get(f"https://api.weather.com/?city={city}")
    return response.json()["weather"]

##### Skill
class WeatherSkill:
    """
    天气查询Skill
    
    ## 元信息
    - name: weather_query
    - version: 1.0.0
    - description: 查询指定城市的当前天气和未来三天预报
    - input_schema: {"city": {"type": "string", "required": true}}
    - output_schema: {"temperature": "int", "weather": "string", "forecast": []}
    
    ## 依赖
    - 需要 weather API token
    
    ## 使用示例
    用户："北京今天天气怎么样"
    调用：WeatherSkill().execute(city="北京")
    """
    
    def __init__(self):
        self.name = "weather_query"
        self.version = "1.0.0"
        self.description = "查询指定城市的当前天气和未来三天预报"
    
    def get_manifest(self) -> dict:
        """返回Skill的元信息描述"""
        return {
            "name": self.name,
            "version": self.version,
            "description": self.description,
            "input_schema": {
                "type": "object",
                "properties": {
                    "city": {"type": "string", "description": "城市名称", "required": True}
                }
            },
            "output_schema": {
                "type": "object",
                "properties": {
                    "temperature": {"type": "integer", "description": "当前温度(摄氏度)"},
                    "weather": {"type": "string", "description": "天气状况"},
                    "forecast": {"type": "array", "description": "未来三天预报"}
                }
            }
        }
    
    def validate_input(self, params: dict) -> tuple[bool, str]:
        """验证输入参数"""
        if "city" not in params:
            return False, "缺少必需参数: city"
        if not isinstance(params["city"], str):
            return False, "city必须是字符串"
        return True, ""
    
    def execute(self, city: str) -> dict:
        """执行天气查询"""
        # 实际实现
        pass
```

区别在哪里？

1. **元信息完整**：Skill有完整的描述、版本、输入输出schema，Agent能理解它是什么、怎么用
2. **自文档化**：代码本身就包含了使用说明，不需要额外的文档
3. **可被发现**：通过manifest，Agent能知道有哪些Skill可用
4. **可被组合**：多个Skill可以串联工作

**Skill的三个层次**

Skill不是铁板一块，它有清晰的层次结构：

```
Skill层次
├── 原子能力层
│   ├── file_reader: 读取文件
│   ├── web_search: 网络搜索
│   └── calculator: 数学计算
│
├── 组合能力层
│   ├── code_search = file_reader + keyword_matching
│   ├── data_extract = web_search + content_parsing
│   └── report_generator = data_query + template_render
│
└── 工作流层
    ├── 每日简报 = schedule + search + summarize + notify
    ├── 代码审查 = repo_scan + issue_detect + report_gen
    └── 需求分析 = requirement_collect + tech_research + solution_design
```

**Skill的元信息规范**

每个Skill都应该有完整的元信息：

```python
from typing import Optional
from dataclasses import dataclass, field
from enum import Enum

class SkillCategory(Enum):
    DATA = "data"           # 数据处理
    WEB = "web"             # 网络相关
    FILE = "file"           # 文件操作
    COMMUNICATION = "comm" # 通讯通知
    AI = "ai"               # AI能力
    INTEGRATION = "integ"   # 第三方集成

@dataclass
class SkillDependency:
    """Skill依赖"""
    skill_name: str
    version_range: str  # e.g., ">=1.0.0"
    required: bool = True

@dataclass  
class SkillManifest:
    """Skill的元信息清单"""
    
    # 基础信息
    name: str                    # 唯一标识，如 "web_content_extractor"
    version: str                 # 语义化版本，如 "1.2.0"
    display_name: str            # 展示名称，如 "网页内容提取器"
    description: str             # 一句话描述
    long_description: str        # 详细描述
    
    # 分类与标签
    category: SkillCategory
    tags: list[str] = field(default_factory=list)
    
    # 接口定义
    input_schema: dict
    output_schema: dict
    error_codes: dict = field(default_factory=dict)
    
    # 依赖关系
    dependencies: list[SkillDependency] = field(default_factory=list)
    environment_vars: list[str] = field(default_factory=list)
    
    # 能力边界
    rate_limit: Optional[int] = None        # 每分钟调用次数限制
    timeout: int = 30                       # 超时时间(秒)
    retryable: bool = True                  # 是否可重试
    
    # 生命周期
    created_at: str
    updated_at: str
    deprecated: bool = False
    deprecation_message: Optional[str] = None
    
    def to_dict(self) -> dict:
        """序列化为字典"""
        return {
            "name": self.name,
            "version": self.version,
            "display_name": self.display_name,
            "description": self.description,
            "long_description": self.long_description,
            "category": self.category.value,
            "tags": self.tags,
            "input_schema": self.input_schema,
            "output_schema": self.output_schema,
            "error_codes": self.error_codes,
            "dependencies": [
                {"skill_name": d.skill_name, "version_range": d.version_range}
                for d in self.dependencies
            ],
            "environment_vars": self.environment_vars,
            "rate_limit": self.rate_limit,
            "timeout": self.timeout,
            "retryable": self.retryable,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "deprecated": self.deprecated
        }
```

###### 11.3.2 Skill设计原则

经过大量实战，我总结出Skill设计的四条黄金原则：

**原则一：单一职责**

一个Skill只做一件事，而且要把这件事做到极致。

反例：
```python
##### 错误示范：什么都干的Skill
class DataSkill:
    def execute(self, operation: str, **kwargs):
        if operation == "extract":
            # 提取逻辑
        elif operation == "transform":
            # 转换逻辑
        elif operation == "load":
            # 加载逻辑
        elif operation == "analyze":
            # 分析逻辑
```

正例：
```python
##### 正确示范：一个Skill只做一件事
class DataExtractor:
    """只负责从各种来源提取数据"""
    pass

class DataTransformer:
    """只负责数据格式转换和清洗"""
    pass

class DataLoader:
    """只负责把数据加载到目标位置"""
    pass

class DataAnalyzer:
    """只负责数据分析"""
    pass
```

为什么要这么分？因为只有单一职责的Skill才容易被组合、被测试、被替换。

**原则二：可组合**

设计Skill时要考虑它能和其他什么Skill配合工作。

```python
class DataExtractor:
    """数据提取器 - 专注于提取"""
    
    def execute(self, source: str, format: str) -> bytes:
        """提取数据，返回原始字节"""
        pass
    
    def get_capabilities(self) -> list[str]:
        """声明自己的能力，方便其他Skill了解"""
        return ["csv", "json", "excel", "api"]
```

**原则三：可测试**

每个Skill都要有明确的可测试性标准：

```python
class TestableSkill:
    """可测试的Skill基类"""
    
    def test_success_cases(self) -> list[dict]:
        """
        返回成功测试用例
        [
            {"input": {...}, "expected_output": {...}, "description": "..."}
        ]
        """
        raise NotImplementedError
    
    def test_failure_cases(self) -> list[dict]:
        """
        返回失败测试用例
        [
            {"input": {...}, "expected_error": "...", "description": "..."}
        ]
        """
        raise NotImplementedError
    
    def run_tests(self) -> dict:
        """运行所有测试，返回结果"""
        results = {"passed": [], "failed": []}
        
        for case in self.test_success_cases():
            try:
                result = self.execute(**case["input"])
                # 验证结果是否符合预期
                if self._match_expected(result, case["expected_output"]):
                    results["passed"].append(case["description"])
                else:
                    results["failed"].append({
                        "description": case["description"],
                        "reason": "output mismatch"
                    })
            except Exception as e:
                results["failed"].append({
                    "description": case["description"],
                    "reason": str(e)
                })
        
        return results
```

**原则四：容错性**

一个Skill失败不应该拖垮整个Agent。设计时要考虑：

1. **超时控制**：每个Skill调用都要有超时限制
2. **错误隔离**：捕获异常，返回有意义的错误信息而不是直接崩溃
3. **优雅降级**：当某个Skill不可用时，能用备选方案

```python
class ResilientSkill(ABC):
    """有容错能力的Skill基类"""
    
    timeout: int = 30
    
    async def execute_safe(self, **kwargs) -> SkillResult:
        """带容错机制的执行"""
        try:
            # 带超时的执行
            result = await asyncio.wait_for(
                self.execute(**kwargs),
                timeout=self.timeout
            )
            return SkillResult(success=True, data=result)
            
        except asyncio.TimeoutError:
            return SkillResult(
                success=False,
                error="TIMEOUT",
                message=f"执行超时({self.timeout}秒)"
            )
            
        except ValidationError as e:
            return SkillResult(
                success=False,
                error="VALIDATION_ERROR",
                message=str(e)
            )
            
        except Exception as e:
            # 记录错误，但不要让异常传播
            logger.error(f"Skill {self.name} 执行失败: {e}")
            return SkillResult(
                success=False,
                error="EXECUTION_ERROR",
                message=f"执行出错: {str(e)}"
            )

@dataclass
class SkillResult:
    """Skill执行结果"""
    success: bool
    data: Any = None
    error: str = None
    message: str = None
```

###### 11.3.3 Skill开发实战：从0开发一个完整Skill

理论讲完了，现在来实战。我们开发一个"网页内容提取Skill"，这是一个非常实用的高频需求。

**案例背景**：用户经常需要从网页中提取特定信息，比如文章标题、正文内容、作者、发布时间、商品价格等。每次都让大模型去理解HTML太慢太贵，我们需要一个专门的Skill来处理。

**需求分析**

1. 输入：一个URL和提取目标
2. 处理：抓取网页，提取结构化内容
3. 输出：JSON格式的结构化数据

**第一步：定义Manifest**

```python
from datetime import datetime

class WebContentExtractorSkill:
    """
    网页内容提取Skill
    
    从指定URL中提取结构化内容，支持：
    - 文章类：标题、正文、作者、发布时间
    - 商品类：名称、价格、评分、评论数
    - 列表类：列表项标题、链接、图片
    
    ## 版本历史
    - 1.0.0 (2024-01): 初始版本
    - 1.1.0 (2024-03): 支持更多内容类型
    - 1.2.0 (2024-06): 添加自定义CSS选择器支持
    """
    
    def __init__(self, config: dict = None):
        self.config = config or {}
        self.name = "web_content_extractor"
        self.version = "1.2.0"
        self.timeout = self.config.get("timeout", 30)
    
    def get_manifest(self) -> SkillManifest:
        """获取Skill元信息"""
        return SkillManifest(
            name=self.name,
            version=self.version,
            display_name="网页内容提取器",
            description="从URL中提取结构化的网页内容",
            long_description="""
这是一个通用的网页内容提取Skill，适用于以下场景：

1. **文章提取**：新闻、博客、文档等文章类页面
2. **商品信息提取**：电商平台的商品详情页
3. **列表提取**：列表页中的多个条目
4. **自定义提取**：通过CSS选择器提取任意内容

支持的提取目标：
- 基础信息：title, description, keywords, author
- 文章内容：content, publish_date, category
- 商品信息：price, rating, reviews, stock
- 自定义：通过CSS选择器或XPath
            """,
            category=SkillCategory.WEB,
            tags=["web", "extraction", "parsing", "html"],
            
            input_schema={
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "要提取的网页URL",
                        "examples": ["https://news.example.com/article/123"]
                    },
                    "target": {
                        "type": "string",
                        "description": "提取目标类型",
                        "enum": ["auto", "article", "product", "list", "custom"],
                        "default": "auto"
                    },
                    "fields": {
                        "type": "array",
                        "description": "指定要提取的字段",
                        "items": {
                            "type": "string",
                            "enum": ["title", "content", "author", "publish_date", 
                                   "price", "rating", "image", "custom"]
                        },
                        "default": ["title", "content"]
                    },
                    "custom_selectors": {
                        "type": "object",
                        "description": "自定义CSS选择器，当target=custom时使用",
                        "properties": {
                            "field_name": {"type": "string", "description": "CSS选择器"}
                        },
                        "default": {}
                    },
                    "options": {
                        "type": "object",
                        "description": "额外选项",
                        "properties": {
                            "extract_images": {"type": "boolean", "default": False},
                            "clean_html": {"type": "boolean", "default": True},
                            "max_length": {"type": "integer", "description": "内容最大长度", "default": 50000}
                        },
                        "default": {}
                    }
                },
                "required": ["url"]
            },
            
            output_schema={
                "type": "object",
                "properties": {
                    "success": {"type": "boolean"},
                    "url": {"type": "string"},
                    "title": {"type": "string"},
                    "extracted_data": {
                        "type": "object",
                        "description": "提取的字段数据"
                    },
                    "metadata": {
                        "type": "object",
                        "properties": {
                            "extracted_at": {"type": "string"},
                            "processing_time_ms": {"type": "integer"},
                            "content_type": {"type": "string"}
                        }
                    },
                    "error": {"type": "string", "description": "错误信息(如有)"}
                }
            },
            
            error_codes={
                "INVALID_URL": "URL格式无效或无法访问",
                "TIMEOUT": "网页加载超时",
                "PARSE_ERROR": "HTML解析失败",
                "EXTRACTION_FAILED": "内容提取失败",
                "RATE_LIMIT": "请求过于频繁"
            },
            
            dependencies=[],
            environment_vars=["HTTP_PROXY", "USER_AGENT"],
            rate_limit=60,  # 每分钟最多60次
            timeout=30,
            retryable=True,
            created_at="2024-01-15T00:00:00Z",
            updated_at=datetime.now().isoformat() + "Z"
        )
```

**第二步：核心实现**

```python
import asyncio
import aiohttp
from bs4 import BeautifulSoup
from dataclasses import dataclass, asdict
from typing import Optional
import re
from urllib.parse import urlparse

@dataclass
class ExtractionResult:
    """提取结果"""
    success: bool
    url: str
    title: str = ""
    extracted_data: dict = None
    metadata: dict = None
    error: Optional[str] = None
    
    def to_dict(self) -> dict:
        result = {
            "success": self.success,
            "url": self.url,
            "title": self.title,
            "extracted_data": self.extracted_data or {},
            "metadata": self.metadata or {}
        }
        if self.error:
            result["error"] = self.error
        return result


class WebContentExtractorSkill:
    """网页内容提取Skill - 核心实现"""
    
    # 常见内容类型的CSS选择器
    SELECTORS = {
        "article": {
            "title": ["h1.title", "h1.article-title", "article h1", ".post-title"],
            "content": ["article.content", "div.article-body", ".post-content", 
                       "[itemprop=articleBody]", "main article"],
            "author": ["[rel=author]", ".author", ".byline", "[itemprop=author]"],
            "publish_date": ["time[datetime]", ".publish-date", "[itemprop=datePublished]"],
        },
        "product": {
            "title": ["h1.product-title", ".product-name", "[itemprop=name]"],
            "price": ["[itemprop=price]", ".price", ".product-price"],
            "rating": ["[itemprop=ratingValue]", ".rating", ".stars"],
            "reviews": [".review-count", ".reviews-count"],
        }
    }
    
    def __init__(self, config: dict = None):
        self.config = config or {}
        self.name = "web_content_extractor"
        self.version = "1.2.0"
        self.timeout = self.config.get("timeout", 30)
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def _get_session(self) -> aiohttp.ClientSession:
        """获取或创建HTTP会话"""
        if self.session is None or self.session.closed:
            timeout = aiohttp.ClientTimeout(total=self.timeout)
            self.session = aiohttp.ClientSession(timeout=timeout)
        return self.session
    
    async def close(self):
        """关闭HTTP会话"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def execute(self, url: str, target: str = "auto",
                     fields: list[str] = None, 
                     custom_selectors: dict = None,
                     options: dict = None) -> ExtractionResult:
        """
        执行网页内容提取
        
        Args:
            url: 要提取的网页URL
            target: 内容类型 (auto/article/product/list/custom)
            fields: 要提取的字段列表
            custom_selectors: 自定义CSS选择器
            options: 额外选项
            
        Returns:
            ExtractionResult: 提取结果
        """
        import time
        start_time = time.time()
        
        options = options or {}
        fields = fields or ["title", "content"]
        custom_selectors = custom_selectors or {}
        
        # 1. 验证URL
        if not self._validate_url(url):
            return ExtractionResult(
                success=False,
                url=url,
                error="INVALID_URL"
            )
        
        # 2. 抓取网页
        html_content = await self._fetch_html(url)
        if html_content is None:
            return ExtractionResult(
                success=False,
                url=url,
                error="TIMEOUT"
            )
        
        # 3. 解析HTML
        soup = BeautifulSoup(html_content, "html.parser")
        
        # 4. 如果是auto模式，自动检测内容类型
        if target == "auto":
            target = self._detect_content_type(soup)
        
        # 5. 提取数据
        extracted_data = await self._extract_data(
            soup, target, fields, custom_selectors, options
        )
        
        # 6. 获取标题
        title = self._extract_title(soup)
        
        # 7. 构建结果
        processing_time = int((time.time() - start_time) * 1000)
        
        return ExtractionResult(
            success=True,
            url=url,
            title=title,
            extracted_data=extracted_data,
            metadata={
                "extracted_at": datetime.now().isoformat(),
                "processing_time_ms": processing_time,
                "content_type": target
            }
        )
    
    def _validate_url(self, url: str) -> bool:
        """验证URL格式"""
        try:
            result = urlparse(url)
            return all([result.scheme in ("http", "https"), result.netloc])
        except:
            return False
    
    async def _fetch_html(self, url: str) -> Optional[str]:
        """抓取网页HTML"""
        session = await self._get_session()
        
        headers = {
            "User-Agent": self.config.get(
                "user_agent",
                "Mozilla/5.0 (compatible; ContentExtractor/1.0)"
            )
        }
        
        try:
            async with session.get(url, headers=headers) as response:
                if response.status == 200:
                    return await response.text()
                elif response.status == 429:
                    return None  # 限流
                else:
                    return None
        except asyncio.TimeoutError:
            return None
        except Exception:
            return None
    
    def _detect_content_type(self, soup: BeautifulSoup) -> str:
        """自动检测内容类型"""
        # 检测是否是商品页
        if soup.select_one("[itemprop=price]") or soup.select_one(".product-price"):
            return "product"
        
        # 检测是否是文章页
        if soup.select_one("article") or soup.select_one(".article-body"):
            return "article"
        
        # 默认按文章处理
        return "article"
    
    async def _extract_data(self, soup: BeautifulSoup, target: str,
                          fields: list[str], custom_selectors: dict,
                          options: dict) -> dict:
        """根据目标类型和字段提取数据"""
        result = {}
        selectors = self.SELECTORS.get(target, {})
        
        for field in fields:
            if field == "custom" and custom_selectors:
                # 自定义选择器提取
                for field_name, selector in custom_selectors.items():
                    result[field_name] = self._extract_by_selector(soup, selector, options)
            elif field in selectors:
                # 使用预定义选择器
                result[field] = self._extract_by_selector(
                    soup, selectors[field], options
                )
        
        # 额外选项处理
        if options.get("extract_images"):
            result["images"] = self._extract_images(soup)
        
        return result
    
    def _extract_by_selector(self, soup: BeautifulSoup, 
                             selectors: list[str],
                             options: dict) -> any:
        """使用CSS选择器提取内容"""
        for selector in selectors:
            element = soup.select_one(selector)
            if element:
                if options.get("clean_html", True):
                    # 清理HTML，保留纯文本
                    return self._clean_text(element.get_text())
                else:
                    return str(element)
        return None
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        """提取页面标题"""
        # 优先使用og:title
        og_title = soup.select_one('meta[property="og:title"]')
        if og_title:
            return og_title.get("content", "")
        
        # 其次使用h1
        h1 = soup.select_one("h1")
        if h1:
            return h1.get_text().strip()
        
        # 最后使用title标签
        title_tag = soup.select_one("title")
        if title_tag:
            return title_tag.get_text().strip()
        
        return ""
    
    def _extract_images(self, soup: BeautifulSoup) -> list[str]:
        """提取页面中的图片URL"""
        images = []
        for img in soup.select("img[src]"):
            src = img.get("src")
            if src and src.startswith("http"):
                images.append(src)
        return images[:10]  # 最多返回10张
    
    def _clean_text(self, text: str) -> str:
        """清理文本"""
        if not text:
            return ""
        # 移除多余空白
        text = re.sub(r"\s+", " ", text)
        return text.strip()
```

**第三步：添加错误处理和重试机制**

```python
from typing import Protocol

class RetryStrategy(Protocol):
    """重试策略协议"""
    def should_retry(self, attempt: int, error: str) -> bool: ...
    def get_delay(self, attempt: int) -> float: ...


class ExponentialBackoff:
    """指数退避重试策略"""
    
    def __init__(self, max_attempts: int = 3, base_delay: float = 1.0,
                 max_delay: float = 30.0):
        self.max_attempts = max_attempts
        self.base_delay = base_delay
        self.max_delay = max_delay
    
    def should_retry(self, attempt: int, error: str) -> bool:
        if attempt >= self.max_attempts:
            return False
        # 这些错误可以重试
        retryable_errors = ["TIMEOUT", "RATE_LIMIT", "ConnectionError"]
        return any(e in error for e in retryable_errors)
    
    def get_delay(self, attempt: int) -> float:
        delay = self.base_delay * (2 ** attempt)
        return min(delay, self.max_delay)


class ResilientWebExtractor(WebContentExtractorSkill):
    """带重试和错误处理的健壮版本"""
    
    def __init__(self, config: dict = None, retry_strategy: RetryStrategy = None):
        super().__init__(config)
        self.retry_strategy = retry_strategy or ExponentialBackoff()
    
    async def execute_with_retry(self, **kwargs) -> ExtractionResult:
        """带重试的执行"""
        last_error = None
        
        for attempt in range(self.retry_strategy.max_attempts):
            result = await self.execute(**kwargs)
            
            if result.success:
                return result
            
            last_error = result.error
            
            # 检查是否应该重试
            if not self.retry_strategy.should_retry(attempt + 1, last_error):
                break
            
            # 等待后重试
            delay = self.retry_strategy.get_delay(attempt)
            await asyncio.sleep(delay)
        
        # 所有重试都失败
        return ExtractionResult(
            success=False,
            url=kwargs.get("url", ""),
            error=last_error
        )
```

**第四步：编写测试**

```python
import pytest
from unittest.mock import AsyncMock, patch, MagicMock

class TestWebContentExtractor:
    """测试用例"""
    
    @pytest.fixture
    def skill(self):
        return WebContentExtractorSkill()
    
    @pytest.fixture
    def sample_html(self):
        return """
        <html>
            <head><title>测试文章</title></head>
            <body>
                <article>
                    <h1 class="title">这是一篇测试文章</h1>
                    <div class="article-body">
                        <p>这是文章正文内容。</p>
                        <p>包含多段落。</p>
                    </div>
                    <span class="author">张三</span>
                    <time datetime="2024-01-15">2024年1月15日</time>
                </article>
            </body>
        </html>
        """
    
    # ========== 成功场景测试 ==========
    
    def test_manifest_has_required_fields(self, skill):
        """验证Manifest包含必需字段"""
        manifest = skill.get_manifest()
        
        assert manifest.name == "web_content_extractor"
        assert manifest.version == "1.2.0"
        assert manifest.input_schema is not None
        assert manifest.output_schema is not None
    
    def test_validate_url_valid(self, skill):
        """验证有效URL"""
        assert skill._validate_url("https://example.com/article/1") is True
        assert skill._validate_url("http://example.com") is True
    
    def test_validate_url_invalid(self, skill):
        """验证无效URL"""
        assert skill._validate_url("not-a-url") is False
        assert skill._validate_url("ftp://example.com") is False
        assert skill._validate_url("") is False
    
    def test_clean_text(self, skill):
        """测试文本清理"""
        dirty = "  多个   空白\n\n应该\t被清理  "
        clean = skill._clean_text(dirty)
        assert clean == "多个 空白 应该 被清理"
    
    # ========== 失败场景测试 ==========
    
    def test_validate_url_missing_scheme(self, skill):
        """测试缺少协议前缀"""
        assert skill._validate_url("example.com") is False
    
    # ========== 集成测试 ==========
    
    @pytest.mark.asyncio
    async def test_extract_article_success(self, skill, sample_html):
        """测试文章内容提取"""
        with patch.object(skill, '_fetch_html', return_value=sample_html):
            result = await skill.execute(
                url="https://example.com/article/1",
                target="article",
                fields=["title", "content", "author"]
            )
            
            assert result.success is True
            assert result.title == "这是一篇测试文章"
            assert "文章正文内容" in result.extracted_data.get("content", "")
            assert result.extracted_data.get("author") == "张三"


##### 运行测试
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
```

**第五步：编写文档**

```markdown
##### WebContentExtractorSkill 使用文档

#### 快速开始

```python
from web_content_extractor import WebContentExtractorSkill

##### 初始化
skill = WebContentExtractorSkill()

##### 执行提取
result = await skill.execute(
    url="https://example.com/article/123",
    target="article",
    fields=["title", "content", "author"]
)

if result.success:
    print(f"标题: {result.title}")
    print(f"内容: {result.extracted_data['content']}")
```

#### 使用场景

###### 1. 提取新闻文章

```python
result = await skill.execute(
    url="https://news.example.com/tech/2024/01/15/ai-news",
    target="article",
    fields=["title", "content", "author", "publish_date"]
)
```

###### 2. 提取商品信息

```python
result = await skill.execute(
    url="https://shop.example.com/product/456",
    target="product",
    fields=["title", "price", "rating"]
)
```

###### 3. 自定义提取

```python
result = await skill.execute(
    url="https://example.com/page",
    target="custom",
    custom_selectors={
        "price": ".special-price",
        "shipping": "#shipping-info"
    }
)
```

#### 错误处理

```python
result = await skill.execute(url="...")

if not result.success:
    if result.error == "INVALID_URL":
        print("URL无效")
    elif result.error == "TIMEOUT":
        print("请求超时")
    elif result.error == "RATE_LIMIT":
        print("请求过于频繁，请稍后重试")
```

#### 性能建议

1. **批量提取时添加延迟**：建议每次请求间隔1秒
2. **使用缓存**：对于重复URL，先检查缓存
3. **设置合理的超时**：默认30秒足够大部分场景
4. **监控限流**：429响应表示被限流，需要降低请求频率
```

###### 11.3.4 Skill注册与发现机制

开发完Skill之后，Agent怎么知道有哪些Skill可用？这就涉及到Skill的注册与发现机制。

**Skill Manifest的注册**

```python
class SkillRegistry:
    """Skill注册中心"""
    
    def __init__(self):
        self.skills: dict[str, type] = {}
        self.manifests: dict[str, dict] = {}
    
    def register(self, skill_class: type, manifest: SkillManifest = None):
        """注册一个Skill"""
        instance = skill_class()
        skill_name = instance.name
        
        self.skills[skill_name] = skill_class
        
        # 如果没有传入manifest，从实例获取
        if manifest is None:
            manifest = instance.get_manifest()
        
        self.manifests[skill_name] = manifest.to_dict() if hasattr(manifest, 'to_dict') else manifest
    
    def get_skill(self, name: str) -> type:
        """获取Skill类"""
        return self.skills.get(name)
    
    def get_manifest(self, name: str) -> dict:
        """获取Skill的manifest"""
        return self.manifests.get(name)
    
    def list_skills(self, category: str = None) -> list[dict]:
        """列出所有注册的Skill"""
        skills = list(self.manifests.values())
        
        if category:
            skills = [s for s in skills if s.get("category") == category]
        
        return skills
    
    def search_skills(self, query: str) -> list[dict]:
        """搜索Skill"""
        results = []
        query_lower = query.lower()
        
        for manifest in self.manifests.values():
            # 匹配名称、描述、标签
            searchable = " ".join([
                manifest.get("name", ""),
                manifest.get("description", ""),
                manifest.get("display_name", ""),
                " ".join(manifest.get("tags", []))
            ]).lower()
            
            if query_lower in searchable:
                results.append(manifest)
        
        return results


##### 使用示例
registry = SkillRegistry()
registry.register(WebContentExtractorSkill)

##### 列出所有技能
all_skills = registry.list_skills()

##### 搜索技能
web_skills = registry.search_skills("网页 提取")

##### 获取特定技能
extractor_manifest = registry.get_manifest("web_content_extractor")
```

**Agent动态加载Skill**

```python
class DynamicSkillLoader:
    """动态Skill加载器"""
    
    def __init__(self, registry: SkillRegistry):
        self.registry = registry
        self.loaded_instances: dict[str, any] = {}
    
    def load_skill(self, name: str, config: dict = None) -> any:
        """动态加载一个Skill实例"""
        if name in self.loaded_instances:
            return self.loaded_instances[name]
        
        skill_class = self.registry.get_skill(name)
        if not skill_class:
            raise ValueError(f"Skill '{name}' 未注册")
        
        instance = skill_class(config=config)
        self.loaded_instances[name] = instance
        return instance
    
    def load_skills_for_task(self, task: str) -> list[any]:
        """根据任务需求加载相关Skill"""
        # 搜索相关Skill
        relevant_manifests = self.registry.search_skills(task)
        
        loaded = []
        for manifest in relevant_manifests:
            try:
                skill = self.load_skill(manifest["name"])
                loaded.append(skill)
            except Exception as e:
                logger.warning(f"加载Skill {manifest['name']} 失败: {e}")
        
        return loaded
    
    def unload_skill(self, name: str):
        """卸载Skill实例"""
        if name in self.loaded_instances:
            instance = self.loaded_instances[name]
            # 调用清理方法
            if hasattr(instance, 'close'):
                instance.close()
            del self.loaded_instances[name]
```

###### 11.3.5 Skill组合：用多个Skill构建复杂工作流

单个Skill的能力有限，真正强大的能力来自于Skill的组合。

**三种组合模式**

```python
from enum import Enum
from typing import Callable, Any
from dataclasses import dataclass

class WorkflowMode(Enum):
    SEQUENCE = "sequence"    # 串联：上一个的输出是下一个的输入
    PARALLEL = "parallel"     # 并行：多个Skill同时执行
    CONDITIONAL = "conditional"  # 条件：根据结果决定下一步

@dataclass
class WorkflowStep:
    """工作流步骤"""
    skill_name: str
    input_mapping: dict  # 如何从前一步获取输入
    condition: Callable[[dict], bool] = None  # 条件函数


class SkillWorkflow:
    """Skill组合工作流"""
    
    def __init__(self, name: str, mode: WorkflowMode):
        self.name = name
        self.mode = mode
        self.steps: list[WorkflowStep] = []
        self.skill_loader = None
    
    def add_step(self, skill_name: str, input_mapping: dict = None):
        """添加工作流步骤"""
        self.steps.append(WorkflowStep(
            skill_name=skill_name,
            input_mapping=input_mapping or {}
        ))
        return self  # 支持链式调用
    
    def when(self, condition: Callable[[dict], bool]):
        """为上一步添加条件"""
        if self.steps:
            self.steps[-1].condition = condition
        return self
    
    async def execute(self, initial_input: dict) -> dict:
        """执行工作流"""
        context = {"input": initial_input, "results": {}}
        
        for i, step in enumerate(self.steps):
            # 获取Skill实例
            skill = self.skill_loader.load_skill(step.skill_name)
            
            # 准备输入
            step_input = self._prepare_input(step.input_mapping, context)
            
            # 检查条件
            if step.condition and not step.condition(context["results"].get(f"step_{i-1}")):
                context["results"][f"step_{i}"] = {"skipped": True}
                continue
            
            # 执行Skill
            result = await skill.execute(**step_input)
            context["results"][f"step_{i}"] = result
        
        return context
```

**实战：每日简报生成工作流**

这是一个典型的组合场景：定时触发 → 搜索热点 → 摘要生成 → 格式化 → 发送通知。

```python
async def create_daily_briefing_workflow():
    """创建每日简报工作流"""
    
    # 1. 定义工作流
    workflow = SkillWorkflow(
        name="daily_briefing",
        mode=WorkflowMode.SEQUENCE
    )
    
    # 2. 添加步骤
    workflow.add_step(
        "schedule_checker",
        input_mapping={"task": "daily_briefing"}
    ).add_step(
        "news_search",
        input_mapping={
            "keywords": {"from_result": "step_0", "field": "keywords"},
            "limit": 10
        }
    ).add_step(
        "content_summarizer",
        input_mapping={
            "content": {"from_result": "step_1", "field": "articles"},
            "style": "briefing"
        }
    ).add_step(
        "template_renderer",
        input_mapping={
            "template": "daily_briefing",
            "data": {"from_result": "step_2", "field": "summary"}
        }
    ).add_step(
        "notification_sender",
        input_mapping={
            "channel": "email",
            "content": {"from_result": "step_3", "field": "rendered"}
        }
    )
    
    return workflow


##### 执行工作流
workflow = await create_daily_briefing_workflow()
workflow.skill_loader = skill_loader

result = await workflow.execute({
    "user_id": "user_123",
    "topics": ["AI", "Technology", "Startups"]
})

print(f"简报生成完成: {result['results']['step_4']['success']}")
```

---

#### 11.4 Agent助理开发框架对比

现在你有了完整的Skill开发能力，接下来要考虑的是：**用哪个框架来搭建Agent助理？**

市面上有三个主流选择：Coze（扣子）、Dify、LangGraph自研。每个都有它的适用场景。

###### 11.4.1 Coze（扣子）：低代码快速验证

**适用场景**：
- 快速MVP验证
- 非技术团队
- 对接字节生态（抖音、飞书）

**核心能力**：
- 工作流编辑器：可视化编排Agent逻辑
- 插件市场：丰富的外接能力
- 知识库：RAG能力内置
- Bot发布：一键发布到多个平台

**优点**：
1. 上手极快，拖拽即可完成基础配置
2. 有成熟的插件生态，减少重复开发
3. 内置记忆和人格设定功能
4. 支持多渠道发布

**缺点**：
1. 灵活性受限，复杂逻辑难以实现
2. 定制化程度低
3. 依赖平台，数据主权受限
4. 成本随调用量线性增长

**典型用法**：

```
用户问"帮我分析这篇文档"
    ↓
知识库检索(找到相关文档片段)
    ↓
工作流编排(按模板格式化输出)
    ↓
返回结果
```

###### 11.4.2 Dify：开源私有化首选

**适用场景**：
- 需要私有化部署
- 有技术团队，想自控数据
- 需要深度定制Agent逻辑

**核心能力**：
- 完整的Agent框架：ReAct、Function Call等
- RAG引擎：文档处理+向量检索
- 工作流编排：比Coze更灵活
- 数据集管理：支持多种数据源

**优点**：
1. 开源可控，代码可以fork修改
2. 私有部署，数据不出企业
3. 支持复杂的RAG流程
4. 社区活跃，插件丰富

**缺点**：
1. 部署和维护需要一定技术能力
2. UI体验不如Coze
3. 插件质量参差不齐
4. 更新维护靠社区

**与Coze的差异**：

| 维度 | Coze | Dify |
|------|------|------|
| 部署方式 | SaaS/私有云 | 私有部署为主 |
| 目标用户 | 非技术团队 | 技术团队 |
| 灵活性 | 中 | 高 |
| 插件生态 | 成熟 | 一般 |
| 成本 | 按调用付费 | 基础设施成本 |

###### 11.4.3 LangGraph自研：复杂场景必选

**适用场景**：
- 业务逻辑极其复杂
- 需要深度定制记忆系统
- 多Agent协作场景
- 对性能和延迟有严格要求

**优点**：
1. 完全控制，想怎么改就怎么改
2. 可以深度定制记忆和规划系统
3. 支持复杂的多Agent协作
4. 性能可以极致优化

**缺点**：
1. 开发成本最高
2. 需要较强的LangChain/LangGraph能力
3. 维护成本高
4. 容易陷入过度工程

**自研架构模板**：

```python
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

class AgentState(TypedDict):
    """Agent状态定义"""
    messages: list
    user_profile: dict
    task_state: dict
    current_task_id: str
    long_term_memory: list

def build_agent_graph():
    """构建Agent处理图"""
    
    # 1. 创建图
    graph = StateGraph(AgentState)
    
    # 2. 添加节点
    graph.add_node("understand_intent", understand_intent_node)
    graph.add_node("retrieve_memory", retrieve_memory_node)
    graph.add_node("plan_action", plan_action_node)
    graph.add_node("execute_skill", execute_skill_node)
    graph.add_node("update_memory", update_memory_node)
    graph.add_node("generate_response", generate_response_node)
    
    # 3. 定义边
    graph.add_edge("understand_intent", "retrieve_memory")
    graph.add_edge("retrieve_memory", "plan_action")
    graph.add_edge("plan_action", "execute_skill")
    graph.add_edge("execute_skill", END)
    graph.add_edge("update_memory", END)
    
    # 4. 编译
    return graph.compile()


async def understand_intent_node(state: AgentState) -> AgentState:
    """理解用户意图"""
    last_message = state["messages"][-1]["content"]
    intent = await llm.ainvoke(f"分析用户意图: {last_message}")
    return {"intent": intent}


##### 完整实现见第9章LangGraph实战
```

###### 11.4.4 选型决策树

```
                    ┌─────────────────┐
                    │ 开始选型         │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ 团队技术能力？   │
                    └────────┬────────┘
                             │
            ┌─────────────────┼─────────────────┐
            │                 │                 │
      ┌─────▼─────┐    ┌─────▼─────┐    ┌─────▼─────┐
      │ 非技术团队 │    │ 技术团队   │    │ 技术大牛   │
      └─────┬─────┘    └─────┬─────┘    └─────┬─────┘
            │                 │                 │
            ▼                 ▼                 ▼
    ┌───────────┐     ┌─────────────┐    ┌────────────┐
    │ 快速验证？ │     │ 需要私有化？│    │ 逻辑复杂？  │
    └─────┬─────┘     └──────┬──────┘    └─────┬──────┘
          │                  │                  │
    ┌─────┴─────┐       ┌────┴────┐       ┌────┴────┐
    │是      否 │       │是       │否     │是      否│
    ▼           ▼       ▼         ▼       ▼          ▼
    Coze      Coze    Dify      Dify   LangGraph   LangGraph
```

**实战建议**：

1. **初期验证**：先用Coze，2周内出MVP
2. **产品化阶段**：迁移到Dify，掌控数据
3. **深度定制**：基于LangGraph自研，适合复杂业务

---

#### 11.5 实战：从0构建一个AI开发助理

终于到了最激动人心的部分。我们要把前面学的所有东西串起来，从零构建一个真正可用的AI开发助理。

###### 11.5.1 需求分析：这个助理要能做什么？

先明确我们的目标：

```
AI开发助理 DevBuddy 需求
├── 代码助手能力
│   ├── 代码生成和补全
│   ├── 代码审查和优化建议
│   ├── Bug定位和修复建议
│   └── 技术方案设计
├── 项目管理能力
│   ├── 理解项目结构和上下文
│   ├── 生成项目文档
│   └── 追踪开发进度
├── 学习成长能力
│   ├── 记住用户偏好
│   ├── 记住技术栈选择
│   └── 持续优化交互风格
└── 主动服务能力
    ├── 主动发现问题
    ├── 主动提醒待办
    └── 阶段性成果汇报
```

###### 11.5.2 Skill设计

基于需求，我们设计以下Skill：

```
DevBuddy Skill 矩阵
├── code_writer      代码编写
├── code_reviewer    代码审查
├── bug_fixer        Bug修复
├── tech_researcher  技术调研
├── doc_generator    文档生成
├── repo_analyzer    仓库分析
├── web_searcher     网络搜索
└── notifier         通知发送
```

###### 11.5.3 完整代码实现

```python
"""
DevBuddy - AI开发助理
一个完整的Agent助理实现
"""

import asyncio
import os
from typing import Optional
from datetime import datetime
from dataclasses import dataclass, field
from enum import Enum

##### 导入我们之前定义的组件
from memory_system import LongTermMemory, WorkingMemory, ConversationSummarizer
from persona import build_system_prompt
from skill_base import SkillRegistry, DynamicSkillLoader, ResilientSkill
from workflow import SkillWorkflow


class DevBuddy:
    """
    AI开发助理 - DevBuddy
    
    核心能力：
    1. 代码助手：生成、审查、优化代码
    2. 项目理解：理解项目结构和上下文
    3. 主动服务：发现问题、提醒进度、汇报成果
    4. 持续学习：记住用户偏好，持续优化
    """
    
    def __init__(self, config: dict = None):
        self.config = config or {}
        
        # 初始化核心组件
        self._init_llm()
        self._init_memory()
        self._init_persona()
        self._init_skills()
        self._init_workflows()
    
    def _init_llm(self):
        """初始化LLM"""
        from langchain_openai import ChatOpenAI
        
        self.llm = ChatOpenAI(
            model=self.config.get("model", "gpt-4o"),
            api_key=self.config.get("openai_api_key", os.getenv("OPENAI_API_KEY")),
            temperature=0.7
        )
    
    def _init_memory(self):
        """初始化记忆系统"""
        self.long_term_memory = LongTermMemory(
            persist_directory=self.config.get("memory_dir", "./devbuddy_memory")
        )
        self.working_memory = WorkingMemory()
        self.summarizer = ConversationSummarizer(self.llm)
    
    def _init_persona(self):
        """初始化人格系统"""
        self.system_prompt = build_system_prompt(
            user_name=self.config.get("user_name"),
            custom_rules=self.config.get("custom_rules", [])
        )
    
    def _init_skills(self):
        """初始化Skill系统"""
        # 创建Skill注册中心
        self.skill_registry = SkillRegistry()
        
        # 注册DevBuddy的专属Skill
        self._register_devbuddy_skills()
        
        # 创建Skill加载器
        self.skill_loader = DynamicSkillLoader(self.skill_registry)
    
    def _register_devbuddy_skills(self):
        """注册DevBuddy的专属Skill"""
        from skills.code_writer import CodeWriterSkill
        from skills.code_reviewer import CodeReviewerSkill
        from skills.bug_fixer import BugFixerSkill
        from skills.doc_generator import DocGeneratorSkill
        from skills.repo_analyzer import RepoAnalyzerSkill
        
        self.skill_registry.register(CodeWriterSkill)
        self.skill_registry.register(CodeReviewerSkill)
        self.skill_registry.register(BugFixerSkill)
        self.skill_registry.register(DocGeneratorSkill)
        self.skill_registry.register(RepoAnalyzerSkill)
    
    def _init_workflows(self):
        """初始化常用工作流"""
        # 代码审查工作流
        self.code_review_workflow = self._build_code_review_workflow()
        
        # 新功能开发工作流
        self.feature_development_workflow = self._build_feature_development_workflow()
    
    def _build_code_review_workflow(self) -> SkillWorkflow:
        """构建代码审查工作流"""
        workflow = SkillWorkflow("code_review", WorkflowMode.SEQUENCE)
        workflow.skill_loader = self.skill_loader
        
        (workflow
            .add_step("repo_analyzer", {"mode": "changed_files"})
            .add_step("code_reviewer", {})
            .add_step("doc_generator", {"template": "review_report"})
            .add_step("notifier", {"channel": "slack"}))
        
        return workflow
    
    def _build_feature_development_workflow(self) -> SkillWorkflow:
        """构建功能开发工作流"""
        workflow = SkillWorkflow("feature_dev", WorkflowMode.CONDITIONAL)
        workflow.skill_loader = self.skill_loader
        
        (workflow
            .add_step("requirement_clarifier", {})
            .add_step("tech_researcher", {})
            .add_step("code_writer", {}))
        
        return workflow
    
    async def chat(self, user_input: str, context: dict = None) -> dict:
        """
        处理用户对话
        
        Args:
            user_input: 用户输入
            context: 额外上下文
            
        Returns:
            dict: 响应结果
        """
        # 1. 获取用户记忆
        user_profile = self.long_term_memory.get_user_profile()
        
        # 2. 理解用户意图
        intent = await self._understand_intent(user_input)
        
        # 3. 决定处理策略
        if intent["requires_action"]:
            # 需要执行Skill
            return await self._handle_action(intent, user_input, context)
        else:
            # 闲聊或简单问答
            return await self._handle_conversation(user_input, user_profile)
    
    async def _understand_intent(self, user_input: str) -> dict:
        """理解用户意图"""
        prompt = f"""分析用户输入，判断其意图。

用户输入：{user_input}

请返回JSON格式：
{{
    "intent": "code_generation|code_review|bug_fix|chat|other",
    "requires_action": true/false,
    "target_files": ["相关文件路径"],
    "skill_needed": "需要的Skill名称(如有)"
}}
"""
        response = await self.llm.ainvoke(prompt)
        import json
        return json.loads(response.content)
    
    async def _handle_action(self, intent: dict, user_input: str, context: dict) -> dict:
        """处理需要执行Skill的动作"""
        skill_name = intent.get("skill_needed")
        
        if not skill_name:
            return {"success": False, "message": "无法确定需要的技能"}
        
        # 加载Skill
        try:
            skill = self.skill_loader.load_skill(skill_name)
        except ValueError:
            return {"success": False, "message": f"技能 {skill_name} 不可用"}
        
        # 执行Skill
        result = await skill.execute(
            user_input=user_input,
            context=context or {}
        )
        
        # 更新长期记忆（重要决策）
        if result.get("success") and result.get("important"):
            self.long_term_memory.store(
                content=f"用户执行了{skill_name}，结果：{result.get('summary')}",
                memory_type="action",
                metadata={"skill": skill_name, "intent": intent["intent"]}
            )
        
        return result
    
    async def _handle_conversation(self, user_input: str, user_profile: dict) -> dict:
        """处理对话"""
        # 构建上下文
        context = f"""
当前用户信息：
- 偏好：{user_profile.get('preferences', [])}
- 习惯：{user_profile.get('habits', [])}

用户输入：{user_input}

请以DevBuddy的身份回复。
"""
        
        response = await self.llm.ainvoke(self.system_prompt + context)
        
        return {
            "success": True,
            "message": response.content,
            "type": "conversation"
        }
    
    async def proactive_check(self):
        """
        主动检查 - 定时任务
        检查是否有需要主动提醒用户的事项
        """
        # 检查点：
        # 1. 是否有长时间未完成的任务
        # 2. 是否有代码提交但未审查
        # 3. 是否到了周报/月报提交时间
        # 4. 用户是否有未读的重要通知
        
        checks = [
            self._check_pending_tasks(),
            self._check_unreviewed_code(),
            self._check_report_deadlines(),
        ]
        
        results = await asyncio.gather(*checks, return_exceptions=True)
        
        notifications = [r for r in results if r and not isinstance(r, Exception)]
        
        if notifications:
            await self._send_notifications(notifications)
    
    async def _check_pending_tasks(self) -> Optional[dict]:
        """检查待处理任务"""
        # 实现任务检查逻辑
        pass
    
    async def _check_unreviewed_code(self) -> Optional[dict]:
        """检查未审查代码"""
        pass
    
    async def _check_report_deadlines(self) -> Optional[dict]:
        """检查报告截止日期"""
        pass
    
    async def _send_notifications(self, notifications: list[dict]):
        """发送通知"""
        for notification in notifications:
            # 实现通知发送
            pass


##### ========== 启动入口 ==========

async def main():
    """DevBuddy启动入口"""
    
    config = {
        "model": "gpt-4o",
        "user_name": "开发者",
        "memory_dir": "./devbuddy_memory",
        "custom_rules": [
            "用户使用中文，回复使用中文",
            "代码示例必须包含注释",
            "遇到不确定的问题，直接说明，不要编造"
        ]
    }
    
    # 创建DevBuddy实例
    devbuddy = DevBuddy(config)
    
    # 启动对话循环
    print("DevBuddy 已启动！输入你的问题或请求（输入 'exit' 退出）\n")
    
    while True:
        try:
            user_input = input("你: ").strip()
            
            if user_input.lower() in ["exit", "quit", "退出"]:
                print("\nDevBuddy: 再见！有问题随时叫我。")
                break
            
            if not user_input:
                continue
            
            response = await devbuddy.chat(user_input)
            print(f"\nDevBuddy: {response.get('message', '处理中...')}\n")
            
        except KeyboardInterrupt:
            print("\n\nDevBuddy: 被中断了，下次见！")
            break
        except Exception as e:
            print(f"\n发生错误: {e}\n")


if __name__ == "__main__":
    asyncio.run(main())
```

###### 11.5.5 部署上线

让你的DevBuddy 24小时在线，有几种方案：

**方案1：简单的轮询Bot**

```python
##### main.py
from fastapi import FastAPI
from pydantic import BaseModel
import asyncio

app = FastAPI()

devbuddy = DevBuddy()

class ChatRequest(BaseModel):
    message: str
    user_id: str

@app.post("/chat")
async def chat(request: ChatRequest):
    response = await devbuddy.chat(
        request.message,
        context={"user_id": request.user_id}
    )
    return response

##### 启动：uvicorn main:app --host 0.0.0.0 --port 8000
```

**方案2：部署到云服务**

```yaml
##### docker-compose.yml
version: '3.8'

services:
  devbuddy:
    build: .
    ports:
      - "8000:8000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - REDIS_URL=redis://cache:6379
    depends_on:
      - redis
    
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    
  # 可选：Celery worker用于后台任务
  worker:
    build: .
    command: celery -A tasks worker
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
```

---

#### 11.6 Agent助理的评测与迭代

产品做出来了，怎么知道它好不好用？这就涉及到Agent助理的评测体系。

###### 11.6.1 评测维度

一个Agent助理好不好用，要从多个维度评估：

| 维度 | 指标 | 评测方法 |
|------|------|----------|
| **功能性** | 任务完成率、步骤准确率 | 自动化测试 |
| **响应质量** | 答案准确性、实用性 | 人工评估 |
| **效率** | 响应时间、Token消耗 | 日志分析 |
| **稳定性** | 错误率、超时率 | 监控数据 |
| **用户体验** | 满意度、NPS | 用户调研 |
| **主动性** | 主动提醒质量 | 案例抽查 |

###### 11.6.2 自动化评测方案

```python
from typing import list
from dataclasses import dataclass
import asyncio

@dataclass
class TestCase:
    """评测用例"""
    name: str
    user_input: str
    expected_behavior: str
    evaluation_criteria: list[str]

@dataclass
class EvaluationResult:
    """评测结果"""
    test_case: TestCase
    passed: bool
    score: float  # 0-1
    feedback: str
    execution_time: float

class AgentEvaluator:
    """Agent助理评测器"""
    
    def __init__(self, agent: DevBuddy):
        self.agent = agent
        self.test_cases: list[TestCase] = []
    
    def add_test_case(self, test_case: TestCase):
        """添加测试用例"""
        self.test_cases.append(test_case)
    
    async def run_evaluation(self) -> dict:
        """运行完整评测"""
        results = []
        
        for test_case in self.test_cases:
            result = await self._evaluate_single(test_case)
            results.append(result)
        
        return self._generate_report(results)
    
    async def _evaluate_single(self, test_case: TestCase) -> EvaluationResult:
        """评测单个用例"""
        import time
        start_time = time.time()
        
        # 执行测试
        response = await self.agent.chat(test_case.user_input)
        
        # 评估结果
        score, feedback = self._evaluate_response(
            response, 
            test_case.expected_behavior,
            test_case.evaluation_criteria
        )
        
        execution_time = time.time() - start_time
        
        return EvaluationResult(
            test_case=test_case,
            passed=score >= 0.7,
            score=score,
            feedback=feedback,
            execution_time=execution_time
        )
    
    def _evaluate_response(self, response: dict, expected: str, 
                          criteria: list[str]) -> tuple[float, str]:
        """评估响应质量"""
        # 这里可以用LLM来评估
        prompt = f"""评估Agent助理的回复质量。

用户输入：{self.test_cases[-1].user_input}
期望行为：{expected}
实际回复：{response.get('message', '')}

评估标准：
{chr(10).join(f"- {c}" for c in criteria)}

请返回：
1. 得分(0-1)
2. 简短评语
"""
        # ... LLM评估逻辑
        pass
    
    def _generate_report(self, results: list[EvaluationResult]) -> dict:
        """生成评测报告"""
        total = len(results)
        passed = sum(1 for r in results if r.passed)
        
        return {
            "summary": {
                "total_tests": total,
                "passed": passed,
                "pass_rate": f"{passed/total*100:.1f}%",
                "avg_score": sum(r.score for r in results) / total,
                "avg_execution_time": sum(r.execution_time for r in results) / total
            },
            "detailed_results": [
                {
                    "name": r.test_case.name,
                    "passed": r.passed,
                    "score": r.score,
                    "feedback": r.feedback,
                    "execution_time": f"{r.execution_time:.2f}s"
                }
                for r in results
            ]
        }


##### 使用示例
async def run_devbuddy_evaluation():
    evaluator = AgentEvaluator(devbuddy)
    
    # 添加测试用例
    evaluator.add_test_case(TestCase(
        name="代码生成测试",
        user_input="帮我写一个Python的快速排序函数",
        expected_behavior="生成正确、可运行的快速排序代码",
        evaluation_criteria=[
            "代码正确性：能正确排序",
            "代码质量：有注释、命名规范",
            "边界处理：包含空数组、单元素数组处理"
        ]
    ))
    
    evaluator.add_test_case(TestCase(
        name="Bug修复测试",
        user_input="我的代码出现IndexError，怎么解决？",
        expected_behavior="能正确定位问题并给出修复方案",
        evaluation_criteria=[
            "问题定位准确",
            "修复方案有效",
            "解释清晰"
        ]
    ))
    
    # 运行评测
    report = await evaluator.run_evaluation()
    
    print(f"""
========== DevBuddy 评测报告 ==========

通过率：{report['summary']['pass_rate']}
平均得分：{report['summary']['avg_score']:.2f}
平均执行时间：{report['summary']['avg_execution_time']:.2f}s

详细结果：
""")
    
    for result in report['detailed_results']:
        status = "✅" if result['passed'] else "❌"
        print(f"{status} {result['name']}: {result['score']:.2f} - {result['feedback']}")
```

###### 11.6.3 用户反馈收集

自动化评测不够，用户真实反馈同样重要：

```python
class FeedbackCollector:
    """用户反馈收集器"""
    
    def __init__(self, storage):
        self.storage = storage
    
    async def collect_rating(self, session_id: str, message_id: str, 
                           rating: int, comment: str = None):
        """收集用户评分"""
        feedback = {
            "session_id": session_id,
            "message_id": message_id,
            "rating": rating,
            "comment": comment,
            "timestamp": datetime.now().isoformat()
        }
        
        await self.storage.store("feedback", feedback)
        
        # 如果评分低，主动分析原因
        if rating <= 2:
            await self._analyze_low_rating(feedback)
    
    async def _analyze_low_rating(self, feedback: dict):
        """分析低评分原因"""
        # 调用LLM分析可能的改进点
        analysis = await llm.ainvoke(f"""
分析这个低分反馈的可能原因：
评分：{feedback['rating']}/5
评论：{feedback.get('comment', '无')}

可能原因：
1. 回答不准确
2. 理解偏差
3. 响应太慢
4. 主动过度
5. 其他

建议的改进措施：
""")
        
        # 存储分析结果，用于后续优化
        await self.storage.store("improvement", {
            "feedback": feedback,
            "analysis": analysis.content,
            "timestamp": datetime.now().isoformat()
        })
```

###### 11.6.4 A/B测试

```python
class ABTestRunner:
    """A/B测试运行器"""
    
    def __init__(self):
        self.experiments: dict[str, dict] = {}
    
    def create_experiment(self, name: str, variants: list[dict]):
        """
        创建A/B测试
        
        variants: [
            {"name": "control", "config": {...}},
            {"name": "variant_a", "config": {...}}
        ]
        """
        self.experiments[name] = {
            "variants": variants,
            "results": {v["name"]: {"count": 0, "success": 0} for v in variants}
        }
    
    def get_variant(self, experiment_name: str, user_id: str) -> dict:
        """获取用户应该看到的变体"""
        import hashlib
        
        # 简单的哈希分配，确保同一用户始终看到同一变体
        hash_value = int(hashlib.md5(f"{experiment_name}:{user_id}".encode()).hexdigest(), 16)
        variants = self.experiments[experiment_name]["variants"]
        index = hash_value % len(variants)
        
        return variants[index]
    
    def record_result(self, experiment_name: str, variant_name: str, 
                     success: bool):
        """记录测试结果"""
        self.experiments[experiment_name]["results"][variant_name]["count"] += 1
        if success:
            self.experiments[experiment_name]["results"][variant_name]["success"] += 1
    
    def get_experiment_report(self, experiment_name: str) -> dict:
        """获取实验报告"""
        results = self.experiments[experiment_name]["results"]
        
        report = {}
        for variant, data in results.items():
            count = data["count"]
            success = data["success"]
            rate = success / count if count > 0 else 0
            
            report[variant] = {
                "sample_size": count,
                "success_rate": f"{rate*100:.1f}%",
                "confidence": self._calculate_confidence(count, rate)
            }
        
        return report
```

---

#### 11.7 商业化思考：Agent助理的产品化路径

技术做得好，不代表能卖得好。这一节我们来聊聊Agent助理怎么商业化。

###### 11.7.1 从技术到产品还差什么？

**差1：明确的用户价值**

很多技术人做的Agent助理，解决的是"我觉得用户可能需要"的问题，而不是"用户告诉我他需要"的问题。

**差2：可量化的ROI**

企业愿意付费的产品，必须能算出来"用了这个产品，帮我省了多少钱/多了多少收入"。

比如一个代码审查Agent，如果能证明"使用后线上Bug减少30%"，这就是可量化的价值。

**差3：企业级可靠性**

ToB产品不是"能用就行"，需要：
- SLA保障
- 数据安全
- 合规审计
- 技术支持

**差4：清晰的定价模型**

按调用量？按用户数？按功能模块？定价模型决定了商业模式。

###### 11.7.2 常见商业模式

**模式1：SaaS订阅**

```
定价：$29/人/月（基础版） → $99/人/月（专业版） → 定制企业版

优势：
- 稳定的经常性收入
- 容易规模化

挑战：
- 需要持续证明价值，否则用户流失
- 获客成本高
```

**模式2：API按量付费**

```
定价：$0.01/次基础调用，$0.1/次复杂调用

优势：
- 用户按需付费，门槛低
- 弹性扩展

挑战：
- 收入不稳定
- 容易被价格敏感的开发者薅羊毛
```

**模式3：垂直行业定制**

```
定价：项目制，$50K-500K/项目

优势：
- 客单价高
- 竞争壁垒强

挑战：
- 规模化难
- 定制化程度高，难以复用
```

###### 11.7.3 真实案例

**案例1：Cursor - AI代码编辑器**

- **定位**：AI加持的代码编辑器
- **商业模式**：SaaS订阅，$20/月
- **成功关键**：
  - 精准切入开发场景
  - 与VS Code生态无缝衔接
  - 代码生成质量过硬

**案例2：Notion AI - 文档助手**

- **定位**：文档写作的AI助手
- **商业模式**：附加订阅，$10/用户/月
- **成功关键**：
  - 借助Notion现有用户基础
  - 场景明确（写作辅助）
  - 按需使用，不强制

**案例3：Harvey AI - 法律AI**

- **定位**：服务顶级律所的AI助手
- **商业模式**：企业定制，按效果付费
- **成功关键**：
  - 垂直领域深耕
  - 高端客户背书
  - 合规优先

###### 11.7.4 商业化建议

1. **先验证付费意愿，再投入开发**

在花3个月开发产品之前，先用人工服务跑通流程，验证用户真的愿意为这个能力付钱。

2. **从中小企业切入**

大企业决策周期长、要求多、账期长。中小企业更适合快速验证。

3. **做好用量监控**

你必须清楚知道每个用户的真实使用量和成本结构，否则定价就是在盲猜。

4. **重视NPS**

净推荐值是SaaS产品的生命线。NPS高于50%的产品，才能实现口碑增长。

---

#### 本章行动清单

好了，内容讲完了。让我帮你整理一下这章的核心行动项：

###### 立即可做

- [ ] **设计你的第一个Skill**：选一个你日常重复做的事情（提取网页数据、整理文件格式等），用这章教的方法把它封装成Skill
- [ ] **实现记忆系统**：在你的AI助手里加入至少一层记忆（长期记忆用向量数据库），测试一下"跨对话记住用户"的体验
- [ ] **跑一个自动化评测**：设计10个测试用例，跑一遍你的Agent助理，看看通过率有多少

###### 本周规划

- [ ] **完成一个完整工作流**：用Skill组合实现一个具体的自动化流程（代码审查、每日简报、数据分析等）
- [ ] **收集用户反馈**：找5个真实用户测试你的Agent助理，认真收集他们的反馈
- [ ] **对比框架选型**：根据你的场景，选择Coze/Dify/LangGraph，并说明理由

###### 长期建设

- [ ] **建立评测体系**：把自动化评测固化到CI/CD流程里，每次更新自动跑一遍
- [ ] **设计商业路径**：如果你的Agent助理有商业化打算，先想清楚这3个问题：谁会付钱？为什么付钱？付多少钱？

---

#### 尾声

写到最后，我突然想说点不那么技术的话。

Agent助理这波浪潮，确实给AI应用开发带来了巨大的机会。但我也看到太多人，一头扎进技术细节里，做了一个"看起来很厉害但没人用"的产品。

**技术只是手段，用户价值才是目的。**

一个真正好的Agent助理，不在于它用了多牛的模型、接了多少个Skill、用了多复杂的记忆系统。真正的评判标准只有一个：**它有没有让用户的生活或工作变得更好？**

如果你做完这章的练习，回头看自己的Agent助理，发现它确实帮用户省了时间、减少了出错、让工作变得更愉快——那这章的目的就达到了。

如果还没有，那就继续迭代。

技术永远在进步，但解决问题的初心不应该变。

我们下章见。

---

**附：完整代码仓库结构**

```
devbuddy/
├── core/
│   ├── __init__.py
│   ├── agent.py              # 主Agent类
│   ├── memory.py             # 记忆系统
│   ├── persona.py            # 人格系统
│   └── llm.py                # LLM封装
├── skills/
│   ├── __init__.py
│   ├── base.py               # Skill基类
│   ├── code_writer.py        # 代码编写
│   ├── code_reviewer.py      # 代码审查
│   ├── web_extractor.py      # 网页提取
│   └── ...
├── workflows/
│   ├── __init__.py
│   ├── base.py               # 工作流基类
│   └── daily_briefing.py      # 每日简报
├── tests/
│   ├── __init__.py
│   ├── test_skills.py
│   └── test_agent.py
├── config/
│   └── default.yaml
├── main.py                   # 入口
└── requirements.txt
```

---

*本章完*
