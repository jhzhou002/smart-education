import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  BelongsTo,
  ForeignKey,
  HasMany
} from 'sequelize-typescript'
import { User } from './User'
import { Chapter } from './Chapter'
import { AssessmentQuestion } from './AssessmentQuestion'

@Table({
  tableName: 'assessments',
  timestamps: true,
  updatedAt: false
})
export class Assessment extends Model {
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

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  total_questions!: number

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  correct_answers!: number

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: false
  })
  score!: number

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: '测试耗时（秒）'
  })
  time_spent!: number

  @CreatedAt
  completed_at!: Date

  // 关联关系
  @BelongsTo(() => User)
  user!: User

  @BelongsTo(() => Chapter)
  chapter!: Chapter

  @HasMany(() => AssessmentQuestion)
  questions!: AssessmentQuestion[]
}