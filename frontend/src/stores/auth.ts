import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { User, LoginForm, RegisterForm } from '@/types'
import { authApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userGrade = computed(() => user.value?.grade)
  const userName = computed(() => user.value?.name)

  // 设置认证信息
  function setAuth(userData: User, authToken: string) {
    user.value = userData
    token.value = authToken
    localStorage.setItem('token', authToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  // 清除认证信息
  function clearAuth() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // 从本地存储恢复用户信息
  function restoreAuth() {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
      } catch (error) {
        console.error('恢复用户信息失败:', error)
        clearAuth()
      }
    }
  }

  // 登录
  async function login(loginForm: LoginForm) {
    loading.value = true
    try {
      const response = await authApi.login(loginForm)
      setAuth(response.user!, response.token!)
      return response
    } finally {
      loading.value = false
    }
  }

  // 注册
  async function register(registerForm: RegisterForm) {
    loading.value = true
    try {
      const response = await authApi.register(registerForm)
      setAuth(response.user!, response.token!)
      return response
    } finally {
      loading.value = false
    }
  }

  // 登出
  function logout() {
    clearAuth()
    // 跳转到登录页面
    window.location.href = '/auth/login'
  }

  // 获取用户信息
  async function fetchProfile() {
    if (!token.value) return
    
    try {
      const response = await authApi.getProfile()
      user.value = response.user!
      localStorage.setItem('user', JSON.stringify(response.user))
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 如果获取失败，可能是token过期，清除认证信息
      clearAuth()
      throw error
    }
  }

  // 更新用户信息
  async function updateProfile(updateData: Partial<User>) {
    loading.value = true
    try {
      const response = await authApi.updateProfile(updateData)
      user.value = response.user!
      localStorage.setItem('user', JSON.stringify(response.user))
      return response
    } finally {
      loading.value = false
    }
  }

  // 修改密码
  async function changePassword(oldPassword: string, newPassword: string) {
    loading.value = true
    try {
      const response = await authApi.changePassword(oldPassword, newPassword)
      return response
    } finally {
      loading.value = false
    }
  }

  // 初始化时恢复认证状态
  restoreAuth()

  return {
    // 状态
    user: readonly(user),
    token: readonly(token),
    loading: readonly(loading),
    
    // 计算属性
    isAuthenticated,
    userGrade,
    userName,
    
    // 方法
    login,
    register,
    logout,
    fetchProfile,
    updateProfile,
    changePassword,
    setAuth,
    clearAuth,
    restoreAuth
  }
})