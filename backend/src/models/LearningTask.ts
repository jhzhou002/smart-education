import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  BelongsTo,
  ForeignKey
} from 'sequelize-typescript'
import { LearningPlan } from './LearningPlan'
import { Chapter } from './Chapter'
import { Topic } from './Topic'

@Table({
  tableName: 'learning_tasks',
  timestamps: true,
  updatedAt: false
})
export class LearningTask extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number

  @ForeignKey(() => LearningPlan)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  plan_id!: number

  @ForeignKey(() => Chapter)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  chapter_id!: number

  @ForeignKey(() => Topic)
  @Column({
    type: DataType.INTEGER,
    allowNull: true
  })
  topic_id?: number

  @Column({
    type: DataType.STRING(200),
    allowNull: false
  })
  title!: string

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  description?: string

  @Column({
    type: DataType.DATEONLY,
    allowNull: false
  })
  target_date!: Date

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    comment: '预计完成时间（分钟）'
  })
  estimated_time?: number

  @Column({
    type: DataType.ENUM('pending', 'in_progress', 'completed'),
    defaultValue: 'pending'
  })
  status!: 'pending' | 'in_progress' | 'completed'

  @Column({
    type: DataType.ENUM('low', 'medium', 'high'),
    defaultValue: 'medium'
  })
  priority!: 'low' | 'medium' | 'high'

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  completed_at?: Date

  @CreatedAt
  created_at!: Date

  // 关联关系
  @BelongsTo(() => LearningPlan)
  plan!: LearningPlan

  @BelongsTo(() => Chapter)
  chapter!: Chapter

  @BelongsTo(() => Topic)
  topic!: Topic
}