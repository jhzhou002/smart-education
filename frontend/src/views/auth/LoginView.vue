<template>
  <div class="login-view">
    <el-form
      ref="loginFormRef"
      :model="loginForm"
      :rules="loginRules"
      label-width="0"
      size="large"
    >
      <h2 class="form-title">登录</h2>
      
      <el-form-item prop="email">
        <el-input
          v-model="loginForm.email"
          placeholder="邮箱"
          prefix-icon="Message"
          type="email"
        />
      </el-form-item>
      
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          placeholder="密码"
          prefix-icon="Lock"
          type="password"
          show-password
        />
      </el-form-item>
      
      <el-form-item>
        <el-button
          type="primary"
          size="large"
          :loading="authStore.loading"
          @click="handleLogin"
          style="width: 100%"
        >
          登录
        </el-button>
      </el-form-item>
      
      <div class="form-links">
        <router-link to="/auth/register" class="link">
          还没有账号？立即注册
        </router-link>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import type { LoginForm } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 表单数据
const loginForm = reactive<LoginForm>({
  email: '',
  password: ''
})

// 表单验证规则
const loginRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  const valid = await loginFormRef.value.validate().catch(() => false)
  if (!valid) return
  
  try {
    await authStore.login(loginForm)
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '登录失败')
  }
}
</script>

<style scoped>
.login-view {
  width: 100%;
}

.form-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #1a202c;
  font-weight: 600;
}

.form-links {
  text-align: center;
  margin-top: 1rem;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.875rem;
}

.link:hover {
  text-decoration: underline;
}

:deep(.el-form-item) {
  margin-bottom: 1.5rem;
}

:deep(.el-input__inner) {
  height: 44px;
}
</style>