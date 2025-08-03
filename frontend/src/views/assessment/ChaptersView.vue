<template>
  <div class="chapters-view">
    <div class="container">
      <div class="chapters-content">
        <h2>选择测试章节</h2>
        <p class="subtitle">选择你想要测试的数学章节，了解自己的基础水平</p>
        
        <el-row :gutter="20" v-loading="loading">
          <el-col :span="8" v-for="chapter in chapters" :key="chapter.id">
            <el-card class="chapter-card" @click="selectChapter(chapter)">
              <div class="chapter-content">
                <div class="chapter-icon">
                  <el-icon size="32" color="#409eff"><Document /></el-icon>
                </div>
                <h3>{{ chapter.name }}</h3>
                <p class="chapter-description">{{ chapter.description }}</p>
                <div class="chapter-meta">
                  <el-tag>{{ chapter.grade }}</el-tag>
                  <span class="topic-count">{{ chapter.topics?.length || 0 }}个知识点</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'
import type { Chapter } from '@/types'

const router = useRouter()
const loading = ref(false)
const chapters = ref<Chapter[]>([])

// 获取章节列表
const fetchChapters = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/chapters')
    const result = await response.json()
    
    if (response.ok) {
      chapters.value = result.data || []
    } else {
      ElMessage.error(result.message || '获取章节列表失败')
    }
  } catch (error) {
    console.error('获取章节列表失败:', error)
    ElMessage.error('获取章节列表失败')
  } finally {
    loading.value = false
  }
}

// 选择章节
const selectChapter = async (chapter: Chapter) => {
  try {
    ElMessage.info(`开始生成${chapter.name}的测评题目...`)
    
    const response = await fetch('/api/assessments/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        chapter_id: chapter.id,
        question_count: 10
      })
    })
    
    const result = await response.json()
    
    if (response.ok) {
      ElMessage.success('题目生成成功，开始测评')
      router.push(`/assessment/test/${result.data.assessment_id}`)
    } else {
      ElMessage.error(result.message || '开始测评失败')
    }
  } catch (error) {
    console.error('开始测评失败:', error)
    ElMessage.error('开始测评失败')
  }
}

onMounted(() => {
  fetchChapters()
})
</script>

<style scoped>
.chapters-view {
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.chapters-content {
  margin-top: 24px;
}

.chapters-content h2 {
  margin: 0 0 8px 0;
  color: #303133;
}

.subtitle {
  margin: 0 0 24px 0;
  color: #909399;
}

.chapter-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.chapter-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.chapter-content {
  text-align: center;
  padding: 20px;
}

.chapter-icon {
  margin-bottom: 16px;
}

.chapter-content h3 {
  margin: 0 0 12px 0;
  color: #303133;
}

.chapter-description {
  margin: 0 0 16px 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.chapter-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.topic-count {
  font-size: 12px;
  color: #909399;
}
</style>