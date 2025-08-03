import { Sequelize } from 'sequelize-typescript'
import { config } from 'dotenv'
import { User } from '../models/User'
import { Chapter } from '../models/Chapter'
import { Topic } from '../models/Topic'
import { Assessment } from '../models/Assessment'
import { AssessmentQuestion } from '../models/AssessmentQuestion'
import { LearningPlan } from '../models/LearningPlan'
import { LearningTask } from '../models/LearningTask'
import { PracticeQuestion } from '../models/PracticeQuestion'
import { PracticeRecord } from '../models/PracticeRecord'
import { LearningProgress } from '../models/LearningProgress'

config()

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || '8.153.77.15',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'connect',
  password: process.env.DB_PASSWORD || 'Zhjh0704.',
  database: process.env.DB_NAME || 'smart_education',
  timezone: '+08:00',
  models: [
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
  ],
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
})

export default sequelize