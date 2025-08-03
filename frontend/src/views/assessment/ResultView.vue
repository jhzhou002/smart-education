<template>
  <div class="result-view">
    <div class="container">
      <el-page-header @back="$router.push('/assessment/chapters')" content="测试结果" />
      
      <div class="result-content">
        <el-card class="result-summary">
          <div class="summary-header">
            <h2>测试完成</h2>
            <div class="score-display">
              <div class="score-number">{{ result?.score || 0 }}</div>
              <div class="score-label">分</div>
            </div>
          </div>
          
          <div class="summary-stats">
            <el-row :gutter="20">
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-number">{{ result?.total_questions || 0 }}</div>
                  <div class="stat-label">总题数</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-number">{{ result?.correct_answers || 0 }}</div>
                  <div class="stat-label">正确</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="stat-item">
                  <div class="stat-number">{{ (result?.total_questions || 0) - (result?.correct_answers || 0) }}</div>
                  <div class="stat-label">错误</div>
                </div>
              </el-col>
            </el-row>
          </div>
          
          <div class="result-actions">
            <el-button type="primary" @click="generateLearningPlan">生成学习计划</el-button>
            <el-button @click="$router.push('/assessment/chapters')">重新测试</el-button>
          </div>
        </el-card>
        
        <el-card class="result-analysis">
          <template #header>
            <h3>详细分析</h3>
          </template>
          
          <div class="analysis-content" v-loading="analysisLoading">
            <div class="analysis-item" v-for="(question, index) in questions" :key="question.id">
              <div class="question-header">
                <span class="question-number">第{{ index + 1 }}题</span>
                <el-tag :type="question.is_correct ? 'success' : 'danger'">
                  {{ question.is_correct ? '正确' : '错误' }}
                </el-tag>
              </div>
              
              <div class="question-content">
                <p class="question-text">{{ question.question_text }}</p>
                <div class="answer-info">
                  <p><strong>你的答案:</strong> {{ question.user_answer || '未作答' }}</p>
                  <p><strong>正确答案:</strong> {{ question.correct_answer }}</p>
                </div>
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
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { Assessment, AssessmentQuestion } from '@/types'

const route = useRoute()
const router = useRouter()

const chapterId = ref(parseInt(route.params.id as string))
const result = ref<Assessment>()
const questions = ref<AssessmentQuestion[]>([])
const analysisLoading = ref(false)

// 获取测试结果
const fetchResult = async () => {
  analysisLoading.value = true
  try {
    // TODO: 调用API获取测试结果
    // const response = await assessmentApi.getResult(chapterId.value)
    // result.value = response.data.assessment
    // questions.value = response.data.questions
    
    // 临时数据
    result.value = {
      id: 1,
      user_id: 1,
      chapter_id: chapterId.value,
      total_questions: 10,
      correct_answers: 8,
      score: 85,
      time_spent: 1200,
      completed_at: new Date().toISOString()
    }
    
    questions.value = [
      {
        id: 1,
        assessment_id: 1,
        question_text: '集合A = {1, 2, 3}，集合B = {2, 3, 4}，则A∩B = ?',
        question_type: '单选',
        correct_answer: 'B',
        user_answer: 'B',
        is_correct: true,
        created_at: ''
      },
      {
        id: 2,
        assessment_id: 1,
        question_text: '函数f(x) = x² + 1的定义域是?',
        question_type: '单选',
        correct_answer: 'A',
        user_answer: 'B',
        is_correct: false,
        created_at: ''
      }
    ]
  } catch (error) {
    ElMessage.error('获取测试结果失败')
    router.push('/assessment/chapters')
  } finally {
    analysisLoading.value = false
  }
}

// 生成学习计划
const generateLearningPlan = () => {
  ElMessage.info('正在生成个性化学习计划...')
  router.push('/learning/overview')
}

onMounted(() => {
  fetchResult()
})
</script>

<style scoped>
.result-view {
  padding: 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.result-content {
  margin-top: 24px;
}

.result-summary {
  margin-bottom: 24px;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.summary-header h2 {
  margin: 0;
  color: #303133;
}

.score-display {
  text-align: center;
}

.score-number {
  font-size: 3rem;
  font-weight: bold;
  color: #67c23a;
  line-height: 1;
}

.score-label {
  font-size: 1rem;
  color: #909399;
}

.summary-stats {
  margin-bottom: 24px;
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

.result-actions {
  text-align: center;
}

.result-analysis h3 {
  margin: 0;
  color: #303133;
}

.analysis-item {
  border-bottom: 1px solid #ebeef5;
  padding: 20px 0;
}

.analysis-item:last-child {
  border-bottom: none;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.question-number {
  font-weight: bold;
  color: #409eff;
}

.question-content {
  margin-left: 8px;
}

.question-text {
  margin: 0 0 12px 0;
  color: #303133;
  line-height: 1.6;
}

.answer-info p {
  margin: 4px 0;
  color: #606266;
  font-size: 14px;
}
</style>