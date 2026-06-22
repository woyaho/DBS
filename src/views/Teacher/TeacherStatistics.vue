<template>
  <div class="page-layout">
    <!-- 侧边栏 -->
    <TeacherSidebar />

    <!-- 主内容区 -->
    <div class="content-area">
      <!-- 栏头 -->
      <TeacherHeader />

      <main class="main-content">
        <div class="statistics-container">
          <h1 class="page-title">成绩统计</h1>

          <!-- 知识点雷达图 -->
          <div class="card radar-card">
            <h3 class="chart-title">学生知识点雷达图</h3>
            <div class="radar-controls">
              <div class="homework-selector">
                <label>选择作业：</label>
                <select v-model="radarAssignmentId" class="select-input" @change="loadStudentList">
                  <option value="">请选择作业</option>
                  <option v-for="homework in homeworkList" :key="homework.id" :value="homework.id">
                    {{ homework.name }}
                  </option>
                </select>
              </div>
              <div class="student-selector">
                <label>选择学生：</label>
                <select v-model="selectedStudentUsername" class="select-input" @change="loadStudentRadar">
                  <option value="">请选择学生</option>
                  <option v-for="student in studentList" :key="student.username" :value="student.username">
                    {{ student.name }} ({{ student.username }})
                  </option>
                </select>
              </div>
            </div>
            <div class="radar-content">
              <div v-if="radarData.loading" class="loading-state">
                <div class="loading-icon">⏳</div>
                <p>加载中...</p>
              </div>
              <div v-else-if="radarData.error" class="error-state">
                <div class="error-icon">❌</div>
                <p>{{ radarData.error }}</p>
              </div>
              <div v-else-if="radarData.data" class="radar-chart-wrapper">
                <RadarChart
                  :data="radarData.data.personalScores"
                  :compare-data="radarData.data.classAverage"
                  :size="280"
                />
                <div class="radar-scores">
                  <h4>{{ selectedStudentName }} 的各维度得分</h4>
                  <div class="score-list">
                    <div v-for="(score, index) in radarData.data.personalScores" :key="index" class="score-item">
                      <span class="score-label">{{ dimensions[index] }}</span>
                      <span class="score-value">{{ score }}分</span>
                      <span v-if="radarData.data.classAverage[index]" class="score-compare">
                        (班级平均: {{ radarData.data.classAverage[index] }}分)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <div class="empty-icon">📈</div>
                <p>请选择作业和学生查看雷达图</p>
              </div>
            </div>
          </div>

          <!-- 统计卡片 -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📊</div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.averageScore.toFixed(1) }}</div>
                <div class="stat-label">平均分</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🏆</div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.highestScore }}</div>
                <div class="stat-label">最高分</div>
                <div class="stat-detail">{{ statistics.highestScoreStudent }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📉</div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.lowestScore }}</div>
                <div class="stat-label">最低分</div>
                <div class="stat-detail">{{ statistics.lowestScoreStudent }}</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🌟</div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.excellentRate.toFixed(1) }}%</div>
                <div class="stat-label">优秀率</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">✅</div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.passRate.toFixed(1) }}%</div>
                <div class="stat-label">及格率</div>
              </div>
            </div>
          </div>

          <!-- 图表区域 -->
          <div class="charts-grid">
            <!-- 成绩分布饼图 -->
            <div class="card chart-card">
              <h3 class="chart-title">成绩分布饼图</h3>
              <div class="chart-container">
                <div class="pie-chart">
                  <div
                    v-for="(item, index) in scoreDistribution"
                    :key="index"
                    class="pie-slice"
                    :style="{
                      backgroundColor: item.color,
                      transform: `rotate(${item.startAngle}deg) translate(100px) rotate(-${item.startAngle}deg)`,
                      clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos(item.startAngle * Math.PI / 180)}% ${50 - 50 * Math.sin(item.startAngle * Math.PI / 180)}%, ${50 + 50 * Math.cos(item.endAngle * Math.PI / 180)}% ${50 - 50 * Math.sin(item.endAngle * Math.PI / 180)}%)`
                    }"
                  ></div>
                  <div class="pie-center">
                    <div class="center-text">成绩分布</div>
                  </div>
                </div>
                <div class="chart-legend">
                  <div
                    v-for="(item, index) in scoreDistribution"
                    :key="index"
                    class="legend-item"
                  >
                    <div class="legend-color" :style="{ backgroundColor: item.color }"></div>
                    <span class="legend-label">{{ item.label }}</span>
                    <span class="legend-value">{{ item.count }}人</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 成绩分布柱状图 -->
            <div class="card chart-card">
              <h3 class="chart-title">成绩分布柱状图</h3>
              <div class="chart-container">
                <div class="bar-chart">
                  <div
                    v-for="(item, index) in scoreDistribution"
                    :key="index"
                    class="bar-item"
                  >
                    <div
                      class="bar"
                      :style="{
                        height: (item.count / maxCount * 100) + '%',
                        backgroundColor: item.color
                      }"
                    ></div>
                    <div class="bar-label">{{ item.label }}</div>
                    <div class="bar-value">{{ item.count }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 抄袭统计 -->
          <div class="card plagiarism-card">
            <h3 class="card-title">抄袭统计</h3>
            <div class="plagiarism-info">
              <div class="plagiarism-stats">
                <div class="plagiarism-count">
                  <span class="count-number">{{ statistics.plagiarismCount }}</span>
                  <span class="count-label">疑似抄袭人数</span>
                </div>
              </div>
              <div class="plagiarism-action">
                <button class="btn-primary" @click="viewPlagiarismList">
                  查看抄袭作业列表
                </button>
              </div>
            </div>
          </div>

          <!-- 导出报表按钮 -->
          <div class="export-section">
            <button class="btn-primary" @click="exportReport('pdf')">
              导出 PDF 报表
            </button>
            <button class="btn-secondary" @click="exportReport('excel')">
              导出 Excel 报表
            </button>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TeacherSidebar from '@/components/Teacher/TeacherSidebar.vue'
import TeacherHeader from '@/components/Teacher/TeacherHeader.vue'
import RadarChart from '@/components/RadarChart.vue'
import { teacherAPI } from '@/services/api'

const router = useRouter()
const selectedHomeworkId = ref('')

// 作业列表
const homeworkList = ref([])

// 统计数据
const statistics = ref({
  averageScore: 0,
  highestScore: 0,
  highestScoreStudent: '-',
  lowestScore: 0,
  lowestScoreStudent: '-',
  excellentRate: 0,
  passRate: 0,
  plagiarismCount: 0
})

// 成绩分布数据
const scoreDistribution = ref([])

// 雷达图相关
const radarAssignmentId = ref('')
const studentList = ref([])
const selectedStudentUsername = ref('')
const selectedStudentName = ref('')
const dimensions = ['数据建模', 'SQL查询', '数据库设计', '事务处理', '性能优化', '安全管理']
const radarData = ref({
  loading: false,
  error: '',
  data: null
})

// 加载学生列表
const loadStudentList = async () => {
  studentList.value = []
  selectedStudentUsername.value = ''
  selectedStudentName.value = ''
  radarData.value = { loading: false, error: '', data: null }

  if (!radarAssignmentId.value) return

  try {
    const data = await teacherAPI.getAssignmentSubmissions(radarAssignmentId.value)
    const submissions = data.data || []
    studentList.value = submissions.map(s => ({
      username: s.studentUsername,
      name: s.studentName || s.studentUsername
    }))
  } catch (error) {
    console.error('加载学生列表失败:', error)
  }
}

// 加载学生雷达图数据
const loadStudentRadar = async () => {
  if (!radarAssignmentId.value || !selectedStudentUsername.value) {
    radarData.value = { loading: false, error: '', data: null }
    return
  }

  const student = studentList.value.find(s => s.username === selectedStudentUsername.value)
  selectedStudentName.value = student?.name || selectedStudentUsername.value

  radarData.value = { loading: true, error: '', data: null }

  try {
    const result = await teacherAPI.getKnowledgeRadar(radarAssignmentId.value, selectedStudentUsername.value)
    radarData.value = {
      loading: false,
      error: '',
      data: {
        personalScores: result.data?.personalScores || [0, 0, 0, 0, 0, 0],
        classAverage: result.data?.classAverage || []
      }
    }
  } catch (error) {
    radarData.value = {
      loading: false,
      error: '加载雷达图数据失败',
      data: null
    }
    console.error('加载雷达图数据失败:', error)
  }
}

// 计算最大数量用于柱状图高度
const maxCount = computed(() => {
  return Math.max(...scoreDistribution.value.map(item => item.count)) || 1
})

// 计算饼图角度
const pieChartData = computed(() => {
  const total = scoreDistribution.value.reduce((sum, item) => sum + item.count, 0)
  let currentAngle = 0
  return scoreDistribution.value.map(item => {
    const angle = (item.count / total) * 360
    const startAngle = currentAngle
    const endAngle = currentAngle + angle
    currentAngle = endAngle
    return {
      ...item,
      startAngle,
      endAngle
    }
  })
})

// 加载统计数据
const loadStatistics = () => {
  console.log('加载统计数据:', selectedHomeworkId.value)
}

// 查看抄袭作业列表
const viewPlagiarismList = () => {
  // 实际项目中这里会跳转到抄袭作业列表页面
  router.push('/teacher/homework')
}

// 导出报表
const exportReport = (format) => {
  // 实际项目中这里会调用API导出报表
  alert(`正在导出${format.toUpperCase()}报表...`)
}

// 加载作业列表
const loadHomeworkList = async () => {
  try {
    const response = await teacherAPI.getAssignmentList()
    // 适配不同的响应格式
    homeworkList.value = response.data?.homeworks || response.data?.assignments || response.data || []
    console.log('加载作业列表:', homeworkList.value)
  } catch (error) {
    console.error('加载作业列表失败:', error)
  }
}

onMounted(() => {
  loadHomeworkList()
})
</script>

<style scoped>
/* 页面布局 */
.page-layout {
  display: flex;
  min-height: 100vh;
  background: #F0F2F5;
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
  padding: 24px;
  overflow-y: auto;
}

.statistics-container {
  max-width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a2a3a;
  margin-bottom: 24px;
}

/* 作业选择 */
.homework-selector {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.homework-selector label {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.select-input {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  min-width: 200px;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  font-size: 32px;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f9ff;
  border-radius: 12px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a2a3a;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 2px;
}

.stat-detail {
  font-size: 12px;
  color: #999;
}

/* 图表网格 */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

/* 卡片样式 */
.card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 20px;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
}

.chart-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}

/* 饼图 */
.pie-chart {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
}

.pie-slice {
  position: absolute;
  width: 100%;
  height: 100%;
  transform-origin: 50% 50%;
}

.pie-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.center-text {
  font-size: 12px;
  font-weight: 500;
  color: #333;
  text-align: center;
}

/* 图例 */
.chart-legend {
  flex: 1;
  min-width: 200px;
  margin-top: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-label {
  flex: 1;
  font-size: 14px;
  color: #666;
}

.legend-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

/* 柱状图 */
.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  height: 200px;
  width: 100%;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar {
  width: 100%;
  min-height: 10px;
  border-radius: 4px 4px 0 0;
  transition: height 0.5s ease;
}

.bar-label {
  font-size: 12px;
  color: #666;
  text-align: center;
}

.bar-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

/* 抄袭统计 */
.plagiarism-card {
  margin-bottom: 24px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.plagiarism-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.plagiarism-stats {
  display: flex;
  align-items: center;
  gap: 24px;
}

.plagiarism-count {
  text-align: center;
}

.count-number {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: #d32f2f;
  margin-bottom: 4px;
}

.count-label {
  font-size: 14px;
  color: #666;
}

.plagiarism-action {
  margin-left: auto;
}

/* 导出报表 */
.export-section {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

/* 雷达图卡片 */
.radar-card {
  margin-bottom: 24px;
}

.radar-controls {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.student-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.student-selector label {
  font-size: 14px;
  color: #666;
}

.radar-content {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.radar-chart-wrapper {
  display: flex;
  align-items: center;
  gap: 40px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.radar-scores {
  flex: 1;
  min-width: 200px;
}

.radar-scores h4 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.score-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.score-label {
  font-size: 14px;
  color: #666;
  min-width: 80px;
}

.score-value {
  font-size: 14px;
  font-weight: 600;
  color: #4a90e2;
}

.score-compare {
  font-size: 12px;
  color: #999;
}

/* 加载状态 */
.loading-state,
.error-state {
  text-align: center;
  padding: 48px 20px;
}

.loading-icon,
.error-icon {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.loading-state p,
.error-state p {
  color: #666;
  font-size: 14px;
}

.error-state {
  color: #d32f2f;
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
  color: #666;
  font-size: 14px;
}

/* 按钮样式 */
.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
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
  background: #e9ecef;
  color: #333;
}

.btn-secondary:hover {
  background: #dee2e6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-area {
    margin-left: 0;
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-container {
    flex-direction: column;
    align-items: center;
  }

  .plagiarism-info {
    flex-direction: column;
    align-items: stretch;
  }

  .plagiarism-action {
    margin-left: 0;
  }

  .export-section {
    justify-content: center;
  }
}
</style>
