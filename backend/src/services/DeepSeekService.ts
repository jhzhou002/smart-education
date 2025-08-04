import axios from 'axios'
import { config } from 'dotenv'

config()

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ''
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string
      reasoning_content?: string
    }
  }>
}

interface AuditResult {
  isValid: boolean
  score: number
  issues: string[]
  suggestions: string[]
  correctedSolution?: string
  auditSummary: string
  reasoningProcess?: string
}

interface GeneratedQuestion {
  question_text: string
  question_type: '单选' | '多选' | '填空' | '解答'
  difficulty: '基础' | '中等' | '困难'
  options?: string[]
  correct_answer: string
  solution: string
  knowledge_points: string[]
}

export class DeepSeekService {
  private static apiClient = axios.create({
    baseURL: DEEPSEEK_BASE_URL,
    headers: {
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      'Content-Type': 'application/json',
      'User-Agent': 'smart-education/1.0.0'
    },
    timeout: 45000,
    proxy: false,
    validateStatus: (status) => status < 500
  })

  static {
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log(`🔍 [DEEPSEEK] 发送请求到: ${config.baseURL}${config.url}`)
        console.log(`📝 [DEEPSEEK] 请求头: ${JSON.stringify(config.headers)}`)
        return config
      },
      (error) => {
        console.error('❌ [DEEPSEEK] 请求拦截器错误:', error)
        return Promise.reject(error)
      }
    )

    this.apiClient.interceptors.response.use(
      (response) => {
        console.log(`✅ [DEEPSEEK] 收到响应 ${response.status}: ${response.statusText}`)
        return response
      },
      (error) => {
        console.error('❌ [DEEPSEEK] 响应拦截器错误:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        })
        return Promise.reject(error)
      }
    )
  }

  /**
   * 审核数学题目和解答的准确性
   */
  static async auditMathQuestion(question: GeneratedQuestion): Promise<AuditResult> {
    console.log('🔍 [DEEPSEEK] 开始审核数学题目')
    console.log('🔍 [DEEPSEEK] 题目信息:', {
      question_text: question.question_text.substring(0, 50) + '...',
      question_type: question.question_type,
      difficulty: question.difficulty,
      has_solution: !!question.solution
    })

    const auditPrompt = `作为专业的数学教师，请仔细审核以下高中数学题目和解答：

【题目】
${question.question_text}

【题目类型】${question.question_type}
【难度等级】${question.difficulty}
${question.options ? `【选项】\n${question.options.join('\n')}` : ''}

【正确答案】${question.correct_answer}

【解题步骤】
${question.solution}

【涉及知识点】${question.knowledge_points.join('、')}

请从以下维度进行严格审核：

1. **题目描述审核**
   - 题目表述是否清晰完整
   - 是否存在歧义或表述不当
   - 题目难度是否与标注一致

2. **解题步骤审核**
   - 解题思路是否正确
   - 每个步骤的逻辑是否合理
   - 计算过程是否准确无误

3. **答案验证**
   - 最终答案是否正确
   - 答案格式是否符合题目要求
   - 对于选择题，正确选项是否匹配

4. **数学准确性**
   - 公式使用是否正确
   - 数值计算是否准确
   - 数学符号和表达式是否规范

请按照以下JSON格式返回审核结果：
{
  "isValid": true/false,
  "score": 0-100,
  "issues": ["发现的问题1", "发现的问题2"],
  "suggestions": ["改进建议1", "改进建议2"],
  "correctedSolution": "如果原解答有误，提供正确的解题步骤",
  "auditSummary": "总体评价和建议"
}

注意：
- score: 0-100分，综合评价题目质量
- isValid: 只有score>=80且无严重错误时才为true
- issues: 具体指出发现的问题
- suggestions: 提供具体的改进建议
- correctedSolution: 仅当原解答有误时提供，否则为null`

    try {
      console.log('🔍 [DEEPSEEK] 发送审核请求...')

      const requestData = {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位严谨的高中数学教师和题目审核专家，专门负责审核数学题目的准确性和质量。请严格按照JSON格式返回审核结果。'
          },
          {
            role: 'user',
            content: auditPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000
      }

      console.log('🔍 [DEEPSEEK] 请求数据大小:', JSON.stringify(requestData).length)

      const response = await this.apiClient.post<DeepSeekResponse>('/chat/completions', requestData)

      console.log('🔍 [DEEPSEEK] 收到响应状态:', response.status)

      if (!response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
        throw new Error('DeepSeek API响应格式异常: 缺少choices或message字段')
      }

      const content = response.data.choices[0].message.content
      console.log('🔍 [DEEPSEEK] AI审核内容长度:', content.length)
      console.log('🔍 [DEEPSEEK] AI审核内容预览:', content.substring(0, 200) + '...')

      if (!content || content.trim() === '') {
        throw new Error('DeepSeek返回内容为空')
      }

      let auditResult: AuditResult
      try {
        const cleanContent = content
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .trim()

        console.log('🔍 [DEEPSEEK] 清理后的内容预览:', cleanContent.substring(0, 100) + '...')

        const parsedResult = JSON.parse(cleanContent)
        
        // 确保返回的数据符合AuditResult接口
        auditResult = {
          isValid: parsedResult.isValid || false,
          score: parsedResult.score || 0,
          issues: Array.isArray(parsedResult.issues) ? parsedResult.issues : [],
          suggestions: Array.isArray(parsedResult.suggestions) ? parsedResult.suggestions : [],
          correctedSolution: parsedResult.correctedSolution || undefined,
          auditSummary: parsedResult.auditSummary || '审核完成',
          reasoningProcess: response.data.choices[0].message.reasoning_content || undefined
        }

        console.log('🔍 [DEEPSEEK] JSON解析成功，审核结果:', {
          isValid: auditResult.isValid,
          score: auditResult.score,
          issuesCount: auditResult.issues.length,
          suggestionsCount: auditResult.suggestions.length,
          hasCorrectedSolution: !!auditResult.correctedSolution
        })

      } catch (parseError) {
        console.error('🔍 [DEEPSEEK] JSON解析失败:', parseError)
        console.error('🔍 [DEEPSEEK] 原始内容:', content)
        
        // 解析失败时返回一个默认的审核结果
        auditResult = {
          isValid: false,
          score: 0,
          issues: ['AI审核响应格式解析失败'],
          suggestions: ['请检查题目格式并重新生成'],
          auditSummary: `审核失败：${parseError}`,
          reasoningProcess: content
        }
      }

      console.log(`🔍 [DEEPSEEK] ✅ 题目审核完成 - 有效性: ${auditResult.isValid}, 得分: ${auditResult.score}`)
      return auditResult

    } catch (error: any) {
      console.error('🔍 [DEEPSEEK] ❌ 题目审核失败:', error)

      if (error.response) {
        console.error('🔍 [DEEPSEEK] HTTP错误状态:', error.response.status)
        console.error('🔍 [DEEPSEEK] HTTP错误数据:', error.response.data)
      }

      throw new Error(`DeepSeek审核失败: ${error.message}`)
    }
  }

  /**
   * 使用深度推理模型进行复杂题目审核
   */
  static async auditMathQuestionWithReasoning(question: GeneratedQuestion): Promise<AuditResult> {
    console.log('🧠 [DEEPSEEK-R1] 开始深度推理审核')
    
    const auditPrompt = `请使用深度推理来审核以下高中数学题目：

【题目】${question.question_text}
【类型】${question.question_type}
【难度】${question.difficulty}
${question.options ? `【选项】${question.options.join(' | ')}` : ''}
【答案】${question.correct_answer}
【解答】${question.solution}

请进行逐步推理验证：
1. 分析题目的数学逻辑
2. 验证解题步骤的正确性
3. 检查计算过程
4. 确认最终答案

返回JSON格式的审核结果。`

    try {
      const response = await this.apiClient.post<DeepSeekResponse>('/chat/completions', {
        model: 'deepseek-reasoner',
        messages: [
          {
            role: 'system',
            content: '你是数学审核专家，使用深度推理来验证数学题目的正确性。'
          },
          {
            role: 'user',
            content: auditPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: 3000
      })

      const content = response.data.choices[0].message.content
      const reasoningContent = response.data.choices[0].message.reasoning_content

      console.log('🧠 [DEEPSEEK-R1] 推理过程长度:', reasoningContent?.length || 0)
      console.log('🧠 [DEEPSEEK-R1] 最终结果长度:', content.length)

      let auditResult: AuditResult
      try {
        const cleanContent = content
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .trim()

        const parsedResult = JSON.parse(cleanContent)
        
        auditResult = {
          isValid: parsedResult.isValid || false,
          score: parsedResult.score || 0,
          issues: Array.isArray(parsedResult.issues) ? parsedResult.issues : [],
          suggestions: Array.isArray(parsedResult.suggestions) ? parsedResult.suggestions : [],
          correctedSolution: parsedResult.correctedSolution || undefined,
          auditSummary: parsedResult.auditSummary || '深度推理审核完成',
          reasoningProcess: reasoningContent || undefined
        }

      } catch (parseError) {
        auditResult = {
          isValid: false,
          score: 0,
          issues: ['深度推理审核响应解析失败'],
          suggestions: ['请重新进行审核'],
          auditSummary: `深度推理审核失败：${parseError}`,
          reasoningProcess: reasoningContent || content
        }
      }

      console.log(`🧠 [DEEPSEEK-R1] ✅ 深度推理审核完成 - 有效性: ${auditResult.isValid}, 得分: ${auditResult.score}`)
      return auditResult

    } catch (error: any) {
      console.error('🧠 [DEEPSEEK-R1] ❌ 深度推理审核失败:', error)
      throw new Error(`DeepSeek深度推理审核失败: ${error.message}`)
    }
  }

  /**
   * 批量审核题目
   */
  static async batchAuditQuestions(questions: GeneratedQuestion[]): Promise<AuditResult[]> {
    console.log(`🔍 [DEEPSEEK] 开始批量审核 ${questions.length} 道题目`)
    
    const results: AuditResult[] = []
    
    for (let i = 0; i < questions.length; i++) {
      console.log(`🔍 [DEEPSEEK] 审核第 ${i + 1}/${questions.length} 道题目`)
      
      try {
        const auditResult = await this.auditMathQuestion(questions[i])
        results.push(auditResult)
        
        console.log(`🔍 [DEEPSEEK] 第 ${i + 1} 道题目审核完成: ${auditResult.isValid ? '✅' : '❌'} (得分: ${auditResult.score})`)
        
        // 避免请求过于频繁
        if (i < questions.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
        
      } catch (error) {
        console.error(`🔍 [DEEPSEEK] 第 ${i + 1} 道题目审核失败:`, error)
        
        results.push({
          isValid: false,
          score: 0,
          issues: [`审核失败: ${error}`],
          suggestions: ['请重新生成题目'],
          auditSummary: '审核过程出现错误'
        })
      }
    }
    
    const validCount = results.filter(r => r.isValid).length
    console.log(`🔍 [DEEPSEEK] 批量审核完成: ${validCount}/${questions.length} 道题目通过审核`)
    
    return results
  }

  /**
   * 获取API状态信息
   */
  static async getApiStatus(): Promise<{ status: string; message: string }> {
    try {
      const response = await this.apiClient.post('/chat/completions', {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: '你好，这是一个API测试请求。'
          }
        ],
        max_tokens: 10
      })

      return {
        status: 'ok',
        message: 'DeepSeek API连接正常'
      }
    } catch (error: any) {
      return {
        status: 'error',
        message: `DeepSeek API连接失败: ${error.message}`
      }
    }
  }
}