import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  BelongsTo,
  ForeignKey
} from 'sequelize-typescript'
import { Assessment } from './Assessment'

@Table({
  tableName: 'assessment_questions',
  timestamps: true,
  updatedAt: false
})
export class AssessmentQuestion extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number

  @ForeignKey(() => Assessment)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  assessment_id!: number

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  question_text!: string

  @Column({
    type: DataType.ENUM('单选', '多选', '填空', '解答'),
    allowNull: false
  })
  question_type!: '单选' | '多选' | '填空' | '解答'

  @Column({
    type: DataType.JSON,
    allowNull: true,
    comment: '选择题选项'
  })
  options?: any

  @Column({
    type: DataType.TEXT,
    allowNull: false
  })
  correct_answer!: string

  @Column({
    type: DataType.TEXT,
    allowNull: true
  })
  user_answer?: string

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false
  })
  is_correct!: boolean

  @Column({
    type: DataType.STRING(100),
    allowNull: true
  })
  kimi_question_id?: string

  @CreatedAt
  created_at!: Date

  // 关联关系
  @BelongsTo(() => Assessment)
  assessment!: Assessment
}