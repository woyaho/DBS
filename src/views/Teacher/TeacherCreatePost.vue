<template>
  <div class="page-layout">
    <!-- 栏头 -->
    <TeacherHeader />
    
    <div class="content-container">
      <TeacherSidebar />
      <div class="content-area">
        <Breadcrumb />
        <main class="main-content">
          <div class="create-post-container">
            <div class="page-header">
              <h1 class="page-title">发布新帖子</h1>
              <button class="btn-secondary back-btn" @click="goBack">返回论坛</button>
            </div>

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
                  <div class="editor-toolbar">
                    <button class="toolbar-btn" @click="execCommand('undo')" title="撤销">
                      <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>
                    </button>
                    <button class="toolbar-btn" @click="execCommand('redo')" title="重做">
                      <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>
                    </button>
                    <div class="toolbar-divider"></div>
                    <button class="toolbar-btn" @click="execCommand('bold')" title="粗体">
                      <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>
                    </button>
                    <button class="toolbar-btn" @click="execCommand('insertUnorderedList')" title="无序列表">
                      <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>
                    </button>
                  </div>
                  <div ref="editorContent" class="editor-content" contenteditable="true" @input="updateContent" placeholder="请输入帖子内容"></div>
                </div>
              </div>
              <div class="form-actions">
                <button class="btn-secondary" @click="goBack">取消</button>
                <button class="btn-primary" @click="submitNewPost">发布帖子</button>
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
import { useRouter } from 'vue-router'
import TeacherSidebar from '@/components/Teacher/TeacherSidebar.vue'
import TeacherHeader from '@/components/Teacher/TeacherHeader.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'

const router = useRouter()

const categories = ref([
  { id: 'db-basic', name: '数据库基础' },
  { id: 'sql', name: 'SQL 学习' },
  { id: 'performance', name: '性能优化' },
  { id: 'troubleshooting', name: '问题排查' },
  { id: 'others', name: '其他' }
])

const newPost = ref({
  title: '',
  content: '',
  categoryId: 'db-basic',
  tags: []
})

const tagInput = ref('')
const imageInput = ref(null)
const ocrInput = ref(null)
const editorContent = ref(null)

const postsData = ref([
  {
    id: 1,
    title: 'PostgreSQL 与 MySQL 的性能对比分析',
    content: '最近在项目中需要选择数据库，对 PostgreSQL 和 MySQL 进行了一些性能测试...',
    author: '数据库爱好者',
    date: '2025-03-20',
    views: 328,
    replies: 15,
    categoryId: 'performance',
    tags: ['性能测试', '数据库对比'],
    isTop: true,
    isEssence: true,
    isFavorite: false,
    replyList: []
  }
])

const goBack = () => {
  router.push('/teacher/forum')
}

const addTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !newPost.value.tags.includes(tag) && newPost.value.tags.length < 5) {
    newPost.value.tags.push(tag)
    tagInput.value = ''
  }
}

const removeTag = (index) => {
  newPost.value.tags.splice(index, 1)
}

const execCommand = (command, value = null) => {
  document.execCommand(command, false, value)
  if (editorContent.value) {
    editorContent.value.focus()
  }
}

const updateContent = () => {
  if (editorContent.value) {
    newPost.value.content = editorContent.value.innerHTML
  }
}

const submitNewPost = () => {
  if (!newPost.value.title || !newPost.value.content) {
    alert('请填写标题和内容')
    return
  }
  
  const newPostData = {
    id: postsData.value.length + 1,
    title: newPost.value.title,
    content: newPost.value.content,
    author: '教师',
    date: new Date().toISOString().split('T')[0],
    views: 0,
    replies: 0,
    categoryId: newPost.value.categoryId,
    tags: newPost.value.tags,
    isTop: false,
    isEssence: false,
    isFavorite: false,
    replyList: []
  }
  
  postsData.value.unshift(newPostData)
  router.push(`/teacher/forum/post/${newPostData.id}`)
}

onMounted(() => {
  if (editorContent.value) {
    editorContent.value.focus()
  }
})
</script>

<style scoped>
.page-layout {
  min-height: 100vh;
  background: #F0F2F5;
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
  display: flex;
  flex-direction: column;
  margin-left: 200px;
  width: calc(100% - 200px);
}

.main-content {
  flex: 1;
  padding: 24px 24px 24px 12px;
  overflow-y: auto;
}

.create-post-container {
  max-width: 100%;
  margin: 0;
}

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

.create-post-form {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

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

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #dee2e6;
  margin: 0 4px;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
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

@media (max-width: 768px) {
  .content-area {
    margin-left: 0;
    width: 100%;
  }
  
  .main-content {
    padding: 16px;
  }
}
</style>