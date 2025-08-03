<template>
  <div class="main-layout">
    <!-- 左侧导航栏 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2 class="logo">智慧数学</h2>
      </div>
      
      <nav class="sidebar-nav">
        <el-menu
          :default-active="activeMenu"
          :router="true"
          :collapse="false"
          background-color="#001529"
          text-color="#ffffff"
          active-text-color="#1890ff"
        >
          <el-menu-item index="/dashboard">
            <el-icon><House /></el-icon>
            <span>首页概览</span>
          </el-menu-item>
          
          <el-menu-item index="/assessment/chapters">
            <el-icon><Document /></el-icon>
            <span>基础测评</span>
          </el-menu-item>
          
          <el-menu-item index="/learning/overview">
            <el-icon><Reading /></el-icon>
            <span>学习计划</span>
          </el-menu-item>
          
          <el-menu-item index="/practice/questions">
            <el-icon><EditPen /></el-icon>
            <span>练习题库</span>
          </el-menu-item>
          
          <el-menu-item index="/progress/overview">
            <el-icon><TrendCharts /></el-icon>
            <span>学习进度</span>
          </el-menu-item>
        </el-menu>
      </nav>
      
      <!-- 用户信息区域 -->
      <div class="sidebar-footer">
        <el-dropdown trigger="click" @command="handleUserCommand">
          <div class="user-info">
            <el-avatar :size="32" :src="authStore.user?.avatar_url">
              {{ authStore.user?.name?.charAt(0) }}
            </el-avatar>
            <span class="username">{{ authStore.user?.name }}</span>
            <el-icon class="arrow-icon"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>
                个人信息
              </el-dropdown-item>
              <el-dropdown-item command="settings">
                <el-icon><Setting /></el-icon>
                设置
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </aside>
    
    <!-- 右侧内容区域 -->
    <main class="main-content">
      <!-- 顶部面包屑导航 -->
      <header class="content-header">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item v-for="item in breadcrumbItems" :key="item.path" :to="item.path">
            {{ item.title }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </header>
      
      <!-- 页面内容 -->
      <section class="content-body">
        <router-view />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  House,
  Document,
  Reading,
  EditPen,
  TrendCharts,
  User,
  Setting,
  SwitchButton,
  ArrowDown
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 当前激活的菜单项
const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/assessment')) return '/assessment/chapters'
  if (path.startsWith('/learning')) return '/learning/overview'
  if (path.startsWith('/practice')) return '/practice/questions'
  if (path.startsWith('/progress')) return '/progress/overview'
  return path
})

// 面包屑导航
const breadcrumbItems = computed(() => {
  const path = route.path
  const items = [{ title: '首页', path: '/dashboard' }]
  
  if (path.startsWith('/assessment')) {
    items.push({ title: '基础测评', path: '/assessment/chapters' })
    if (path.includes('/test/')) items.push({ title: '测试答题', path: '' })
    if (path.includes('/result/')) items.push({ title: '测试结果', path: '' })
  } else if (path.startsWith('/learning')) {
    items.push({ title: '学习计划', path: '/learning/overview' })
    if (path.includes('/tasks/')) items.push({ title: '学习任务', path: '' })
  } else if (path.startsWith('/practice')) {
    items.push({ title: '练习题库', path: '/practice/questions' })
    if (path.includes('/mistakes')) items.push({ title: '错题本', path: '' })
  } else if (path.startsWith('/progress')) {
    items.push({ title: '学习进度', path: '/progress/overview' })
    if (path.includes('/analysis')) items.push({ title: '进度分析', path: '' })
  } else if (path.startsWith('/profile')) {
    items.push({ title: '个人中心', path: '/profile/info' })
    if (path.includes('/settings')) items.push({ title: '设置', path: '' })
  }
  
  return items
})

// 处理用户下拉菜单命令
const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile/info')
      break
    case 'settings':
      router.push('/profile/settings')
      break
    case 'logout':
      authStore.logout()
      break
  }
}
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 240px;
  background-color: #001529;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e8e8e8;
}

.sidebar-header {
  padding: 16px 20px;
  border-bottom: 1px solid #1f1f1f;
}

.logo {
  color: #ffffff;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
}

.sidebar-nav :deep(.el-menu) {
  border: none;
}

.sidebar-nav :deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
}

.sidebar-nav :deep(.el-menu-item.is-active) {
  background-color: #1890ff !important;
  color: #ffffff !important;
}

.sidebar-nav :deep(.el-menu-item.is-active span) {
  color: #ffffff !important;
}

.sidebar-nav :deep(.el-menu-item.is-active .el-icon) {
  color: #ffffff !important;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #1f1f1f;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: #1f1f1f;
}

.username {
  flex: 1;
  font-size: 14px;
}

.arrow-icon {
  font-size: 12px;
  color: #8c8c8c;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.content-header {
  padding: 16px 24px;
  background-color: #ffffff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.content-body {
  flex: 1;
  padding: 24px;
  background-color: #f5f5f5;
  overflow-y: auto;
}

:deep(.el-breadcrumb) {
  font-size: 14px;
}

:deep(.el-breadcrumb__inner) {
  color: #666666;
}

:deep(.el-breadcrumb__inner.is-link) {
  color: #1890ff;
}
</style>