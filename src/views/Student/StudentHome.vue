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
          <!-- 欢迎卡片 -->
          <div class="welcome-card">
            <div class="welcome-content">
              <h1 class="welcome-title">欢迎回来，{{ userName }}！</h1>
              <p class="welcome-subtitle">学号：{{ studentId }}</p>
            </div>
            <div class="welcome-icon">👋</div>
          </div>

          <!-- 统计卡片 -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📝</div>
              <div class="stat-info">
                <div class="stat-value">{{ pendingCount }}</div>
                <div class="stat-label">待提交作业</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-info">
                <div class="stat-value">{{ completedCount }}</div>
                <div class="stat-label">已完成作业</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-info">
                <div class="stat-value">{{ averageScore }}</div>
                <div class="stat-label">平均分</div>
              </div>
            </div>
          </div>

          <div class="dashboard-grid">
            <!-- 最近成绩 -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">最近成绩</h3>
                <router-link to="/student/grades" class="view-all">查看全部 →</router-link>
              </div>
              <div class="grade-list">
                <div v-for="(grade, index) in recentGrades" :key="index" class="grade-item">
                  <div class="grade-info">
                    <span class="grade-name">{{ grade.homeworkName }}</span>
                    <span class="grade-type" :class="grade.type">{{ grade.typeText }}</span>
                  </div>
                  <div class="grade-score" :class="getScoreClass(grade.score)">
                    {{ grade.score }}分
                  </div>
                </div>
              </div>
            </div>

            <!-- 系统公告 -->
            <div class="card">
              <div class="card-header">
                <h3 class="card-title">系统公告</h3>
              </div>
              <div class="announcement-list">
                <div v-for="(announcement, index) in announcements" :key="index" class="announcement-item">
                  <div class="announcement-dot"></div>
                  <div class="announcement-content">
                    <p class="announcement-title">{{ announcement.title }}</p>
                    <span class="announcement-time">{{ announcement.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 快捷入口 -->
          <div class="quick-actions">
            <h3 class="section-title">快捷入口</h3>
            <div class="action-grid">
              <router-link to="/student/submit" class="action-card">
                <div class="action-icon">📝</div>
                <span class="action-text">提交作业</span>
              </router-link>
              <router-link to="/student/grades" class="action-card">
                <div class="action-icon">📊</div>
                <span class="action-text">查看成绩</span>
              </router-link>
              <router-link to="/student/learning-aid" class="action-card">
                <div class="action-icon">📚</div>
                <span class="action-text">学习助手</span>
              </router-link>
              <router-link to="/student/quiz" class="action-card">
                <div class="action-icon">🎯</div>
                <span class="action-text">在线测试</span>
              </router-link>
            </div>
          </div>

          <!-- 待提交作业列表 -->
          <div class="card" v-if="pendingHomework.length > 0">
            <div class="card-header">
              <h3 class="card-title">待提交作业</h3>
            </div>
            <div class="homework-list">
              <div v-for="(homework, index) in pendingHomework" :key="index" class="homework-item">
                <div class="homework-info">
                  <span class="homework-name">{{ homework.name }}</span>
                  <span class="homework-type" :class="homework.type">{{ homework.typeText }}</span>
                </div>
                <div class="homework-deadline">
                  <span class="deadline-label">截止：</span>
                  <span class="deadline-time" :class="{ 'urgent': homework.isUrgent }">{{ homework.deadline }}</span>
                </div>
                <router-link :to="`/student/submit?id=${homework.id}`" class="submit-btn">
                  去提交
                </router-link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import StudentSidebar from '@/components/Student/StudentSidebar.vue'
import StudentHeader from '@/components/Student/StudentHeader.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

// 用户信息
const userName = ref('')
const studentId = ref('')

// 统计数据
const pendingCount = ref(0)
const completedCount = ref(0)
const averageScore = ref(0)

// 最近成绩
const recentGrades = ref([])

// 系统公告
const announcements = ref([])

// 待提交作业
const pendingHomework = ref([])

// 获取分数等级样式
const getScoreClass = (score) => {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 70) return 'medium'
  if (score >= 60) return 'pass'
  return 'fail'
}

onMounted(() => {
  // 从localStorage获取用户信息
  const user = localStorage.getItem('user')
  if (user) {
    const userData = JSON.parse(user)
    userName.value = userData.name || userData.username || '学生用户'
  }
})
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
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
}

/* 主内容 */
.main-content {
  flex: 1;
  padding: var(--spacing-lg);
  overflow-y: auto;
}

/* 欢迎卡片 */
.welcome-card {
  background: var(--primary-gradient);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-lg);
  margin-bottom: var(--spacing-lg);
  color: var(--text-white);
  position: relative;
  overflow: hidden;
}

.welcome-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: welcome-shine 3s infinite;
}

.welcome-content h1 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--text-white);
  position: relative;
  z-index: 1;
}

.welcome-subtitle {
  margin: 0;
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.9);
  position: relative;
  z-index: 1;
}

.welcome-icon {
  font-size: 56px;
  position: relative;
  z-index: 1;
  animation: bounce 2s infinite;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.stat-card {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary-gradient);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-normal);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.stat-card:hover::before {
  transform: scaleX(1);
}

.stat-icon {
  font-size: 40px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background: var(--primary-light);
  color: var(--primary-color);
  transition: all var(--transition-normal);
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
  background: var(--primary-gradient-light);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  font-family: 'Arial', sans-serif;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 仪表盘网格 */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

/* 卡片 */
.card {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.card-header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--bg-light);
}

.card-title {
  margin: 0;
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
}

.view-all {
  font-size: var(--font-size-sm);
  color: var(--primary-color);
  text-decoration: none;
  transition: all var(--transition-normal);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.view-all:hover {
  color: var(--primary-hover);
  transform: translateX(4px);
}

/* 成绩列表 */
.grade-list {
  padding: var(--spacing-lg);
}

.grade-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--border-color);
  transition: all var(--transition-fast);
}

.grade-item:hover {
  background: var(--bg-light);
  padding-left: var(--spacing-md);
  padding-right: var(--spacing-md);
  border-radius: var(--radius-md);
  margin: 0 -var(--spacing-md);
}

.grade-item:last-child {
  border-bottom: none;
}

.grade-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.grade-name {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: 500;
  flex: 1;
}

.grade-type {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.grade-type.objective {
  background: var(--primary-light);
  color: var(--primary-color);
}

.grade-type.semi-open {
  background: rgba(76, 175, 80, 0.1);
  color: var(--success-color);
}

.grade-type.subjective {
  background: rgba(255, 193, 7, 0.1);
  color: var(--warning-color);
}

.grade-score {
  font-size: var(--font-size-md);
  font-weight: 700;
  font-family: 'Arial', sans-serif;
  transition: all var(--transition-fast);
}

.grade-score.excellent {
  color: var(--success-color);
}

.grade-score.good {
  color: var(--primary-color);
}

.grade-score.medium {
  color: var(--warning-color);
}

.grade-score.pass {
  color: var(--purple-color);
}

.grade-score.fail {
  color: var(--error-color);
}

.grade-item:hover .grade-score {
  transform: scale(1.1);
}

/* 公告列表 */
.announcement-list {
  padding: var(--spacing-lg);
}

.announcement-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--border-color);
  transition: all var(--transition-fast);
}

.announcement-item:hover {
  background: var(--bg-light);
  padding-left: var(--spacing-md);
  padding-right: var(--spacing-md);
  border-radius: var(--radius-md);
  margin: 0 -var(--spacing-md);
}

.announcement-item:last-child {
  border-bottom: none;
}

.announcement-dot {
  width: 10px;
  height: 10px;
  background: var(--primary-gradient);
  border-radius: 50%;
  margin-top: 6px;
  flex-shrink: 0;
  box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.1);
  animation: pulse 2s infinite;
}

.announcement-content {
  flex: 1;
}

.announcement-title {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  line-height: 1.5;
  font-weight: 500;
}

.announcement-time {
  font-size: var(--font-size-xs);
  color: var(--text-light);
  font-weight: 500;
}

/* 快捷入口 */
.quick-actions {
  margin-bottom: var(--spacing-lg);
}

.section-title {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.section-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: var(--primary-gradient);
  border-radius: var(--radius-full);
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--spacing-md);
}

.action-card {
  background: var(--bg-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  text-decoration: none;
  color: var(--text-primary);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
}

.action-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary-gradient);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition-normal);
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.action-card:hover::before {
  transform: scaleX(1);
}

.action-icon {
  font-size: 40px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  background: var(--primary-light);
  color: var(--primary-color);
  transition: all var(--transition-normal);
}

.action-card:hover .action-icon {
  transform: scale(1.1) rotate(5deg);
  background: var(--primary-gradient-light);
}

.action-text {
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-align: center;
  transition: color var(--transition-normal);
}

.action-card:hover .action-text {
  color: var(--primary-color);
}

/* 待提交作业列表 */
.homework-list {
  padding: var(--spacing-lg);
}

.homework-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--border-color);
  transition: all var(--transition-fast);
}

.homework-item:hover {
  background: var(--bg-light);
  padding-left: var(--spacing-md);
  padding-right: var(--spacing-md);
  border-radius: var(--radius-md);
  margin: 0 -var(--spacing-md);
}

.homework-item:last-child {
  border-bottom: none;
}

.homework-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex: 1;
}

.homework-name {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: 500;
  flex: 1;
}

.homework-type {
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.homework-type.objective {
  background: var(--primary-light);
  color: var(--primary-color);
}

.homework-type.semi-open {
  background: rgba(76, 175, 80, 0.1);
  color: var(--success-color);
}

.homework-type.subjective {
  background: rgba(255, 193, 7, 0.1);
  color: var(--warning-color);
}

.homework-deadline {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  margin: 0 var(--spacing-md);
  flex-shrink: 0;
  min-width: 150px;
}

.deadline-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
}

.deadline-time {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: 600;
  font-family: 'Arial', sans-serif;
  transition: all var(--transition-fast);
}

.deadline-time.urgent {
  color: var(--error-color);
  animation: pulse 1s infinite;
}

.submit-btn {
  background: var(--primary-gradient);
  color: var(--text-white);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: 600;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 动画 */
@keyframes welcome-shine {
  0% {
    transform: translateX(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) rotate(45deg);
  }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-area {
    margin-left: 0;
  }

  .main-content {
    padding: var(--spacing-md);
  }

  .welcome-card {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
    padding: var(--spacing-lg);
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .action-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-sm);
  }

  .action-card {
    padding: var(--spacing-md);
  }

  .action-icon {
    font-size: 32px;
    width: 50px;
    height: 50px;
  }

  .homework-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .homework-deadline {
    margin: 0;
    min-width: auto;
  }

  .submit-btn {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .action-grid {
    grid-template-columns: 1fr;
  }

  .welcome-card h1 {
    font-size: var(--font-size-xl);
  }

  .stat-value {
    font-size: var(--font-size-xl);
  }
}
</style>