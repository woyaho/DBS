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
          <div class="homework-list-container">
            <!-- 页面标题 -->
            <div class="page-header">
              <h1 class="page-title">作业管理</h1>
            </div>

            <!-- 待批改作业提醒 -->
            <div class="notification-card" v-if="uncheckedHomeworks.length > 0">
              <div class="notification-header">
                <span class="notification-icon">📌</span>
                <h3>待批改作业提醒</h3>
              </div>
              <div class="notification-content">
                <div v-for="homework in uncheckedHomeworks" :key="homework.assignmentId" class="notification-item">
                  <span class="homework-title">{{ homework.title }}</span>
                  <span class="homework-info">{{ homework.ungradedCount }}份待批改</span>
                  <button class="btn btn-primary" @click="navigateToReview(homework.assignmentId)">去批改</button>
                </div>
              </div>
            </div>

            <!-- 作业列表 -->
            <div class="homework-list">
              <div
                v-for="homework in homeworkList"
                :key="homework.assignmentId"
                class="homework-item"
                :class="{ 'expired': isExpired(homework.endTime) }"
                @click="navigateToReview(homework.assignmentId)"
              >
                <div class="homework-info">
                  <h3 class="homework-title">{{ homework.title }}</h3>
                  <div class="homework-meta">
                    <span class="meta-item">
                      <span class="meta-label">截止时间：</span>
                      <span class="meta-value">{{ formatDateTime(homework.endTime) }}</span>
                    </span>
                    <span class="meta-item">
                      <span class="meta-label">提交人数：</span>
                      <span class="meta-value">{{ homework.submittedCount || 0 }}/{{ homework.totalCount || 0 }}</span>
                    </span>
                    <span class="meta-item">
                      <span class="meta-label">待批改：</span>
                      <span class="meta-value">{{ homework.ungradedCount || 0 }}</span>
                    </span>
                    <span class="meta-item">
                      <span class="meta-label">状态：</span>
                      <span class="meta-value" :class="getStatusClass(homework)">
                        {{ getStatusText(homework) }}
                      </span>
                    </span>
                  </div>
                  <p class="homework-desc">{{ homework.description || '点击查看详情' }}</p>
                </div>
                <div class="homework-action">
                  <button class="btn btn-primary">批改作业</button>
                </div>
              </div>
              
              <!-- 空状态 -->
              <div v-if="homeworkList.length === 0" class="empty-state">
                <div class="empty-icon">📭</div>
                <h3>暂无作业</h3>
                <p>当前没有作业需要批改，稍后再来查看吧</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import TeacherSidebar from '@/components/Teacher/TeacherSidebar.vue'
import TeacherHeader from '@/components/Teacher/TeacherHeader.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { teacherAPI } from '@/services/api.js'

const router = useRouter()
const homeworkList = ref([])
const uncheckedHomeworks = ref([])
const loading = ref(false)

// 加载作业列表
const loadHomeworkList = async () => {
  loading.value = true
  try {
    // 获取作业列表
    const response = await teacherAPI.getAssignmentList()
    if (response.code === 200) {
      // 获取每个作业的状态
      const homeworkWithStatus = await Promise.all(
        response.data.map(async (item) => {
          try {
            const statusResponse = await teacherAPI.getAssignmentStatus(item.assignmentId)
            const uncheckedResponse = await teacherAPI.getUncheckedHomeworks()
            const uncheckedHomework = uncheckedResponse.data.find(hw => hw.assignmentId === item.assignmentId)
            return {
              ...item,
              submittedCount: statusResponse.data.submittedCount,
              totalCount: statusResponse.data.totalStudents,
              ungradedCount: uncheckedHomework ? uncheckedHomework.ungradedCount : 0,
              description: '点击查看详情'
            }
          } catch (error) {
            return {
              ...item,
              submittedCount: 0,
              totalCount: 0,
              ungradedCount: 0,
              description: '点击查看详情'
            }
          }
        })
      )
      homeworkList.value = homeworkWithStatus
    }
  } catch (error) {
    console.error('加载作业列表失败:', error)
    // 不显示错误弹窗，保持homeworkList为空，显示空状态
    homeworkList.value = []
  } finally {
    loading.value = false
  }
}

// 加载待批改作业
const loadUncheckedHomeworks = async () => {
  try {
    const response = await teacherAPI.getUncheckedHomeworks()
    if (response.code === 200) {
      uncheckedHomeworks.value = response.data
    }
  } catch (error) {
    console.error('加载待批改作业失败:', error)
    // 不显示错误弹窗，保持uncheckedHomeworks为空
    uncheckedHomeworks.value = []
  }
}

// 导航到批改页面
const navigateToReview = (assignmentId) => {
  router.push(`/teacher/homework/review/${assignmentId}`)
}

// 格式化日期时间
const formatDateTime = (dateTimeString) => {
  const date = new Date(dateTimeString)
  if (isNaN(date.getTime())) {
    return dateTimeString
  }
  return date.toLocaleString('zh-CN')
}

// 检查作业是否已过期
const isExpired = (endTime) => {
  const now = new Date()
  const endDate = new Date(endTime)
  return now > endDate
}

// 获取作业状态文本
const getStatusText = (homework) => {
  if (isExpired(homework.endTime)) {
    return '已截止'
  }
  if (homework.ungradedCount > 0) {
    return '批改中'
  }
  if (homework.submittedCount === homework.totalCount) {
    return '已完成'
  }
  return '进行中'
}

// 获取状态样式类
const getStatusClass = (homework) => {
  if (isExpired(homework.endTime)) {
    return 'expired'
  }
  if (homework.ungradedCount > 0) {
    return 'grading'
  }
  if (homework.submittedCount === homework.totalCount) {
    return 'completed'
  }
  return 'ongoing'
}

// 页面加载时获取数据
onMounted(async () => {
  await loadHomeworkList()
  await loadUncheckedHomeworks()
})
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

.homework-list-container {
  max-width: 100%;
  margin: 0;
}

/* 页面头部 */
.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 26px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0;
}

/* 通知卡片 */
.notification-card {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.notification-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.notification-icon {
  font-size: 20px;
}

.notification-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #856404;
  margin: 0;
}

.notification-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  border-left: 4px solid #ffc107;
}

.notification-item .homework-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
}

.notification-item .homework-info {
  font-size: 13px;
  color: #6c757d;
  margin: 0 12px;
}

/* 作业列表 */
.homework-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.homework-item {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid #4a90e2;
}

.homework-item:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.homework-item.expired {
  border-left-color: #d32f2f;
  opacity: 0.8;
}

.homework-info {
  flex: 1;
  margin-right: 20px;
}

.homework-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0 0 12px 0;
}

.homework-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 12px;
  font-size: 14px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-label {
  color: #6c757d;
  margin-right: 4px;
}

.meta-value {
  color: #333;
  font-weight: 500;
}

.meta-value.ongoing {
  color: #2e7d32;
}

.meta-value.completed {
  color: #1976d2;
}

.meta-value.expired {
  color: #d32f2f;
}

.meta-value.grading {
  color: #ff9800;
}

.homework-desc {
  font-size: 14px;
  color: #555;
  margin: 0;
  line-height: 1.4;
}

.homework-action {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #4a90e2;
  color: white;
}

.btn-primary:hover {
  background: #357abd;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-top: 20px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
  line-height: 1.5;
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

  .homework-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .homework-action {
    margin-top: 16px;
    align-self: flex-end;
  }

  .homework-meta {
    flex-direction: column;
    gap: 8px;
  }

  .notification-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .notification-item .homework-info {
    margin: 0;
  }

  .notification-item .btn {
    align-self: flex-end;
  }

  .empty-state {
    padding: 40px 16px;
  }

  .empty-icon {
    font-size: 48px;
  }

  .empty-state h3 {
    font-size: 16px;
  }

  .empty-state p {
    font-size: 13px;
  }
}
</style>
