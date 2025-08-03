import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'
import { validate, registerSchema, loginSchema } from '../middleware/validation'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// 用户注册
router.post('/register', validate(registerSchema), AuthController.register)

// 用户登录
router.post('/login', validate(loginSchema), AuthController.login)

// 获取当前用户信息 (需要认证)
router.get('/profile', authenticateToken, AuthController.profile)

// 更新用户信息 (需要认证)
router.put('/profile', authenticateToken, AuthController.updateProfile)

// 修改密码 (需要认证)
router.put('/change-password', authenticateToken, AuthController.changePassword)

export default router