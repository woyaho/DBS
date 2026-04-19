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
          <!-- 统计卡片 -->
          <div class="stats-grid">
            <div class="stat-card">
              <h3>总用户数</h3>
              <p style="font-size: 32px; font-weight: bold; color: var(--primary-color);">1,284</p>
              <p>其中学生 1,056 人，教师 128 人</p>
            </div>
            <div class="stat-card">
              <h3>今日访问</h3>
              <p style="font-size: 32px; font-weight: bold; color: var(--success-color);">342</p>
              <p>较昨日 +12%</p>
            </div>
            <div class="stat-card">
              <h3>系统状态</h3>
              <p style="font-size: 32px; font-weight: bold; color: var(--success-color);">正常</p>
              <p>CPU 23% · 内存 45%</p>
            </div>
          </div>

          <!-- 待处理事项 -->
          <div class="card">
            <h3>待处理事项</h3>
            <ul style="margin-top: 16px; list-style: none;">
              <li style="padding: 12px 0; border-bottom: 1px solid var(--border-color);">🔄 3 个用户账号待审核</li>
              <li style="padding: 12px 0; border-bottom: 1px solid var(--border-color);">📝 2 条系统反馈待回复</li>
              <li style="padding: 12px 0;">⚠️ 1 条异常登录告警</li>
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

const router = useRouter()
const userName = ref('管理员')
const activeUsers = ref(342)
const dropdownOpen = ref(false)

onMounted(() => {
  const user = localStorage.getItem('user')
  if (user) {
    const userData = JSON.parse(user)
    userName.value = userData.name || userData.username
  }

  // 点击外部关闭下拉菜单
  document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.user-dropdown')
    if (dropdown && !dropdown.contains(e.target)) {
      dropdownOpen.value = false
    }
  })
})

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
