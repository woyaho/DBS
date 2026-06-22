<template>
  <aside class="sidebar">
    <div class="logo-area">
      <h2>智能教育</h2>
    </div>
    <ul class="sidebar-menu">
      <li :class="{ active: currentPath === '/student/dashboard' }" @click="navigateTo('/student/dashboard')"> 首页</li>
      <li :class="{ active: currentPath.startsWith('/student/homework') || currentPath.startsWith('/student/submit') }" @click="navigateTo('/student/homework')"> 作业提交</li>
      <li :class="{ active: currentPath === '/student/grades' }" @click="navigateTo('/student/grades')"> 成绩查询</li>
      <li :class="{ active: currentPath.startsWith('/student/smart-paper') }" @click="navigateTo('/student/smart-paper/list')"> 智能组卷</li>
      <li :class="{ active: currentPath === '/student/learning-aid' }" @click="navigateTo('/student/learning-aid')"> 学习辅助</li>
      <li :class="{ active: currentPath.startsWith('/student/forum') }" @click="navigateTo('/student/forum')"> 学习论坛</li>
      <li :class="{ active: currentPath === '/student/favorites' }" @click="navigateTo('/student/favorites')"> 我的收藏</li>
      <li :class="{ active: currentPath === '/student/settings' }" @click="navigateTo('/student/settings')"> 设置</li>
    </ul>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const currentPath = computed(() => route.path)

const navigateTo = (path) => {
  router.push(path)
}
</script>

<style scoped>
/* 侧边栏 */
.sidebar {
  width: 200px;
  min-width: 200px;
  max-width: 200px;
  background: #F7F7F7;
  border-right: 1px solid #e0e0e0;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-orient: vertical;
  -webkit-box-direction: normal;
  -ms-flex-direction: column;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 90;
  flex-shrink: 0;
}

.logo-area {
  padding: 24px 20px;
  border-bottom: 1px solid var(--border-color);
}

.logo-area h2 {
  font-size: 18px;
  color: var(--primary-color);
  margin: 0;
}

.sidebar-menu {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.sidebar-menu li {
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #FFFFFF;
  margin: 0;
  color: #505E65;
  font-size: 14px;
}

.sidebar-menu li:hover {
  background: #E6F7FF;
  color: #1684FC;
}

.sidebar-menu li.active {
  background: #E6F7FF;
  color: #1684FC;
  font-weight: 500;
}
</style>
