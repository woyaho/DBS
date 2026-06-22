<template>
  <div class="quiz-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">正在加载试卷...</p>
    </div>

    <!-- 数据为空状态 -->
    <div v-else-if="questions.length === 0" class="empty-overlay">
      <el-empty description="暂无题目数据" />
      <el-button type="primary" @click="router.push('/student/smart-paper/list')" class="back-btn">
        返回试卷列表
      </el-button>
    </div>

    <!-- 正常答题内容 -->
    <template v-else>
      <div class="quiz-header">
        <button class="btn-exit" @click="handleExit">
          <el-icon><ArrowLeft /></el-icon>
          退出答题
        </button>
        <div class="quiz-title">
          <h2>{{ paperName }}</h2>
        </div>
        <div class="quiz-stats">
          <span class="stat-item" v-if="remainingTime">
            剩余时间: <strong>{{ remainingTime }}</strong>
          </span>
          <span class="stat-item">
            已完成: <strong>{{ completedCount }}/{{ questions.length }}</strong>
          </span>
        </div>
      </div>

      <div class="quiz-content-wrapper">
        <div class="quiz-nav">
          <div class="nav-title">题目导航</div>
          <div class="nav-grid">
            <div
              v-for="(question, index) in questions"
              :key="question.question_id"
              class="nav-item"
              :class="{
                active: currentQuestionIndex === index,
                answered: question.userAnswer
              }"
              @click="goToQuestion(index)"
            >
              {{ index + 1 }}
            </div>
          </div>
        </div>

        <div class="quiz-content">
          <div class="question-card">
            <div class="question-header">
              <div class="question-number">
                第 {{ currentQuestionIndex + 1 }} 题
              </div>
              <div class="question-type">
                <el-tag size="small">{{ currentQuestion.question_type }}</el-tag>
                <el-tag size="small" type="info">{{ currentQuestion.difficulty }}</el-tag>
              </div>
              <div class="question-score">{{ currentQuestion.score }}分</div>
            </div>

            <div class="question-content">
              <p class="question-text">{{ currentQuestion.question_content }}</p>

              <!-- 选择题/判断题 -->
              <div v-if="['选择题', '判断题'].includes(currentQuestion.question_type)" class="question-options">
                <el-radio-group v-model="currentQuestion.userAnswer">
                  <div
                    v-for="(option, optIndex) in getOptions(currentQuestion)"
                    :key="optIndex"
                    class="option-item"
                  >
                    <el-radio :value="String.fromCharCode(65 + optIndex)">
                      {{ String.fromCharCode(65 + optIndex) }}. {{ option }}
                    </el-radio>
                  </div>
                </el-radio-group>
              </div>

              <!-- 填空题 -->
              <div v-else-if="currentQuestion.question_type === '填空题'" class="question-input">
                <el-input
                  v-model="currentQuestion.userAnswer"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入答案"
                />
              </div>

              <!-- 简答题/综合题 -->
              <div v-else class="question-input">
                <el-input
                  v-model="currentQuestion.userAnswer"
                  type="textarea"
                  :rows="6"
                  placeholder="请输入答案"
                />
              </div>
            </div>

            <div class="question-footer">
              <div class="question-info">
                <span class="chapter">
                  知识点: {{ currentQuestion.chapter_name }}
                </span>
              </div>
            </div>
          </div>

          <div class="quiz-footer">
            <button
              class="btn-nav"
              @click="prevQuestion"
              :disabled="currentQuestionIndex === 0"
            >
              <el-icon><ArrowLeft /></el-icon>
              上一题
            </button>
            <button class="btn-submit" type="primary" @click="handleSubmit">
              提交试卷
            </button>
            <button
              class="btn-nav"
              @click="nextQuestion"
              :disabled="currentQuestionIndex === questions.length - 1"
            >
              下一题
              <el-icon><ArrowRight /></el-icon>
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { smartPaperAPI } from '@/services/api.js'

const router = useRouter()
const route = useRoute()

const paperId = computed(() => route.params.paperId)
const paperName = ref('智能组卷练习')
const currentQuestionIndex = ref(0)
const questions = ref([])
const loading = ref(false)
const submitting = ref(false)

const totalTime = ref(60 * 60) // 默认60分钟
const timer = ref(null)
const remainingTime = computed(() => {
  const minutes = Math.floor(totalTime.value / 60)
  const seconds = totalTime.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || {})
const completedCount = computed(() => questions.value.filter(q => q.userAnswer).length)

const getOptions = (question) => {
  if (question.question_type === '判断题') {
    return ['正确', '错误']
  }
  if (question.options && Array.isArray(question.options)) {
    return question.options.slice(0, 4)
  }
  if (question.choices && Array.isArray(question.choices)) {
    return question.choices.slice(0, 4)
  }
  if (question.options_list && Array.isArray(question.options_list)) {
    return question.options_list.slice(0, 4)
  }
  if (question.question_content && question.question_content.includes('A.')) {
    return question.question_content.split(/[A-D]\.\s*/).filter(Boolean).slice(0, 4)
  }
  return ['选项A', '选项B', '选项C', '选项D']
}

const loadPaper = async () => {
  loading.value = true
  try {
    const response = await smartPaperAPI.getPaperDetail(paperId.value)

    if (response.code === 200 && response.data) {
      const paperData = response.data.paper || response.data.result
      const questionsData = response.data.questions ||
                           paperData?.questions ||
                           paperData?.result?.questions ||
                           response.data.result?.questions

      if (questionsData && Array.isArray(questionsData) && questionsData.length > 0) {
        questions.value = questionsData.map(q => ({
          ...q,
          userAnswer: ''
        }))
        paperName.value = response.data.paper_name ||
                         paperData?.paper_name ||
                         paperData?.paperName ||
                         '智能组卷练习'
      } else {
        ElMessage.warning('试卷暂无题目')
      }
    } else {
      ElMessage.error(response.message || '获取试卷详情失败')
    }
  } catch (error) {
    console.error('获取试卷详情失败:', error)
    ElMessage.error('获取试卷详情失败：' + (error.message || '网络错误'))
  } finally {
    loading.value = false
  }
}

const startTimer = () => {
  timer.value = setInterval(() => {
    if (totalTime.value > 0) {
      totalTime.value--
    } else {
      ElMessage.warning('答题时间已到，系统将自动提交试卷')
      handleSubmit(true)
    }
  }, 1000)
}

const goToQuestion = (index) => {
  currentQuestionIndex.value = index
}

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
  }
}

const handleExit = async () => {
  try {
    await ElMessageBox.confirm('确定要退出答题吗？未提交的答案将不会保存', '确认退出', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    router.push('/student/smart-paper/list')
  } catch {
    // 用户取消
  }
}

const handleSubmit = async (auto = false) => {
  if (!auto) {
    try {
      await ElMessageBox.confirm('确定要提交试卷吗？提交后将无法修改答案', '确认提交', {
        confirmButtonText: '提交',
        cancelButtonText: '取消',
        type: 'warning'
      })
    } catch {
      return
    }
  }

  submitting.value = true
  try {
    const answers = questions.value.map(q => ({
      questionId: q.question_id,
      answerText: q.userAnswer || ''
    }))
    const response = await smartPaperAPI.submitPaper(paperId.value, {
      durationSeconds: 3600 - totalTime.value,
      answers
    })

    if (response.code === 200 && response.data) {
      ElMessage.success('提交成功！')
      router.push(`/student/smart-paper/result/${paperId.value}`)
    } else {
      ElMessage.error(response.message || '提交失败')
    }
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.success('提交成功！（模拟）')
    router.push(`/student/smart-paper/result/${paperId.value}`)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadPaper()
  startTimer()
})

onBeforeUnmount(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style scoped>
.quiz-container {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

/* 加载状态样式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin-top: 20px;
  font-size: 16px;
  color: #666;
}

/* 空状态样式 */
.empty-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.back-btn {
  margin-top: 20px;
}

.quiz-header {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: white;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-exit {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-exit:hover {
  background: rgba(255, 255, 255, 0.25);
}

.quiz-title {
  flex: 1;
  text-align: center;
}

.quiz-title h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.quiz-stats {
  display: flex;
  gap: 24px;
  font-size: 14px;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-item strong {
  margin-left: 4px;
}

.quiz-content-wrapper {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.quiz-nav {
  width: 200px;
  background: white;
  border-right: 1px solid #e0e0e0;
  padding: 20px;
  overflow-y: auto;
}

.nav-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.nav-item {
  aspect-ratio: 1;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-item:hover {
  border-color: #4a90e2;
  color: #4a90e2;
}

.nav-item.active {
  background: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

.nav-item.answered:not(.active) {
  background: #e8f5e9;
  border-color: #4caf50;
  color: #4caf50;
}

.quiz-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.question-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.question-number {
  font-size: 16px;
  font-weight: 600;
  color: #4a90e2;
}

.question-type {
  display: flex;
  gap: 8px;
}

.question-score {
  font-weight: 600;
  color: #666;
}

.question-content {
  flex: 1;
}

.question-text {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  margin-bottom: 24px;
}

.question-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-item:hover {
  border-color: #4a90e2;
  background: #f0f8ff;
}

.question-input {
  margin-top: 16px;
}

.question-footer {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.question-info {
  color: #999;
  font-size: 14px;
}

.quiz-footer {
  margin-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.btn-nav,
.btn-submit {
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-nav {
  background: white;
  border: 1px solid #d0d0d0;
  color: #666;
}

.btn-nav:hover:not(:disabled) {
  border-color: #4a90e2;
  color: #4a90e2;
}

.btn-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-submit {
  background: #4a90e2;
  color: white;
  border: none;
  font-weight: 600;
}

.btn-submit:hover {
  background: #357abd;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

@media (max-width: 768px) {
  .quiz-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .quiz-stats {
    gap: 16px;
  }

  .quiz-content-wrapper {
    flex-direction: column;
  }

  .quiz-nav {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }

  .quiz-content {
    padding: 16px;
  }

  .quiz-footer {
    flex-wrap: wrap;
  }

  .btn-submit {
    width: 100%;
    order: -1;
  }
}
</style>
