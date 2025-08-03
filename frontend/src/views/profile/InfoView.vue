<template>
  <div class="info-view">
    <div class="container">
      <div class="profile-content">
        <el-card class="profile-card">
          <div class="profile-header">
            <div class="avatar-section">
              <el-avatar :size="80" :src="userInfo?.avatar_url">
                {{ userInfo?.name?.charAt(0) }}
              </el-avatar>
              <el-button size="small" @click="uploadAvatar">更换头像</el-button>
            </div>
            
            <div class="user-basic">
              <h2>{{ userInfo?.name }}</h2>
              <p class="username">@{{ userInfo?.username }}</p>
              <el-tag>{{ userInfo?.grade }}</el-tag>
            </div>
          </div>
          
          <el-divider />
          
          <el-form
            ref="formRef"
            :model="editForm"
            :rules="formRules"
            label-width="100px"
            size="large"
          >
            <el-form-item label="真实姓名" prop="name">
              <el-input v-model="editForm.name" />
            </el-form-item>
            
            <el-form-item label="用户名" prop="username">
              <el-input v-model="editForm.username" disabled />
            </el-form-item>
            
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="editForm.email" disabled />
            </el-form-item>
            
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="editForm.phone" />
            </el-form-item>
            
            <el-form-item label="学校" prop="school">
              <el-input v-model="editForm.school" />
            </el-form-item>
            
            <el-form-item label="年级" prop="grade">
              <el-select v-model="editForm.grade" style="width: 100%">
                <el-option label="高一" value="高一" />
                <el-option label="高二" value="高二" />
                <el-option label="高三" value="高三" />
              </el-select>
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="updateProfile" :loading="updating">
                保存修改
              </el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <el-card class="account-info">
          <template #header>
            <h3>账户信息</h3>
          </template>
          
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">注册时间</span>
              <span class="info-value">{{ formatDate(userInfo?.created_at) }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">最后登录</span>
              <span class="info-value">{{ formatDate(userInfo?.last_login) }}</span>
            </div>
            
            <div class="info-item">
              <span class="info-label">账户状态</span>
              <el-tag :type="userInfo?.status === 'active' ? 'success' : 'danger'">
                {{ getStatusText(userInfo?.status) }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types'

const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const updating = ref(false)
const userInfo = ref<User>()

// 编辑表单
const editForm = reactive({
  name: '',
  username: '',
  email: '',
  phone: '',
  school: '',
  grade: '高一' as '高一' | '高二' | '高三'
})

// 表单验证规则
const formRules: FormRules = {
  name: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度2-50位', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  grade: [
    { required: true, message: '请选择年级', trigger: 'change' }
  ]
}

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '无'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 获取状态文本
const getStatusText = (status?: string) => {
  switch (status) {
    case 'active': return '正常'
    case 'inactive': return '未激活'
    case 'banned': return '已封禁'
    default: return '未知'
  }
}

// 初始化表单数据
const initForm = () => {
  if (authStore.user) {
    userInfo.value = authStore.user
    Object.assign(editForm, {
      name: authStore.user.name,
      username: authStore.user.username,
      email: authStore.user.email,
      phone: authStore.user.phone || '',
      school: authStore.user.school || '',
      grade: authStore.user.grade
    })
  }
}

// 更新个人信息
const updateProfile = async () => {
  if (!formRef.value) return
  
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  
  updating.value = true
  try {
    await authStore.updateProfile({
      name: editForm.name,
      phone: editForm.phone,
      school: editForm.school,
      grade: editForm.grade
    })
    
    userInfo.value = authStore.user
    ElMessage.success('个人信息更新成功')
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '更新失败')
  } finally {
    updating.value = false
  }
}

// 重置表单
const resetForm = () => {
  initForm()
}

// 上传头像
const uploadAvatar = () => {
  ElMessage.info('头像上传功能开发中...')
}

onMounted(() => {
  initForm()
})
</script>

<style scoped>
.info-view {
  padding: 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.profile-content {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.user-basic h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.username {
  margin: 0 0 8px 0;
  color: #909399;
  font-size: 14px;
}

.account-info h3 {
  margin: 0;
  color: #303133;
}

.info-list {
  margin-top: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #606266;
  font-weight: 500;
}

.info-value {
  color: #303133;
}
</style>