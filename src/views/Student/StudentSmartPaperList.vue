<template>
  <div class="page-layout">
    <StudentHeader />
    <div class="content-container">
      <StudentSidebar />
      <div class="content-area">
        <main class="main-content">
          <div class="page-header">
            <div class="header-left">
              <h1 class="page-title">我的试卷</h1>
              <p class="page-subtitle">查看和管理您的智能组卷</p>
            </div>
            <el-button type="primary" @click="goToGenerate">
              生成新试卷
            </el-button>
          </div>

          <el-tabs v-model="activeTab" class="paper-tabs">
            <el-tab-pane label="可做试卷" name="todo">
              <div class="paper-list">
                <div v-if="todoPapers.length === 0" class="empty-state">
                  <el-empty description="暂无可做试卷" />
                </div>
                <div v-else class="paper-grid">
                  <div v-for="paper in todoPapers" :key="paper.paperId || paper.paper_id" class="paper-card">
                <div class="paper-header">
                  <h3 class="paper-title">{{ paper.paperName || paper.paper_name }}</h3>
                  <span class="status-tag not-done">未做</span>
                </div>
                <div class="paper-info">
                  <div class="info-item">
                    <span class="label">创建时间：</span>
                    <span class="value">{{ formatDate(paper.submittedAt || paper.created_at) }}</span>
                  </div>
                  <div class="info-item" v-if="paper.maxScore || paper.result?.max_score">
                    <span class="label">总分：</span>
                    <span class="value">{{ paper.maxScore || paper.result?.max_score }}分</span>
                  </div>
                </div>
                <div class="paper-footer">
                  <button class="btn-action btn-primary" @click="goToAnswer(paper.paperId || paper.paper_id)">
                    开始答题
                  </button>
                </div>
              </div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="已做试卷" name="done">
              <div class="paper-list">
                <div v-if="donePapers.length === 0" class="empty-state">
                  <el-empty description="暂无已做试卷" />
                </div>
                <div v-else class="paper-grid">
                  <div v-for="paper in donePapers" :key="paper.paperId || paper.paper_id" class="paper-card">
                <div class="paper-header">
                  <h3 class="paper-title">{{ paper.paperName || paper.paper_name }}</h3>
                  <span class="status-tag done">已做</span>
                </div>
                <div class="paper-info">
                  <div class="info-item">
                    <span class="label">提交时间：</span>
                    <span class="value">{{ formatDate(paper.submittedAt || paper.gradedAt) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">得分：</span>
                    <span class="score-display">
                      <span class="current">{{ paper.score || paper.result?.score || 0 }}</span>
                      <span class="total">/{{ paper.maxScore || paper.result?.max_score || 100 }}分</span>
                    </span>
                  </div>
                </div>
                <div class="paper-footer">
                  <button class="btn-action btn-secondary" @click="goToResult(paper.paperId || paper.paper_id)">
                    查看结果
                  </button>
                </div>
              </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import StudentSidebar from '@/components/Student/StudentSidebar.vue'
import StudentHeader from '@/components/Student/StudentHeader.vue'
import { smartPaperAPI } from '@/services/api.js'

const router = useRouter()
const activeTab = ref('todo')
const papers = ref([])
const loading = ref(false)

const todoPapers = computed(() => {
  return papers.value.filter(p => {
    return !p.hasSubmitted
  })
})

const donePapers = computed(() => {
  return papers.value.filter(p => {
    return p.hasSubmitted
  })
})

const loadPapers = async () => {
  loading.value = true
  try {
    const response = await smartPaperAPI.getPaperList()
    console.log('试卷列表接口响应:', response)
    console.log('response.data:', response.data)

    if (response.code === 200 && response.data) {
      // 学生端接口返回的是 results 数组，教师端返回的是 papers 数组
      const paperList = response.data.results || response.data.papers || []
      console.log('解析到的试卷列表:', paperList)

      if (paperList.length > 0) {
        console.log('========== 第一份试卷详情 ==========')
        console.log('完整对象:', paperList[0])
        console.log('paper_id:', paperList[0].paper_id)
        console.log('paper_name:', paperList[0].paper_name)
        console.log('created_at:', paperList[0].created_at)
        console.log('status:', paperList[0].status)
        console.log('result:', paperList[0].result)
        console.log('所有属性:', Object.keys(paperList[0]))

        const papersWithStatus = await Promise.all(
          paperList.map(async (paper) => {
            try {
              const result = await smartPaperAPI.getPaperResult(paper.paper_id)
              return {
                ...paper,
                hasSubmitted: result.code === 200 && result.data !== null
              }
            } catch (error) {
              return {
                ...paper,
                hasSubmitted: false
              }
            }
          })
        )

        papers.value = papersWithStatus
        console.log('成功加载试卷列表:', papers.value.length, '份')
        console.log('可做试卷数量:', todoPapers.value.length)
        console.log('已做试卷数量:', donePapers.value.length)
      }
    } else if (response.code === 400 && response.message.includes('无权')) {
      console.log('学生身份无权访问试卷列表接口')
    } else {
      ElMessage.error(response.message || '获取试卷列表失败')
    }
  } catch (error) {
    console.error('获取试卷列表失败:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = parseUTCTime(dateStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
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

const goToGenerate = () => {
  router.push('/student/smart-paper/generate')
}

const goToAnswer = (paperId) => {
  router.push(`/student/smart-paper/answer/${paperId}`)
}

const goToResult = (paperId) => {
  router.push(`/student/smart-paper/result/${paperId}`)
}

onMounted(() => {
  loadPapers()
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.header-left {
  flex: 1;
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

.paper-tabs {
  background: #ffffff;
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

:deep(.el-tabs__header) {
  display: flex;
  background: transparent;
  padding: 0 24px;
  margin: 0;
  border-bottom: 2px solid #e9ecef;
}

:deep(.el-tabs__nav) {
  display: flex;
  width: 100%;
  position: relative;
}

:deep(.el-tabs__nav::after) {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 50%;
  height: 2px;
  background: linear-gradient(90deg, #4a90e2 0%, #63b3ed 100%);
  border-radius: 1px;
  transition: transform 0.3s ease;
}

:deep(.el-tabs__nav:has(.el-tabs__item:nth-child(2).is-active))::after {
  transform: translateX(100%);
}

:deep(.el-tabs__item) {
  flex: 1;
  text-align: center;
  padding: 28px 20px;
  margin: 0;
  border: none;
  background: transparent;
  transition: all 0.3s ease;
  font-size: 16px;
  font-weight: 500;
  color: #6c757d;
  position: relative;
  letter-spacing: 0.5px;
}

:deep(.el-tabs__item:hover) {
  color: #4a90e2;
  font-weight: 600;
}

:deep(.el-tabs__item.is-active) {
  font-size: 17px;
  font-weight: 700;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
}

:deep(.el-tabs__content) {
  padding: 24px;
}

.paper-list {
  min-height: 400px;
}

.empty-state {
  padding: 60px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.paper-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.paper-card {
  border: none;
  border-radius: 16px;
  padding: 24px;
  background: #ffffff;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.paper-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4a90e2 0%, #63b3ed 100%);
}

.paper-card:hover {
  box-shadow: 0 8px 30px rgba(74, 144, 226, 0.15);
  transform: translateY(-4px);
}

.paper-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.paper-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0;
  flex: 1;
  line-height: 1.4;
}

.status-tag {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-tag.not-done {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeeba 100%);
  color: #856404;
}

.status-tag.done {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  color: #155724;
}

.paper-info {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #495057;
}

.info-item .icon {
  margin-right: 8px;
  color: #adb5bd;
}

.info-item .label {
  color: #868e96;
  margin-right: 8px;
}

.info-item .value {
  font-weight: 500;
}

.score-display {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
}

.score-display .current {
  font-size: 20px;
  font-weight: 700;
  color: #4a90e2;
}

.score-display .total {
  font-size: 14px;
  color: #adb5bd;
}

.paper-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #f1f3f4;
}

.btn-action {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  color: white;
}

.btn-primary:hover {
  background: linear-gradient(135deg, #357abd 0%, #2d6bc7 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
}

.btn-secondary {
  background: #f1f3f4;
  color: #495057;
}

.btn-secondary:hover {
  background: #e9ecef;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .content-area {
    margin-left: 0;
  }

  .main-content {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .paper-grid {
    grid-template-columns: 1fr;
  }
}
</style>
