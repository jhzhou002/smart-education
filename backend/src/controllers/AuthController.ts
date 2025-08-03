import { Request, Response } from 'express'
import { User } from '../models/User'
import { generateToken } from '../utils/jwt'

export class AuthController {
  // 用户注册
  static async register(req: Request, res: Response) {
    try {
      const { username, email, password, name, phone, school, grade } = req.body

      // 检查用户是否已存在
      const existingUser = await User.findOne({
        where: {
          [require('sequelize').Op.or]: [
            { email },
            { username }
          ]
        }
      })

      if (existingUser) {
        return res.status(400).json({ 
          message: existingUser.email === email ? '邮箱已被注册' : '用户名已被使用' 
        })
      }

      // 创建新用户
      const user = await User.create({
        username,
        email,
        password_hash: password, // 将在模型的钩子中自动加密
        name,
        phone,
        school,
        grade
      })

      // 生成JWT令牌
      const token = generateToken({
        userId: user.id,
        email: user.email,
        username: user.username
      })

      res.status(201).json({
        message: '注册成功',
        user: user.toJSON(),
        token
      })
    } catch (error) {
      console.error('注册失败:', error)
      res.status(500).json({ message: '注册失败，请稍后重试' })
    }
  }

  // 用户登录
  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body

      // 查找用户
      const user = await User.findOne({ where: { email } })
      if (!user) {
        return res.status(401).json({ message: '邮箱或密码错误' })
      }

      // 验证密码
      const isPasswordValid = await user.validatePassword(password)
      if (!isPasswordValid) {
        return res.status(401).json({ message: '邮箱或密码错误' })
      }

      // 检查用户状态
      if (user.status !== 'active') {
        return res.status(403).json({ message: '账户已被禁用' })
      }

      // 更新最后登录时间
      await user.update({ last_login: new Date() })

      // 生成JWT令牌
      const token = generateToken({
        userId: user.id,
        email: user.email,
        username: user.username
      })

      res.json({
        message: '登录成功',
        user: user.toJSON(),
        token
      })
    } catch (error) {
      console.error('登录失败:', error)
      res.status(500).json({ message: '登录失败，请稍后重试' })
    }
  }

  // 获取当前用户信息
  static async profile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: '用户未认证' })
      }

      const user = await User.findByPk(userId)
      if (!user) {
        return res.status(404).json({ message: '用户不存在' })
      }

      res.json({
        message: '获取用户信息成功',
        user: user.toJSON()
      })
    } catch (error) {
      console.error('获取用户信息失败:', error)
      res.status(500).json({ message: '获取用户信息失败' })
    }
  }

  // 更新用户信息
  static async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: '用户未认证' })
      }

      const { name, phone, school, grade, avatar_url } = req.body
      
      const user = await User.findByPk(userId)
      if (!user) {
        return res.status(404).json({ message: '用户不存在' })
      }

      await user.update({
        name: name || user.name,
        phone: phone || user.phone,
        school: school || user.school,
        grade: grade || user.grade,
        avatar_url: avatar_url || user.avatar_url
      })

      res.json({
        message: '更新用户信息成功',
        user: user.toJSON()
      })
    } catch (error) {
      console.error('更新用户信息失败:', error)
      res.status(500).json({ message: '更新用户信息失败' })
    }
  }

  // 修改密码
  static async changePassword(req: Request, res: Response) {
    try {
      const userId = req.user?.userId
      if (!userId) {
        return res.status(401).json({ message: '用户未认证' })
      }

      const { oldPassword, newPassword } = req.body

      const user = await User.findByPk(userId)
      if (!user) {
        return res.status(404).json({ message: '用户不存在' })
      }

      // 验证旧密码
      const isOldPasswordValid = await user.validatePassword(oldPassword)
      if (!isOldPasswordValid) {
        return res.status(400).json({ message: '原密码错误' })
      }

      // 更新密码
      await user.update({ password_hash: newPassword })

      res.json({ message: '密码修改成功' })
    } catch (error) {
      console.error('修改密码失败:', error)
      res.status(500).json({ message: '修改密码失败' })
    }
  }
}