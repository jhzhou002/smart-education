<template>
  <div class="ai-debug-view">
    <div class="container">
      <div class="debug-header">
        <h2>🤖 AI题目生成调试工具</h2>
        <p>此页面专门用于调试AI题目生成功能，可以查看详细的API调用过程和错误信息</p>
      </div>

      <el-card class="debug-form">
        <template #header>
          <span>生成参数配置</span>
        </template>
        
        <el-form :model="form" label-width="100px" @submit.prevent="generateQuestions">
          <el-form-item label="年级">
            <el-select v-model="form.grade" placeholder="请选择年级" @change="fetchChapters">
              <el-option label="高一" value="高一" />
              <el-option label="高二" value="高二" />
              <el-option label="高三" value="高三" />
            </el-select>
          </el-form-item>

          <el-form-item label="章节">
            <el-select v-model="form.chapterId" placeholder="请选择章节" @change="fetchTopics">
              <el-option
                v-for="chapter in chapters"
                :key="chapter.id"
                :label="chapter.name"
                :value="chapter.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="知识点">
            <el-select v-model="form.topicId" placeholder="请选择知识点">
              <el-option
                v-for="topic in topics"
                :key="topic.id"
                :label="topic.name"
                :value="topic.id"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="难度">
            <el-select v-model="form.difficulty" placeholder="请选择难度">
              <el-option label="基础" value="基础" />
              <el-option label="中等" value="中等" />
              <el-option label="困难" value="困难" />
            </el-select>
          </el-form-item>

          <el-form-item label="题目数量">
            <el-input-number v-model="form.questionCount" :min="1" :max="10" />
          </el-form-item>

          <el-form-item label="生成类型">
            <el-radio-group v-model="form.type">
              <el-radio value="practice">练习题目</el-radio>
              <el-radio value="assessment">测评题目</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="generateQuestions" :loading="loading">
              🚀 开始生成题目
            </el-button>
            <el-button @click="clearLogs">🗑️ 清空日志</el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 实时日志显示 -->
      <el-card class="debug-logs" v-if="logs.length > 0">
        <template #header>
          <span>🔍 调试日志 ({{ logs.length }}条)</span>
        </template>
        
        <div class="logs-container">
          <div
            v-for="(log, index) in logs"
            :key="index"
            :class="['log-item', `log-${log.level}`]"
          >
            <span class="log-time">{{ log.timestamp }}</span>
            <span class="log-level">{{ log.level.toUpperCase() }}</span>
            <span class="log-message">{{ log.message }}</span>
            <pre v-if="log.data" class="log-data">{{ JSON.stringify(log.data, null, 2) }}</pre>
          </div>
        </div>
      </el-card>

      <!-- 生成结果显示 -->
      <el-card class="debug-results" v-if="generatedQuestions.length > 0">
        <template #header>
          <span>✅ 生成结果 ({{ generatedQuestions.length }}道题目)</span>
        </template>
        
        <div class="questions-list">
          <div
            v-for="(question, index) in generatedQuestions"
            :key="index"
            class="question-item"
          >
            <el-card>
              <div class="question-header">
                <span class="question-number">第{{ index + 1 }}题</span>
                <el-tag :type="getDifficultyType(question.difficulty)">
                  {{ question.difficulty }}
                </el-tag>
                <el-tag type="info">{{ question.question_type }}</el-tag>
              </div>
              
              <div class="question-content">
                <div class="question-text">{{ question.question_text }}</div>
                
                <div v-if="question.options" class="question-options">
                  <div v-for="option in question.options" :key="option" class="option-item">
                    {{ option }}
                  </div>
                </div>
                
                <div class="question-answer">
                  <strong>正确答案：</strong>{{ question.correct_answer }}
                </div>
                
                <div v-if="question.solution" class="question-solution">
                  <strong>解析：</strong>{{ question.solution }}
                </div>
                
                <div v-if="question.knowledge_points" class="question-points">
                  <strong>知识点：</strong>
                  <el-tag v-for="point in question.knowledge_points" :key="point" size="small">
                    {{ point }}
                  </el-tag>
                </div>
              </div>
            </el-card>
          </div>
        </div>
      </el-card>

      <!-- 错误信息显示 -->
      <el-card class="debug-errors" v-if="errors.length > 0">
        <template #header>
          <span>❌ 错误信息 ({{ errors.length }}个)</span>
        </template>
        
        <div class="errors-list">
          <el-alert
            v-for="(error, index) in errors"
            :key="index"
            :title="error.title"
            :description="error.message"
            type="error"
            show-icon
            :closable="false"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

interface Chapter {
  id: number
  name: string
  grade: string
}

interface Topic {
  id: number
  name: string
  description: string
  difficulty: string
}

interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'success'
  message: string
  data?: any
}

interface ErrorEntry {
  title: string
  message: string
}

interface GeneratedQuestion {
  question_text: string
  question_type: string
  difficulty: string
  options?: string[]
  correct_answer: string
  solution: string
  knowledge_points: string[]
}

// 响应式数据
const loading = ref(false)
const chapters = ref<Chapter[]>([])
const topics = ref<Topic[]>([])
const logs = ref<LogEntry[]>([])
const errors = ref<ErrorEntry[]>([])
const generatedQuestions = ref<GeneratedQuestion[]>([])

const form = reactive({
  grade: '',
  chapterId: '',
  topicId: '',
  difficulty: '基础',
  questionCount: 3,
  type: 'practice'
})

// 工具函数
const addLog = (level: LogEntry['level'], message: string, data?: any) => {
  logs.value.push({
    timestamp: new Date().toLocaleTimeString(),
    level,
    message,
    data
  })
}

const addError = (title: string, message: string) => {
  errors.value.push({ title, message })
}

const getDifficultyType = (difficulty: string) => {
  const types: Record<string, string> = {
    '基础': 'success',
    '中等': 'warning',
    '困难': 'danger'
  }
  return types[difficulty] || 'info'
}

// 获取章节列表
const fetchChapters = async () => {
  if (!form.grade) return
  
  addLog('info', `正在获取${form.grade}的章节列表...`)
  
  try {
    const response = await fetch('/api/chapters')
    const result = await response.json()
    
    if (response.ok) {
      chapters.value = result.data.filter((chapter: Chapter) => chapter.grade === form.grade)
      addLog('success', `成功获取${chapters.value.length}个章节`)
    } else {
      addError('获取章节失败', result.message)
      addLog('error', '获取章节失败', result)
    }
  } catch (error) {
    addError('网络错误', '无法连接到服务器')
    addLog('error', '获取章节网络错误', error)
  }
}

// 获取知识点列表
const fetchTopics = async () => {
  if (!form.chapterId) return
  
  addLog('info', `正在获取章节${form.chapterId}的知识点...`)
  
  try {
    const response = await fetch(`/api/chapters/${form.chapterId}`)
    const result = await response.json()
    
    if (response.ok && result.data.topics) {
      topics.value = result.data.topics
      addLog('success', `成功获取${topics.value.length}个知识点`)
    } else {
      addError('获取知识点失败', result.message || '章节没有知识点')
      addLog('error', '获取知识点失败', result)
    }
  } catch (error) {
    addError('网络错误', '无法获取知识点')
    addLog('error', '获取知识点网络错误', error)
  }
}

// 生成题目 
const generateQuestions = async () => {
  // 参数验证
  if (!form.topicId || !form.difficulty || !form.questionCount) {
    ElMessage.warning('请完整填写所有参数')
    return
  }

  loading.value = true
  generatedQuestions.value = []
  errors.value = []
  
  addLog('info', '🚀 开始AI题目生成流程')
  addLog('info', '生成参数配置', {
    topicId: form.topicId,
    difficulty: form.difficulty,
    questionCount: form.questionCount,
    type: form.type
  })

  try {
    const endpoint = form.type === 'practice' 
      ? '/api/debug/generate-practice' 
      : '/api/debug/generate-assessment'
    
    const payload = {
      topic_id: form.topicId,
      difficulty: form.difficulty,
      question_count: form.questionCount
    }

    addLog('info', `调用API端点: ${endpoint}`)
    addLog('info', '请求载荷', payload)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    })

    addLog('info', `收到响应，状态码: ${response.status}`)

    const result = await response.json()
    addLog('info', '响应数据', result)

    if (response.ok) {
      generatedQuestions.value = result.data || []
      addLog('success', `✅ 成功生成${generatedQuestions.value.length}道题目`)
      ElMessage.success(`成功生成${generatedQuestions.value.length}道题目`)
    } else {
      addError('生成失败', result.message || '未知错误')
      addLog('error', '生成题目失败', result)
      ElMessage.error(result.message || '生成题目失败')
    }
  } catch (error) {
    addError('网络错误', '无法连接到服务器')
    addLog('error', '生成题目网络错误', error)
    ElMessage.error('网络连接失败')
  } finally {
    loading.value = false
  }
}

// 清空日志
const clearLogs = () => {
  logs.value = []
  errors.value = []
  generatedQuestions.value = []
  ElMessage.info('日志已清空')
}
</script>

<style scoped>
.ai-debug-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.debug-header {
  text-align: center;
  margin-bottom: 30px;
}

.debug-header h2 {
  color: #409EFF;
  margin-bottom: 10px;
}

.debug-form {
  margin-bottom: 20px;
}

.debug-logs {
  margin-bottom: 20px;
}

.logs-container {
  max-height: 400px;
  overflow-y: auto;
  background: #f5f5f5;
  padding: 15px;
  border-radius: 4px;
}

.log-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
  padding: 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
}

.log-info {
  background: #e3f2fd;
  border-left: 3px solid #2196f3;
}

.log-success {
  background: #e8f5e8;
  border-left: 3px solid #4caf50;
}

.log-warn {
  background: #fff3e0;
  border-left: 3px solid #ff9800;
}

.log-error {
  background: #ffebee;
  border-left: 3px solid #f44336;
}

.log-time {
  color: #666;
  min-width: 80px;
}

.log-level {
  font-weight: bold;
  min-width: 60px;
}

.log-message {
  flex: 1;
}

.log-data {
  margin-top: 5px;
  background: #fff;
  padding: 10px;
  border-radius: 4px;
  font-size: 11px;
  overflow-x: auto;
}

.debug-results,
.debug-errors {
  margin-bottom: 20px;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.question-item {
  border: 1px solid #ddd;
  border-radius: 8px;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.question-number {
  font-weight: bold;
  color: #409EFF;
}

.question-content {
  line-height: 1.6;
}

.question-text {
  font-size: 16px;
  margin-bottom: 15px;
  font-weight: 500;
}

.question-options {
  margin-bottom: 15px;
}

.option-item {
  padding: 5px 0;
  border-bottom: 1px solid #f0f0f0;
}

.question-answer,
.question-solution,
.question-points {
  margin-bottom: 10px;
}

.errors-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>