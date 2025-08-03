<template>
  <div class="questions-view">
    <div class="container">
      <el-page-header @back="$router.push('/dashboard')" content="练习中心" />
      
      <div class="practice-content">
        <div class="practice-header">
          <h2>题目练习</h2>
          <div class="practice-filters">
            <el-select v-model="selectedChapter" placeholder="选择章节" @change="fetchQuestions">
              <el-option 
                v-for="chapter in chapters" 
                :key="chapter.id"
                :label="chapter.name" 
                :value="chapter.id"
              />
            </el-select>
            
            <el-select v-model="selectedDifficulty" placeholder="选择难度" @change="fetchQuestions">
              <el-option label="全部" value="" />
              <el-option label="基础" value="基础" />
              <el-option label="中等" value="中等" />
              <el-option label="困难" value="困难" />
            </el-select>
          </div>
        </div>
        
        <div class="questions-list" v-loading="loading">
          <div v-if="questions.length === 0" class="no-questions">
            <el-empty description="暂无题目">
              <el-button type="primary" @click="generateQuestions">生成题目</el-button>
            </el-empty>
          </div>
          
          <div v-else>
            <div 
              v-for="(question, index) in questions" 
              :key="question.id"
              class="question-card"
            >
              <el-card>
                <div class="question-header">
                  <span class="question-number">第{{ index + 1 }}题</span>
                  <el-tag :type="getDifficultyType(question.difficulty)">
                    {{ question.difficulty }}
                  </el-tag>
                </div>
                
                <div class="question-content">
                  <div class="question-text" v-html="question.question_text"></div>
                  
                  <div class="answer-section" v-if="question.question_type === '单选'">
                    <el-radio-group v-model="userAnswers[question.id]">
                      <el-radio 
                        v-for="(option, optIndex) in question.options" 
                        :key="optIndex"
                        :label="option.key"
                        class="option-item"
                      >
                        {{ option.text }}
                      </el-radio>
                    </el-radio-group>
                  </div>
                  
                  <div class="answer-section" v-else-if="question.question_type === '填空'">
                    <el-input 
                      v-model="userAnswers[question.id]" 
                      placeholder="请输入答案"
                    />
                  </div>
                </div>
                
                <div class="question-actions">
                  <el-button 
                    type="primary"
                    @click="submitAnswer(question)"
                    :disabled="!userAnswers[question.id]"
                  >
                    提交答案
                  </el-button>
                  
                  <el-button 
                    v-if="submittedQuestions.has(question.id)"
                    @click="showSolution(question)"
                  >
                    查看解析
                  </el-button>
                </div>
                
                <div 
                  v-if="submittedQuestions.has(question.id)"
                  class="answer-result"
                >
                  <div class="result-info">
                    <el-tag 
                      :type="questionResults[question.id]?.is_correct ? 'success' : 'danger'"
                      size="large"
                    >
                      {{ questionResults[question.id]?.is_correct ? '正确' : '错误' }}
                    </el-tag>
                    
                    <span class="correct-answer">
                      正确答案: {{ question.correct_answer }}
                    </span>
                  </div>
                  
                  <div 
                    v-if="showingSolution[question.id]"
                    class="solution-content"
                  >
                    <h4>解析</h4>
                    <div v-html="question.solution || '暂无解析'"></div>
                  </div>
                </div>
              </el-card>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { Chapter, PracticeQuestion, PracticeRecord } from '@/types'

const loading = ref(false)
const selectedChapter = ref<number>()
const selectedDifficulty = ref('')
const chapters = ref<Chapter[]>([])
const questions = ref<PracticeQuestion[]>([])
const userAnswers = reactive<Record<number, string>>({})
const submittedQuestions = ref(new Set<number>())
const questionResults = reactive<Record<number, { is_correct: boolean }>>({})
const showingSolution = reactive<Record<number, boolean>>({})

// 获取难度标签类型
const getDifficultyType = (difficulty: string) => {
  switch (difficulty) {
    case '基础': return 'success'
    case '中等': return 'warning'
    case '困难': return 'danger'
    default: return 'info'
  }
}

// 获取章节列表
const fetchChapters = async () => {
  try {
    // TODO: 调用API获取章节列表
    // const response = await chaptersApi.getChapters()
    // chapters.value = response.data
    
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
  } catch (error) {
    ElMessage.error('获取章节列表失败')
  }
}

// 获取练习题目
const fetchQuestions = async () => {
  if (!selectedChapter.value) return
  
  loading.value = true
  try {
    // TODO: 调用API获取练习题目
    // const response = await practiceApi.getQuestions({
    //   chapter_id: selectedChapter.value,
    //   difficulty: selectedDifficulty.value,
    //   count: 10
    // })
    // questions.value = response.data
    
    // 临时数据
    questions.value = [
      {
        id: 1,
        topic_id: 1,
        question_text: '集合A = {1, 2, 3}，集合B = {2, 3, 4}，则A∩B = ?',
        question_type: '单选',
        difficulty: '基础',
        options: [
          { key: 'A', text: '{1, 2}' },
          { key: 'B', text: '{2, 3}' },
          { key: 'C', text: '{3, 4}' },
          { key: 'D', text: '{1, 4}' }
        ],
        correct_answer: 'B',
        solution: '集合的交集是同时属于两个集合的元素组成的集合。A和B的公共元素是2和3，所以A∩B = {2, 3}。',
        usage_count: 0,
        correct_rate: 0,
        created_at: ''
      },
      {
        id: 2,
        topic_id: 2,
        question_text: '函数f(x) = x² + 1的定义域是___',
        question_type: '填空',
        difficulty: '基础',
        correct_answer: 'R',
        solution: '二次函数f(x) = x²+ 1对于任意实数x都有意义，因此定义域为实数集R。',
        usage_count: 0,
        correct_rate: 0,
        created_at: ''
      }
    ]
  } catch (error) {
    ElMessage.error('获取题目失败')
  } finally {
    loading.value = false
  }
}

// 生成题目
const generateQuestions = async () => {
  ElMessage.info('正在生成题目...')
  // TODO: 调用Kimi API生成题目
  await fetchQuestions()
}

// 提交答案
const submitAnswer = async (question: PracticeQuestion) => {
  const userAnswer = userAnswers[question.id]
  if (!userAnswer) return
  
  try {
    // TODO: 调用API提交答案
    // const response = await practiceApi.submitAnswer({
    //   question_id: question.id,
    //   answer: userAnswer
    // })
    
    // 临时判断
    const isCorrect = userAnswer === question.correct_answer
    questionResults[question.id] = { is_correct: isCorrect }
    submittedQuestions.value.add(question.id)
    
    ElMessage.success(isCorrect ? '回答正确!' : '回答错误，请查看解析')
  } catch (error) {
    ElMessage.error('提交答案失败')
  }
}

// 显示解析
const showSolution = (question: PracticeQuestion) => {
  showingSolution[question.id] = !showingSolution[question.id]
}

onMounted(() => {
  fetchChapters()
})
</script>

<style scoped>
.questions-view {
  padding: 20px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.practice-content {
  margin-top: 24px;
}

.practice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.practice-header h2 {
  margin: 0;
  color: #303133;
}

.practice-filters {
  display: flex;
  gap: 12px;
}

.questions-list {
  min-height: 400px;
}

.no-questions {
  text-align: center;
  padding: 60px 20px;
}

.question-card {
  margin-bottom: 24px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.question-number {
  font-weight: bold;
  color: #409eff;
}

.question-content {
  margin-bottom: 20px;
}

.question-text {
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 16px;
  color: #303133;
}

.answer-section {
  margin-bottom: 16px;
}

.option-item {
  display: block;
  margin-bottom: 8px;
  padding: 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  transition: border-color 0.3s;
}

.option-item:hover {
  border-color: #409eff;
}

.question-actions {
  margin-bottom: 16px;
}

.answer-result {
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
}

.result-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.correct-answer {
  color: #606266;
  font-size: 14px;
}

.solution-content {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 6px;
}

.solution-content h4 {
  margin: 0 0 12px 0;
  color: #303133;
}

:deep(.el-radio__label) {
  line-height: 1.5;
}
</style>