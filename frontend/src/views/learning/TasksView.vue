<template>
  <div class="tasks-view">
    <div class="container">
      <div class="task-content" v-if="task">
        <el-card class="task-info">
          <div class="task-header">
            <h2>{{ task.title }}</h2>
            <el-tag :type="getTaskStatusType(task.status)" size="large">
              {{ getTaskStatusText(task.status) }}
            </el-tag>
          </div>
          
          <p class="task-description">{{ task.description }}</p>
          
          <div class="task-details">
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="detail-item">
                  <span class="detail-label">目标日期</span>
                  <span class="detail-value">{{ formatDate(task.target_date) }}</span>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="detail-item">
                  <span class="detail-label">预计时间</span>
                  <span class="detail-value">{{ task.estimated_time }} 分钟</span>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="detail-item">
                  <span class="detail-label">优先级</span>
                  <span class="detail-value">{{ getPriorityText(task.priority) }}</span>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="detail-item" v-if="task.completed_at">
                  <span class="detail-label">完成时间</span>
                  <span class="detail-value">{{ formatDate(task.completed_at) }}</span>
                </div>
              </el-col>
            </el-row>
          </div>
          
          <div class="task-actions">
            <el-button 
              v-if="task.status === 'pending'"
              type="primary"
              @click="startTask"
            >
              开始任务
            </el-button>
            <el-button 
              v-else-if="task.status === 'in_progress'"
              type="success"
              @click="completeTask"
            >
              完成任务
            </el-button>
            <el-button @click="goToPractice">开始练习</el-button>
          </div>
        </el-card>
        
        <el-card class="task-materials" v-if="task.chapter">
          <template #header>
            <h3>学习内容 - {{ task.chapter.name }}</h3>
          </template>
          
          <div class="materials-content">
            <div class="chapter-info">
              <p>{{ task.chapter.description }}</p>
            </div>
            
            <div class="topics-list" v-if="task.chapter.topics">
              <h4>相关知识点</h4>
              <div class="topic-item" v-for="topic in task.chapter.topics" :key="topic.id">
                <div class="topic-content">
                  <h5>{{ topic.name }}</h5>
                  <p>{{ topic.description }}</p>
                  <el-tag size="small">{{ topic.difficulty }}</el-tag>
                </div>
              </div>
            </div>
          </div>
        </el-card>
        
        <el-card class="task-progress">
          <template #header>
            <h3>学习进度</h3>
          </template>
          
          <div class="progress-content">
            <div class="progress-item">
              <span>知识点掌握度</span>
              <el-progress :percentage="75" :stroke-width="8" />
            </div>
            
            <div class="progress-item">
              <span>练习完成度</span>
              <el-progress :percentage="60" :stroke-width="8" />
            </div>
            
            <div class="progress-stats">
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="stat-item">
                    <div class="stat-number">12</div>
                    <div class="stat-label">已练习题目</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="stat-item">
                    <div class="stat-number">85%</div>
                    <div class="stat-label">正确率</div>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="stat-item">
                    <div class="stat-number">45</div>
                    <div class="stat-label">学习时长(分钟)</div>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { LearningTask } from '@/types'

const route = useRoute()
const router = useRouter()
const taskId = ref(parseInt(route.params.id as string))
const task = ref<LearningTask>()

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 获取任务状态类型
const getTaskStatusType = (status: string) => {
  switch (status) {
    case 'completed': return 'success'
    case 'in_progress': return 'warning'
    default: return 'info'
  }
}

// 获取任务状态文本
const getTaskStatusText = (status: string) => {
  switch (status) {
    case 'completed': return '已完成'
    case 'in_progress': return '进行中'
    default: return '待开始'
  }
}

// 获取优先级文本
const getPriorityText = (priority: string) => {
  switch (priority) {
    case 'high': return '高'
    case 'medium': return '中'
    default: return '低'
  }
}

// 获取任务详情
const fetchTask = async () => {
  try {
    // TODO: 调用API获取任务详情
    // const response = await learningPlanApi.getTask(taskId.value)
    // task.value = response.data
    
    // 临时数据
    task.value = {
      id: taskId.value,
      plan_id: 1,
      chapter_id: 1,
      title: '集合基础概念学习',
      description: '学习集合的定义、表示方法和基本运算，掌握集合间的基本关系和运算法则',
      target_date: '2024-01-05',
      estimated_time: 60,
      status: 'in_progress',
      priority: 'high',
      created_at: '',
      chapter: {
        id: 1,
        name: '集合与函数概念',
        description: '学习集合的基本概念和函数的定义、性质',
        order_index: 1,
        grade: '高一',
        is_active: true,
        created_at: '',
        topics: [
          {
            id: 1,
            chapter_id: 1,
            name: '集合的概念与运算',
            description: '集合的定义、表示方法和基本运算',
            difficulty: '基础',
            order_index: 1,
            is_active: true,
            created_at: ''
          },
          {
            id: 2,
            chapter_id: 1,
            name: '函数的概念',
            description: '函数的定义、定义域、值域',
            difficulty: '基础',
            order_index: 2,
            is_active: true,
            created_at: ''
          }
        ]
      }
    }
  } catch (error) {
    ElMessage.error('获取任务详情失败')
    router.push('/learning/overview')
  }
}

// 开始任务
const startTask = async () => {
  if (!task.value) return
  
  try {
    // TODO: 调用API更新任务状态
    task.value.status = 'in_progress'
    ElMessage.success('任务已开始')
  } catch (error) {
    ElMessage.error('更新任务状态失败')
  }
}

// 完成任务
const completeTask = async () => {
  if (!task.value) return
  
  try {
    // TODO: 调用API更新任务状态
    task.value.status = 'completed'
    task.value.completed_at = new Date().toISOString()
    ElMessage.success('任务已完成')
  } catch (error) {
    ElMessage.error('更新任务状态失败')
  }
}

// 去练习
const goToPractice = () => {
  router.push('/practice/questions')
}

onMounted(() => {
  fetchTask()
})
</script>

<style scoped>
.tasks-view {
  padding: 20px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.task-content {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.task-header h2 {
  margin: 0;
  color: #303133;
}

.task-description {
  margin: 0 0 20px 0;
  color: #606266;
  line-height: 1.6;
  font-size: 16px;
}

.task-details {
  margin-bottom: 24px;
}

.detail-item {
  text-align: center;
}

.detail-label {
  display: block;
  color: #909399;
  font-size: 14px;
  margin-bottom: 4px;
}

.detail-value {
  display: block;
  color: #303133;
  font-weight: 500;
}

.task-actions {
  text-align: center;
}

.task-materials h3,
.task-progress h3 {
  margin: 0;
  color: #303133;
}

.materials-content {
  margin-top: 16px;
}

.chapter-info p {
  margin: 0 0 20px 0;
  color: #606266;
  line-height: 1.6;
}

.topics-list h4 {
  margin: 0 0 16px 0;
  color: #303133;
}

.topic-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
}

.topic-item:last-child {
  margin-bottom: 0;
}

.topic-content h5 {
  margin: 0 0 8px 0;
  color: #303133;
}

.topic-content p {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.progress-content {
  margin-top: 16px;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.progress-item span {
  white-space: nowrap;
  color: #606266;
  min-width: 100px;
}

.progress-stats {
  margin-top: 24px;
}

.stat-item {
  text-align: center;
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
</style>