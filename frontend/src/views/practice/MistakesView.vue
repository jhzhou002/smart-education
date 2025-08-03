<template>
  <div class="mistakes-view">
    <div class="container">
      <div class="mistakes-content">
        <h2>我的错题</h2>
        <p class="subtitle">复习错题，巩固薄弱知识点</p>
        
        <div v-if="mistakes.length === 0" class="no-mistakes">
          <el-empty description="暂无错题">
            <el-button type="primary" @click="$router.push('/practice/questions')">
              去做题
            </el-button>
          </el-empty>
        </div>
        
        <div v-else class="mistakes-list">
          <div v-for="mistake in mistakes" :key="mistake.id" class="mistake-item">
            <el-card>
              <div class="mistake-header">
                <span class="mistake-date">{{ formatDate(mistake.created_at) }}</span>
                <el-tag type="danger">错题</el-tag>
              </div>
              
              <div class="question-content">
                <div class="question-text" v-html="mistake.question?.question_text"></div>
                <div class="answer-info">
                  <p><strong>你的答案:</strong> {{ mistake.user_answer || '未作答' }}</p>
                  <p><strong>正确答案:</strong> {{ mistake.question?.correct_answer }}</p>
                </div>
              </div>
              
              <div class="mistake-actions">
                <el-button size="small" @click="reviewQuestion(mistake)">重新练习</el-button>
                <el-button size="small" @click="showSolution(mistake)">查看解析</el-button>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { PracticeRecord } from '@/types'

const mistakes = ref<PracticeRecord[]>([])

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 获取错题列表
const fetchMistakes = async () => {
  try {
    // TODO: 调用API获取错题
    // const response = await practiceApi.getMistakes()
    // mistakes.value = response.data
    
    // 临时数据
    mistakes.value = []
  } catch (error) {
    ElMessage.error('获取错题失败')
  }
}

// 重新练习
const reviewQuestion = (mistake: PracticeRecord) => {
  ElMessage.info('跳转到相关练习题目')
  // TODO: 跳转到对应题目
}

// 显示解析
const showSolution = (mistake: PracticeRecord) => {
  ElMessage.info('显示题目解析')
  // TODO: 显示解析弹窗
}

onMounted(() => {
  fetchMistakes()
})
</script>

<style scoped>
.mistakes-view {
  padding: 20px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.mistakes-content {
  margin-top: 24px;
}

.mistakes-content h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.subtitle {
  margin: 0 0 24px 0;
  color: #909399;
}

.no-mistakes {
  text-align: center;
  padding: 60px 20px;
}

.mistakes-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mistake-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.mistake-date {
  color: #909399;
  font-size: 14px;
}

.question-content {
  margin-bottom: 16px;
}

.question-text {
  margin-bottom: 12px;
  color: #303133;
  line-height: 1.6;
}

.answer-info p {
  margin: 4px 0;
  color: #606266;
  font-size: 14px;
}
</style>