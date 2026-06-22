<template>
  <div class="page-layout">
    <!-- 侧边栏 -->
    <AdminSidebar />

    <!-- 主内容区 -->
    <div class="content-area">
      <!-- 栏头 -->
      <AdminHeader />

      <!-- 面包屑导航 -->
      <Breadcrumb />

      <main class="main-content">
        <div class="homework-manage-container">
          <!-- 页面标题 -->
          <div class="page-header">
            <h1 class="page-title">作业管理</h1>
            <div class="header-actions">
              <button class="btn btn-primary" @click="openAddHomeworkModal">
                <span class="btn-icon">➕</span>
                <span>发布作业</span>
              </button>
            </div>
          </div>

          <!-- 搜索和筛选 -->
          <div class="search-filter-section">
            <div class="search-box">
              <input type="text" v-model="searchKeyword" placeholder="搜索作业名称..." class="search-input" />
              <span class="search-icon">🔍</span>
            </div>
            <div class="filter-section">
              <select v-model="selectedStatus" class="filter-select">
                <option value="all">全部状态</option>
                <option value="active">进行中</option>
                <option value="ended">已结束</option>
                <option value="upcoming">未开始</option>
              </select>
            </div>
          </div>

          <!-- 作业列表 -->
          <div class="homework-list-card">
            <div class="table-header">
              <h3 class="section-title">作业列表</h3>
              <div class="table-actions">
                <button class="btn btn-secondary" @click="openImportModal">
                  <span class="btn-icon">📥</span>
                  <span>批量导入</span>
                </button>
                <button class="btn btn-secondary" @click="exportHomework">
                  <span class="btn-icon">📤</span>
                  <span>导出</span>
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="homework-table">
                <thead>
                  <tr>
                    <th>作业ID</th>
                    <th>作业名称</th>
                    <th>发布时间</th>
                    <th>截止时间</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="homework in filteredHomeworkList" :key="homework.assignmentId">
                    <td>{{ homework.assignmentId }}</td>
                    <td class="homework-name">{{ homework.title }}</td>
                    <td>{{ formatDateTime(homework.startTime) }}</td>
                    <td>{{ formatDateTime(homework.endTime) }}</td>
                    <td>
                      <span class="status-badge" :class="getHomeworkStatus(homework.startTime, homework.endTime)">
                        {{ getStatusText(getHomeworkStatus(homework.startTime, homework.endTime)) }}
                      </span>
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button class="action-btn delete-btn" @click="deleteHomework(homework.assignmentId)">
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 空状态 -->
            <div v-if="filteredHomeworkList.length === 0" class="empty-state">
              <div class="empty-icon">📭</div>
              <p>暂无作业数据</p>
            </div>
          </div>

          <!-- 添加作业弹窗 -->
          <div v-if="showHomeworkModal" class="modal-overlay" @click.self="closeHomeworkModal">
            <div class="modal-content homework-modal">
              <div class="modal-header">
                <h3>发布作业</h3>
                <button class="close-btn" @click="closeHomeworkModal">×</button>
              </div>
              <div class="modal-body">
                <form class="homework-form">
                  <div class="form-group">
                    <label class="form-label">作业名称 <span class="required">*</span></label>
                    <input type="text" v-model="formData.title" class="form-input" placeholder="请输入作业名称" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">发布时间 <span class="required">*</span></label>
                    <input type="datetime-local" v-model="formData.startTime" class="form-input" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">截止时间 <span class="required">*</span></label>
                    <input type="datetime-local" v-model="formData.endTime" class="form-input" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">学年 <span class="required">*</span></label>
                    <input type="number" v-model="formData.academicYear" class="form-input" placeholder="请输入学年，如 2026" />
                  </div>
                  <div class="form-group">
                    <label class="form-label">作业内容 <span class="required">*</span></label>
                    <textarea v-model="formData.content" class="form-textarea" rows="4" placeholder="请输入作业内容"></textarea>
                  </div>
                  <div class="form-group">
                    <label class="form-label">作业附件</label>
                    <!-- 已上传的附件列表 -->
                    <div v-if="formData.attachments && formData.attachments.length > 0" class="uploaded-files">
                      <div v-for="(file, index) in formData.attachments" :key="index" class="uploaded-file">
                        <span>{{ file.fileName }}</span>
                        <button class="remove-file-btn" @click="removeAttachment(index)">×</button>
                      </div>
                    </div>
                    <div class="file-upload">
                      <input type="file" ref="fileInput" accept=".pdf,.doc,.docx" multiple class="file-input" @change="onFileSelect" />
                      <span class="file-text">{{ selectedFilesCount > 0 ? `已选择 ${selectedFilesCount} 个文件` : '请选择PDF/DOC/DOCX文件（支持多选）' }}</span>
                    </div>
                  </div>
                </form>
                <div class="modal-actions">
                  <button class="btn-secondary" @click="closeHomeworkModal">取消</button>
                  <button class="btn-primary" @click="submitHomework">发布作业</button>
                </div>
              </div>
            </div>
          </div>

          <!-- 批量导入学生作业弹窗 -->
          <div v-if="showImportModal" class="modal-overlay" @click.self="closeImportModal">
            <div class="modal-content homework-modal">
              <div class="modal-header">
                <h3>批量导入学生作业</h3>
                <button class="close-btn" @click="closeImportModal">×</button>
              </div>
              <div class="modal-body">
                <div class="import-form">
                  <div class="form-group">
                    <label class="form-label">选择作业 <span class="required">*</span></label>
                    <select v-model="importData.assignmentId" class="form-input">
                      <option value="">请选择作业</option>
                      <option v-for="homework in homeworkData" :key="homework.assignmentId" :value="homework.assignmentId">
                        {{ homework.title }} (ID: {{ homework.assignmentId }})
                      </option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label">上传 ZIP 文件 <span class="required">*</span></label>
                    <div class="file-upload">
                      <input type="file" ref="importFileInput" accept=".zip" class="file-input" @change="onImportFileSelect" />
                      <span class="file-text">{{ importFileName ? importFileName : '请选择 ZIP 压缩包' }}</span>
                    </div>
                    <p class="form-hint">
                      <strong>导入规则：</strong><br>
                      - ZIP 仅支持顶层文件<br>
                      - 文件名必须以完整学号命名，例如：2023091201002.pdf<br>
                      - 支持格式：pdf、doc、docx<br>
                      - 已提交的学生作业不会被覆盖
                    </p>
                  </div>
                </div>
                <div class="modal-actions">
                  <button class="btn-secondary" @click="closeImportModal">取消</button>
                  <button class="btn-primary" @click="submitImport" :disabled="importLoading">
                    <span v-if="importLoading">导入中...</span>
                    <span v-else>开始导入</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import AdminSidebar from '@/components/Admin/AdminSidebar.vue'
import AdminHeader from '@/components/Admin/AdminHeader.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { adminAPI } from '@/services/api.js'

// 状态管理
const searchKeyword = ref('')
const selectedStatus = ref('all')
const showHomeworkModal = ref(false)

// 文件输入引用
const fileInput = ref(null)
const selectedFilesCount = ref(0)

// 批量导入相关
const showImportModal = ref(false)
const importFileInput = ref(null)
const importFileName = ref('')
const importData = ref({
  assignmentId: ''
})
const importLoading = ref(false)

// 文件选择处理
const onFileSelect = () => {
  if (fileInput.value && fileInput.value.files) {
    selectedFilesCount.value = fileInput.value.files.length
  }
}

// 表单数据
const formData = ref({
  id: null,
  title: '',
  startTime: '',
  endTime: '',
  content: '',
  academicYear: '',
  attachments: []
})

// 作业数据
const homeworkData = ref([])

// 过滤后的作业列表
const filteredHomeworkList = computed(() => {
  let filtered = homeworkData.value || []

  // 确保是数组
  if (!Array.isArray(filtered)) {
    filtered = []
  }

  // 按关键词搜索
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    filtered = filtered.filter(item => item.title && item.title.toLowerCase().includes(keyword))
  }

  // 按状态筛选
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(item => getHomeworkStatus(item.startTime, item.endTime) === selectedStatus.value)
  }

  return filtered
})

// 格式化日期时间
const formatDateTime = (dateTime) => {
  if (!dateTime) return '-'
  const date = new Date(dateTime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    active: '进行中',
    ended: '已结束',
    upcoming: '未开始'
  }
  return statusMap[status] || status
}

// 打开添加作业弹窗
const openAddHomeworkModal = () => {
  const currentYear = new Date().getFullYear()
  formData.value = {
    id: null,
    title: '',
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    content: '',
    academicYear: currentYear.toString(),
    attachments: []
  }
  // 重置文件输入
  if (fileInput.value) {
    fileInput.value.value = ''
  }
  showHomeworkModal.value = true
}

// 移除附件
const removeAttachment = (index) => {
  formData.value.attachments.splice(index, 1)
}

// 关闭作业弹窗
const closeHomeworkModal = () => {
  showHomeworkModal.value = false
}

// 提交作业
const submitHomework = async () => {
  // 根据后端API验证必填字段
  if (!formData.value.title || !formData.value.content || !formData.value.startTime || !formData.value.endTime || !formData.value.academicYear) {
    alert('请填写必填字段（作业名称、作业内容、学年、发布时间、截止时间）')
    return
  }

  // 验证发布时间不能晚于截止时间
  const startDate = parseDateTime(formData.value.startTime)
  const endDate = parseDateTime(formData.value.endTime)

  if (!startDate || !endDate) {
    alert('日期时间格式错误')
    return
  }

  if (startDate > endDate) {
    alert('发布时间不能晚于截止时间')
    return
  }

  // 转换为ISO格式
  const formatDateTime = (dateTimeString) => {
    if (dateTimeString && dateTimeString.length === 16) {
      return dateTimeString + ':00'
    }
    return dateTimeString
  }

  const formattedStartTime = formatDateTime(formData.value.startTime)
  const formattedEndTime = formatDateTime(formData.value.endTime)

  try {
    // 使用FormData格式提交
    const formDataToSubmit = new FormData()
    formDataToSubmit.append('title', formData.value.title)
    formDataToSubmit.append('content', formData.value.content)
    formDataToSubmit.append('startTime', formattedStartTime)
    formDataToSubmit.append('endTime', formattedEndTime)
    formDataToSubmit.append('academicYear', formData.value.academicYear)

    // 添加附件（支持多文件）
    if (fileInput.value && fileInput.value.files.length > 0) {
      for (let i = 0; i < fileInput.value.files.length; i++) {
        formDataToSubmit.append('attachments', fileInput.value.files[i])
      }
    }

    const response = await adminAPI.publishAssignment(formDataToSubmit)

    if (response.code === 200) {
      alert('作业发布成功')
      closeHomeworkModal()
      loadHomeworkList()
    } else {
      alert('作业发布失败：' + (response.message || '未知错误'))
    }
  } catch (error) {
    alert('作业发布失败，请稍后重试')
    console.error('发布作业失败:', error)
  }
}

// 解析日期时间字符串为本地时间
const parseDateTime = (dateTimeString) => {
  if (!dateTimeString || typeof dateTimeString !== 'string') return null

  // 将 ISO 格式字符串转换为本地时间
  // 格式: 2025-04-10T23:59:59
  const parts = dateTimeString.split('T')
  if (!parts || parts.length !== 2) return new Date(dateTimeString)

  const datePart = parts[0]
  const timePart = parts[1]

  const [year, month, day] = datePart.split('-').map(Number)
  const [hours, minutes, seconds] = timePart.split(':').map(Number)

  // 使用本地时间创建日期对象
  return new Date(year, month - 1, day, hours, minutes, seconds)
}

// 获取作业状态
const getHomeworkStatus = (publishTime, deadline) => {
  const now = new Date()
  const publishDate = parseDateTime(publishTime)
  const deadlineDate = parseDateTime(deadline)

  if (!publishDate || !deadlineDate) return 'active'

  if (now < publishDate) {
    return 'upcoming'
  } else if (now > deadlineDate) {
    return 'ended'
  } else {
    return 'active'
  }
}

// 加载作业列表
const loadHomeworkList = async () => {
  try {
    const response = await adminAPI.getAssignmentList()
    if (response.code === 200 && response.data) {
      homeworkData.value = response.data
    }
  } catch (error) {
    console.error('加载作业列表失败:', error)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  loadHomeworkList()
})

// 删除作业
const deleteHomework = async (homeworkId) => {
  if (confirm('确定要删除此作业吗？此操作将同时删除相关的作业附件、学生提交和教师批改记录。')) {
    try {
      const response = await adminAPI.deleteAssignment(homeworkId)
      if (response.code === 200) {
        const index = homeworkData.value.findIndex(item => item.assignmentId === homeworkId)
        if (index !== -1) {
          homeworkData.value.splice(index, 1)
        }
        alert('作业删除成功！')
      } else {
        alert('作业删除失败：' + (response.message || '未知错误'))
      }
    } catch (error) {
      alert('作业删除失败，请稍后重试')
      console.error('删除作业失败:', error)
    }
  }
}

// 导出作业
const exportHomework = () => {
  alert('作业导出功能已触发')
  // 这里可以实现导出逻辑
}

// 打开批量导入弹窗
const openImportModal = () => {
  importData.value = {
    assignmentId: ''
  }
  importFileName.value = ''
  if (importFileInput.value) {
    importFileInput.value.value = ''
  }
  showImportModal.value = true
}

// 关闭批量导入弹窗
const closeImportModal = () => {
  showImportModal.value = false
  importLoading.value = false
}

// 选择导入文件
const onImportFileSelect = () => {
  if (importFileInput.value && importFileInput.value.files && importFileInput.value.files.length > 0) {
    importFileName.value = importFileInput.value.files[0].name
  } else {
    importFileName.value = ''
  }
}

// 提交批量导入
const submitImport = async () => {
  // 验证
  if (!importData.value.assignmentId) {
    alert('请选择作业')
    return
  }
  if (!importFileInput.value || !importFileInput.value.files || importFileInput.value.files.length === 0) {
    alert('请选择 ZIP 文件')
    return
  }

  importLoading.value = true

  try {
    const response = await adminAPI.importAssignmentSubmissions(
      importData.value.assignmentId,
      importFileInput.value.files[0]
    )

    if (response.code === 200) {
      const result = response.data
      const message = `批量导入完成！\n\n总文件数：${result.totalFiles}\n成功：${result.successCount}\n跳过：${result.skippedCount}\n失败：${result.failedCount}`
      alert(message)
      closeImportModal()
    } else {
      alert('批量导入失败：' + (response.message || '未知错误'))
    }
  } catch (error) {
    alert('批量导入失败，请稍后重试')
    console.error('批量导入失败:', error)
  } finally {
    importLoading.value = false
  }
}
</script>

<style scoped>
/* 页面布局 */
.page-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-page);
}

/* 主内容区 */
.content-area {
  flex: 1;
  margin-left: 200px;
  display: flex;
  flex-direction: column;
}

/* 主内容 */
.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: #f5f7fa;
}

.homework-manage-container {
  max-width: 100%;
  margin: 0;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 26px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* 搜索和筛选 */
.search-filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.search-box {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.search-input {
  padding: 10px 40px 10px 16px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  width: 100%;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.search-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #adb5bd;
}

.filter-section {
  display: flex;
  gap: 12px;
}

.filter-select {
  padding: 10px 16px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  background: #fff;
  cursor: pointer;
  min-width: 120px;
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
  gap: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0;
}

.table-actions {
  display: flex;
  gap: 8px;
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

.homework-name {
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

.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.ended {
  background: #f5f5f5;
  color: #6c757d;
}

.status-badge.upcoming {
  background: #e3f2fd;
  color: #1976d2;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.edit-btn {
  background: #4a90e2;
  color: white;
}

.edit-btn:hover {
  background: #357abd;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
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
  max-width: 600px;
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

/* 表单样式 */
.homework-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.import-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-hint {
  font-size: 13px;
  color: #6c757d;
  margin-top: 8px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 6px;
  line-height: 1.6;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
}

.form-input,
.form-select,
.form-textarea {
  padding: 10px 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* 文件上传 */
.file-upload {
  position: relative;
  border: 1px dashed #dee2e6;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.file-upload:hover {
  border-color: #4a90e2;
  background: #f8f9fa;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.file-text {
  font-size: 14px;
  color: #6c757d;
}

/* 已上传文件列表 */
.uploaded-files {
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.uploaded-file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  font-size: 14px;
  color: #495057;
}

.remove-file-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #dc3545;
  line-height: 1;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-file-btn:hover {
  color: #c82333;
}

/* 操作按钮 */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #4a90e2;
  color: white;
}

.btn-primary:hover {
  background: #357abd;
  transform: translateY(-1px);
}

.btn-secondary {
  background: white;
  color: #6c757d;
  border: 1px solid #dee2e6;
}

.btn-secondary:hover {
  border-color: #4a90e2;
  color: #4a90e2;
}

.btn-icon {
  font-size: 16px;
}

/* 响应式 */
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
  }

  .search-filter-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-box {
    width: 100%;
    max-width: none;
  }

  .filter-section {
    width: 100%;
  }

  .filter-select {
    flex: 1;
  }

  .table-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-buttons {
    flex-direction: column;
  }

  .modal-content {
    width: 95%;
    max-height: 95vh;
  }
}
</style>
