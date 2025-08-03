<template>
  <div class="dashboard">
    <!-- 欢迎区域 -->
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
              <el-icon class="action-icon" color="#67c23a"><Reading /></el-icon>
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
        <el-col :span="8">
          <el-card>
            <div class="stat-item">
              <div class="stat-number">0</div>
              <div class="stat-label">已完成测试</div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card>
            <div class="stat-item">
              <div class="stat-number">0</div>
              <div class="stat-label">练习题目数</div>
            </div>
          </el-card>
        </el-col>
        
        <el-col :span="8">
          <el-card>
            <div class="stat-item">
              <div class="stat-number">0</div>
              <div class="stat-label">学习时长(小时)</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 最近活动 -->
    <div class="recent-activity">
      <h3>最近活动</h3>
      <el-card>
        <el-empty description="暂无学习记录" />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  Document,
  Reading,
  EditPen
} from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
</script>

<style scoped>
.dashboard {
  /* 由MainLayout提供布局，这里不需要固定高度 */
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
.overview-section,
.recent-activity {
  margin-bottom: 24px;
}

.quick-actions h3,
.overview-section h3,
.recent-activity h3 {
  margin: 0 0 16px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.action-card {
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  height: 100%;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.action-content {
  text-align: center;
  padding: 24px;
}

.action-icon {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.action-content h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}

.action-content p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.stat-item {
  text-align: center;
  padding: 24px;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

:deep(.el-card__body) {
  padding: 20px;
}

:deep(.welcome-card .el-card__body) {
  padding: 0;
}

:deep(.action-card .el-card__body) {
  padding: 0;
}

:deep(.stat-item) {
  padding: 0;
}
</style>