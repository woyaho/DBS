<template>
  <div class="page-layout">
    <!-- 栏头 -->
    <StudentHeader />

    <div class="content-container">
      <!-- 侧边栏 -->
      <StudentSidebar />

      <!-- 主内容区 -->
      <div class="content-area">
        <!-- 面包屑导航 -->
        <Breadcrumb />

        <main class="main-content">
          <div class="homework-list-container">
            <!-- 页面标题 -->
            <h2 class="page-title">作业列表</h2>

            <!-- 作业列表 -->
            <div class="homework-list">
              <div
                v-for="homework in homeworkList"
                :key="homework.assignmentId"
                class="homework-item"
                :class="{ 'expired': isExpired(homework.endTime), 'submitted': homework.submitted }"
                @click="navigateToHomework(homework.assignmentId)"
              >
                <div class="homework-info">
                  <h3 class="homework-title">{{ homework.title }}</h3>
                  <div class="homework-meta">
                    <span class="meta-item">
                      <span class="meta-label">截止时间：</span>
                      <span class="meta-value">{{ formatDateTime(homework.endTime) }}</span>
                    </span>
                    <span class="meta-item">
                      <span class="meta-label">状态：</span>
                      <span class="meta-value" :class="getStatusClass(homework)">
                        {{ getStatusText(homework) }}
                      </span>
                    </span>
                    <span v-if="homework.score !== undefined" class="meta-item">
                      <span class="meta-label">成绩：</span>
                      <span class="meta-value score" :class="getScoreClass(homework.score)">
                        {{ homework.score }}分
                      </span>
                    </span>
                  </div>
                  <p class="homework-desc">{{ homework.description }}</p>
                </div>
                <div class="homework-action">
                  <button class="btn btn-primary">查看详情</button>
                </div>
              </div>

              <!-- 空状态 -->
              <div v-if="homeworkList.length === 0" class="empty-state">
                <div class="empty-icon">📭</div>
                <h3>暂无作业</h3>
                <p>当前没有作业，请稍后再来查看</p>
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
import { useRouter } from 'vue-router'
import StudentSidebar from '@/components/Student/StudentSidebar.vue'
import StudentHeader from '@/components/Student/StudentHeader.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { studentAPI } from '@/services/api.js'

const router = useRouter()
const homeworkList = ref([])
const loading = ref(false)

// 加载作业列表
const loadHomeworkList = async () => {
  console.log('=== loadHomeworkList 开始 ===')
  loading.value = true
  try {
    console.log('=== 调用 studentAPI.getAssignmentList() ===')
    const response = await studentAPI.getAssignmentList()

    console.log('=== 响应结果 ===', response)
    console.log('=== response.code ===', response?.code)
    console.log('=== response.data ===', response?.data)
    console.log('=== Array.isArray(response?.data) ===', Array.isArray(response?.data))

    if (response.code === 200 && response.data) {
      if (Array.isArray(response.data)) {
        homeworkList.value = response.data.map(item => ({
          ...item,
          description: item.description || '点击查看详情'
        }))
        console.log('=== 作业列表解析成功，共', homeworkList.value.length, '条 ===')
      } else {
        console.error('=== response.data 不是数组 ===')
        homeworkList.value = []
      }
    } else {
      console.error('=== 响应失败或数据为空 ===')
      homeworkList.value = []
    }
  } catch (error) {
    console.error('加载作业列表失败:', error)
    console.error('错误堆栈:', error.stack)
    homeworkList.value = []
  } finally {
    loading.value = false
    console.log('=== loadHomeworkList 结束 ===')
  }
}

// 导航到作业详情
const navigateToHomework = (homeworkId) => {
  router.push(`/student/submit?id=${homeworkId}`)
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

// 获取作业状态
const getStatusText = (homework) => {
  if (isExpired(homework.endTime)) {
    return '已截止'
  }
  if (homework.submitted) {
    return '已提交'
  }
  return '未提交'
}

// 获取状态样式类
const getStatusClass = (homework) => {
  if (isExpired(homework.endTime)) {
    return 'expired'
  }
  if (homework.submitted) {
    return 'submitted'
  }
  return 'ongoing'
}

// 获取分数样式类
const getScoreClass = (score) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 70) return 'score-medium'
  if (score >= 60) return 'score-pass'
  return 'score-fail'
}

// 页面加载时获取作业列表
onMounted(() => {
  loadHomeworkList()
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
  margin-top: 60px;
  width: calc(100% - 200px);
  min-height: calc(100vh - 60px);
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 24px 24px 24px 12px;
  overflow-y: auto;
}

.homework-list-container {
  max-width: 100%;
  margin: 10px 20px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a2a3a;
  margin-bottom: 24px;
}

/* 作业列表 */
.homework-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.homework-item {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 4px solid #4a90e2;
}

.homework-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.homework-item.expired {
  border-left-color: #d32f2f;
  opacity: 0.8;
}

.homework-item.submitted {
  border-left-color: #2e7d32;
}

.homework-info {
  flex: 1;
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
  margin-bottom: 8px;
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

.meta-value.expired {
  color: #d32f2f;
}

.meta-value.submitted {
  color: #1976d2;
}

.meta-value.grading {
  color: #ff9800;
}

.meta-value.graded {
  color: #4caf50;
}

.meta-value.score {
  font-weight: 600;
  font-size: 16px;
}

.score-excellent { color: #4caf50; }
.score-good { color: #2196f3; }
.score-medium { color: #ff9800; }
.score-pass { color: #ffc107; }
.score-fail { color: #f44336; }

.homework-desc {
  font-size: 14px;
  color: #555;
  margin: 8px 0 0 0;
  line-height: 1.4;
}

.homework-action {
  margin-left: 20px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
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

@media (max-width: 768px) {
  .content-area {
    margin-left: 0;
    width: 100%;
  }

  .homework-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .homework-action {
    margin-left: 0;
    margin-top: 16px;
    align-self: flex-end;
  }

  .homework-meta {
    flex-direction: column;
    gap: 8px;
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
