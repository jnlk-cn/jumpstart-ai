import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Jumpstart AI',
  description: 'Build First, Learn As You Go - AI应用开发入行实战',
  base: '/jumpstart-ai/',
  
  ignoreDeadLinks: true,
  
  locales: {
    zh: {
      label: '中文',
      lang: 'zh-CN',
      link: '/zh/',
      themeConfig: {
        nav: [
          { text: '首页', link: '/zh/' },
          { 
            text: '目录',
            items: [
              { text: '认知篇', link: '/zh/part1-cognition/' },
              { text: '基础篇', link: '/zh/part2-fundamentals/' },
              { text: '实战篇', link: '/zh/part3-practice/' },
              { text: '进阶篇', link: '/zh/part4-advanced/' },
              { text: '求职篇', link: '/zh/part5-career/' },
              { text: '附录', link: '/zh/appendix/' },
            ]
          },
        ],
        sidebar: {
          '/zh/part1-cognition/': [
            {
              text: '第一篇：认知篇',
              collapsed: false,
              items: [
                { text: '第1章 AI应用开发的真相', link: '/zh/part1-cognition/chapter1' },
                { text: '第2章 为什么"先混进去"是理性策略', link: '/zh/part1-cognition/chapter2' },
                { text: '第3章 你的入行路线图', link: '/zh/part1-cognition/chapter3' },
              ]
            }
          ],
          '/zh/part2-fundamentals/': [
            {
              text: '第二篇：基础篇',
              collapsed: false,
              items: [
                { text: '第4章 Python与工程基础', link: '/zh/part2-fundamentals/chapter4' },
                { text: '第5章 大模型调用与Prompt工程', link: '/zh/part2-fundamentals/chapter5' },
                { text: '第6章 RAG检索增强生成', link: '/zh/part2-fundamentals/chapter6' },
                { text: '第7章 AI Agent核心逻辑', link: '/zh/part2-fundamentals/chapter7' },
              ]
            }
          ],
          '/zh/part3-practice/': [
            {
              text: '第三篇：实战篇',
              collapsed: false,
              items: [
                { text: '第8章 从Prompt工程到Agent助理开发的演变', link: '/zh/part3-practice/chapter8' },
                { text: '第9章 LangChain实战', link: '/zh/part3-practice/chapter9' },
                { text: '第10章 LlamaIndex与向量数据库', link: '/zh/part3-practice/chapter10' },
                { text: '第11章 Agent助理开发实战与Skill开发', link: '/zh/part3-practice/chapter11' },
                { text: '第12章 服务部署与工程化', link: '/zh/part3-practice/chapter12' },
              ]
            }
          ],
          '/zh/part4-advanced/': [
            {
              text: '第四篇：进阶篇',
              collapsed: false,
              items: [
                { text: '第13章 复现开源项目攒排坑经验', link: '/zh/part4-advanced/chapter13' },
                { text: '第14章 业务思维从需求到落地', link: '/zh/part4-advanced/chapter14' },
                { text: '第15章 系统学习与知识体系搭建', link: '/zh/part4-advanced/chapter15' },
              ]
            }
          ],
          '/zh/part5-career/': [
            {
              text: '第五篇：求职篇',
              collapsed: false,
              items: [
                { text: '第16章 简历与作品集', link: '/zh/part5-career/chapter16' },
                { text: '第17章 面试实战', link: '/zh/part5-career/chapter17' },
                { text: '第18章 入职前30天快速站稳', link: '/zh/part5-career/chapter18' },
                { text: '第19章 入职后6个月从混进去到站得住', link: '/zh/part5-career/chapter19' },
                { text: '第20章 AI应用开发者的未来', link: '/zh/part5-career/chapter20' },
              ]
            }
          ],
          '/zh/appendix/': [
            {
              text: '附录',
              collapsed: false,
              items: [
                { text: '附录A AI应用开发工具速查表', link: '/zh/appendix/appendix-a' },
                { text: '附录B 常见报错与解决方案索引', link: '/zh/appendix/appendix-b' },
                { text: '附录C 推荐学习资源完整清单', link: '/zh/appendix/appendix-c' },
                { text: '附录D 8周入行计划日历', link: '/zh/appendix/appendix-d' },
                { text: '附录E 面试高频题50问', link: '/zh/appendix/appendix-e' },
              ]
            }
          ]
        },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/jnlk-cn/jumpstart-ai' }
        ],
        selectLanguageText: '语言',
        selectLanguageAriaLabel: '选择语言',
      }
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          {
            text: 'Contents',
            items: [
              { text: 'Cognition', link: '/en/part1-cognition/' },
              { text: 'Fundamentals', link: '/en/part2-fundamentals/' },
              { text: 'Practice', link: '/en/part3-practice/' },
              { text: 'Advanced', link: '/en/part4-advanced/' },
              { text: 'Career', link: '/en/part5-career/' },
              { text: 'Appendix', link: '/en/appendix/' },
            ]
          },
        ],
        sidebar: {
          '/en/part1-cognition/': [
            {
              text: 'Part I: Cognition',
              collapsed: false,
              items: [
                { text: 'Chapter 1 The Truth About AI Application Development', link: '/en/part1-cognition/chapter1' },
                { text: 'Chapter 2 Why "Getting In First" is a Rational Strategy', link: '/en/part1-cognition/chapter2' },
                { text: 'Chapter 3 Your Entry Roadmap', link: '/en/part1-cognition/chapter3' },
              ]
            }
          ],
          '/en/part2-fundamentals/': [
            {
              text: 'Part II: Fundamentals',
              collapsed: false,
              items: [
                { text: 'Chapter 4 Python & Engineering Basics', link: '/en/part2-fundamentals/chapter4' },
                { text: 'Chapter 5 LLM API & Prompt Engineering', link: '/en/part2-fundamentals/chapter5' },
                { text: 'Chapter 6 RAG - Retrieval Augmented Generation', link: '/en/part2-fundamentals/chapter6' },
                { text: 'Chapter 7 AI Agent Core Logic', link: '/en/part2-fundamentals/chapter7' },
              ]
            }
          ],
          '/en/part3-practice/': [
            {
              text: 'Part III: Practice',
              collapsed: false,
              items: [
                { text: 'Chapter 8 From Prompt Engineering to Agent Development', link: '/en/part3-practice/chapter8' },
                { text: 'Chapter 9 LangChain in Action', link: '/en/part3-practice/chapter9' },
                { text: 'Chapter 10 LlamaIndex & Vector Databases', link: '/en/part3-practice/chapter10' },
                { text: 'Chapter 11 Agent & Skill Development', link: '/en/part3-practice/chapter11' },
                { text: 'Chapter 12 Deployment & Engineering', link: '/en/part3-practice/chapter12' },
              ]
            }
          ],
          '/en/part4-advanced/': [
            {
              text: 'Part IV: Advanced',
              collapsed: false,
              items: [
                { text: 'Chapter 13 Reproducing Open Source Projects', link: '/en/part4-advanced/chapter13' },
                { text: 'Chapter 14 Business Thinking', link: '/en/part4-advanced/chapter14' },
                { text: 'Chapter 15 Systematic Learning', link: '/en/part4-advanced/chapter15' },
              ]
            }
          ],
          '/en/part5-career/': [
            {
              text: 'Part V: Career',
              collapsed: false,
              items: [
                { text: 'Chapter 16 Resume & Portfolio', link: '/en/part5-career/chapter16' },
                { text: 'Chapter 17 Interview Practice', link: '/en/part5-career/chapter17' },
                { text: 'Chapter 18 First 30 Days', link: '/en/part5-career/chapter18' },
                { text: 'Chapter 19 First 6 Months', link: '/en/part5-career/chapter19' },
                { text: 'Chapter 20 The Future of AI Developers', link: '/en/part5-career/chapter20' },
              ]
            }
          ],
          '/en/appendix/': [
            {
              text: 'Appendix',
              collapsed: false,
              items: [
                { text: 'Appendix A Tools Quick Reference', link: '/en/appendix/appendix-a' },
                { text: 'Appendix B Common Errors & Solutions', link: '/en/appendix/appendix-b' },
                { text: 'Appendix C Learning Resources', link: '/en/appendix/appendix-c' },
                { text: 'Appendix D 8-Week Plan Calendar', link: '/en/appendix/appendix-d' },
                { text: 'Appendix E Top 50 Interview Questions', link: '/en/appendix/appendix-e' },
              ]
            }
          ]
        },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/jnlk-cn/jumpstart-ai' }
        ],
        selectLanguageText: 'Language',
        selectLanguageAriaLabel: 'Select language',
      }
    },
    ja: {
      label: '日本語',
      lang: 'ja-JP',
      link: '/ja/',
      themeConfig: {
        nav: [
          { text: 'ホーム', link: '/ja/' },
          {
            text: '目次',
            items: [
              { text: '認知篇', link: '/ja/part1-cognition/' },
              { text: '基礎篇', link: '/ja/part2-fundamentals/' },
              { text: '実践篇', link: '/ja/part3-practice/' },
              { text: '上級篇', link: '/ja/part4-advanced/' },
              { text: '就活篇', link: '/ja/part5-career/' },
              { text: '付録', link: '/ja/appendix/' },
            ]
          },
        ],
        sidebar: {
          '/ja/part1-cognition/': [
            {
              text: '第1篇：認知篇',
              collapsed: false,
              items: [
                { text: '第1章 AIアプリ開発の真実', link: '/ja/part1-cognition/chapter1' },
                { text: '第2章 なぜ「まず乗れ」が合理的な戦略か', link: '/ja/part1-cognition/chapter2' },
                { text: '第3章 あなたの_entryロードマップ', link: '/ja/part1-cognition/chapter3' },
              ]
            }
          ],
          '/ja/part2-fundamentals/': [
            {
              text: '第2篇：基礎篇',
              collapsed: false,
              items: [
                { text: '第4章 Pythonとエンジニアリング基礎', link: '/ja/part2-fundamentals/chapter4' },
                { text: '第5章 LLM呼び出しとプロンプトエンジニアリング', link: '/ja/part2-fundamentals/chapter5' },
                { text: '第6章 RAG検索拡張生成', link: '/ja/part2-fundamentals/chapter6' },
                { text: '第7章 AIエージェントコアロジック', link: '/ja/part2-fundamentals/chapter7' },
              ]
            }
          ],
          '/ja/part3-practice/': [
            {
              text: '第3篇：実践篇',
              collapsed: false,
              items: [
                { text: '第8章 プロンプトエンジニアリングからエージェント開発へ', link: '/ja/part3-practice/chapter8' },
                { text: '第9章 LangChain実践', link: '/ja/part3-practice/chapter9' },
                { text: '第10章 LlamaIndexとベクトルデータベース', link: '/ja/part3-practice/chapter10' },
                { text: '第11章 エージェント開発実践とSkill開発', link: '/ja/part3-practice/chapter11' },
                { text: '第12章 サービスデプロイとエンジニアリング', link: '/ja/part3-practice/chapter12' },
              ]
            }
          ],
          '/ja/part4-advanced/': [
            {
              text: '第4篇：上級篇',
              collapsed: false,
              items: [
                { text: '第13章 オープンソースプロジェクトの再現', link: '/ja/part4-advanced/chapter13' },
                { text: '第14章 ビジネス思维', link: '/ja/part4-advanced/chapter14' },
                { text: '第15章 システム学習と知識体系建设', link: '/ja/part4-advanced/chapter15' },
              ]
            }
          ],
          '/ja/part5-career/': [
            {
              text: '第5篇：就活篇',
              collapsed: false,
              items: [
                { text: '第16章 履歴書とポートフォリオ', link: '/ja/part5-career/chapter16' },
                { text: '第17章 面接実践', link: '/ja/part5-career/chapter17' },
                { text: '第18章 入社前30日間', link: '/ja/part5-career/chapter18' },
                { text: '第19章 入社後6ヶ月', link: '/ja/part5-career/chapter19' },
                { text: '第20章 AI開発者の未来', link: '/ja/part5-career/chapter20' },
              ]
            }
          ],
          '/ja/appendix/': [
            {
              text: '付録',
              collapsed: false,
              items: [
                { text: '付録A ツール早見表', link: '/ja/appendix/appendix-a' },
                { text: '付録B よくあるエラーと解決方法', link: '/ja/appendix/appendix-b' },
                { text: '付録C おすすめ学習リソース', link: '/ja/appendix/appendix-c' },
                { text: '付録D 8週間入職計画カレンダー', link: '/ja/appendix/appendix-d' },
                { text: '付録E 面接高频問題50問', link: '/ja/appendix/appendix-e' },
              ]
            }
          ]
        },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/jnlk-cn/jumpstart-ai' }
        ],
        selectLanguageText: '言語',
        selectLanguageAriaLabel: '言語を選択',
      }
    },
    ko: {
      label: '한국어',
      lang: 'ko-KR',
      link: '/ko/',
      themeConfig: {
        nav: [
          { text: '홈', link: '/ko/' },
          {
            text: '목차',
            items: [
              { text: '인지篇', link: '/ko/part1-cognition/' },
              { text: '기초篇', link: '/ko/part2-fundamentals/' },
              { text: '실전篇', link: '/ko/part3-practice/' },
              { text: '고급篇', link: '/ko/part4-advanced/' },
              { text: '취업篇', link: '/ko/part5-career/' },
              { text: '부록', link: '/ko/appendix/' },
            ]
          },
        ],
        sidebar: {
          '/ko/part1-cognition/': [
            {
              text: '제1편：인지篇',
              collapsed: false,
              items: [
                { text: '제1장 AI 앱 개발의 진실', link: '/ko/part1-cognition/chapter1' },
                { text: '제2장 왜 "먼저 들어가"가 합리적인 전략인가', link: '/ko/part1-cognition/chapter2' },
                { text: '제3장 당신의 입문 로드맵', link: '/ko/part1-cognition/chapter3' },
              ]
            }
          ],
          '/ko/part2-fundamentals/': [
            {
              text: '제2편：기초篇',
              collapsed: false,
              items: [
                { text: '제4장 Python과 엔지니어링 기초', link: '/ko/part2-fundamentals/chapter4' },
                { text: '제5장 LLM 호출과 프롬프트 엔지니어링', link: '/ko/part2-fundamentals/chapter5' },
                { text: '제6장 RAG 검색 증강 생성', link: '/ko/part2-fundamentals/chapter6' },
                { text: '제7장 AI 에이전트 핵심 로직', link: '/ko/part2-fundamentals/chapter7' },
              ]
            }
          ],
          '/ko/part3-practice/': [
            {
              text: '제3편：실전篇',
              collapsed: false,
              items: [
                { text: '제8장 프롬프트 엔지니어링에서 에이전트 개발로', link: '/ko/part3-practice/chapter8' },
                { text: '제9장 LangChain 실전', link: '/ko/part3-practice/chapter9' },
                { text: '제10장 LlamaIndex와 벡터 데이터베이스', link: '/ko/part3-practice/chapter10' },
                { text: '제11장 에이전트 개발 실전과 Skill 개발', link: '/ko/part3-practice/chapter11' },
                { text: '제12장 서비스 배포와 엔지니어링', link: '/ko/part3-practice/chapter12' },
              ]
            }
          ],
          '/ko/part4-advanced/': [
            {
              text: '제4편：고급篇',
              collapsed: false,
              items: [
                { text: '제13장 오픈소스 프로젝트 재현', link: '/ko/part4-advanced/chapter13' },
                { text: '제14장 비즈니스 사고', link: '/ko/part4-advanced/chapter14' },
                { text: '제15장 체계적 학습과 지식 체계 구축', link: '/ko/part4-advanced/chapter15' },
              ]
            }
          ],
          '/ko/part5-career/': [
            {
              text: '제5편：취업篇',
              collapsed: false,
              items: [
                { text: '제16장 이력서와 포트폴리오', link: '/ko/part5-career/chapter16' },
                { text: '제17장 면접 실전', link: '/ko/part5-career/chapter17' },
                { text: '제18장 入职前 30일', link: '/ko/part5-career/chapter18' },
                { text: '제19장 入职後 6개월', link: '/ko/part5-career/chapter19' },
                { text: '제20장 AI 개발자의 미래', link: '/ko/part5-career/chapter20' },
              ]
            }
          ],
          '/ko/appendix/': [
            {
              text: '부록',
              collapsed: false,
              items: [
                { text: '부록A 도구 빠른 참조', link: '/ko/appendix/appendix-a' },
                { text: '부록B 흔한 오류와 해결책', link: '/ko/appendix/appendix-b' },
                { text: '부록C 추천 학습 자원', link: '/ko/appendix/appendix-c' },
                { text: '부록D 8주 입문 계획 달력', link: '/ko/appendix/appendix-d' },
                { text: '부록E 면접 자주 묻는 질문 50선', link: '/ko/appendix/appendix-e' },
              ]
            }
          ]
        },
        socialLinks: [
          { icon: 'github', link: 'https://github.com/jnlk-cn/jumpstart-ai' }
        ],
        selectLanguageText: '언어',
        selectLanguageAriaLabel: '언어 선택',
      }
    }
  },

  themeConfig: {
    search: {
      provider: 'local',
      options: {
        detailedView: true
      }
    },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 jnlk-cn'
    },
    appearance: 'auto'
  }
})
