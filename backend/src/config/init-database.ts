import sequelize from './database'
import {
  User,
  Chapter,
  Topic,
  Assessment,
  AssessmentQuestion,
  LearningPlan,
  LearningTask,
  PracticeQuestion,
  PracticeRecord,
  LearningProgress
} from '../models'

export async function initDatabase() {
  try {
    // 测试数据库连接
    await sequelize.authenticate()
    console.log('数据库连接成功')

    // 同步所有模型到数据库
    await sequelize.sync({ force: false })
    console.log('数据库表同步完成')

    // 初始化基础数据
    await initBaseData()
    console.log('基础数据初始化完成')

  } catch (error) {
    console.error('数据库初始化失败:', error)
    throw error
  }
}

async function initBaseData() {
  // 检查是否已有章节数据
  const chapterCount = await Chapter.count()
  if (chapterCount > 0) {
    console.log('基础数据已存在，跳过初始化')
    return
  }

  // 初始化章节数据
  const chapters = [
    {
      name: '集合与函数概念',
      description: '学习集合的基本概念和函数的定义、性质',
      order_index: 1,
      grade: '高一' as const,
      is_active: true
    },
    {
      name: '三角函数',
      description: '学习三角函数的定义、图象和性质',
      order_index: 2,
      grade: '高一' as const,
      is_active: true
    },
    {
      name: '数列',
      description: '学习数列的概念、等差数列和等比数列',
      order_index: 3,
      grade: '高二' as const,
      is_active: true
    },
    {
      name: '立体几何',
      description: '学习空间几何体的结构、位置关系',
      order_index: 4,
      grade: '高二' as const,
      is_active: true
    },
    {
      name: '导数及其应用',
      description: '学习导数的概念、计算和应用',
      order_index: 5,
      grade: '高三' as const,
      is_active: true
    }
  ]

  const createdChapters = await Chapter.bulkCreate(chapters)

  // 初始化知识点数据
  const topics = [
    // 集合与函数概念
    {
      chapter_id: createdChapters[0].id,
      name: '集合的概念与运算',
      description: '集合的定义、表示方法和基本运算',
      difficulty: '基础' as const,
      order_index: 1,
      is_active: true
    },
    {
      chapter_id: createdChapters[0].id,
      name: '函数的概念',
      description: '函数的定义、定义域、值域',
      difficulty: '基础' as const,
      order_index: 2,
      is_active: true
    },
    {
      chapter_id: createdChapters[0].id,
      name: '函数的性质',
      description: '函数的单调性、奇偶性、周期性',
      difficulty: '中等' as const,
      order_index: 3,
      is_active: true
    },
    
    // 三角函数
    {
      chapter_id: createdChapters[1].id,
      name: '三角函数的定义',
      description: '正弦、余弦、正切函数的定义',
      difficulty: '基础' as const,
      order_index: 1,
      is_active: true
    },
    {
      chapter_id: createdChapters[1].id,
      name: '三角函数的图象',
      description: '三角函数的图象和变换',
      difficulty: '中等' as const,
      order_index: 2,
      is_active: true
    },
    {
      chapter_id: createdChapters[1].id,
      name: '三角恒等变换',
      description: '三角函数的恒等变换公式',
      difficulty: '困难' as const,
      order_index: 3,
      is_active: true
    },

    // 数列
    {
      chapter_id: createdChapters[2].id,
      name: '数列的概念',
      description: '数列的定义和通项公式',
      difficulty: '基础' as const,
      order_index: 1,
      is_active: true
    },
    {
      chapter_id: createdChapters[2].id,
      name: '等差数列',
      description: '等差数列的性质和求和公式',
      difficulty: '中等' as const,
      order_index: 2,
      is_active: true
    },
    {
      chapter_id: createdChapters[2].id,
      name: '等比数列',
      description: '等比数列的性质和求和公式',
      difficulty: '中等' as const,
      order_index: 3,
      is_active: true
    }
  ]

  await Topic.bulkCreate(topics)
  console.log('基础章节和知识点数据初始化完成')
}