<template>
  <aside class="sidebar">
    <div class="logo-area">
      <h2>智能教育</h2>
    </div>
    <ul class="sidebar-menu">
      <li :class="{ active: currentPath === '/teacher/dashboard' }" @click="navigateTo('/teacher/dashboard')"> 首页</li>
      <li :class="{ active: currentPath.startsWith('/teacher/homework') }" @click="navigateTo('/teacher/homework')"> 作业批改</li>
      <li :class="{ active: currentPath === '/teacher/prepare' }" @click="navigateTo('/teacher/prepare')"> 智能备课</li>
      <li :class="{ active: currentPath === '/teacher/forum' }" @click="navigateTo('/teacher/forum')"> 学习论坛</li>
      <li :class="{ active: currentPath === '/teacher/settings' }" @click="navigateTo('/teacher/settings')"> 设置</li>
    </ul>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
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
  background: #F7F7F7;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 200;
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