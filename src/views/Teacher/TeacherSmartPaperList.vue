<template>
  <div class="page-layout">
    <TeacherHeader />
    <div class="content-container">
      <TeacherSidebar />
      <div class="content-area">
        <main class="main-content">
          <div class="page-header">
            <div class="header-left">
              <h1 class="page-title">智能组卷</h1>
              <p class="page-subtitle">管理和查看智能生成的试卷</p>
            </div>
            <div class="header-right">
              <el-button type="primary" @click="goToGenerate" class="generate-btn">
                <span class="btn-icon">+</span>
                生成试卷
              </el-button>
            </div>
          </div>

          <div class="paper-list">
            <div
              v-for="paper in papers"
              :key="paper.paper_id"
              class="paper-card"
              @click="goToDetail(paper.paper_id)"
            >
              <div class="paper-info">
                <h3 class="paper-name">{{ paper.paper_name }}</h3>
                <p class="paper-meta">
                  <span class="meta-item">创建时间：{{ formatTime(paper.created_at) }}</span>
                  <span class="meta-item">题目数量：{{ getQuestionCount(paper) }}</span>
                  <span class="meta-item">总分：{{ paper.result?.total_score || paper.config?.total_score }}分</span>
                </p>
                <div class="question-types">
                  <el-tag
                    v-for="type in paper.config?.question_types"
                    :key="type"
                    size="small"
                    type="info"
                  >
                    {{ type }}
                  </el-tag>
                </div>
              </div>
              <div class="paper-actions">
                <el-button size="small" @click.stop="goToDetail(paper.paper_id)">查看详情</el-button>
                <el-button size="small" type="danger" @click.stop="deletePaper(paper.paper_id)">删除</el-button>
              </div>
            </div>
          </div>

          <div v-if="papers.length === 0" class="empty-state">
            <div class="empty-icon">📄</div>
            <p>暂无试卷记录</p>
            <el-button type="primary" @click="goToGenerate">生成第一份试卷</el-button>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import TeacherSidebar from '@/components/Teacher/TeacherSidebar.vue'
import TeacherHeader from '@/components/Teacher/TeacherHeader.vue'
import { smartPaperAPI } from '@/services/api.js'

const router = useRouter()
const papers = ref([])
const loading = ref(false)

const loadPapers = async () => {
  loading.value = true
  try {
    const response = await smartPaperAPI.getPaperList()
    if (response.code === 200 && response.data) {
      papers.value = response.data.papers || response.data.results || []
    } else {
      ElMessage.error(response.message || '获取试卷列表失败')
    }
  } catch (error) {
    console.error('获取试卷列表失败:', error)
    ElMessage.error('获取试卷列表失败')
  } finally {
    loading.value = false
  }
}

const getQuestionCount = (paper) => {
  return paper.result?.questions?.length || 0
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  try {
    // 假设后端返回的是UTC时间，需要转换为本地时间
    let date = parseUTCTime(timeStr)

    if (!isNaN(date.getTime())) {
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / (1000 * 60))
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      // 显示相对时间
      if (diffMins < 1) {
        return '刚刚'
      } else if (diffMins < 60) {
        return `${diffMins}分钟前`
      } else if (diffHours < 24) {
        return `${diffHours}小时前`
      } else if (diffDays < 7) {
        return `${diffDays}天前`
      } else {
        // 超过一周显示完整时间
        return date.toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        })
      }
    }
  } catch (e) {
    console.error('时间格式化失败:', e)
  }
  return timeStr
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
  router.push('/teacher/smart-paper/generate')
}

const goToDetail = (paperId) => {
  router.push(`/teacher/smart-paper/detail/${paperId}`)
}

const deletePaper = async (paperId) => {
  // 这里可以添加删除确认和删除API调用
  ElMessage.warning('删除功能待实现')
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
  margin-bottom: 24px;
}

.header-left {
  flex: 1;
}

.header-right {
  display: flex;
  align-items: center;
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

.generate-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 500;
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  border: none;
}

.btn-icon {
  font-size: 18px;
  font-weight: 600;
}

.paper-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 20px;
}

.paper-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  cursor: pointer;
  transition: all 0.3s ease;
}

.paper-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.paper-info {
  flex: 1;
}

.paper-name {
  font-size: 18px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0 0 12px 0;
}

.paper-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 0 0 12px 0;
}

.meta-item {
  font-size: 13px;
  color: #6c757d;
}

.question-types {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.paper-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-left: 20px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 15px;
  color: #6c757d;
  margin: 0 0 20px 0;
}

@media (max-width: 768px) {
  .content-area {
    margin-left: 0;
  }

  .paper-list {
    grid-template-columns: 1fr;
  }

  .paper-card {
    flex-direction: column;
  }

  .paper-actions {
    flex-direction: row;
    margin-left: 0;
    margin-top: 16px;
  }
}
</style>
