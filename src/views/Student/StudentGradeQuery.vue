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
          <div class="grade-query-container">
            <!-- 页面标题 -->
            <div class="page-header">
              <h1 class="page-title">数据库作业成绩</h1>
              <div class="semester-selector">
                <span class="semester-label">学期：</span>
                <select v-model="selectedSemester" class="semester-select">
                  <option value="all">全部学期</option>
                  <option value="2024-2025-2">2024-2025 第二学期</option>
                  <option value="2024-2025-1">2024-2025 第一学期</option>
                </select>
              </div>
            </div>

            <!-- 成绩概览卡片 -->
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-info">
                  <div class="stat-value">{{ averageScore }}</div>
                  <div class="stat-label">作业平均分</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">🏆</div>
                <div class="stat-info">
                  <div class="stat-value">{{ highestScore }}</div>
                  <div class="stat-label">作业最高分</div>
                </div>
              </div>
            </div>

            <!-- 成绩列表表格 -->
            <div class="grade-table-card">
              <div class="table-header">
                <h3 class="section-title">作业成绩</h3>
                <div class="search-box">
                  <input type="text" v-model="searchKeyword" placeholder="搜索作业名称..." class="search-input" />
                  <span class="search-icon">🔍</span>
                </div>
              </div>

              <div class="table-responsive">
                <table class="grade-table">
                  <thead>
                    <tr>
                      <th>作业编号</th>
                      <th>作业名称</th>
                      <th>平时成绩</th>
                      <th>期末成绩</th>
                      <th>总评成绩</th>
                      <th>等级</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="course in filteredGrades" :key="course.id">
                      <td>{{ course.code }}</td>
                      <td class="course-name">{{ course.name }}</td>
                      <td>{{ course.usualScore }}</td>
                      <td>{{ course.finalScore }}</td>
                      <td class="total-score" :class="getScoreClass(course.totalScore)">
                        <strong>{{ course.totalScore }}</strong>
                      </td>
                      <td>
                        <span class="grade-level" :class="getGradeLevel(course.totalScore)">
                          {{ getGradeLetter(course.totalScore) }}
                        </span>
                      </td>
                      <td>
                        <button class="detail-btn" @click="showDetail(course)">详情</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- 空状态 -->
              <div v-if="filteredGrades.length === 0" class="empty-state">
                <div class="empty-icon">📭</div>
                <p>暂无成绩数据</p>
              </div>
            </div>



            <!-- 成绩详情弹窗 -->
            <div v-if="showDetailModal" class="modal-overlay" @click.self="closeDetail">
              <div class="modal-content">
                <div class="modal-header">
                  <h3>{{ selectedCourse?.name }} - 成绩详情</h3>
                  <button class="close-btn" @click="closeDetail">×</button>
                </div>
                <div class="modal-body" v-if="selectedCourse">
                  <div class="detail-grid">
                    <div class="detail-item">
                      <div class="detail-label">作业编号</div>
                      <div class="detail-value">{{ selectedCourse.code }}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">平时成绩</div>
                      <div class="detail-value">{{ selectedCourse.usualScore }} 分</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">期末成绩</div>
                      <div class="detail-value">{{ selectedCourse.finalScore }} 分</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">总评成绩</div>
                      <div class="detail-value highlight">{{ selectedCourse.totalScore }} 分</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">等级</div>
                      <div class="detail-value">{{ getGradeLetter(selectedCourse.totalScore) }}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">成绩排名</div>
                      <div class="detail-value">{{ selectedCourse.rank || '—' }}</div>
                    </div>
                    <div class="detail-item">
                      <div class="detail-label">任课教师</div>
                      <div class="detail-value">{{ selectedCourse.teacher || '—' }}</div>
                    </div>
                  </div>
                  <div class="teacher-comment" v-if="selectedCourse.comment">
                    <div class="comment-label">教师评语</div>
                    <div class="comment-text">{{ selectedCourse.comment }}</div>
                  </div>
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
import { ref, computed } from 'vue'
import StudentSidebar from '@/components/Student/StudentSidebar.vue'
import StudentHeader from '@/components/Student/StudentHeader.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

// 学期选择
const selectedSemester = ref('all')
const searchKeyword = ref('')
const showDetailModal = ref(false)
const selectedCourse = ref(null)

// 成绩数据
const gradesData = ref([])

// 过滤当前学期和搜索
const filteredGrades = computed(() => {
  let filtered = gradesData.value
  if (selectedSemester.value !== 'all') {
    filtered = filtered.filter(course => course.semester === selectedSemester.value)
  }
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    filtered = filtered.filter(course => course.name.toLowerCase().includes(keyword))
  }
  return filtered
})

// 计算平均分
const averageScore = computed(() => {
  if (filteredGrades.value.length === 0) return '—'
  const sum = filteredGrades.value.reduce((acc, course) => acc + course.totalScore, 0)
  return (sum / filteredGrades.value.length).toFixed(1)
})

// 计算最高分
const highestScore = computed(() => {
  if (filteredGrades.value.length === 0) return '—'
  return Math.max(...filteredGrades.value.map(c => c.totalScore))
})



// 获取成绩等级颜色
const getScoreClass = (score) => {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 70) return 'medium'
  if (score >= 60) return 'pass'
  return 'fail'
}

// 获取成绩等级字母
const getGradeLetter = (score) => {
  if (score >= 90) return 'A'
  if (score >= 85) return 'A-'
  if (score >= 82) return 'B+'
  if (score >= 78) return 'B'
  if (score >= 75) return 'B-'
  if (score >= 72) return 'C+'
  if (score >= 68) return 'C'
  if (score >= 64) return 'C-'
  if (score >= 60) return 'D'
  return 'F'
}

// 获取成绩等级（用于CSS类名）
const getGradeLevel = (score) => {
  if (score >= 90) return 'excellent'
  if (score >= 80) return 'good'
  if (score >= 70) return 'medium'
  if (score >= 60) return 'pass'
  return 'fail'
}

// 获取等级中文名称
const getGradeLevelName = (score) => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 70) return '中等'
  if (score >= 60) return '及格'
  return '不及格'
}

// 成绩分布数据
const gradeDistribution = computed(() => {
  const distribution = {
    '优秀 (90-100)': { count: 0, color: '#4caf50' },
    '良好 (80-89)': { count: 0, color: '#2196f3' },
    '中等 (70-79)': { count: 0, color: '#ff9800' },
    '及格 (60-69)': { count: 0, color: '#ffc107' },
    '不及格 (<60)': { count: 0, color: '#f44336' }
  }

  filteredGrades.value.forEach(course => {
    const score = course.totalScore
    if (score >= 90) distribution['优秀 (90-100)'].count++
    else if (score >= 80) distribution['良好 (80-89)'].count++
    else if (score >= 70) distribution['中等 (70-79)'].count++
    else if (score >= 60) distribution['及格 (60-69)'].count++
    else distribution['不及格 (<60)'].count++
  })

  const total = filteredGrades.value.length
  return Object.entries(distribution).map(([name, { count, color }]) => ({
    name,
    count,
    percentage: total === 0 ? 0 : Math.round((count / total) * 100),
    color
  }))
})

// 显示详情弹窗
const showDetail = (course) => {
  selectedCourse.value = course
  showDetailModal.value = true
}

// 关闭弹窗
const closeDetail = () => {
  showDetailModal.value = false
  selectedCourse.value = null
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

.grade-query-container {
  max-width: 100%;
  margin: 0;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 26px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0;
}

.semester-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.semester-label {
  font-size: 14px;
  color: #6c757d;
}

.semester-select {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  cursor: pointer;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 28px;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  font-size: 40px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a2a3a;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #6c757d;
  margin-top: 4px;
}

/* 成绩表格卡片 */
.grade-table-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0;
}

.search-box {
  position: relative;
}

.search-input {
  padding: 8px 32px 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  width: 220px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #adb5bd;
}

.table-responsive {
  overflow-x: auto;
}

.grade-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.grade-table th,
.grade-table td {
  padding: 14px 12px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.grade-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.grade-table tr:hover {
  background: #f8f9fa;
}

.course-name {
  font-weight: 500;
  color: #1a2a3a;
}

.total-score {
  font-weight: 600;
}

.total-score.excellent { color: #4caf50; }
.total-score.good { color: #2196f3; }
.total-score.medium { color: #ff9800; }
.total-score.pass { color: #ffc107; }
.total-score.fail { color: #f44336; }

.grade-level {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.grade-level[class*="excellent"] { background: #e8f5e9; color: #2e7d32; }
.grade-level[class*="good"] { background: #e3f2fd; color: #1976d2; }
.grade-level[class*="medium"] { background: #fff3e0; color: #ed6c02; }
.grade-level[class*="pass"] { background: #fff9c4; color: #f57c00; }
.grade-level[class*="fail"] { background: #ffebee; color: #d32f2f; }

.detail-btn {
  padding: 4px 12px;
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 12px;
  color: #4a90e2;
  cursor: pointer;
  transition: all 0.2s;
}

.detail-btn:hover {
  background: #e3f2fd;
  border-color: #4a90e2;
}

/* 成绩分布卡片 */
.distribution-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.distribution-bars {
  margin-top: 16px;
}

.distribution-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.distribution-label {
  width: 100px;
  font-size: 14px;
  color: #495057;
  font-weight: 500;
}

.distribution-bar-container {
  flex: 1;
  min-width: 200px;
  height: 28px;
  background: #e9ecef;
  border-radius: 14px;
  overflow: hidden;
}

.distribution-bar {
  height: 100%;
  border-radius: 14px;
  transition: width 0.3s ease;
}

.distribution-count {
  width: 80px;
  font-size: 13px;
  color: #6c757d;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 20px;
  width: 90%;
  max-width: 550px;
  max-height: 85vh;
  overflow-y: auto;
  animation: modalFadeIn 0.2s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1a2a3a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #adb5bd;
  line-height: 1;
}

.close-btn:hover {
  color: #495057;
}

.modal-body {
  padding: 24px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.detail-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 16px;
  font-weight: 500;
  color: #1a2a3a;
}

.detail-value.highlight {
  color: #4a90e2;
  font-size: 20px;
}

.teacher-comment {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
}

.comment-label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 8px;
}

.comment-text {
  font-size: 14px;
  line-height: 1.5;
  color: #495057;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 48px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-state p {
  color: #6c757d;
  font-size: 14px;
}

/* 响应式 */
@media (max-width: 768px) {
  .grade-query-container {
    padding: 16px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-value {
    font-size: 22px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .distribution-item {
    flex-wrap: wrap;
  }

  .distribution-bar-container {
    min-width: 100%;
    margin-top: 8px;
  }

  .distribution-count {
    width: auto;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
