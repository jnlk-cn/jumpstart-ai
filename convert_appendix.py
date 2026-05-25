import os
import re

source_dir = "/app/data/所有对话/主对话/AI应用开发入行实战/附录"
target_base = "/tmp/jumpstart-ai/docs/zh/appendix"

# 附录映射
appendices = [
    ("附录A_AI应用开发工具速查表.md", "appendix-a.md"),
    ("附录B_常见报错与解决方案索引.md", "appendix-b.md"),
    ("附录C_推荐学习资源完整清单.md", "appendix-c.md"),
    ("附录D_8周入行计划日历.md", "appendix-d.md"),
    ("附录E_面试高频题50问.md", "appendix-e.md"),
]

def convert_content(content):
    """转换 markdown 内容"""
    lines = content.split('\n')
    result = []
    
    for line in lines:
        # 确保标题层级正确
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

for src, dst in appendices:
    src_path = os.path.join(source_dir, src)
    dst_path = os.path.join(target_base, dst)
    
    if os.path.exists(src_path):
        with open(src_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        title_match = re.search(r'^# (.+)', content, re.MULTILINE)
        title = title_match.group(1) if title_match else os.path.basename(dst)
        
        frontmatter = f'''---
outline: deep
---

'''
        
        converted = convert_content(content)
        
        os.makedirs(os.path.dirname(dst_path), exist_ok=True)
        with open(dst_path, 'w', encoding='utf-8') as f:
            f.write(frontmatter + converted)
        
        print(f"Converted: {src} -> {dst}")
    else:
        print(f"NOT FOUND: {src_path}")

print("\nDone!")
