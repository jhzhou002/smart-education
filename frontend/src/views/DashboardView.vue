<template>
  <div class="dashboard">
    <!-- 顶部导航 -->
    <el-header class="dashboard-header">
      <div class="header-content">
        <div class="logo">
          <h1>智慧教育</h1>
        </div>
        <div class="user-menu">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :src="authStore.user?.avatar_url" :size="32">
                {{ authStore.userName?.charAt(0) }}
              </el-avatar>
              <span class="username">{{ authStore.userName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="$router.push('/profile/info')">
                  <el-icon><User /></el-icon>
                  个人信息
                </el-dropdown-item>
                <el-dropdown-item @click="$router.push('/profile/settings')">
                  <el-icon><Setting /></el-icon>
                  设置
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <!-- 主要内容区域 -->
    <el-container class="dashboard-container">
      <!-- 侧边导航 -->
      <el-aside class="dashboard-aside" width="240px">
        <el-menu
          :default-active="activeMenu"
          class="dashboard-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="/dashboard">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          
          <el-menu-item index="/assessment/chapters">
            <el-icon><Document /></el-icon>
            <span>基础测试</span>
          </el-menu-item>
          
          <el-menu-item index="/learning/overview">
            <el-icon><Calendar /></el-icon>
            <span>学习计划</span>
          </el-menu-item>
          
          <el-menu-item index="/practice/questions">
            <el-icon><EditPen /></el-icon>
            <span>练习中心</span>
          </el-menu-item>
          
          <el-menu-item index="/progress/overview">
            <el-icon><DataLine /></el-icon>
            <span>学习进度</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="dashboard-main">
        <div class="welcome-section">
          <el-card class="welcome-card">
            <div class="welcome-content">
              <h2>欢迎回来，{{ authStore.userName }}！</h2>
              <p class="welcome-subtitle">继续你的数学学习之旅</p>
              <div class="grade-badge">
                <el-tag type="primary" size="large">{{ authStore.userGrade }}</el-tag>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 快速操作 -->
        <div class="quick-actions">
          <h3>快速开始</h3>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card class="action-card" @click="$router.push('/assessment/chapters')">
                <div class="action-content">
                  <el-icon class="action-icon" color="#409eff"><Document /></el-icon>
                  <h4>基础测试</h4>
                  <p>检测你的数学基础水平</p>
                </div>
              </el-card>
            </el-col>
            
            <el-col :span="8">
              <el-card class="action-card" @click="$router.push('/learning/overview')">
                <div class="action-content">
                  <el-icon class="action-icon" color="#67c23a"><Calendar /></el-icon>
                  <h4>学习计划</h4>
                  <p>查看个性化学习安排</p>
                </div>
              </el-card>
            </el-col>
            
            <el-col :span="8">
              <el-card class="action-card" @click="$router.push('/practice/questions')">
                <div class="action-content">
                  <el-icon class="action-icon" color="#e6a23c"><EditPen /></el-icon>
                  <h4>开始练习</h4>
                  <p>针对性题目练习</p>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 学习概览 -->
        <div class="overview-section">
          <h3>学习概览</h3>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card>
                <div class="stat-item">
                  <div class="stat-number">0</div>
                  <div class="stat-label">已完成测试</div>
                </div>
              </el-card>
            </el-col>
            
            <el-col :span="12">
              <el-card>
                <div class="stat-item">
                  <div class="stat-number">0</div>
                  <div class="stat-label">练习题目数</div>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import {
  House,
  Document,
  Calendar,
  EditPen,
  DataLine,
  User,
  Setting,
  SwitchButton,
  ArrowDown
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 当前激活的菜单项
const activeMenu = computed(() => route.path)

// 处理菜单选择
const handleMenuSelect = (index: string) => {
  router.push(index)
}

// 处理退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    authStore.logout()
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.dashboard {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  padding: 0;
  height: 60px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.logo h1 {
  margin: 0;
  color: #409eff;
  font-size: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #f5f7fa;
}

.username {
  font-weight: 500;
}

.dashboard-container {
  flex: 1;
}

.dashboard-aside {
  background: #fff;
  border-right: 1px solid #e4e7ed;
}

.dashboard-menu {
  border: none;
  height: 100%;
}

.dashboard-main {
  background: #f5f7fa;
  padding: 20px;
}

.welcome-section {
  margin-bottom: 24px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.welcome-content {
  text-align: center;
  color: white;
  padding: 20px;
}

.welcome-content h2 {
  margin: 0 0 8px 0;
  font-size: 1.8rem;
}

.welcome-subtitle {
  margin: 0 0 16px 0;
  opacity: 0.9;
}

.grade-badge {
  display: flex;
  justify-content: center;
}

.quick-actions,
.overview-section {
  margin-bottom: 24px;
}

.quick-actions h3,
.overview-section h3 {
  margin: 0 0 16px 0;
  color: #303133;
}

.action-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.action-content {
  text-align: center;
  padding: 20px;
}

.action-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.action-content h4 {
  margin: 0 0 8px 0;
  color: #303133;
}

.action-content p {
  margin: 0;
  color: #909399;
  font-size: 0.875rem;
}

.stat-item {
  text-align: center;
  padding: 20px;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  color: #909399;
  font-size: 0.875rem;
}

:deep(.el-card__body) {
  padding: 0;
}

:deep(.welcome-card .el-card__body) {
  padding: 0;
}
</style>