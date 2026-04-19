<template>
  <div class="page-layout">
    <!-- 栏头 -->
    <TeacherHeader />
    
    <div class="content-container">
      <!-- 侧边栏 -->
      <TeacherSidebar />

      <!-- 主内容区 -->
      <div class="content-area">
        <!-- 面包屑导航 -->
        <Breadcrumb />

        <main class="main-content">
          <!-- 统计卡片 -->
          <div class="stats-grid">
            <div class="stat-card">
              <h3>待批改作业</h3>
              <p style="font-size: 32px; font-weight: bold; color: var(--warning-color);">{{ pendingCount }}</p>
              <p>份作业待处理</p>
            </div>
            <div class="stat-card">
              <h3>班级人数</h3>
              <p style="font-size: 32px; font-weight: bold; color: var(--primary-color);">48</p>
              <p>人 · 高三(1)班</p>
            </div>
            <div class="stat-card">
              <h3>今日课程</h3>
              <p style="font-size: 32px; font-weight: bold; color: var(--success-color);">3</p>
              <p>节 · 剩余2节</p>
            </div>
          </div>

          <!-- 快捷操作 -->
          <div class="card">
            <h3>快捷操作</h3>
            <div style="display: flex; gap: 16px; margin-top: 16px;">
              <button class="btn btn-primary" @click="goToHomeworkReview">开始批改作业</button>
              <button class="btn btn-secondary">智能备课助手</button>
              <button class="btn btn-secondary">发布班级通知</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TeacherSidebar from '@/components/Teacher/TeacherSidebar.vue'
import TeacherHeader from '@/components/Teacher/TeacherHeader.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

const router = useRouter()
const pendingCount = ref(12)

onMounted(() => {
  // 可以在这里加载统计数据
})

const goToHomeworkReview = () => {
  router.push('/teacher/homework')
}
</script>

<style scoped>
/* 页面布局 */
.page-layout {
  min-height: 100vh;
  background: #F0F2F5;
  display: flex;
  flex-direction: column;
}

/* 内容容器 */
.content-container {
  display: flex;
  flex: 1;
  min-height: 0;
}

/* 主内容区 */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 200px;
  width: calc(100% - 200px);
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 24px 24px 24px 12px;
  overflow-y: auto;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.stat-card h3 {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 12px;
}

.stat-card p {
  font-size: 13px;
  color: #6c757d;
  margin: 0;
}

/* 快捷操作卡片 */
.card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a2a3a;
  margin-bottom: 16px;
}

/* 按钮样式 */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #4a90e2;
  color: white;
}

.btn-primary:hover {
  background: #357abd;
}

.btn-secondary {
  background: #e9ecef;
  color: #495057;
}

.btn-secondary:hover {
  background: #dee2e6;
}

/* 响应式 */
@media (max-width: 768px) {
  .content-area {
    margin-left: 0;
    width: 100%;
  }

  .main-content {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .card > div {
    flex-direction: column;
  }
}
</style>
