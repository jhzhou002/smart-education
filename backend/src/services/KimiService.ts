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
      'Content-Type': 'application/json'
    },
    timeout: 30000
  })

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
      const response = await this.apiClient.post<KimiResponse>('/v1/chat/completions', {
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
      throw new Error(`生成测评题目失败: ${error.message}`)
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
      const response = await this.apiClient.post<KimiResponse>('/v1/chat/completions', {
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
      throw new Error(`生成练习题目失败: ${error.message}`)
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
      const response = await this.apiClient.post<KimiResponse>('/v1/chat/completions', {
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
      const response = await this.apiClient.post<KimiResponse>('/v1/chat/completions', {
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