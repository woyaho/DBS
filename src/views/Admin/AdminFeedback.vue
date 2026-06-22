<template>
  <div class="page-layout">
    <!-- 栏头 -->
    <AdminHeader />
    
    <div class="content-container">
      <!-- 侧边栏 -->
      <AdminSidebar />

      <!-- 主内容区 -->
      <div class="content-area">
        <!-- 面包屑导航 -->
        <Breadcrumb />

        <main class="main-content">
          <!-- 页面标题 -->
          <div class="page-header">
            <h2>反馈管理</h2>
            <p>查看和处理用户提交的反馈</p>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>

          <!-- 反馈列表 -->
          <div v-else class="feedback-list">
            <div v-if="feedbacks.length === 0" class="empty-state">
              <p>暂无反馈数据</p>
            </div>
            
            <div v-for="feedback in feedbacks" :key="feedback.id" class="feedback-card">
              <div class="feedback-header">
                <span class="feedback-id">#{{ feedback.id }}</span>
                <span class="feedback-time">{{ formatTime(feedback.createdAt) }}</span>
              </div>
              <div class="feedback-content">
                <p>{{ feedback.content }}</p>
              </div>
              <div class="feedback-footer">
                <span class="feedback-user">{{ feedback.userName }} ({{ feedback.userIdentity }})</span>
                <div class="feedback-actions">
                  <button class="btn btn-success" @click="handleResolve(feedback)">标记已处理</button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AdminSidebar from '../../components/Admin/AdminSidebar.vue'
import AdminHeader from '../../components/Admin/AdminHeader.vue'
import Breadcrumb from '../../components/Breadcrumb.vue'
import { adminAPI } from '../../services/api.js'

const loading = ref(true)
const feedbacks = ref([])

onMounted(() => {
  loadFeedbacks()
})

const loadFeedbacks = async () => {
  loading.value = true
  try {
    const response = await adminAPI.getFeedbacks()
    if (response.code === 200 && response.data) {
      feedbacks.value = response.data
    }
  } catch (error) {
    console.error('加载反馈列表失败:', error)
    feedbacks.value = []
  } finally {
    loading.value = false
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const handleResolve = async (feedback) => {
  try {
    const response = await adminAPI.markFeedbackProcessed(feedback.id)
    if (response.code === 200) {
      feedbacks.value = feedbacks.value.filter(f => f.id !== feedback.id)
      alert('标记已处理成功')
    }
  } catch (error) {
    console.error('标记处理失败:', error)
    alert('标记处理失败')
  }
}
</script>

<style scoped>
.page-layout {
  min-height: 100vh;
  background: var(--bg-page);
  display: flex;
  flex-direction: column;
}

.content-container {
  display: flex;
  flex: 1;
  min-height: 0;
}

.content-area {
  flex: 1;
  margin-left: 200px;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
  background: #f5f7fa;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1a2a3a;
}

.page-header p {
  margin: 0;
  color: #666;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: #999;
}

.feedback-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feedback-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.feedback-id {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
}

.feedback-time {
  font-size: 12px;
  color: #999;
}

.feedback-content {
  padding: 12px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.feedback-content p {
  margin: 0;
  line-height: 1.6;
  color: #333;
}

.feedback-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.feedback-user {
  font-size: 13px;
  color: #666;
}

.feedback-actions {
  display: flex;
  gap: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-color-dark);
}

.btn-success {
  background: var(--success-color);
  color: white;
}

.btn-success:hover {
  background: #2e7d32;
}

@media (max-width: 768px) {
  .content-area {
    margin-left: 0;
  }

  .main-content {
    padding: 16px;
  }

  .feedback-footer {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
}
</style>