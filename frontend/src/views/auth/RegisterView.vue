<template>
  <div class="register-view">
    <el-form
      ref="registerFormRef"
      :model="registerForm"
      :rules="registerRules"
      label-width="0"
      size="large"
    >
      <h2 class="form-title">注册</h2>
      
      <el-form-item prop="username">
        <el-input
          v-model="registerForm.username"
          placeholder="用户名"
          prefix-icon="User"
        />
      </el-form-item>
      
      <el-form-item prop="name">
        <el-input
          v-model="registerForm.name"
          placeholder="真实姓名"
          prefix-icon="UserFilled"
        />
      </el-form-item>
      
      <el-form-item prop="email">
        <el-input
          v-model="registerForm.email"
          placeholder="邮箱"
          prefix-icon="Message"
          type="email"
        />
      </el-form-item>
      
      <el-form-item prop="password">
        <el-input
          v-model="registerForm.password"
          placeholder="密码"
          prefix-icon="Lock"
          type="password"
          show-password
          @input="handlePasswordChange"
        />
      </el-form-item>
      
      <el-form-item prop="confirmPassword">
        <el-input
          v-model="registerForm.confirmPassword"
          placeholder="确认密码"
          prefix-icon="Lock"
          type="password"
          show-password
          @input="() => registerFormRef?.validateField('confirmPassword')"
        />
      </el-form-item>
      
      <el-form-item prop="grade">
        <el-select
          v-model="registerForm.grade"
          placeholder="选择年级"
          style="width: 100%"
        >
          <el-option label="高一" value="高一" />
          <el-option label="高二" value="高二" />
          <el-option label="高三" value="高三" />
        </el-select>
      </el-form-item>
      
      <el-form-item prop="school">
        <el-input
          v-model="registerForm.school"
          placeholder="学校（可选）"
          prefix-icon="School"
        />
      </el-form-item>
      
      <el-form-item prop="phone">
        <el-input
          v-model="registerForm.phone"
          placeholder="手机号（可选）"
          prefix-icon="Phone"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button
          type="primary"
          size="large"
          :loading="authStore.loading"
          @click="handleRegister"
          style="width: 100%"
        >
          注册
        </el-button>
      </el-form-item>
      
      <div class="form-links">
        <router-link to="/auth/login" class="link">
          已有账号？立即登录
        </router-link>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import type { RegisterForm } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

// 表单引用
const registerFormRef = ref<FormInstance>()


// 表单数据
const registerForm = reactive<RegisterForm & { confirmPassword: string }>({
  username: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  grade: '高一',
  school: '',
  phone: ''
})

// 确认密码验证
const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error('请再次输入密码'))
    return
  }
  
  if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
    return
  }
  
  callback()
}

// 监听密码变化，重新验证确认密码
const handlePasswordChange = () => {
  if (registerForm.confirmPassword !== '') {
    registerFormRef.value?.validateField('confirmPassword')
  }
}

// 监听密码变化
watch(() => registerForm.password, () => {
  if (registerForm.confirmPassword !== '') {
    registerFormRef.value?.validateField('confirmPassword')
  }
})

// 表单验证规则
const registerRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 30, message: '用户名长度3-30位', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9]+$/, message: '用户名只能包含字母和数字', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度2-50位', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: ['blur', 'change'] }
  ],
  grade: [
    { required: true, message: '请选择年级', trigger: 'change' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  const valid = await registerFormRef.value.validate().catch(() => false)
  if (!valid) return
  
  try {
    // 过滤掉 confirmPassword 字段，并处理空字符串
    const { confirmPassword, ...registerData } = registerForm
    
    // 处理可选字段，将空字符串转换为undefined
    const cleanedData = {
      ...registerData,
      phone: registerData.phone?.trim() || undefined,
      school: registerData.school?.trim() || undefined
    }
    
    console.log('发送注册数据:', cleanedData)
    await authStore.register(cleanedData as RegisterForm)
    ElMessage.success('注册成功')
    router.push('/dashboard')
  } catch (error: any) {
    console.error('注册失败:', error)
    console.error('错误响应:', error.response?.data)
    ElMessage.error(error.response?.data?.details || error.response?.data?.message || '注册失败')
  }
}
</script>

<style scoped>
.register-view {
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
  margin-bottom: 1.2rem;
}

:deep(.el-input__inner) {
  height: 44px;
}
</style>