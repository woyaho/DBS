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
          <div class="create-post-container">
            <!-- 页面标题 -->
            <div class="page-header">
              <h1 class="page-title">发布新帖子</h1>
              <button class="btn-secondary back-btn" @click="goBack">返回论坛</button>
            </div>

            <!-- 发布帖子表单 -->
            <div class="create-post-form">
              <div class="form-group">
                <label class="form-label">标题</label>
                <input type="text" v-model="newPost.title" class="form-input" placeholder="请输入帖子标题" />
              </div>
              <div class="form-group">
                <label class="form-label">分类</label>
                <select v-model="newPost.categoryId" class="form-select">
                  <option v-for="category in categories" :key="category.id" :value="category.id">
                    {{ category.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">标签</label>
                <div class="tag-input-area">
                  <div class="tag-list">
                    <span v-for="(tag, index) in newPost.tags" :key="index" class="tag-item">
                      {{ tag }}
                      <button type="button" class="tag-remove" @click="removeTag(index)">×</button>
                    </span>
                  </div>
                  <div class="tag-input-box">
                    <input
                      type="text"
                      v-model="tagInput"
                      placeholder="输入标签后按回车添加"
                      class="tag-input"
                      @keyup.enter="addTag"
                    />
                  </div>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">内容</label>
                <div class="rich-editor">
                  <!-- 编辑器工具栏 -->
                  <div class="editor-toolbar">
                    <!-- 撤销/重做 -->
                    <button class="toolbar-btn" @click="execCommand('undo')" title="撤销">
                      <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>
                    </button>
                    <button class="toolbar-btn" @click="execCommand('redo')" title="重做">
                      <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>
                    </button>
                    <div class="toolbar-divider"></div>
                    <!-- 字体 -->
                    <select v-model="selectedFontName" class="toolbar-select" @change="execCommand('fontName', selectedFontName)" title="字体">
                      <option value="">默认字体</option>
                      <option value="SimSun">宋体</option>
                      <option value="SimHei">黑体</option>
                      <option value="Microsoft YaHei">微软雅黑</option>
                      <option value="KaiTi">楷体</option>
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                    </select>
                    <div class="toolbar-divider"></div>
                    <!-- 格式按钮 -->
                    <button class="toolbar-btn" :class="{ active: isFormatActive('bold') }" @click="execCommand('bold')" title="粗体">
                      <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>
                    </button>
                    <button class="toolbar-btn" :class="{ active: isFormatActive('italic') }" @click="execCommand('italic')" title="斜体">
                      <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>
                    </button>
                    <button class="toolbar-btn" :class="{ active: isFormatActive('underline') }" @click="execCommand('underline')" title="下划线">
                      <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>
                    </button>
                    <button class="toolbar-btn" :class="{ active: isFormatActive('strikeThrough') }" @click="execCommand('strikeThrough')" title="删除线">
                      <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M17.75 9L14 4.5l-1.08 1.09L12.11 4H20c1.1 0 2 .89 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.11.9-2 2-2h2.5l1.79 1.79L9 4.5 5.25 9h12.5zM10 13c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-1.5c0-.55-.45-1-1-1h-2c-.55 0-1 .45-1 1V13z"/></svg>
                    </button>
                    <div class="toolbar-divider"></div>
                    <!-- 列表 -->
                    <button class="toolbar-btn" :class="{ active: isFormatActive('insertUnorderedList') }" @click="execCommand('insertUnorderedList')" title="无序列表">
                      <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>
                    </button>
                    <button class="toolbar-btn" :class="{ active: isFormatActive('insertOrderedList') }" @click="execCommand('insertOrderedList')" title="有序列表">
                      <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>
                    </button>
                  </div>
                  <!-- 编辑区域 -->
                  <div ref="editorContent" class="editor-content" contenteditable="true" @input="updateContent" @selectionchange="updateFormatStates" placeholder="请输入帖子内容"></div>
                </div>
              </div>
              <!-- 错误提示 -->
              <div v-if="error" class="error-message">
                {{ error }}
              </div>

              <div class="form-actions">
                <div class="anonymous-option">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="isAnonymous" class="checkbox-input">
                    <span class="checkbox-text">匿名发表</span>
                  </label>
                </div>
                <div class="action-buttons">
                  <button class="btn-secondary" @click="goBack" :disabled="loading">取消</button>
                  <button class="btn-primary" @click="submitNewPost" :disabled="loading">
                    <span v-if="loading">发布中...</span>
                    <span v-else>发布帖子</span>
                  </button>
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
import { ref, reactive, onMounted, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import StudentSidebar from '@/components/Student/StudentSidebar.vue'
import StudentHeader from '@/components/Student/StudentHeader.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { forumAPI } from '@/services/api.js'

const router = useRouter()

// 状态管理
const loading = ref(false)
const error = ref('')

// 分类数据
const categories = ref([
  { id: 'db-basic', name: '数据库基础' },
  { id: 'sql', name: 'SQL 学习' },
  { id: 'performance', name: '性能优化' },
  { id: 'troubleshooting', name: '问题排查' },
  { id: 'others', name: '其他' }
])

// 新帖子数据
const newPost = ref({
  title: '',
  content: '',
  categoryId: 'db-basic',
  tags: []
})

// 匿名发表选项
const isAnonymous = ref(false)

// 标签输入
const tagInput = ref('')

// 编辑器状态
const selectedFontSize = ref('')
const selectedFontName = ref('')
const formatStates = reactive({
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
  insertUnorderedList: false,
  insertOrderedList: false
})

// 图片输入引用
const imageInput = ref(null)
const ocrInput = ref(null)
const fileInput = ref(null)
const editorContent = ref(null)

// 上传的文件列表
const uploadedFiles = ref([])

// 返回论坛
const goBack = () => {
  router.push('/student/forum')
}

// 添加标签
const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !newPost.value.tags.includes(tag) && newPost.value.tags.length < 5) {
    newPost.value.tags.push(tag)
    tagInput.value = ''
  }
}

// 删除标签
const removeTag = (index) => {
  newPost.value.tags.splice(index, 1)
}

// 富文本编辑器命令
const execCommand = (command, value = null) => {
  document.execCommand(command, false, value)
  if (editorContent.value) {
    editorContent.value.focus()
  }
  updateFormatStates()
}

// 检查格式是否激活
const isFormatActive = (command) => {
  return formatStates[command] || false
}

// 更新格式状态
const updateFormatStates = () => {
  formatStates.bold = document.queryCommandState('bold')
  formatStates.italic = document.queryCommandState('italic')
  formatStates.underline = document.queryCommandState('underline')
  formatStates.strikeThrough = document.queryCommandState('strikeThrough')
  formatStates.insertUnorderedList = document.queryCommandState('insertUnorderedList')
  formatStates.insertOrderedList = document.queryCommandState('insertOrderedList')
}

// 更新内容
const updateContent = () => {
  if (editorContent.value) {
    newPost.value.content = editorContent.value.innerHTML
  }
}

// 插入链接
const insertLink = () => {
  const url = prompt('请输入链接地址：', 'http://')
  if (url) {
    execCommand('createLink', url)
  }
}

// 插入公式
const insertFormula = () => {
  const formula = prompt('请输入公式（LaTeX格式）：', '')
  if (formula) {
    const html = `<span class="formula" style="background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-family: 'Courier New', monospace;">$${formula}$</span>&nbsp;`
    execCommand('insertHTML', html)
  }
}

// 插入代码块
const insertCodeBlock = () => {
  const code = prompt('请输入代码：', '')
  if (code) {
    const html = `<pre style="background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 13px;"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre><p><br></p>`
    execCommand('insertHTML', html)
  }
}

// 触发图片上传
const triggerImageUpload = () => {
  if (imageInput.value) {
    imageInput.value.click()
  }
}

// 处理图片上传
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const imageUrl = URL.createObjectURL(file)
    const html = `<img src="${imageUrl}" style="max-width: 100%; border-radius: 4px; margin: 8px 0;" /><p><br></p>`
    execCommand('insertHTML', html)
    event.target.value = ''
  }
}

// 触发OCR
const triggerOCR = () => {
  if (ocrInput.value) {
    ocrInput.value.click()
  }
}

// 处理OCR（模拟）
const handleOCR = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 模拟OCR识别结果
    setTimeout(() => {
      const ocrText = '这是OCR识别的文本内容（模拟）...'
      execCommand('insertText', ocrText)
    }, 500)
    event.target.value = ''
  }
}

// 触发文件上传
const triggerFileUpload = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

// 处理文件上传
const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 模拟文件上传，实际项目中需要调用API
    const fileId = Date.now()
    uploadedFiles.value.push({
      id: fileId,
      name: file.name,
      size: file.size
    })

    // 在编辑器中插入文件链接
    const fileLink = `<a href="javascript:void(0)" onclick="window.open('${API_BASE_URL}/student/post/view-file?fileId=${fileId}', '_blank')" style="color: #4a90e2; text-decoration: underline;">📎 ${file.name}</a>`
    execCommand('insertHTML', fileLink)
    event.target.value = ''
  }
}

// 提交新帖子
const submitNewPost = async () => {
  if (!newPost.value.title || !newPost.value.content) {
    alert('请填写标题和内容')
    return
  }

  loading.value = true
  error.value = ''

  try {
    // 创建FormData对象
    const formData = new FormData()
    formData.append('title', newPost.value.title)
    formData.append('content', newPost.value.content)
    formData.append('categoryId', newPost.value.categoryId)
    formData.append('tags', newPost.value.tags.join(','))
    formData.append('anonymous', isAnonymous.value ? 'true' : 'false')

    // 添加文件（实际项目中需要从fileInput中获取文件）
    if (fileInput.value && fileInput.value.files.length > 0) {
      formData.append('file', fileInput.value.files[0])
    }

    const response = await forumAPI.createPost(formData)

    if (response.code === 200) {
      alert('帖子发布成功！')
      router.push('/student/forum')
    }
  } catch (err) {
    error.value = '发布帖子失败，请重试'
    console.error('发布帖子失败:', err)
  } finally {
    loading.value = false
  }
}

// 重置表单数据
const resetForm = () => {
  newPost.value = {
    title: '',
    content: '',
    categoryId: 'db-basic',
    tags: []
  }
  isAnonymous.value = false
  tagInput.value = ''
  selectedFontName.value = ''
  formatStates.bold = false
  formatStates.italic = false
  formatStates.underline = false
  formatStates.strikeThrough = false
  formatStates.insertUnorderedList = false
  formatStates.insertOrderedList = false
  if (editorContent.value) {
    editorContent.value.innerHTML = ''
  }
}

onMounted(() => {
  if (editorContent.value) {
    editorContent.value.focus()
  }
})

// 组件激活时重置表单（解决组件复用导致的表单数据残留问题）
onActivated(() => {
  resetForm()
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

.create-post-container {
  max-width: 100%;
  margin: 0;
}

/* 页面头部 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0;
}

.back-btn {
  padding: 8px 16px;
  background: white;
  color: #6c757d;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.back-btn:hover {
  border-color: #4a90e2;
  color: #4a90e2;
}

/* 发布帖子表单 */
.create-post-form {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 表单样式 */
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 8px;
}

.form-input,
.form-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.3s;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

/* 标签输入区域 */
.tag-input-area {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 8px;
  min-height: 40px;
  transition: all 0.3s;
}

.tag-input-area:focus-within {
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 16px;
  font-size: 13px;
  font-weight: 500;
  gap: 6px;
}

.tag-remove {
  background: none;
  border: none;
  color: #1976d2;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.tag-remove:hover {
  color: #1565c0;
}

.tag-input-box {
  display: flex;
}

.tag-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  padding: 4px 0;
}

/* 富文本编辑器 */
.rich-editor {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.rich-editor:focus-within {
  border-color: #4a90e2;
  box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 8px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  flex-wrap: wrap;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 8px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  min-width: 32px;
  height: 32px;
}

.toolbar-btn:hover {
  border-color: #4a90e2;
  color: #4a90e2;
  background: #f0f7ff;
}

.toolbar-btn svg {
  width: 16px;
  height: 16px;
}

.toolbar-btn.active {
  background-color: #4a90e2;
  border-color: #4a90e2;
  color: white;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #dee2e6;
  margin: 0 4px;
}

.toolbar-select {
  padding: 4px 8px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  height: 32px;
}

.toolbar-select:focus {
  outline: none;
  border-color: #4a90e2;
}

.toolbar-color-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.toolbar-color-picker {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.ocr-btn {
  font-size: 12px;
  font-weight: 600;
  padding: 6px 10px;
}

.editor-content {
  min-height: 300px;
  padding: 16px;
  font-size: 14px;
  line-height: 1.6;
  outline: none;
  overflow-y: auto;
}

.editor-content:empty:before {
  content: attr(placeholder);
  color: #adb5bd;
  pointer-events: none;
}

.editor-content img {
  max-width: 100%;
  border-radius: 4px;
}

.editor-content pre {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

/* 表单操作 */
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
}

.anonymous-option {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #4a90e2;
}

.checkbox-text {
  font-size: 14px;
  color: #495057;
}

.action-buttons {
  display: flex;
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

/* 错误提示 */
.error-message {
  background: #fff5f5;
  color: #d32f2f;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  border-left: 4px solid #d32f2f;
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

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .back-btn {
    align-self: stretch;
  }

  .create-post-form {
    padding: 16px;
  }

  .editor-toolbar {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding: 8px;
  }

  .toolbar-select {
    font-size: 12px;
    padding: 4px;
  }

  .editor-content {
    min-height: 200px;
  }

  .tag-input-area {
    min-height: 60px;
  }

  .form-actions {
    flex-direction: column;
    gap: 16px;
  }

  .anonymous-option {
    order: 2;
  }

  .action-buttons {
    width: 100%;
    order: 1;
  }

  .btn-secondary,
  .btn-primary {
    flex: 1;
    text-align: center;
  }
}
</style>
