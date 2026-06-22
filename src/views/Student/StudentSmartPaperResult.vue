<template>
  <div class="page-layout">
    <StudentHeader />
    <div class="content-container">
      <StudentSidebar />
      <div class="content-area">
        <main class="main-content">
          <!-- 成绩概览 -->
          <div class="result-overview">
            <div class="overview-card">
              <div class="score-display">
                <div class="score-circle">
                  <div class="score-value">{{ score }}</div>
                  <div class="score-label">得分</div>
                </div>
                <div class="score-info">
                  <h2>{{ paperName }}</h2>
                  <div class="info-row">
                    <span class="label">总分:</span>
                    <span class="value">{{ maxScore }}分</span>
                  </div>
                  <div class="info-row" v-if="rating">
                    <span class="label">评级:</span>
                    <el-tag :type="getRatingType(rating)">{{ rating }}</el-tag>
                  </div>
                  <div class="info-row" v-if="submittedAt">
                    <span class="label">提交时间:</span>
                    <span class="value">{{ formatDate(submittedAt) }}</span>
                  </div>
                  <div class="info-row" v-if="gradedAt">
                    <span class="label">批改时间:</span>
                    <span class="value">{{ formatDate(gradedAt) }}</span>
                  </div>
                </div>
              </div>
              <div class="overview-footer">
                <el-button type="primary" @click="goToPaperList">
                  返回试卷列表
                </el-button>
              </div>
            </div>
          </div>

          <!-- 题目详情 -->
          <div class="questions-section">
            <h3 class="section-title">题目详情</h3>

            <div
              v-for="(question, index) in questions"
              :key="question.question_id"
              class="question-result-card"
            >
              <div class="question-header">
                <div class="question-number">
                  <el-tag size="small" :type="getQuestionResultType(question)" class="result-tag">
                    {{ getQuestionResultLabel(question) }}
                  </el-tag>
                  第 {{ index + 1 }} 题
                </div>
                <div class="question-meta">
                  <el-tag size="small" type="info">{{ question.question_type }}</el-tag>
                  <el-tag size="small">{{ question.difficulty }}</el-tag>
                  <span class="score-tag">{{ question.score }}分</span>
                </div>
              </div>

              <div class="question-content">
                <p class="question-text">{{ question.question_content }}</p>

                <!-- 学生答案 -->
                <div class="answer-section">
                  <div class="answer-label">你的答案：</div>
                  <div class="answer-text student-answer">
                    {{ question.studentAnswer || '未作答' }}
                  </div>
                </div>

                <!-- 参考答案 -->
                <div class="answer-section">
                  <div class="answer-label">参考答案：</div>
                  <div class="answer-text reference-answer">
                    {{ question.reference_answer }}
                  </div>
                </div>

                <!-- 评分要点 -->
                <div v-if="question.grading_points && question.grading_points.length" class="answer-section">
                  <div class="answer-label">评分要点：</div>
                  <ul class="grading-points">
                    <li v-for="(point, pIndex) in question.grading_points" :key="pIndex">
                      {{ point }}
                    </li>
                  </ul>
                </div>
              </div>

              <div class="question-footer">
                <div class="question-info">
                  <span>知识点: {{ question.chapter_name }}</span>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import StudentSidebar from '@/components/Student/StudentSidebar.vue'
import StudentHeader from '@/components/Student/StudentHeader.vue'
import { smartPaperAPI } from '@/services/api.js'

const router = useRouter()
const route = useRoute()

const paperId = computed(() => route.params.paperId)
const paperName = ref('智能组卷练习')
const score = ref(0)
const maxScore = ref(100)
const rating = ref('')
const comment = ref('')
const submittedAt = ref('')
const gradedAt = ref('')
const questions = ref([])
const loading = ref(false)

const loadResult = async () => {
  loading.value = true
  try {
    // 同时获取试卷结果和试卷详情
    const [resultResponse, paperResponse] = await Promise.all([
      smartPaperAPI.getPaperResult(paperId.value),
      smartPaperAPI.getPaperDetail(paperId.value)
    ])

    if (resultResponse.code === 200 && resultResponse.data &&
        paperResponse.code === 200 && paperResponse.data) {
      const resultData = resultResponse.data
      const paperData = paperResponse.data

      score.value = resultData.score || 0
      maxScore.value = resultData.maxScore || resultData.max_score || 100
      rating.value = resultData.rating || ''
      comment.value = resultData.comment || ''
      submittedAt.value = resultData.submittedAt || resultData.submitted_at || ''
      gradedAt.value = resultData.gradedAt || resultData.graded_at || ''
      paperName.value = resultData.paperName || resultData.paper_name || '智能组卷练习'

      // 获取试卷题目详情（包含参考答案）
      const paperQuestions = paperData.paper?.questions ||
                           paperData.paper?.result?.questions ||
                           paperData.result?.questions || []

      // 获取答题结果
      const questionResults = resultData.questionResults || []

      // 获取学生答案
      const studentAnswers = resultData.answers?.answers || []
      const answerMap = {}
      studentAnswers.forEach(a => {
        answerMap[a.questionId || a.question_id] = a.answerText || a.answer
      })

      // 合并题目详情和答题结果
      questions.value = questionResults.map(result => {
        const qId = result.questionId || result.question_id
        const questionDetail = paperQuestions.find(q => q.question_id === qId) || {}

        return {
          ...questionDetail,
          ...result,
          question_id: qId,
          studentAnswer: answerMap[qId] || '',
          score: result.score || 0,
          max_score: result.max_score || questionDetail.score || 0
        }
      })
    } else {
      ElMessage.error('获取结果失败')
    }
  } catch (error) {
    console.error('获取结果失败:', error)
    ElMessage.error('获取结果失败：' + (error.message || '网络错误'))
  } finally {
    loading.value = false
  }
}

const loadMockData = () => {
  score.value = 78
  maxScore.value = 100
  rating.value = '良好'
  submittedAt.value = '2026-05-09 14:30:00'
  gradedAt.value = '2026-05-09 14:30:01'
  questions.value = [
    {
      question_id: '1',
      question_type: '选择题',
      difficulty: '简单',
      chapter_name: '数据库概论',
      question_content: '数据库（DB）与数据库系统（DBS）的关系是？',
      score: 10,
      studentAnswer: 'B',
      reference_answer: 'B',
      grading_points: ['理解数据库与数据库系统的包含关系'],
      isCorrect: true
    },
    {
      question_id: '2',
      question_type: '判断题',
      difficulty: '简单',
      chapter_name: '数据库概论',
      question_content: '数据库系统的核心是数据库管理系统。',
      score: 10,
      studentAnswer: '正确',
      reference_answer: '正确',
      grading_points: [],
      isCorrect: true
    },
    {
      question_id: '3',
      question_type: '填空题',
      difficulty: '中等',
      chapter_name: '关系数据库',
      question_content: '关系数据模型的三要素是：________、________和________。',
      score: 15,
      studentAnswer: '数据结构、数据操作、完整性约束',
      reference_answer: '数据结构、数据操作、完整性约束',
      grading_points: ['正确回答三个要素'],
      isCorrect: true
    },
    {
      question_id: '4',
      question_type: '简答题',
      difficulty: '困难',
      chapter_name: 'SQL语言',
      question_content: '请简述SQL语言的特点。',
      score: 20,
      studentAnswer: 'SQL是结构化查询语言，用于数据库操作。',
      reference_answer: '1. 综合统一；2. 高度非过程化；3. 面向集合的操作方式；4. 以同一种语法结构提供两种使用方式；5. 语言简洁，易学易用。',
      grading_points: ['综合统一', '高度非过程化', '面向集合的操作方式', '两种使用方式', '语言简洁'],
      isCorrect: false
    },
    {
      question_id: '5',
      question_type: '选择题',
      difficulty: '中等',
      chapter_name: '数据库设计',
      question_content: '在ER模型中，实体之间的联系不包括以下哪种类型？',
      score: 15,
      studentAnswer: 'D',
      reference_answer: 'C',
      grading_points: [],
      isCorrect: false
    }
  ]
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleString('zh-CN')
}

const getRatingType = (r) => {
  if (r === '优秀') return 'success'
  if (r === '良好') return 'primary'
  if (r === '及格') return 'warning'
  return 'danger'
}

const getQuestionResultType = (q) => {
  return q.isCorrect ? 'success' : 'danger'
}

const getQuestionResultLabel = (q) => {
  return q.isCorrect ? '正确' : '错误'
}

const goToPaperList = () => {
  router.push('/student/smart-paper/list')
}

onMounted(() => {
  loadResult()
})
</script>

<style scoped>
.page-layout {
  min-height: 100vh;
  background: var(--bg-page);
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
  padding: var(--spacing-lg);
  overflow-y: auto;
}

.result-overview {
  margin-bottom: var(--spacing-xl);
}

.overview-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.score-display {
  display: flex;
  gap: 32px;
  align-items: center;
  margin-bottom: 24px;
}

.score-circle {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 20px rgba(74, 144, 226, 0.3);
}

.score-value {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
}

.score-label {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
}

.score-info {
  flex: 1;
}

.score-info h2 {
  margin: 0 0 16px 0;
  font-size: 24px;
  color: #333;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.info-row .label {
  color: #999;
  font-size: 14px;
}

.info-row .value {
  color: #333;
  font-size: 14px;
}

.overview-footer {
  padding-top: 24px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

.questions-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.question-result-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  transition: all 0.2s;
}

.question-result-card:hover {
  border-color: #4a90e2;
  box-shadow: 0 2px 8px rgba(74, 144, 226, 0.1);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.question-number {
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-tag {
  font-weight: 600;
}

.question-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.score-tag {
  font-weight: 600;
  color: #666;
  font-size: 14px;
}

.question-content {
  margin-bottom: 16px;
}

.question-text {
  font-size: 15px;
  line-height: 1.8;
  color: #333;
  margin: 0 0 20px 0;
}

.answer-section {
  margin-bottom: 16px;
}

.answer-label {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin-bottom: 8px;
}

.answer-text {
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.6;
}

.student-answer {
  background: #f5f7fa;
  border-left: 3px solid #4a90e2;
}

.reference-answer {
  background: #f0f8ff;
  border-left: 3px solid #4caf50;
}

.grading-points {
  margin: 0;
  padding-left: 20px;
}

.grading-points li {
  margin-bottom: 4px;
  font-size: 14px;
  color: #666;
}

.question-footer {
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.question-info {
  color: #999;
  font-size: 13px;
}

@media (max-width: 768px) {
  .content-area {
    margin-left: 0;
  }

  .main-content {
    padding: var(--spacing-md);
  }

  .score-display {
    flex-direction: column;
    text-align: center;
  }

  .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
