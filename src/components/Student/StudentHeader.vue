<template>
  <header class="header">
    <div class="header-left">
      <h1 class="system-title">数据库作业管理系统</h1>
    </div>
    <div class="header-right">
      <div class="user-dropdown" @click="toggleDropdown">
        <div class="user-info">
          <div class="user-avatar">
            <img :src="userAvatar || '/images/default_avatar.png'" alt="用户头像" />
          </div>
          <span class="user-name">{{ userName }}</span>
          <span class="dropdown-arrow">{{ dropdownOpen ? '▼' : '▶' }}</span>
        </div>
        <div v-if="dropdownOpen" class="dropdown-menu">
          <div class="dropdown-item" @click="modifyAvatar">修改头像</div>
          <div class="dropdown-item" @click="modifyPassword">修改密码</div>
          <div class="dropdown-item" @click="emailBinding">邮箱绑定</div>
          <div class="dropdown-item" @click="phoneBinding">手机绑定</div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item logout" @click="logout">退出登录</div>
        </div>
      </div>
    </div>

    <!-- 头像上传对话框 -->
    <div v-if="showAvatarDialog" class="avatar-dialog-overlay" @click="closeAvatarDialog">
      <div class="avatar-dialog" @click.stop>
        <div class="dialog-header">
          <h3>修改头像</h3>
          <button class="close-btn" @click="closeAvatarDialog">×</button>
        </div>
        <div class="dialog-content">
          <div class="avatar-preview">
            <img :src="previewAvatar || userAvatar || '/images/default_avatar.png'" alt="头像预览" />
          </div>
          <div class="upload-area">
            <input
              type="file"
              ref="fileInput"
              accept="image/*"
              @change="handleFileChange"
              style="display: none"
            />
            <button class="btn btn-primary" @click="triggerFileInput">选择图片</button>
            <p class="upload-tip">支持 JPG、PNG 格式，文件大小不超过 2MB</p>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="btn btn-secondary" @click="closeAvatarDialog">取消</button>
          <button class="btn btn-primary" @click="saveAvatar" :disabled="!previewAvatar">保存</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userName = ref('同学')
const dropdownOpen = ref(false)
const showAvatarDialog = ref(false)
const userAvatar = ref('')
const previewAvatar = ref('')
const fileInput = ref(null)

onMounted(() => {
  const user = localStorage.getItem('user')
  if (user) {
    const userData = JSON.parse(user)
    userName.value = userData.name || userData.username
    userAvatar.value = userData.avatar || ''
  }

  // 点击外部关闭下拉菜单
  document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.user-dropdown')
    if (dropdown && !dropdown.contains(e.target)) {
      dropdownOpen.value = false
    }
  })
})

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const modifyAvatar = () => {
  showAvatarDialog.value = true
  dropdownOpen.value = false
}

const closeAvatarDialog = () => {
  showAvatarDialog.value = false
  previewAvatar.value = ''
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }

  // 检查文件大小 (2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('文件大小不能超过 2MB')
    return
  }

  // 读取文件并预览
  const reader = new FileReader()
  reader.onload = (e) => {
    previewAvatar.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const saveAvatar = () => {
  if (!previewAvatar.value) return

  // 保存头像到 localStorage
  const user = localStorage.getItem('user')
  if (user) {
    const userData = JSON.parse(user)
    userData.avatar = previewAvatar.value
    localStorage.setItem('user', JSON.stringify(userData))
    userAvatar.value = previewAvatar.value
  }

  closeAvatarDialog()
  alert('头像修改成功！')
}

const modifyPassword = () => {
  console.log('修改密码')
  dropdownOpen.value = false
}

const emailBinding = () => {
  console.log('邮箱绑定')
  dropdownOpen.value = false
}

const phoneBinding = () => {
  console.log('手机绑定')
  dropdownOpen.value = false
}

const logout = () => {
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style scoped>
/* 头部样式 */
.header {
  background: linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%);
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  position: fixed;
  top: 0;
  left: 200px;
  right: 0;
  z-index: 80;
}

.header-left .system-title {
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-right {
  display: flex;
  align-items: center;
}

/* 用户下拉菜单 */
.user-dropdown {
  position: relative;
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 10px;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #FFFFFF;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.dropdown-arrow {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  transition: transform 0.3s ease;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: #FFFFFF;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  margin-top: 5px;
  z-index: 1000;
}

.dropdown-item {
  padding: 10px 15px;
  font-size: 14px;
  color: #333333;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 5px 0;
}

.dropdown-item.logout {
  color: #ff4d4f;
}

.dropdown-item.logout:hover {
  background-color: #fff2f0;
}

/* 头像上传对话框 */
.avatar-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.avatar-dialog {
  background: white;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #666;
}

.dialog-content {
  padding: 30px;
  text-align: center;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  margin: 0 auto 20px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #e0e0e0;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-area {
  margin-top: 20px;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  margin-top: 10px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
}

.btn {
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-primary:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.btn-secondary {
  background: #ecf0f1;
  color: #333;
}

.btn-secondary:hover {
  background: #d5dbdb;
}
</style>