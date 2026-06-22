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
                  <button class="btn btn-secondary" @click.stop="uploadAnswer(homework.assignmentId)">上传参考答案</button>
                  <button class="btn btn-outline" @click.stop="viewReferenceAnswer(homework.assignmentId)">查看参考答案</button>
                  <button class="btn btn-outline" @click.stop="downloadReferenceAnswer(homework.assignmentId)">下载参考答案</button>
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

<script>
import { teacherAPI } from '@/services/api.js'

export default {
  name: 'TeacherHomeworkList',
  methods: {
    async uploadAnswer(assignmentId) {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.pdf'
      input.style.display = 'none'

      input.addEventListener('change', async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.name.toLowerCase().endsWith('.pdf')) {
          alert('请上传PDF格式的文件')
          return
        }

        try {
          const response = await teacherAPI.uploadAnswer(assignmentId, file)
          if (response.code === 200) {
            alert('参考答案上传成功')
            this.$emit('refresh')
          } else {
            alert(response.message || '上传失败')
          }
        } catch (error) {
          console.error('上传参考答案失败:', error)
          alert('上传失败，请稍后重试')
        }
      })

      document.body.appendChild(input)
      input.click()
      document.body.removeChild(input)
    }
  }
}
</script>

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
const lastLoadTime = ref(0) // 上次加载时间戳，用于简单缓存

// 加载作业列表（带简单缓存，5分钟内不重复加载）
const loadHomeworkList = async (forceRefresh = false) => {
  // 检查缓存是否有效（5分钟内）
  const now = Date.now()
  if (!forceRefresh && now - lastLoadTime.value < 5 * 60 * 1000 && homeworkList.value.length > 0) {
    console.log('使用缓存数据')
    return
  }

  loading.value = true
  try {
    // 并行获取作业列表和待批改作业
    const [listResponse, uncheckedResponse] = await Promise.all([
      teacherAPI.getAssignmentList(),
      teacherAPI.getUncheckedHomeworks()
    ])

    if (listResponse.code === 200) {
      const uncheckedHomeworksMap = {}
      if (uncheckedResponse.code === 200 && uncheckedResponse.data) {
        uncheckedResponse.data.forEach(hw => {
          uncheckedHomeworksMap[hw.assignmentId] = hw.ungradedCount
        })
      }

      // 检查后端是否已经返回状态信息（减少N+1查询）
      const hasStatusInfo = listResponse.data.some(item =>
        item.submittedCount !== null && item.submittedCount !== undefined &&
        item.totalStudents !== null && item.totalStudents !== undefined
      )

      if (hasStatusInfo) {
        // 后端已返回状态信息，直接使用
        homeworkList.value = listResponse.data.map(item => ({
          ...item,
          submittedCount: item.submittedCount || 0,
          totalCount: item.totalStudents || 0,
          ungradedCount: uncheckedHomeworksMap[item.assignmentId] || 0,
          description: item.description || '点击查看详情'
        }))
      } else {
        // 后端没有返回状态信息，需要逐个获取（这是后端API设计问题）
        // 分批次获取，每个批次5个请求，避免过多并发
        const batchSize = 5
        const allHomework = []
        const homeworkData = listResponse.data

        for (let i = 0; i < homeworkData.length; i += batchSize) {
          const batch = homeworkData.slice(i, i + batchSize)
          const batchResults = await Promise.all(
            batch.map(async (item) => {
              try {
                const statusResponse = await teacherAPI.getAssignmentStatus(item.assignmentId)
                return {
                  ...item,
                  submittedCount: statusResponse.data?.submittedCount || 0,
                  totalCount: statusResponse.data?.totalStudents || 0,
                  ungradedCount: uncheckedHomeworksMap[item.assignmentId] || 0,
                  description: '点击查看详情'
                }
              } catch (error) {
                return {
                  ...item,
                  submittedCount: 0,
                  totalCount: 0,
                  ungradedCount: uncheckedHomeworksMap[item.assignmentId] || 0,
                  description: '点击查看详情'
                }
              }
            })
          )
          allHomework.push(...batchResults)
        }
        homeworkList.value = allHomework
      }
    }
  } catch (error) {
    console.error('加载作业列表失败:', error)
    // 不显示错误弹窗，保持homeworkList为空，显示空状态
    homeworkList.value = []
  } finally {
    loading.value = false
    lastLoadTime.value = Date.now() // 更新缓存时间戳
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

// 查看参考答案
const viewReferenceAnswer = async (assignmentId) => {
  try {
    await teacherAPI.viewAssignmentReferenceAnswer(assignmentId)
  } catch (error) {
    console.error('查看参考答案失败:', error)
    alert('查看失败，请稍后重试')
  }
}

// 下载参考答案
const downloadReferenceAnswer = async (assignmentId) => {
  try {
    await teacherAPI.downloadAssignmentReferenceAnswer(assignmentId)
  } catch (error) {
    console.error('下载参考答案失败:', error)
    alert('下载失败，请稍后重试')
  }
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

.btn-secondary {
  background: #6c757d;
  color: white;
  margin-left: 8px;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-outline {
  background: transparent;
  color: #4a90e2;
  border: 1px solid #4a90e2;
  margin-left: 8px;
}

.btn-outline:hover {
  background: #4a90e2;
  color: white;
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
