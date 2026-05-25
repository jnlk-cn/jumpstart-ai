import{c as p,Q as l,j as t,m as a,g as s,n as i}from"./chunks/framework.DpF7k2f3.js";const c=JSON.parse('{"title":"第5章 大模型调用与Prompt工程（深度重写版）","description":"","frontmatter":{"outline":[2,3]},"headers":[],"relativePath":"zh/part2-fundamentals/chapter5.md","filePath":"zh/part2-fundamentals/chapter5.md"}'),h={name:"zh/part2-fundamentals/chapter5.md"};function e(k,n,r,E,d,g){return l(),t("div",null,[...n[0]||(n[0]=[a("",342),s("ul",null,[s("li",{"analysis.get(contract_type,":"","未知)":""},[s("strong",null,"合同类型"),i("：")]),s("li",null,[s("strong",null,"甲方"),i("：{analysis.get('parties',")]),s("li",null,[s("strong",null,"乙方"),i("：{analysis.get('parties',")]),s("li",null,[s("strong",null,"风险评分"),i("：{analysis.get('overall_score', 'N/A')}/10")])],-1),a("",18),s("p",{context:""},null,-1),a("",8),s("p",{diff:"",or:"",无:""},null,-1),s("p",null,"请重点审查：",-1),s("ol",null,[s("li",null,"变更是否引入了新问题"),s("li",null,"变更是否符合代码规范"),s("li",null,"变更是否有更好的实现方式")],-1),s("p",null,'返回JSON格式： """',-1),s("pre",null,[s("code",null,`    response = self.client.chat.completions.create(
        model="gpt-4.1-mini",
        messages=[
            {"role": "system", "content": self.SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        response_format={"type": "json_object"},
        temperature=0.0
    )
    
    return json.loads(response.choices[0].message.content)

def generate_review_comment(self, review_result: dict) -> str:
    """生成GitHub风格的Review评论"""
    
    comments = []
    
    # 按严重程度分组
    critical = [i for i in review_result.get("issues", []) if i["severity"] == "Critical"]
    high = [i for i in review_result.get("issues", []) if i["severity"] == "High"]
    medium = [i for i in review_result.get("issues", []) if i["severity"] == "Medium"]
    
    if critical:
        comments.append("## 🔴 必须修复（Critical）\\n")
        for issue in critical:
            comments.append(f"""
`)],-1),s("h3",{"issue[description]":"",id:"issue-category",tabindex:"-1"},[i("[{issue['category']}] "),s("a",{class:"header-anchor",href:"#issue-category","aria-label":`Permalink to "[{issue['category']}] {issue['description']}"`},"​")],-1),s("p",{"issue.get(location,":"","NA)":""},[s("strong",null,"位置"),i(":")],-1),a("",1),s("p",{"issue.get(suggestion,":"","NA)":""},[s("strong",null,"建议修改"),i(":")],-1),a("",3),s("h3",{"issue[description]":"",id:"issue-category-1",tabindex:"-1"},[i("[{issue['category']}] "),s("a",{class:"header-anchor",href:"#issue-category-1","aria-label":`Permalink to "[{issue['category']}] {issue['description']}"`},"​")],-1),s("p",null,[s("strong",null,"位置"),i(`: {issue.get('location', 'N/A')} {issue.get('suggestion', '')} """)`)],-1),s("pre",null,[s("code",null,`    if medium:
        comments.append("\\n## 🟡 可选优化（Medium）\\n")
        for issue in medium:
            comments.append(f"- [{issue['category']}] {issue['description']} - {issue.get('suggestion', '')}")
    
    # 总结
    comments.append(f"""
`)],-1),s("hr",null,null,-1),s("h2",{id:"📊-总体评价",tabindex:"-1"},[i("📊 总体评价 "),s("a",{class:"header-anchor",href:"#📊-总体评价","aria-label":'Permalink to "📊 总体评价"'},"​")],-1),s("p",{"review_result.get(summary,":"","暂无)":""},null,-1),s("ul",null,[s("li",{"review_result.get(language,":"","NA)":""},"语言:"),s("li",{"len(review_result.get(issues,":"","[]))":""},[i("问题数: "),s("ul",null,[s("li",{"len(critical)":""},[s("p",null,"Critical:")]),s("li",{"len(high)":""},[s("p",null,"High:")]),s("li",null,[s("p",null,'Medium: {len(medium)} """)'),s("pre",null,[s("code",null,`return '\\n'.join(comments)
`)])])])])],-1),a("",24)])])}const u=p(h,[["render",e]]);export{c as __pageData,u as default};
