import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  BelongsTo,
  ForeignKey
} from 'sequelize-typescript'
import { User } from './User'
import { PracticeQuestion } from './PracticeQuestion'

@Table({
  tableName: 'practice_records',
  timestamps: true,
  updatedAt: false
})
export class PracticeRecord extends Model {
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

  @ForeignKey(() => PracticeQuestion)
  @Column({
    type: DataType.INTEGER,
    allowNull: false
  })
  question_id!: number

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
    type: DataType.INTEGER,
    allowNull: true,
    comment: '答题耗时（秒）'
  })
  time_spent?: number

  @Column({
    type: DataType.INTEGER,
    defaultValue: 1
  })
  attempt_count!: number

  @CreatedAt
  created_at!: Date

  // 关联关系
  @BelongsTo(() => User)
  user!: User

  @BelongsTo(() => PracticeQuestion)
  question!: PracticeQuestion
}