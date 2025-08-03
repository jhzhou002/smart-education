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
import { Topic } from './Topic'
import { PracticeRecord } from './PracticeRecord'

@Table({
  tableName: 'practice_questions',
  timestamps: true,
  updatedAt: false
})
export class PracticeQuestion extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number

  @ForeignKey(() => Topic)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  topic_id!: number

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
    type: DataType.ENUM('基础', '中等', '困难'),
    allowNull: false
  })
  difficulty!: '基础' | '中等' | '困难'

  @Column({
    type: DataType.JSON,
    allowNull: true
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
  solution?: string

  @Column({
    type: DataType.STRING(100),
    allowNull: true
  })
  kimi_question_id?: string

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0
  })
  usage_count!: number

  @Column({
    type: DataType.DECIMAL(5, 2),
    defaultValue: 0
  })
  correct_rate!: number

  @CreatedAt
  created_at!: Date

  // 关联关系
  @BelongsTo(() => Topic)
  topic!: Topic

  @HasMany(() => PracticeRecord)
  practice_records!: PracticeRecord[]
}