import sequelize from '../config/database'
import {
  PracticeQuestion,
  PracticeRecord,
  Assessment,
  AssessmentQuestion,
  LearningPlan,
  LearningTask,
  LearningProgress
} from '../models'

async function cleanTestData() {
  try {
    console.log('开始清理测试数据...')

    // 清理练习相关数据
    await PracticeRecord.destroy({ where: {} })
    console.log('✅ 清理练习记录')

    await PracticeQuestion.destroy({ where: {} })
    console.log('✅ 清理练习题目')

    // 清理测评相关数据
    await AssessmentQuestion.destroy({ where: {} })
    console.log('✅ 清理测评题目')

    await Assessment.destroy({ where: {} })
    console.log('✅ 清理测评记录')

    // 清理学习计划相关数据
    await LearningTask.destroy({ where: {} })
    console.log('✅ 清理学习任务')

    await LearningPlan.destroy({ where: {} })
    console.log('✅ 清理学习计划')

    await LearningProgress.destroy({ where: {} })
    console.log('✅ 清理学习进度')

    console.log('🎉 测试数据清理完成!')
    console.log('现在所有题目将由AI实时生成')

  } catch (error) {
    console.error('清理测试数据失败:', error)
  } finally {
    await sequelize.close()
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  cleanTestData()
}

export { cleanTestData }