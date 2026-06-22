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
          <div class="dropdown-item logout" @click="logout">退出登录</div>
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
const userAvatar = ref('')
const dropdownOpen = ref(false)

onMounted(() => {
  const user = localStorage.getItem('user')
  if (user) {
    const userData = JSON.parse(user)
    userName.value = userData.name || userData.username
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

.dropdown-item.logout {
  color: #ff4d4f;
}

.dropdown-item.logout:hover {
  background-color: #fff2f0;
}
</style>
