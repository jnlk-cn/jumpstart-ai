import os
import re

# 书稿目录
SOURCE_DIR = '/app/data/所有对话/主对话/AI应用开发入行实战'
TARGET_DIR = '/tmp/jumpstart-ai/docs/zh'

# 章节映射
CHAPTERS = {
    '第一篇_认知篇': {
        'dir': 'part1-cognition',
        'chapters': [
            ('第1章_AI应用开发的真相.md', 'chapter1'),
            ('第2章_为什么先混进去是理性策略.md', 'chapter2'),
            ('第3章_你的入行路线图.md', 'chapter3'),
        ]
    },
    '第二篇_基础篇': {
        'dir': 'part2-fundamentals',
        'chapters': [
            ('第4章_Python与工程基础.md', 'chapter4'),
            ('第5章_大模型调用与Prompt工程.md', 'chapter5'),
            ('第6章_RAG检索增强生成.md', 'chapter6'),
            ('第7章_AI Agent核心逻辑.md', 'chapter7'),
        ]
    },
    '第三篇_实战篇': {
        'dir': 'part3-practice',
        'chapters': [
            ('第8章_从Prompt工程到Agent助理开发的演变.md', 'chapter8'),
            ('第9章_LangChain实战.md', 'chapter9'),
            ('第10章_LlamaIndex与向量数据库.md', 'chapter10'),
            ('第11章_Agent助理开发实战与Skill开发.md', 'chapter11'),
            ('第12章_服务部署与工程化.md', 'chapter12'),
        ]
    },
    '第四篇_进阶篇': {
        'dir': 'part4-advanced',
        'chapters': [
            ('第13章_复现开源项目攒排坑经验.md', 'chapter13'),
            ('第14章_业务思维从需求到落地.md', 'chapter14'),
            ('第15章_系统学习与知识体系搭建.md', 'chapter15'),
        ]
    },
    '第五篇_求职篇': {
        'dir': 'part5-career',
        'chapters': [
            ('第16章_简历与作品集.md', 'chapter16'),
            ('第17章_面试实战.md', 'chapter17'),
            ('第18章_入职前30天快速站稳.md', 'chapter18'),
            ('第19章_入职后6个月从混进去到站得住.md', 'chapter19'),
            ('第20章_AI应用开发者的未来.md', 'chapter20'),
        ]
    },
    '附录': {
        'dir': 'appendix',
        'chapters': [
            ('附录A_AI应用开发工具速查表.md', 'appendix-a'),
            ('附录B_常见报错与解决方案索引.md', 'appendix-b'),
            ('附录C_推荐学习资源完整清单.md', 'appendix-c'),
            ('附录D_8周入行计划日历.md', 'appendix-d'),
            ('附录E_面试高频题50问.md', 'appendix-e'),
        ]
    }
}

def convert_markdown(content):
    """转换markdown格式以适配VitePress"""
    # 保留原有内容，只需调整一些格式
    return content

def process_file(source_path, target_path):
    """处理单个文件"""
    try:
        with open(source_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 添加frontmatter
        filename = os.path.basename(target_path)
        frontmatter = f'''---
outline: [2, 3]
---

'''
        
        with open(target_path, 'w', encoding='utf-8') as f:
            f.write(frontmatter + content)
        
        print(f"✓ {target_path}")
        return True
    except Exception as e:
        print(f"✗ {source_path}: {e}")
        return False

def main():
    for part_name, part_info in CHAPTERS.items():
        source_part = os.path.join(SOURCE_DIR, part_name)
        target_part = os.path.join(TARGET_DIR, part_info['dir'])
        
        for chapter_file, target_name in part_info['chapters']:
            source_path = os.path.join(source_part, chapter_file)
            target_path = os.path.join(target_part, f"{target_name}.md")
            
            if os.path.exists(source_path):
                process_file(source_path, target_path)
            else:
                print(f"✗ 源文件不存在: {source_path}")

if __name__ == '__main__':
    main()
