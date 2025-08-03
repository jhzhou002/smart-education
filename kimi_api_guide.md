# Kimi API 调用方式完整指南

## 1. 前期准备

### 1.1 注册账号并获取API Key
1. 访问 [Moonshot AI 开放平台](https://platform.moonshot.cn)
2. 使用已有的Kimi智能助手账号登录
3. 在"账户总览"查看免费额度（通常赠送15元体验额度）
4. 进入"API Key 管理"页面
5. 点击"新建"创建API Key（KIMI_API_KEY=sk-5WRXcCdiP1HoPDRwpcKnF0Zi5b9th6q12mF50KqBDJrUc62y）
6. **重要**：立即复制保存API Key，因为只会显示一次

### 1.2 可用模型
- `moonshot-v1-8k` - 适用于短文本生成（0.012元/千tokens）
- `moonshot-v1-32k` - 适用于中等长度文本（0.024元/千tokens）  
- `moonshot-v1-128k` - 适用于长文本处理（0.06元/千tokens）

## 2. 基本调用方式

### 2.1 使用 cURL 调用

```bash
curl -X POST "https://api.moonshot.cn/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "moonshot-v1-8k",
    "messages": [
      {"role": "system", "content": "你是 Kimi，由 Moonshot AI 提供的人工智能助手。"},
      {"role": "user", "content": "请帮我生成一道高中数学题目"}
    ],
    "temperature": 0.3
  }'
```

### 2.2 使用 Python (OpenAI SDK)

#### 安装依赖
```bash
pip install openai
```

#### 代码示例
```python
import openai

# 配置客户端
client = openai.Client(
    base_url="https://api.moonshot.cn/v1",
    api_key="YOUR_API_KEY"
)

# 生成高中数学题目
def generate_math_problem():
    response = client.chat.completions.create(
        model="moonshot-v1-8k",
        messages=[
            {"role": "system", "content": "你是一个专业的高中数学老师，擅长出题。"},
            {"role": "user", "content": "请生成一道高中数学函数题，包含题目、解答步骤和答案。"}
        ],
        temperature=0.7,
        max_tokens=1000
    )
    return response.choices[0].message.content

# 调用函数
math_problem = generate_math_problem()
print(math_problem)
```

### 2.3 流式输出示例

```python
import openai

client = openai.Client(
    base_url="https://api.moonshot.cn/v1",
    api_key="YOUR_API_KEY"
)

def generate_streaming_response():
    response = client.chat.completions.create(
        model="moonshot-v1-8k",
        messages=[
            {"role": "user", "content": "请生成一道高中数学题目"}
        ],
        stream=True
    )
    
    for chunk in response:
        if chunk.choices[0].delta.content is not None:
            print(chunk.choices[0].delta.content, end="")

generate_streaming_response()
```

### 2.4 使用 JavaScript/Node.js

```javascript
const OpenAI = require('openai');

const client = new OpenAI({
    baseURL: 'https://api.moonshot.cn/v1',
    apiKey: 'YOUR_API_KEY'
});

async function generateMathProblem() {
    try {
        const response = await client.chat.completions.create({
            model: 'moonshot-v1-8k',
            messages: [
                {role: 'system', content: '你是一个专业的高中数学老师。'},
                {role: 'user', content: '请生成一道高中数学题目，包含详细解答。'}
            ],
            temperature: 0.7
        });
        
        console.log(response.choices[0].message.content);
    } catch (error) {
        console.error('API调用失败:', error);
    }
}

generateMathProblem();
```

## 3. 针对高中数学题目生成的优化

### 3.1 结构化提示词

```python
def generate_structured_math_problem(topic="函数", difficulty="中等"):
    prompt = f"""
请生成一道高中数学{topic}题目，难度为{difficulty}。

要求：
1. 题目描述清晰、完整
2. 包含详细的解题步骤
3. 提供最终答案
4. 如果涉及图形，请描述图形特征

格式要求：
【题目】
【解答】
【答案】
"""
    
    response = client.chat.completions.create(
        model="moonshot-v1-8k",
        messages=[
            {"role": "system", "content": "你是经验丰富的高中数学老师，擅长出题和讲解。"},
            {"role": "user", "content": prompt}
        ],
        temperature=0.6
    )
    return response.choices[0].message.content
```

### 3.2 批量生成题目

```python
def generate_multiple_problems(count=5, topics=["函数", "几何", "概率"]):
    problems = []
    
    for i in range(count):
        topic = topics[i % len(topics)]
        problem = generate_structured_math_problem(topic)
        problems.append({
            'id': i + 1,
            'topic': topic,
            'content': problem
        })
    
    return problems

# 生成5道不同类型的题目
math_problems = generate_multiple_problems()
for problem in math_problems:
    print(f"题目 {problem['id']} ({problem['topic']}):")
    print(problem['content'])
    print("-" * 50)
```

## 4. 错误处理和最佳实践

### 4.1 错误处理

```python
import openai
import time

def safe_api_call(messages, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = client.chat.completions.create(
                model="moonshot-v1-8k",
                messages=messages,
                timeout=30  # 设置超时时间
            )
            return response.choices[0].message.content
        
        except openai.RateLimitError:
            print(f"请求频率过高，等待重试... (尝试 {attempt + 1}/{max_retries})")
            time.sleep(2 ** attempt)  # 指数退避
        
        except openai.APIError as e:
            print(f"API错误: {e}")
            return None
        
        except Exception as e:
            print(f"未知错误: {e}")
            return None
    
    return None
```

### 4.2 成本控制

```python
def estimate_cost(prompt, model="moonshot-v1-8k"):
    # 粗略估算token数（中文按字符数，英文按单词数）
    estimated_tokens = len(prompt) * 1.5  # 粗略估算
    
    pricing = {
        "moonshot-v1-8k": 0.012,
        "moonshot-v1-32k": 0.024,
        "moonshot-v1-128k": 0.06
    }
    
    estimated_cost = (estimated_tokens / 1000) * pricing[model]
    print(f"预估成本: {estimated_cost:.4f} 元")
    return estimated_cost
```

## 5. 使用限制和注意事项

1. **API调用频率**：注意控制请求频率，避免触发速率限制
2. **Token限制**：不同模型有不同的上下文长度限制
3. **内容审核**：确保生成的内容符合平台规范
4. **API Key安全**：不要在代码中硬编码API Key，使用环境变量
5. **成本控制**：监控API使用量，设置合理的预算

## 6. 环境变量配置

```bash
# 在 .env 文件中
MOONSHOT_API_KEY=your_actual_api_key_here
```

```python
import os
from dotenv import load_dotenv

load_dotenv()

client = openai.Client(
    base_url="https://api.moonshot.cn/v1",
    api_key=os.getenv("MOONSHOT_API_KEY")
)
```

## 7. 工具调用 (Tool Calls)

Kimi API还支持Tool Use功能，可以让模型调用外部工具：

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "calculate",
            "description": "执行数学计算",
            "parameters": {
                "type": "object",
                "properties": {
                    "expression": {
                        "type": "string",
                        "description": "数学表达式"
                    }
                },
                "required": ["expression"]
            }
        }
    }
]

response = client.chat.completions.create(
    model="moonshot-v1-8k",
    messages=[
        {"role": "user", "content": "计算 2+3*4 的结果"}
    ],
    tools=tools,
    tool_choice="auto"
)
```

这样就可以在你的AI应用中成功集成Kimi模型来生成高中数学题目了！