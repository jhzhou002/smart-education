<template>
  <div class="overview-view">
    <div class="container">
      <div class="progress-content">
        <h2>学习进度概览</h2>
        
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon">
                  <el-icon color="#409eff" size="32"><Document /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">5</div>
                  <div class="stat-label">已测试章节</div>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="8">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon">
                  <el-icon color="#67c23a" size="32"><EditPen /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">128</div>
                  <div class="stat-label">练习题目数</div>
                </div>
              </div>
            </el-card>
          </el-col>
          
          <el-col :span="8">
            <el-card class="stat-card">
              <div class="stat-content">
                <div class="stat-icon">
                  <el-icon color="#e6a23c" size="32"><Clock /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-number">24.5</div>
                  <div class="stat-label">学习时长(小时)</div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
        
        <el-card class="progress-chart">
          <template #header>
            <h3>学习进度图表</h3>
          </template>
          
          <div class="chart-content">
            <p style="text-align: center; color: #909399; padding: 40px;">
              图表功能开发中...
            </p>
          </div>
        </el-card>
        
        <el-card class="chapter-progress">
          <template #header>
            <h3>章节掌握情况</h3>
          </template>
          
          <div class="chapters-list">
            <div v-for="chapter in chapters" :key="chapter.id" class="chapter-item">
              <div class="chapter-info">
                <h4>{{ chapter.name }}</h4>
                <span class="chapter-grade">{{ chapter.grade }}</span>
              </div>
              
              <div class="progress-info">
                <el-progress 
                  :percentage="getChapterProgress(chapter.id)"
                  :stroke-width="8"
                />
                <span class="progress-text">
                  {{ getChapterProgress(chapter.id) }}% 掌握
                </span>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Document, EditPen, Clock } from '@element-plus/icons-vue'
import type { Chapter } from '@/types'

const chapters = ref<Chapter[]>([])
const chapterProgress = ref<Record<number, number>>({})

// 获取章节进度
const getChapterProgress = (chapterId: number): number => {
  return chapterProgress.value[chapterId] || 0
}

// 获取章节列表和进度
const fetchProgress = async () => {
  try {
    // TODO: 调用API获取学习进度
    // const response = await progressApi.getOverview()
    // chapters.value = response.data.chapters
    // chapterProgress.value = response.data.progress
    
    // 临时数据
    chapters.value = [
      {
        id: 1,
        name: '集合与函数概念',
        description: '',
        order_index: 1,
        grade: '高一',
        is_active: true,
        created_at: ''
      },
      {
        id: 2,
        name: '三角函数',
        description: '',
        order_index: 2,
        grade: '高一',
        is_active: true,
        created_at: ''
      },
      {
        id: 3,
        name: '数列',
        description: '',
        order_index: 3,
        grade: '高二',
        is_active: true,
        created_at: ''
      }
    ]
    
    chapterProgress.value = {
      1: 85,
      2: 60,
      3: 30
    }
  } catch (error) {
    console.error('获取学习进度失败:', error)
  }
}

onMounted(() => {
  fetchProgress()
})
</script>

<style scoped>
.overview-view {
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.progress-content {
  margin-top: 24px;
}

.progress-content h2 {
  margin: 0 0 24px 0;
  color: #303133;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  color: #303133;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.progress-chart,
.chapter-progress {
  margin-top: 20px;
}

.progress-chart h3,
.chapter-progress h3 {
  margin: 0;
  color: #303133;
}

.chart-content {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chapters-list {
  margin-top: 16px;
}

.chapter-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
}

.chapter-item:last-child {
  border-bottom: none;
}

.chapter-info h4 {
  margin: 0 0 4px 0;
  color: #303133;
}

.chapter-grade {
  color: #909399;
  font-size: 12px;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 200px;
}

.progress-text {
  white-space: nowrap;
  color: #606266;
  font-size: 14px;
}
</style>