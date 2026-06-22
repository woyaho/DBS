<template>
  <div class="page-layout">
    <TeacherHeader />
    <div class="content-container">
      <TeacherSidebar />
      <div class="content-area">
        <main class="main-content">
          <div class="page-header">
            <div class="header-content">
              <div>
                <h1 class="page-title">{{ paperData.paper_name }}</h1>
                <p class="page-subtitle">试卷详情 - 共 {{ questions.length }} 道题目</p>
              </div>
              <div class="header-actions">
                <el-button size="small" @click="goBack" class="back-btn">
                  <span class="btn-icon">←</span>
                  返回列表
                </el-button>
              </div>
            </div>
          </div>

          <div class="paper-summary">
            <div class="summary-card">
              <div class="summary-item">
                <span class="summary-label">总分</span>
                <span class="summary-value">{{ paperData.total_score }}分</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">题目数量</span>
                <span class="summary-value">{{ questions.length }}道</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">预计用时</span>
                <span class="summary-value">{{ paperData.total_estimated_time }}分钟</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">生成时间</span>
                <span class="summary-value">{{ paperData.created_at }}</span>
              </div>
            </div>

            <div v-if="paperData.coverage_analysis" class="analysis-card">
              <h3 class="analysis-title">📊 覆盖分析</h3>
              <p class="analysis-content">{{ paperData.coverage_analysis }}</p>
            </div>
          </div>

          <div class="questions-section">
            <div
              v-for="(question, index) in questions"
              :key="question.question_id"
              class="question-card"
            >
              <div class="question-header">
                <span class="question-number">{{ index + 1 }}</span>
                <span class="question-type">{{ question.question_type }}</span>
                <span class="question-difficulty" :class="question.difficulty">{{ question.difficulty }}</span>
                <span class="question-score">{{ question.score }}分</span>
              </div>

              <div class="question-content">
                <p>{{ question.question_content }}</p>
              </div>

              <div v-if="question.options && question.options.length" class="question-options">
                <div
                  v-for="(option, optIndex) in question.options"
                  :key="optIndex"
                  class="option-item"
                >
                  <span class="option-label">{{ String.fromCharCode(65 + optIndex) }}.</span>
                  <span class="option-content">{{ option }}</span>
                </div>
              </div>

              <div class="answer-section">
                <div class="answer-card">
                  <div class="answer-header">
                    <span class="answer-icon">✅</span>
                    <span class="answer-title">参考答案</span>
                  </div>
                  <div class="answer-content">
                    <p>{{ question.reference_answer || '暂无参考答案' }}</p>
                  </div>
                </div>

                <div v-if="question.grading_points && question.grading_points.length" class="grading-card">
                  <div class="grading-header">
                    <span class="grading-icon">📝</span>
                    <span class="grading-title">评分要点</span>
                  </div>
                  <div class="grading-content">
                    <ul>
                      <li v-for="(point, i) in question.grading_points" :key="i">
                        {{ point }}
                      </li>
                    </ul>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import TeacherSidebar from '@/components/Teacher/TeacherSidebar.vue'
import TeacherHeader from '@/components/Teacher/TeacherHeader.vue'
import { smartPaperAPI } from '@/services/api.js'

const route = useRoute()
const router = useRouter()
const paperId = computed(() => route.params.paperId)
const loading = ref(true)

const paperData = ref({
  paper_name: '',
  total_score: 0,
  total_estimated_time: 0,
  created_at: '',
  coverage_analysis: ''
})

const questions = ref([])

const goBack = () => {
  router.push('/teacher/smart-paper/list')
}

// 将UTC时间字符串转换为本地时间
const parseUTCTime = (timeStr) => {
  // 匹配格式: YYYY-MM-DD HH:mm:ss
  const match = timeStr.match(/(\d{4})[-/](\d{2})[-/](\d{2})\s+(\d{2}):(\d{2}):(\d{2})/)
  if (match) {
    // 假设后端返回的是UTC时间，创建UTC时间对象
    const utcDate = new Date(
      Date.UTC(
        parseInt(match[1]),
        parseInt(match[2]) - 1,
        parseInt(match[3]),
        parseInt(match[4]),
        parseInt(match[5]),
        parseInt(match[6])
      )
    )
    return utcDate
  }
  // 如果格式不匹配，尝试默认解析
  return new Date(timeStr)
}

const loadPaperDetail = async () => {
  loading.value = true
  try {
    const response = await smartPaperAPI.getPaperDetail(paperId.value)
    console.log('========== 试卷详情响应 ==========')
    console.log('原始响应:', response)
    if (response.code === 200 && response.data) {
      const data = response.data
      const paper = data.paper || data

      console.log('paper.created_at:', paper.created_at)
      console.log('typeof created_at:', typeof paper.created_at)

      // 尝试解析时间（假设后端返回的是UTC时间）
      let formattedTime = paper.created_at || ''
      if (paper.created_at) {
        try {
          const date = parseUTCTime(paper.created_at)
          console.log('解析后的Date对象:', date)
          console.log('getTime:', date.getTime())
          if (!isNaN(date.getTime())) {
            formattedTime = date.toLocaleString('zh-CN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            })
          }
        } catch (e) {
          console.error('时间解析失败:', e)
        }
      }

      paperData.value = {
        paper_name: paper.paper_name || '未命名试卷',
        total_score: paper.result?.total_score || 0,
        total_estimated_time: paper.result?.total_estimated_time || 0,
        created_at: formattedTime,
        coverage_analysis: paper.result?.coverage_analysis || ''
      }

      const questionsData = paper.result?.questions || paper.questions || []
      questions.value = questionsData
    } else {
      ElMessage.error(response.message || '获取试卷详情失败')
    }
  } catch (error) {
    console.error('获取试卷详情失败:', error)
    ElMessage.error('获取试卷详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadPaperDetail()
})

watch(paperId, (newId) => {
  if (newId) {
    loadPaperDetail()
  }
})
</script>

<style scoped>
.page-layout {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
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
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
}

.main-content {
  flex: 1;
  padding: 40px 60px;
  overflow-y: auto;
}

.page-header {
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a2a3a;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 40px;
  border-radius: 10px;
  border: 2px solid #4a90e2;
  color: #4a90e2;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  background: #ffffff;
  min-width: 200px;
}

.back-btn:hover {
  color: #ffffff;
  background: #4a90e2;
}

.btn-icon {
  font-size: 16px;
  font-weight: 600;
}

.paper-summary {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.summary-card {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: 13px;
  color: #6c757d;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
  color: #1a2a3a;
}

.analysis-card {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border-radius: 12px;
  padding: 20px;
  border-left: 4px solid #ff9800;
}

.analysis-title {
  font-size: 16px;
  font-weight: 600;
  color: #e65100;
  margin: 0 0 12px 0;
}

.analysis-content {
  font-size: 14px;
  color: #5d4037;
  line-height: 1.8;
  margin: 0;
}

.questions-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.question-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06);
  border: 1px solid #e9ecef;
}

.question-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.question-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: #ffffff;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 600;
}

.question-type {
  padding: 6px 14px;
  background: rgba(74, 144, 226, 0.1);
  color: #4a90e2;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.question-difficulty {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.question-difficulty.简单 {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.question-difficulty.中等 {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.question-difficulty.困难 {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.question-score {
  margin-left: auto;
  font-size: 14px;
  font-weight: 600;
  color: #1a2a3a;
}

.question-content {
  margin-bottom: 20px;
}

.question-content p {
  font-size: 16px;
  line-height: 1.8;
  color: #2d3436;
  margin: 0;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  padding-left: 20px;
}

.option-item {
  display: flex;
  gap: 10px;
}

.option-label {
  font-weight: 600;
  color: #4a90e2;
}

.option-content {
  font-size: 15px;
  color: #343a40;
  line-height: 1.6;
}

.answer-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.answer-card {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-radius: 10px;
  padding: 20px;
  border-left: 4px solid #4caf50;
}

.answer-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.answer-icon {
  font-size: 18px;
}

.answer-title {
  font-size: 15px;
  font-weight: 600;
  color: #2e7d32;
}

.answer-content p {
  font-size: 15px;
  line-height: 1.8;
  color: #1b5e20;
  margin: 0;
}

.grading-card {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 10px;
  padding: 20px;
  border-left: 4px solid #2196f3;
}

.grading-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.grading-icon {
  font-size: 18px;
}

.grading-title {
  font-size: 15px;
  font-weight: 600;
  color: #1565c0;
}

.grading-content ul {
  margin: 0;
  padding-left: 20px;
}

.grading-content li {
  font-size: 14px;
  line-height: 1.8;
  color: #0d47a1;
  margin-bottom: 8px;
}

.grading-content li:last-child {
  margin-bottom: 0;
}

@media print {
  .content-area {
    margin-left: 0;
    margin-top: 0;
  }

  .header-actions {
    display: none;
  }

  .back-btn,
  .print-btn {
    display: none;
  }
}

@media (max-width: 768px) {
  .content-area {
    margin-left: 0;
  }

  .header-content {
    flex-direction: column;
    gap: 16px;
  }

  .summary-card {
    flex-direction: column;
  }
}
</style>
