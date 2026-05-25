import { defineConfig } from 'vitepress'

const ogImageUrl = 'https://raw.githubusercontent.com/jnlk-cn/jumpstart-ai/main/og-image.png'

export default defineConfig({
  base: '/jumpstart-ai/',
  title: 'AI应用开发入行实战',
  description: '先上车后补票 - Jumpstart AI: Build First, Learn As You Go',
  head: [
    ['link', { rel: 'icon', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#6366f1' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:image', content: ogImageUrl }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:image', content: ogImageUrl }],
  ],
  ignoreDeadLinks: true,
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
    },
    ja: {
      label: '日本語',
      lang: 'ja-JP',
      link: '/ja/',
    },
    ko: {
      label: '한국어',
      lang: 'ko-KR',
      link: '/ko/',
    },
  },
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'AI应用开发入行实战',
    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },
    outline: {
      level: [2, 3],
      label: '目录',
    },
    search: {
      provider: 'local',
      options: {
        detailedView: true,
      },
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/jnlk-cn/jumpstart-ai' },
    ],
    footer: {
      message: '基于 MIT 许可证发布',
      copyright: 'Copyright © 2024-present jnlk-cn',
    },
    nav: [
      { text: '首页', link: '/zh/' },
      {
        text: '认知篇',
        link: '/zh/part1-cognition/',
        activeMatch: '/zh/part1-cognition',
      },
      {
        text: '基础篇',
        link: '/zh/part2-fundamentals/',
        activeMatch: '/zh/part2-fundamentals',
      },
      {
        text: '实战篇',
        link: '/zh/part3-practice/',
        activeMatch: '/zh/part3-practice',
      },
      {
        text: '进阶篇',
        link: '/zh/part4-advanced/',
        activeMatch: '/zh/part4-advanced',
      },
      {
        text: '求职篇',
        link: '/zh/part5-career/',
        activeMatch: '/zh/part5-career',
      },
      {
        text: '附录',
        link: '/zh/appendix/',
        activeMatch: '/zh/appendix',
      },
    ],
    sidebar: {
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
    },
  },
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: true,
  },
})
