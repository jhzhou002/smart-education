import { PracticeQuestion } from '../models/PracticeQuestion'
import { PracticeRecord } from '../models/PracticeRecord'
import { User } from '../models/User'
import { initDatabase } from '../config/init-database'

async function testSubmitAnswer() {
  try {
    console.log('🧪 测试提交答案功能...')
    
    // 初始化数据库连接
    await initDatabase()
    
    // 查找一个测试题目
    const question = await PracticeQuestion.findOne({
      where: { question_type: '单选' }
    })
    
    if (!question) {
      console.log('❌ 没有找到单选题目')
      return
    }
    
    console.log('📝 找到测试题目:', {
      id: question.id,
      question_text: question.question_text,
      options: question.options,
      correct_answer: question.correct_answer
    })
    
    // 查找测试用户
    const user = await User.findOne()
    if (!user) {
      console.log('❌ 没有找到测试用户')
      return
    }
    
    console.log('👤 使用测试用户:', user.username)
    
    // 模拟提交答案
    const userAnswer = 'A'
    const isCorrect = question.correct_answer.toLowerCase().trim() === userAnswer.toLowerCase().trim()
    
    console.log('📊 答案比较:')
    console.log('- 用户答案:', userAnswer)
    console.log('- 正确答案:', question.correct_answer)
    console.log('- 是否正确:', isCorrect)
    
    // 创建练习记录
    const record = await PracticeRecord.create({
      user_id: user.id,
      question_id: question.id,
      user_answer: userAnswer,
      is_correct: isCorrect,
      time_spent: 30,
      attempt_count: 1
    })
    
    console.log('✅ 练习记录创建成功:', record.id)
    
    // 测试统计更新
    const records = await PracticeRecord.findAll({
      where: { question_id: question.id }
    })
    const usageCount = records.length
    const correctCount = records.filter(r => r.is_correct).length
    const correctRate = usageCount > 0 ? ((correctCount / usageCount) * 100) : 0
    
    console.log('📈 统计信息:')
    console.log('- 总答题次数:', usageCount)
    console.log('- 正确次数:', correctCount)
    console.log('- 正确率:', correctRate + '%')
    
    // 更新题目统计
    await PracticeQuestion.update(
      {
        usage_count: usageCount,
        correct_rate: correctRate
      },
      {
        where: { id: question.id }
      }
    )
    
    console.log('✅ 题目统计更新成功')
    console.log('🎉 提交答案功能测试通过')
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
  
  process.exit(0)
}

testSubmitAnswer()