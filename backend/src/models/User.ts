import {
  Table,
  Column,
  Model,
  DataType,
  CreatedAt,
  UpdatedAt,
  HasMany,
  BeforeCreate,
  BeforeUpdate
} from 'sequelize-typescript'
import bcrypt from 'bcryptjs'
import { Assessment } from './Assessment'
import { LearningPlan } from './LearningPlan'
import { PracticeRecord } from './PracticeRecord'
import { LearningProgress } from './LearningProgress'

@Table({
  tableName: 'users',
  timestamps: true
})
export class User extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true
  })
  id!: number

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true
  })
  username!: string

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  })
  email!: string

  @Column({
    type: DataType.STRING(20),
    allowNull: true
  })
  phone?: string

  @Column({
    type: DataType.STRING(255),
    allowNull: false
  })
  password_hash!: string

  @Column({
    type: DataType.STRING(50),
    allowNull: false
  })
  name!: string

  @Column({
    type: DataType.STRING(100),
    allowNull: true
  })
  school?: string

  @Column({
    type: DataType.ENUM('高一', '高二', '高三'),
    allowNull: false
  })
  grade!: '高一' | '高二' | '高三'

  @Column({
    type: DataType.STRING(255),
    allowNull: true
  })
  avatar_url?: string

  @Column({
    type: DataType.DATE,
    allowNull: true
  })
  last_login?: Date

  @Column({
    type: DataType.ENUM('active', 'inactive', 'banned'),
    defaultValue: 'active'
  })
  status!: 'active' | 'inactive' | 'banned'

  @CreatedAt
  created_at!: Date

  @UpdatedAt
  updated_at!: Date

  // 关联关系
  @HasMany(() => Assessment)
  assessments!: Assessment[]

  @HasMany(() => LearningPlan)
  learning_plans!: LearningPlan[]

  @HasMany(() => PracticeRecord)
  practice_records!: PracticeRecord[]

  @HasMany(() => LearningProgress)
  learning_progress!: LearningProgress[]

  // 密码加密钩子
  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    if (instance.changed('password_hash')) {
      const salt = await bcrypt.genSalt(10)
      instance.password_hash = await bcrypt.hash(instance.password_hash, salt)
    }
  }

  // 实例方法
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password_hash)
  }

  toJSON() {
    const values = { ...this.get() }
    delete values.password_hash
    return values
  }
}