<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="auth-header">
        <h1 class="auth-title">智慧教育</h1>
        <p class="auth-subtitle">高中数学AI辅导平台</p>
      </div>
      
      <div class="auth-form">
        <router-view />
      </div>
      
      <div class="auth-footer">
        <p>&copy; 2024 智慧教育平台. All rights reserved.</p>
      </div>
    </div>
    
    <div class="auth-background">
      <div class="auth-bg-overlay"></div>
      <div class="auth-bg-pattern"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 认证布局组件，无需额外逻辑
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.auth-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  z-index: 2;
  position: relative;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  font-size: 1rem;
  color: #718096;
  margin: 0;
}

.auth-form {
  margin-bottom: 1.5rem;
}

.auth-footer {
  text-align: center;
  font-size: 0.875rem;
  color: #a0aec0;
}

.auth-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.auth-bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
}

.auth-bg-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 2px, transparent 2px);
  background-size: 60px 60px;
}

@media (max-width: 480px) {
  .auth-container {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .auth-title {
    font-size: 1.5rem;
  }
}
</style>