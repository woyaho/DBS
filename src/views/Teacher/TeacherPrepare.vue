<template>
  <div class="page-layout">
    <!-- 侧边栏 -->
    <TeacherSidebar />

    <!-- 主内容区 -->
    <div class="content-area">
      <!-- 栏头 -->
      <TeacherHeader />

      <main class="main-content">
        <div class="prepare-container">
          <!-- 页面标题 -->
          <div class="page-header">
            <h1 class="page-title">智能备课</h1>
          </div>

          <!-- 资料分享库 -->
          <div class="resource-section">
            <div class="section-header">
              <h2 class="section-title">资料分享库</h2>
              <button class="upload-btn" @click="triggerFileUpload">
                <span class="upload-icon">📤</span>
                {{ uploading ? '上传中...' : '上传文件' }}
              </button>
              <input
                type="file"
                ref="fileInput"
                class="file-input"
                accept=".pdf"
                @change="handleFileUpload"
              />
            </div>

            <!-- 课件列表 -->
            <div class="courseware-grid">
              <div v-for="(courseware, index) in coursewareList" :key="index" class="courseware-card">
                <div class="courseware-icon">📄</div>
                <div class="courseware-info">
                  <h3 class="courseware-title">{{ courseware.title }}</h3>
                  <div class="courseware-meta">
                    <span class="meta-item">{{ courseware.type }}</span>
                    <span class="meta-item">{{ courseware.size }}</span>
                    <span class="meta-item">{{ courseware.words }}</span>
                  </div>
                </div>
                <button class="download-btn">下载</button>
              </div>
            </div>
          </div>

          <!-- 智能组卷 -->
          <div class="exam-section">
            <div class="section-header">
              <h2 class="section-title">智能组卷</h2>
            </div>

            <div class="exam-config">
              <!-- 章节选择 -->
              <div class="config-group">
                <h3 class="config-title">章节选择</h3>
                <div class="chapter-list">
                  <label v-for="chapter in chapters" :key="chapter.id" class="chapter-item">
                    <input type="checkbox" :id="'chapter-' + chapter.id" :checked="chapter.checked" @change="toggleChapter(chapter.id)" />
                    <span class="chapter-name">{{ chapter.name }}</span>
                  </label>
                </div>
              </div>

              <!-- 难度和题量选择 -->
              <div class="slider-container">
                <!-- 难度选择 -->
                <div class="slider-group">
                  <h3 class="config-title">难度选择</h3>
                  <div class="slider-wrapper">
                    <div class="slider-track">
                      <input
                        type="range"
                        min="1"
                        max="5"
                        v-model="difficulty"
                        class="difficulty-slider"
                      />
                      <div class="slider-markers">
                        <span class="marker">极易</span>
                        <span class="marker">偏易</span>
                        <span class="marker">正常</span>
                        <span class="marker">偏难</span>
                        <span class="marker">极难</span>
                      </div>
                    </div>
                    <div class="slider-value">{{ getDifficultyText(difficulty) }}</div>
                  </div>
                </div>

                <!-- 题量选择 -->
                <div class="slider-group">
                  <h3 class="config-title">题量选择</h3>
                  <div class="slider-wrapper">
                    <div class="slider-track">
                      <input
                        type="range"
                        min="10"
                        max="50"
                        step="10"
                        v-model="questionCount"
                        class="question-slider"
                      />
                      <div class="slider-markers">
                        <span class="marker">10题</span>
                        <span class="marker">20题</span>
                        <span class="marker">30题</span>
                        <span class="marker">40题</span>
                        <span class="marker">50题</span>
                      </div>
                    </div>
                    <div class="slider-value">{{ questionCount }}题</div>
                  </div>
                </div>
              </div>

              <!-- 个性化要求 -->
              <div class="config-group">
                <h3 class="config-title">个性化要求</h3>
                <div class="textarea-container">
                  <textarea v-model="customRequirements" class="requirements-textarea" placeholder="输入要求..."></textarea>
                </div>
              </div>

              <!-- 生成组卷按钮 -->
                <div class="generate-section">
                  <div class="ai-assist-section">
                    <h3 class="config-title">AI辅助组卷</h3>
                    <div class="ai-assist-buttons">
                      <button class="ai-btn" @click="generateAIExam" :disabled="generatingAIExam">
                        {{ generatingAIExam ? 'AI生成中...' : 'AI智能组卷' }}
                      </button>
                      <button class="ai-btn" @click="analyzeRequirements" :disabled="analyzingRequirements">
                        {{ analyzingRequirements ? '分析中...' : '分析需求' }}
                      </button>
                    </div>
                    <div v-if="aiAnalysisResult" class="ai-analysis-result">
                      <h4>AI分析结果：</h4>
                      <p>{{ aiAnalysisResult }}</p>
                    </div>
                  </div>
                  <button class="generate-btn" @click="generateExam">生成组卷</button>
                </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import TeacherSidebar from '@/components/Teacher/TeacherSidebar.vue'
import TeacherHeader from '@/components/Teacher/TeacherHeader.vue'
import { teacherAPI } from '@/services/api.js'

// 文件输入引用
const fileInput = ref(null)

// 上传状态
const uploading = ref(false)

// 课件列表
const coursewareList = ref([
  { title: '课件一', type: 'PDF', size: '24KB', words: '约0.2万字' },
  { title: '课件二', type: 'PDF', size: '24KB', words: '约0.2万字' },
  { title: '课件三', type: 'PDF', size: '24KB', words: '约0.2万字' },
  { title: '课件四', type: 'PDF', size: '24KB', words: '约0.2万字' },
  { title: '课件五', type: 'PDF', size: '24KB', words: '约0.2万字' },
  { title: '课件六', type: 'PDF', size: '24KB', words: '约0.2万字' }
])

// 章节列表
const chapters = ref([
  { id: 1, name: '数据库系统概述', checked: true },
  { id: 2, name: '数据模型与关系数据库', checked: false },
  { id: 3, name: 'SQL语言', checked: false },
  { id: 4, name: '数据库规范化', checked: false },
  { id: 5, name: '事务与并发控制', checked: false },
  { id: 6, name: '数据库安全与备份', checked: false },
  { id: 7, name: '数据库设计', checked: false }
])

// 难度选择 (1-5: 极易到极难)
const difficulty = ref(3) // 默认正常难度

// 题量选择
const questionCount = ref(30) // 默认30题

// 个性化要求
const customRequirements = ref('')

// AI辅助组卷状态
const generatingAIExam = ref(false)
const analyzingRequirements = ref(false)
const aiAnalysisResult = ref('')

// 触发文件上传
const triggerFileUpload = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

// 加载课件列表
const loadCoursewareList = async () => {
  try {
    const response = await teacherAPI.getCoursewareList()
    if (response.code === 200) {
      coursewareList.value = response.data.map(item => ({
        title: item.title,
        type: 'PDF',
        size: formatFileSize(item.size || 0),
        words: '约0.2万字',
        id: item.id
      }))
    }
  } catch (error) {
    console.error('加载课件列表失败:', error)
  }
}

// 处理文件上传
const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 验证文件类型（后端仅支持PDF）
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    alert('课件仅支持PDF格式')
    return
  }

  // 验证文件大小（最大10MB）
  if (file.size > 10 * 1024 * 1024) {
    alert('文件大小不能超过10MB')
    return
  }

  uploading.value = true

  try {
    const fileName = file.name.replace(/\.[^/.]+$/, '') // 去掉扩展名作为标题

    console.log('准备上传文件:', fileName, '大小:', file.size)

    const response = await teacherAPI.uploadCourseware(file, fileName)

    console.log('上传响应:', response)

    if (response.code === 200 || response.success) {
      alert('文件上传成功！')
      loadCoursewareList() // 刷新课件列表
    } else {
      alert('文件上传失败: ' + (response.message || response.msg || '未知错误'))
    }
  } catch (error) {
    console.error('文件上传失败:', error)
    const errorMessage = error.message || '网络请求失败'
    // 根据错误类型给出更具体的提示
    if (errorMessage.includes('401')) {
      alert('文件上传失败：请重新登录后重试')
    } else if (errorMessage.includes('403')) {
      alert('文件上传失败：您没有权限进行此操作')
    } else if (errorMessage.includes('500')) {
      alert('文件上传失败：服务器内部错误，请稍后重试')
    } else {
      alert('文件上传失败：' + errorMessage)
    }
  } finally {
    uploading.value = false
    // 重置文件输入
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB'
}

// 切换章节选择
const toggleChapter = (chapterId) => {
  const chapter = chapters.value.find(ch => ch.id === chapterId)
  if (chapter) {
    chapter.checked = !chapter.checked
  }
}

// 获取难度文本
const getDifficultyText = (value) => {
  const difficultyMap = {
    1: '极易',
    2: '偏易',
    3: '正常',
    4: '偏难',
    5: '极难'
  }
  return difficultyMap[value] || '正常'
}

// AI智能组卷
const generateAIExam = async () => {
  // 收集选择的章节
  const selectedChapters = chapters.value.filter(ch => ch.checked).map(ch => ch.name)

  if (selectedChapters.length === 0) {
    alert('请至少选择一个章节')
    return
  }

  generatingAIExam.value = true
  try {
    // 构建组卷参数
    const examParams = {
      chapters: selectedChapters,
      difficulty: getDifficultyText(difficulty.value),
      questionCount: questionCount.value,
      customRequirements: customRequirements.value
    }

    // 模拟AI生成组卷
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('AI生成组卷参数:', examParams)
    alert('AI智能组卷生成成功！')
  } finally {
    generatingAIExam.value = false
  }
}

// 分析需求
const analyzeRequirements = async () => {
  const selectedChapters = chapters.value.filter(ch => ch.checked).map(ch => ch.name)

  if (selectedChapters.length === 0) {
    alert('请至少选择一个章节')
    return
  }

  analyzingRequirements.value = true
  try {
    // 模拟需求分析
    await new Promise(resolve => setTimeout(resolve, 1500))
    aiAnalysisResult.value = `基于选择的章节 ${selectedChapters.join('、')}，建议生成 ${questionCount.value} 道 ${getDifficultyText(difficulty.value)} 难度的题目，涵盖概念理解、实际应用和综合分析等多种题型。`
  } finally {
    analyzingRequirements.value = false
  }
}

// 生成组卷
const generateExam = () => {
  // 收集选择的章节
  const selectedChapters = chapters.value.filter(ch => ch.checked).map(ch => ch.name)

  // 构建组卷参数
  const examParams = {
    chapters: selectedChapters,
    difficulty: getDifficultyText(difficulty.value),
    questionCount: questionCount.value,
    customRequirements: customRequirements.value
  }

  // 模拟生成组卷
  console.log('生成组卷参数:', examParams)
  alert('组卷生成成功！')
}
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
  padding: 24px 24px 24px 12px;
  overflow-y: auto;
}

.prepare-container {
  max-width: 100%;
  margin: 0;
}

/* 页面头部 */
.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 26px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0;
}

/* 资料分享库 */
.resource-section {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0;
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

.upload-btn:hover {
  background: #357abd;
}

.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-icon {
  font-size: 16px;
}

/* 隐藏的文件输入框 */
.file-input {
  display: none;
}

/* 课件网格 */
.courseware-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.courseware-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s;
}

.courseware-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.courseware-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.courseware-info {
  flex: 1;
}

.courseware-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0 0 8px 0;
}

.courseware-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6c757d;
}

.download-btn {
  padding: 6px 12px;
  background: #e9ecef;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  color: #495057;
  cursor: pointer;
  transition: all 0.3s;
}

.download-btn:hover {
  background: #dee2e6;
}

/* 智能组卷 */
.exam-section {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.exam-config {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 32px;
}

/* 章节选择 */
.config-group {
  margin-bottom: 24px;
}

.config-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0 0 16px 0;
}

.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chapter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #555;
  cursor: pointer;
}

.chapter-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

/* 滑块容器 */
.slider-container {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.slider-group {
  margin-bottom: 16px;
}

.slider-wrapper {
  display: flex;
  align-items: center;
  gap: 24px;
}

.slider-track {
  flex: 1;
  position: relative;
}

.slider-track input[type="range"] {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e9ecef;
  outline: none;
  -webkit-appearance: none;
  margin: 0;
}

.slider-track input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4a90e2;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(74, 144, 226, 0.3);
}

.slider-track input[type="range"]::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #4a90e2;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 6px rgba(74, 144, 226, 0.3);
}

.slider-markers {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #6c757d;
}

.marker {
  position: relative;
}

.slider-value {
  font-size: 16px;
  font-weight: 600;
  color: #1a2a3a;
  min-width: 60px;
}

/* 个性化要求 */
.textarea-container {
  width: 100%;
}

.requirements-textarea {
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

.requirements-textarea:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

/* AI辅助组卷 */
.ai-assist-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #4a90e2;
}

.ai-assist-buttons {
  display: flex;
  gap: 12px;
  margin: 16px 0;
}

.ai-btn {
  padding: 10px 20px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

.ai-btn:hover:not(:disabled) {
  background: #357abd;
}

.ai-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ai-analysis-result {
  margin-top: 16px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.ai-analysis-result h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0 0 8px 0;
}

.ai-analysis-result p {
  font-size: 13px;
  color: #555;
  line-height: 1.5;
  margin: 0;
}

/* 生成组卷 */
.generate-section {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-top: 16px;
}

.generate-btn {
  padding: 12px 32px;
  background: #8b0000;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.generate-btn:hover {
  background: #6b0000;
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

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .courseware-grid {
    grid-template-columns: 1fr;
  }

  .exam-config {
    grid-template-columns: 1fr;
  }

  .slider-wrapper {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .slider-value {
    align-self: flex-end;
  }

  .generate-section {
    justify-content: center;
  }
}

/* 难度颜色 */
.slider-markers .marker:nth-child(1) { color: #4caf50; } /* 极易 */
.slider-markers .marker:nth-child(2) { color: #8bc34a; } /* 偏易 */
.slider-markers .marker:nth-child(3) { color: #ffc107; } /* 正常 */
.slider-markers .marker:nth-child(4) { color: #ff9800; } /* 偏难 */
.slider-markers .marker:nth-child(5) { color: #f44336; } /* 极难 */

/* 题量颜色 */
.slider-markers .marker {
  color: #4a90e2;
}
</style>
