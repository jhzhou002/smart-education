import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  HasMany
} from 'sequelize-typescript'
import { Topic } from './Topic'
import { Assessment } from './Assessment'
import { LearningTask } from './LearningTask'
import { LearningProgress } from './LearningProgress'

@Table({
  tableName: 'chapters',
  timestamps: true,
  updatedAt: false
})
export class Chapter extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number

  @Column({
    type: DataType.STRING(100),
    allowNull: false
  })
  name!: string

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  description?: string

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  order_index!: number

  @Column({
    type: DataType.ENUM('高一', '高二', '高三'),
    allowNull: false
  })
  grade!: '高一' | '高二' | '高三'

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  is_active!: boolean

  @CreatedAt
  created_at!: Date

  // 关联关系
  @HasMany(() => Topic)
  topics!: Topic[]

  @HasMany(() => Assessment)
  assessments!: Assessment[]

  @HasMany(() => LearningTask)
  learning_tasks!: LearningTask[]

  @HasMany(() => LearningProgress)
  learning_progress!: LearningProgress[]
}