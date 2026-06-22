<template>
  <div class="page-layout">
    <!-- 侧边栏 -->
    <TeacherSidebar />

    <!-- 主内容区 -->
    <div class="content-area">
      <!-- 栏头 -->
      <TeacherHeader />

      <!-- 面包屑导航 -->
      <Breadcrumb />

      <main class="main-content">
        <div class="post-detail-container">
          <!-- 页面标题 -->
          <div class="page-header">
            <h1 class="page-title">{{ post?.title || '帖子详情' }}</h1>
            <button class="btn-secondary back-btn" @click="goBack">返回论坛</button>
          </div>

          <!-- 加载状态 -->
          <div v-if="loading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>加载中...</p>
          </div>

          <!-- 错误提示 -->
          <div v-else-if="error" class="error-state">
            <p class="error-message">{{ error }}</p>
            <button class="btn-primary" @click="loadPostDetail">重试</button>
          </div>

          <!-- 帖子内容 -->
          <div v-else-if="post" class="post-detail-card">
            <div class="post-header">
              <div class="post-title-area">
                <div class="author-avatar" :style="{ backgroundColor: getAvatarColor(post.author) }">{{ getAvatarInitial(post.author) }}</div>
                <div>
                  <h2 class="post-title">{{ post.title }}</h2>
                  <div class="post-meta">
                    <span class="post-author">{{ post.author }}</span>
                    <span class="post-date">{{ post.date }}</span>
                    <span class="post-views">{{ post.views }} 浏览</span>
                    <span class="post-replies">{{ post.replies }} 回复</span>
                  </div>
                </div>
              </div>
              <div class="post-header-actions">
                <span v-if="post.isTop" class="post-badge top-badge">置顶</span>
                <span v-if="post.isEssence" class="post-badge essence-badge">精华</span>
                <span v-if="getCategoryName(post.categoryId) !== '未知'" class="post-category">{{ getCategoryName(post.categoryId) }}</span>
                <div class="post-actions">
                  <button class="action-btn" @click="toggleFavorite(post)" :class="{ active: post.isFavorite }">
                    {{ post.isFavorite ? '取消收藏' : '收藏' }}
                  </button>
                  <button v-if="isPostOwner" class="action-btn delete-btn" @click="confirmDeletePost">
                    删除帖子
                  </button>
                </div>
              </div>
            </div>

            <!-- 帖子标签 -->
            <div class="post-tags">
              <span v-for="tag in post.tags" :key="tag" class="post-tag">{{ tag }}</span>
            </div>

            <!-- 帖子内容 -->
            <div class="post-content" v-html="post.content"></div>
          </div>

          <!-- 回复区域 -->
          <div v-if="post" class="replies-section">
            <h3 class="replies-title">回复 ({{ post.replies }})</h3>
            <div class="reply-list">
              <div v-for="(reply, index) in post.replyList" :key="index" class="reply-item">
                <div class="reply-header">
                  <div class="author-avatar small" :style="{ backgroundColor: getAvatarColor(reply.author) }">{{ getAvatarInitial(reply.author) }}</div>
                  <div class="reply-meta">
                    <span class="reply-author">{{ reply.author }}</span>
                    <span class="reply-date">{{ reply.date }}</span>
                  </div>
                  <div class="reply-actions">
                    <button class="reply-action-btn" @click="toggleReplyForm(reply)" title="回复此评论">
                      回复
                    </button>
                    <button v-if="isCommentOwner(reply)" class="reply-action-btn delete-btn" @click="confirmDeleteComment(reply)" title="删除评论">
                      删除
                    </button>
                  </div>
                </div>
                <div class="reply-content" v-html="reply.content"></div>

                <!-- 二级评论列表 -->
                <div v-if="reply.childReplies && reply.childReplies.length > 0" class="child-replies">
                  <div v-for="(child, childIndex) in reply.childReplies" :key="childIndex" class="child-reply">
                    <div class="author-avatar tiny" :style="{ backgroundColor: getAvatarColor(child.author) }">{{ getAvatarInitial(child.author) }}</div>
                    <div class="child-reply-content">
                      <span class="child-reply-author">{{ child.author }}</span>
                      <span class="child-reply-text" v-html="child.content"></span>
                      <span class="child-reply-date">{{ child.date }}</span>
                    </div>
                    <div class="child-reply-actions">
                      <button v-if="isCommentOwner(child)" class="child-reply-delete" @click="confirmDeleteComment(child)" title="删除评论">
                        删除
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 回复表单 -->
                <div v-if="reply.showReplyForm" class="child-reply-form">
                  <input
                    v-model="reply.replyText"
                    type="text"
                    class="child-reply-input"
                    placeholder="写下你的回复..."
                    @keyup.enter="submitChildReply(reply)"
                  />
                  <button class="btn-primary small" @click="submitChildReply(reply)">发送</button>
                </div>
              </div>
            </div>

            <!-- 回复表单 -->
            <div class="reply-form">
              <h4 class="form-title">发表回复</h4>
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
                  <select v-model="replyFontName" class="toolbar-select" @change="execCommand('fontName', replyFontName)" title="字体">
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
                  <button class="toolbar-btn" :class="{ active: replyFormatStates.bold }" @click="execCommand('bold')" title="粗体">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>
                  </button>
                  <button class="toolbar-btn" :class="{ active: replyFormatStates.italic }" @click="execCommand('italic')" title="斜体">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/></svg>
                  </button>
                  <button class="toolbar-btn" :class="{ active: replyFormatStates.underline }" @click="execCommand('underline')" title="下划线">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>
                  </button>
                  <button class="toolbar-btn" :class="{ active: replyFormatStates.strikeThrough }" @click="execCommand('strikeThrough')" title="删除线">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M17.75 9L14 4.5l-1.08 1.09L12.11 4H20c1.1 0 2 .89 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.11.9-2 2-2h2.5l1.79 1.79L9 4.5 5.25 9h12.5zM10 13c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-1.5c0-.55-.45-1-1-1h-2c-.55 0-1 .45-1 1V13z"/></svg>
                  </button>
                  <div class="toolbar-divider"></div>
                  <!-- 列表 -->
                  <button class="toolbar-btn" :class="{ active: replyFormatStates.insertUnorderedList }" @click="execCommand('insertUnorderedList')" title="无序列表">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>
                  </button>
                  <button class="toolbar-btn" :class="{ active: replyFormatStates.insertOrderedList }" @click="execCommand('insertOrderedList')" title="有序列表">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>
                  </button>
                  <div class="toolbar-divider"></div>
                </div>
                <!-- 编辑区域 -->
                <div ref="replyEditor" class="editor-content" contenteditable="true" @input="updateReplyContent" @selectionchange="updateReplyFormatStates" placeholder="写下你的回复..."></div>
              </div>
              <!-- 回复错误提示 -->
              <div v-if="replyError" class="error-message">
                {{ replyError }}
              </div>
              <div class="form-actions">
                <button class="btn-primary reply-btn" @click="submitReply" :disabled="replyLoading">
                  <span v-if="replyLoading">发布中...</span>
                  <span v-else>发表回复</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onActivated, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import TeacherSidebar from '@/components/Teacher/TeacherSidebar.vue'
import TeacherHeader from '@/components/Teacher/TeacherHeader.vue'
import Breadcrumb from '@/components/Breadcrumb.vue'
import { forumAPI } from '@/services/api.js'

const router = useRouter()
const route = useRoute()
const postId = ref(parseInt(route.params.id))

// 监听路由参数变化
watch(() => route.params.id, (newId) => {
  postId.value = parseInt(newId)
  loadPostDetail()
})

// 状态管理
const post = ref(null)
const newReply = ref('')
const isAnonymous = ref(false)
const loading = ref(false)
const error = ref('')
const replyLoading = ref(false)
const replyError = ref('')

const replyEditor = ref(null)

// 当前登录用户
const currentUser = ref(null)
try {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    currentUser.value = JSON.parse(userStr)
  }
} catch (e) {
  console.error('解析用户信息失败:', e)
}

// 判断是否可以删除帖子（帖子作者本人或教师）
const isPostOwner = computed(() => {
  if (!post.value || !currentUser.value) return false
  const author = post.value.author
  // 教师可以删除任意帖子，帖子作者本人也可以删除
  return author === currentUser.value.username ||
         author === currentUser.value.name ||
         currentUser.value.identity === 'teacher'
})

// 判断是否可以删除评论（评论作者本人或教师）
const isCommentOwner = (comment) => {
  if (!comment || !currentUser.value) return false
  const author = comment.author
  // 教师可以删除任意评论，评论作者本人也可以删除
  return author === currentUser.value.username ||
         author === currentUser.value.name ||
         currentUser.value.identity === 'teacher'
}

// 分类数据
const categories = ref([
  { id: 'all', name: '全部' },
  { id: 'db-basic', name: '数据库基础' },
  { id: 'sql', name: 'SQL 学习' },
  { id: 'performance', name: '性能优化' },
  { id: 'troubleshooting', name: '问题排查' },
  { id: 'others', name: '其他' }
])

// 生成用户头像颜色
const getAvatarColor = (author) => {
  const colors = ['#4a90e2', '#50e3c2', '#f5a623', '#d0021b', '#9013fe', '#417505'];
  if (!author) return colors[0];
  const hash = author.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// 获取用户头像首字母
const getAvatarInitial = (author) => {
  if (!author) return '?';
  return author.charAt(0).toUpperCase();
};

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : '未知'
}

// HTML实体解码函数
const decodeHtml = (html) => {
  if (!html) return ''
  const textArea = document.createElement('textarea')
  textArea.innerHTML = html
  return textArea.value
}

// 加载帖子详情
const loadPostDetail = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await forumAPI.getPostDetail({
      postId: postId.value
    })

    if (response.data && response.data.postId) {
      const postData = response.data
      post.value = {
        id: postData.postId,
        title: postData.title || '无标题',
        content: decodeHtml(postData.content || postData.body || postData.text || ''),
        author: postData.authorDisplayName || postData.authorUsername || '匿名用户',
        date: postData.createTime ? new Date(postData.createTime).toLocaleString() : new Date().toLocaleString(),
        views: postData.viewCount || postData.views || 0,
        replies: postData.commentCount || postData.replies || 0,
        categoryId: postData.categoryId,
        tags: postData.tags ? postData.tags.split(',') : [],
        isTop: postData.isTop === 1,
        isEssence: postData.isEssence === 1,
        isFavorite: postData.favorite === true,
        favoriteCount: postData.favoriteCount || 0,
        replyList: []
      }

      // 加载评论
      await loadComments()
    }
  } catch (err) {
    error.value = '加载帖子失败，请重试'
    console.error('加载帖子失败:', err)
  } finally {
    loading.value = false
  }
}

// 加载评论
const loadComments = async () => {
  if (!post.value) return

  try {
    const response = await forumAPI.getPostComments({
      postId: post.value.id
    })

    if (response.data && Array.isArray(response.data)) {
      post.value.replyList = response.data.map(comment => ({
        id: comment.commentId,
        author: comment.authorDisplayName || comment.authorUsername || '匿名用户',
        date: comment.createdAt ? new Date(comment.createdAt).toLocaleString() : new Date().toLocaleString(),
        content: decodeHtml(comment.content),
        showReplyForm: false,
        replyText: '',
        childReplies: comment.replies ? comment.replies.map(child => ({
          id: child.commentId,
          author: child.authorDisplayName || child.authorUsername || '匿名用户',
          date: child.createdAt ? new Date(child.createdAt).toLocaleString() : new Date().toLocaleString(),
          content: decodeHtml(child.content)
        })) : []
      }))
    }
  } catch (err) {
    console.error('加载评论失败:', err)
  }
}

// 切换二级回复表单显示
const toggleReplyForm = (reply) => {
  reply.showReplyForm = !reply.showReplyForm
}

// 提交二级回复
const submitChildReply = async (reply) => {
  if (!reply.replyText.trim()) {
    alert('请输入回复内容')
    return
  }

  try {
    await forumAPI.replyComment({
      postId: post.value.id,
      parentCommentId: reply.id,
      content: reply.replyText.trim(),
      isAnonymous: 0
    })

    // 重新加载评论
    await loadComments()
  } catch (err) {
    console.error('发布回复失败:', err)
    alert('发布回复失败，请重试')
  }
}

// 确认删除帖子
const confirmDeletePost = () => {
  if (confirm('确定要删除这篇帖子吗？此操作不可撤销。')) {
    deletePost()
  }
}

// 删除帖子
const deletePost = async () => {
  try {
    await forumAPI.deletePost({
      postId: post.value.id
    })
    alert('帖子删除成功')
    router.push('/teacher/forum')
  } catch (err) {
    console.error('删除帖子失败:', err)
    alert('删除帖子失败，请重试')
  }
}

// 确认删除评论
const confirmDeleteComment = (comment) => {
  if (confirm('确定要删除这条评论吗？此操作不可撤销。')) {
    deleteComment(comment)
  }
}

// 删除评论
const deleteComment = async (comment) => {
  try {
    await forumAPI.deleteComment({
      commentId: comment.id
    })
    // 重新加载评论
    await loadComments()
  } catch (err) {
    console.error('删除评论失败:', err)
    alert('删除评论失败，请重试')
  }
}

// 初始化数据
onMounted(() => {
  loadPostDetail()
})

// 路由参数变化时重新加载数据（组件复用时触发）
onActivated(() => {
  loadPostDetail()
})

// 返回论坛
const goBack = () => {
  router.push('/teacher/forum')
}

// 切换收藏状态
const toggleFavorite = async (post) => {
  try {
    const response = await forumAPI.favoritePost({
      postId: post.id
    })

    if (response && response.data) {
      post.isFavorite = response.data.favorite
      post.favoriteCount = response.data.favoriteCount
    } else {
      post.isFavorite = !post.isFavorite
    }
  } catch (err) {
    console.error('操作收藏失败:', err)
  }
}

// 回复编辑器状态
const replyFontName = ref('')
const replyFormatStates = reactive({
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
  insertUnorderedList: false,
  insertOrderedList: false
})

// 更新回复格式状态
const updateReplyFormatStates = () => {
  replyFormatStates.bold = document.queryCommandState('bold')
  replyFormatStates.italic = document.queryCommandState('italic')
  replyFormatStates.underline = document.queryCommandState('underline')
  replyFormatStates.strikeThrough = document.queryCommandState('strikeThrough')
  replyFormatStates.insertUnorderedList = document.queryCommandState('insertUnorderedList')
  replyFormatStates.insertOrderedList = document.queryCommandState('insertOrderedList')
}

// 富文本编辑器命令
const execCommand = (command, value = null) => {
  document.execCommand(command, false, value)
  if (replyEditor.value) {
    replyEditor.value.focus()
  }
  updateReplyFormatStates()
}

// 更新回复内容
const updateReplyContent = () => {
  if (replyEditor.value) {
    newReply.value = replyEditor.value.innerHTML
  }
}





// 获取教师姓名（模拟）
const getTeacherName = () => {
  const user = localStorage.getItem('user')
  if (user) {
    const userData = JSON.parse(user)
    return userData.name || '教师'
  }
  return '教师'
}

// 提交回复
// 清理富文本编辑器生成的多余HTML标签，但保留格式标签和img标签
const cleanHtmlContent = (html) => {
  if (!html) return ''

  // 临时保存img标签
  const imgTags = []
  let cleaned = html
    // 保存img标签到数组并替换为占位符
    .replace(/<img[^>]+src="data:image[^"]+"[^>]*>/gi, (match) => {
      const index = imgTags.push(match) - 1
      return `[[IMG_PLACEHOLDER_${index}]]`
    })
    // 移除空的div标签
    .replace(/<div[^>]*><\/div>/gi, '')
    // 移除blockquote标签（引用回复的样式标签）
    .replace(/<blockquote[^>]*>/gi, '')
    .replace(/<\/blockquote>/gi, '\n')
    // 恢复img标签
    .replace(/\[\[IMG_PLACEHOLDER_(\d+)\]\]/gi, (match, index) => {
      return imgTags[index] || ''
    })
    // 移除多余的空白字符
    .trim()

  return cleaned
}

const submitReply = async () => {
  if (!newReply.value) {
    alert('请输入回复内容')
    return
  }

  replyLoading.value = true
  replyError.value = ''

  try {
    const cleanContent = cleanHtmlContent(newReply.value)

    await forumAPI.commentPost({
      postId: post.value.id,
      content: cleanContent,
      isAnonymous: 0
    })

    // 重新加载评论
    await loadComments()

    // 清空编辑器
    newReply.value = ''
    if (replyEditor.value) {
      replyEditor.value.innerHTML = ''
    }
  } catch (err) {
    replyError.value = '发布回复失败，请重试'
    console.error('发布回复失败:', err)
  } finally {
    replyLoading.value = false
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

.post-detail-container {
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

/* 帖子详情卡片 */
.post-detail-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

/* 帖子头部 */
.post-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.post-title-area {
  display: flex;
  align-items: flex-start;
  flex: 1;
  gap: 16px;
}

.author-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
  flex-shrink: 0;
}

.author-avatar.small {
  width: 32px;
  height: 32px;
  font-size: 14px;
}

.post-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0 0 8px 0;
}

.post-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #6c757d;
  flex-wrap: wrap;
}

.post-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.post-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.action-btn:hover {
  border-color: #4a90e2;
  color: #4a90e2;
}

.action-btn.active {
  background: #4a90e2;
  color: white;
  border-color: #4a90e2;
}

.post-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.top-badge {
  background: #f44336;
  color: white;
}

.essence-badge {
  background: #ff9800;
  color: white;
}

.post-category {
  padding: 4px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 帖子标签 */
.post-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.post-tag {
  padding: 4px 12px;
  background: #f1f3f4;
  color: #5f6368;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 帖子内容 */
.post-content {
  font-size: 16px;
  line-height: 1.6;
  color: #333;
  margin: 0;
}

.post-content img {
  max-width: 100%;
  border-radius: 4px;
}

.post-content pre {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

/* 回复区域 */
.replies-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.replies-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0 0 20px 0;
}

.reply-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.reply-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.reply-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.reply-meta {
  flex: 1;
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #6c757d;
}

.reply-action-btn {
  padding: 4px 10px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.reply-action-btn:hover {
  border-color: #4a90e2;
  color: #4a90e2;
}

.reply-content {
  font-size: 14px;
  line-height: 1.5;
  color: #555;
  margin: 0;
}

/* 二级评论 */
.child-replies {
  margin-top: 12px;
  padding-left: 44px;
}

.child-reply {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
  border-top: 1px solid #e9ecef;
}

.child-reply:first-child {
  border-top: none;
}

.author-avatar.tiny {
  width: 24px;
  height: 24px;
  font-size: 12px;
  flex-shrink: 0;
}

.child-reply-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.child-reply-author {
  font-size: 13px;
  font-weight: 600;
  color: #1a2a3a;
}

.child-reply-date {
  font-size: 12px;
  color: #6c757d;
}

.child-reply-text {
  font-size: 13px;
  line-height: 1.5;
  color: #555;
}

.child-reply-form {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-left: 44px;
}

.child-reply-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 13px;
}

.child-reply-input:focus {
  outline: none;
  border-color: #4a90e2;
}

.child-reply-actions {
  display: flex;
  align-items: center;
}

.child-reply-delete {
  padding: 4px 8px;
  font-size: 12px;
  color: #dc3545;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.child-reply-delete:hover {
  background-color: #f8d7da;
}

.reply-content img {
  max-width: 100%;
  border-radius: 4px;
}

.reply-content pre {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
}

.reply-content blockquote {
  border-left: 3px solid #4a90e2;
  padding-left: 12px;
  margin: 8px 0;
  color: #666;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
}

/* 回复表单 */
.reply-form {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e9ecef;
}

.form-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a2a3a;
  margin: 0 0 16px 0;
}

/* 富文本编辑器 */
.rich-editor {
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  margin-bottom: 16px;
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

.toolbar-btn.active {
  background-color: #4a90e2;
  border-color: #4a90e2;
  color: white;
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
  min-height: 150px;
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

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.reply-btn {
  padding: 10px 20px;
  background: #4a90e2;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
}

.reply-btn:hover {
  background: #357abd;
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4a90e2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: #6c757d;
  font-size: 14px;
  margin: 0;
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  background: #fff5f5;
  border-radius: 12px;
  border: 1px solid #ffebee;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

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

  .post-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .post-title-area {
    flex-direction: column;
    align-items: flex-start;
  }

  .author-avatar {
    align-self: flex-start;
  }

  .post-header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .post-actions {
    width: 100%;
    justify-content: space-between;
  }

  .action-btn {
    flex: 1;
    text-align: center;
  }

  .post-meta {
    flex-wrap: wrap;
  }

  .post-tags {
    width: 100%;
  }

  .reply-header {
    flex-wrap: wrap;
  }

  .reply-action-btn {
    margin-left: auto;
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
    min-height: 120px;
  }
}
</style>
