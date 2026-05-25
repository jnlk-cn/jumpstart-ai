---
outline: deep
---

# 第10章 LlamaIndexとベクトルデータベース

## 本章で学べること

前一章我们学了LangChain，这家伙擅长的是**把各种组件串起来**——搭Agent、调工具、编排复杂流程。

でも你有没有发现一个问题：LangChain虽然能做RAG，但在**数据处理和索引**这块，其实挺薄弱的。文档怎么切、怎么高效存储、怎么精准检索——LangChain做起来总有点力不从心。

これがLlamaIndexの专场です。

LangChainが「流程编排大师」なら、LlamaIndexは「数据索引专家」。その核心理念は：**让你的私有数据能被大模型高效查询**。

读完这章你会带走：

- LlamaIndexのコアアーキテクチャと設計思想（LangChainとの分業）
- **高度索引タイプの詳解**：Summary Index、Keyword Table Index、Knowledge Graph Indexの選択策略
- **LlamaIndexとLangChainの協調**：各自优势边界とハイブリッドアーキテクチャ実践
- ベクトルデータベースの選定戦略：Chroma / Qdrant / Milvus / Pineconeそれぞれの適用シナリオ
- **自建 vs クラウドサービス**のコストと運用の对比

---

> **全文の翻訳は後日公開予定、しばらくお待ちください。中文版は今すぐ読めます。**
>
> 中文原文：[中文版阅读](/zh/part3-practice/chapter10)
