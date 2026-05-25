---
outline: [2, 3]
---

# 第6章 RAG：检索增强生成

## 本章你能带走什么

如果说第5章教你"怎么让大模型听你的话"，那这一章就是教你"怎么让大模型知道它原本不知道的事"。

RAG（Retrieval-Augmented Generation，检索增强生成）是AI应用开发最核心的技术之一。你去面试，80%会问到RAG；你做项目，十个项目有九个需要RAG。原因很简单：大模型再强，也有知识边界——它不知道你公司的内部文档、不了解你们特有的业务流程、不会用你们最新的产品数据。RAG就是来解决这个问题的。

但很多同学学RAG只学了皮毛——知道个向量检索、随便切切块、调几个参数就觉得OK了。面试官随便深问两句就露馅：重排序怎么做的？为什么你这个场景要用语义切块而不是递归切块？Self-RAG和CRAG的区别是什么？多模态文档怎么处理？

这一章我带你从原理到实战，从基础链路到高级架构，把RAG彻底吃透。学完你能：

- 深入理解RAG的本质：不只是"检索+生成"，而是一套解决知识边界问题的系统工程
- 掌握文本切块的N种策略：递归切块、语义切块、Parent-Child，以及什么时候用什么
- 选对Embedding模型：2026年中文Embedding哪家强，怎么微调，什么时候需要微调
- 玩转检索策略：混合检索、重排序、查询改写、自适应检索，从80分做到95分
- 理解高级RAG架构：Self-RAG、CRAG、Multi-hop RAG、Agentic RAG、多模态RAG
- 独立搭建生产级RAG系统：带监控、带缓存、带错误处理的那种
- 建立评估体系：用RAGAS量化效果，用A/B测试做决策

全程代码可跑，干货密度拉满。准备好，我们开始。

---

## 6.1 为什么需要RAG：大模型的知识边界

### 大模型的知识是"死"的，有边界的

大模型的知识是在训练时"喂"进去的。GPT-4的知识截止到2023年12月，Claude的知识截止到2024年4月。这意味着什么？

你公司去年Q3的营收数据、昨天刚更新的产品功能、内部流程规范——大模型统统不知道。更扎心的是，就算你把最新信息塞进Prompt，它也记不住（Context Window有限），或者懒得读（大段文字容易被忽略）。

这就是**知识边界**问题。大模型的能力边界和你的业务需求之间，存在一道鸿沟。

### 知识边界的三种类型

不是所有"大模型不知道"的问题都一样。我把它们分成三类，理解这个分类能帮你判断什么时候该用RAG：

**第一类：时效性知识**

大模型的训练数据有截止日期，而且就算训练完了，也不可能实时更新。新闻、政策、市场数据、股价、赛事结果——这些都是时效性知识。

举个例子：用户问"你们公司今年Q3的营收增长了多少"，大模型怎么回答？瞎编一个？"根据公开数据增长约15%"？这不是幻觉是什么？

时效性知识的特征是：会频繁变化，需要快速更新，用户期望得到最新答案。

**第二类：私有性知识**

大模型没学过的东西，主要包括：
- 公司内部文档（战略规划、组织架构、内部流程）
- 产品文档（你们产品的特定功能、API接口、错误码含义）
- 用户数据（客户信息、订单记录、个性化偏好）
- 专有技术资料（专利、内部算法、设计规范）

这类知识的特点是：本来就不在公开互联网上，大模型根本不可能学过。

**第三类：专业性知识**

大模型训练数据里可能有，但理解不够深入，或者表述方式不对：
- 法律条文：通用法律知识有，但你们行业/地区的具体规定可能不清楚
- 医疗指南：基础知识有，但你们医院的特定流程不知道
- 金融产品：产品逻辑有，但你们产品的具体条款可能搞混

专业性知识的特点是：有相关背景但不够精确，或者你需要的是"专家级别"的理解。

### 三种解决思路的深度对比

解决知识边界问题，主要有三条路：Fine-tuning（微调）、Prompt塞知识、RAG。2026年的今天，我们来一个深度对比：

| 对比维度 | Fine-tuning | Prompt塞知识 | RAG |
|---------|-------------|-------------|-----|
| **知识更新速度** | 慢（需重新训练） | 即时（改Prompt） | 快（更新文档即可） |
| **更新成本** | 高（GPU+时间+金钱） | 低（无额外成本） | 中（存储+Embedding计算） |
| **知识容量** | 受限于模型参数 | 受限于Context Window | 可扩展至海量文档 |
| **幻觉风险** | 中等（可能记忆错误） | 低（可控） | 低（可追溯） |
| **能力vs知识** | 适合能力提升 | 适合少量补充 | 适合大量知识库 |
| **可解释性** | 低（黑盒） | 高（Prompt可见） | 高（可追溯来源） |
| **适用场景** | 学会写作风格、特定格式 | 一次性/少量信息 | 持续积累、海量知识 |
| **2026年现状** | 价值下降（长上下文模型兴起） | 仍是补充手段 | 仍是主流方案 |

**为什么Fine-tuning在2026年的价值下降了？**

这可能是反直觉的一点——不是说微调没用了，而是它的核心价值从"装知识"变成了"学能力"。

以前用Fine-tuning"塞知识"，是因为大模型Context Window太小、知识更新太慢。现在呢？Claude 3.5支持200K Context，GPT-4o支持128K Context。你完全可以把几百页文档扔进去，大模型直接读完回答。

所以Fine-tuning现在的最佳用法是：让大模型学会某种能力（比如特定格式输出、某种写作风格、某种推理模式），而不是装知识。

**为什么Prompt塞知识仍然不够？**

两个原因：

1. **Context Window虽大，但不是无限的**。100K Context看着很大，但一本《哈利波特》全集也就100万字符左右。你的企业知识库可能有几万、几十万份文档。

2. **大模型对长上下文的"记忆"不均匀**。研究表明，LLM对Context开头和结尾的内容记忆最好，中间的容易"遗忘"——这叫"中间丢失"（Lost in the Middle）问题。你把100份文档塞进去，大模型可能只记住了前5份和后5份。

**为什么RAG仍然是2026年的主流？**

三个原因：

1. **可扩展**：理论上可以索引无限多的文档，需要什么查什么
2. **可解释**：你能说清楚"我为什么知道这个"——因为我在哪份文档里查到的
3. **成本可控**：Embedding和向量检索的成本远低于每次都调用大模型处理大量Context

### 什么场景适合用RAG

- ✅ 知识是大模型没有的（公司内部文档、产品手册、用户数据）
- ✅ 知识会频繁更新（新闻追踪、政策法规、产品迭代）
- ✅ 需要可解释性（用户可能追问"依据是什么"）
- ✅ 数据量中等到大（几百到几万份文档）
- ✅ 需要精确答案（法律条文、合同条款、技术规范）

### 什么场景可能不需要RAG

- ❌ 数据量很小，几段文字就能塞进Prompt
- ❌ 是一次性问答，不需要长期积累
- ❌ 对实时性要求极高，无法接受检索延迟
- ❌ 上下文理解能力足够强（比如做代码库问答，可以直接喂完整代码）

---

## 6.2 RAG完整链路拆解

### 整体架构

RAG系统分为两个阶段：

```
索引阶段（离线）：
文档 → 加载 → 切块 → 向量化 → 存储

查询阶段（在线）：
问题 → 检索 → 重排序 → 组装Prompt → 生成 → 回答
```

```
┌─────────────────────────────────────────────────────────────────┐
│                        RAG完整链路                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  【索引阶段 - 离线】              【查询阶段 - 在线】              │
│                                                                 │
│  ┌──────────┐                 ┌──────────┐                     │
│  │ 原始文档   │                 │ 用户问题  │                     │
│  └────┬─────┘                 └────┬─────┘                     │
│       │                              │                          │
│       ▼                              ▼                          │
│  ┌──────────┐                 ┌──────────┐                     │
│  │ 文档加载   │                 │  检索    │                     │
│  └────┬─────┘                 └────┬─────┘                     │
│       │                              │                          │
│       ▼                              ▼                          │
│  ┌──────────┐                 ┌──────────┐                     │
│  │ 文本切块   │                 │ 重排序   │                     │
│  └────┬─────┘                 └────┬─────┘                     │
│       │                              │                          │
│       ▼                              ▼                          │
│  ┌──────────┐                 ┌──────────┐                     │
│  │ 向量化    │                 │ 组装Prompt│                     │
│  └────┬─────┘                 └────┬─────┘                     │
│       │                              │                          │
│       ▼                              ▼                          │
│  ┌──────────┐                 ┌──────────┐                     │
│  │ 存储入库   │                 │ LLM生成  │                     │
│  └──────────┘                 └────┬─────┘                     │
│                                    │                          │
│                                    ▼                          │
│                              ┌──────────┐                     │
│                              │  返回回答 │                     │
│                              └──────────┘                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 环节一：文档加载（Document Loading）

把各种格式的原始文档转换成程序能处理的文本。这一步看似简单，实则坑最多。

**支持的主要格式：**

```python
# PDF加载
from langchain_community.document_loaders import PyPDFLoader

loader = PyPDFLoader("产品手册.pdf")
documents = loader.load()

# Markdown加载
from langchain_community.document_loaders import UnstructuredMarkdownLoader

loader = UnstructuredMarkdownLoader("README.md")
documents = loader.load()

# Word加载
from langchain_community.document_loaders import Docx2txtLoader

loader = Docx2txtLoader("合同.docx")
documents = loader.load()

# HTML加载
from langchain_community.document_loaders import BSHTMLLoader

loader = BSHTMLLoader("政策.html")
documents = loader.load()

# 纯文本
from langchain_community.document_loaders import TextLoader

loader = TextLoader("日志.txt", encoding="utf-8")
documents = loader.load()
```

**进阶加载（LlamaIndex）：**

```python
from llama_index.core import SimpleDirectoryReader

# 自动识别并加载多种格式
loader = SimpleDirectoryReader(
    input_dir="./docs",
    recursive=True,  # 递归遍历子目录
    exclude=["*.log"],  # 排除某些文件
    file_metadata=lambda filename: {"filepath": filename}  # 自定义元数据
)
documents = loader.load_data()
```

**坑1：扫描PDF（没有文字层的PDF）**

扫描版PDF本质上是图片，不是文字。这时候需要OCR（光学字符识别）：

```python
# 使用pymupdf + OCR处理扫描PDF
import fitz  # pymupdf

def extract_text_from_scanned_pdf(pdf_path: str) -> list:
    """提取扫描PDF的文本，使用OCR增强"""
    doc = fitz.open(pdf_path)
    documents = []
    
    for page_num, page in enumerate(doc):
        # 尝试直接提取文字（可能有隐藏文字层）
        text = page.get_text()
        
        # 如果文字层为空，使用OCR
        if not text.strip():
            # 将页面转为图片
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))  # 2倍分辨率
            img_bytes = pix.tobytes("png")
            
            # 调用OCR（这里用pytesseract示例）
            import pytesseract
            from PIL import Image
            import io
            
            image = Image.open(io.BytesIO(img_bytes))
            text = pytesseract.image_to_string(image, lang='chi_sim+eng')
        
        if text.strip():
            documents.append({
                "page": page_num + 1,
                "text": text
            })
    
    return documents
```

**坑2：表格提取**

PDF里的表格是另一个大坑。直接提取会变成一团乱码：

```python
# 使用camelot或tabula提取表格
from langchain_community.document_loaders import UnstructuredExcelLoader

# 或者用pandas直接读Excel
import pandas as pd

def extract_tables_from_pdf(pdf_path: str):
    """提取PDF中的表格"""
    try:
        # 方法1：使用tabula（Java依赖）
        import tabula
        
        tables = tabula.read_pdf(
            pdf_path,
            pages='all',
            lattice=True,  # 表格有边框时用lattice
            stream=True,   # 无边框表格用stream
        )
        
        return tables
    
    except ImportError:
        print("请安装tabula-py: pip install tabula-py")
        return []
```

**坑3：多格式文档统一加载**

企业知识库往往有各种格式，写一个统一的加载器：

```python
from pathlib import Path
from typing import List, Optional
from langchain_core.documents import Document

class UniversalDocumentLoader:
    """统一文档加载器"""
    
    LOADERS = {
        ".pdf": ("langchain_community.document_loaders", "PyPDFLoader"),
        ".md": ("langchain_community.document_loaders", "UnstructuredMarkdownLoader"),
        ".txt": ("langchain_community.document_loaders", "TextLoader"),
        ".docx": ("langchain_community.document_loaders", "Docx2txtLoader"),
        ".html": ("langchain_community.document_loaders", "BSHTMLLoader"),
    }
    
    def __init__(self, encoding: str = "utf-8"):
        self.encoding = encoding
        self._loaders_cache = {}
    
    def _get_loader(self, file_path: Path):
        """动态获取对应格式的加载器"""
        ext = file_path.suffix.lower()
        
        if ext not in self.LOADERS:
            raise ValueError(f"不支持的文件格式: {ext}")
        
        module_name, class_name = self.LOADERS[ext]
        if class_name not in self._loaders_cache:
            module = __import__(module_name, fromlist=[class_name])
            loader_class = getattr(module, class_name)
            self._loaders_cache[class_name] = loader_class
        
        return self._loaders_cache[class_name]
    
    def load(self, file_path: str) -> List[Document]:
        """加载单个文件"""
        path = Path(file_path)
        
        if not path.exists():
            raise FileNotFoundError(f"文件不存在: {file_path}")
        
        loader_class = self._get_loader(path)
        
        # 根据文件类型配置loader
        if path.suffix.lower() == ".txt":
            loader = loader_class(file_path, encoding=self.encoding)
        elif path.suffix.lower() == ".pdf":
            loader = loader_class(file_path)
        else:
            loader = loader_class(file_path)
        
        docs = loader.load()
        
        # 补充元数据
        for doc in docs:
            doc.metadata.update({
                "source": str(path),
                "filename": path.name,
                "file_type": path.suffix.lower()
            })
        
        return docs
    
    def load_directory(self, dir_path: str, 
                      recursive: bool = True,
                      file_types: Optional[List[str]] = None) -> List[Document]:
        """加载目录下所有文件"""
        all_docs = []
        path = Path(dir_path)
        
        # 确定要加载的文件类型
        if file_types is None:
            file_types = list(self.LOADERS.keys())
        file_types = [ft.lower() if ft.startswith('.') else f'.{ft.lower()}' 
                     for ft in file_types]
        
        # 遍历文件
        pattern = "**/*" if recursive else "*"
        for file_path in path.glob(pattern):
            if file_path.is_file() and file_path.suffix.lower() in file_types:
                try:
                    docs = self.load(str(file_path))
                    all_docs.extend(docs)
                except Exception as e:
                    print(f"加载失败 {file_path}: {e}")
        
        return all_docs
```

### 环节二：文本切块（Chunking）

切块是把长文档拆成短片段的艺术。每个片段要：
- 有独立语义（能单独理解）
- 保留上下文关联（不要把一句完整的话切成两半）

这一步直接影响检索质量，切得不好后面怎么调都救不回来。

**切块大小的选择哲学：**

| 切块大小 | 优点 | 缺点 | 适用场景 |
|---------|------|------|---------|
| **太小（<200字符）** | 精准、噪声少 | 语义不完整、上下文丢失 | 需要精确匹配的场景 |
| **中等（300-500字符）** | 平衡 | - | 通用场景 |
| **较大（500-1000字符）** | 语义完整、上下文丰富 | 可能引入噪声 | 需要理解整体逻辑的场景 |
| **很大（>1000字符）** | 完整上下文 | 稀释关键信息、超过Embedding限制 | 不推荐 |

> 💡 **实战经验**：500-1000字符是大多数场景的最优区间。除非有特殊需求，否则不要偏离这个范围太多。

### 环节三：向量化（Embedding）

把文本转换成向量，让语义相似的文本在向量空间里"靠近"。

```python
# 中文Embedding首选：BGE-M3
from langchain_huggingface import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-m3",
    model_kwargs={'device': 'cuda'},  # 有GPU用cuda
    encode_kwargs={'normalize_embeddings': True}  # 余弦相似度需归一化
)
```

Embedding模型的选择是RAG系统的关键决策点，我会在6.4节详细展开。

### 环节四：存储与检索

```python
# 使用Qdrant向量数据库
from langchain_qdrant import QdrantVectorStore

vectorstore = QdrantVectorStore.from_documents(
    documents=chunks,
    embedding=embeddings,
    host="localhost",
    port=6333,
    collection_name="knowledge_base"
)

# 检索Top-K
retriever = vectorstore.as_retriever(
    search_kwargs={"k": 5}
)

docs = retriever.invoke("退换货政策是什么？")
```

### 环节五：生成

```python
# 组装Prompt
context = "\n\n".join([doc.page_content for doc in docs])

prompt = f"""根据以下上下文回答问题。如果上下文中没有相关信息，请明确说明。

上下文：
---
{context}
---

问题：{question}

回答："""

# 调用大模型
response = llm.invoke(prompt)
```

---

## 6.3 文本切块策略：深入实战

### 基础切块：RecursiveCharacterTextSplitter

这是LangChain最常用的切块器，原理是从大到小的分隔符逐级尝试切分：

```python
from langchain.text_splitters import RecursiveCharacterTextSplitter

text_splitter = RecursiveCharacterTextSplitter(
    separators=["\n\n", "\n", "。", "！", "？", " "],  # 从大到小依次尝试
    chunk_size=500,
    chunk_overlap=50,  # 保留上下文重叠
    length_function=len,  # 计算长度的方式
)

chunks = text_splitter.split_documents(documents)
```

**separators的顺序很重要**：先尝试用大段落切分（`\n\n`），切不动再用句子切分（`。`），最后才用单词/字切分。这个顺序确保了语义完整性优先。

### 语义切块：按意义边界切分

Recursive切块只考虑标点符号，不考虑语义。有时候一句话被截断了，有时候两个不相关的内容被合并了。

**语义切块的思路**：让AI帮你判断在哪里切分最合理。

```python
from langchain_experimental.text_splitter import SemanticChunker
from langchain_huggingface import HuggingFaceEmbeddings

# 基于语义相似度切分
text_splitter = SemanticChunker(
    embeddings=embeddings,
    breakpoint_threshold_type="percentile",  # 基于相似度百分位切分
    breakpoint_threshold_amount=95,  # 相似度低于95%时切分
)

chunks = text_splitter.split_documents(documents)
```

**SemanticChunker的原理**：
1. 把文档切成句子
2. 计算相邻句子的语义相似度
3. 当相似度低于阈值时，认为这里是语义边界，应该切分

**对比实验**：

```python
def compare_chunking_strategies(documents: list, text: str) -> dict:
    """对比不同切块策略"""
    
    results = {}
    
    # 策略1：递归切块
    recursive_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    recursive_chunks = recursive_splitter.split_documents(documents)
    results['recursive'] = {
        'count': len(recursive_chunks),
        'avg_length': sum(len(c.page_content) for c in recursive_chunks) / len(recursive_chunks),
        'samples': recursive_chunks[:3]
    }
    
    # 策略2：语义切块
    semantic_splitter = SemanticChunker(
        embeddings=embeddings,
        breakpoint_threshold_type="percentile",
        breakpoint_threshold_amount=95
    )
    semantic_chunks = semantic_splitter.split_documents(documents)
    results['semantic'] = {
        'count': len(semantic_chunks),
        'avg_length': sum(len(c.page_content) for c in semantic_chunks) / len(semantic_chunks),
        'samples': semantic_chunks[:3]
    }
    
    return results
```

**什么时候用语义切块？**

- ✅ 文档结构不规则，标点不能反映语义边界
- ✅ 对语义完整性要求高（如代码、法律条文）
- ✅ 文档是混合内容（标题、段落、列表混杂）

- ❌ 文档结构规则，用标点就能很好切分
- ❌ 数据量大，语义切块计算成本高
- ❌ 追求速度和一致性

### 重叠的作用与最佳实践

相邻块保留重叠区域是为了**保持上下文连贯**：

```
块1：Transformer是革命性架构，最初由Google在2017年提出。它的核心是...
块2（含重叠）：...核心是自注意力机制，这种机制彻底改变了NLP领域。
```

**重叠大小的经验值**：
- 10-20%的重叠比例效果最好
- 太小（<10%）→ 边界处信息可能丢失
- 太大（>30%）→ 重复存储太多，检索效率下降

```python
def calculate_overlap_ratio(chunk_size: int, overlap_chars: int) -> float:
    """计算重叠比例"""
    return overlap_chars / chunk_size

# 示例
print(calculate_overlap_ratio(500, 50))  # 0.1 → 10%重叠
```

### Parent-Child切块：小块检索，大块返回

这是高级RAG的核心策略之一。核心思想：

- **小块**：切成200-300字符，用于精确检索
- **大块**：切成2000-3000字符，用于返回完整上下文

检索时用小块匹配，返回时用大块：

```python
class ParentChildChunker:
    """Parent-Child切块器"""
    
    def __init__(self, 
                 small_chunk_size: int = 300,
                 large_chunk_size: int = 2000,
                 overlap: int = 100):
        self.small_splitter = RecursiveCharacterTextSplitter(
            chunk_size=small_chunk_size,
            chunk_overlap=0  # 小块不需要重叠
        )
        self.large_splitter = RecursiveCharacterTextSplitter(
            chunk_size=large_chunk_size,
            chunk_overlap=overlap
        )
    
    def chunk(self, documents: list) -> dict:
        """
        返回:
        - small_chunks: 小块列表（用于检索）
        - large_chunks: 大块列表（用于返回上下文）
        - mapping: 小块ID -> 大块ID 的映射
        """
        # 生成大块
        large_chunks = self.large_splitter.split_documents(documents)
        for i, chunk in enumerate(large_chunks):
            chunk.metadata["chunk_id"] = f"large_{i}"
        
        # 生成小块
        small_chunks = self.small_splitter.split_documents(documents)
        for i, chunk in enumerate(small_chunks):
            chunk.metadata["chunk_id"] = f"small_{i}"
            # 建立映射：这个小块属于哪个大块
            chunk.metadata["parent_id"] = self._find_parent(large_chunks, chunk)
        
        return {
            "small_chunks": small_chunks,
            "large_chunks": large_chunks,
            "mapping": {c.metadata["chunk_id"]: c.metadata.get("parent_id") 
                       for c in small_chunks}
        }
    
    def _find_parent(self, large_chunks: list, small_chunk) -> str:
        """找到小块所属的大块"""
        # 简化实现：基于位置匹配
        # 实际应用中可能需要基于内容重叠度
        for large in large_chunks:
            if large.page_content in small_chunk.page_content or \
               small_chunk.page_content in large.page_content:
                return large.metadata["chunk_id"]
        return large_chunks[0].metadata["chunk_id"]


# 使用示例
chunker = ParentChildChunker(small_chunk_size=300, large_chunk_size=2000)
result = chunker.chunk(documents)

# 索引小块
small_vectorstore = QdrantVectorStore.from_documents(
    documents=result["small_chunks"],
    embedding=embeddings,
    collection_name="small_chunks"
)

# 检索时
def retrieve_with_parent_context(query: str, k: int = 5):
    """检索并返回大块上下文"""
    # 用小块检索
    small_docs = small_vectorstore.similarity_search(query, k=k)
    
    # 收集所有相关的大块ID
    parent_ids = set()
    for doc in small_docs:
        parent_id = doc.metadata.get("parent_id")
        if parent_id:
            parent_ids.add(parent_id)
    
    # 返回大块内容
    large_docs = []
    for large in result["large_chunks"]:
        if large.metadata["chunk_id"] in parent_ids:
            large_docs.append(large)
    
    return large_docs
```

### 元数据增强切块

切块时补充元数据，后续可以用于**过滤检索**和**溯源**：

```python
from langchain_core.documents import Document
from datetime import datetime

def enrich_chunks_with_metadata(chunks: list, 
                                 source_file: str,
                                 source_type: str = "manual") -> list:
    """为切块补充元数据"""
    enriched = []
    
    for i, chunk in enumerate(chunks):
        enriched.append(Document(
            page_content=chunk.page_content,
            metadata={
                # 来源信息
                "source_file": source_file,
                "source_type": source_type,
                "chunk_index": i,
                "total_chunks": len(chunks),
                
                # 时间信息
                "indexed_at": datetime.now().isoformat(),
                
                # 内容标签（可扩展）
                "has_table": "表格" in chunk.page_content or "|" in chunk.page_content,
                "has_code": "```" in chunk.page_content or "def " in chunk.page_content,
                "has_list": any(c in chunk.page_content for c in ["1.", "2.", "- ", "• "]),
                
                # 自定义标签
                "category": infer_category(chunk.page_content),  # 需要实现
            }
        ))
    
    return enriched


def infer_category(text: str) -> str:
    """根据内容推断分类（简化版）"""
    keywords_map = {
        "产品": ["产品", "功能", "特性", "spec", "feature"],
        "政策": ["政策", "规定", "流程", "policy", "规定"],
        "技术": ["API", "接口", "代码", "技术", "technical"],
        "销售": ["价格", "报价", "折扣", "sales"],
        "客服": ["客服", "支持", "帮助", "support"],
    }
    
    for category, keywords in keywords_map.items():
        if any(kw in text.lower() for kw in keywords):
            return category
    
    return "其他"


# 带过滤的检索
def filtered_retrieval(query: str, category: str = None, k: int = 5):
    """带分类过滤的检索"""
    filter_dict = {}
    if category:
        filter_dict["category"] = category
    
    retriever = vectorstore.as_retriever(
        search_kwargs={
            "k": k,
            "filter": filter_dict if filter_dict else None
        }
    )
    
    return retriever.invoke(query)
```

### 切块策略对比总结

| 策略 | 切块大小 | 优点 | 缺点 | 适用场景 |
|------|---------|------|------|---------|
| **递归切块** | 固定500-1000 | 简单、快速、稳定 | 不考虑语义边界 | 通用场景、规则文档 |
| **语义切块** | 不固定 | 语义完整 | 慢、成本高 | 非结构化内容、代码 |
| **Parent-Child** | 小块200-300 + 大块2000-3000 | 精确检索+完整上下文 | 复杂、存储翻倍 | 高精度需求场景 |
| **元数据增强** | 任意 | 可过滤、可溯源 | 需要额外处理 | 企业知识库、分级检索 |

**实战建议**：

1. **先用递归切块**，这是最稳定的选择
2. **如果检索效果差**，考虑语义切块或Parent-Child
3. **元数据增强一定要做**，便宜又实用
4. **多尝试几种策略**，用评估指标选最优

---

## 6.4 Embedding模型选型与微调

Embedding模型是RAG系统的"眼睛"——它的质量直接决定检索效果。一个好的Embedding模型能让语义相近的内容"靠近"，反之则会把完全无关的内容放到一起。

### 2026年中文Embedding模型评测

经过实测和多源数据对比，以下是主流中文Embedding模型的表现：

| 模型 | 维度 | MTEB中文排名 | 平均性能 | 推理速度 | 内存占用 | 推荐指数 |
|------|------|-------------|---------|---------|---------|---------|
| **BGE-M3** | 1024 | Top 3 | ⭐⭐⭐⭐⭐ | 中等 | ~1.1GB | ⭐⭐⭐⭐⭐ |
| **GTE-Qwen2-7B** | 1024 | Top 5 | ⭐⭐⭐⭐ | 较慢 | ~14GB | ⭐⭐⭐⭐ |
| **gte-large-zh** | 1024 | Top 10 | ⭐⭐⭐⭐ | 快 | ~800MB | ⭐⭐⭐⭐ |
| **Jina-Base-Zh** | 768 | 中上 | ⭐⭐⭐⭐ | 快 | ~500MB | ⭐⭐⭐⭐ |
| **text2vec-base** | 768 | 中等 | ⭐⭐⭐ | 快 | ~400MB | ⭐⭐⭐ |

**BGE-M3详细分析**：

```python
# BGE-M3使用示例
from langchain_huggingface import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(
    model_name="BAAI/bge-m3",
    model_kwargs={
        'device': 'cuda',  # 使用GPU加速
    },
    encode_kwargs={
        'normalize_embeddings': True,  # 归一化，支持余弦相似度
        'batch_size': 32,  # 批处理大小
    }
)

# 单条文本
query = "如何申请产品退换货？"
vec = embeddings.embed_query(query)

# 批量文本
texts = ["文本1", "文本2", "文本3"]
vectors = embeddings.embed_documents(texts)
```

**BGE-M3的核心优势**：

1. **多语言支持**：主模型支持100+语言，中英文效果都很好
2. **召回能力强**：MTEB榜单中文前三
3. **维度适中**：1024维，不高不低刚刚好
4. **开源免费**：可商用，无需API费用

**GTE-Qwen2-7B详细分析**：

适合对精度有极致追求、且有GPU资源的场景：

```python
# GTE-Qwen2-7B使用示例
from transformers import AutoModel
import torch

def embed_with_gte(texts: list, batch_size: int = 8) -> list:
    """使用GTE-Qwen2-7B进行Embedding"""
    model_name = "Alibaba-NLP/gte-Qwen2-7B-instruct"
    
    model = AutoModel.from_pretrained(
        model_name,
        torch_dtype=torch.bfloat16,
        device_map="auto"
    )
    model.eval()
    
    from transformers import AutoTokenizer
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    
    all_embeddings = []
    
    for i in range(0, len(texts), batch_size):
        batch = texts[i:i+batch_size]
        
        # 包装成instruction格式（Qwen2系列需要）
        inputs = tokenizer(
            [f"query: {t}" for t in batch],
            padding=True,
            truncation=True,
            max_length=512,
            return_tensors='pt'
        ).to(model.device)
        
        with torch.no_grad():
            outputs = model(**inputs)
            # 使用[CLS]token的输出作为embedding
            embeddings = outputs.last_hidden_state[:, 0].float().numpy()
        
        all_embeddings.extend(embeddings)
    
    return all_embeddings
```

**什么时候用GTE-Qwen2-7B？**
- ✅ 有NVIDIA A100/H100等大显存GPU
- ✅ 对精度要求极高（法律、医疗、金融）
- ✅ 数据量不是特别大（因为推理慢）

**什么时候用BGE-M3？**
- ✅ 通用场景
- ✅ CPU或消费级GPU部署
- ✅ 需要多语言支持
- ✅ 追求性价比

### Embedding模型微调

**什么时候需要微调？**

不是所有场景都需要微调。以下情况可能需要：

| 场景 | 评估标准 | 建议 |
|------|---------|------|
| 通用内容检索 | 直接用预训练模型 | ❌ 不需要微调 |
| 领域术语多（如医疗、法律） | 预训练模型效果一般 | ✅ 考虑微调 |
| 特定表述风格 | 检索结果语义相似但表达不同 | ✅ 需要微调 |
| 企业专有知识 | 专业术语、内部叫法 | ✅ 必须微调 |

**微调数据准备**：

```python
import json

def prepare_finetune_data(queries: list, 
                         positive_docs: list,
                         negative_docs: list = None) -> list:
    """
    准备对比学习微调数据
    
    Args:
        queries: 查询列表
        positive_docs: 每个查询的正例文档
        negative_docs: 每个查询的负例文档（可选）
    """
    train_data = []
    
    for query, pos_doc in zip(queries, positive_docs):
        entry = {
            "query": query,
            "positive": pos_doc,
        }
        
        if negative_docs:
            entry["negative"] = negative_docs
        
        train_data.append(entry)
    
    return train_data


# 示例数据
train_data = [
    {
        "query": "如何申请企业账号？",
        "positive": "企业账号申请流程：首先登录官网，点击注册，选择企业类型，填写企业信息，提交资质证明，等待审核通过后即可使用。",
        "negative": "个人账号可以通过手机号快速注册，无需资质审核。"
    },
    {
        "query": "API调用频率限制是多少？",
        "positive": "免费版API调用频率限制为每分钟60次，每月调用总量不超过10000次。企业版根据套餐不同有所差异。",
        "negative": "我们的产品价格实惠，性价比很高，欢迎咨询。"
    },
]
```

**微调脚本（使用Sentence Transformers）**：

```python
from sentence_transformers import SentenceTransformer, InputExample, losses
from torch.utils.data import DataLoader
from transformers import TrainingArguments

def finetune_embedding(
    model_name: str,
    train_data: list,
    output_dir: str,
    epochs: int = 3,
    batch_size: int = 16
):
    """微调Embedding模型"""
    
    # 加载预训练模型
    model = SentenceTransformer(model_name)
    
    # 转换为InputExample格式
    train_examples = []
    for item in train_data:
        example = InputExample(
            texts=[item["query"], item["positive"]],
            label=1.0  # 正例标签
        )
        if "negative" in item:
            # 添加负例
            neg_example = InputExample(
                texts=[item["query"], item["negative"]],
                label=0.0  # 负例标签
            )
            train_examples.extend([example, neg_example])
        else:
            train_examples.append(example)
    
    # 创建DataLoader
    train_dataloader = DataLoader(
        train_examples, 
        shuffle=True, 
        batch_size=batch_size
    )
    
    # 定义损失函数（对比学习）
    train_loss = losses.CosineSimilarityLoss(model)
    
    # 训练参数
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=epochs,
        per_device_train_batch_size=batch_size,
        warmup_steps=100,
        logging_steps=50,
        save_steps=500,
        save_strategy="steps",
        learning_rate=2e-5,
    )
    
    # 开始训练
    model.fit(
        train_objectives=[(train_dataloader, train_loss)],
        args=training_args,
        show_progress_bar=True,
    )
    
    # 保存微调后的模型
    model.save(output_dir)
    
    return model


# 使用微调后的模型
finetuned_model = SentenceTransformer("./finetuned_model")
embeddings = HuggingFaceEmbeddings(
    model_name="./finetuned_model",
    model_kwargs={'device': 'cuda'},
    encode_kwargs={'normalize_embeddings': True}
)
```

**微调的坑**：

1. **数据量不够**：Embedding对比学习通常需要几千到几万条数据才有明显提升
2. **负例选择很重要**：随机负例效果一般，选择"hard negative"（看起来很像但实际不相关）效果更好
3. **过拟合风险**：微调后可能在特定任务上很好，但泛化能力下降
4. **成本考量**：微调需要GPU，且耗时较长

**实战建议**：先用预训练模型做baseline，微调作为锦上添花。除非预训练模型效果确实不行，否则不必花时间微调。

---

## 6.5 检索策略：从基础到高级

检索是RAG的核心环节。检索质量差，后面生成再怎么调都没用。

### 相似度检索（基础）

基于向量相似度（余弦相似度或点积）计算，返回最相似的文档：

```python
# 基础相似度检索
retriever = vectorstore.as_retriever(
    search_type="similarity",  # 默认是similarity
    search_kwargs={"k": 5}  # 召回Top-5
)

docs = retriever.invoke("用户问题")
```

### 带过滤的检索

根据元数据过滤后再检索：

```python
# 只检索特定来源
retriever = vectorstore.as_retriever(
    search_kwargs={
        "k": 5,
        "filter": {
            "source": "产品手册",
            # 支持AND条件
            # "category": {"$eq": "技术文档"}
        }
    }
)
```

### 混合检索（向量+关键词）

向量检索擅长语义理解，关键词检索（BM25）擅长精确匹配。两者结合取长补短：

```python
# Qdrant混合检索
results = vectorstore.hybrid_search(
    query="退换货政策",
    k=5,
    alpha=0.7  # 0.7=70%向量权重，30%关键词权重
)

# alpha参数的经验值
# alpha=1.0：纯向量检索
# alpha=0.7：偏向向量，兼顾关键词
# alpha=0.5：对半开
# alpha=0.3：偏向关键词
# alpha=0.0：纯关键词检索
```

**混合检索的完整实现**：

```python
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever

class HybridRetriever:
    """混合检索器"""
    
    def __init__(self, 
                 vectorstore,
                 texts: list,
                 weights: list = [0.7, 0.3],
                 k: int = 5):
        """
        Args:
            vectorstore: 向量数据库
            texts: 原始文本列表（用于BM25）
            weights: [向量权重, BM25权重]
            k: 召回数量
        """
        self.vectorstore = vectorstore
        self.weights = weights
        self.k = k
        
        # 创建向量检索器
        self.vector_retriever = vectorstore.as_retriever(
            search_kwargs={"k": k * 2}  # 多召回一些，后面融合
        )
        
        # 创建BM25检索器
        self.bm25_retriever = BM25Retriever.from_texts(
            texts=texts,
            k=k * 2
        )
        
        # 创建集成检索器
        self.ensemble_retriever = EnsembleRetriever(
            retrievers=[self.vector_retriever, self.bm25_retriever],
            weights=weights
        )
    
    def retrieve(self, query: str) -> list:
        """混合检索"""
        return self.ensemble_retriever.invoke(query)
    
    def retrieve_with_score(self, query: str) -> list:
        """带分数的检索"""
        # 向量检索
        vector_docs = self.vector_retriever.invoke(query)
        vector_scores = self._get_vector_scores(query, vector_docs)
        
        # BM25检索
        bm25_docs = self.bm25_retriever.invoke(query)
        bm25_scores = self._get_bm25_scores(query, bm25_docs)
        
        # 分数归一化和融合
        all_docs = {doc.page_content: doc for doc in vector_docs + bm25_docs}
        
        fused_scores = {}
        for doc_content, doc in all_docs.items():
            v_score = vector_scores.get(doc_content, 0) * self.weights[0]
            b_score = bm25_scores.get(doc_content, 0) * self.weights[1]
            fused_scores[doc_content] = v_score + b_score
        
        # 按融合分数排序
        sorted_docs = sorted(
            fused_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )[:self.k]
        
        return [all_docs[content] for content, _ in sorted_docs]
    
    def _get_vector_scores(self, query: str, docs: list) -> dict:
        """计算向量相似度分数"""
        from sklearn.metrics.pairwise import cosine_similarity
        import numpy as np
        
        query_vec = self.vectorstore.embedding_function(query)
        doc_vecs = self.vectorstore.embedding_function(
            [doc.page_content for doc in docs]
        )
        
        scores = cosine_similarity(
            [query_vec],
            doc_vecs
        )[0]
        
        return {doc.page_content: float(score) 
                for doc, score in zip(docs, scores)}
    
    def _get_bm25_scores(self, query: str, docs: list) -> dict:
        """计算BM25分数（简化版）"""
        # 实际使用rank_bm25库
        from rank_bm25 import BM25Okapi
        import jieba
        
        tokenized_docs = [list(jieba.cut(doc.page_content)) for doc in docs]
        bm25 = BM25Okapi(tokenized_docs)
        
        query_tokens = list(jieba.cut(query))
        scores = bm25.get_scores(query_tokens)
        
        return {doc.page_content: float(score) 
                for doc, score in zip(docs, scores)}
```

### 重排序（Rerank）

用更强的模型对初步检索结果重新打分排序。这是提升精度的关键步骤：

```python
from sentence_transformers import CrossEncoder

# 使用BGE Reranker
reranker = CrossEncoder('BAAI/bge-reranker-base')

def rerank_documents(query: str, 
                    retrieved_docs: list, 
                    top_k: int = 3) -> list:
    """重排序检索结果"""
    
    # 构建(query, document)对
    pairs = [[query, doc.page_content] for doc in retrieved_docs]
    
    # 批量预测分数
    scores = reranker.predict(pairs)
    
    # 按分数排序
    doc_scores = list(zip(retrieved_docs, scores))
    doc_scores.sort(key=lambda x: x[1], reverse=True)
    
    # 返回Top-K
    return [doc for doc, score in doc_scores[:top_k]]


# 完整流程：检索 → 重排序
def search_and_rerank(query: str, k: int = 10, rerank_top_k: int = 3):
    """检索 + 重排序"""
    # 初步检索（多召回一些）
    retrieved_docs = vectorstore.similarity_search(query, k=k)
    
    if not retrieved_docs:
        return []
    
    # 重排序
    reranked_docs = rerank_documents(query, retrieved_docs, top_k=rerank_top_k)
    
    return reranked_docs
```

**主流Reranker模型对比**：

| 模型 | 维度 | 效果 | 速度 | 推荐场景 |
|------|------|------|------|---------|
| **BGE-Reranker-Base** | 768 | ⭐⭐⭐⭐ | 快 | 中文首选 |
| **BAAI/bge-reranker-v2-gemma** | 768 | ⭐⭐⭐⭐⭐ | 中等 | 高精度需求 |
| **Cohere/rerank-3** | API | ⭐⭐⭐⭐⭐ | 快 | 追求效果不差钱 |
| **bce-reranker** | 768 | ⭐⭐⭐⭐ | 快 | 中文、可微调 |

### 查询改写与扩展

用户问题往往表达不精准，或者包含口语化表述。查询改写可以提升检索召回率：

```python
class QueryRewriter:
    """查询改写器"""
    
    def __init__(self, llm):
        self.llm = llm
    
    def rewrite(self, query: str) -> str:
        """改写查询，使其更精确"""
        prompt = f"""你是一个搜索查询优化专家。将用户的口语化问题改写成更适合检索的精确表述。

要求：
1. 提取核心查询意图
2. 补充可能的相关术语
3. 去除口语化表达
4. 保持简短（不超过50字）

示例：
输入：我想问一下，就是那个产品退货的事
输出：产品退货政策流程

输入：你们家这个服务怎么收费的啊
输出：服务费用价格标准

输入：{query}
输出："""
        
        response = self.llm.invoke(prompt)
        return response.strip()
    
    def expand(self, query: str) -> list:
        """扩展查询，生成多个变体"""
        prompt = f"""为以下查询生成3个不同表述方式的变体，涵盖不同角度：

要求：
1. 每个变体不超过40字
2. 变体之间要有差异化（角度、表述方式）
3. 可以包含同义词扩展

查询：{query}

变体1：
变体2：
变体3："""
        
        response = self.llm.invoke(prompt)
        
        # 解析变体
        lines = response.strip().split('\n')
        variants = [line.split('：')[-1].strip() for line in lines if line.strip()]
        
        return variants[:3]
    
    def multi_query_retrieval(self, query: str, retriever, k: int = 5) -> list:
        """多查询检索：生成多个变体，分别检索，合并去重"""
        # 生成变体
        variants = self.expand(query)
        all_queries = [query] + variants
        
        # 分别检索
        all_docs = []
        seen_contents = set()
        
        for q in all_queries:
            docs = retriever.invoke(q)
            for doc in docs:
                if doc.page_content not in seen_contents:
                    all_docs.append(doc)
                    seen_contents.add(doc.page_content)
        
        return all_docs
```

### 自适应检索

根据查询类型自动调整检索策略：

```python
class AdaptiveRetriever:
    """自适应检索器"""
    
    def __init__(self, llm, vectorstore):
        self.llm = llm
        self.vectorstore = vectorstore
    
    def classify_query_type(self, query: str) -> str:
        """分类查询类型"""
        prompt = f"""判断以下查询的类型：

类型选项：
1. factual：事实性问题，需要精确答案
2. conceptual：概念性问题，需要解释说明
3. procedural：流程性问题，需要步骤指引
4. comparative：比较性问题，需要对比分析

查询：{query}
类型："""
        
        response = self.llm.invoke(prompt).strip().lower()
        return response
    
    def retrieve(self, query: str, k: int = 5) -> list:
        """自适应检索"""
        query_type = self.classify_query_type(query)
        
        if query_type == "factual":
            # 事实性问题：精确召回为主，少量冗余
            docs = self.vectorstore.similarity_search(query, k=k)
        
        elif query_type == "conceptual":
            # 概念性问题：语义召回为主，扩展上下文
            docs = self.vectorstore.similarity_search(query, k=k + 2)
        
        elif query_type == "procedural":
            # 流程性问题：确保召回完整流程，可能需要大块
            docs = self.vectorstore.similarity_search(query, k=k)
            # 可能需要补充相关流程
        
        elif query_type == "comparative":
            # 比较性问题：多角度召回
            docs = self.vectorstore.similarity_search(query, k=k + 3)
        
        else:
            docs = self.vectorstore.similarity_search(query, k=k)
        
        return docs
```

---

## 6.6 高级RAG架构

基础RAG能解决80%的问题，但剩下20%的复杂场景需要更高级的架构。

### Self-RAG：自我反思检索

Self-RAG（Self-Reflective Retrieval-Augmented Generation）是让模型自己判断"需不需要检索"的框架。

**核心思想**：不盲目检索，让模型自己决定：
1. 这个知识我需要检索吗？
2. 检索到的内容有用吗？
3. 我的回答是否基于检索内容？

```python
class SelfRAG:
    """Self-RAG简化实现"""
    
    def __init__(self, llm):
        self.llm = llm
    
    def should_retrieve(self, query: str) -> bool:
        """判断是否需要检索"""
        prompt = f"""判断以下问题是否需要检索外部知识来回答。

判断标准：
- 如果问题涉及特定事实、数据、内部信息 → 需要检索
- 如果问题可以基于通用知识回答 → 不需要检索

问题：{query}
是否需要检索（是/否）："""
        
        response = self.llm.invoke(prompt).strip()
        return "是" in response
    
    def is_relevant(self, query: str, context: str) -> bool:
        """判断检索内容是否相关"""
        prompt = f"""判断以下上下文是否与问题相关。

问题：{query}

上下文：{context}

是否相关（是/否）："""
        
        response = self.llm.invoke(prompt).strip()
        return "是" in response
    
    def is_supported(self, answer: str, context: str) -> bool:
        """判断回答是否被上下文支持"""
        prompt = f"""判断以下回答是否可以从上下文中得到支持。

上下文：{context}

回答：{answer}

回答是否有上下文支持（是/否）："""
        
        response = self.llm.invoke(prompt).strip()
        return "是" in response
    
    def answer(self, query: str, retriever, max_attempts: int = 2) -> str:
        """带自我反思的回答流程"""
        
        # 步骤1：判断是否需要检索
        if not self.should_retrieve(query):
            # 不需要检索，直接回答
            return self.llm.invoke(f"回答以下问题：{query}")
        
        # 步骤2：检索相关内容
        docs = retriever.invoke(query)
        contexts = "\n\n".join([doc.page_content for doc in docs])
        
        # 步骤3：判断内容是否相关
        if not self.is_relevant(query, contexts):
            # 内容不相关，尝试扩展检索
            docs = retriever.invoke(query + " " + query)
            contexts = "\n\n".join([doc.page_content for doc in docs])
            
            if not self.is_relevant(query, contexts):
                return "抱歉，知识库中没有找到相关内容。"
        
        # 步骤4：生成回答
        prompt = f"""基于以下上下文回答问题。
如果上下文没有相关信息，说明无法回答。

上下文：
{contexts}

问题：{query}

回答："""
        
        answer = self.llm.invoke(prompt)
        
        # 步骤5：验证回答是否被支持
        if not self.is_supported(answer, contexts):
            # 回答不被完全支持，添加免责声明
            answer = answer + "\n\n⚠️ 注意：以上部分内容可能不完全基于检索结果，请酌情参考。"
        
        return answer
```

### CRAG：纠错检索

CRAG（Corrective Retrieval-Augmented Generation）专门处理检索质量差的情况。当检索结果不理想时，自动触发纠错流程。

```python
class CRAG:
    """CRAG简化实现：检索结果纠错"""
    
    def __init__(self, llm, retriever):
        self.llm = llm
        self.retriever = retriever
    
    def evaluate_retrieval_quality(self, query: str, docs: list) -> str:
        """评估检索质量：正确/模糊/错误"""
        if not docs:
            return "empty"
        
        prompt = f"""评估以下检索结果对回答问题的帮助程度：

问题：{query}

检索结果：
{[doc.page_content for doc in docs]}

评估（正确/模糊/错误）："""
        
        response = self.llm.invoke(prompt).strip()
        
        if "正确" in response:
            return "correct"
        elif "模糊" in response:
            return "ambiguous"
        else:
            return "incorrect"
    
    def rewrite_query(self, query: str) -> str:
        """改写查询"""
        prompt = f"""将以下查询改写，以便检索到更好的结果：

原查询：{query}
改写查询："""
        
        return self.llm.invoke(prompt).strip()
    
    def generate_web_search_query(self, query: str) -> str:
        """生成网络搜索查询"""
        prompt = f"""为以下问题生成适合网络搜索的查询词：

问题：{query}
搜索查询："""
        
        return self.llm.invoke(prompt).strip()
    
    def answer(self, query: str) -> str:
        """带纠错的回答流程"""
        
        # 步骤1：初次检索
        docs = self.retriever.invoke(query)
        
        # 步骤2：评估检索质量
        quality = self.evaluate_retrieval_quality(query, docs)
        
        if quality == "correct":
            # 质量好，直接生成回答
            context = "\n\n".join([doc.page_content for doc in docs])
        
        elif quality == "ambiguous":
            # 质量模糊：扩展检索
            new_query = self.rewrite_query(query)
            docs = self.retriever.invoke(new_query)
            
            # 也尝试网络搜索（如果实现了web_search）
            # web_results = self.web_search(self.generate_web_search_query(query))
            # docs.extend(web_results)
            
            context = "\n\n".join([doc.page_content for doc in docs])
        
        else:
            # 质量差：触发知识触发器，使用模型自身知识
            context = "[知识库无相关信息，使用模型自身知识回答]\n"
        
        # 步骤3：生成回答
        prompt = f"""基于以下上下文回答问题。如果上下文不足，说明知识有限。

上下文：
{context}

问题：{query}

回答："""
        
        return self.llm.invoke(prompt)
```

### Multi-hop RAG：多跳推理

Multi-hop RAG用于需要多步推理的复杂问题。比如："A公司和B公司的关系是什么？"需要先分别找到A公司和B公司的信息，再推理它们的关系。

```python
class MultiHopRAG:
    """多跳RAG"""
    
    def __init__(self, llm, retriever):
        self.llm = llm
        self.retriever = retriever
    
    def decompose_query(self, query: str) -> list:
        """分解复杂问题为多个子问题"""
        prompt = f"""将以下复杂问题分解为多个需要逐步回答的子问题：

要求：
1. 每个子问题应该能够通过单次检索得到答案
2. 标注子问题的回答顺序
3. 说明每个子问题的作用

复杂问题：{query}

子问题1：
子问题2：
..."""
        
        response = self.llm.invoke(prompt)
        
        # 解析子问题（简化版，实际需要更复杂的解析）
        lines = [line.strip() for line in response.split('\n') if line.strip()]
        sub_queries = [line for line in lines if line.startswith('子问题') or line[0].isdigit()]
        
        return sub_queries
    
    def answer(self, query: str) -> str:
        """多跳回答"""
        
        # 步骤1：分解问题
        sub_queries = self.decompose_query(query)
        
        # 步骤2：逐一跳转检索
        context_parts = []
        current_context = ""
        
        for i, sub_query in enumerate(sub_queries):
            # 将之前的上下文加入，帮助理解整体
            full_query = sub_query
            if current_context:
                full_query = f"基于之前信息'{current_context[:100]}...'，回答：{sub_query}"
            
            # 检索
            docs = self.retriever.invoke(full_query)
            sub_context = "\n\n".join([doc.page_content for doc in docs])
            
            context_parts.append(f"[第{i+1}跳] {sub_query}：{sub_context}")
            current_context += sub_context
        
        # 步骤3：综合回答
        full_context = "\n\n".join(context_parts)
        
        prompt = f"""基于以下多跳检索结果，综合回答原始问题。

检索结果：
{full_context}

原始问题：{query}

请综合以上信息给出完整回答："""
        
        return self.llm.invoke(prompt)
```

### Agentic RAG：Agent驱动的RAG

Agentic RAG让Agent自主决定检索策略、工具调用、结果验证。这是RAG和Agent结合的高级形态。

```python
from langchain.agents import AgentExecutor, create_openai_functions_agent
from langchain_openai import ChatOpenAI
from langchain.tools import tool

class AgenticRAG:
    """Agent驱动的RAG"""
    
    def __init__(self, llm, retriever):
        self.llm = llm
        self.retriever = retriever
        
        # 定义工具
        self.tools = [
            Tool(
                name="知识库检索",
                func=self._search_knowledge_base,
                description="当需要查询企业内部知识、产品文档、流程规范时使用"
            ),
            Tool(
                name="精确搜索",
                func=self._exact_search,
                description="当需要精确匹配关键词（人名、术语、产品型号）时使用"
            ),
            Tool(
                name="扩展搜索",
                func=self._broad_search,
                description="当需要获取更广泛相关信息、理解概念背景时使用"
            ),
            Tool(
                name="知识图谱查询",
                func=self._graph_query,
                description="当需要查询实体关系（如'A的下游供应商是谁'）时使用"
            ),
        ]
        
        # 创建Agent
        self.agent = self._create_agent()
    
    def _search_knowledge_base(self, query: str) -> str:
        """知识库检索工具"""
        docs = self.retriever.invoke(query)
        if not docs:
            return "知识库中没有找到相关信息。"
        return "\n\n".join([doc.page_content for doc in docs[:3]])
    
    def _exact_search(self, keywords: str) -> str:
        """精确搜索"""
        docs = self.retriever.invoke(keywords)
        return "\n\n".join([doc.page_content for doc in docs[:3]])
    
    def _broad_search(self, topic: str) -> str:
        """扩展搜索"""
        docs = self.retriever.invoke(topic + " 相关")
        return "\n\n".join([doc.page_content for doc in docs[:5]])
    
    def _graph_query(self, relation_query: str) -> str:
        """知识图谱查询（简化版）"""
        # 实际实现需要连接知识图谱数据库
        return "知识图谱查询功能需要单独实现"
    
    def _create_agent(self):
        """创建Agent"""
        prompt = """你是一个智能问答助手，可以自主决定如何回答用户问题。

你有以下工具可用：
- 知识库检索：查询企业内部知识
- 精确搜索：精确匹配关键词
- 扩展搜索：获取更广泛信息
- 知识图谱查询：查询实体关系

请根据问题自主决定：
1. 是否需要检索
2. 使用哪个工具
3. 是否需要多次检索
4. 如何综合结果

当你可以给出确定答案时，直接回答。
当你需要更多信息时，使用工具检索。
当你发现信息不足时，说明情况。

开始！"""
        
        return create_openai_functions_agent(
            llm=self.llm,
            tools=self.tools,
            prompt=prompt
        )
    
    def answer(self, query: str) -> str:
        """Agent驱动回答"""
        agent_executor = AgentExecutor(
            agent=self.agent,
            tools=self.tools,
            verbose=True,
            max_iterations=5  # 限制最大迭代次数，避免无限循环
        )
        
        response = agent_executor.invoke({"input": query})
        return response["output"]
```

### 多模态RAG：图片、表格、视频

现代企业知识库不只有文本，还有大量的图片、表格、视频。多模态RAG解决这些内容的检索问题。

**图片RAG**：

```python
class MultimodalRAG:
    """多模态RAG"""
    
    def __init__(self, llm, vectorstore):
        self.llm = llm
        self.vectorstore = vectorstore
        self.image_embeddings = None  # 需要单独的图片Embedding模型
        
        # 加载图片Embedding模型
        # 可用：CLIP、ChineseCLIP、BLIP
        self.clip_model = None
    
    def extract_images_from_pdf(self, pdf_path: str) -> list:
        """从PDF提取图片"""
        import fitz
        
        doc = fitz.open(pdf_path)
        images = []
        
        for page_num, page in enumerate(doc):
            for img_index, img in enumerate(page.get_images(full=True)):
                xref = img[0]
                pix = fitz.Pixmap(doc, xref)
                
                if pix.n - pix.alpha < 4:  # GRAY or RGB
                    img_data = pix.tobytes("png")
                    images.append({
                        "page": page_num + 1,
                        "index": img_index,
                        "data": img_data
                    })
        
        return images
    
    def embed_image(self, image_data: bytes) -> list:
        """图片向量化（使用CLIP）"""
        from PIL import Image
        import io
        
        image = Image.open(io.BytesIO(image_data))
        
        # 使用CLIP进行图片编码
        if self.clip_model is None:
            from transformers import CLIPProcessor, CLIPModel
            self.clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
            self.clip_processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
        
        inputs = self.clip_processor(images=image, return_tensors="pt")
        image_features = self.clip_model.get_image_features(**inputs)
        
        return image_features.detach().numpy().tolist()[0]
    
    def store_multimodal_content(self, 
                                 text_chunks: list,
                                 images: list,
                                 pdf_path: str):
        """存储多模态内容"""
        # 存储文本
        self.vectorstore.add_documents(text_chunks)
        
        # 存储图片（需要有专门的多模态向量库）
        # 这里简化处理，图片以base64形式存metadata
        import base64
        
        for img in images:
            img_vec = self.embed_image(img["data"])
            img_b64 = base64.b64encode(img["data"]).decode()
            
            # 存入向量库（简化：文本描述）
            doc = Document(
                page_content=f"[图片] 来源：{pdf_path} 第{img['page']}页",
                metadata={
                    "type": "image",
                    "image_base64": img_b64,
                    "page": img["page"]
                }
            )
            
            # 实际存储需要支持图片的向量库（如Pinecone multimodal）
            # 这里仅示意
            print(f"图片向量维度: {len(img_vec)}")
    
    def answer_with_multimodal(self, query: str) -> str:
        """多模态问答"""
        # 检索文本和图片
        text_docs = self.vectorstore.similarity_search(query, k=5)
        
        # 检查检索结果中是否有图片
        has_images = any(doc.metadata.get("type") == "image" 
                        for doc in text_docs)
        
        if has_images:
            # 如果涉及图片，需要用多模态LLM处理
            prompt = f"""基于以下内容回答问题。注意：内容中可能包含图片。

问题：{query}

内容：
{[doc.page_content for doc in text_docs]}

回答："""
            
            # 使用多模态LLM（如GPT-4V、Claude 3.5）
            # response = multimodal_llm.invoke(prompt, images=[...])
            return "需要多模态LLM处理图片内容"
        
        else:
            # 纯文本，使用普通LLM
            context = "\n\n".join([doc.page_content for doc in text_docs])
            return self.llm.invoke(f"基于以下内容回答：{context}\n\n问题：{query}")
```

**表格RAG**：

```python
class TableRAG:
    """表格专用RAG"""
    
    def __init__(self, llm):
        self.llm = llm
    
    def extract_tables(self, pdf_path: str) -> list:
        """提取PDF中的表格"""
        import tabula
        
        tables = tabula.read_pdf(
            pdf_path,
            pages='all',
            lattice=True
        )
        
        return tables
    
    def store_table(self, df, table_name: str, vectorstore):
        """存储表格"""
        # 生成表格描述
        description = self._generate_table_description(df, table_name)
        
        # 表格转为文本表示
        table_text = df.to_markdown()
        
        doc = Document(
            page_content=description + "\n\n" + table_text,
            metadata={
                "type": "table",
                "table_name": table_name,
                "columns": list(df.columns),
                "row_count": len(df)
            }
        )
        
        vectorstore.add_documents([doc])
    
    def _generate_table_description(self, df, table_name: str) -> str:
        """生成表格描述"""
        prompt = f"""为以下表格生成简短描述，说明：
1. 表格的主要内容
2. 主要列的含义
3. 典型数据示例

表格名称：{table_name}

列：{list(df.columns)}

前3行数据：
{df.head(3).to_string()}

描述："""
        
        return self.llm.invoke(prompt)
    
    def query_table(self, query: str, table_docs: list) -> str:
        """表格问答"""
        for doc in table_docs:
            if doc.metadata.get("type") == "table":
                prompt = f"""基于以下表格回答问题。表格使用Markdown格式。

问题：{query}

表格：
{doc.page_content}

回答（可以直接引用表格数据）："""
                
                response = self.llm.invoke(prompt)
                return response
        
        return "没有找到相关表格"
```

---

## 6.7 RAG效果评估与调优

### 评估指标体系

RAG评估分为三个层次：

| 层次 | 评估对象 | 核心指标 | 工具 |
|------|---------|---------|------|
| **检索层** | 检索器 | Precision@K, Recall@K, MRR, NDCG@K | RAGAS, Trulens |
| **生成层** | 生成器 | Faithfulness, Answer Relevance, Context Relevance | RAGAS |
| **端到端** | 整体系统 | 回答质量、用户满意度 | 人工评估、A/B测试 |

**核心指标解释**：

- **Precision@K**：Top-K检索结果中有多少是相关的
- **Recall@K**：所有相关文档中有多少被召回
- **MRR（Mean Reciprocal Rank）**：第一个相关结果排名的倒数
- **NDCG@K**：考虑排名顺序的评估指标，越高越好
- **Faithfulness**：生成的回答是否忠实于检索内容（无幻觉）
- **Answer Relevance**：回答是否针对问题（不跑题）

### 使用RAGAS评估

RAGAS（Retrieval-Augmented Generation Assessment）是最流行的RAG评估框架：

```python
from ragas import evaluate
from ragas.metrics import (
    faithfulness,
    answer_relevancy,
    context_precision,
    context_recall,
)
from datasets import Dataset

# 准备测试数据
test_data = {
    "user_input": [
        "退换货政策是什么？",
        "如何申请企业账号？",
        "API调用频率限制是多少？",
    ],
    "retrieved_contexts": [
        ["退货政策：7天内可申请，15天内可换货...", "售后条款：..."],
        ["企业账号注册流程：...", "企业认证材料：..."],
        ["API限制：免费版每分钟60次...", "API文档：..."],
    ],
    "response": [
        "退换货政策是...",
        "申请企业账号需要...",
        "API调用频率限制...",
    ],
    "reference": [
        "根据产品手册，退货政策为7天...",
        "企业账号申请需要提交营业执照...",
        "API频率限制见API文档...",
    ]
}

# 转换为Dataset
dataset = Dataset.from_dict(test_data)

# 运行评估
result = evaluate(
    dataset=dataset,
    metrics=[
        faithfulness,        # 忠实度
        answer_relevancy,    # 回答相关性
        context_precision,   # 上下文精确度
        context_recall,      # 上下文召回率
    ]
)

# 查看结果
print(result)
```

**RAGAS评估结果解读**：

```python
# 详细解读评估结果
def interpret_ragas_results(result):
    """解读RAGAS评估结果"""
    
    scores = result.scores[0]  # 第一条数据的分数
    
    print("=" * 50)
    print("RAGAS 评估结果解读")
    print("=" * 50)
    
    print(f"\n忠实度 (Faithfulness): {scores['faithfulness']:.2f}")
    print("   → 回答中有多少内容来自检索上下文")
    print("   → <0.6: 可能有幻觉，需要检查检索质量")
    print("   → 0.6-0.8: 良好")
    print("   → >0.8: 优秀")
    
    print(f"\n回答相关性 (Answer Relevance): {scores['answer_relevancy']:.2f}")
    print("   → 回答是否针对问题")
    print("   → <0.6: 回答跑题，需要优化Prompt")
    print("   → 0.6-0.8: 良好")
    print("   → >0.8: 优秀")
    
    print(f"\n上下文精确度 (Context Precision): {scores['context_precision']:.2f}")
    print("   → 检索到的内容有多少是相关的")
    print("   → <0.6: 检索质量差，需要优化检索策略")
    print("   → 0.6-0.8: 良好")
    print("   → >0.8: 优秀")
    
    print(f"\n上下文召回率 (Context Recall): {scores['context_recall']:.2f}")
    print("   → 有多少相关信息被召回")
    print("   → <0.6: 召回不足，可能遗漏关键信息")
    print("   → 0.6-0.8: 良好")
    print("   → >0.8: 优秀")
    
    # 给出调优建议
    print("\n" + "=" * 50)
    print("调优建议")
    print("=" * 50)
    
    if scores['faithfulness'] < 0.6:
        print("⚠️ 忠实度低：检查Prompt是否强调'仅基于上下文回答'")
    
    if scores['answer_relevancy'] < 0.6:
        print("⚠️ 相关性低：优化Prompt，明确问题类型")
    
    if scores['context_precision'] < 0.6:
        print("⚠️ 检索精确度低：考虑加入重排序，或更换Embedding")
    
    if scores['context_recall'] < 0.6:
        print("⚠️ 召回率低：增加检索数量，或调整切块策略")


interpret_ragas_results(result)
```

### 组件级评估

除了端到端评估，还需要对每个组件单独评估：

```python
class RAGComponentEvaluator:
    """RAG组件级评估"""
    
    def __init__(self, vectorstore, llm):
        self.vectorstore = vectorstore
        self.llm = llm
    
    def evaluate_retriever(self, 
                         test_queries: list, 
                         relevant_docs: list) -> dict:
        """评估检索器"""
        from sklearn.metrics import precision_score, recall_score
        
        all_precisions = []
        all_recalls = []
        
        for query, relevant in zip(test_queries, relevant_docs):
            retrieved = self.vectorstore.similarity_search(query, k=10)
            retrieved_contents = set(doc.page_content for doc in retrieved)
            relevant_set = set(relevant)
            
            # 计算精确率和召回率
            tp = len(retrieved_contents & relevant_set)
            precision = tp / len(retrieved_contents) if retrieved_contents else 0
            recall = tp / len(relevant_set) if relevant_set else 0
            
            all_precisions.append(precision)
            all_recalls.append(recall)
        
        return {
            "precision@10": sum(all_precisions) / len(all_precisions),
            "recall@10": sum(all_recalls) / len(all_recalls),
        }
    
    def evaluate_generator(self, 
                          contexts: list, 
                          questions: list,
                          answers: list) -> dict:
        """评估生成器"""
        from ragas.metrics import faithfulness, answer_relevancy
        
        # 简化评估
        faithfulness_scores = []
        relevance_scores = []
        
        for context, question, answer in zip(contexts, questions, answers):
            # 忠实度：回答是否基于上下文
            faithful = self._check_faithfulness(context, answer)
            faithfulness_scores.append(faithful)
            
            # 相关性：回答是否针对问题
            relevant = self._check_relevance(question, answer)
            relevance_scores.append(relevant)
        
        return {
            "faithfulness": sum(faithfulness_scores) / len(faithfulness_scores),
            "answer_relevance": sum(relevance_scores) / len(relevance_scores),
        }
    
    def _check_faithfulness(self, context: str, answer: str) -> float:
        """检查忠实度"""
        prompt = f"""判断以下回答是否忠实于上下文。

上下文：{context}

回答：{answer}

回答是否忠实于上下文（0-1分，1表示完全忠实）："""
        
        try:
            score = float(self.llm.invoke(prompt).strip())
            return min(max(score, 0), 1)
        except:
            return 0.5
    
    def _check_relevance(self, question: str, answer: str) -> float:
        """检查相关性"""
        prompt = f"""判断以下回答是否针对问题。

问题：{question}

回答：{answer}

相关性评分（0-1分，1表示完全相关）："""
        
        try:
            score = float(self.llm.invoke(prompt).strip())
            return min(max(score, 0), 1)
        except:
            return 0.5
```

### A/B测试在RAG中的应用

生产环境中，用A/B测试对比不同配置的效果：

```python
import random
from datetime import datetime

class RAGABTest:
    """RAG A/B测试"""
    
    def __init__(self, db):
        self.db = db  # 结果存储数据库
    
    def run_ab_test(self, 
                   query: str,
                   variant_a_config: dict,
                   variant_b_config: dict,
                   user_id: str = None) -> dict:
        """
        运行A/B测试
        
        Args:
            query: 用户查询
            variant_a_config: A方案配置（如 {"retriever": "baseline", "reranker": None }）
            variant_b_config: B方案配置（如 {"retriever": "hybrid", "reranker": "bge" }）
            user_id: 用户ID（用于分桶一致性）
        """
        # 基于用户ID决定分组（保证同一用户始终看到同一版本）
        bucket = hash(user_id or str(random.random())) % 2
        
        if bucket == 0:
            variant = "A"
            config = variant_a_config
        else:
            variant = "B"
            config = variant_b_config
        
        # 执行对应版本
        result = self._execute_rag(query, config)
        
        # 记录结果
        self._log_result(query, variant, config, result, user_id)
        
        return {
            "variant": variant,
            "result": result,
        }
    
    def _execute_rag(self, query: str, config: dict) -> dict:
        """执行RAG（根据配置）"""
        # 简化实现
        if config.get("retriever") == "baseline":
            docs = vectorstore.similarity_search(query, k=5)
        elif config.get("retriever") == "hybrid":
            docs = hybrid_retriever.retrieve(query)
        
        # 重排序
        if config.get("reranker"):
            docs = rerank_documents(query, docs)
        
        # 生成
        context = "\n\n".join([doc.page_content for doc in docs])
        answer = llm.invoke(f"基于以下内容回答：{context}\n\n问题：{query}")
        
        return {
            "answer": answer,
            "docs": [doc.page_content for doc in docs],
            "doc_count": len(docs),
        }
    
    def _log_result(self, query: str, variant: str, 
                   config: dict, result: dict, user_id: str):
        """记录测试结果"""
        record = {
            "timestamp": datetime.now().isoformat(),
            "query": query,
            "variant": variant,
            "config": config,
            "doc_count": result["doc_count"],
            "answer_length": len(result["answer"]),
            "user_id": user_id,
        }
        
        # 存入数据库或日志
        self.db.insert("ab_test_results", record)
    
    def get_ab_test_summary(self, test_id: str, days: int = 7) -> dict:
        """获取A/B测试汇总"""
        # 查询最近days天的测试结果
        results = self.db.query(f"""
            SELECT variant, COUNT(*) as count, 
                   AVG(doc_count) as avg_docs
            FROM ab_test_results 
            WHERE test_id = '{test_id}'
            AND timestamp > NOW() - INTERVAL {days} DAY
            GROUP BY variant
        """)
        
        return results
```

### 调优Checklist

系统性地检查和优化RAG效果：

```python
class RAGTuningChecklist:
    """RAG调优清单"""
    
    def __init__(self, rag_system):
        self.system = rag_system
    
    def run_full_check(self) -> dict:
        """运行完整检查"""
        results = {}
        
        # 1. 数据质量检查
        results["data_quality"] = self.check_data_quality()
        
        # 2. 切块策略检查
        results["chunking"] = self.check_chunking_strategy()
        
        # 3. Embedding质量检查
        results["embedding"] = self.check_embedding_quality()
        
        # 4. 检索策略检查
        results["retrieval"] = self.check_retrieval_strategy()
        
        # 5. 生成质量检查
        results["generation"] = self.check_generation_quality()
        
        # 生成报告
        return self.generate_report(results)
    
    def check_data_quality(self) -> dict:
        """检查数据质量"""
        issues = []
        
        # 检查1：文档数量
        doc_count = self.system.get_doc_count()
        if doc_count < 100:
            issues.append("⚠️ 文档数量较少（<100），可能影响检索效果")
        
        # 检查2：重复内容
        duplicates = self.system.find_duplicates()
        if duplicates > 0.1:  # 重复率>10%
            issues.append(f"⚠️ 重复内容较多（{duplicates:.1%}）")
        
        # 检查3：空文档
        empty_docs = self.system.count_empty_documents()
        if empty_docs > 0:
            issues.append(f"⚠️ 发现{empty_docs}个空文档")
        
        # 检查4：文本长度分布
        length_dist = self.system.get_length_distribution()
        if length_dist["short"] > 0.3:  # 30%以上<100字符
            issues.append("⚠️ 短文本较多，可能语义不完整")
        
        return {
            "status": "pass" if not issues else "warning",
            "issues": issues
        }
    
    def check_chunking_strategy(self) -> dict:
        """检查切块策略"""
        config = self.system.chunking_config
        
        recommendations = []
        
        # 检查块大小
        if config["chunk_size"] < 300:
            recommendations.append("建议增加块大小（当前<300，可能语义不完整）")
        elif config["chunk_size"] > 1000:
            recommendations.append("建议减小块大小（当前>1000，可能引入噪声）")
        
        # 检查重叠
        overlap_ratio = config["chunk_overlap"] / config["chunk_size"]
        if overlap_ratio < 0.1:
            recommendations.append("建议增加重叠（当前<10%，可能丢失边界信息）")
        
        # 检查策略类型
        if config["strategy"] == "fixed" and self.system.has_complex_content:
            recommendations.append("建议使用语义切块处理复杂内容")
        
        return {
            "current_config": config,
            "recommendations": recommendations
        }
    
    def check_embedding_quality(self) -> dict:
        """检查Embedding质量"""
        # Embedding召回测试
        test_queries = [
            "退换货政策",
            "企业账号申请",
            "API调用限制",
        ]
        
        results = self.system.test_recall(test_queries)
        
        recommendations = []
        
        if results["avg_recall"] < 0.5:
            recommendations.append("召回率较低（<50%），考虑：")
            recommendations.append("  1. 更换Embedding模型")
            recommendations.append("  2. 微调Embedding")
            recommendations.append("  3. 优化切块策略")
        
        if results["avg_precision"] < 0.3:
            recommendations.append("精确度较低（<30%），考虑：")
            recommendations.append("  1. 加入重排序")
            recommendations.append("  2. 使用混合检索")
        
        return {
            "test_results": results,
            "recommendations": recommendations
        }
    
    def check_retrieval_strategy(self) -> dict:
        """检查检索策略"""
        config = self.system.retrieval_config
        
        recommendations = []
        
        # 检查k值
        if config.get("k", 5) < 3:
            recommendations.append("k值较小，可能召回不足")
        elif config.get("k", 5) > 20:
            recommendations.append("k值较大，可能引入噪声")
        
        # 检查是否使用重排序
        if not config.get("use_reranker"):
            recommendations.append("建议加入重排序以提升精度")
        
        # 检查是否使用混合检索
        if not config.get("use_hybrid"):
            recommendations.append("考虑使用混合检索（向量+BM25）")
        
        return {
            "current_config": config,
            "recommendations": recommendations
        }
    
    def check_generation_quality(self) -> dict:
        """检查生成质量"""
        # 使用RAGAS评估
        # ...
        return {}
    
    def generate_report(self, results: dict) -> str:
        """生成调优报告"""
        report = """
# RAG系统调优报告

## 1. 数据质量
"""
        report += f"状态：{results['data_quality']['status']}\n"
        if results['data_quality']['issues']:
            report += "\n问题：\n" + "\n".join(results['data_quality']['issues'])
        
        report += """

## 2. 切块策略
当前配置：{chunk_size}字符 / {overlap}重叠

建议：
"""
        report += "\n".join(results['chunking']['recommendations'])
        
        report += """

## 3. Embedding质量
"""
        report += f"平均召回率：{results['embedding']['test_results']['avg_recall']:.1%}\n"
        report += f"平均精确度：{results['embedding']['test_results']['avg_precision']:.1%}\n"
        report += "\n".join(results['embedding']['recommendations'])
        
        report += """

## 4. 检索策略
"""
        report += "\n".join(results['retrieval']['recommendations'])
        
        return report
```

---

## 6.8 实战：生产级企业知识库问答系统

这一节我们搭建一个考虑**错误处理**、**缓存**、**并发**、**监控**的生产级RAG系统。

### 系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                      企业知识库问答系统                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐                                               │
│  │   用户请求   │                                                │
│  └──────┬──────┘                                               │
│         │                                                      │
│         ▼                                                      │
│  ┌─────────────┐     ┌─────────────┐                         │
│  │  请求队列   │────▶│  限流器     │                         │
│  │  (Redis)    │     │  TokenBucket│                         │
│  └─────────────┘     └──────┬──────┘                         │
│                             │                                  │
│                             ▼                                  │
│  ┌─────────────────────────────────────┐                        │
│  │         RAG Engine (核心)            │                        │
│  │  ┌─────────┐  ┌─────────┐          │                        │
│  │  │ 查询改写 │  │ 检索    │          │                        │
│  │  └─────────┘  └────┬────┘          │                        │
│  │                    │                │                        │
│  │  ┌─────────┐  ┌────▼────┐  ┌───────┐│                        │
│  │  │ Prompt  │◀─│ Rerank  │◀─│ Vector ││                        │
│  │  │组装     │  │         │  │Search  ││                        │
│  │  └────┬────┘  └─────────┘  └────────┘│                        │
│  │       │                                │                        │
│  │       ▼                                │                        │
│  │  ┌─────────┐                          │                        │
│  │  │ LLM生成 │                          │                        │
│  │  └────┬────┘                          │                        │
│  └────────┼──────────────────────────────┘                        │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────────────────────────┐                        │
│  │         缓存层 (Redis)              │                        │
│  │  - 查询缓存 (TTL: 1h)               │                        │
│  │  - Embedding缓存 (TTL: 24h)         │                        │
│  └─────────────────────────────────────┘                        │
│                                                                 │
│  ┌─────────────────────────────────────┐                        │
│  │         监控 (Prometheus)            │                        │
│  │  - QPS / 延迟 / 错误率               │                        │
│  │  - 检索质量指标                      │                        │
│  └─────────────────────────────────────┘                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 完整代码实现

```python
# production_rag_system.py
"""
生产级企业知识库问答系统
包含：错误处理、缓存、并发、监控
"""

import os
import hashlib
import time
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from functools import wraps
from collections import defaultdict
import threading

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ==================== 配置 ====================
class Config:
    """系统配置"""
    
    # Embedding配置
    EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "BAAI/bge-m3")
    EMBEDDING_DEVICE = os.getenv("EMBEDDING_DEVICE", "cuda")
    
    # 向量数据库配置
    QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
    QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6333"))
    COLLECTION_NAME = os.getenv("COLLECTION_NAME", "knowledge_base")
    
    # 切块配置
    CHUNK_SIZE = 500
    CHUNK_OVERLAP = 50
    
    # 检索配置
    RETRIEVAL_K = 5
    RERANK_TOP_K = 3
    USE_RERANKER = True
    USE_HYBRID = True
    HYBRID_ALPHA = 0.7  # 向量权重
    
    # 缓存配置
    CACHE_ENABLED = True
    QUERY_CACHE_TTL = 3600  # 1小时
    EMBEDDING_CACHE_TTL = 86400  # 24小时
    
    # 限流配置
    RATE_LIMIT_ENABLED = True
    MAX_QPS = 10  # 每秒最大请求数
    
    # LLM配置
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o")


# ==================== 错误处理 ====================
class RAGError(Exception):
    """RAG系统基础异常"""
    pass

class RetrievalError(RAGError):
    """检索相关错误"""
    pass

class GenerationError(RAGError):
    """生成相关错误"""
    pass

class ConfigurationError(RAGError):
    """配置错误"""
    pass


class ErrorHandler:
    """错误处理器"""
    
    def __init__(self, logger: logging.Logger):
        self.logger = logger
        self.error_counts = defaultdict(int)
        self.error_timestamps = defaultdict(list)
    
    def handle_error(self, error: Exception, context: str = "") -> str:
        """处理错误并返回用户友好的消息"""
        error_type = type(error).__name__
        self.error_counts[error_type] += 1
        self.error_timestamps[error_type].append(time.time())
        
        self.logger.error(f"[{context}] {error_type}: {error}", exc_info=True)
        
        # 根据错误类型返回不同消息
        if isinstance(error, RetrievalError):
            return "抱歉，检索服务暂时不可用，请稍后重试。"
        elif isinstance(error, GenerationError):
            return "抱歉，生成服务暂时不可用，请稍后重试。"
        elif isinstance(error, ConfigurationError):
            return "系统配置错误，请联系管理员。"
        else:
            return f"系统出现未知错误：{str(error)}"
    
    def get_error_stats(self) -> Dict[str, Any]:
        """获取错误统计"""
        now = time.time()
        recent_window = 300  # 最近5分钟
        
        stats = {}
        for error_type, timestamps in self.error_timestamps.items():
            recent = [t for t in timestamps if now - t < recent_window]
            stats[error_type] = {
                "total": self.error_counts[error_type],
                "recent_5min": len(recent)
            }
        
        return stats


# ==================== 缓存 ====================
class Cache:
    """简单内存缓存（生产环境建议用Redis）"""
    
    def __init__(self, default_ttl: int = 3600):
        self.default_ttl = default_ttl
        self.cache: Dict[str, tuple] = {}  # {key: (value, expire_time)}
        self.lock = threading.Lock()
    
    def get(self, key: str) -> Optional[Any]:
        """获取缓存"""
        with self.lock:
            if key in self.cache:
                value, expire_time = self.cache[key]
                if time.time() < expire_time:
                    return value
                else:
                    del self.cache[key]
        return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """设置缓存"""
        ttl = ttl or self.default_ttl
        expire_time = time.time() + ttl
        
        with self.lock:
            self.cache[key] = (value, expire_time)
    
    def delete(self, key: str) -> None:
        """删除缓存"""
        with self.lock:
            if key in self.cache:
                del self.cache[key]
    
    def clear(self) -> None:
        """清空缓存"""
        with self.lock:
            self.cache.clear()
    
    def _generate_key(self, *args) -> str:
        """生成缓存key"""
        key_str = "_".join(str(arg) for arg in args)
        return hashlib.md5(key_str.encode()).hexdigest()


class EmbeddingCache(Cache):
    """Embedding结果缓存"""
    
    def __init__(self):
        super().__init__(default_ttl=Config.EMBEDDING_CACHE_TTL)
    
    def get_embedding(self, text: str) -> Optional[List[float]]:
        """获取文本的Embedding"""
        key = self._generate_key("emb", text)
        return self.get(key)
    
    def set_embedding(self, text: str, embedding: List[float]) -> None:
        """缓存文本的Embedding"""
        key = self._generate_key("emb", text)
        self.set(key, embedding)


class QueryCache(Cache):
    """查询结果缓存"""
    
    def __init__(self):
        super().__init__(default_ttl=Config.QUERY_CACHE_TTL)
    
    def get_result(self, query: str, k: int) -> Optional[Dict]:
        """获取查询结果"""
        key = self._generate_key("query", query, k)
        return self.get(key)
    
    def set_result(self, query: str, k: int, result: Dict) -> None:
        """缓存查询结果"""
        key = self._generate_key("query", query, k)
        self.set(key, result)


# ==================== 限流 ====================
class RateLimiter:
    """令牌桶限流器"""
    
    def __init__(self, max_qps: float):
        self.max_qps = max_qps
        self.tokens = max_qps
        self.last_update = time.time()
        self.lock = threading.Lock()
    
    def acquire(self) -> bool:
        """尝试获取令牌"""
        with self.lock:
            now = time.time()
            elapsed = now - self.last_update
            self.last_update = now
            
            # 添加令牌
            self.tokens = min(self.max_qps, self.tokens + elapsed * self.max_qps)
            
            if self.tokens >= 1:
                self.tokens -= 1
                return True
            return False
    
    def wait_and_acquire(self, timeout: float = 1.0) -> bool:
        """等待并获取令牌"""
        start_time = time.time()
        while time.time() - start_time < timeout:
            if self.acquire():
                return True
            time.sleep(0.01)
        return False


# ==================== 监控 ====================
class MetricsCollector:
    """指标收集器"""
    
    def __init__(self):
        self.metrics = defaultdict(list)
        self.lock = threading.Lock()
    
    def record(self, metric_name: str, value: float, tags: Dict = None) -> None:
        """记录指标"""
        with self.lock:
            self.metrics[metric_name].append({
                "value": value,
                "timestamp": time.time(),
                "tags": tags or {}
            })
    
    def record_latency(self, operation: str, latency: float, success: bool) -> None:
        """记录延迟"""
        self.record(f"{operation}_latency", latency, {"success": str(success)})
    
    def record_request(self, endpoint: str, status: str) -> None:
        """记录请求"""
        self.record("requests_total", 1, {"endpoint": endpoint, "status": status})
    
    def get_stats(self, metric_name: str, window_seconds: int = 300) -> Dict:
        """获取指标统计"""
        now = time.time()
        cutoff = now - window_seconds
        
        with self.lock:
            values = [
                m["value"] for m in self.metrics[metric_name]
                if m["timestamp"] > cutoff
            ]
        
        if not values:
            return {"count": 0, "avg": 0, "p50": 0, "p95": 0, "p99": 0}
        
        sorted_values = sorted(values)
        n = len(sorted_values)
        
        return {
            "count": n,
            "avg": sum(values) / n,
            "min": sorted_values[0],
            "max": sorted_values[-1],
            "p50": sorted_values[int(n * 0.5)],
            "p95": sorted_values[int(n * 0.95)] if n > 1 else sorted_values[0],
            "p99": sorted_values[int(n * 0.99)] if n > 1 else sorted_values[0],
        }
    
    def get_all_stats(self) -> Dict:
        """获取所有指标统计"""
        return {
            metric_name: self.get_stats(metric_name)
            for metric_name in self.metrics.keys()
        }


# ==================== RAG引擎 ====================
class ProductionRAGEngine:
    """生产级RAG引擎"""
    
    def __init__(self, config: Config = None):
        self.config = config or Config()
        self.error_handler = ErrorHandler(logger)
        self.embedding_cache = EmbeddingCache()
        self.query_cache = QueryCache()
        self.rate_limiter = RateLimiter(self.config.MAX_QPS)
        self.metrics = MetricsCollector()
        
        # 延迟初始化组件
        self._embeddings = None
        self._vectorstore = None
        self._reranker = None
        self._llm = None
        self._initialized = False
    
    def initialize(self) -> None:
        """初始化组件"""
        if self._initialized:
            return
        
        try:
            logger.info("初始化RAG系统...")
            
            # 初始化Embedding
            from langchain_huggingface import HuggingFaceEmbeddings
            self._embeddings = HuggingFaceEmbeddings(
                model_name=self.config.EMBEDDING_MODEL,
                model_kwargs={'device': self.config.EMBEDDING_DEVICE},
                encode_kwargs={'normalize_embeddings': True}
            )
            logger.info(f"Embedding模型加载完成: {self.config.EMBEDDING_MODEL}")
            
            # 初始化向量数据库
            from langchain_qdrant import QdrantVectorStore
            self._vectorstore = QdrantVectorStore.from_existing_collection(
                embedding=self._embeddings,
                collection_name=self.config.COLLECTION_NAME,
                host=self.config.QDRANT_HOST,
                port=self.config.QDRANT_PORT
            )
            logger.info("向量数据库连接完成")
            
            # 初始化重排序模型
            if self.config.USE_RERANKER:
                from sentence_transformers import CrossEncoder
                self._reranker = CrossEncoder('BAAI/bge-reranker-base')
                logger.info("重排序模型加载完成")
            
            # 初始化LLM
            from langchain_openai import OpenAI
            self._llm = OpenAI(api_key=self.config.OPENAI_API_KEY)
            logger.info("LLM初始化完成")
            
            self._initialized = True
            logger.info("RAG系统初始化完成！")
            
        except Exception as e:
            logger.error(f"初始化失败: {e}")
            raise ConfigurationError(f"系统初始化失败: {e}")
    
    def _get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """获取文本的Embedding（带缓存）"""
        embeddings = []
        
        for text in texts:
            # 先查缓存
            cached = self.embedding_cache.get_embedding(text)
            if cached is not None:
                embeddings.append(cached)
            else:
                # 计算Embedding
                emb = self._embeddings.embed_query(text) if len(text) < 512 \
                      else self._embeddings.embed_documents([text])[0]
                embeddings.append(emb)
                self.embedding_cache.set_embedding(text, emb)
        
        return embeddings
    
    def _retrieve(self, query: str, k: int) -> List:
        """检索文档"""
        try:
            if self.config.USE_HYBRID:
                # 混合检索
                docs = self._vectorstore.hybrid_search(
                    query=query,
                    k=k,
                    alpha=self.config.HYBRID_ALPHA
                )
            else:
                # 纯向量检索
                docs = self._vectorstore.similarity_search(query, k=k)
            
            return docs
            
        except Exception as e:
            raise RetrievalError(f"检索失败: {e}")
    
    def _rerank(self, query: str, docs: List, top_k: int) -> List:
        """重排序"""
        if not docs or not self._reranker:
            return docs[:top_k]
        
        try:
            pairs = [[query, doc.page_content] for doc in docs]
            scores = self._reranker.predict(pairs)
            
            doc_scores = list(zip(docs, scores))
            doc_scores.sort(key=lambda x: x[1], reverse=True)
            
            return [doc for doc, score in doc_scores[:top_k]]
            
        except Exception as e:
            logger.warning(f"重排序失败: {e}")
            return docs[:top_k]
    
    def _generate(self, query: str, context: str) -> str:
        """生成回答"""
        try:
            prompt = f"""你是一个专业的问答助手。请基于以下上下文回答用户问题。

要求：
1. 只基于上下文回答，不要编造信息
2. 如果上下文没有相关信息，直接说"无法从知识库中找到答案"
3. 回答要准确、简洁、有条理

上下文：
---
{context}
---

问题：{query}

回答："""
            
            response = self._llm.invoke(prompt)
            return response.strip()
            
        except Exception as e:
            raise GenerationError(f"生成失败: {e}")
    
    def query(self, question: str, user_id: str = None) -> Dict[str, Any]:
        """处理用户查询"""
        start_time = time.time()
        success = False
        
        try:
            # 初始化（如尚未初始化）
            self.initialize()
            
            # 限流
            if self.config.RATE_LIMIT_ENABLED:
                if not self.rate_limiter.wait_and_acquire(timeout=1.0):
                    return {
                        "success": False,
                        "error": "请求过于频繁，请稍后重试",
                        "answer": None,
                        "sources": []
                    }
            
            # 查询缓存
            if self.config.CACHE_ENABLED:
                cached = self.query_cache.get_result(question, self.config.RETRIEVAL_K)
                if cached:
                    self.metrics.record_request("query", "cache_hit")
                    return {
                        "success": True,
                        "answer": cached["answer"],
                        "sources": cached["sources"],
                        "from_cache": True
                    }
            
            # 检索
            docs = self._retrieve(question, self.config.RETRIEVAL_K)
            
            # 重排序
            if self.config.USE_RERANKER:
                docs = self._rerank(question, docs, self.config.RERANK_TOP_K)
            
            if not docs:
                return {
                    "success": True,
                    "answer": "抱歉，知识库中没有找到相关内容。",
                    "sources": [],
                    "from_cache": False
                }
            
            # 组装上下文
            context = "\n\n".join([doc.page_content for doc in docs])
            
            # 生成
            answer = self._generate(question, context)
            
            # 构建来源信息
            sources = [
                {
                    "content": doc.page_content[:200] + "..." if len(doc.page_content) > 200 else doc.page_content,
                    "source": doc.metadata.get("source", "未知"),
                    "score": float(doc.metadata.get("score", 0))
                }
                for doc in docs
            ]
            
            # 缓存结果
            if self.config.CACHE_ENABLED:
                self.query_cache.set_result(question, self.config.RETRIEVAL_K, {
                    "answer": answer,
                    "sources": sources
                })
            
            success = True
            self.metrics.record_request("query", "success")
            
            return {
                "success": True,
                "answer": answer,
                "sources": sources,
                "from_cache": False
            }
            
        except Exception as e:
            error_msg = self.error_handler.handle_error(e, "query")
            self.metrics.record_request("query", "error")
            
            return {
                "success": False,
                "error": error_msg,
                "answer": None,
                "sources": []
            }
            
        finally:
            latency = time.time() - start_time
            self.metrics.record_latency("query", latency, success)
    
    def add_document(self, file_path: str) -> Dict[str, Any]:
        """添加文档到知识库"""
        start_time = time.time()
        success = False
        
        try:
            self.initialize()
            
            # 根据文件类型选择加载器
            from langchain_community.document_loaders import (
                PyPDFLoader, UnstructuredMarkdownLoader, TextLoader
            )
            from langchain.text_splitters import RecursiveCharacterTextSplitter
            
            ext = os.path.splitext(file_path)[1].lower()
            
            if ext == ".pdf":
                loader = PyPDFLoader(file_path)
            elif ext == ".md":
                loader = UnstructuredMarkdownLoader(file_path)
            elif ext == ".txt":
                loader = TextLoader(file_path)
            else:
                return {
                    "success": False,
                    "error": f"不支持的文件格式: {ext}",
                    "chunks_added": 0
                }
            
            # 加载文档
            docs = loader.load()
            
            # 切块
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=self.config.CHUNK_SIZE,
                chunk_overlap=self.config.CHUNK_OVERLAP
            )
            chunks = text_splitter.split_documents(docs)
            
            # 添加元数据
            for chunk in chunks:
                chunk.metadata.update({
                    "source_file": os.path.basename(file_path),
                    "added_at": datetime.now().isoformat()
                })
            
            # 存入向量数据库
            self._vectorstore.add_documents(chunks)
            
            # 清除相关缓存
            self.query_cache.clear()
            
            success = True
            
            return {
                "success": True,
                "chunks_added": len(chunks),
                "file": os.path.basename(file_path)
            }
            
        except Exception as e:
            error_msg = self.error_handler.handle_error(e, "add_document")
            
            return {
                "success": False,
                "error": error_msg,
                "chunks_added": 0
            }
            
        finally:
            latency = time.time() - start_time
            self.metrics.record_latency("add_document", latency, success)
    
    def get_health_status(self) -> Dict[str, Any]:
        """获取系统健康状态"""
        return {
            "status": "healthy" if self._initialized else "initializing",
            "initialized": self._initialized,
            "error_stats": self.error_handler.get_error_stats(),
            "metrics": self.metrics.get_all_stats(),
            "cache_size": {
                "embedding": len(self.embedding_cache.cache),
                "query": len(self.query_cache.cache)
            }
        }
    
    def get_system_stats(self) -> Dict[str, Any]:
        """获取系统统计"""
        stats = self.metrics.get_all_stats()
        
        return {
            "qps": stats.get("requests_total", {}).get("count", 0) / 300,
            "avg_latency": stats.get("query_latency", {}).get("avg", 0),
            "p95_latency": stats.get("query_latency", {}).get("p95", 0),
            "error_rate": self._calculate_error_rate(),
            "cache_hit_rate": self._calculate_cache_hit_rate()
        }
    
    def _calculate_error_rate(self) -> float:
        """计算错误率"""
        stats = self.metrics.get_all_stats()
        requests = stats.get("requests_total", {}).get("count", 0)
        if requests == 0:
            return 0.0
        
        errors = sum(
            s.get("count", 0) for k, s in stats.items()
            if "error" in k.lower()
        )
        
        return errors / requests if requests > 0 else 0.0
    
    def _calculate_cache_hit_rate(self) -> float:
        """计算缓存命中率"""
        # 简化实现
        return 0.0


# ==================== API服务 ====================
def create_api_app(rag_engine: ProductionRAGEngine):
    """创建API服务"""
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel
    
    app = FastAPI(title="企业知识库问答系统", version="1.0.0")
    
    class QueryRequest(BaseModel):
        question: str
        user_id: str = None
    
    class QueryResponse(BaseModel):
        success: bool
        answer: str = None
        sources: list = None
        error: str = None
        from_cache: bool = False
    
    @app.post("/query", response_model=QueryResponse)
    async def query(request: QueryRequest):
        """问答接口"""
        result = rag_engine.query(request.question, request.user_id)
        return QueryResponse(**result)
    
    @app.get("/health")
    async def health():
        """健康检查"""
        return rag_engine.get_health_status()
    
    @app.get("/stats")
    async def stats():
        """系统统计"""
        return rag_engine.get_system_stats()
    
    @app.post("/documents/add")
    async def add_document(file_path: str):
        """添加文档"""
        result = rag_engine.add_document(file_path)
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    
    return app, uvicorn


# ==================== 主函数 ====================
def main():
    """主函数"""
    import uvicorn
    from fastapi import FastAPI
    from pydantic import BaseModel
    
    # 创建RAG引擎
    rag = ProductionRAGEngine()
    
    # 创建FastAPI应用
    app = FastAPI(title="企业知识库问答系统", version="1.0.0")
    
    class QueryRequest(BaseModel):
        question: str
        user_id: str = None
    
    class QueryResponse(BaseModel):
        success: bool
        answer: str = None
        sources: list = None
        error: str = None
        from_cache: bool = False
    
    @app.post("/query", response_model=QueryResponse)
    async def query(request: QueryRequest):
        """问答接口"""
        result = rag.query(request.question, request.user_id)
        return QueryResponse(**result)
    
    @app.get("/health")
    async def health():
        """健康检查"""
        return rag.get_health_status()
    
    @app.get("/stats")
    async def stats():
        """系统统计"""
        return rag.get_system_stats()
    
    @app.post("/documents/add")
    async def add_document(file_path: str):
        """添加文档"""
        result = rag.add_document(file_path)
        if not result["success"]:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    
    # 启动服务
    print("启动企业知识库问答系统...")
    print("API地址: http://localhost:8000")
    print("文档地址: http://localhost:8000/docs")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
```

### 部署方案

**Docker Compose 部署**：

```yaml
# docker-compose.yml
version: '3.8'

services:
  # RAG API服务
  rag-api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - QDRANT_HOST=qdrant
      - QDRANT_PORT=6333
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - qdrant
      - redis
    volumes:
      - ./documents:/app/documents
    restart: unless-stopped

  # Qdrant向量数据库
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
      - "6334:6334"
    volumes:
      - qdrant_storage:/qdrant/storage
    restart: unless-stopped

  # Redis缓存
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  # Prometheus监控
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    restart: unless-stopped

volumes:
  qdrant_storage:
  redis_data:
```

**启动命令**：

```bash
# 1. 创建.env文件
echo "OPENAI_API_KEY=sk-your-key" > .env

# 2. 启动服务
docker-compose up -d

# 3. 检查服务状态
docker-compose ps

# 4. 查看日志
docker-compose logs -f rag-api
```

**API使用示例**：

```python
import requests

# 问答
response = requests.post(
    "http://localhost:8000/query",
    json={"question": "退换货政策是什么？", "user_id": "user123"}
)
print(response.json())

# 添加文档
response = requests.post(
    "http://localhost:8000/documents/add",
    params={"file_path": "/app/documents/产品手册.pdf"}
)
print(response.json())

# 健康检查
response = requests.get("http://localhost:8000/health")
print(response.json())

# 系统统计
response = requests.get("http://localhost:8000/stats")
print(response.json())
```

---

## 行动清单

**✅ 理解RAG核心原理**
- 大模型有知识边界（时效性、私有性、专业性）
- RAG是2026年解决知识边界的主流方案
- 三种解决思路对比：Fine-tuning vs Prompt vs RAG

**✅ 掌握RAG完整链路**
- 索引阶段：文档加载 → 切块 → 向量化 → 存储
- 查询阶段：检索 → 重排序 → 组装Prompt → 生成

**✅ 掌握文本切块策略**
- 递归切块：通用、稳定、快速
- 语义切块：语义完整、但成本高
- Parent-Child：小块检索、大块返回
- 元数据增强：支持过滤、支持溯源

**✅ 选对Embedding模型**
- 中文首选：BGE-M3
- 高精度需求：GTE-Qwen2-7B（有GPU）
- 微调：只在领域术语多、预训练效果差时考虑

**✅ 掌握检索优化技巧**
- 相似度检索：基础
- 混合检索：向量+BM25，alpha=0.7效果不错
- 重排序：显著提升精度
- 查询改写：让用户问题更精确

**✅ 理解高级RAG架构**
- Self-RAG：让模型自己判断是否需要检索
- CRAG：检索质量差时触发纠错
- Multi-hop RAG：多步推理
- Agentic RAG：Agent自主决策
- 多模态RAG：图片、表格、视频

**✅ 建立评估体系**
- RAGAS评估框架
- 组件级评估
- A/B测试
- 调优Checklist

**✅ 完成生产级项目**
- 错误处理：分类处理、优雅降级
- 缓存：Embedding缓存、查询缓存
- 并发：限流、线程安全
- 监控：延迟、QPS、错误率

**✅ 深入理解面试高频问题**
- RAG和Fine-tuning的区别
- 怎么提升检索质量
- 怎么处理幻觉问题
- 怎么评估RAG系统

恭喜你完成RAG核心章节的学习！这是AI应用开发最重要的一章，面试必问、实战必用。把这章内容吃透，你就超过了80%的竞争者。

---

*本章完*
