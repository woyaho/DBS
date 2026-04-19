<template>
  <div class="page-layout">
    <!-- 栏头 -->
    <TeacherHeader />
    
    <div class="content-container">
      <!-- 侧边栏 -->
      <TeacherSidebar />

      <!-- 主内容区 -->
      <div class="content-area">
        <!-- 面包屑导航 -->
        <Breadcrumb />

        <main class="main-content">
          <div class="homework-review-container">
            <!-- 班级切换栏（仅当教师有多个班级时显示） -->
            <div v-if="teacherClasses.length > 1" class="class-switch-bar">
              <span class="class-label">当前班级：</span>
              <div class="class-tabs">
                <button
                  v-for="cls in teacherClasses"
                  :key="cls.id"
                  :class="['class-tab', { active: selectedClass === cls.id }]"
                  @click="switchClass(cls.id)"
                >
                  {{ cls.name }}
                  <span class="student-count">({{ cls.studentCount }}人)</span>
                </button>
              </div>
            </div>

            <!-- 页面标题 -->
            <div class="page-header">
              <h1 class="page-title">作业批改 - {{ homeworkInfo.title }}</h1>

              <!-- 提交状态统计 -->
              <div class="submission-stats">
                <span class="stat-item">
                  <span class="stat-label">已提交：</span>
                  <span class="stat-value submitted">{{ submittedCount }}</span>
                </span>
                <span class="stat-item">
                  <span class="stat-label">未提交：</span>
                  <span class="stat-value not-submitted">{{ notSubmittedCount }}</span>
                </span>
                <span class="stat-item">
                  <span class="stat-label">已批改：</span>
                  <span class="stat-value reviewed">{{ reviewedCount }}</span>
                </span>
                <span class="stat-item">
                  <span class="stat-label">未批改：</span>
                  <span class="stat-value not-reviewed">{{ notReviewedCount }}</span>
                </span>
                <button
                  class="ai-auto-review-btn"
                  @click="startAIAutoReview"
                  :disabled="isAutoReviewing || notReviewedCount === 0"
                >
                  {{ isAutoReviewing ? 'AI批改中...' : '一键AI批改' }}
                </button>

                <!-- AI批改进度 -->
                <div v-if="isAutoReviewing" class="ai-review-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: autoReviewProgress + '%' }"></div>
                  </div>
                  <div class="progress-text">正在批改：{{ autoReviewProgress }}%</div>
                </div>
              </div>
            </div>

            <!-- 作业信息卡片 -->
            <div class="homework-info-card">
              <div class="homework-header">
                <h3 class="homework-info-title">{{ homeworkInfo.title }}</h3>
                <span class="homework-status-badge" :class="homeworkStatus">
                  {{ getHomeworkStatusText(homeworkStatus) }}
                </span>
              </div>
              <p class="homework-info-desc">{{ homeworkInfo.description }}</p>
              <div class="homework-info-meta">
                <span class="meta-item">
                  <span class="meta-label">发布时间：</span>
                  <span class="meta-value">{{ formatDateTime(homeworkInfo.publishTime) }}</span>
                </span>
                <span class="meta-item">
                  <span class="meta-label">截止时间：</span>
                  <span class="meta-value">{{ formatDateTime(homeworkInfo.deadline) }}</span>
                </span>
                <span class="meta-item">
                  <span class="meta-label">提交人数：</span>
                  <span class="meta-value">{{ homeworkInfo.submittedCount }}/{{ homeworkInfo.totalCount }}</span>
                </span>
                <span class="meta-item">
                  <span class="meta-label">已批改：</span>
                  <span class="meta-value">{{ homeworkInfo.reviewedCount }}/{{ homeworkInfo.submittedCount }}</span>
                </span>
              </div>
            </div>

            <!-- 统计卡片 -->
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">📝</div>
                <div class="stat-info">
                  <div class="stat-value">{{ pendingCount }}</div>
                  <div class="stat-label">待批改</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">✅</div>
                <div class="stat-info">
                  <div class="stat-value">{{ completedCount }}</div>
                  <div class="stat-label">已批改</div>
                </div>
              </div>
              <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-info">
                  <div class="stat-value">{{ averageScore }}</div>
                  <div class="stat-label">平均分</div>
                </div>
              </div>
            </div>

            <!-- 学生作业列表 -->
            <div class="homework-list-card">
              <div class="table-header">
                <h3 class="section-title">学生作业列表</h3>
                <div class="filter-section">
                  <select v-model="selectedStatus" class="filter-select">
                    <option value="all">全部状态</option>
                    <option value="pending">待批改</option>
                    <option value="completed">已批改</option>
                  </select>
                  <select v-model="sortBy" class="filter-select">
                    <option value="default">默认排序</option>
                    <option value="score-desc">成绩从高到低</option>
                    <option value="score-asc">成绩从低到高</option>
                    <option value="time-desc">提交时间从晚到早</option>
                    <option value="time-asc">提交时间从早到晚</option>
                  </select>
                  <div class="search-box">
                    <input type="text" v-model="searchKeyword" placeholder="搜索学生姓名..." class="search-input" />
                    <span class="search-icon">🔍</span>
                  </div>
                </div>
              </div>

              <div class="table-responsive">
                <table v-if="!loadingSubmissions && filteredHomeworkList.length > 0" class="homework-table">
                  <thead>
                    <tr>
                      <th>学号</th>
                      <th>姓名</th>
                      <th>作业</th>
                      <th>提交时间</th>
                      <th>状态</th>
                      <th>得分</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in filteredHomeworkList" :key="item.id">
                      <td>{{ item.studentId }}</td>
                      <td class="student-name">{{ item.studentName }}</td>
                      <td>{{ item.homeworkName }}</td>
                      <td>{{ item.submitTime }}</td>
                      <td>
                        <span class="status-badge" :class="item.status">
                          {{ item.status === 'pending' ? '待批改' : '已批改' }}
                        </span>
                      </td>
                      <td class="score-cell">
                        <span v-if="item.score !== null" :class="getScoreClass(item.score)">
                          {{ item.score }}
                        </span>
                        <span v-else class="no-score">—</span>
                      </td>
                      <td>
                        <button class="action-btn" @click="reviewHomework(item)">
                          {{ item.status === 'pending' ? '批改' : '查看' }}
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
                <div v-else-if="loadingSubmissions" class="loading-container">
                  <div class="loading-spinner"></div>
                  <p>加载作业列表中...</p>
                </div>
                <div v-else class="empty-state">
                  <div class="empty-icon">📭</div>
                  <p>暂无作业数据</p>
                </div>
              </div>
            </div>

            <!-- 批改弹窗 -->
            <div v-if="selectedSubmission" class="modal-overlay" @click.self="closeReviewModal">
              <div class="modal-content review-modal">
                <div class="modal-header">
                  <h3>批改作业 - {{ selectedSubmission.studentName }}</h3>
                  <button class="close-btn" @click="closeReviewModal">×</button>
                </div>
                <div class="modal-body">
                  <!-- 作业信息 -->
                  <div class="submission-info">
                    <div class="info-item">
                      <span class="info-label">学号：</span>
                      <span class="info-value">{{ selectedSubmission.studentId }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">作业：</span>
                      <span class="info-value">{{ selectedSubmission.homeworkName }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">提交时间：</span>
                      <span class="info-value">{{ selectedSubmission.submitTime }}</span>
                    </div>
                  </div>

                  <!-- 作业文件 -->
                  <div class="submission-files">
                    <h4 class="subsection-title">提交文件</h4>
                    <div class="file-list">
                      <div v-for="(file, index) in selectedSubmission.files" :key="index" class="file-item">
                        <span class="file-icon">📄</span>
                        <span class="file-name">{{ file.name }}</span>
                        <button class="download-btn" @click="downloadFile(file)">下载</button>
                      </div>
                    </div>
                  </div>

                  <!-- 作业内容 -->
                  <div class="submission-content">
                    <h4 class="subsection-title">作业内容</h4>
                    <div class="content-box">
                      {{ selectedSubmission.content }}
                    </div>
                  </div>

                  <!-- 评分区域 -->
                  <div class="scoring-section">
                    <h4 class="subsection-title">评分</h4>
                    <div class="score-input-group">
                      <label class="score-label">得分：</label>
                      <input
                        type="number"
                        v-model="reviewScore"
                        class="score-input"
                        min="0"
                        max="100"
                        placeholder="0-100"
                      />
                      <span class="score-total">/ 100</span>
                    </div>
                  </div>

                  <!-- 评语区域 -->
                  <div class="comment-section">
                    <h4 class="subsection-title">评语</h4>
                    <textarea
                      v-model="reviewComment"
                      class="comment-textarea"
                      rows="4"
                      placeholder="请输入评语..."
                    ></textarea>
                  </div>

                  <!-- AI辅助评阅 -->
                  <div class="ai-assist-section">
                    <h4 class="subsection-title">AI辅助评阅</h4>
                    <div class="ai-assist-content">
                      <div class="ai-assist-buttons">
                        <button class="ai-btn" @click="generateAIComment" :disabled="generatingAIComment">
                          {{ generatingAIComment ? '生成中...' : 'AI生成评语' }}
                        </button>
                        <button class="ai-btn" @click="analyzeContent" :disabled="analyzingContent">
                          {{ analyzingContent ? '分析中...' : '内容分析' }}
                        </button>
                      </div>
                      <div v-if="aiAnalysisResult" class="ai-analysis-result">
                        <h5>内容分析结果：</h5>
                        <p>{{ aiAnalysisResult }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- 快捷评语 -->
                  <div class="quick-comments">
                    <span class="quick-comment-label">快捷评语：</span>
                    <button
                      v-for="(comment, index) in quickComments"
                      :key="index"
                      class="quick-comment-btn"
                      @click="addQuickComment(comment)"
                    >
                      {{ comment }}
                    </button>
                  </div>

                  <!-- 操作按钮 -->
                  <div class="modal-actions">
                    <button class="btn-secondary" @click="closeReviewModal">取消</button>
                    <button class="btn-primary" @click="submitReview">提交批改</button>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import TeacherSidebar from '@/components/Teacher/TeacherSidebar.vue'
import TeacherHeader from '@/components/Teacher/TeacherHeader.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { teacherAPI } from '@/services/api.js'

// 状态管理
const route = useRoute()
const selectedHomework = ref('all')
const selectedStatus = ref('all')
const searchKeyword = ref('')
const selectedSubmission = ref(null)
const reviewScore = ref('')
const reviewComment = ref('')
const generatingAIComment = ref(false)
const analyzingContent = ref(false)
const aiAnalysisResult = ref('')
const sortBy = ref('default')
const isAutoReviewing = ref(false)
const autoReviewProgress = ref(0)
const loading = ref(false)
const loadingSubmissions = ref(false)

// 班级数据
const teacherClasses = ref([])
const selectedClass = ref(1)

// 作业信息
const homeworkInfo = ref({
  id: 0,
  title: '',
  description: '',
  publishTime: '',
  deadline: '',
  totalCount: 0,
  submittedCount: 0,
  reviewedCount: 0
})

// 作业数据
const homeworkData = ref([])

// 切换班级
const switchClass = (classId) => {
  selectedClass.value = classId
  // 这里可以添加加载该班级作业数据的逻辑
  console.log('切换到班级:', classId)
}

// 计算作业状态
const homeworkStatus = computed(() => {
  const now = new Date()
  const publishDate = new Date(homeworkInfo.value.publishTime)
  const deadlineDate = new Date(homeworkInfo.value.deadline)

  if (now < publishDate) {
    return 'upcoming'
  } else if (now > deadlineDate) {
    return 'ended'
  } else {
    return 'active'
  }
})

// 获取作业状态文本
const getHomeworkStatusText = (status) => {
  const statusMap = {
    active: '进行中',
    ended: '已截止',
    upcoming: '未开始'
  }
  return statusMap[status] || status
}

// 格式化日期时间
const formatDateTime = (dateTimeString) => {
  const date = new Date(dateTimeString)
  if (isNaN(date.getTime())) {
    return dateTimeString
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 加载作业信息
const loadHomeworkInfo = async () => {
  loading.value = true
  try {
    const homeworkId = parseInt(route.params.id) || 1
    homeworkInfo.value = {
      id: homeworkId,
      title: '',
      description: '',
      publishTime: '',
      deadline: '',
      totalCount: 0,
      submittedCount: 0,
      reviewedCount: 0
    }
    selectedHomework.value = homeworkId.toString()
    
    // 加载作业提交列表
    await loadSubmissions(homeworkId)
  } catch (error) {
    console.error('加载作业信息失败:', error)
    alert('加载作业信息失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 加载作业提交列表
const loadSubmissions = async (assignmentId) => {
  loadingSubmissions.value = true
  try {
    const response = await teacherAPI.getAssignmentSubmissions(assignmentId)
    if (response.code === 200) {
      homeworkData.value = response.data.map(item => ({
        id: item.submissionId,
        studentId: item.studentUsername,
        studentName: item.studentName,
        homeworkName: homeworkInfo.value.title,
        submitTime: new Date(item.submittedAt).toLocaleString('zh-CN'),
        status: item.grade === null ? 'pending' : 'completed',
        score: item.grade,
        files: [
          { name: item.mergedPdfName, url: item.viewPdfUrl }
        ],
        content: '作业内容...'
      }))
    }
  } catch (error) {
    console.error('加载作业提交列表失败:', error)
    alert('加载作业提交列表失败，请稍后重试')
  } finally {
    loadingSubmissions.value = false
  }
}

// 加载作业状态统计
const loadAssignmentStatus = async (assignmentId) => {
  try {
    const response = await teacherAPI.getAssignmentStatus(assignmentId)
    if (response.code === 200) {
      homeworkInfo.value.totalCount = response.data.totalStudents
      homeworkInfo.value.submittedCount = response.data.submittedCount
      homeworkInfo.value.reviewedCount = response.data.submittedCount - notReviewedCount.value
    }
  } catch (error) {
    console.error('加载作业状态统计失败:', error)
  }
}

// 快捷评语
const quickComments = [
  '完成得很好，继续保持！',
  '思路清晰，答案准确',
  '需要加强对基础概念的理解',
  '代码规范，注释清晰',
  '分析深入，见解独到',
  '请仔细检查后再提交'
]

// 加载数据
onMounted(async () => {
  await loadHomeworkInfo()
  const homeworkId = parseInt(route.params.id) || 1
  await loadAssignmentStatus(homeworkId)
})

// 过滤后的作业列表
const filteredHomeworkList = computed(() => {
  let filtered = homeworkData.value

  // 按作业筛选
  if (selectedHomework.value !== 'all') {
    filtered = filtered.filter(item => item.homeworkName === `作业${selectedHomework.value}`)
  }

  // 按状态筛选
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(item => item.status === selectedStatus.value)
  }

  // 按姓名搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    filtered = filtered.filter(item => item.studentName.toLowerCase().includes(keyword))
  }

  // 排序
  switch (sortBy.value) {
    case 'score-desc':
      filtered.sort((a, b) => {
        if (a.score === null && b.score === null) return 0
        if (a.score === null) return 1
        if (b.score === null) return -1
        return b.score - a.score
      })
      break
    case 'score-asc':
      filtered.sort((a, b) => {
        if (a.score === null && b.score === null) return 0
        if (a.score === null) return -1
        if (b.score === null) return 1
        return a.score - b.score
      })
      break
    case 'time-desc':
      filtered.sort((a, b) => new Date(b.submitTime) - new Date(a.submitTime))
      break
    case 'time-asc':
      filtered.sort((a, b) => new Date(a.submitTime) - new Date(b.submitTime))
      break
  }

  return filtered
})

// 待批改数量
const pendingCount = computed(() => {
  return homeworkData.value.filter(item => item.status === 'pending').length
})

// 已批改数量
const completedCount = computed(() => {
  return homeworkData.value.filter(item => item.status === 'completed').length
})

// 已提交数量
const submittedCount = computed(() => {
  return homeworkData.value.length
})

// 未提交数量
const notSubmittedCount = computed(() => {
  // 假设总学生数为45（从作业信息中获取）
  return homeworkInfo.value.totalCount - homeworkData.value.length
})

// 已批改数量（与completedCount相同，为了语义清晰）
const reviewedCount = computed(() => {
  return completedCount.value
})

// 未批改数量（与pendingCount相同，为了语义清晰）
const notReviewedCount = computed(() => {
  return pendingCount.value
})

// 平均分
const averageScore = computed(() => {
  const completed = homeworkData.value.filter(item => item.score !== null)
  if (completed.length === 0) return '—'
  const sum = completed.reduce((acc, item) => acc + item.score, 0)
  return (sum / completed.length).toFixed(1)
})

// 获取分数等级样式
const getScoreClass = (score) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 70) return 'score-medium'
  if (score >= 60) return 'score-pass'
  return 'score-fail'
}

// 批改作业
const reviewHomework = async (item) => {
  try {
    const response = await teacherAPI.getSubmissionDetail(item.id)
    if (response.code === 200) {
      const data = response.data
      selectedSubmission.value = {
        ...item,
        content: data.textContent || '无内容',
        files: data.originalFiles.map(file => ({
          name: file.fileName,
          url: data.viewPdfUrl
        }))
      }
      reviewScore.value = data.grade !== null ? data.grade : ''
      reviewComment.value = data.annotation || ''
    }
  } catch (error) {
    console.error('获取作业详情失败:', error)
    alert('获取作业详情失败，请稍后重试')
  }
}

// 关闭批改弹窗
const closeReviewModal = () => {
  selectedSubmission.value = null
  reviewScore.value = ''
  reviewComment.value = ''
  aiAnalysisResult.value = ''
}

// 下载文件
const downloadFile = (file) => {
  if (file.url) {
    window.open(file.url, '_blank')
  }
}

// 添加快捷评语
const addQuickComment = (comment) => {
  if (reviewComment.value) {
    reviewComment.value += '\n' + comment
  } else {
    reviewComment.value = comment
  }
}

// 生成AI评语
const generateAIComment = async () => {
  if (!selectedSubmission.value) return

  generatingAIComment.value = true
  try {
    // 模拟AI生成评语
    await new Promise(resolve => setTimeout(resolve, 1500))
    const aiComment = `该作业内容完整，分析深入，思路清晰。\n\n优点：\n1. 对PostgreSQL与openGauss的技术特性对比全面\n2. 实践部分操作步骤详细\n3. 对"卡脖子"问题的认识深刻\n\n建议：\n1. 可以增加更多实际案例分析\n2. 进一步优化文档格式\n3. 加强对数据库内部结构的研究深度`

    if (reviewComment.value) {
      reviewComment.value += '\n\n--- AI辅助评语 ---\n' + aiComment
    } else {
      reviewComment.value = aiComment
    }
  } finally {
    generatingAIComment.value = false
  }
}

// 分析内容
const analyzeContent = async () => {
  if (!selectedSubmission.value) return

  analyzingContent.value = true
  try {
    // 模拟内容分析
    await new Promise(resolve => setTimeout(resolve, 1500))
    aiAnalysisResult.value = '内容分析：作业包含完整的技术特性对比、实践操作步骤和技术研究内容，符合作业要求。建议重点关注数据库内部存储结构和查询优化策略的分析深度。'
  } finally {
    analyzingContent.value = false
  }
}

// 提交批改
const submitReview = async () => {
  if (reviewScore.value === '' || reviewScore.value === null) {
    alert('请输入分数')
    return
  }

  const score = parseInt(reviewScore.value)
  if (score < 0 || score > 100) {
    alert('分数必须在0-100之间')
    return
  }

  try {
    // 调用批改作业的API
    await teacherAPI.gradeAssignment(selectedSubmission.value.id, score, reviewComment.value)
    
    // 更新本地数据
    const index = homeworkData.value.findIndex(item => item.id === selectedSubmission.value.id)
    if (index !== -1) {
      homeworkData.value[index].score = score
      homeworkData.value[index].comment = reviewComment.value
      homeworkData.value[index].status = 'completed'
    }

    alert('批改成功！')
    closeReviewModal()
  } catch (error) {
    console.error('提交批改失败:', error)
    alert('提交批改失败，请稍后重试')
  }
}

// 一键AI批改
const startAIAutoReview = async () => {
  // 获取待批改的作业
  const pendingHomework = homeworkData.value.filter(item => item.status === 'pending')

  if (pendingHomework.length === 0) {
    alert('没有待批改的作业')
    return
  }

  isAutoReviewing.value = true
  autoReviewProgress.value = 0

  try {
    const homeworkId = parseInt(route.params.id) || 1
    const response = await teacherAPI.aiGradeAssignment(homeworkId, false)
    
    if (response.code === 200) {
      // 轮询批改进度
      const checkProgress = async () => {
        const progressResponse = await teacherAPI.getAiGradeProgress(homeworkId)
        if (progressResponse.code === 200) {
          const progressData = progressResponse.data
          autoReviewProgress.value = Math.round((progressData.completedCount / progressData.totalCount) * 100)
          
          if (progressData.status === 'completed' || progressData.status === 'partial_success') {
            // 加载最新的批改结果
            await loadSubmissions(homeworkId)
            alert(`AI自动批改完成！共批改了 ${progressData.completedCount} 份作业`)
            isAutoReviewing.value = false
            autoReviewProgress.value = 0
          } else {
            // 继续轮询
            setTimeout(checkProgress, 2000)
          }
        }
      }
      
      // 开始轮询
      setTimeout(checkProgress, 2000)
    }
  } catch (error) {
    console.error('AI批改失败:', error)
    alert('AI批改失败，请稍后重试')
    isAutoReviewing.value = false
    autoReviewProgress.value = 0
  }
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

.homework-review-container {
  max-width: 100%;
  margin: 0;
}

/* 班级切换栏 */
.class-switch-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.class-label {
  font-size: 14px;
  color: #6c757d;
  font-weight: 500;
}

.class-tabs {
  display: flex;
  gap: 8px;
}

.class-tab {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #fff;
  color: #495057;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.class-tab:hover {
  border-color: #4a90e2;
  color: #4a90e2;
}

.class-tab.active {
  background: #4a90e2;
  border-color: #4a90e2;
  color: #fff;
}

.student-count {
  font-size: 12px;
  opacity: 0.8;
}

/* 页面头部 */
.page-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 16px;
}

/* 提交状态统计 */
.submission-stats {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  width: 100%;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.stat-label {
  color: #6c757d;
  font-weight: 500;
}

.stat-value {
  font-weight: 600;
  font-size: 16px;
}

.stat-value.submitted {
  color: #28a745;
}

.stat-value.not-submitted {
  color: #dc3545;
}

.stat-value.reviewed {
  color: #17a2b8;
}

.stat-value.not-reviewed {
  color: #ffc107;
}

/* 一键AI批改按钮 */
.ai-auto-review-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ai-auto-review-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.ai-auto-review-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* AI批改进度条 */
.ai-review-progress {
  margin-top: 12px;
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #6c757d;
  text-align: center;
  margin-top: 4px;
}

.page-title {
  font-size: 26px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0;
}

/* 作业信息卡片 */
.homework-info-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  border-left: 4px solid #4a90e2;
}

.homework-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.homework-info-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0;
}

.homework-status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.homework-status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.homework-status-badge.ended {
  background: #f5f5f5;
  color: #6c757d;
}

.homework-status-badge.upcoming {
  background: #e3f2fd;
  color: #1976d2;
}

.homework-info-desc {
  font-size: 14px;
  color: #555;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.homework-info-meta {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.homework-info-meta .meta-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.homework-info-meta .meta-label {
  color: #6c757d;
  margin-right: 4px;
}

.homework-info-meta .meta-value {
  color: #333;
  font-weight: 500;
}

.filter-section {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 8px 16px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  cursor: pointer;
}

/* 统计卡片 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  font-size: 40px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1a2a3a;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #6c757d;
  margin-top: 4px;
}

/* 作业列表卡片 */
.homework-list-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-section {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:hover {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.filter-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0;
}

.search-box {
  position: relative;
}

.search-input {
  padding: 8px 32px 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  width: 220px;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  color: #adb5bd;
}

/* 表格样式 */
.table-responsive {
  overflow-x: auto;
}

.homework-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.homework-table th,
.homework-table td {
  padding: 14px 12px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.homework-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.homework-table tr:hover {
  background: #f8f9fa;
}

.student-name {
  font-weight: 500;
  color: #1a2a3a;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.pending {
  background: #fff3e0;
  color: #ed6c02;
}

.status-badge.completed {
  background: #e8f5e9;
  color: #2e7d32;
}

.score-cell {
  font-weight: 600;
}

.score-excellent { color: #4caf50; }
.score-good { color: #2196f3; }
.score-medium { color: #ff9800; }
.score-pass { color: #ffc107; }
.score-fail { color: #f44336; }

.no-score {
  color: #adb5bd;
}

.action-btn {
  padding: 6px 14px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.3s;
}

.action-btn:hover {
  background: #357abd;
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
  color: #6c757d;
  font-size: 14px;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 20px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalFadeIn 0.2s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1a2a3a;
}

.close-btn {
  background: none;
  border: none;
  font-size: 28px;
  cursor: pointer;
  color: #adb5bd;
  line-height: 1;
}

.close-btn:hover {
  color: #495057;
}

.modal-body {
  padding: 24px;
}

/* 作业信息 */
.submission-info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.info-item {
  font-size: 14px;
}

.info-label {
  color: #6c757d;
  margin-right: 8px;
}

.info-value {
  color: #1a2a3a;
  font-weight: 500;
}

/* 子标题 */
.subsection-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a2a3a;
  margin-bottom: 12px;
}

/* 文件列表 */
.submission-files {
  margin-bottom: 24px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.file-icon {
  font-size: 20px;
}

.file-name {
  flex: 1;
  font-size: 14px;
  color: #333;
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

/* 作业内容 */
.submission-content {
  margin-bottom: 24px;
}

.content-box {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: #555;
  white-space: pre-wrap;
}

/* 评分区域 */
.scoring-section {
  margin-bottom: 24px;
}

.score-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.score-label {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
}

.score-input {
  width: 80px;
  padding: 10px 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 16px;
  text-align: center;
}

.score-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.score-total {
  font-size: 14px;
  color: #6c757d;
}

/* 评语区域 */
.comment-section {
  margin-bottom: 16px;
}

.comment-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.comment-textarea:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

/* AI辅助评阅 */
.ai-assist-section {
  margin-bottom: 24px;
}

.ai-assist-content {
  margin-top: 12px;
}

.ai-assist-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.ai-btn {
  padding: 8px 16px;
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
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-top: 12px;
}

.ai-analysis-result h5 {
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

/* 快捷评语 */
.quick-comments {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
  align-items: center;
}

.quick-comment-label {
  font-size: 13px;
  color: #6c757d;
}

.quick-comment-btn {
  padding: 6px 12px;
  background: #e9ecef;
  border: none;
  border-radius: 16px;
  font-size: 12px;
  color: #495057;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-comment-btn:hover {
  background: #dee2e6;
}

/* 操作按钮 */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-secondary {
  padding: 10px 20px;
  background: white;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  border-color: #4a90e2;
  color: #4a90e2;
}

.btn-primary {
  padding: 10px 20px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-primary:hover {
  background: #357abd;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

  .class-switch-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .class-tabs {
    flex-wrap: wrap;
    width: 100%;
  }

  .class-tab {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-section {
    flex-wrap: wrap;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .filter-select {
    width: 100%;
  }

  .search-box {
    width: 100%;
  }

  .submission-stats {
    flex-direction: column;
    gap: 12px;
  }

  .stat-item {
    width: 100%;
    justify-content: space-between;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .submission-info {
    grid-template-columns: 1fr;
  }

  .modal-content {
    width: 95%;
    max-height: 95vh;
  }
}
</style>
