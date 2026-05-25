---
outline: deep
---

# Chapter 10: LlamaIndex & Vector Databases

## What You'll Learn

In the previous chapter, we learned LangChain. It's good at **connecting various components**—building Agents, calling tools, orchestrating complex flows.

But have you noticed a problem: although LangChain can do RAG, it's actually quite weak in **data processing and indexing**. How to chunk documents, how to store efficiently, how to retrieve precisely—LangChain struggles with these dirty, exhausting tasks.

This is LlamaIndex's specialty.

If LangChain is the "process orchestration master," then LlamaIndex is the "data indexing expert." Its core philosophy: **making your private data efficiently queryable by LLMs.**

After reading this chapter, you will take away:

- LlamaIndex core architecture and design philosophy (division of labor with LangChain)
- **Advanced index types**: Summary Index, Keyword Table Index, Knowledge Graph Index
- **LlamaIndex + LangChain collaboration**: Boundary of respective advantages and hybrid architecture
- Vector database selection: Chroma / Qdrant / Milvus / Pinecone and their applicable scenarios
- **Self-built vs cloud service** cost and operations comparison
- **Vector database performance optimization**: HNSW parameter tuning, quantization, sharding

---

> **Full translation coming soon. You can read the Chinese version in the meantime.**
>
> 中文原文：[阅读中文版](/zh/part3-practice/chapter10)
