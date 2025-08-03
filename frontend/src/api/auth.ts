import request from './request'
import type { ApiResponse, User, LoginForm, RegisterForm } from '@/types'

export const authApi = {
  // 用户登录
  login(data: LoginForm): Promise<ApiResponse<{ user: User; token: string }>> {
    return request.post('/auth/login', data)
  },

  // 用户注册
  register(data: RegisterForm): Promise<ApiResponse<{ user: User; token: string }>> {
    return request.post('/auth/register', data)
  },

  // 获取当前用户信息
  getProfile(): Promise<ApiResponse<{ user: User }>> {
    return request.get('/auth/profile')
  },

  // 更新用户信息
  updateProfile(data: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return request.put('/auth/profile', data)
  },

  // 修改密码
  changePassword(oldPassword: string, newPassword: string): Promise<ApiResponse> {
    return request.put('/auth/change-password', {
      oldPassword,
      newPassword
    })
  }
}