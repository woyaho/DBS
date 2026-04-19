<template>
  <div class="quiz-container">
    <!-- 顶部导航 -->
    <div class="quiz-header">
      <button class="btn-exit" @click="exitQuiz">
        <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5z"/></svg>
        退出答题（不保存试卷）
      </button>
      <div class="quiz-stats">
        <span class="stat-item">剩余时间: <strong>{{ remainingTime }}</strong></span>
        <span class="stat-item">已完成: <strong>{{ completedCount }}/{{ questions.length }}</strong></span>
      </div>
    </div>

    <!-- 答题内容 -->
    <div class="quiz-content">
      <div v-for="(question, index) in questions" :key="question.id" class="question-item" v-show="currentQuestionIndex === index">
        <!-- 题目序号和类型 -->
        <div class="question-header">
          <span class="question-number">{{ index + 1 }}. </span>
          <span class="question-type">({{ question.type }})</span>
        </div>

        <!-- 题目内容 -->
        <div class="question-text">
          {{ question.content }}
          <span class="question-score">{{ question.score }}分</span>
        </div>

        <!-- 选项（单选题、多选题、判断题） -->
        <div v-if="question.type !== '简答题' && question.type !== '填空题'" class="question-options">
          <div v-for="(option, optIndex) in question.options" :key="optIndex" class="option-item">
            <input 
              :type="question.type === '多选题' ? 'checkbox' : 'radio'" 
              :id="`option-${question.id}-${optIndex}`" 
              :name="question.type === '多选题' ? `question-${question.id}` : `question-${question.id}`"
              :value="option"
              v-model="question.userAnswer"
            >
            <label :for="`option-${question.id}-${optIndex}`">{{ option }}</label>
          </div>
        </div>

        <!-- 简答题输入框 -->
        <div v-else-if="question.type === '简答题'" class="question-input">
          <textarea 
            v-model="question.userAnswer" 
            class="textarea-input" 
            placeholder="请输入文本"
          ></textarea>
        </div>

        <!-- 填空题输入框 -->
        <div v-else-if="question.type === '填空题'" class="question-input">
          <div class="fill-blank-content">
            <template v-for="(part, partIndex) in question.contentParts" :key="partIndex">
              <span v-if="typeof part === 'string'" class="content-text">{{ part }}</span>
              <input 
                v-else 
                type="text" 
                class="blank-input"
                v-model="question.userAnswer[partIndex - 1]"
                :placeholder="`${partIndex}.`"
              >
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部导航 -->
    <div class="quiz-footer">
      <div class="page-navigation">
        <button 
          class="btn-nav" 
          @click="prevQuestion"
          :disabled="currentQuestionIndex === 0"
        >
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          上一页
        </button>
        <button 
          class="btn-nav" 
          @click="nextQuestion"
          :disabled="currentQuestionIndex === questions.length - 1"
        >
          下一页
          <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </button>
      </div>
      <button class="btn-submit" @click="submitQuiz">
        交卷
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 当前题目索引
const currentQuestionIndex = ref(0)

// 倒计时（默认60分钟）
const totalTime = ref(60 * 60) // 60分钟，单位秒
const countdownTimer = ref(null)

// 模拟题目数据
const questions = ref([
  {
    id: 1,
    type: '单选题',
    content: '系统密码算法合规性要求密码算法需要是什么',
    score: 0.5,
    options: ['国际标准', '国家标准或行业标准', '商业标准', '企业自定标准'],
    userAnswer: ''
  },
  {
    id: 2,
    type: '判断题',
    content: '系统使用的密码算法必须以国家标准或行业标准形式发布',
    score: 0.5,
    options: ['正确', '错误'],
    userAnswer: ''
  },
  {
    id: 3,
    type: '多选题',
    content: '以下符合密码技术合规性审查的是',
    score: 1,
    options: ['国家标准或行业标准', '商用密码认证机构认证', '国家密码管理部门同意使用的证明文件', '企业内部标准', '国际标准认证'],
    userAnswer: []
  },
  {
    id: 4,
    type: '简答题',
    content: '调查问卷是信息系统密码应用需求调研的基本工具，调研表的质量直接影响到整个密码应用需求调研的质量，调查问卷包括哪些主要内容？',
    score: 5,
    userAnswer: ''
  },
  {
    id: 5,
    type: '填空题',
    content: '应急处置执行报告应至少包含如下内容：(1) ________：事件发生的时间、地点、________、损失情况；启动预案授权情况、启动预案的名称、________、________、________；处置过程中资源消耗情况；涉及软硬件系统；________；后续工作及要求；',
    contentParts: [
      '应急处置执行报告应至少包含如下内容：(1) ',
      '事件基本信息',
      '：事件发生的时间、地点、',
      '事件性质',
      '、损失情况；启动预案授权情况、启动预案的名称、',
      '编号',
      '、',
      '启动时间',
      '、',
      '启动原因',
      '；处置过程中资源消耗情况；涉及软硬件系统；',
      '处置结果',
      '；后续工作及要求；'
    ],
    score: 5,
    userAnswer: ['', '', '', '', '', '']
  }
])

// 已完成题目数量
const completedCount = computed(() => {
  return questions.value.filter(q => {
    if (q.type === '多选题') {
      return q.userAnswer && q.userAnswer.length > 0
    }
    return q.userAnswer && q.userAnswer !== ''
  }).length
})

// 剩余时间格式化
const remainingTime = computed(() => {
  const minutes = Math.floor(totalTime.value / 60)
  const seconds = totalTime.value % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

// 开始倒计时
const startCountdown = () => {
  countdownTimer.value = setInterval(() => {
    if (totalTime.value > 0) {
      totalTime.value--
    } else {
      // 时间到，自动交卷
      clearInterval(countdownTimer.value)
      submitQuiz()
    }
  }, 1000)
}

// 停止倒计时
const stopCountdown = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
}

// 上一题
const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

// 下一题
const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
  }
}

// 退出答题
const exitQuiz = () => {
  if (confirm('确定要退出答题吗？您的答案将不会被保存。')) {
    stopCountdown()
    router.push('/student/learning-aid')
  }
}

// 交卷
const submitQuiz = () => {
  if (confirm('确定要交卷吗？交卷后将无法修改答案。')) {
    stopCountdown()
    // 这里可以添加交卷逻辑，比如提交答案到服务器
    console.log('交卷答案:', questions.value)
    alert('交卷成功！')
    router.push('/student/learning-aid')
  }
}

// 组件挂载时开始倒计时
onMounted(() => {
  startCountdown()
})

// 组件卸载时停止倒计时
onBeforeUnmount(() => {
  stopCountdown()
})
</script>

<style scoped>
/* 答题容器 */
.quiz-container {
  min-height: 100vh;
  background: #F0F2F5;
  display: flex;
  flex-direction: column;
}

/* 顶部导航 */
.quiz-header {
  background: #4a90e2;
  color: white;
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-exit {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-exit:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: white;
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
  font-weight: 600;
}

/* 答题内容 */
.quiz-content {
  flex: 1;
  padding: 32px 24px;
  overflow-y: auto;
}

.question-item {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.question-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #1a2a3a;
}

.question-number {
  font-weight: 600;
  margin-right: 4px;
}

.question-type {
  color: #4a90e2;
  font-weight: normal;
  margin-left: 4px;
}

.question-text {
  font-size: 16px;
  line-height: 1.6;
  color: #495057;
  margin-bottom: 20px;
  position: relative;
}

.question-score {
  position: absolute;
  right: 0;
  top: 0;
  color: #6c757d;
  font-size: 14px;
  font-weight: 500;
}

/* 选项样式 */
.question-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.3s;
  cursor: pointer;
}

.option-item:hover {
  background: #f8f9fa;
}

.option-item input[type="radio"],
.option-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #4a90e2;
  flex-shrink: 0;
}

.option-item label {
  font-size: 14px;
  color: #495057;
  cursor: pointer;
  flex: 1;
}

/* 输入框样式 */
.question-input {
  margin-top: 16px;
}

.textarea-input {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: all 0.3s;
}

.textarea-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

/* 填空题样式 */
.fill-blank-content {
  font-size: 14px;
  line-height: 1.6;
  color: #495057;
}

.content-text {
  margin-right: 8px;
}

.blank-input {
  width: 120px;
  padding: 4px 8px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 14px;
  margin: 0 8px;
  transition: all 0.3s;
}

.blank-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  width: 140px;
}

/* 底部导航 */
.quiz-footer {
  background: white;
  padding: 20px 24px;
  border-top: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
}

.page-navigation {
  display: flex;
  gap: 16px;
}

.btn-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.btn-nav:hover:not(:disabled) {
  border-color: #4a90e2;
  color: #4a90e2;
  background: #f8f9ff;
}

.btn-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-submit {
  padding: 10px 32px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-submit:hover {
  background: #357abd;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(74, 144, 226, 0.3);
}

/* 响应式 */
@media (max-width: 768px) {
  .quiz-header {
    padding: 12px 16px;
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .quiz-stats {
    gap: 16px;
  }
  
  .quiz-content {
    padding: 16px;
  }
  
  .question-item {
    padding: 16px;
  }
  
  .quiz-footer {
    padding: 16px;
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .page-navigation {
    justify-content: center;
  }
  
  .btn-submit {
    width: 100%;
    text-align: center;
  }
  
  .blank-input {
    width: 100px;
  }
  
  .blank-input:focus {
    width: 120px;
  }
}
</style>