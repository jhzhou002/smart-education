import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  BelongsTo,
  ForeignKey,
  HasMany
} from 'sequelize-typescript'
import { User } from './User'
import { LearningTask } from './LearningTask'

@Table({
  tableName: 'learning_plans',
  timestamps: true
})
export class LearningPlan extends Model {
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
  start_date!: Date

  @Column({
    type: DataType.DATEONLY,
    allowNull: false
  })
  end_date!: Date

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: true
  })
  target_score?: number

  @Column({
    type: DataType.ENUM('active', 'completed', 'paused'),
    defaultValue: 'active'
  })
  status!: 'active' | 'completed' | 'paused'

  @CreatedAt
  created_at!: Date

  @UpdatedAt
  updated_at!: Date

  // 关联关系
  @BelongsTo(() => User)
  user!: User

  @HasMany(() => LearningTask)
  tasks!: LearningTask[]
}