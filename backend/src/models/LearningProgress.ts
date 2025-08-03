import {
  Table,
  Column,
  Model,
  DataType,
  UpdatedAt,
  BelongsTo,
  ForeignKey
} from 'sequelize-typescript'
import { User } from './User'
import { Chapter } from './Chapter'
import { Topic } from './Topic'

@Table({
  tableName: 'learning_progress',
  timestamps: false,
  updatedAt: 'updated_at'
})
export class LearningProgress extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  user_id!: number

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
    type: DataType.DECIMAL(5, 2),
    defaultValue: 0,
    comment: '掌握程度 0-100'
  })
  mastery_level!: number

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  practice_count!: number

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  correct_count!: number

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  last_practice?: Date

  @Column({
    type: DataType.JSON,
    allowNull: true,
    comment: '薄弱知识点'
  })
  weak_points?: any

  @UpdatedAt
  updated_at!: Date

  // 关联关系
  @BelongsTo(() => User)
  user!: User

  @BelongsTo(() => Chapter)
  chapter!: Chapter

  @BelongsTo(() => Topic)
  topic!: Topic
}