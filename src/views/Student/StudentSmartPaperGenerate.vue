<template>
  <div class="page-layout">
    <StudentHeader />
    <div class="content-container">
      <StudentSidebar />
      <div class="content-area">
        <main class="main-content">
          <div class="page-header">
            <div class="header-content">
              <div>
                <h1 class="page-title">智能组卷</h1>
                <p class="page-subtitle">根据您的需求自动生成个性化试卷</p>
              </div>
              <el-button
                type="default"
                size="small"
                @click="goBack"
                class="back-btn"
              >
                <span class="btn-icon">←</span>
                返回首页
              </el-button>
            </div>
          </div>

          <div class="form-card">
            <el-form :model="formData" label-width="120px" label-position="top">
              <el-form-item label="试卷名称">
                <el-input
                  v-model="formData.paperName"
                  placeholder="请输入试卷名称"
                  maxlength="50"
                  show-word-limit
                />
              </el-form-item>

              <el-form-item label="选择章节">
                <el-checkbox-group v-model="formData.chapterIds">
                  <div class="chapter-list">
                    <label
                      v-for="chapter in chapters"
                      :key="chapter.chapter_id"
                      :class="['chapter-item', { selected: formData.chapterIds.includes(chapter.chapter_id) }]"
                    >
                      <el-checkbox :value="chapter.chapter_id" class="chapter-checkbox">
                        <span class="chapter-name">{{ chapter.chapter_name }}</span>
                      </el-checkbox>
                      <div class="chapter-desc">{{ chapter.description }}</div>
                      <div class="knowledge-tags">
                        <el-tag
                          v-for="(tag, index) in chapter.knowledge_points"
                          :key="index"
                          size="small"
                          type="info"
                          class="knowledge-tag"
                        >
                          {{ tag }}
                        </el-tag>
                      </div>
                    </label>
                  </div>
                </el-checkbox-group>
              </el-form-item>

              <el-form-item label="知识点要求（可选）">
                <el-select
                  v-model="formData.knowledgeRequirements"
                  multiple
                  filterable
                  placeholder="请选择知识点"
                  style="width: 100%"
                >
                  <el-option
                    v-for="point in allKnowledgePoints"
                    :key="point"
                    :label="point"
                    :value="point"
                  />
                </el-select>
              </el-form-item>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="简单题数量">
                    <el-input-number
                      v-model="formData.easyCount"
                      :min="0"
                      :max="50"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="中等题数量">
                    <el-input-number
                      v-model="formData.mediumCount"
                      :min="0"
                      :max="50"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="困难题数量">
                    <el-input-number
                      v-model="formData.hardCount"
                      :min="0"
                      :max="50"
                      style="width: 100%"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="题型要求">
                <el-checkbox-group v-model="formData.questionTypes">
                  <el-checkbox value="选择题">选择题</el-checkbox>
                  <el-checkbox value="填空题">填空题</el-checkbox>
                  <el-checkbox value="简答题">简答题</el-checkbox>
                  <el-checkbox value="综合题">综合题</el-checkbox>
                </el-checkbox-group>
              </el-form-item>

              <el-form-item label="总分">
                <el-input-number
                  v-model="formData.totalScore"
                  :min="10"
                  :max="200"
                  style="width: 200px"
                />
              </el-form-item>

              <el-form-item label="生成模式">
                <el-radio-group v-model="formData.generationMode">
                  <el-radio value="bank_only">仅题库</el-radio>
                  <el-radio value="hybrid">题库+AI混合</el-radio>
                  <el-radio value="ai_only">仅AI生成</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item>
                <el-button
                  type="primary"
                  size="large"
                  :loading="loading"
                  @click="handleGenerate"
                  class="generate-btn"
                >
                  {{ loading ? '生成中...' : '生成试卷' }}
                </el-button>
                <el-button size="large" @click="handleReset">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import StudentSidebar from '@/components/Student/StudentSidebar.vue'
import StudentHeader from '@/components/Student/StudentHeader.vue'
import { smartPaperAPI } from '@/services/api.js'

const router = useRouter()
const loading = ref(false)
const chapters = ref([])

const formData = ref({
  paperName: '',
  chapterIds: [],
  knowledgeRequirements: [],
  easyCount: 3,
  mediumCount: 2,
  hardCount: 1,
  questionTypes: ['选择题', '填空题'],
  totalScore: 100,
  generationMode: 'hybrid'
})

const allKnowledgePoints = computed(() => {
  const points = new Set()
  chapters.value.forEach(chapter => {
    chapter.knowledge_points.forEach(point => points.add(point))
  })
  return Array.from(points)
})

const goBack = () => {
  router.push('/student/smart-paper/list')
}

const loadChapters = async () => {
  try {
    const response = await smartPaperAPI.getChapters()
    if (response.code === 200 && response.data) {
      const chaptersData = response.data.chapters || response.data.data?.chapters || response.data.result?.chapters
      if (chaptersData && Array.isArray(chaptersData)) {
        chapters.value = chaptersData
      }
    } else {
      ElMessage.error(response.message || '获取章节列表失败')
    }
  } catch (error) {
    console.error('加载章节列表失败:', error)
    ElMessage.error('加载章节列表失败')
  }
}

const validateForm = () => {
  if (!formData.value.paperName.trim()) {
    ElMessage.warning('请输入试卷名称')
    return false
  }
  if (formData.value.chapterIds.length === 0) {
    ElMessage.warning('请至少选择一个章节')
    return false
  }
  if (
    formData.value.easyCount === 0 &&
    formData.value.mediumCount === 0 &&
    formData.value.hardCount === 0
  ) {
    ElMessage.warning('请至少设置一种难度的题目数量')
    return false
  }
  if (formData.value.questionTypes.length === 0) {
    ElMessage.warning('请至少选择一种题型')
    return false
  }
  return true
}

const handleGenerate = async () => {
  if (!validateForm()) return

  loading.value = true
  try {
    const response = await smartPaperAPI.generatePaper(formData.value)
    if (response.code === 200 && response.data) {
      ElMessage.success('试卷生成成功！')
      // 获取生成的试卷ID并跳转到答题页面（兼容多种字段命名）
      const paperId = response.data.paperId || response.data.id || response.data.paper_id

      if (paperId) {
        setTimeout(() => {
          router.push(`/student/smart-paper/answer/${paperId}`)
        }, 1000)
      } else {
        // 如果没有返回paperId，跳转到试卷列表
        setTimeout(() => {
          router.push('/student/smart-paper/list')
        }, 1000)
      }
    } else {
      ElMessage.error(response.message || '试卷生成失败')
    }
  } catch (error) {
    console.error('生成试卷失败:', error)
    ElMessage.error('试卷生成失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  formData.value = {
    paperName: '',
    chapterIds: [],
    knowledgeRequirements: [],
    easyCount: 3,
    mediumCount: 2,
    hardCount: 1,
    questionTypes: ['选择题', '填空题'],
    totalScore: 100,
    generationMode: 'hybrid'
  }
}

onMounted(() => {
  loadChapters()
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
  padding: 30px;
  overflow-y: auto;
}

.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a2a3a;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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
  gap: 8px;
  padding: 20px 40px;
  min-width: 160px;
  border-radius: 10px;
  border: 2px solid #4a90e2;
  color: #4a90e2;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.2s ease;
  background: #ffffff;
}

.back-btn:hover {
  color: #ffffff;
  background: #4a90e2;
}

.btn-icon {
  font-size: 16px;
  font-weight: 600;
}

.form-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: none;
}

.chapter-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.chapter-item {
  border: 2px solid transparent;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  background: #f8f9fa;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.chapter-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #4a90e2 0%, #63b3ed 100%);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.chapter-item:hover {
  background: #ffffff;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.1);
}

.chapter-item:hover::before {
  transform: scaleX(1);
}

.chapter-item.selected {
  border-color: #4a90e2;
  background: #ffffff;
}

.chapter-item.selected::before {
  transform: scaleX(1);
}

.chapter-checkbox {
  font-weight: 600;
  color: #1a2a3a;
  font-size: 15px;
}

.chapter-checkbox:deep(.el-checkbox__label) {
  font-weight: 600;
  color: #1a2a3a;
}

.chapter-name {
  font-weight: 600;
  font-size: 15px;
}

.chapter-desc {
  font-size: 13px;
  color: #6c757d;
  margin: 8px 0 12px 0;
  padding-left: 0;
}

.knowledge-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding-left: 0;
}

.knowledge-tag {
  margin: 0;
  padding: 4px 10px;
  background: rgba(74, 144, 226, 0.08);
  border: 1px solid rgba(74, 144, 226, 0.15);
  color: #4a90e2;
  border-radius: 4px;
  font-size: 12px;
}

.generate-btn {
  min-width: 160px;
  padding: 12px 32px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  border: none;
  transition: all 0.2s ease;
}

.generate-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
}

.form-item-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 12px;
  font-size: 15px;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-input__wrapper) {
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 2px solid #e9ecef;
  padding: 12px 16px;
  transition: all 0.3s ease;
  background: #ffffff;
}

:deep(.el-input__wrapper:hover) {
  border-color: #4a90e2;
  box-shadow: 0 2px 12px rgba(74, 144, 226, 0.15);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.15), 0 2px 12px rgba(74, 144, 226, 0.15);
  border-color: #4a90e2;
}

:deep(.el-input__inner) {
  font-size: 15px;
  padding: 6px 0;
}

:deep(.el-form-item__label) {
  font-weight: 600;
  color: #343a40;
  font-size: 15px;
  margin-bottom: 12px;
}

:deep(.el-select) {
  border-radius: 10px;
}

:deep(.el-input-number) {
  border-radius: 10px;
}

:deep(.el-checkbox) {
  margin-right: 16px;
  margin-bottom: 12px;
}

@media (max-width: 768px) {
  .content-area {
    margin-left: 0;
  }

  .main-content {
    padding: 16px;
  }

  .chapter-list {
    grid-template-columns: 1fr;
  }
}
</style>
