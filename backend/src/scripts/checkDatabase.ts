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

async function checkTables() {
  try {
    console.log('🔍 检查数据库表结构...')
    
    // 检查practice_records表
    const [practiceRecords] = await sequelize.query(`
      DESCRIBE practice_records
    `)
    console.log('📋 practice_records表结构:')
    console.table(practiceRecords)
    
    // 检查practice_questions表中的options字段样例
    const [sampleQuestions] = await sequelize.query(`
      SELECT id, question_text, question_type, options, correct_answer 
      FROM practice_questions 
      LIMIT 3
    `)
    console.log('📝 practice_questions样例数据:')
    console.table(sampleQuestions)
    
    // 检查是否有练习记录
    const [recordCount] = await sequelize.query(`
      SELECT COUNT(*) as count FROM practice_records
    `)
    console.log('📊 practice_records数据量:', recordCount)
    
  } catch (error) {
    console.error('❌ 检查失败:', error)
  } finally {
    await sequelize.close()
  }
}

checkTables()