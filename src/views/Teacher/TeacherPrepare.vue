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
              <div v-for="(courseware, index) in coursewareList" :key="courseware.id" class="courseware-card">
                <div class="courseware-icon" @click="previewCourseware(courseware.id)">📄</div>
                <div class="courseware-info">
                  <h3 class="courseware-title">{{ courseware.title }}</h3>
                  <div class="courseware-meta">
                    <span class="meta-item">{{ courseware.type }}</span>
                    <span class="meta-item">{{ courseware.size }}</span>
                    <span class="meta-item">{{ courseware.words }}</span>
                  </div>
                </div>
                <div class="courseware-actions">
                  <button class="action-btn preview-btn" @click="previewCourseware(courseware.id)">预览</button>
                  <button class="action-btn download-btn" @click="downloadCourseware(courseware.id)">下载</button>
                  <button class="action-btn delete-btn" @click="deleteCoursewareItem(courseware.id)">删除</button>
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
import { ref, onMounted } from 'vue'
import TeacherSidebar from '@/components/Teacher/TeacherSidebar.vue'
import TeacherHeader from '@/components/Teacher/TeacherHeader.vue'
import { teacherAPI } from '@/services/api.js'

// 文件输入引用
const fileInput = ref(null)

// 上传状态
const uploading = ref(false)

// 课件列表
const coursewareList = ref([])



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
    console.log('课件列表响应:', response)
    if (response.code === 200) {
      coursewareList.value = response.data.map(item => ({
        title: item.title,
        type: 'PDF',
        size: formatFileSize(item.size || 0),
        words: '约0.2万字',
        id: item.coursewareId
      }))
    } else {
      console.log('加载课件列表失败，响应码:', response.code)
    }
  } catch (error) {
    console.error('加载课件列表失败:', error)
  }
}

// 预览课件
const previewCourseware = async (coursewareId) => {
  try {
    await teacherAPI.viewMyCourseware(coursewareId)
  } catch (error) {
    console.error('预览课件失败:', error)
    alert('预览课件失败，请稍后重试')
  }
}

// 下载课件
const downloadCourseware = async (coursewareId) => {
  try {
    await teacherAPI.downloadMyCourseware(coursewareId)
  } catch (error) {
    console.error('下载课件失败:', error)
    alert('下载课件失败，请稍后重试')
  }
}

// 删除课件
const deleteCoursewareItem = async (coursewareId) => {
  if (!confirm('确定要删除这个课件吗？')) {
    return
  }
  try {
    const response = await teacherAPI.deleteCourseware(coursewareId)
    if (response.code === 200) {
      alert('删除成功')
      // 重新加载课件列表
      await loadCoursewareList()
    } else {
      alert('删除失败: ' + (response.message || '未知错误'))
    }
  } catch (error) {
    console.error('删除课件失败:', error)
    alert('删除课件失败，请稍后重试')
  }
}

// 页面挂载时加载课件列表
onMounted(() => {
  loadCoursewareList()
})

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
      // 直接将上传的文件添加到课件列表
      const newCourseware = {
        title: response.data.title || fileName,
        type: 'PDF',
        size: formatFileSize(file.size),
        words: '约0.2万字',
        id: response.data.coursewareId || Date.now()
      }
      coursewareList.value.unshift(newCourseware)
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
  padding: 70px 24px 24px 12px;
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

.courseware-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.3s;
}

.preview-btn {
  background: #4a90e2;
  color: white;
}

.preview-btn:hover {
  background: #357abd;
}

.download-btn {
  background: #6c757d;
  color: white;
}

.download-btn:hover {
  background: #5a6268;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
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
}
</style>
