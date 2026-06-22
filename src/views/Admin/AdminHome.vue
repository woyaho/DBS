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
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>

          <!-- 统计卡片 -->
          <div v-else class="stats-grid">
            <div class="stat-card">
              <h3>总用户数</h3>
              <p style="font-size: 32px; font-weight: bold; color: var(--primary-color);">{{ totalUsers.toLocaleString() }}</p>
              <p>其中学生 {{ studentCount.toLocaleString() }} 人，教师 {{ teacherCount.toLocaleString() }} 人</p>
            </div>
            <div class="stat-card">
              <h3>教学班总数</h3>
              <p style="font-size: 32px; font-weight: bold; color: var(--success-color);">{{ classCount }}</p>
              <p>共 {{ totalStudentsInClasses.toLocaleString() }} 名学生</p>
            </div>
            <div class="stat-card clickable" @click="goToFeedback">
              <h3>待处理反馈</h3>
              <p style="font-size: 32px; font-weight: bold; color: var(--warning-color);">{{ feedbackCount }}</p>
              <p>点击查看详情</p>
            </div>
          </div>

          <!-- 待处理事项 -->
          <div class="card">
            <h3>待处理事项</h3>
            <ul style="margin-top: 16px; list-style: none;">
              <li style="padding: 12px 0; border-bottom: 1px solid var(--border-color);">🔄 {{ pendingUsers }} 个用户账号待审核</li>
              <li style="padding: 12px 0; border-bottom: 1px solid var(--border-color);">📝 {{ feedbackCount }} 条系统反馈待回复</li>
              <li style="padding: 12px 0;">📊 数据同步完成</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidebar from '../../components/Admin/AdminSidebar.vue'
import AdminHeader from '../../components/Admin/AdminHeader.vue'
import Breadcrumb from '../../components/Breadcrumb.vue'
import { adminAPI } from '../../services/api.js'

const router = useRouter()
const userName = ref('管理员')
const dropdownOpen = ref(false)

// 统计数据
const loading = ref(true)
const totalUsers = ref(0)
const studentCount = ref(0)
const teacherCount = ref(0)
const classCount = ref(0)
const totalStudentsInClasses = ref(0)
const feedbackCount = ref(0)
const pendingUsers = ref(0)

onMounted(() => {
  const user = localStorage.getItem('user')
  if (user) {
    const userData = JSON.parse(user)
    userName.value = userData.name || userData.username
  }

  // 加载统计数据
  loadStatistics()

  // 点击外部关闭下拉菜单
  document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.user-dropdown')
    if (dropdown && !dropdown.contains(e.target)) {
      dropdownOpen.value = false
    }
  })
})

const loadStatistics = async () => {
  loading.value = true
  try {
    console.log('[DEBUG] 开始加载统计数据...')
    
    // 获取用户统计（使用专门的统计接口）
    console.log('[DEBUG] 正在调用 getUserCounts...')
    const userCountsResponse = await adminAPI.getUserCounts()
    console.log('[DEBUG] getUserCounts 响应:', JSON.stringify(userCountsResponse))
    if (userCountsResponse.code === 200 && userCountsResponse.data) {
      const counts = userCountsResponse.data
      totalUsers.value = counts.totalCount || 0
      studentCount.value = counts.studentCount || 0
      teacherCount.value = counts.teacherCount || 0
    }

    // 获取待审核用户数
    console.log('[DEBUG] 正在调用 getUserList...')
    const userResponse = await adminAPI.getUserList({})
    console.log('[DEBUG] getUserList 响应:', JSON.stringify(userResponse))
    if (userResponse.code === 200 && userResponse.data) {
      const users = userResponse.data.list || userResponse.data || []
      pendingUsers.value = users.filter(u => u.status === 'pending').length
    }

    // 获取班级统计（使用教学班级列表接口）
    console.log('[DEBUG] 正在调用 getTeachingClasses...')
    const classResponse = await adminAPI.getTeachingClasses()
    console.log('[DEBUG] getTeachingClasses 响应:', JSON.stringify(classResponse))
    if (classResponse.code === 200 && classResponse.data) {
      // 兼容两种响应格式：直接数组或嵌套在 teachingClasses 中
      const classes = classResponse.data.teachingClasses || classResponse.data
      if (Array.isArray(classes)) {
        classCount.value = classes.length
        totalStudentsInClasses.value = classes.reduce((sum, cls) => sum + (cls.studentCount || 0), 0)
      }
    }

    // 获取反馈统计
    console.log('[DEBUG] 正在调用 getFeedbacks...')
    const feedbackResponse = await adminAPI.getFeedbacks()
    console.log('[DEBUG] getFeedbacks 响应:', JSON.stringify(feedbackResponse))
    if (feedbackResponse.code === 200 && feedbackResponse.data) {
      feedbackCount.value = feedbackResponse.data.length || 0
    }

    console.log('[DEBUG] 统计数据加载完成')
  } catch (error) {
    console.error('加载统计数据失败:', error)
    console.error('错误详情:', error.message, error.stack)
    // 使用默认值
    totalUsers.value = 0
    studentCount.value = 0
    teacherCount.value = 0
    classCount.value = 0
    totalStudentsInClasses.value = 0
    feedbackCount.value = 0
    pendingUsers.value = 0
  } finally {
    loading.value = false
  }
}

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const modifyAvatar = () => {
  console.log('修改头像')
  dropdownOpen.value = false
}

const modifyPassword = () => {
  console.log('修改密码')
  dropdownOpen.value = false
}

const accountBinding = () => {
  console.log('账户绑定')
  dropdownOpen.value = false
}

const logout = () => {
  localStorage.removeItem('user')
  router.push('/login')
}

const goToFeedback = () => {
  router.push('/admin/feedback')
}
</script>

<style scoped>
/* 页面布局 */
.page-layout {
  min-height: 100vh;
  background: var(--bg-page);
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
  margin-left: 200px;
  display: flex;
  flex-direction: column;
}

/* 主内容 */
.main-content {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
  background: #f5f7fa;
}

/* 加载状态 */
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

.loading-container p {
  margin-top: 16px;
  color: #666;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.stat-card.clickable {
  cursor: pointer;
}

.stat-card.clickable:hover {
  border: 2px solid var(--warning-color);
}

.stat-card h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a2a3a;
}

@media (max-width: 768px) {
  .content-area {
    margin-left: 0;
  }

  .main-content {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
