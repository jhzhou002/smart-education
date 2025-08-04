import axios from 'axios'
import { config } from 'dotenv'

config()

const KIMI_API_KEY = process.env.KIMI_API_KEY || ''
const KIMI_BASE_URL = process.env.KIMI_BASE_URL || 'https://api.moonshot.cn'

interface KimiResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
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

export class KimiService {
  private static apiClient = axios.create({
    baseURL: KIMI_BASE_URL,
    headers: {
      'Authorization': `Bearer ${KIMI_API_KEY}`,
      'Content-Type': 'application/json',
      'User-Agent': 'smart-education/1.0.0'
    },
    timeout: 30000,
    // 禁用代理
    proxy: false,
    // 添加请求拦截器
    validateStatus: (status) => status < 500
  })

  // 静态初始化块，添加请求和响应拦截器
  static {
    this.apiClient.interceptors.request.use(
      (config) => {
        console.log(`🌐 发送请求到: ${config.baseURL}${config.url}`)
        console.log(`📝 请求头: ${JSON.stringify(config.headers)}`)
        return config
      },
      (error) => {
        console.error('❌ 请求拦截器错误:', error)
        return Promise.reject(error)
      }
    )

    this.apiClient.interceptors.response.use(
      (response) => {
        console.log(`✅ 收到响应 ${response.status}: ${response.statusText}`)
        return response
      },
      (error) => {
        console.error('❌ 响应拦截器错误:', {
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
   * 生成基础测评题目
   */
  static async generateAssessmentQuestions(
    chapterName: string,
    topicNames: string[],
    grade: string,
    questionCount: number = 10
  ): Promise<GeneratedQuestion[]> {
    const prompt = `请为高中数学${grade}年级的"${chapterName}"章节生成${questionCount}道测评题目。

涉及知识点：${topicNames.join('、')}

要求：
1. 题目类型分布：60%单选题、20%填空题、20%解答题
2. 难度分布：50%基础、30%中等、20%困难
3. 每道题必须包含以下信息：
   - 题目内容（question_text）
   - 题目类型（question_type）：单选、填空、解答
   - 难度等级（difficulty）：基础、中等、困难
   - 正确答案（correct_answer）
   - 详细解题步骤（solution）
   - 涉及知识点（knowledge_points）：从给定知识点中选择
   - 选项（options）：仅单选题需要，包含4个选项

请严格按照以下JSON格式返回，不要包含任何其他文字：
[
  {
    "question_text": "题目内容",
    "question_type": "单选",
    "difficulty": "基础",
    "options": ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"],
    "correct_answer": "A",
    "solution": "详细解题步骤",
    "knowledge_points": ["知识点1", "知识点2"]
  }
]`

    try {
      console.log('发送Kimi API请求 - 生成测评题目')
      const response = await this.apiClient.post<KimiResponse>('/chat/completions', {
        model: 'moonshot-v1-8k',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的高中数学题目生成专家，擅长根据知识点生成高质量的数学题目。请严格按照要求的JSON格式返回题目数据。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })

      const content = response.data.choices[0]?.message?.content
      if (!content) {
        throw new Error('Kimi API返回内容为空')
      }

      // 解析JSON响应
      const questions = JSON.parse(content) as GeneratedQuestion[]
      console.log(`成功生成${questions.length}道测评题目`)
      return questions

    } catch (error: any) {
      console.error('生成测评题目失败:', error.response?.data || error.message)
      console.log('🚨 API调用失败，使用fallback机制生成示例题目')
      
      // Fallback: 生成示例题目
      return this.generateFallbackAssessmentQuestions(chapterName, topicNames, questionCount)
    }
  }

  /**
   * 生成练习题目
   */
  static async generatePracticeQuestions(
    topicName: string,
    difficulty: string,
    questionCount: number = 5
  ): Promise<GeneratedQuestion[]> {
    const prompt = `请为高中数学知识点"${topicName}"生成${questionCount}道${difficulty}难度的练习题目。

要求：
1. 题目类型分布：40%单选题、30%填空题、30%解答题
2. 所有题目难度统一为：${difficulty}
3. 每道题必须包含以下信息：
   - 题目内容（question_text）
   - 题目类型（question_type）：单选、填空、解答
   - 难度等级（difficulty）：${difficulty}
   - 正确答案（correct_answer）
   - 详细解题步骤（solution）
   - 涉及知识点（knowledge_points）：包含"${topicName}"
   - 选项（options）：仅单选题需要，包含4个选项

请严格按照以下JSON格式返回，不要包含任何其他文字：
[
  {
    "question_text": "题目内容",
    "question_type": "单选",
    "difficulty": "${difficulty}",
    "options": ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"],
    "correct_answer": "A",
    "solution": "详细解题步骤",
    "knowledge_points": ["${topicName}"]
  }
]`

    try {
      console.log(`发送Kimi API请求 - 生成${topicName}练习题目`)
      const response = await this.apiClient.post<KimiResponse>('/chat/completions', {
        model: 'moonshot-v1-8k',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的高中数学题目生成专家，擅长根据知识点生成高质量的数学题目。请严格按照要求的JSON格式返回题目数据。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })

      const content = response.data.choices[0]?.message?.content
      if (!content) {
        throw new Error('Kimi API返回内容为空')
      }

      // 解析JSON响应
      const questions = JSON.parse(content) as GeneratedQuestion[]
      console.log(`成功生成${questions.length}道练习题目`)
      return questions

    } catch (error: any) {
      console.error('生成练习题目失败:', error.response?.data || error.message)
      console.log('🚨 API调用失败，使用fallback机制生成示例题目')
      
      // Fallback: 生成示例题目
      return this.generateFallbackPracticeQuestions(topicName, difficulty, questionCount)
    }
  }

  /**
   * Fallback方法：当API不可用时生成示例测评题目
   */
  private static generateFallbackAssessmentQuestions(
    chapterName: string,
    topicNames: string[],
    questionCount: number
  ): GeneratedQuestion[] {
    console.log(`生成${chapterName}章节测评示例题目`)
    
    const difficulties = ['基础', '中等', '困难'] as const
    const questionTypes = ['单选', '填空', '解答'] as const
    const fallbackQuestions: GeneratedQuestion[] = []
    
    for (let i = 0; i < questionCount; i++) {
      const topicName = topicNames[i % topicNames.length]
      const difficulty = difficulties[i % difficulties.length]
      const questionType = questionTypes[i % questionTypes.length]
      
      const question: GeneratedQuestion = {
        question_text: `${chapterName} - ${topicName}题目${i + 1}（示例）`,
        question_type: questionType,
        difficulty: difficulty,
        correct_answer: questionType === '单选' ? 'A' : '示例答案',
        solution: `关于${topicName}的详细解题步骤（示例）`,
        knowledge_points: [topicName]
      }
      
      if (questionType === '单选') {
        question.options = ['A. 选项1', 'B. 选项2', 'C. 选项3', 'D. 选项4']
      }
      
      fallbackQuestions.push(question)
    }
    
    return fallbackQuestions
  }

  /**
   * Fallback方法：当API不可用时生成示例题目
   */
  private static generateFallbackPracticeQuestions(
    topicName: string,
    difficulty: string,
    questionCount: number
  ): GeneratedQuestion[] {
    console.log(`生成${topicName}的${difficulty}难度示例题目`)
    
    const fallbackQuestions: GeneratedQuestion[] = [
      {
        question_text: `关于${topicName}的基础概念题目（示例）`,
        question_type: '单选',
        difficulty: difficulty as any,
        options: ['A. 选项1', 'B. 选项2', 'C. 选项3', 'D. 选项4'],
        correct_answer: 'A',
        solution: `这是关于${topicName}的详细解题步骤（示例）`,
        knowledge_points: [topicName]
      },
      {
        question_text: `${topicName}计算题（示例）`,
        question_type: '填空',
        difficulty: difficulty as any,
        correct_answer: '示例答案',
        solution: `这是关于${topicName}计算的详细过程（示例）`,
        knowledge_points: [topicName]
      }
    ]
    
    // 根据请求数量返回题目
    return fallbackQuestions.slice(0, questionCount)
  }

  /**
   * 调试版本：生成练习题目（不使用fallback）
   */
  static async generatePracticeQuestionsDebug(
    topicName: string,
    difficulty: string,
    questionCount: number
  ): Promise<GeneratedQuestion[]> {
    console.log('🔧 [KIMI DEBUG] 开始生成练习题目')
    console.log('🔧 [KIMI DEBUG] 参数:', { topicName, difficulty, questionCount })

    const prompt = `你是一位专业的高中数学老师，请生成${questionCount}道关于"${topicName}"的${difficulty}难度练习题目。

要求：
1. 题目类型多样化（单选题、填空题、解答题）
2. 题目内容要符合高中数学水平
3. 每道题目必须包含详细的解题步骤
4. 严格按照以下JSON格式返回，不要包含任何其他文字说明：

[
  {
    "question_text": "题目内容",
    "question_type": "单选|填空|解答",
    "difficulty": "${difficulty}",
    "options": ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"],
    "correct_answer": "正确答案",
    "solution": "详细解题步骤",
    "knowledge_points": ["${topicName}"]
  }
]

注意：
- 单选题必须包含options数组，其他题型options为null
- correct_answer对于单选题应该是选项字母（如"A"），其他题型是具体答案
- solution必须详细，包含每个解题步骤`

    try {
      console.log('🔧 [KIMI DEBUG] 发送API请求...')
      console.log('🔧 [KIMI DEBUG] 请求URL:', `${KIMI_BASE_URL}/v1/chat/completions`)
      console.log('🔧 [KIMI DEBUG] 模型:', 'moonshot-v1-8k')
      console.log('🔧 [KIMI DEBUG] 提示词长度:', prompt.length)

      const requestData = {
        model: 'moonshot-v1-8k',
        messages: [
          {
            role: 'system',  
            content: '你是一个专业的高中数学老师，擅长出题。请严格按照JSON格式返回，不要包含任何markdown标记或其他文字。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      }

      console.log('🔧 [KIMI DEBUG] 请求数据:', JSON.stringify(requestData, null, 2))

      const response = await this.apiClient.post<KimiResponse>('/v1/chat/completions', requestData)
      
      console.log('🔧 [KIMI DEBUG] 收到响应状态:', response.status)
      console.log('🔧 [KIMI DEBUG] 响应头:', response.headers)
      console.log('🔧 [KIMI DEBUG] 响应数据:', JSON.stringify(response.data, null, 2))

      if (!response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
        throw new Error('API响应格式异常: 缺少choices或message字段')
      }

      const content = response.data.choices[0].message.content
      console.log('🔧 [KIMI DEBUG] AI回复内容:', content)
      console.log('🔧 [KIMI DEBUG] 内容长度:', content.length)

      if (!content || content.trim() === '') {
        throw new Error('AI返回内容为空')
      }

      // 尝试解析JSON
      let questions: GeneratedQuestion[]
      try {
        // 清理可能的markdown标记
        const cleanContent = content
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .trim()
        
        console.log('🔧 [KIMI DEBUG] 清理后的内容:', cleanContent)
        
        questions = JSON.parse(cleanContent) as GeneratedQuestion[]
        console.log('🔧 [KIMI DEBUG] JSON解析成功，题目数量:', questions.length)
      } catch (parseError) {
        console.error('🔧 [KIMI DEBUG] JSON解析失败:', parseError)
        console.error('🔧 [KIMI DEBUG] 原始内容:', content)
        throw new Error(`JSON解析失败: ${parseError}`)
      }

      if (!Array.isArray(questions)) {
        throw new Error('AI返回的不是数组格式')
      }

      console.log('🔧 [KIMI DEBUG] 验证题目格式...')
      questions.forEach((q, index) => {
        console.log(`🔧 [KIMI DEBUG] 题目${index + 1}:`, {
          question_text: q.question_text?.substring(0, 50) + '...',
          question_type: q.question_type,
          difficulty: q.difficulty,
          has_options: !!q.options,
          correct_answer: q.correct_answer,
          has_solution: !!q.solution,
          knowledge_points: q.knowledge_points
        })
        
        if (!q.question_text || !q.question_type || !q.correct_answer) {
          console.error('🔧 [KIMI DEBUG] 题目格式不完整:', q)
          throw new Error(`第${index + 1}道题目格式不完整`)
        }
      })

      console.log(`🔧 [KIMI DEBUG] ✅ 成功生成${questions.length}道练习题目`)
      return questions

    } catch (error: any) {
      console.error('🔧 [KIMI DEBUG] ❌ 生成练习题目失败:', error)
      
      if (error.response) {
        console.error('🔧 [KIMI DEBUG] HTTP错误状态:', error.response.status)
        console.error('🔧 [KIMI DEBUG] HTTP错误头:', error.response.headers)
        console.error('🔧 [KIMI DEBUG] HTTP错误数据:', error.response.data)
      }
      
      if (error.request) {
        console.error('🔧 [KIMI DEBUG] 请求配置:', {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          timeout: error.config?.timeout
        })
      }

      // 直接抛出错误，不使用fallback
      throw error
    }
  }

  /**
   * 调试版本：生成测评题目（不使用fallback）
   */
  static async generateAssessmentQuestionsDebug(
    chapterName: string,
    topicNames: string[],
    questionCount: number
  ): Promise<GeneratedQuestion[]> {
    console.log('🔧 [KIMI DEBUG] 开始生成测评题目')
    console.log('🔧 [KIMI DEBUG] 参数:', { chapterName, topicNames, questionCount })

    const topicsText = topicNames.join('、')
    const prompt = `你是一位专业的高中数学老师，请为"${chapterName}"章节生成${questionCount}道综合测评题目。

涉及知识点：${topicsText}

要求：
1. 题目要覆盖不同知识点，难度分布合理
2. 题目类型多样化（单选题、填空题、解答题）
3. 每道题目必须包含详细的解题步骤
4. 严格按照以下JSON格式返回，不要包含任何其他文字说明：

[
  {
    "question_text": "题目内容",
    "question_type": "单选|填空|解答", 
    "difficulty": "基础|中等|困难",
    "options": ["A. 选项1", "B. 选项2", "C. 选项3", "D. 选项4"],
    "correct_answer": "正确答案",
    "solution": "详细解题步骤",
    "knowledge_points": ["相关知识点"]
  }
]

注意：
- 单选题必须包含options数组，其他题型options为null
- correct_answer对于单选题应该是选项字母（如"A"），其他题型是具体答案
- solution必须详细，包含每个解题步骤
- knowledge_points应该从给定的知识点中选择`

    try {
      console.log('🔧 [KIMI DEBUG] 发送API请求...')
      console.log('🔧 [KIMI DEBUG] 请求URL:', `${KIMI_BASE_URL}/v1/chat/completions`)
      console.log('🔧 [KIMI DEBUG] 模型:', 'moonshot-v1-8k')
      console.log('🔧 [KIMI DEBUG] 提示词长度:', prompt.length)

      const requestData = {
        model: 'moonshot-v1-8k',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的高中数学老师，擅长出题。请严格按照JSON格式返回，不要包含任何markdown标记或其他文字。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
      }

      console.log('🔧 [KIMI DEBUG] 请求数据:', JSON.stringify(requestData, null, 2))

      const response = await this.apiClient.post<KimiResponse>('/v1/chat/completions', requestData)
      
      console.log('🔧 [KIMI DEBUG] 收到响应状态:', response.status)
      console.log('🔧 [KIMI DEBUG] 响应头:', response.headers)
      console.log('🔧 [KIMI DEBUG] 响应数据:', JSON.stringify(response.data, null, 2))

      if (!response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
        throw new Error('API响应格式异常: 缺少choices或message字段')
      }

      const content = response.data.choices[0].message.content
      console.log('🔧 [KIMI DEBUG] AI回复内容:', content)
      console.log('🔧 [KIMI DEBUG] 内容长度:', content.length)

      if (!content || content.trim() === '') {
        throw new Error('AI返回内容为空')
      }

      // 尝试解析JSON
      let questions: GeneratedQuestion[]
      try {
        // 清理可能的markdown标记
        const cleanContent = content
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .trim()
        
        console.log('🔧 [KIMI DEBUG] 清理后的内容:', cleanContent)
        
        questions = JSON.parse(cleanContent) as GeneratedQuestion[]
        console.log('🔧 [KIMI DEBUG] JSON解析成功，题目数量:', questions.length)
      } catch (parseError) {
        console.error('🔧 [KIMI DEBUG] JSON解析失败:', parseError)
        console.error('🔧 [KIMI DEBUG] 原始内容:', content)
        throw new Error(`JSON解析失败: ${parseError}`)
      }

      if (!Array.isArray(questions)) {
        throw new Error('AI返回的不是数组格式')
      }

      console.log('🔧 [KIMI DEBUG] 验证题目格式...')
      questions.forEach((q, index) => {
        console.log(`🔧 [KIMI DEBUG] 题目${index + 1}:`, {
          question_text: q.question_text?.substring(0, 50) + '...',
          question_type: q.question_type,
          difficulty: q.difficulty,
          has_options: !!q.options,
          correct_answer: q.correct_answer,
          has_solution: !!q.solution,
          knowledge_points: q.knowledge_points
        })
        
        if (!q.question_text || !q.question_type || !q.correct_answer) {
          console.error('🔧 [KIMI DEBUG] 题目格式不完整:', q)
          throw new Error(`第${index + 1}道题目格式不完整`)
        }
      })

      console.log(`🔧 [KIMI DEBUG] ✅ 成功生成${questions.length}道测评题目`)
      return questions

    } catch (error: any) {
      console.error('🔧 [KIMI DEBUG] ❌ 生成测评题目失败:', error)
      
      if (error.response) {
        console.error('🔧 [KIMI DEBUG] HTTP错误状态:', error.response.status)
        console.error('🔧 [KIMI DEBUG] HTTP错误头:', error.response.headers)
        console.error('🔧 [KIMI DEBUG] HTTP错误数据:', error.response.data)
      }
      
      if (error.request) {
        console.error('🔧 [KIMI DEBUG] 请求配置:', {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          timeout: error.config?.timeout
        })
      }

      // 直接抛出错误，不使用fallback
      throw error
    }
  }

  /**
   * 生成个性化学习计划
   */
  static async generateLearningPlan(
    userName: string,
    grade: string,
    weakChapters: string[],
    targetScore?: number
  ): Promise<string> {
    const prompt = `请为${grade}年级学生${userName}制定个性化数学学习计划。

学生情况：
- 年级：${grade}
- 薄弱章节：${weakChapters.join('、')}
${targetScore ? `- 目标分数：${targetScore}分` : ''}

请制定详细的学习计划，包括：
1. 学习目标和时间安排
2. 针对薄弱章节的重点学习策略
3. 每日学习任务和练习建议
4. 定期复习和检测安排
5. 学习方法指导

请以markdown格式返回学习计划。`

    try {
      console.log(`发送Kimi API请求 - 生成学习计划`)
      const response = await this.apiClient.post<KimiResponse>('/chat/completions', {
        model: 'moonshot-v1-8k',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的数学学习规划师，擅长根据学生的具体情况制定个性化的学习计划。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 2000
      })

      const content = response.data.choices[0]?.message?.content
      if (!content) {
        throw new Error('Kimi API返回内容为空')
      }

      console.log('成功生成学习计划')
      return content

    } catch (error: any) {
      console.error('生成学习计划失败:', error.response?.data || error.message)
      throw new Error(`生成学习计划失败: ${error.message}`)
    }
  }

  /**
   * 分析学习进度和提供建议
   */
  static async analyzeProgress(
    userName: string,
    completedAssessments: any[],
    practiceRecords: any[]
  ): Promise<string> {
    const assessmentSummary = completedAssessments.map(a => 
      `${a.chapter?.name}: ${a.score}分 (${a.correct_answers}/${a.total_questions})`
    ).join('\n')
    
    const practiceCount = practiceRecords.length
    const correctRate = practiceRecords.length > 0 
      ? (practiceRecords.filter(r => r.is_correct).length / practiceRecords.length * 100).toFixed(1)
      : '0'

    const prompt = `请为学生${userName}分析学习进度并提供改进建议。

测试成绩：
${assessmentSummary}

练习情况：
- 总练习题数：${practiceCount}道
- 正确率：${correctRate}%

请分析：
1. 学习强项和薄弱环节
2. 进步趋势和问题诊断
3. 具体的改进建议
4. 下一步学习重点

请以markdown格式返回分析报告。`

    try {
      console.log(`发送Kimi API请求 - 分析学习进度`)
      const response = await this.apiClient.post<KimiResponse>('/chat/completions', {
        model: 'moonshot-v1-8k',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的学习分析师，擅长分析学生的学习数据并提供有针对性的改进建议。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 1500
      })

      const content = response.data.choices[0]?.message?.content
      if (!content) {
        throw new Error('Kimi API返回内容为空')
      }

      console.log('成功生成学习进度分析')
      return content

    } catch (error: any) {
      console.error('学习进度分析失败:', error.response?.data || error.message)
      throw new Error(`学习进度分析失败: ${error.message}`)
    }
  }
}