import { KimiService } from '../services/KimiService'

async function testFix() {
  try {
    console.log('🧪 测试修复后的Kimi API...')
    
    const questions = await KimiService.generatePracticeQuestions(
      '三角函数的定义',
      '基础',
      2
    )
    
    console.log('✅ 测试成功，生成题目数量:', questions.length)
    console.log('📝 生成的题目:', JSON.stringify(questions, null, 2))
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

testFix()