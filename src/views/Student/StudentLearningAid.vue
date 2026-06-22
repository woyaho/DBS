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
              <div v-if="resources.length > 0" class="resources-grid">
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
              <div v-else class="empty-resources">
                <div class="empty-icon">📚</div>
                <p class="empty-text">暂无课件资源</p>
                <p class="empty-hint">教师发布课件后将在此显示</p>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import StudentSidebar from '@/components/Student/StudentSidebar.vue'
import StudentHeader from '@/components/Student/StudentHeader.vue'
import { studentAPI } from '@/services/api.js'

// 资源数据（初始为空，将从API获取）
const resources = ref([])
const loadingResources = ref(false)



// 加载课件列表
const loadCoursewareList = async () => {
  loadingResources.value = true
  try {
    const response = await studentAPI.getCoursewareList()
    if (response.code === 200 && response.data) {
      resources.value = response.data.map(item => ({
        id: item.coursewareId,
        title: item.title || item.fileName || '未命名课件',
        type: item.contentType?.includes('pdf') ? 'PDF' : '其他',
        size: formatFileSize(item.sizeBytes),
        words: '0.2万'
      }))
    } else {
      resources.value = []
    }
  } catch (error) {
    console.error('加载课件列表失败:', error)
    resources.value = []
  } finally {
    loadingResources.value = false
  }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + sizes[i]
}

// 下载资源
const downloadResource = async (resource) => {
  console.log('下载资源:', resource.title)
  try {
    const blob = await studentAPI.downloadCourseware(resource.id)
    if (blob) {
      // 创建下载链接
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = resource.title
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      console.log('下载成功:', resource.title)
    } else {
      console.error('下载失败：返回数据为空')
      alert('下载失败：服务器返回数据为空')
    }
  } catch (error) {
    console.error('下载课件失败:', error)
    // 根据错误类型给出更友好的提示
    if (error.message.includes('404')) {
      alert('下载失败：下载接口暂未开放，请稍后重试')
    } else if (error.message.includes('500')) {
      alert('下载失败：服务器内部错误，请联系管理员')
    } else {
      alert('下载失败：' + error.message)
    }
  }
}

// 页面挂载时加载课件列表
onMounted(() => {
  loadCoursewareList()
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

/* 空状态 */
.empty-resources {
  background: #fafafa;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  color: #6c757d;
  margin: 0 0 8px 0;
}

.empty-hint {
  font-size: 14px;
  color: #adb5bd;
  margin: 0;
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
}
</style>
