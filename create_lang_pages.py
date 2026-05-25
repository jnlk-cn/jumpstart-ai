import os

# 章节信息
CHAPTERS_EN = {
    'Part 1: Cognition': [
        ('chapter1', 'Chapter 1: The Truth About AI Application Development', 'Learn the difference between AI research and AI application development.'),
        ('chapter2', 'Chapter 2: Why "Jumping In First" is a Rational Strategy', 'Understand why practice-first learning beats theory-first.'),
        ('chapter3', 'Chapter 3: Your Career Roadmap', 'Discover the clear path from beginner to AI developer.'),
    ],
    'Part 2: Fundamentals': [
        ('chapter4', 'Chapter 4: Python and Engineering Basics', 'Master the essential Python skills for AI development.'),
        ('chapter5', 'Chapter 5: LLM API Calls and Prompt Engineering', 'Learn to effectively use large language models.'),
        ('chapter6', 'Chapter 6: RAG - Retrieval Augmented Generation', 'Build knowledge-augmented AI systems.'),
        ('chapter7', 'Chapter 7: AI Agent Core Logic', 'Understand the fundamentals of AI agents.'),
    ],
    'Part 3: Practice': [
        ('chapter8', 'Chapter 8: From Prompt Engineering to Agent Development', 'Trace the evolution of AI application development.'),
        ('chapter9', 'Chapter 9: LangChain in Practice', 'Hands-on LangChain development.'),
        ('chapter10', 'Chapter 10: LlamaIndex and Vector Databases', 'Master data indexing and retrieval.'),
        ('chapter11', 'Chapter 11: Agent Development and Skill Development', 'Build production-ready AI agents.'),
        ('chapter12', 'Chapter 12: Service Deployment and Engineering', 'Deploy and scale your AI applications.'),
    ],
    'Part 4: Advanced': [
        ('chapter13', 'Chapter 13: Reproducing Open Source Projects', 'Gain experience by reproducing real projects.'),
        ('chapter14', 'Chapter 14: Business Thinking - From Requirements to Implementation', 'Bridge the gap between tech and business.'),
        ('chapter15', 'Chapter 15: Systematic Learning and Knowledge Building', 'Build your long-term knowledge foundation.'),
    ],
    'Part 5: Career': [
        ('chapter16', 'Chapter 16: Resume and Portfolio', 'Craft a compelling developer profile.'),
        ('chapter17', 'Chapter 17: Interview Practice', 'Ace your AI developer interviews.'),
        ('chapter18', 'Chapter 18: First 30 Days at Work', 'Quickly establish yourself in a new role.'),
        ('chapter19', 'Chapter 19: First 6 Months - From Fitting In to Standing Out', 'Transform from newcomer to valuable team member.'),
        ('chapter20', 'Chapter 20: The Future of AI Application Developers', 'Explore the future trends of AI application development.'),
    ],
}

CHAPTERS_JA = {
    '第1篇 認知篇': [
        ('chapter1', '第1章 AIアプリ開発の真実', 'AI研究開発とAIアプリ開発の違いを学ぶ。'),
        ('chapter2', '第2章 「まず飛び込む」ことが合理的な戦略である理由', '実践優先学習が理論優先学習より優れた理由を解説。'),
        ('chapter3', '第3章 あなたのキャリアロードマップ', '初心者がAI開発者になるための明確な道筋。'),
    ],
    '第2篇 基礎篇': [
        ('chapter4', '第4章 Pythonとエンジニアリング基礎', 'AI開発に必要なPythonスキルを習得。'),
        ('chapter5', '第5章 LLM API呼び出しとプロンプトエンジニアリング', '大規模言語モデルを効果的に活用する方法を学ぶ。'),
        ('chapter6', '第6章 RAG - 検索拡張生成', '知識強化AIシステムを構築。'),
        ('chapter7', '第7章 AIエージェントのコアロジック', 'AIエージェントの基礎を理解する。'),
    ],
    '第3篇 実践篇': [
        ('chapter8', '第8章 プロンプトエンジニアリングからエージェント開発へ', 'AIアプリ開発の進化を追跡。'),
        ('chapter9', '第9章 LangChainの実践', 'Hands-on LangChain開発。'),
        ('chapter10', '第10章 LlamaIndexとベクトルデータベース', 'データインデックスと検索をマスター。'),
        ('chapter11', '第11章 エージェント開発とスキル開発', '本番対応のAIエージェントを構築。'),
        ('chapter12', '第12章 サービスデプロイとエンジニアリング', 'AIアプリケーションをデプロイしてスケーリング。'),
    ],
    '第4篇 上級篇': [
        ('chapter13', '第13章 オープンソースプロジェクトの再現', '実際のプロジェクトを再現して経験を積む。'),
        ('chapter14', '第14章 ビジネス思考 - 要件から実装へ', '技術とビジネスのギャップを埋める。'),
        ('chapter15', '第15章 体系的な学習と知識構築', '長期的な知識基盤を構築。'),
    ],
    '第5篇 キャリア篇': [
        ('chapter16', '第16章 履歴書とポートフォリオ', '魅力的な開発者プロフィールを作成。'),
        ('chapter17', '第17章 面接実践', 'AI開発者の面接を突破。'),
        ('chapter18', '第18章 入社後30日', '新しい職場で素早く馴染む。'),
        ('chapter19', '第19章 入社後6ヶ月 - 融入から卓越へ', '新人から価値あるチームメンバーに成長。'),
        ('chapter20', '第20章 AIアプリ開発者の未来', 'AIアプリ開発者の未来の発展傾向を展望。'),
    ],
}

CHAPTERS_KO = {
    '제1편 인식편': [
        ('chapter1', '제1장 AI 앱 개발의 진실', 'AI 연구개발과 AI 앱 개발의 차이점을 배운다.'),
        ('chapter2', '제2장 "먼저 뛰어들기"가 합리적인 전략인 이유', '실천 중심 학습이 이론 중심 학습보다 뛰어난 이유를 이해한다.'),
        ('chapter3', '제3장 당신의 커리어 로드맵', '초보에서 AI 개발자로 가는 명확한 길을 발견한다.'),
    ],
    '제2편 기초편': [
        ('chapter4', '제4장 Python와 엔지니어링 기초', 'AI 개발에 필수적인 Python 기술을 마스터한다.'),
        ('chapter5', '제5장 LLM API 호출과 프롬프트 엔지니어링', '대규모 언어 모델을 효과적으로 사용하는 방법을 배운다.'),
        ('chapter6', '제6장 RAG - 검색 증강 생성', '지식 증강 AI 시스템을 구축한다.'),
        ('chapter7', '제7장 AI 에이전트 핵심 로직', 'AI 에이전트의 기초를 이해한다.'),
    ],
    '제3편 실전편': [
        ('chapter8', '제8장 프롬프트 엔지니어링에서 에이전트 개발로', 'AI 앱 개발의 진화를 추적한다.'),
        ('chapter9', '제9장 LangChain 실전', '실전 LangChain 개발.'),
        ('chapter10', '제10장 LlamaIndex와 벡터 데이터베이스', '데이터 인덱싱과 검색을 마스터한다.'),
        ('chapter11', '제11장 에이전트 개발과 스킬 개발', '프로덕션 준비된 AI 에이전트를 구축한다.'),
        ('chapter12', '제12장 서비스 배포와 엔지니어링', 'AI 애플리케이션을 배포하고 확장한다.'),
    ],
    '제4편 고급편': [
        ('chapter13', '제13장 오픈소스 프로젝트 재현', '실제 프로젝트를 재현하여 경험을 쌓는다.'),
        ('chapter14', '제14장 비즈니스 사고 - 요구사항에서 구현까지', '기술과 비즈니스 사이의 격차를 해소한다.'),
        ('chapter15', '제15장 체계적 학습과 지식 구축', '장기적인 지식 기반을 구축한다.'),
    ],
    '제5편 커리어편': [
        ('chapter16', '제16장 이력서와 포트폴리오', '매력적인 개발자 프로필을 작성한다.'),
        ('chapter17', '제17장 면접 실전', 'AI 개발자 면접을 완벽하게 준비한다.'),
        ('chapter18', '제18장 출근 후 첫 30일', '새 직장에서 빠르게 자리매김한다.'),
        ('chapter19', '제19장 출근 후 6개월 - 적응에서 두각으로', '신입에서 가치 있는 팀원으로 성장한다.'),
        ('chapter20', '제20장 AI 앱 개발자의 미래', 'AI 앱 개발자의 미래 발전 추세를 전망한다.'),
    ],
}

def create_chapter_page(filepath, chapter_title, summary, lang='en'):
    lang_tips = {
        'en': ('Translation in Progress', 'This chapter is currently being translated. The full English version will be available soon.', 'For now, you can read the Chinese version:', '/zh/'),
        'ja': ('翻訳進行中', 'この章は現在翻訳中です。完全な日本語版はまもなく公開されます。', '今のところ、中国語版を読むことができます：', '/zh/'),
        'ko': ('번역 진행 중', '이 장은 현재 번역 중입니다. 완전한 한국어 버전은 곧 제공될 것입니다.', '지금은 중국어 버전을 읽을 수 있습니다:', '/zh/'),
    }
    status_text, notice, for_now, link_prefix = lang_tips[lang]
    
    content = f'''---
outline: [2, 3]
---

# {chapter_title}

## 요약

{summary}

## 🔄 {status_text}

{notice}

{for_now} [{chapter_title}](/zh/{link_prefix})

---

<style>
.translation-notice {{
  margin: 2rem 0;
  padding: 1.5rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-left: 4px solid #f59e0b;
  border-radius: 8px;
}}
</style>
'''
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    # Create English chapters
    os.makedirs('/tmp/jumpstart-ai/docs/en', exist_ok=True)
    for part, chapters in CHAPTERS_EN.items():
        for slug, title, summary in chapters:
            create_chapter_page(f'/tmp/jumpstart-ai/docs/en/{slug}.md', title, summary, 'en')
            print(f'✓ en/{slug}.md')
    
    # Create Japanese chapters
    os.makedirs('/tmp/jumpstart-ai/docs/ja', exist_ok=True)
    for part, chapters in CHAPTERS_JA.items():
        for slug, title, summary in chapters:
            create_chapter_page(f'/tmp/jumpstart-ai/docs/ja/{slug}.md', title, summary, 'ja')
            print(f'✓ ja/{slug}.md')
    
    # Create Korean chapters
    os.makedirs('/tmp/jumpstart-ai/docs/ko', exist_ok=True)
    for part, chapters in CHAPTERS_KO.items():
        for slug, title, summary in chapters:
            create_chapter_page(f'/tmp/jumpstart-ai/docs/ko/{slug}.md', title, summary, 'ko')
            print(f'✓ ko/{slug}.md')

if __name__ == '__main__':
    main()
