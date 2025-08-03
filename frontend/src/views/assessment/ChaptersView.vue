<template>
  <div class="chapters-view">
    <div class="container">
      <el-page-header @back="$router.push('/dashboard')" content="基础测试" />
      
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
    // TODO: 调用API获取章节列表
    // const response = await chaptersApi.getChapters()
    // chapters.value = response.data
    
    // 临时数据
    chapters.value = [
      {
        id: 1,
        name: '集合与函数概念',
        description: '学习集合的基本概念和函数的定义、性质',
        order_index: 1,
        grade: '高一',
        is_active: true,
        created_at: '',
        topics: []
      },
      {
        id: 2,
        name: '三角函数',
        description: '学习三角函数的定义、图象和性质',
        order_index: 2,
        grade: '高一',
        is_active: true,
        created_at: '',
        topics: []
      },
      {
        id: 3,
        name: '数列',
        description: '学习数列的概念、等差数列和等比数列',
        order_index: 3,
        grade: '高二',
        is_active: true,
        created_at: '',
        topics: []
      }
    ]
  } catch (error) {
    ElMessage.error('获取章节列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 选择章节
const selectChapter = (chapter: Chapter) => {
  ElMessage.info(`选择了章节：${chapter.name}，即将开始测试`)
  // TODO: 跳转到测试页面
  router.push(`/assessment/test/${chapter.id}`)
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