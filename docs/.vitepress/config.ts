import { defineConfig } from 'vitepress'

const ogImageUrl = 'https://raw.githubusercontent.com/jnlk-cn/jumpstart-ai/main/og-image.png'

// Sidebar definitions per language
function zhSidebar() {
  return {
    '/zh/part1-cognition': [
      {
        text: '第一篇 认知篇',
        items: [
          { text: '第1章 AI应用开发的真相', link: '/zh/part1-cognition/chapter1' },
          { text: '第2章 为什么先混进去是理性策略', link: '/zh/part1-cognition/chapter2' },
          { text: '第3章 你的入行路线图', link: '/zh/part1-cognition/chapter3' },
        ],
      },
    ],
    '/zh/part2-fundamentals': [
      {
        text: '第二篇 基础篇',
        items: [
          { text: '第4章 Python与工程基础', link: '/zh/part2-fundamentals/chapter4' },
          { text: '第5章 大模型调用与Prompt工程', link: '/zh/part2-fundamentals/chapter5' },
          { text: '第6章 RAG检索增强生成', link: '/zh/part2-fundamentals/chapter6' },
          { text: '第7章 AI Agent核心逻辑', link: '/zh/part2-fundamentals/chapter7' },
        ],
      },
    ],
    '/zh/part3-practice': [
      {
        text: '第三篇 实战篇',
        items: [
          { text: '第8章 从Prompt工程到Agent助理开发的演变', link: '/zh/part3-practice/chapter8' },
          { text: '第9章 LangChain实战', link: '/zh/part3-practice/chapter9' },
          { text: '第10章 LlamaIndex与向量数据库', link: '/zh/part3-practice/chapter10' },
          { text: '第11章 Agent助理开发实战与Skill开发', link: '/zh/part3-practice/chapter11' },
          { text: '第12章 服务部署与工程化', link: '/zh/part3-practice/chapter12' },
        ],
      },
    ],
    '/zh/part4-advanced': [
      {
        text: '第四篇 进阶篇',
        items: [
          { text: '第13章 复现开源项目攒排坑经验', link: '/zh/part4-advanced/chapter13' },
          { text: '第14章 业务思维从需求到落地', link: '/zh/part4-advanced/chapter14' },
          { text: '第15章 系统学习与知识体系搭建', link: '/zh/part4-advanced/chapter15' },
        ],
      },
    ],
    '/zh/part5-career': [
      {
        text: '第五篇 求职篇',
        items: [
          { text: '第16章 简历与作品集', link: '/zh/part5-career/chapter16' },
          { text: '第17章 面试实战', link: '/zh/part5-career/chapter17' },
          { text: '第18章 入职前30天快速站稳', link: '/zh/part5-career/chapter18' },
          { text: '第19章 入职后6个月从混进去到站得住', link: '/zh/part5-career/chapter19' },
          { text: '第20章 AI应用开发者的未来', link: '/zh/part5-career/chapter20' },
        ],
      },
    ],
    '/zh/appendix': [
      {
        text: '附录',
        items: [
          { text: '附录A AI应用开发工具速查表', link: '/zh/appendix/appendix-a' },
          { text: '附录B 常见报错与解决方案索引', link: '/zh/appendix/appendix-b' },
          { text: '附录C 推荐学习资源完整清单', link: '/zh/appendix/appendix-c' },
          { text: '附录D 8周入行计划日历', link: '/zh/appendix/appendix-d' },
          { text: '附录E 面试高频题50问', link: '/zh/appendix/appendix-e' },
        ],
      },
    ],
  }
}

function enSidebar() {
  return {
    '/en/part1-cognition': [
      {
        text: 'Part I: Cognition',
        items: [
          { text: 'Ch.1 The Truth About AI App Development', link: '/en/part1-cognition/chapter1' },
          { text: 'Ch.2 Why "Jump In First" Is Rational', link: '/en/part1-cognition/chapter2' },
          { text: 'Ch.3 Your Career Roadmap', link: '/en/part1-cognition/chapter3' },
        ],
      },
    ],
    '/en/part2-fundamentals': [
      {
        text: 'Part II: Fundamentals',
        items: [
          { text: 'Ch.4 Python & Engineering Basics', link: '/en/part2-fundamentals/chapter4' },
          { text: 'Ch.5 LLM APIs & Prompt Engineering', link: '/en/part2-fundamentals/chapter5' },
          { text: 'Ch.6 RAG - Retrieval Augmented Generation', link: '/en/part2-fundamentals/chapter6' },
          { text: 'Ch.7 AI Agent Core Logic', link: '/en/part2-fundamentals/chapter7' },
        ],
      },
    ],
    '/en/part3-practice': [
      {
        text: 'Part III: Practice',
        items: [
          { text: 'Ch.8 From Prompts to Agent Assistants', link: '/en/part3-practice/chapter8' },
          { text: 'Ch.9 LangChain in Action', link: '/en/part3-practice/chapter9' },
          { text: 'Ch.10 LlamaIndex & Vector Databases', link: '/en/part3-practice/chapter10' },
          { text: 'Ch.11 Agent & Skill Development', link: '/en/part3-practice/chapter11' },
          { text: 'Ch.12 Deployment & Engineering', link: '/en/part3-practice/chapter12' },
        ],
      },
    ],
    '/en/part4-advanced': [
      {
        text: 'Part IV: Advanced',
        items: [
          { text: 'Ch.13 Reproduce Open-Source Projects', link: '/en/part4-advanced/chapter13' },
          { text: 'Ch.14 Business Thinking', link: '/en/part4-advanced/chapter14' },
          { text: 'Ch.15 Systematic Learning', link: '/en/part4-advanced/chapter15' },
        ],
      },
    ],
    '/en/part5-career': [
      {
        text: 'Part V: Career',
        items: [
          { text: 'Ch.16 Resume & Portfolio', link: '/en/part5-career/chapter16' },
          { text: 'Ch.17 Interview Tactics', link: '/en/part5-career/chapter17' },
          { text: 'Ch.18 First 30 Days', link: '/en/part5-career/chapter18' },
          { text: 'Ch.19 From Surviving to Thriving', link: '/en/part5-career/chapter19' },
          { text: 'Ch.20 The Future of AI Developers', link: '/en/part5-career/chapter20' },
        ],
      },
    ],
    '/en/appendix': [
      {
        text: 'Appendix',
        items: [
          { text: 'A. AI Dev Tool Cheat Sheet', link: '/en/appendix/appendix-a' },
          { text: 'B. Common Errors & Solutions', link: '/en/appendix/appendix-b' },
          { text: 'C. Learning Resources', link: '/en/appendix/appendix-c' },
          { text: 'D. 8-Week Plan Calendar', link: '/en/appendix/appendix-d' },
          { text: 'E. Top 50 Interview Questions', link: '/en/appendix/appendix-e' },
        ],
      },
    ],
  }
}

function jaSidebar() {
  return {
    '/ja/part1-cognition': [
      {
        text: '第一篇 認知編',
        items: [
          { text: '第1章 AIアプリ開発の真実', link: '/ja/part1-cognition/chapter1' },
          { text: '第2章 なぜ「まず乗れ」が合理的か', link: '/ja/part1-cognition/chapter2' },
          { text: '第3章 キャリアロードマップ', link: '/ja/part1-cognition/chapter3' },
        ],
      },
    ],
    '/ja/part2-fundamentals': [
      {
        text: '第二篇 基礎編',
        items: [
          { text: '第4章 Pythonとエンジニアリング基礎', link: '/ja/part2-fundamentals/chapter4' },
          { text: '第5章 LLM APIとプロンプトエンジニアリング', link: '/ja/part2-fundamentals/chapter5' },
          { text: '第6章 RAG - 検索拡張生成', link: '/ja/part2-fundamentals/chapter6' },
          { text: '第7章 AIエージェントのコアロジック', link: '/ja/part2-fundamentals/chapter7' },
        ],
      },
    ],
    '/ja/part3-practice': [
      {
        text: '第三篇 実践編',
        items: [
          { text: '第8章 プロンプトからエージェントへの進化', link: '/ja/part3-practice/chapter8' },
          { text: '第9章 LangChain実践', link: '/ja/part3-practice/chapter9' },
          { text: '第10章 LlamaIndexとベクトルデータベース', link: '/ja/part3-practice/chapter10' },
          { text: '第11章 エージェント＆Skill開発', link: '/ja/part3-practice/chapter11' },
          { text: '第12章 デプロイとエンジニアリング', link: '/ja/part3-practice/chapter12' },
        ],
      },
    ],
    '/ja/part4-advanced': [
      {
        text: '第四篇 応用編',
        items: [
          { text: '第13章 オープンソースプロジェクトの再現', link: '/ja/part4-advanced/chapter13' },
          { text: '第14章 ビジネス思考', link: '/ja/part4-advanced/chapter14' },
          { text: '第15章 体系的な学習', link: '/ja/part4-advanced/chapter15' },
        ],
      },
    ],
    '/ja/part5-career': [
      {
        text: '第五篇 就職編',
        items: [
          { text: '第16章 履歴書とポートフォリオ', link: '/ja/part5-career/chapter16' },
          { text: '第17章 面接戦術', link: '/ja/part5-career/chapter17' },
          { text: '第18章 入社後30日間', link: '/ja/part5-career/chapter18' },
          { text: '第19章 生き残りから成長へ', link: '/ja/part5-career/chapter19' },
          { text: '第20章 AI開発者の未来', link: '/ja/part5-career/chapter20' },
        ],
      },
    ],
    '/ja/appendix': [
      {
        text: '付録',
        items: [
          { text: 'A. AI開発ツール早見表', link: '/ja/appendix/appendix-a' },
          { text: 'B. よくあるエラーと解決策', link: '/ja/appendix/appendix-b' },
          { text: 'C. 学習リソース', link: '/ja/appendix/appendix-c' },
          { text: 'D. 8週間プランカレンダー', link: '/ja/appendix/appendix-d' },
          { text: 'E. 面接頻出50問', link: '/ja/appendix/appendix-e' },
        ],
      },
    ],
  }
}

function koSidebar() {
  return {
    '/ko/part1-cognition': [
      {
        text: '제1편 인식편',
        items: [
          { text: '제1장 AI 앱 개발의 진실', link: '/ko/part1-cognition/chapter1' },
          { text: '제2장 왜 "먼저 타라"가 합리적인가', link: '/ko/part1-cognition/chapter2' },
          { text: '제3장 커리어 로드맵', link: '/ko/part1-cognition/chapter3' },
        ],
      },
    ],
    '/ko/part2-fundamentals': [
      {
        text: '제2편 기초편',
        items: [
          { text: '제4장 Python과 엔지니어링 기초', link: '/ko/part2-fundamentals/chapter4' },
          { text: '제5장 LLM API와 프롬프트 엔지니어링', link: '/ko/part2-fundamentals/chapter5' },
          { text: '제6장 RAG - 검색 증강 생성', link: '/ko/part2-fundamentals/chapter6' },
          { text: '제7장 AI 에이전트 핵심 로직', link: '/ko/part2-fundamentals/chapter7' },
        ],
      },
    ],
    '/ko/part3-practice': [
      {
        text: '제3편 실전편',
        items: [
          { text: '제8장 프롬프트에서 에이전트로의 진화', link: '/ko/part3-practice/chapter8' },
          { text: '제9장 LangChain 실전', link: '/ko/part3-practice/chapter9' },
          { text: '제10장 LlamaIndex와 벡터 데이터베이스', link: '/ko/part3-practice/chapter10' },
          { text: '제11장 에이전트 & Skill 개발', link: '/ko/part3-practice/chapter11' },
          { text: '제12장 배포와 엔지니어링', link: '/ko/part3-practice/chapter12' },
        ],
      },
    ],
    '/ko/part4-advanced': [
      {
        text: '제4편 심화편',
        items: [
          { text: '제13장 오픈소스 프로젝트 재현', link: '/ko/part4-advanced/chapter13' },
          { text: '제14장 비즈니스 사고', link: '/ko/part4-advanced/chapter14' },
          { text: '제15장 체계적 학습', link: '/ko/part4-advanced/chapter15' },
        ],
      },
    ],
    '/ko/part5-career': [
      {
        text: '제5편 취업편',
        items: [
          { text: '제16장 이력서와 포트폴리오', link: '/ko/part5-career/chapter16' },
          { text: '제17장 면접 전술', link: '/ko/part5-career/chapter17' },
          { text: '제18장 입사 후 30일', link: '/ko/part5-career/chapter18' },
          { text: '제19장 생존에서 성장으로', link: '/ko/part5-career/chapter19' },
          { text: '제20장 AI 개발자의 미래', link: '/ko/part5-career/chapter20' },
        ],
      },
    ],
    '/ko/appendix': [
      {
        text: '부록',
        items: [
          { text: 'A. AI 개발 도구 치트시트', link: '/ko/appendix/appendix-a' },
          { text: 'B. 자주 발생하는 에러와 해결책', link: '/ko/appendix/appendix-b' },
          { text: 'C. 학습 리소스', link: '/ko/appendix/appendix-c' },
          { text: 'D. 8주 계획 캘린더', link: '/ko/appendix/appendix-d' },
          { text: 'E. 면접 빈출 50문', link: '/ko/appendix/appendix-e' },
        ],
      },
    ],
  }
}

// Common nav per language
const zhNav = [
  { text: '首页', link: '/zh/' },
  { text: '认知篇', link: '/zh/part1-cognition/chapter1', activeMatch: '/zh/part1-cognition' },
  { text: '基础篇', link: '/zh/part2-fundamentals/chapter4', activeMatch: '/zh/part2-fundamentals' },
  { text: '实战篇', link: '/zh/part3-practice/chapter8', activeMatch: '/zh/part3-practice' },
  { text: '进阶篇', link: '/zh/part4-advanced/chapter13', activeMatch: '/zh/part4-advanced' },
  { text: '求职篇', link: '/zh/part5-career/chapter16', activeMatch: '/zh/part5-career' },
  { text: '附录', link: '/zh/appendix/appendix-a', activeMatch: '/zh/appendix' },
]

const enNav = [
  { text: 'Home', link: '/en/' },
  { text: 'Cognition', link: '/en/part1-cognition/chapter1', activeMatch: '/en/part1-cognition' },
  { text: 'Fundamentals', link: '/en/part2-fundamentals/chapter4', activeMatch: '/en/part2-fundamentals' },
  { text: 'Practice', link: '/en/part3-practice/chapter8', activeMatch: '/en/part3-practice' },
  { text: 'Advanced', link: '/en/part4-advanced/chapter13', activeMatch: '/en/part4-advanced' },
  { text: 'Career', link: '/en/part5-career/chapter16', activeMatch: '/en/part5-career' },
  { text: 'Appendix', link: '/en/appendix/appendix-a', activeMatch: '/en/appendix' },
]

const jaNav = [
  { text: 'ホーム', link: '/ja/' },
  { text: '認知編', link: '/ja/part1-cognition/chapter1', activeMatch: '/ja/part1-cognition' },
  { text: '基礎編', link: '/ja/part2-fundamentals/chapter4', activeMatch: '/ja/part2-fundamentals' },
  { text: '実践編', link: '/ja/part3-practice/chapter8', activeMatch: '/ja/part3-practice' },
  { text: '応用編', link: '/ja/part4-advanced/chapter13', activeMatch: '/ja/part4-advanced' },
  { text: '就職編', link: '/ja/part5-career/chapter16', activeMatch: '/ja/part5-career' },
  { text: '付録', link: '/ja/appendix/appendix-a', activeMatch: '/ja/appendix' },
]

const koNav = [
  { text: '홈', link: '/ko/' },
  { text: '인식편', link: '/ko/part1-cognition/chapter1', activeMatch: '/ko/part1-cognition' },
  { text: '기초편', link: '/ko/part2-fundamentals/chapter4', activeMatch: '/ko/part2-fundamentals' },
  { text: '실전편', link: '/ko/part3-practice/chapter8', activeMatch: '/ko/part3-practice' },
  { text: '심화편', link: '/ko/part4-advanced/chapter13', activeMatch: '/ko/part4-advanced' },
  { text: '취업편', link: '/ko/part5-career/chapter16', activeMatch: '/ko/part5-career' },
  { text: '부록', link: '/ko/appendix/appendix-a', activeMatch: '/ko/appendix' },
]

export default defineConfig({
  base: '/jumpstart-ai/',
  title: 'Jumpstart AI',
  description: 'Build First, Learn As You Go - AI应用开发入行实战',
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#6366f1' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:image', content: ogImageUrl }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: ogImageUrl }],
  ],
  ignoreDeadLinks: true,
  lastUpdated: true,

  locales: {
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      themeConfig: {
        siteTitle: 'AI应用开发入行实战',
        docFooter: { prev: '上一篇', next: '下一篇' },
        outline: { level: [2, 3], label: '目录' },
        lastUpdated: { text: '最后更新于' },
        nav: zhNav,
        sidebar: zhSidebar(),
        editLink: {
          pattern: 'https://github.com/jnlk-cn/jumpstart-ai/edit/main/docs/:path',
          text: '在 GitHub 上编辑此页',
        },
        footer: {
          message: '基于 MIT 许可证发布',
          copyright: 'Copyright © 2024-present jnlk-cn',
        },
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      themeConfig: {
        siteTitle: 'Jumpstart AI',
        docFooter: { prev: 'Previous', next: 'Next' },
        outline: { level: [2, 3], label: 'On This Page' },
        lastUpdated: { text: 'Last updated' },
        nav: enNav,
        sidebar: enSidebar(),
        editLink: {
          pattern: 'https://github.com/jnlk-cn/jumpstart-ai/edit/main/docs/:path',
          text: 'Edit this page on GitHub',
        },
        footer: {
          message: 'Released under the MIT License',
          copyright: 'Copyright © 2024-present jnlk-cn',
        },
      },
    },
    ja: {
      label: '日本語',
      lang: 'ja-JP',
      link: '/ja/',
      themeConfig: {
        siteTitle: 'AIアプリ開発実践',
        docFooter: { prev: '前へ', next: '次へ' },
        outline: { level: [2, 3], label: '目次' },
        lastUpdated: { text: '最終更新' },
        nav: jaNav,
        sidebar: jaSidebar(),
        editLink: {
          pattern: 'https://github.com/jnlk-cn/jumpstart-ai/edit/main/docs/:path',
          text: 'GitHubで編集',
        },
        footer: {
          message: 'MITライセンスで公開',
          copyright: 'Copyright © 2024-present jnlk-cn',
        },
      },
    },
    ko: {
      label: '한국어',
      lang: 'ko-KR',
      link: '/ko/',
      themeConfig: {
        siteTitle: 'AI 앱 개발 실전',
        docFooter: { prev: '이전', next: '다음' },
        outline: { level: [2, 3], label: '목차' },
        lastUpdated: { text: '마지막 업데이트' },
        nav: koNav,
        sidebar: koSidebar(),
        editLink: {
          pattern: 'https://github.com/jnlk-cn/jumpstart-ai/edit/main/docs/:path',
          text: 'GitHub에서 편집',
        },
        footer: {
          message: 'MIT 라이선스로 배포',
          copyright: 'Copyright © 2024-present jnlk-cn',
        },
      },
    },
  },

  themeConfig: {
    logo: '/logo.svg',
    search: {
      provider: 'local',
      options: {
        detailedView: true,
      },
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/jnlk-cn/jumpstart-ai' },
    ],
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: true,
  },
})
