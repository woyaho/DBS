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
                <button
                  class="publish-results-btn"
                  @click="publishResults"
                  :disabled="publishingResults || completedCount === 0"
                >
                  {{ publishingResults ? '公布中...' : '公布批改结果' }}
                </button>
                <button
                  class="export-grades-btn"
                  @click="exportGrades"
                >
                  📊 导出成绩
                </button>

                <!-- AI批改进度 -->
                <div v-if="isAutoReviewing" class="ai-review-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: autoReviewProgress + '%' }"></div>
                  </div>
                  <div class="progress-text">{{ aiProgressData.status === '' ? '正在初始化...' : `正在批改：${autoReviewProgress}%` }}</div>
                  <div class="progress-details">
                    <span class="detail-item">总数: {{ aiProgressData.totalCount }}</span>
                    <span class="detail-item">已完成: {{ aiProgressData.completedCount }}</span>
                    <span class="detail-item failed">失败: {{ aiProgressData.failedCount }}</span>
                    <span class="detail-item">状态: {{ aiProgressData.status === '' ? '初始化中' : getProgressStatusText(aiProgressData.status) }}</span>
                  </div>
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
                  <button class="action-btn unsubmitted-btn" @click="showUnsubmittedStudents">
                    👥 查看未提交学生 ({{ unsubmittedCount }})
                  </button>
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
                        <button
                          v-if="item.status === 'completed'"
                          class="action-btn ai-result-btn"
                          @click="viewAiResultDetail(item.id)"
                        >
                          查看AI结果
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
                        <div class="file-actions">
                          <button class="preview-btn" @click="previewFile(selectedSubmission.id)">预览</button>
                          <button class="download-btn" @click="downloadFile(selectedSubmission.id)">下载</button>
                        </div>
                      </div>
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

            <!-- 未提交学生弹窗 -->
            <div v-if="showUnsubmittedModal" class="modal-overlay" @click.self="closeUnsubmittedModal">
              <div class="modal-content unsubmitted-modal">
                <div class="modal-header">
                  <h3>未提交学生名单 - {{ homeworkInfo.title }}</h3>
                  <button class="close-btn" @click="closeUnsubmittedModal">×</button>
                </div>
                <div class="modal-body">
                  <div v-if="loadingUnsubmitted" class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>加载中...</p>
                  </div>
                  <div v-else-if="unsubmittedStudents.length === 0" class="empty-state">
                    <div class="empty-icon">✅</div>
                    <p>所有学生均已提交作业</p>
                  </div>
                  <div v-else>
                    <table class="unsubmitted-table">
                      <thead>
                        <tr>
                          <th>学号</th>
                          <th>姓名</th>
                          <th>邮箱</th>
                          <th>电话</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(student, index) in unsubmittedStudents" :key="index">
                          <td>{{ student.username }}</td>
                          <td>{{ student.name }}</td>
                          <td>{{ student.email || '-' }}</td>
                          <td>{{ student.phone || '-' }}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div class="modal-footer">
                      <p>共 {{ unsubmittedStudents.length }} 名学生未提交</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- AI结果详情弹窗 -->
            <div v-if="aiResultDetail" class="modal-overlay" @click.self="closeAiResultModal">
              <div class="modal-content ai-result-modal">
                <div class="modal-header">
                  <h3>AI批改结果详情 - {{ aiResultDetail?.studentName || '未知' }}</h3>
                  <button class="close-btn" @click="closeAiResultModal">×</button>
                </div>
                <div class="modal-body">
                  <div class="ai-result-info">
                    <div class="info-row">
                      <span class="info-label">学号：</span>
                      <span class="info-value">{{ aiResultDetail?.studentUsername || '-' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">姓名：</span>
                      <span class="info-value">{{ aiResultDetail?.studentName || '-' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">作业ID：</span>
                      <span class="info-value">{{ aiResultDetail?.assignmentId || '-' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">批次ID：</span>
                      <span class="info-value">{{ aiResultDetail?.jobId || '-' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">AI状态：</span>
                      <span class="info-value">{{ aiResultDetail?.aiStatus ? getAiStatusText(aiResultDetail.aiStatus) : '-' }}</span>
                    </div>
                    <div class="info-row score-section">
                      <span class="info-label">AI评分：</span>
                      <span class="info-value ai-score">{{ aiResultDetail?.aiScore || '-' }}</span>
                      <span class="ai-grade">{{ aiResultDetail?.aiGrade || '' }}</span>
                    </div>
                    <div class="info-row score-section">
                      <span class="info-label">最终得分：</span>
                      <span class="info-value final-score">{{ aiResultDetail?.finalScore || '-' }}</span>
                      <span class="final-grade">{{ aiResultDetail?.finalGrade || '' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">学生可见：</span>
                      <span class="info-value">{{ aiResultDetail?.studentVisible ? '是' : '否' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">处理时间：</span>
                      <span class="info-value">{{ aiResultDetail?.processedAt ? formatDateTime(aiResultDetail.processedAt) : '-' }}</span>
                    </div>
                    <div v-if="aiResultDetail?.errorMessage" class="info-row error-message">
                      <span class="info-label">错误信息：</span>
                      <span class="info-value">{{ aiResultDetail.errorMessage }}</span>
                    </div>
                  </div>
                  <div class="report-links">
                    <h4>报告下载</h4>
                    <div class="link-buttons">
                      <button class="report-link-btn" @click="downloadReport('teacher-report')">
                        📊 教师报告
                      </button>
                      <button class="report-link-btn" @click="downloadReport('student-report')">
                        📝 学生报告
                      </button>
                      <button class="report-link-btn" @click="downloadReport('reference-answer')">
                        📖 参考答案
                      </button>
                    </div>
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

<script>
export default {
  name: 'TeacherHomeworkReview'
}
</script>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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
const sortBy = ref('default')
const isAutoReviewing = ref(false)
const autoReviewProgress = ref(0)
const aiProgressData = ref({
  assignmentId: 0,
  batchId: '',
  status: '',
  totalCount: 0,
  completedCount: 0,
  failedCount: 0,
  startedAt: '',
  finishedAt: ''
})
const aiResultDetail = ref(null)
const loading = ref(false)
const loadingSubmissions = ref(false)
const publishingResults = ref(false)

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

// 未提交学生相关
const unsubmittedStudents = ref([])
const showUnsubmittedModal = ref(false)
const loadingUnsubmitted = ref(false)

// 未提交人数（通过计算得出，确保准确性）
const unsubmittedCount = computed(() => {
  const total = homeworkInfo.value.totalCount || 0
  const submitted = homeworkInfo.value.submittedCount || 0
  return Math.max(0, total - submitted)
})

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

// 获取AI批改进度状态文本
const getProgressStatusText = (status) => {
  const statusMap = {
    pending: '等待中',
    running: '运行中',
    completed: '已完成',
    partial_success: '部分完成',
    failed: '失败'
  }
  return statusMap[status] || status
}

// 获取AI结果状态文本
const getAiStatusText = (status) => {
  const statusMap = {
    COMPLETED: '已完成',
    FAILED: '失败',
    PENDING: '等待中',
    RUNNING: '运行中'
  }
  return statusMap[status] || status
}

// 查看AI结果详情
const viewAiResultDetail = async (submissionId) => {
  try {
    const response = await teacherAPI.getAiResultDetail(submissionId)
    if (response.code === 200) {
      aiResultDetail.value = {
        ...response.data,
        submissionId: submissionId
      }
    }
  } catch (error) {
    console.error('获取AI结果详情失败:', error)
    alert('获取AI结果详情失败，请稍后重试')
  }
}

// 关闭AI结果弹窗
const closeAiResultModal = () => {
  aiResultDetail.value = null
}

// 下载AI报告
const downloadReport = async (kind) => {
  if (!aiResultDetail.value || !aiResultDetail.value.submissionId) {
    alert('无法获取提交ID')
    return
  }
  try {
    await teacherAPI.downloadAiReport(aiResultDetail.value.submissionId, kind)
  } catch (error) {
    console.error('下载报告失败:', error)
    alert('下载报告失败，请稍后重试')
  }
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
    selectedHomework.value = homeworkId.toString()

    // 调用API获取作业详情
    const response = await teacherAPI.getAssignmentDetail(homeworkId)
    if (response.code === 200 && response.data) {
      homeworkInfo.value = {
        id: response.data.id || homeworkId,
        title: response.data.title || '未命名作业',
        description: response.data.description || response.data.content || '',
        publishTime: response.data.publishTime || response.data.startTime || '',
        deadline: response.data.deadline || response.data.endTime || '',
        totalCount: response.data.totalCount || response.data.totalStudents || 0,
        submittedCount: response.data.submittedCount || 0,
        reviewedCount: response.data.reviewedCount || 0
      }
    } else {
      // 使用默认值
      homeworkInfo.value = {
        id: homeworkId,
        title: `作业${homeworkId}`,
        description: '',
        publishTime: '',
        deadline: '',
        totalCount: 0,
        submittedCount: 0,
        reviewedCount: 0
      }
    }

    // 加载作业提交列表
    await loadSubmissions(homeworkId)
  } catch (error) {
    console.error('加载作业信息失败:', error)
    // 使用默认值继续
    const homeworkId = parseInt(route.params.id) || 1
    homeworkInfo.value = {
      id: homeworkId,
      title: `作业${homeworkId}`,
      description: '',
      publishTime: '',
      deadline: '',
      totalCount: 0,
      submittedCount: 0,
      reviewedCount: 0
    }
    await loadSubmissions(homeworkId)
  } finally {
    loading.value = false
  }
}

// 加载作业提交列表
const loadSubmissions = async (assignmentId) => {
  loadingSubmissions.value = true
  try {
    console.log('开始加载作业提交列表, assignmentId:', assignmentId)
    const response = await teacherAPI.getAssignmentSubmissions(assignmentId)
    console.log('作业提交列表API响应:', response)

    if (response.code === 200 && response.data) {
      homeworkData.value = response.data.map(item => ({
        id: item.submissionId || item.id || item.submission_id,
        studentId: item.studentUsername || item.studentId || item.student_id || '',
        studentName: item.studentName || item.student_name || '未知学生',
        homeworkName: homeworkInfo.value.title || '未命名作业',
        submitTime: item.submittedAt ? new Date(item.submittedAt).toLocaleString('zh-CN') :
                   item.submitTime || item.submitted_time || '未知时间',
        // 根据后端API文档，status字段是大写的COMPLETED/PENDING等，grade是字符串如"A-"
        status: item.status === 'COMPLETED' ? 'completed' : 'pending',
        score: item.grade || null,
        files: item.mergedPdfName ? [
          { name: item.mergedPdfName, url: `/api/teacher/download-submission?submissionId=${item.submissionId}` }
        ] : [],
        content: item.textContent || item.content || '无内容'
      }))

      // 更新作业信息中的提交数量
      if (homeworkData.value.length > 0) {
        homeworkInfo.value.submittedCount = homeworkData.value.length
        homeworkInfo.value.reviewedCount = homeworkData.value.filter(item => item.status === 'completed').length
      }

      console.log('作业数据加载成功, 共', homeworkData.value.length, '条记录')
    } else {
      homeworkData.value = []
      console.log('未获取到作业提交数据')
    }
  } catch (error) {
    console.error('加载作业提交列表失败:', error)
    homeworkData.value = []
    // 不弹出alert，避免影响用户体验
  } finally {
    loadingSubmissions.value = false
  }
}

// 加载作业状态统计
const loadAssignmentStatus = async (assignmentId) => {
  try {
    const response = await teacherAPI.getAssignmentStatus(assignmentId)
    console.log('作业状态统计响应:', response)

    if (response.code === 200 && response.data) {
      // 更新总学生数（优先使用API数据）
      if (response.data.totalStudents !== undefined) {
        homeworkInfo.value.totalCount = response.data.totalStudents
      }
      if (response.data.submittedCount !== undefined) {
        homeworkInfo.value.submittedCount = response.data.submittedCount
      }
      if (response.data.reviewedCount !== undefined) {
        homeworkInfo.value.reviewedCount = response.data.reviewedCount
      }
    }
  } catch (error) {
    console.error('加载作业状态统计失败:', error)
  }
}

// 查看未提交学生
const showUnsubmittedStudents = async () => {
  const homeworkId = parseInt(route.params.id) || 1
  loadingUnsubmitted.value = true

  try {
    const response = await teacherAPI.getUnsubmittedStudents(homeworkId)
    if (response.code === 200) {
      unsubmittedStudents.value = response.data || []
    } else {
      unsubmittedStudents.value = []
    }
  } catch (error) {
    console.error('获取未提交学生名单失败:', error)
    unsubmittedStudents.value = []
  } finally {
    loadingUnsubmitted.value = false
    showUnsubmittedModal.value = true
  }
}

// 关闭未提交学生弹窗
const closeUnsubmittedModal = () => {
  showUnsubmittedModal.value = false
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
const loadData = async (homeworkId) => {
  loading.value = true
  selectedHomework.value = homeworkId.toString()

  try {
    // 并行加载作业详情和状态统计
    const [homeworkResponse, statusResponse] = await Promise.all([
      teacherAPI.getAssignmentDetail(homeworkId),
      teacherAPI.getAssignmentStatus(homeworkId)
    ])

    // 处理作业详情
    if (homeworkResponse.code === 200 && homeworkResponse.data) {
      homeworkInfo.value = {
        id: homeworkResponse.data.id || homeworkId,
        title: homeworkResponse.data.title || '未命名作业',
        description: homeworkResponse.data.description || homeworkResponse.data.content || '',
        publishTime: homeworkResponse.data.publishTime || homeworkResponse.data.startTime || '',
        deadline: homeworkResponse.data.deadline || homeworkResponse.data.endTime || '',
        totalCount: homeworkResponse.data.totalCount || homeworkResponse.data.totalStudents || 0,
        submittedCount: homeworkResponse.data.submittedCount || 0,
        reviewedCount: homeworkResponse.data.reviewedCount || 0
      }
    } else {
      homeworkInfo.value = {
        id: homeworkId,
        title: `作业${homeworkId}`,
        description: '',
        publishTime: '',
        deadline: '',
        totalCount: 0,
        submittedCount: 0,
        reviewedCount: 0
      }
    }

    // 处理状态统计（优先使用API返回的数据更新统计）
    if (statusResponse.code === 200 && statusResponse.data) {
      if (statusResponse.data.totalStudents !== undefined) {
        homeworkInfo.value.totalCount = statusResponse.data.totalStudents
      }
      if (statusResponse.data.submittedCount !== undefined) {
        homeworkInfo.value.submittedCount = statusResponse.data.submittedCount
      }
      if (statusResponse.data.reviewedCount !== undefined) {
        homeworkInfo.value.reviewedCount = statusResponse.data.reviewedCount
      }
    }

    // 加载作业提交列表
    await loadSubmissions(homeworkId)
  } catch (error) {
    console.error('加载数据失败:', error)
    await loadSubmissions(homeworkId)
  } finally {
    loading.value = false
  }
}

// 页面挂载时加载数据
onMounted(async () => {
  const homeworkId = parseInt(route.params.id) || 1
  await loadData(homeworkId)
})

// 监听路由参数变化，重新加载数据
watch(() => route.params.id, async (newId) => {
  if (newId) {
    const homeworkId = parseInt(newId) || 1
    await loadData(homeworkId)
  }
})

// 过滤后的作业列表
const filteredHomeworkList = computed(() => {
  let filtered = homeworkData.value

  // 按作业筛选（当前页面只显示一个作业的数据，所以不需要按作业名称过滤）
  // 如果 selectedHomework 不是 'all'，说明是从作业列表页面跳转过来的，只显示当前作业的数据
  // 由于 loadSubmissions 只加载当前作业的数据，这里不需要额外过滤

  // 按状态筛选
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(item => item.status === selectedStatus.value)
  }

  // 按姓名搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    filtered = filtered.filter(item => item.studentName.toLowerCase().includes(keyword))
  }

  // 成绩等级排序映射（从高到低）
  const gradeOrder = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F']
  
  // 排序
  switch (sortBy.value) {
    case 'score-desc':
      filtered.sort((a, b) => {
        if (a.score === null && b.score === null) return 0
        if (a.score === null) return 1
        if (b.score === null) return -1
        const aIndex = gradeOrder.indexOf(a.score)
        const bIndex = gradeOrder.indexOf(b.score)
        if (aIndex === -1 && bIndex === -1) return 0
        if (aIndex === -1) return 1
        if (bIndex === -1) return -1
        return aIndex - bIndex
      })
      break
    case 'score-asc':
      filtered.sort((a, b) => {
        if (a.score === null && b.score === null) return 0
        if (a.score === null) return -1
        if (b.score === null) return 1
        const aIndex = gradeOrder.indexOf(a.score)
        const bIndex = gradeOrder.indexOf(b.score)
        if (aIndex === -1 && bIndex === -1) return 0
        if (aIndex === -1) return -1
        if (bIndex === -1) return 1
        return bIndex - aIndex
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
  const completed = homeworkData.value.filter(item => item.score !== null && !isNaN(item.score))
  if (completed.length === 0) return '—'
  const sum = completed.reduce((acc, item) => acc + item.score, 0)
  const avg = sum / completed.length
  return isNaN(avg) ? '—' : avg.toFixed(1)
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
}

// 预览文件
const previewFile = async (submissionId) => {
  try {
    const response = await teacherAPI.viewSubmissionPdf(submissionId)
    if (response && typeof response === 'object' && response.code !== undefined) {
      alert(response.message || '预览文件失败')
      return
    }
    const blob = new Blob([response], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  } catch (error) {
    console.error('预览文件失败:', error)
    alert('预览文件失败，请稍后重试')
  }
}

// 下载文件
const downloadFile = async (submissionId) => {
  try {
    const response = await teacherAPI.downloadSubmissionPdf(submissionId)
    if (response && typeof response === 'object' && response.code !== undefined) {
      alert(response.message || '下载文件失败')
      return
    }
    const blob = new Blob([response], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const fileName = selectedSubmission.value?.files?.[0]?.name || `作业提交_${submissionId}.pdf`
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('下载文件失败:', error)
    alert('下载文件失败，请稍后重试')
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

  // 立即显示进度条和初始化状态
  isAutoReviewing.value = true
  autoReviewProgress.value = 0

  // 初始化进度数据（状态为空表示正在初始化）
  aiProgressData.value = {
    assignmentId: 0,
    batchId: '',
    status: '',
    totalCount: pendingHomework.length,
    completedCount: 0,
    failedCount: 0,
    startedAt: '',
    finishedAt: ''
  }

  try {
    // 等待UI更新后再调用API
    await new Promise(resolve => setTimeout(resolve, 100))

    const homeworkId = parseInt(route.params.id) || 1
    const response = await teacherAPI.aiGradeAssignment(homeworkId, false)

    if (response.code === 200) {
      // 轮询批改进度
      const checkProgress = async () => {
        const progressResponse = await teacherAPI.getAiGradeProgress(homeworkId)
        if (progressResponse.code === 200) {
          const progressData = progressResponse.data

          // 保存完整的进度数据
          aiProgressData.value = {
            assignmentId: progressData.assignmentId || 0,
            batchId: progressData.batchId || '',
            status: progressData.status || '',
            totalCount: progressData.totalCount || 0,
            completedCount: progressData.completedCount || 0,
            failedCount: progressData.failedCount || 0,
            startedAt: progressData.startedAt || '',
            finishedAt: progressData.finishedAt || ''
          }

          // 计算进度百分比
          if (aiProgressData.value.totalCount > 0) {
            autoReviewProgress.value = Math.round((aiProgressData.value.completedCount / aiProgressData.value.totalCount) * 100)
          }

          if (progressData.status === 'completed' || progressData.status === 'partial_success') {
            // 加载最新的批改结果
            await loadSubmissions(homeworkId)
            const message = aiProgressData.value.failedCount > 0
              ? `AI自动批改完成！成功批改 ${aiProgressData.value.completedCount} 份，失败 ${aiProgressData.value.failedCount} 份`
              : `AI自动批改完成！共批改了 ${aiProgressData.value.completedCount} 份作业`
            alert(message)
            isAutoReviewing.value = false
            autoReviewProgress.value = 0
          } else {
            // 继续轮询
            setTimeout(checkProgress, 2000)
          }
        }
      }

      // 立即执行第一次进度查询，然后再开始定时轮询
      await checkProgress()
    }
  } catch (error) {
    console.error('AI批改失败:', error)
    alert('AI批改失败，请稍后重试')
    isAutoReviewing.value = false
    autoReviewProgress.value = 0
  }
}

// 公布批改结果
const publishResults = async () => {
  if (completedCount.value === 0) {
    alert('没有已批改的作业')
    return
  }

  publishingResults.value = true

  try {
    const homeworkId = parseInt(route.params.id) || 1
    const response = await teacherAPI.publishAiResults(homeworkId)

    if (response.code === 200) {
      alert('批改结果公布成功！')
    } else {
      alert('批改结果公布失败：' + (response.message || '未知错误'))
    }
  } catch (error) {
    console.error('公布批改结果失败:', error)
    alert('公布批改结果失败，请稍后重试')
  } finally {
    publishingResults.value = false
  }
}

// 导出成绩
const exportGrades = async () => {
  try {
    const homeworkId = parseInt(route.params.id) || 1
    console.log('开始导出成绩, homeworkId:', homeworkId)

    const blob = await teacherAPI.exportGrades(homeworkId)
    console.log('获取到的blob:', blob)

    // 创建下载链接
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    // 设置文件名
    const filename = `成绩导出_作业${homeworkId}_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.csv`
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    console.log('成绩导出成功！')
    alert('成绩导出成功！')
  } catch (error) {
    console.error('导出成绩失败:', error)
    alert('导出成绩失败，请稍后重试')
  }
}
</script>

<style scoped>
/* 页面布局 */
.page-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #F0F2F5;
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
  padding-top: 70px;
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 16px 24px 24px 12px;
  overflow-y: auto;
}

.homework-review-container {
  width: 100%;
  max-width: none;
  margin: 0;
  box-sizing: border-box;
}

/* 确保卡片能铺满宽度 */
.homework-info-card,
.stats-grid,
.homework-list-card {
  width: 100%;
  box-sizing: border-box;
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

/* 公布批改结果按钮 */
.publish-results-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
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

.publish-results-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.publish-results-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 导出成绩按钮 */
.export-grades-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
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

.export-grades-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
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

.progress-details {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.progress-details .detail-item {
  font-size: 12px;
  color: #495057;
  padding: 4px 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

.progress-details .detail-item.failed {
  color: #dc3545;
  background: #fff3f3;
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

/* 未提交学生按钮 */
.unsubmitted-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.unsubmitted-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
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

.action-btn.ai-result-btn {
  background: #6c757d;
  margin-left: 8px;
}

.action-btn.ai-result-btn:hover {
  background: #5a6268;
}

.ai-score-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}

.grade-badge {
  font-size: 11px;
  padding: 2px 6px;
  background: #e9ecef;
  border-radius: 4px;
  font-weight: 500;
}

/* AI结果详情弹窗 */
.ai-result-modal {
  max-width: 500px;
}

.ai-result-info {
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row.error-message {
  background: #fff5f5;
  margin: 0 -20px;
  padding: 10px 20px;
}

.info-label {
  width: 100px;
  font-weight: 500;
  color: #666;
  flex-shrink: 0;
}

.info-value {
  color: #333;
}

.info-value.ai-score,
.info-value.final-score {
  font-size: 24px;
  font-weight: bold;
  color: #4a90e2;
}

.info-value.final-score {
  color: #28a745;
}

.ai-grade,
.final-grade {
  font-size: 14px;
  padding: 4px 10px;
  background: #e9ecef;
  border-radius: 4px;
  margin-left: 10px;
}

.score-section {
  align-items: center;
}

.report-links {
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

.report-links h4 {
  margin-bottom: 12px;
  color: #495057;
}

.link-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.report-link-btn {
  display: inline-flex;
  align-items: center;
  padding: 10px 16px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  color: #495057;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s;
}

.report-link-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
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

/* 未提交学生弹窗 */
.unsubmitted-modal {
  max-width: 700px;
}

.unsubmitted-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.unsubmitted-table th,
.unsubmitted-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.unsubmitted-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #495057;
}

.unsubmitted-table tr:hover {
  background: #f8f9fa;
}

.modal-footer {
  padding: 16px;
  text-align: center;
  border-top: 1px solid #e9ecef;
  margin-top: 16px;
  color: #6c757d;
  font-size: 14px;
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

.preview-btn {
  padding: 6px 12px;
  background: #3B82F6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  margin-right: 8px;
}

.preview-btn:hover {
  background: #2563EB;
}

.file-actions {
  display: flex;
  gap: 8px;
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
