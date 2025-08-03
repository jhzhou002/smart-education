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
import { Chapter } from './Chapter'
import { LearningTask } from './LearningTask'
import { PracticeQuestion } from './PracticeQuestion'
import { LearningProgress } from './LearningProgress'

@Table({
  tableName: 'topics',
  timestamps: true,
  updatedAt: false
})
export class Topic extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number

  @ForeignKey(() => Chapter)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  chapter_id!: number

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
    type: DataType.ENUM('基础', '中等', '困难'),
    allowNull: false
  })
  difficulty!: '基础' | '中等' | '困难'

  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  order_index!: number

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true
  })
  is_active!: boolean

  @CreatedAt
  created_at!: Date

  // 关联关系
  @BelongsTo(() => Chapter)
  chapter!: Chapter

  @HasMany(() => LearningTask)
  learning_tasks!: LearningTask[]

  @HasMany(() => PracticeQuestion)
  practice_questions!: PracticeQuestion[]

  @HasMany(() => LearningProgress)
  learning_progress!: LearningProgress[]
}