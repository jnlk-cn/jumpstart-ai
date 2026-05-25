---
outline: deep
---

# 제10장 LlamaIndex와 벡터 데이터베이스

##本章에서 배울 것들

이전 챕터에서 LangChain을 배웠습니다. 이 녀석은 **여러 구성 요소를 연결**하는 데 뛰어납니다 - 에이전트 구축, 도구 호출, 복잡한 흐름 오케스트레이션.

하지만 문제를 발견했습니까: LangChain은 RAG를 할 수 있지만, **데이터 처리와 인덱싱** 부분에서는 사실 꽤薄弱합니다. 문서를 어떻게 자르고, 어떻게 효율적으로 저장하고, 어떻게 정확하게 검색하는지 - LangChain은 이러한 힘든 일을 하다 보니 좀 무력합니다.

이것이 LlamaIndex의 전문 분야입니다.

LangChain이 "流程编排大师"라면, LlamaIndex는 "数据索引专家"입니다. 그 핵심 철학은: **당신의プライベート 데이터를 대규모 모델이 효율적으로 查询할 수 있게 하는 것**.

이 챕터를 읽고 나면 가져갈 것들:

- LlamaIndex 코어 아키텍처와 설계 철학(LangChain과의 분업)
- **고급 인덱스 유형 상세**: Summary Index, Keyword Table Index, Knowledge Graph Index 선택 전략
- **LlamaIndex + LangChain 협업**: 각자의 우위 경계와 하이브리드 아키텍처 실전
- 벡터 데이터베이스 선택 전략: Chroma / Qdrant / Milvus / Pinecone 각자의 적용 시나리오
- **자체 구축 vs 클라우드 서비스** 비용 및 운용 비교

---

> **전체 번역은 곧 제공될 예정입니다. 지금은中文版을 읽으실 수 있습니다.**
>
> 中文原文：[中文版阅读](/zh/part3-practice/chapter10)
