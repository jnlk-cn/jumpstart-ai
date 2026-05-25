import os
import re

source_dir = "/app/data/所有对话/主对话/AI应用开发入行实战"
target_base = "/tmp/jumpstart-ai/docs/zh"

# 章节映射：源文件 -> 目标文件
chapters = [
    # 认知篇
    ("第一篇_认知篇/第1章_AI应用开发的真相.md", "part1-cognition/chapter1.md"),
    ("第一篇_认知篇/第2章_为什么先混进去是理性策略.md", "part1-cognition/chapter2.md"),
    ("第一篇_认知篇/第3章_你的入行路线图.md", "part1-cognition/chapter3.md"),
    # 基础篇
    ("第二篇_基础篇/第4章_Python与工程基础.md", "part2-fundamentals/chapter4.md"),
    ("第二篇_基础篇/第5章_大模型调用与Prompt工程.md", "part2-fundamentals/chapter5.md"),
    ("第二篇_基础篇/第6章_RAG检索增强生成.md", "part2-fundamentals/chapter6.md"),
    ("第二篇_基础篇/第7章_AI Agent核心逻辑.md", "part2-fundamentals/chapter7.md"),
    # 实战篇
    ("第三篇_实战篇/第8章_从Prompt工程到Agent助理开发的演变.md", "part3-practice/chapter8.md"),
    ("第三篇_实战篇/第9章_LangChain实战.md", "part3-practice/chapter9.md"),
    ("第三篇_实战篇/第10章_LlamaIndex与向量数据库.md", "part3-practice/chapter10.md"),
    ("第三篇_实战篇/第11章_Agent助理开发实战与Skill开发.md", "part3-practice/chapter11.md"),
    ("第三篇_实战篇/第12章_服务部署与工程化.md", "part3-practice/chapter12.md"),
    # 进阶篇
    ("第四篇_进阶篇/第13章_复现开源项目攒排坑经验.md", "part4-advanced/chapter13.md"),
    ("第四篇_进阶篇/第14章_业务思维从需求到落地.md", "part4-advanced/chapter14.md"),
    ("第四篇_进阶篇/第15章_系统学习与知识体系搭建.md", "part4-advanced/chapter15.md"),
    # 求职篇
    ("第五篇_求职篇/第16章_简历与作品集.md", "part5-career/chapter16.md"),
    ("第五篇_求职篇/第17章_面试实战.md", "part5-career/chapter17.md"),
    ("第五篇_求职篇/第18章_入职前30天快速站稳.md", "part5-career/chapter18.md"),
    ("第五篇_求职篇/第19章_入职后6个月从混进去到站得住.md", "part5-career/chapter19.md"),
    ("第五篇_求职篇/第20章_AI应用开发者的未来.md", "part5-career/chapter20.md"),
]

def convert_content(content, filename):
    """转换 markdown 内容"""
    lines = content.split('\n')
    result = []
    
    for line in lines:
        # 确保标题层级正确 (VitePress 要求)
        if line.startswith('#####'):
            line = '#####' + line[5:]
        elif line.startswith('####'):
            line = '#####' + line[4:]
        elif line.startswith('###'):
            line = '######' + line[3:]
        elif line.startswith('##'):
            line = '####' + line[2:]
        elif line.startswith('#'):
            line = '#####' + line[1:]
        result.append(line)
    
    return '\n'.join(result)

for src, dst in chapters:
    src_path = os.path.join(source_dir, src)
    dst_path = os.path.join(target_base, dst)
    
    if os.path.exists(src_path):
        with open(src_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 添加 frontmatter
        title_match = re.search(r'^# (.+)', content, re.MULTILINE)
        title = title_match.group(1) if title_match else os.path.basename(dst)
        
        frontmatter = f'''---
outline: deep
---

'''
        
        # 转换内容
        converted = convert_content(content, dst)
        
        # 写入文件
        os.makedirs(os.path.dirname(dst_path), exist_ok=True)
        with open(dst_path, 'w', encoding='utf-8') as f:
            f.write(frontmatter + converted)
        
        print(f"Converted: {src} -> {dst}")
    else:
        print(f"NOT FOUND: {src_path}")

print("\nDone!")
