<template>
  <div class="overview-view">
    <div class="container">
      <el-page-header @back="$router.push('/dashboard')" content="学习计划" />
      
      <div class="overview-content">
        <div class="plan-header">
          <h2>我的学习计划</h2>
          <el-button type="primary" @click="generatePlan" :loading="generating">
            {{ currentPlan ? '重新生成计划' : '生成学习计划' }}
          </el-button>
        </div>
        
        <div v-if="currentPlan" class="plan-content">
          <el-card class="plan-summary">
            <div class="summary-info">
              <h3>{{ currentPlan.title }}</h3>
              <p class="plan-description">{{ currentPlan.description }}</p>
              
              <div class="plan-meta">
                <el-row :gutter="20">
                  <el-col :span="8">
                    <div class="meta-item">
                      <span class="meta-label">开始日期</span>
                      <span class="meta-value">{{ formatDate(currentPlan.start_date) }}</span>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="meta-item">
                      <span class="meta-label">结束日期</span>
                      <span class="meta-value">{{ formatDate(currentPlan.end_date) }}</span>
                    </div>
                  </el-col>
                  <el-col :span="8">
                    <div class="meta-item">
                      <span class="meta-label">目标分数</span>
                      <span class="meta-value">{{ currentPlan.target_score }}分</span>
                    </div>
                  </el-col>
                </el-row>
              </div>
              
              <div class="plan-progress">
                <span>完成进度</span>
                <el-progress 
                  :percentage="planProgress"
                  :stroke-width="8"
                />
              </div>
            </div>
          </el-card>
          
          <el-card class="tasks-overview">
            <template #header>
              <h3>学习任务</h3>
            </template>
            
            <div class="tasks-list">
              <div 
                v-for="task in currentTasks" 
                :key="task.id"
                class="task-item"
                @click="viewTask(task)"
              >
                <div class="task-content">
                  <div class="task-header">
                    <h4>{{ task.title }}</h4>
                    <el-tag 
                      :type="getTaskStatusType(task.status)"
                      size="small"
                    >
                      {{ getTaskStatusText(task.status) }}
                    </el-tag>
                  </div>
                  
                  <p class="task-description">{{ task.description }}</p>
                  
                  <div class="task-meta">
                    <span class="target-date">目标完成: {{ formatDate(task.target_date) }}</span>
                    <span class="estimated-time" v-if="task.estimated_time">
                      预计 {{ task.estimated_time }} 分钟
                    </span>
                  </div>
                </div>
                
                <div class="task-actions">
                  <el-button 
                    v-if="task.status === 'pending'"
                    type="primary"
                    size="small"
                    @click.stop="startTask(task)"
                  >
                    开始
                  </el-button>
                  <el-button 
                    v-else-if="task.status === 'in_progress'"
                    type="success"
                    size="small"
                    @click.stop="completeTask(task)"
                  >
                    完成
                  </el-button>
                  <el-icon v-else color="#67c23a"><Check /></el-icon>
                </div>
              </div>
            </div>
          </el-card>
        </div>
        
        <div v-else class="no-plan">
          <el-empty description="暂无学习计划">
            <el-button type="primary" @click="generatePlan">立即生成</el-button>
          </el-empty>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import type { LearningPlan, LearningTask } from '@/types'

const router = useRouter()
const generating = ref(false)
const currentPlan = ref<LearningPlan>()
const currentTasks = ref<LearningTask[]>([])

// 计算学习计划进度
const planProgress = computed(() => {
  if (!currentTasks.value.length) return 0
  const completedTasks = currentTasks.value.filter(task => task.status === 'completed').length
  return Math.round((completedTasks / currentTasks.value.length) * 100)
})

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

// 获取当前学习计划
const fetchCurrentPlan = async () => {
  try {
    // TODO: 调用API获取当前学习计划
    // const response = await learningPlanApi.getCurrentPlan()
    // currentPlan.value = response.data.plan
    // currentTasks.value = response.data.tasks
    
    // 临时数据
    currentPlan.value = {
      id: 1,
      user_id: 1,
      title: '高一数学基础提升计划',
      description: '针对集合与函数、三角函数的专项提升计划',
      start_date: '2024-01-01',
      end_date: '2024-02-01',
      target_score: 90,
      status: 'active',
      created_at: '',
      updated_at: ''
    }
    
    currentTasks.value = [
      {
        id: 1,
        plan_id: 1,
        chapter_id: 1,
        title: '集合基础概念学习',
        description: '学习集合的定义、表示方法和基本运算',
        target_date: '2024-01-05',
        estimated_time: 60,
        status: 'completed',
        priority: 'high',
        created_at: ''
      },
      {
        id: 2,
        plan_id: 1,
        chapter_id: 1,
        title: '函数概念练习',
        description: '完成函数定义域、值域相关练习题',
        target_date: '2024-01-08',
        estimated_time: 90,
        status: 'in_progress',
        priority: 'medium',
        created_at: ''
      },
      {
        id: 3,
        plan_id: 1,
        chapter_id: 2,
        title: '三角函数定义学习',
        description: '学习正弦、余弦、正切函数的定义',
        target_date: '2024-01-12',
        estimated_time: 75,
        status: 'pending',
        priority: 'medium',
        created_at: ''
      }
    ]
  } catch (error) {
    console.error('获取学习计划失败:', error)
  }
}

// 生成学习计划
const generatePlan = async () => {
  generating.value = true
  try {
    // TODO: 调用API生成学习计划
    // const response = await learningPlanApi.generatePlan()
    // currentPlan.value = response.data.plan
    // currentTasks.value = response.data.tasks
    
    ElMessage.success('学习计划生成成功')
    await fetchCurrentPlan()
  } catch (error) {
    ElMessage.error('生成学习计划失败')
  } finally {
    generating.value = false
  }
}

// 查看任务详情
const viewTask = (task: LearningTask) => {
  router.push(`/learning/tasks/${task.id}`)
}

// 开始任务
const startTask = async (task: LearningTask) => {
  try {
    // TODO: 调用API更新任务状态
    task.status = 'in_progress'
    ElMessage.success('任务已开始')
  } catch (error) {
    ElMessage.error('更新任务状态失败')
  }
}

// 完成任务
const completeTask = async (task: LearningTask) => {
  try {
    // TODO: 调用API更新任务状态
    task.status = 'completed'
    task.completed_at = new Date().toISOString()
    ElMessage.success('任务已完成')
  } catch (error) {
    ElMessage.error('更新任务状态失败')
  }
}

onMounted(() => {
  fetchCurrentPlan()
})
</script>

<style scoped>
.overview-view {
  padding: 20px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.overview-content {
  margin-top: 24px;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.plan-header h2 {
  margin: 0;
  color: #303133;
}

.plan-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.plan-summary h3 {
  margin: 0 0 8px 0;
  color: #303133;
}

.plan-description {
  margin: 0 0 20px 0;
  color: #606266;
  line-height: 1.6;
}

.plan-meta {
  margin-bottom: 20px;
}

.meta-item {
  text-align: center;
}

.meta-label {
  display: block;
  color: #909399;
  font-size: 14px;
  margin-bottom: 4px;
}

.meta-value {
  display: block;
  color: #303133;
  font-weight: 500;
}

.plan-progress {
  display: flex;
  align-items: center;
  gap: 16px;
}

.plan-progress span {
  white-space: nowrap;
  color: #606266;
}

.tasks-overview h3 {
  margin: 0;
  color: #303133;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: border-color 0.3s;
}

.task-item:hover {
  border-color: #409eff;
}

.task-item:last-child {
  margin-bottom: 0;
}

.task-content {
  flex: 1;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-header h4 {
  margin: 0;
  color: #303133;
}

.task-description {
  margin: 0 0 8px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.task-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #909399;
}

.task-actions {
  margin-left: 16px;
}

.no-plan {
  text-align: center;
  padding: 60px 20px;
}
</style>