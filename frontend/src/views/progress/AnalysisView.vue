<template>
  <div class="analysis-view">
    <div class="container">
      <div class="analysis-content">
        <h2>学习数据分析</h2>
        
        <el-card class="analysis-summary">
          <template #header>
            <h3>综合表现</h3>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="6">
              <div class="summary-item">
                <div class="summary-value">78%</div>
                <div class="summary-label">平均正确率</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-item">
                <div class="summary-value">4.2</div>
                <div class="summary-label">平均用时(分钟)</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-item">
                <div class="summary-value">85</div>
                <div class="summary-label">最高分数</div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="summary-item">
                <div class="summary-value">15</div>
                <div class="summary-label">连续学习天数</div>
              </div>
            </el-col>
          </el-row>
        </el-card>
        
        <el-card class="weak-analysis">
          <template #header>
            <h3>薄弱知识点分析</h3>
          </template>
          
          <div class="weak-points">
            <div class="weak-item">
              <div class="weak-info">
                <h4>三角函数图像变换</h4>
                <p>在三角函数的图像平移和伸缩变换方面需要加强练习</p>
              </div>
              <div class="weak-score">
                <el-tag type="warning">需要提升</el-tag>
                <span class="score">45%</span>
              </div>
            </div>
            
            <div class="weak-item">
              <div class="weak-info">
                <h4>函数奇偶性判断</h4>
                <p>对函数奇偶性的概念理解不够深入，判断方法掌握不熟练</p>
              </div>
              <div class="weak-score">
                <el-tag type="danger">急需加强</el-tag>
                <span class="score">32%</span>
              </div>
            </div>
            
            <div class="weak-item">
              <div class="weak-info">
                <h4>数列通项公式</h4>
                <p>等差数列和等比数列通项公式的应用需要更多练习</p>
              </div>
              <div class="weak-score">
                <el-tag type="warning">需要提升</el-tag>
                <span class="score">58%</span>
              </div>
            </div>
          </div>
        </el-card>
        
        <el-card class="study-suggestions">
          <template #header>
            <h3>学习建议</h3>
          </template>
          
          <div class="suggestions-list">
            <div class="suggestion-item">
              <el-icon color="#409eff"><Lightbulb /></el-icon>
              <div class="suggestion-content">
                <h4>加强基础概念理解</h4>
                <p>建议回顾三角函数和函数相关的基础概念，确保理论基础扎实</p>
              </div>
            </div>
            
            <div class="suggestion-item">
              <el-icon color="#67c23a"><TrendCharts /></el-icon>
              <div class="suggestion-content">
                <h4>增加练习量</h4>
                <p>针对薄弱知识点，建议每天完成5-8道相关练习题</p>
              </div>
            </div>
            
            <div class="suggestion-item">
              <el-icon color="#e6a23c"><Clock /></el-icon>
              <div class="suggestion-content">
                <h4>保持学习节奏</h4>
                <p>建议每天保持1-2小时的学习时间，养成良好的学习习惯</p>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Lightbulb, TrendCharts, Clock } from '@element-plus/icons-vue'
</script>

<style scoped>
.analysis-view {
  padding: 20px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
}

.analysis-content {
  margin-top: 24px;
}

.analysis-content h2 {
  margin: 0 0 24px 0;
  color: #303133;
}

.analysis-summary,
.weak-analysis,
.study-suggestions {
  margin-bottom: 24px;
}

.analysis-summary h3,
.weak-analysis h3,
.study-suggestions h3 {
  margin: 0;
  color: #303133;
}

.summary-item {
  text-align: center;
}

.summary-value {
  font-size: 2rem;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 8px;
}

.summary-label {
  color: #909399;
  font-size: 14px;
}

.weak-points {
  margin-top: 16px;
}

.weak-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
}

.weak-item:last-child {
  border-bottom: none;
}

.weak-info {
  flex: 1;
}

.weak-info h4 {
  margin: 0 0 8px 0;
  color: #303133;
}

.weak-info p {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.weak-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.score {
  font-weight: bold;
  color: #303133;
}

.suggestions-list {
  margin-top: 16px;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #ebeef5;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-content h4 {
  margin: 0 0 8px 0;
  color: #303133;
}

.suggestion-content p {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}
</style>