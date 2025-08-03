import { Sequelize } from 'sequelize'
import { config } from 'dotenv'

config()

const sequelize = new Sequelize({
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  dialect: 'mysql',
  timezone: '+08:00',
  logging: console.log
})

async function fixAssessmentQuestionsTable() {
  try {
    console.log('开始修复assessment_questions表结构...')
    
    // 检查表是否存在solution字段
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
      AND TABLE_NAME = 'assessment_questions' 
      AND COLUMN_NAME = 'solution'
    `)
    
    if ((results as any[]).length === 0) {
      console.log('添加solution字段...')
      await sequelize.query(`
        ALTER TABLE assessment_questions 
        ADD COLUMN solution TEXT NULL COMMENT '题目解答过程'
      `)
      console.log('✅ solution字段添加成功')
    } else {
      console.log('✅ solution字段已存在')
    }
    
    // 检查difficulty字段
    const [difficultyResults] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
      AND TABLE_NAME = 'assessment_questions' 
      AND COLUMN_NAME = 'difficulty'
    `)
    
    if ((difficultyResults as any[]).length === 0) {
      console.log('添加difficulty字段...')
      await sequelize.query(`
        ALTER TABLE assessment_questions 
        ADD COLUMN difficulty ENUM('基础', '中等', '困难') NOT NULL DEFAULT '基础'
      `)
      console.log('✅ difficulty字段添加成功')
    } else {
      console.log('✅ difficulty字段已存在')
    }
    
    // 检查knowledge_points字段
    const [knowledgeResults] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME}' 
      AND TABLE_NAME = 'assessment_questions' 
      AND COLUMN_NAME = 'knowledge_points'
    `)
    
    if ((knowledgeResults as any[]).length === 0) {
      console.log('添加knowledge_points字段...')
      await sequelize.query(`
        ALTER TABLE assessment_questions 
        ADD COLUMN knowledge_points JSON NULL COMMENT '涉及的知识点'
      `)
      console.log('✅ knowledge_points字段添加成功')
    } else {
      console.log('✅ knowledge_points字段已存在')
    }
    
    console.log('🎉 assessment_questions表结构修复完成')
    
  } catch (error) {
    console.error('修复失败:', error)
  } finally {
    await sequelize.close()
  }
}

fixAssessmentQuestionsTable()