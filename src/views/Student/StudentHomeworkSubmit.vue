<template>
  <div class="page-layout">
    <!-- 栏头 -->
    <StudentHeader />

    <div class="content-container">
      <!-- 侧边栏 -->
      <StudentSidebar />

      <!-- 主内容区 -->
      <div class="content-area">
        <!-- 面包屑导航 -->
        <Breadcrumb />

        <main class="main-content">
          <div class="submit-homework-container">
            <h1 class="page-title">作业详情</h1>

            <!-- 作业信息卡片 -->
            <div v-if="homeworkDetail" class="homework-info-card">
              <div class="homework-header">
                <h2 class="homework-title">{{ homeworkDetail.title }}</h2>
                <span class="homework-status-badge" :class="getHomeworkStatusClass()">
                  {{ getHomeworkStatusText() }}
                </span>
              </div>
              <div class="homework-meta">
                <span class="meta-item">
                  <span class="meta-label">发布时间：</span>
                  <span class="meta-value">{{ formatDateTime(homeworkDetail.startTime) }}</span>
                </span>
                <span class="meta-item">
                  <span class="meta-label">截止时间：</span>
                  <span class="meta-value">{{ formatDateTime(homeworkDetail.endTime) }}</span>
                </span>
                <span class="meta-item">
                  <span class="meta-label">发布人：</span>
                  <span class="meta-value">{{ homeworkDetail.creatorUsername }}</span>
                </span>
              </div>
              <div class="homework-content">
                <h3>作业内容</h3>
                <p>{{ homeworkDetail.content }}</p>
              </div>
              <div v-if="homeworkDetail.attachments && homeworkDetail.attachments.length > 0" class="homework-attachments">
                <h3>作业附件</h3>
                <div class="attachment-list">
                  <div v-for="attachment in homeworkDetail.attachments" :key="attachment.fileId" class="attachment-item">
                    <span class="attachment-icon">📄</span>
                    <span class="attachment-name">{{ attachment.fileName }}</span>
                    <span class="attachment-size">{{ formatFileSize(attachment.sizeBytes) }}</span>
                    <div class="attachment-actions">
                      <button class="btn btn-secondary" @click="viewAttachment(attachment.fileId)">预览</button>
                      <button class="btn btn-primary" @click="downloadAttachment(attachment.fileId)">下载</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 作业状态信息 -->
            <div v-if="homeworkStatus" class="status-info-card">
              <h3>我的作业状态</h3>
              <div class="status-details">
                <div class="status-item">
                  <span class="status-label">提交状态：</span>
                  <span class="status-value" :class="homeworkStatus.submitted ? 'submitted' : 'not-submitted'">
                    {{ homeworkStatus.submitted ? '已提交' : '未提交' }}
                  </span>
                </div>
                <div class="status-item" v-if="homeworkStatus.submitted">
                  <span class="status-label">批改状态：</span>
                  <span class="status-value" :class="getGradingStatusClass()">
                    {{ getGradingStatusText() }}
                  </span>
                </div>
                <div class="status-item" v-if="homeworkStatus.published && homeworkStatus.finalScore !== null">
                  <span class="status-label">最终成绩：</span>
                  <span class="status-value score" :class="getScoreClass(homeworkStatus.finalScore)">
                    {{ homeworkStatus.finalScore }}分 ({{ homeworkStatus.finalGrade }})
                  </span>
                </div>
              </div>

              <!-- 已提交作业预览和下载 -->
              <div v-if="homeworkStatus.submitted" class="submission-actions">
                <h4>我提交的作业</h4>
                <div class="submission-buttons">
                  <button class="btn btn-secondary" @click="viewMySubmission">
                    <span class="btn-icon">👁️</span>
                    预览
                  </button>
                  <button class="btn btn-primary" @click="downloadMySubmission">
                    <span class="btn-icon">📥</span>
                    下载
                  </button>
                </div>
              </div>

              <div v-if="homeworkStatus.published && homeworkStatus.finalScore !== null" class="report-actions">
                <h4>成绩报告</h4>
                <div class="report-buttons">
                  <button class="btn btn-secondary" @click="viewReport('student-report')">查看成绩报告</button>
                  <button class="btn btn-secondary" @click="viewReport('reference-answer')">查看参考答案</button>
                  <button class="btn btn-primary" @click="downloadReport('student-report')">下载成绩报告</button>
                </div>
              </div>
            </div>

            <!-- 提交作业区域 -->
            <div v-if="!homeworkStatus?.submitted && !isExpired" class="submit-section">
              <h3>提交作业</h3>
              <div class="upload-section">
                <div
                  class="upload-area"
                  @dragover.prevent @drop.prevent="handleDrop"
                  @click="triggerFileInput"
                >
                  <div class="upload-icon">📁</div>
                  <div class="upload-text">点击或拖拽文件到此区域上传</div>
                  <div class="upload-hint">支持 PDF/Word/图片等文件，不超过10MB</div>
                  <input
                    type="file"
                    ref="fileInput"
                    @change="handleFileSelect"
                    multiple
                    class="file-input"
                  />
                </div>
                <div v-if="uploadedFiles.length > 0" class="file-list">
                  <h4>已选择文件</h4>
                  <div v-for="(file, index) in uploadedFiles" :key="index" class="file-info">
                    <span class="file-name">{{ file.name }}</span>
                    <span class="file-size">{{ formatFileSize(file.size) }}</span>
                    <button class="remove-file-btn" @click="removeFile(index)">删除</button>
                  </div>
                </div>
                <div class="text-section">
                  <label class="text-label">作业说明（可选）</label>
                  <textarea
                    v-model="submissionText"
                    class="text-input"
                    placeholder="请输入作业说明或备注..."
                    rows="4"
                  ></textarea>
                </div>
                <div v-if="uploadProgress > 0" class="progress-bar">
                  <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
                </div>
                <div class="submit-actions">
                  <button class="btn btn-primary" @click="submitHomework" :disabled="uploading || uploadedFiles.length === 0">
                    {{ uploading ? '提交中...' : '提交作业' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- 已提交提示 -->
            <div v-else-if="homeworkStatus?.submitted" class="submitted-info">
              <div class="submitted-icon">✅</div>
              <h3>作业已提交</h3>
              <p>您的作业已成功提交，请等待教师批改。</p>
            </div>

            <!-- 已截止提示 -->
            <div v-else-if="isExpired" class="expired-info">
              <div class="expired-icon">⏰</div>
              <h3>作业已截止</h3>
              <p>作业提交时间已截止，无法再提交作业。</p>
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
import StudentSidebar from '@/components/Student/StudentSidebar.vue'
import StudentHeader from '@/components/Student/StudentHeader.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { studentAPI } from '@/services/api.js'

const route = useRoute()
const fileInput = ref(null)
const uploadedFiles = ref([])
const submissionText = ref('')
const uploadProgress = ref(0)
const uploading = ref(false)
const homeworkDetail = ref(null)
const homeworkStatus = ref(null)
const loading = ref(false)

// 获取作业ID
const homeworkId = computed(() => {
  return route.query.id ? parseInt(route.query.id) : null
})

// 检查作业是否已过期
const isExpired = computed(() => {
  if (!homeworkDetail.value) return false
  const now = new Date()
  const endDate = new Date(homeworkDetail.value.endTime)
  return now > endDate
})

// 加载作业数据（详情和状态并行获取）
const loadHomeworkData = async () => {
  console.log('=== loadHomeworkData 开始 ===')
  console.log('=== homeworkId ===', homeworkId.value)
  
  if (!homeworkId.value) {
    console.error('=== homeworkId 为空 ===')
    return
  }

  loading.value = true
  try {
    console.log('=== 并行执行两个API请求 ===')
    // 并行执行两个API请求
    const [detailResponse, statusResponse] = await Promise.all([
      studentAPI.getAssignmentDetail(homeworkId.value),
      studentAPI.getAssignmentStatus(homeworkId.value)
    ])

    console.log('=== detailResponse ===', detailResponse)
    console.log('=== statusResponse ===', statusResponse)

    // 处理作业详情
    if (detailResponse.code === 200) {
      homeworkDetail.value = detailResponse.data
      console.log('=== 作业详情赋值成功 ===', homeworkDetail.value)
    } else {
      console.error('=== 作业详情请求失败 ===', detailResponse.message)
    }

    // 处理作业状态
    if (statusResponse.code === 200) {
      homeworkStatus.value = statusResponse.data
      console.log('=== 作业状态赋值成功 ===', homeworkStatus.value)
    } else {
      console.error('=== 作业状态请求失败 ===', statusResponse.message)
    }
  } catch (error) {
    console.error('加载作业数据失败:', error)
    console.error('错误堆栈:', error.stack)
    alert('加载作业数据失败，请稍后重试')
  } finally {
    loading.value = false
    console.log('=== loadHomeworkData 结束 ===')
  }
}

// 预览附件
const viewAttachment = async (fileId) => {
  console.log('=== viewAttachment 开始 ===', fileId)
  try {
    const blob = await studentAPI.viewAssignmentFile(fileId)
    console.log('=== 预览附件响应 ===', blob)
    
    if (blob) {
      // 创建临时URL并在新窗口打开预览
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
      console.log('=== 预览附件成功 ===')
    } else {
      console.error('=== 预览附件失败：返回数据为空 ===')
      alert('预览附件失败：返回数据为空')
    }
  } catch (error) {
    console.error('预览附件失败:', error)
    console.error('错误堆栈:', error.stack)
    alert('预览附件失败，请稍后重试')
  }
}

// 下载附件
const downloadAttachment = async (fileId) => {
  console.log('=== downloadAttachment 开始 ===', fileId)
  try {
    const blob = await studentAPI.downloadAssignmentFile(fileId)
    console.log('=== 下载附件响应 ===', blob)
    
    if (blob) {
      // 获取附件信息用于文件名
      const attachment = homeworkDetail.value?.attachments?.find(att => att.fileId === fileId)
      const fileName = attachment?.fileName || `attachment_${fileId}.pdf`
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      console.log('=== 下载附件成功 ===', fileName)
    } else {
      console.error('=== 下载附件失败：返回数据为空 ===')
      alert('下载附件失败：返回数据为空')
    }
  } catch (error) {
    console.error('下载附件失败:', error)
    console.error('错误堆栈:', error.stack)
    alert('下载附件失败，请稍后重试')
  }
}

// 查看报告
const viewReport = async (kind) => {
  if (!homeworkId.value) return
  try {
    await studentAPI.viewReportFile(homeworkId.value, kind)
  } catch (error) {
    console.error('查看报告失败:', error)
    alert('查看报告失败，请稍后重试')
  }
}

// 下载报告
const downloadReport = async (kind) => {
  if (!homeworkId.value) return
  try {
    await studentAPI.downloadReportFile(homeworkId.value, kind)
  } catch (error) {
    console.error('下载报告失败:', error)
    alert('下载报告失败，请稍后重试')
  }
}

// 预览自己提交的作业
const viewMySubmission = async () => {
  if (!homeworkId.value) return
  try {
    await studentAPI.viewMySubmission(homeworkId.value)
  } catch (error) {
    console.error('预览提交的作业失败:', error)
    alert('预览提交的作业失败，请稍后重试')
  }
}

// 下载自己提交的作业
const downloadMySubmission = async () => {
  if (!homeworkId.value) return
  try {
    await studentAPI.downloadMySubmission(homeworkId.value)
  } catch (error) {
    console.error('下载提交的作业失败:', error)
    alert('下载提交的作业失败，请稍后重试')
  }
}

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click()
}

// 处理文件选择
const handleFileSelect = (e) => {
  const files = Array.from(e.target.files)
  files.forEach(file => {
    if (validateFile(file)) {
      uploadedFiles.value.push(file)
    }
  })
  fileInput.value.value = ''
}

// 处理拖拽文件
const handleDrop = (e) => {
  const files = Array.from(e.dataTransfer.files)
  files.forEach(file => {
    if (validateFile(file)) {
      uploadedFiles.value.push(file)
    }
  })
}

// 验证文件
const validateFile = (file) => {
  const maxSize = 10 * 1024 * 1024 // 10MB

  if (file.size > maxSize) {
    alert('文件大小不能超过 10MB')
    return false
  }
  return true
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 删除文件
const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1)
}

// 提交作业
const submitHomework = async () => {
  if (uploadedFiles.value.length === 0) {
    alert('请至少选择一个文件')
    return
  }

  uploading.value = true
  uploadProgress.value = 0

  // 模拟上传进度
  const interval = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(interval)
    }
  }, 200)

  try {
    const response = await studentAPI.submitAssignment({
      assignmentId: homeworkId.value,
      text: submissionText.value,
      attachments: uploadedFiles.value
    })

    if (response.code === 200) {
      alert('作业提交成功')
      // 重新加载作业状态
      await loadHomeworkStatus()
      // 清空上传文件
      uploadedFiles.value = []
      submissionText.value = ''
    } else {
      alert(`提交失败: ${response.message}`)
    }
  } catch (error) {
    console.error('提交作业失败:', error)
    alert('提交作业失败，请稍后重试')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

// 格式化日期时间
const formatDateTime = (dateTimeString) => {
  const date = new Date(dateTimeString)
  if (isNaN(date.getTime())) {
    return dateTimeString
  }
  return date.toLocaleString('zh-CN')
}

// 获取作业状态文本
const getHomeworkStatusText = () => {
  if (!homeworkDetail.value) return ''
  if (isExpired.value) return '已截止'
  if (homeworkStatus.value?.submitted) return '已提交'
  return '进行中'
}

// 获取作业状态样式
const getHomeworkStatusClass = () => {
  if (!homeworkDetail.value) return ''
  if (isExpired.value) return 'expired'
  if (homeworkStatus.value?.submitted) return 'submitted'
  return 'ongoing'
}

// 获取批改状态文本
const getGradingStatusText = () => {
  if (!homeworkStatus.value) return ''
  if (homeworkStatus.value.published) return '已批改'
  if (homeworkStatus.value.completed) return '批改中'
  return '未被批改'
}

// 获取批改状态样式
const getGradingStatusClass = () => {
  if (!homeworkStatus.value) return ''
  if (homeworkStatus.value.published) return 'graded'
  if (homeworkStatus.value.completed) return 'grading'
  return 'waiting'
}

// 获取分数样式
const getScoreClass = (score) => {
  if (score >= 90) return 'score-excellent'
  if (score >= 80) return 'score-good'
  if (score >= 70) return 'score-medium'
  if (score >= 60) return 'score-pass'
  return 'score-fail'
}

// 页面加载时获取数据
onMounted(async () => {
  await loadHomeworkData()
})
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
  margin-top: 60px;
  width: calc(100% - 200px);
  min-height: calc(100vh - 60px);
}

/* 主内容区域 */
.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.submit-homework-container {
  max-width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a2a3a;
  margin-bottom: 24px;
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
  align-items: flex-start;
  margin-bottom: 16px;
}

.homework-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0;
  flex: 1;
}

.homework-status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.homework-status-badge.ongoing {
  background: #e8f5e9;
  color: #2e7d32;
}

.homework-status-badge.submitted {
  background: #e3f2fd;
  color: #1976d2;
}

.homework-status-badge.expired {
  background: #ffebee;
  color: #d32f2f;
}

.homework-meta {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  font-size: 14px;
}

.meta-item {
  display: flex;
  align-items: center;
}

.meta-label {
  color: #6c757d;
  margin-right: 4px;
}

.meta-value {
  color: #333;
  font-weight: 500;
}

.homework-content {
  margin-bottom: 20px;
}

.homework-content h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a2a3a;
  margin-bottom: 8px;
}

.homework-content p {
  font-size: 14px;
  line-height: 1.6;
  color: #555;
  margin: 0;
}

.homework-attachments {
  margin-top: 20px;
}

.homework-attachments h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a2a3a;
  margin-bottom: 12px;
}

.attachment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.attachment-icon {
  font-size: 20px;
}

.attachment-name {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.attachment-size {
  font-size: 12px;
  color: #6c757d;
}

.attachment-actions {
  display: flex;
  gap: 8px;
}

/* 状态信息卡片 */
.status-info-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.status-info-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a2a3a;
  margin-bottom: 16px;
}

.status-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.status-label {
  color: #6c757d;
  width: 100px;
  flex-shrink: 0;
}

.status-value {
  color: #333;
  font-weight: 500;
}

.status-value.submitted {
  color: #1976d2;
}

.status-value.not-submitted {
  color: #d32f2f;
}

.status-value.grading {
  color: #ff9800;
}

.status-value.graded {
  color: #4caf50;
}

.status-value.waiting {
  color: #6c757d;
}

.status-value.score {
  font-weight: 600;
  font-size: 16px;
}

.score-excellent { color: #4caf50; }
.score-good { color: #2196f3; }
.score-medium { color: #ff9800; }
.score-pass { color: #ffc107; }
.score-fail { color: #f44336; }

.report-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.report-actions h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1a2a3a;
  margin-bottom: 12px;
}

.report-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* 我提交的作业区域 */
.submission-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #d0d0d0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  padding: 16px;
  border-radius: 12px;
}

.submission-actions h4 {
  font-size: 15px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.submission-actions h4::before {
  content: '';
  width: 4px;
  height: 16px;
  background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 2px;
}

.submission-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.submission-buttons .btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;
  border: none;
  outline: none;
}

.submission-buttons .btn-secondary {
  background: #ffffff;
  color: #475569;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.submission-buttons .btn-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.submission-buttons .btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.submission-buttons .btn-primary:hover {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.submission-buttons .btn:active {
  transform: translateY(0);
}

/* 图标样式 */
.btn-icon {
  font-size: 15px;
}

/* 提交区域 */
.submit-section {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.submit-section h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1a2a3a;
  margin-bottom: 20px;
}

/* 上传区域 */
.upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafbfc;
  margin-bottom: 20px;
}

.upload-area:hover {
  border-color: #4a90e2;
  background: #f5f9ff;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.upload-text {
  font-size: 16px;
  color: #333;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 12px;
  color: #6c757d;
}

.file-input {
  display: none;
}

/* 文件列表 */
.file-list {
  margin-bottom: 20px;
}

.file-list h4 {
  font-size: 14px;
  font-weight: 600;
  color: #1a2a3a;
  margin-bottom: 12px;
}

.file-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  flex: 1;
}

.file-size {
  font-size: 12px;
  color: #6c757d;
  margin-right: 12px;
}

.remove-file-btn {
  background: none;
  border: none;
  color: #d32f2f;
  cursor: pointer;
  font-size: 12px;
}

.remove-file-btn:hover {
  text-decoration: underline;
}

/* 文本输入区域 */
.text-section {
  margin-bottom: 20px;
}

.text-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 8px;
}

.text-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
}

.text-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

/* 进度条 */
.progress-bar {
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 20px;
}

.progress-fill {
  height: 100%;
  background: #4a90e2;
  transition: width 0.3s ease;
}

/* 提交按钮 */
.submit-actions {
  display: flex;
  justify-content: flex-end;
}

/* 已提交提示 */
.submitted-info {
  background: #e8f5e9;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  margin-bottom: 24px;
}

.submitted-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.submitted-info h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2e7d32;
  margin-bottom: 8px;
}

.submitted-info p {
  font-size: 14px;
  color: #555;
  margin: 0;
}

/* 已截止提示 */
.expired-info {
  background: #ffebee;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  margin-bottom: 24px;
}

.expired-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.expired-info h3 {
  font-size: 20px;
  font-weight: 600;
  color: #d32f2f;
  margin-bottom: 8px;
}

.expired-info p {
  font-size: 14px;
  color: #555;
  margin: 0;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #4a90e2;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #357abd;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e9ecef;
  color: #333;
}

.btn-secondary:hover {
  background: #dee2e6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .content-area {
    margin-left: 0;
    width: 100%;
  }

  .main-content {
    padding: 16px;
  }

  .homework-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .homework-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .attachment-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .attachment-actions {
    align-self: flex-end;
  }

  .status-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .status-label {
    width: auto;
  }

  .report-buttons {
    flex-direction: column;
  }

  .submit-actions {
    justify-content: center;
  }
}
</style>
