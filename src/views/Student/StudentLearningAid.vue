<template>
  <div class="page-layout">
    <!-- 栏头 -->
    <StudentHeader />
    
    <div class="content-container">
      <!-- 侧边栏 -->
      <StudentSidebar />

      <!-- 主内容区 -->
      <div class="content-area">
        <main class="main-content">
          <div class="learning-aid-container">
            <!-- 页面标题 -->
            <div class="page-header">
              <h1 class="page-title">学习辅助</h1>
            </div>

            <!-- 教师资料库 -->
            <div class="teacher-resources">
              <h2 class="section-title">教师资料库</h2>
              <div class="resources-grid">
                <div v-for="(resource, index) in resources" :key="index" class="resource-card">
                  <div class="resource-icon">
                    <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
                  </div>
                  <div class="resource-info">
                    <h3 class="resource-title">{{ resource.title }}</h3>
                    <p class="resource-details">{{ resource.type }} · {{ resource.size }} · 约{{ resource.words }}字</p>
                  </div>
                  <button class="resource-download" @click="downloadResource(resource)">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3zm-5.55-8h-2.9v3H8l4 4 4-4h-2.55z"/></svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- 智能组卷 -->
            <div class="smart-quiz">
              <h2 class="section-title">智能组卷</h2>
              <div class="quiz-config">
                <!-- 章节选择 -->
                <div class="config-section">
                  <h3 class="config-title">章节选择</h3>
                  <div class="chapter-selection">
                    <div v-for="chapter in chapters" :key="chapter.id" class="chapter-item">
                      <input type="checkbox" :id="`chapter-${chapter.id}`" v-model="selectedChapters" :value="chapter.id">
                      <label :for="`chapter-${chapter.id}`">{{ chapter.name }}</label>
                    </div>
                  </div>
                </div>

                <!-- 难度和题量选择 -->
                <div class="config-controls">
                  <!-- 难度选择 -->
                  <div class="control-item">
                    <h3 class="control-title">难度选择</h3>
                    <div class="slider-container">
                      <input type="range" min="1" max="5" v-model="difficulty" class="difficulty-slider">
                      <div class="slider-labels">
                        <span class="label">极易</span>
                        <span class="label">偏易</span>
                        <span class="label active">正常</span>
                        <span class="label">偏难</span>
                        <span class="label">极难</span>
                      </div>
                    </div>
                  </div>

                  <!-- 题量选择 -->
                  <div class="control-item">
                    <h3 class="control-title">题量选择</h3>
                    <div class="slider-container">
                      <input type="range" min="10" max="50" step="10" v-model="questionCount" class="question-slider">
                      <div class="slider-labels">
                        <span class="label">10题</span>
                        <span class="label">20题</span>
                        <span class="label active">30题</span>
                        <span class="label">40题</span>
                        <span class="label">50题</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 个性化要求 -->
                <div class="personalization">
                  <h3 class="config-title">个性化要求</h3>
                  <textarea v-model="personalRequirements" class="requirements-input" placeholder="输入要求"></textarea>
                </div>

                <!-- 生成试卷按钮 -->
                <div class="generate-section">
                  <button class="btn-generate" @click="generateQuiz">生成试卷并开始测试</button>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import StudentSidebar from '@/components/Student/StudentSidebar.vue'
import StudentHeader from '@/components/Student/StudentHeader.vue'

const router = useRouter()

// 模拟资源数据
const resources = ref([
  { id: 1, title: '课件一', type: 'PDF', size: '24KB', words: '0.2万' },
  { id: 2, title: '课件二', type: 'PDF', size: '24KB', words: '0.2万' },
  { id: 3, title: '课件三', type: 'PDF', size: '24KB', words: '0.2万' },
  { id: 4, title: '课件四', type: 'PDF', size: '24KB', words: '0.2万' },
  { id: 5, title: '课件五', type: 'PDF', size: '24KB', words: '0.2万' },
  { id: 6, title: '课件六', type: 'PDF', size: '24KB', words: '0.2万' }
])

// 章节数据
const chapters = ref([
  { id: 1, name: '数据库系统概述' },
  { id: 2, name: '数据模型与关系数据库' },
  { id: 3, name: 'SQL语言' },
  { id: 4, name: '数据库规范化' },
  { id: 5, name: '事务与并发控制' },
  { id: 6, name: '数据库安全与备份' },
  { id: 7, name: '数据库设计' }
])

// 选择的章节
const selectedChapters = ref([])

// 难度级别 (1-5)
const difficulty = ref(3)

// 题量
const questionCount = ref(30)

// 个性化要求
const personalRequirements = ref('')

// 下载资源
const downloadResource = (resource) => {
  console.log('下载资源:', resource.title)
  alert(`开始下载 ${resource.title}`)
}

// 生成试卷
const generateQuiz = () => {
  if (selectedChapters.value.length === 0) {
    alert('请至少选择一个章节')
    return
  }
  
  const quizParams = {
    chapters: selectedChapters.value,
    difficulty: difficulty.value,
    questionCount: questionCount.value,
    requirements: personalRequirements.value
  }
  
  console.log('生成试卷参数:', quizParams)
  router.push('/student/quiz')
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

.learning-aid-container {
  max-width: 100%;
  margin: 0;
}

/* 页面头部 */
.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0;
}

/* 教师资料库 */
.teacher-resources {
  margin-bottom: 40px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0 0 20px 0;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.resource-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s;
}

.resource-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.resource-icon {
  width: 48px;
  height: 48px;
  background: #f0f7ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a90e2;
  flex-shrink: 0;
}

.resource-info {
  flex: 1;
}

.resource-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0 0 4px 0;
}

.resource-details {
  font-size: 14px;
  color: #6c757d;
  margin: 0;
}

.resource-download {
  width: 32px;
  height: 32px;
  border: none;
  background: #f8f9fa;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.3s;
}

.resource-download:hover {
  background: #e3f2fd;
  color: #4a90e2;
}

/* 智能组卷 */
.smart-quiz {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.quiz-config {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.config-section {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 20px;
}

.config-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0 0 16px 0;
}

.chapter-selection {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.chapter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chapter-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #4a90e2;
}

.chapter-item label {
  font-size: 14px;
  color: #495057;
  cursor: pointer;
}

.config-controls {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.control-item {
  flex: 1;
  min-width: 300px;
}

.control-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0 0 16px 0;
}

.slider-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e9ecef;
  outline: none;
  -webkit-appearance: none;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4a90e2;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(74, 144, 226, 0.3);
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4a90e2;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(74, 144, 226, 0.3);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6c757d;
}

.slider-labels .label {
  transition: all 0.3s;
}

.slider-labels .label.active {
  color: #4a90e2;
  font-weight: 600;
}

.personalization {
  border-top: 1px solid #e9ecef;
  padding-top: 20px;
}

.requirements-input {
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.requirements-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.generate-section {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.btn-generate {
  padding: 12px 32px;
  background: #8b4513;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 8px rgba(139, 69, 19, 0.3);
}

.btn-generate:hover {
  background: #6b3410;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(139, 69, 19, 0.4);
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
  
  .page-title {
    font-size: 24px;
  }
  
  .resources-grid {
    grid-template-columns: 1fr;
  }
  
  .config-controls {
    flex-direction: column;
    gap: 24px;
  }
  
  .control-item {
    min-width: 100%;
  }
  
  .chapter-selection {
    grid-template-columns: 1fr;
  }
  
  .smart-quiz {
    padding: 16px;
  }
}
</style>