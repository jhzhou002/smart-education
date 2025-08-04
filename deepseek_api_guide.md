# DeepSeek API 调用方式完整指南
## 用于审核Kimi生成的数学题目内容

## 1. 前期准备

### 1.1 注册账号并获取API Key
1. 访问 [DeepSeek开放平台](https://platform.deepseek.com)
2. 注册并登录账号
3. 新用户将获得500M Tokens的免费额度
4. 进入"API Keys"菜单，点击"Create API Key"（key：sk-17269fe512b74407b22f5c926a216bf1）
5. 输入API Key名称，复制生成的密钥并安全保存
6. **重要**：API Key只显示一次，丢失需重新生成

### 1.2 可用模型对比
- `deepseek-chat` - 对应DeepSeek-V3模型，适合常规对话和内容生成
- `deepseek-reasoner` - 对应DeepSeek-R1模型，具备深度推理能力，特别适合审核复杂的数学题目

### 1.3 最新定价（2025年2月后）
DeepSeek-V3 API价格已调整：
- **输入tokens**：2元/百万tokens（缓存未命中）；0.5元/百万tokens（缓存命中）
- **输出tokens**：8元/百万tokens
- DeepSeek-R1：约0.55美元/百万输入tokens，2.19美元/百万输出tokens

## 2. 基本调用方式

### 2.1 使用 cURL 调用

```bash
# 基础对话调用
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "deepseek-chat",
    "messages": [
      {"role": "system", "content": "你是一个专业的数学教师，擅长审核数学题目的准确性。"},
      {"role": "user", "content": "请审核这道数学题目的解答是否正确：[题目内容]"}
    ],
    "stream": false
  }'

# 使用推理模型进行深度审核
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "deepseek-reasoner",
    "messages": [
      {"role": "system", "content": "你是数学题目审核专家，需要仔细分析题目的逻辑性和解答的正确性。"},
      {"role": "user", "content": "请深度分析这道数学题目：[题目内容]"}
    ],
    "stream": false
  }'
```

### 2.2 使用 Python (OpenAI SDK)

#### 安装依赖
```bash
pip install openai
```

#### 基础审核功能
```python
import openai
import os

# 配置客户端
client = openai.Client(
    api_key="YOUR_API_KEY",
    base_url="https://api.deepseek.com"
)

def audit_math_problem(problem_content, solution_content):
    """
    审核数学题目和解答的准确性
    """
    audit_prompt = f"""
作为专业的数学教师，请仔细审核以下数学题目和解答：

题目：{problem_content}

解答：{solution_content}

请从以下维度进行审核：
1. 题目描述是否清晰完整
2. 解题步骤是否正确
3. 计算过程是否有误
4. 最终答案是否正确
5. 解题方法是否合理

请给出详细的审核结果，包括发现的问题和改进建议。
"""
    
    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {"role": "system", "content": "你是一个严谨的数学教师，专门负责审核数学题目的准确性。"},
            {"role": "user", "content": audit_prompt}
        ],
        temperature=0.1,  # 低温度确保审核结果稳定
        max_tokens=2000
    )
    
    return response.choices[0].message.content

# 使用示例
problem = "求函数f(x) = x² + 2x + 1的最小值"
solution = "配方得f(x) = (x+1)² ，所以最小值为0，在x=-1时取得。"

audit_result = audit_math_problem(problem, solution)
print("审核结果：")
print(audit_result)
```

#### 使用深度推理模型
```python
def deep_audit_with_reasoning(problem_content, solution_content):
    """
    使用DeepSeek-R1进行深度推理审核
    """
    response = client.chat.completions.create(
        model="deepseek-reasoner",
        messages=[
            {"role": "system", "content": "你是数学审核专家，需要进行深度思考和推理来验证数学题目的正确性。"},
            {"role": "user", "content": f"""
请深度分析以下数学题目和解答的正确性：

题目：{problem_content}
解答：{solution_content}

请进行逐步推理，验证每个步骤的正确性。
"""}
        ],
        temperature=0.1
    )
    
    # DeepSeek-R1会返回推理过程
    reasoning_content = response.choices[0].message.reasoning_content if hasattr(response.choices[0].message, 'reasoning_content') else ""
    final_content = response.choices[0].message.content
    
    return {
        "reasoning_process": reasoning_content,
        "final_result": final_content
    }
```

## 3. 构建Kimi+DeepSeek双模型审核系统

### 3.1 集成两个API的完整方案

```python
import openai
import time
import json
from typing import Dict, List

class MathProblemGenerator:
    def __init__(self, kimi_api_key: str, deepseek_api_key: str):
        # Kimi客户端
        self.kimi_client = openai.Client(
            api_key=kimi_api_key,
            base_url="https://api.moonshot.cn/v1"
        )
        
        # DeepSeek客户端
        self.deepseek_client = openai.Client(
            api_key=deepseek_api_key,
            base_url="https://api.deepseek.com"
        )
    
    def generate_math_problem(self, topic: str = "函数", difficulty: str = "中等") -> str:
        """使用Kimi生成数学题目"""
        prompt = f"""
请生成一道高中数学{topic}题目，难度为{difficulty}。

要求：
1. 题目描述清晰、完整
2. 包含详细的解题步骤
3. 提供最终答案

格式：
【题目】
【解答】
【答案】
"""
        
        response = self.kimi_client.chat.completions.create(
            model="moonshot-v1-8k",
            messages=[
                {"role": "system", "content": "你是经验丰富的高中数学老师。"},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        
        return response.choices[0].message.content
    
    def audit_with_deepseek(self, problem_content: str, use_reasoning: bool = True) -> Dict:
        """使用DeepSeek审核题目"""
        model = "deepseek-reasoner" if use_reasoning else "deepseek-chat"
        
        audit_prompt = f"""
请仔细审核以下数学题目：

{problem_content}

审核要求：
1. 检查题目描述是否清晰无歧义
2. 验证解题步骤的逻辑性和正确性
3. 检查计算过程是否准确
4. 确认最终答案是否正确
5. 评估解题方法是否合理

请给出：
- 发现的问题（如有）
- 正确的解答（如原解答有误）
- 改进建议
- 整体评价（优秀/良好/需改进）
"""
        
        response = self.deepseek_client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "你是严谨的数学审核专家，负责确保数学题目的准确性。"},
                {"role": "user", "content": audit_prompt}
            ],
            temperature=0.1
        )
        
        result = {
            "audit_result": response.choices[0].message.content,
            "model_used": model
        }
        
        # 如果使用推理模型，也返回推理过程
        if use_reasoning and hasattr(response.choices[0].message, 'reasoning_content'):
            result["reasoning_process"] = response.choices[0].message.reasoning_content
        
        return result
    
    def generate_and_audit_problem(self, topic: str = "函数", difficulty: str = "中等", 
                                 max_retries: int = 3) -> Dict:
        """生成题目并审核，如有问题则重新生成"""
        
        for attempt in range(max_retries):
            print(f"第 {attempt + 1} 次尝试生成题目...")
            
            # 1. 使用Kimi生成题目
            problem = self.generate_math_problem(topic, difficulty)
            
            # 2. 使用DeepSeek审核
            audit_result = self.audit_with_deepseek(problem, use_reasoning=True)
            
            # 3. 判断是否需要重新生成
            audit_text = audit_result["audit_result"].lower()
            
            # 简单的质量判断（可以根据实际情况调整）
            if any(keyword in audit_text for keyword in ["优秀", "正确", "无误", "良好"]):
                return {
                    "final_problem": problem,
                    "audit_result": audit_result,
                    "attempts": attempt + 1,
                    "status": "success"
                }
            
            print(f"发现问题，准备重新生成...")
            time.sleep(1)  # 避免频繁调用
        
        return {
            "final_problem": problem,
            "audit_result": audit_result,
            "attempts": max_retries,
            "status": "needs_manual_review"
        }

# 使用示例
def main():
    # 初始化（请替换为实际的API Key）
    generator = MathProblemGenerator(
        kimi_api_key="YOUR_KIMI_API_KEY",
        deepseek_api_key="YOUR_DEEPSEEK_API_KEY"
    )
    
    # 生成并审核题目
    result = generator.generate_and_audit_problem(
        topic="二次函数",
        difficulty="中等"
    )
    
    print("=" * 50)
    print("最终题目：")
    print(result["final_problem"])
    print("\n" + "=" * 50)
    print("审核结果：")
    print(result["audit_result"]["audit_result"])
    print(f"\n状态：{result['status']}")
    print(f"尝试次数：{result['attempts']}")

if __name__ == "__main__":
    main()
```

### 3.2 批量生成与审核

```python
def batch_generate_problems(generator, topics: List[str], count_per_topic: int = 3):
    """批量生成不同类型的数学题目"""
    all_problems = []
    
    for topic in topics:
        print(f"\n正在生成 {topic} 类型题目...")
        
        for i in range(count_per_topic):
            result = generator.generate_and_audit_problem(topic=topic)
            
            problem_data = {
                "id": len(all_problems) + 1,
                "topic": topic,
                "problem": result["final_problem"],
                "audit": result["audit_result"]["audit_result"],
                "status": result["status"],
                "attempts": result["attempts"]
            }
            
            all_problems.append(problem_data)
            print(f"  - 题目 {i+1} 完成 (状态: {result['status']})")
    
    return all_problems

# 批量生成示例
topics = ["函数", "几何", "概率", "数列", "三角函数"]
problems = batch_generate_problems(generator, topics, count_per_topic=2)

# 保存结果
with open("generated_problems.json", "w", encoding="utf-8") as f:
    json.dump(problems, f, ensure_ascii=False, indent=2)
```

## 4. 错误处理和最佳实践

### 4.1 API调用错误处理

```python
import openai
import time
from typing import Optional

def safe_deepseek_call(client, messages, model="deepseek-chat", max_retries=3) -> Optional[str]:
    """安全的DeepSeek API调用"""
    
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model=model,
                messages=messages,
                timeout=30
            )
            return response.choices[0].message.content
        
        except openai.RateLimitError:
            print(f"请求频率限制，等待重试... (尝试 {attempt + 1}/{max_retries})")
            time.sleep(2 ** attempt)  # 指数退避
        
        except openai.APIError as e:
            print(f"API错误: {e}")
            if attempt == max_retries - 1:
                return None
        
        except Exception as e:
            print(f"未知错误: {e}")
            if attempt == max_retries - 1:
                return None
    
    return None
```

### 4.2 成本估算

```python
def estimate_cost(input_text: str, output_text: str, model="deepseek-chat"):
    """估算API调用成本"""
    # 粗略估算（中文按字符计算）
    input_tokens = len(input_text) * 1.5
    output_tokens = len(output_text) * 1.5
    
    # DeepSeek-V3最新价格（人民币）
    input_cost = (input_tokens / 1000000) * 2  # 2元/百万输入tokens
    output_cost = (output_tokens / 1000000) * 8  # 8元/百万输出tokens
    
    total_cost = input_cost + output_cost
    
    return {
        "input_tokens": int(input_tokens),
        "output_tokens": int(output_tokens),
        "input_cost": input_cost,
        "output_cost": output_cost,
        "total_cost": total_cost
    }
```

## 5. 环境配置

### 5.1 环境变量设置

```bash
# .env 文件
KIMI_API_KEY=your_kimi_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

```python
import os
from dotenv import load_dotenv

load_dotenv()

# 安全地获取API密钥
kimi_key = os.getenv("KIMI_API_KEY")
deepseek_key = os.getenv("DEEPSEEK_API_KEY")

if not kimi_key or not deepseek_key:
    raise ValueError("请设置API密钥环境变量")
```

## 6. 使用建议

### 6.1 模型选择策略
- **内容生成**：使用Kimi（moonshot-v1-8k/32k），擅长中文内容生成
- **内容审核**：使用DeepSeek-V3（deepseek-chat），性价比高
- **复杂推理**：使用DeepSeek-R1（deepseek-reasoner），推理能力强

### 6.2 成本优化
1. DeepSeek-V3仍然是最便宜的高性能大模型之一
2. 合理控制输出长度，输出tokens费用更高
3. 利用缓存机制降低输入成本
4. 批量处理时注意频率限制

### 6.3 质量保证
1. 使用低温度（0.1-0.3）进行审核，确保结果稳定
2. 设置多轮审核机制
3. 人工抽查审核结果的准确性
4. 建立题目质量评分体系

通过这种Kimi生成+DeepSeek审核的双模型方案，你可以大大提高生成数学题目的质量和准确性！