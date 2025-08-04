import { Request, Response } from 'express'
import { Topic } from '../models/Topic'
import { Chapter } from '../models/Chapter'
import { KimiService } from '../services/KimiService'
import { DeepSeekService } from '../services/DeepSeekService'

export class DebugController {
  /**
   * 调试版本的练习题目生成（不使用fallback）
   */
  static async generatePracticeQuestions(req: Request, res: Response) {
    try {
      console.log('🔧 [DEBUG] 收到练习题目生成请求')
      console.log('🔧 [DEBUG] 请求参数:', req.body)
      console.log('🔧 [DEBUG] 用户信息:', req.user)

      const userId = req.user?.userId
      if (!userId) {
        console.log('🔧 [DEBUG] 用户未认证')
        return res.status(401).json({ message: '用户未认证' })
      }

      const { topic_id, difficulty = '基础', question_count = 3 } = req.body

      if (!topic_id) {
        console.log('🔧 [DEBUG] 缺少topic_id参数')
        return res.status(400).json({ message: '知识点ID不能为空' })
      }

      console.log('🔧 [DEBUG] 查找知识点信息...')
      const topic = await Topic.findOne({
        where: { id: topic_id, is_active: true },
        include: [
          {
            model: Chapter,
            as: 'chapter',
            attributes: ['id', 'name', 'grade']
          }
        ]
      })

      if (!topic) {
        console.log('🔧 [DEBUG] 知识点不存在:', topic_id)
        return res.status(404).json({ message: '知识点不存在' })
      }

      console.log('🔧 [DEBUG] 找到知识点:', {
        id: topic.id,
        name: topic.name,
        chapter: topic.chapter?.name,
        grade: topic.chapter?.grade
      })

      console.log('🔧 [DEBUG] 开始调用Kimi API生成题目...')
      console.log('🔧 [DEBUG] 生成参数:', {
        topicName: topic.name,
        difficulty,
        questionCount: question_count
      })

      // 直接调用AI生成，不使用fallback
      const questions = await KimiService.generatePracticeQuestionsDebug(
        topic.name,
        difficulty,
        Number(question_count)
      )

      console.log('🔧 [DEBUG] AI生成完成，题目数量:', questions.length)
      console.log('🔧 [DEBUG] 生成的题目:', JSON.stringify(questions, null, 2))

      res.json({
        message: '调试生成成功',
        data: questions,
        debug_info: {
          topic_id: topic_id,
          topic_name: topic.name,
          chapter_name: topic.chapter?.name,
          difficulty,
          question_count: Number(question_count),
          generated_count: questions.length
        }
      })

    } catch (error: any) {
      console.error('🔧 [DEBUG] 生成练习题目失败:', error)
      console.error('🔧 [DEBUG] 错误堆栈:', error.stack)
      
      res.status(500).json({ 
        message: '生成失败',
        error: error.message,
        error_stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        debug_info: {
          timestamp: new Date().toISOString(),
          error_type: error.constructor.name
        }
      })
    }
  }

  /**
   * 调试版本的测评题目生成（不使用fallback）
   */
  static async generateAssessmentQuestions(req: Request, res: Response) {
    try {
      console.log('🔧 [DEBUG] 收到测评题目生成请求')
      console.log('🔧 [DEBUG] 请求参数:', req.body)
      console.log('🔧 [DEBUG] 用户信息:', req.user)

      const userId = req.user?.userId
      if (!userId) {
        console.log('🔧 [DEBUG] 用户未认证')
        return res.status(401).json({ message: '用户未认证' })
      }

      const { topic_id, difficulty = '基础', question_count = 5 } = req.body

      if (!topic_id) {
        console.log('🔧 [DEBUG] 缺少topic_id参数')
        return res.status(400).json({ message: '知识点ID不能为空' })
      }

      console.log('🔧 [DEBUG] 查找知识点信息...')
      const topic = await Topic.findOne({
        where: { id: topic_id, is_active: true },
        include: [
          {
            model: Chapter,
            as: 'chapter',
            attributes: ['id', 'name', 'grade']
          }
        ]
      })

      if (!topic) {
        console.log('🔧 [DEBUG] 知识点不存在:', topic_id)
        return res.status(404).json({ message: '知识点不存在' })
      }

      console.log('🔧 [DEBUG] 找到知识点:', {
        id: topic.id,
        name: topic.name,
        chapter: topic.chapter?.name,
        grade: topic.chapter?.grade
      })

      // 获取章节下的所有知识点名称
      const allTopics = await Topic.findAll({
        where: { 
          chapter_id: topic.chapter_id,
          is_active: true 
        },
        attributes: ['name']
      })

      const topicNames = allTopics.map(t => t.name)
      console.log('🔧 [DEBUG] 章节所有知识点:', topicNames)

      console.log('🔧 [DEBUG] 开始调用Kimi API生成测评题目...')
      console.log('🔧 [DEBUG] 生成参数:', {
        chapterName: topic.chapter?.name,
        topicNames: topicNames,
        questionCount: question_count
      })

      // 直接调用AI生成，不使用fallback
      const questions = await KimiService.generateAssessmentQuestionsDebug(
        topic.chapter?.name || '数学',
        topicNames,
        Number(question_count)
      )

      console.log('🔧 [DEBUG] AI生成完成，题目数量:', questions.length)
      console.log('🔧 [DEBUG] 生成的题目:', JSON.stringify(questions, null, 2))

      res.json({
        message: '调试生成成功',
        data: questions,
        debug_info: {
          topic_id: topic_id,
          topic_name: topic.name,
          chapter_name: topic.chapter?.name,
          all_topics: topicNames,
          question_count: Number(question_count),
          generated_count: questions.length
        }
      })

    } catch (error: any) {
      console.error('🔧 [DEBUG] 生成测评题目失败:', error)
      console.error('🔧 [DEBUG] 错误堆栈:', error.stack)
      
      res.status(500).json({ 
        message: '生成失败',
        error: error.message,
        error_stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        debug_info: {
          timestamp: new Date().toISOString(),
          error_type: error.constructor.name
        }
      })
    }
  }

  /**
   * 监督式练习题目生成（Kimi生成 + DeepSeek审核）
   */
  static async generateSupervisedPracticeQuestions(req: Request, res: Response) {
    try {
      console.log('🔄 [SUPERVISED-DEBUG] 收到监督式练习题目生成请求')
      console.log('🔄 [SUPERVISED-DEBUG] 请求参数:', req.body)

      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: '用户未认证' })
      }

      const { topic_id, difficulty = '基础', question_count = 3, max_retries = 2 } = req.body

      if (!topic_id) {
        return res.status(400).json({ message: '知识点ID不能为空' })
      }

      const topic = await Topic.findOne({
        where: { id: topic_id, is_active: true },
        include: [
          {
            model: Chapter,
            as: 'chapter',
            attributes: ['id', 'name', 'grade']
          }
        ]
      })

      if (!topic) {
        return res.status(404).json({ message: '知识点不存在' })
      }

      console.log('🔄 [SUPERVISED-DEBUG] 开始监督式生成...')

      // 调用监督式生成方法
      const result = await KimiService.generateSupervisedPracticeQuestions(
        topic.name,
        difficulty,
        Number(question_count),
        Number(max_retries)
      )

      console.log('🔄 [SUPERVISED-DEBUG] 监督式生成完成')

      res.json({
        message: '监督式生成成功',
        data: result.questions,
        supervision_info: {
          generation_attempts: result.generationAttempts,
          supervision_summary: result.supervisionSummary,
          audit_results: result.auditResults
        },
        debug_info: {
          topic_id: topic_id,
          topic_name: topic.name,
          chapter_name: topic.chapter?.name,
          difficulty,
          question_count: Number(question_count),
          max_retries: Number(max_retries)
        }
      })

    } catch (error: any) {
      console.error('🔄 [SUPERVISED-DEBUG] 监督式生成失败:', error)
      
      res.status(500).json({ 
        message: '监督式生成失败',
        error: error.message,
        error_stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  }

  /**
   * 监督式测评题目生成（Kimi生成 + DeepSeek审核）
   */
  static async generateSupervisedAssessmentQuestions(req: Request, res: Response) {
    try {
      console.log('🔄 [SUPERVISED-ASSESSMENT-DEBUG] 收到监督式测评题目生成请求')

      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: '用户未认证' })
      }

      const { topic_id, question_count = 5, max_retries = 2 } = req.body

      if (!topic_id) {
        return res.status(400).json({ message: '知识点ID不能为空' })
      }

      const topic = await Topic.findOne({
        where: { id: topic_id, is_active: true },
        include: [
          {
            model: Chapter,
            as: 'chapter',
            attributes: ['id', 'name', 'grade']
          }
        ]
      })

      if (!topic) {
        return res.status(404).json({ message: '知识点不存在' })
      }

      // 获取章节下的所有知识点名称
      const allTopics = await Topic.findAll({
        where: { 
          chapter_id: topic.chapter_id,
          is_active: true 
        },
        attributes: ['name']
      })

      const topicNames = allTopics.map(t => t.name)

      console.log('🔄 [SUPERVISED-ASSESSMENT-DEBUG] 开始监督式测评生成...')

      // 调用监督式测评生成方法
      const result = await KimiService.generateSupervisedAssessmentQuestions(
        topic.chapter?.name || '数学',
        topicNames,
        topic.chapter?.grade || '高一',
        Number(question_count),
        Number(max_retries)
      )

      console.log('🔄 [SUPERVISED-ASSESSMENT-DEBUG] 监督式测评生成完成')

      res.json({
        message: '监督式测评生成成功',
        data: result.questions,
        supervision_info: {
          generation_attempts: result.generationAttempts,
          supervision_summary: result.supervisionSummary,
          audit_results: result.auditResults
        },
        debug_info: {
          topic_id: topic_id,
          topic_name: topic.name,
          chapter_name: topic.chapter?.name,
          all_topics: topicNames,
          question_count: Number(question_count),
          max_retries: Number(max_retries)
        }
      })

    } catch (error: any) {
      console.error('🔄 [SUPERVISED-ASSESSMENT-DEBUG] 监督式测评生成失败:', error)
      
      res.status(500).json({ 
        message: '监督式测评生成失败',
        error: error.message,
        error_stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  }

  /**
   * 获取API配置信息
   */
  static async getApiInfo(req: Request, res: Response) {
    try {
      console.log('🔧 [DEBUG] 获取API配置信息')
      
      // 测试DeepSeek API状态
      let deepseekStatus: any
      try {
        deepseekStatus = await DeepSeekService.getApiStatus()
      } catch (error: any) {
        deepseekStatus = {
          status: 'error',
          message: `DeepSeek API测试失败: ${error.message}`
        }
      }

      const info = {
        kimi_api_configured: !!process.env.KIMI_API_KEY,
        kimi_base_url: process.env.KIMI_BASE_URL,
        kimi_api_key_preview: process.env.KIMI_API_KEY 
          ? `${process.env.KIMI_API_KEY.substring(0, 10)}...` 
          : '未配置',
        deepseek_api_configured: !!process.env.DEEPSEEK_API_KEY,
        deepseek_base_url: process.env.DEEPSEEK_BASE_URL,
        deepseek_api_key_preview: process.env.DEEPSEEK_API_KEY 
          ? `${process.env.DEEPSEEK_API_KEY.substring(0, 10)}...` 
          : '未配置',
        deepseek_status: deepseekStatus,
        node_env: process.env.NODE_ENV,
        server_time: new Date().toISOString()
      }

      console.log('🔧 [DEBUG] API配置信息:', info)

      res.json({
        message: '获取配置信息成功',
        data: info
      })

    } catch (error: any) {
      console.error('🔧 [DEBUG] 获取配置信息失败:', error)
      res.status(500).json({ 
        message: '获取配置信息失败',
        error: error.message
      })
    }
  }
}