<template>
  <div class="settings-view">
    <div class="container">
      <div class="settings-content">
        <el-card class="password-settings">
          <template #header>
            <h3>修改密码</h3>
          </template>
          
          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-width="100px"
            size="large"
          >
            <el-form-item label="当前密码" prop="oldPassword">
              <el-input
                v-model="passwordForm.oldPassword"
                type="password"
                show-password
                placeholder="请输入当前密码"
              />
            </el-form-item>
            
            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordForm.newPassword"
                type="password"
                show-password
                placeholder="请输入新密码"
              />
            </el-form-item>
            
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                show-password
                placeholder="请再次输入新密码"
              />
            </el-form-item>
            
            <el-form-item>
              <el-button type="primary" @click="changePassword" :loading="changingPassword">
                修改密码
              </el-button>
              <el-button @click="resetPasswordForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
        
        <el-card class="notification-settings">
          <template #header>
            <h3>通知设置</h3>
          </template>
          
          <div class="settings-list">
            <div class="setting-item">
              <div class="setting-info">
                <h4>学习提醒</h4>
                <p>接收学习计划和任务提醒</p>
              </div>
              <el-switch v-model="notificationSettings.learningReminder" />
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>错题推送</h4>
                <p>定期推送错题复习提醒</p>
              </div>
              <el-switch v-model="notificationSettings.mistakeReview" />
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>成绩报告</h4>
                <p>接收学习进度和成绩分析报告</p>
              </div>
              <el-switch v-model="notificationSettings.progressReport" />
            </div>
          </div>
          
          <div class="settings-actions">
            <el-button type="primary" @click="saveNotificationSettings">
              保存设置
            </el-button>
          </div>
        </el-card>
        
        <el-card class="privacy-settings">
          <template #header>
            <h3>隐私设置</h3>
          </template>
          
          <div class="settings-list">
            <div class="setting-item">
              <div class="setting-info">
                <h4>学习数据分析</h4>
                <p>允许系统分析学习数据以提供个性化建议</p>
              </div>
              <el-switch v-model="privacySettings.dataAnalysis" />
            </div>
            
            <div class="setting-item">
              <div class="setting-info">
                <h4>排行榜显示</h4>
                <p>在班级排行榜中显示我的成绩</p>
              </div>
              <el-switch v-model="privacySettings.leaderboard" />
            </div>
          </div>
          
          <div class="settings-actions">
            <el-button type="primary" @click="savePrivacySettings">
              保存设置
            </el-button>
          </div>
        </el-card>
        
        <el-card class="danger-zone">
          <template #header>
            <h3 style="color: #f56c6c">危险操作</h3>
          </template>
          
          <div class="danger-actions">
            <div class="danger-item">
              <div class="danger-info">
                <h4>清除学习数据</h4>
                <p>清除所有学习记录和进度数据，此操作不可恢复</p>
              </div>
              <el-button type="danger" @click="clearLearningData">
                清除数据
              </el-button>
            </div>
            
            <div class="danger-item">
              <div class="danger-info">
                <h4>注销账户</h4>
                <p>永久删除账户和所有相关数据，此操作不可恢复</p>
              </div>
              <el-button type="danger" @click="deleteAccount">
                注销账户
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const passwordFormRef = ref<FormInstance>()
const changingPassword = ref(false)

// 密码修改表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 通知设置
const notificationSettings = reactive({
  learningReminder: true,
  mistakeReview: true,
  progressReport: false
})

// 隐私设置
const privacySettings = reactive({
  dataAnalysis: true,
  leaderboard: false
})

// 确认密码验证
const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

// 密码表单验证规则
const passwordRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 修改密码
const changePassword = async () => {
  if (!passwordFormRef.value) return
  
  const valid = await passwordFormRef.value.validate().catch(() => false)
  if (!valid) return
  
  changingPassword.value = true
  try {
    await authStore.changePassword(passwordForm.oldPassword, passwordForm.newPassword)
    ElMessage.success('密码修改成功')
    resetPasswordForm()
  } catch (error: any) {
    ElMessage.error(error.response?.data?.message || '密码修改失败')
  } finally {
    changingPassword.value = false
  }
}

// 重置密码表单
const resetPasswordForm = () => {
  Object.assign(passwordForm, {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  passwordFormRef.value?.clearValidate()
}

// 保存通知设置
const saveNotificationSettings = () => {
  ElMessage.success('通知设置已保存')
  // TODO: 调用API保存设置
}

// 保存隐私设置
const savePrivacySettings = () => {
  ElMessage.success('隐私设置已保存')
  // TODO: 调用API保存设置
}

// 清除学习数据
const clearLearningData = async () => {
  try {
    await ElMessageBox.confirm(
      '此操作将清除所有学习记录和进度数据，且不可恢复。确定要继续吗？',
      '危险操作',
      {
        confirmButtonText: '确定清除',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    // TODO: 调用API清除数据
    ElMessage.success('学习数据已清除')
  } catch {
    // 用户取消
  }
}

// 注销账户
const deleteAccount = async () => {
  try {
    await ElMessageBox.confirm(
      '此操作将永久删除您的账户和所有相关数据，且不可恢复。确定要继续吗？',
      '危险操作',
      {
        confirmButtonText: '确定注销',
        cancelButtonText: '取消',
        type: 'error',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    // TODO: 调用API注销账户
    ElMessage.success('账户注销成功')
    authStore.logout()
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.settings-view {
  padding: 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.settings-content {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.password-settings h3,
.notification-settings h3,
.privacy-settings h3 {
  margin: 0;
  color: #303133;
}

.settings-list {
  margin-top: 16px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info h4 {
  margin: 0 0 4px 0;
  color: #303133;
}

.setting-info p {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.settings-actions {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.danger-zone {
  border: 1px solid #f56c6c;
}

.danger-actions {
  margin-top: 16px;
}

.danger-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
}

.danger-item:last-child {
  border-bottom: none;
}

.danger-info h4 {
  margin: 0 0 4px 0;
  color: #f56c6c;
}

.danger-info p {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}
</style>