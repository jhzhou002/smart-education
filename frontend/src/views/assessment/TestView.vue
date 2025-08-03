<template>
  <div class="test-view">
    <div class="container">
      <div class="test-header">
        <h2>基础测试 - {{ chapterName }}</h2>
        <div class="test-progress">
          <span>进度: {{ currentQuestion }}/{{ totalQuestions }}</span>
          <el-progress 
            :percentage="progressPercentage" 
            :stroke-width="8"
            :show-text="false"
          />
        </div>
      </div>
      
      <div class="test-content" v-if="!testCompleted">
        <el-card>
          <div class="question-content">
            <h3>第{{ currentQuestion }}题</h3>
            <div class="question-text" v-html="currentQuestionData?.question_text"></div>
            
            <div class="answer-options" v-if="currentQuestionData?.question_type === '单选'">
              <el-radio-group v-model="userAnswer">
                <el-radio 
                  v-for="(option, index) in currentQuestionData.options" 
                  :key="index"
                  :label="option.key"
                  class="option-item"
                >
                  {{ option.text }}
                </el-radio>
              </el-radio-group>
            </div>
            
            <div class="answer-input" v-else-if="currentQuestionData?.question_type === '填空'">
              <el-input 
                v-model="userAnswer" 
                placeholder="请输入答案"
                size="large"
              />
            </div>
          </div>
          
          <div class="question-actions">
            <el-button 
              v-if="currentQuestion > 1"
              @click="previousQuestion"
            >
              上一题
            </el-button>
            <el-button 
              type="primary"
              @click="nextQuestion"
              :disabled="!userAnswer"
            >
              {{ currentQuestion === totalQuestions ? '完成测试' : '下一题' }}
            </el-button>
          </div>
        </el-card>
      </div>
      
      <div class="test-result" v-else>
        <el-result
          icon="success"
          title="测试完成"
          :sub-title="`得分: ${testScore}分`"
        >
          <template #extra>
            <el-button type="primary" @click="viewResult">查看详细结果</el-button>
            <el-button @click="$router.push('/assessment/chapters')">重新测试</el-button>
          </template>
        </el-result>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { AssessmentQuestion } from '@/types'

const route = useRoute()
const router = useRouter()

const chapterId = ref(parseInt(route.params.id as string))
const chapterName = ref('数学章节')
const currentQuestion = ref(1)
const totalQuestions = ref(10)
const userAnswer = ref('')
const userAnswers = ref<Record<number, string>>({})
const questions = ref<AssessmentQuestion[]>([])
const testCompleted = ref(false)
const testScore = ref(0)

// 计算进度百分比
const progressPercentage = computed(() => {
  return Math.round(((currentQuestion.value - 1) / totalQuestions.value) * 100)
})

// 当前题目数据
const currentQuestionData = computed(() => {
  return questions.value[currentQuestion.value - 1]
})

// 初始化测试
const initTest = async () => {
  try {
    // TODO: 调用API开始测试
    // const response = await assessmentApi.startTest(chapterId.value)
    // questions.value = response.data.questions
    
    // 临时数据
    questions.value = [
      {
        id: 1,
        assessment_id: 1,
        question_text: '集合A = {1, 2, 3}，集合B = {2, 3, 4}，则A∩B = ?',
        question_type: '单选',
        options: [
          { key: 'A', text: '{1, 2}' },
          { key: 'B', text: '{2, 3}' },
          { key: 'C', text: '{3, 4}' },
          { key: 'D', text: '{1, 4}' }
        ],
        correct_answer: 'B',
        is_correct: false,
        created_at: ''
      }
    ]
    totalQuestions.value = questions.value.length
  } catch (error) {
    ElMessage.error('初始化测试失败')
    router.push('/assessment/chapters')
  }
}

// 下一题
const nextQuestion = async () => {
  // 保存当前答案
  userAnswers.value[currentQuestion.value] = userAnswer.value
  
  if (currentQuestion.value === totalQuestions.value) {
    // 完成测试
    await submitTest()
  } else {
    // 下一题
    currentQuestion.value++
    userAnswer.value = userAnswers.value[currentQuestion.value] || ''
  }
}

// 上一题
const previousQuestion = () => {
  if (currentQuestion.value > 1) {
    userAnswers.value[currentQuestion.value] = userAnswer.value
    currentQuestion.value--
    userAnswer.value = userAnswers.value[currentQuestion.value] || ''
  }
}

// 提交测试
const submitTest = async () => {
  try {
    await ElMessageBox.confirm('确定要提交测试吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // TODO: 调用API提交测试
    // const response = await assessmentApi.submitTest(userAnswers.value)
    // testScore.value = response.data.score
    
    // 临时计算分数
    testScore.value = 85
    testCompleted.value = true
    
    ElMessage.success('测试提交成功')
  } catch {
    // 用户取消
  }
}

// 查看结果
const viewResult = () => {
  router.push(`/assessment/result/${chapterId.value}`)
}

onMounted(() => {
  initTest()
})
</script>

<style scoped>
.test-view {
  padding: 20px;
  min-height: 100vh;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.test-header {
  margin-bottom: 24px;
}

.test-header h2 {
  margin: 0 0 16px 0;
  color: #303133;
}

.test-progress {
  display: flex;
  align-items: center;
  gap: 16px;
}

.test-progress span {
  white-space: nowrap;
  color: #606266;
}

.question-content {
  margin-bottom: 32px;
}

.question-content h3 {
  margin: 0 0 16px 0;
  color: #409eff;
}

.question-text {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 24px;
  color: #303133;
}

.answer-options {
  margin-bottom: 24px;
}

.option-item {
  display: block;
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  transition: border-color 0.3s;
}

.option-item:hover {
  border-color: #409eff;
}

.answer-input {
  margin-bottom: 24px;
}

.question-actions {
  display: flex;
  justify-content: space-between;
}

.test-result {
  text-align: center;
  padding: 40px 20px;
}

:deep(.el-radio__label) {
  line-height: 1.5;
}
</style>