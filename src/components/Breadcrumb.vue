<template>
  <div class="breadcrumb">
    <el-breadcrumb separator-class="breadcrumb-separator">
      <el-breadcrumb-item v-for="(item, index) in breadcrumbs" :key="index">
        <router-link v-if="item.path" :to="item.path">{{ item.title }}</router-link>
        <span v-else>{{ item.title }}</span>
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbs = computed(() => {
  const path = route.path
  const breadcrumbs = []
  
  // 根路径处理
  if (path.startsWith('/student')) {
    breadcrumbs.push({ title: '学生端', path: '/student/dashboard' })
  } else if (path.startsWith('/teacher')) {
    breadcrumbs.push({ title: '教师端', path: '/teacher/dashboard' })
  } else if (path.startsWith('/admin')) {
    breadcrumbs.push({ title: '管理端', path: '/admin/dashboard' })
  }
  
  // 学生端路由
  if (path.startsWith('/student/')) {
    if (path === '/student/dashboard') {
      breadcrumbs.push({ title: '首页' })
    } else if (path === '/student/homework') {
      breadcrumbs.push({ title: '作业列表' })
    } else if (path === '/student/submit') {
      breadcrumbs.push({ title: '作业提交' })
    } else if (path === '/student/grades') {
      breadcrumbs.push({ title: '成绩查询' })
    } else if (path === '/student/forum') {
      breadcrumbs.push({ title: '论坛' })
    } else if (path === '/student/forum/create') {
      breadcrumbs.push({ title: '论坛', path: '/student/forum' })
      breadcrumbs.push({ title: '发布帖子' })
    } else if (path.startsWith('/student/forum/post/')) {
      breadcrumbs.push({ title: '论坛', path: '/student/forum' })
      breadcrumbs.push({ title: '帖子详情' })
    } else if (path === '/student/learning-aid') {
      breadcrumbs.push({ title: '学习助手' })
    } else if (path === '/student/quiz') {
      breadcrumbs.push({ title: '在线测验' })
    } else if (path === '/student/settings') {
      breadcrumbs.push({ title: '个人设置' })
    }
  }
  
  // 教师端路由
  if (path.startsWith('/teacher/')) {
    if (path === '/teacher/dashboard') {
      breadcrumbs.push({ title: '首页' })
    } else if (path === '/teacher/homework') {
      breadcrumbs.push({ title: '作业列表' })
    } else if (path.startsWith('/teacher/homework/review/')) {
      breadcrumbs.push({ title: '作业列表', path: '/teacher/homework' })
      breadcrumbs.push({ title: '作业批改' })
    } else if (path === '/teacher/forum') {
      breadcrumbs.push({ title: '论坛' })
    } else if (path === '/teacher/forum/create') {
      breadcrumbs.push({ title: '论坛', path: '/teacher/forum' })
      breadcrumbs.push({ title: '发布帖子' })
    } else if (path.startsWith('/teacher/forum/post/')) {
      breadcrumbs.push({ title: '论坛', path: '/teacher/forum' })
      breadcrumbs.push({ title: '帖子详情' })
    } else if (path === '/teacher/prepare') {
      breadcrumbs.push({ title: '备课资源' })
    } else if (path === '/teacher/grades') {
      breadcrumbs.push({ title: '成绩管理' })
    } else if (path === '/teacher/statistics') {
      breadcrumbs.push({ title: '统计分析' })
    } else if (path === '/teacher/classes') {
      breadcrumbs.push({ title: '班级选择' })
    } else if (path === '/teacher/settings') {
      breadcrumbs.push({ title: '个人设置' })
    }
  }
  
  // 管理端路由
  if (path.startsWith('/admin/')) {
    if (path === '/admin/dashboard') {
      breadcrumbs.push({ title: '首页' })
    } else if (path === '/admin/users') {
      breadcrumbs.push({ title: '用户管理' })
    } else if (path === '/admin/roles') {
      breadcrumbs.push({ title: '角色管理' })
    } else if (path === '/admin/logs') {
      breadcrumbs.push({ title: '系统日志' })
    } else if (path === '/admin/classes') {
      breadcrumbs.push({ title: '班级管理' })
    } else if (path === '/admin/homework') {
      breadcrumbs.push({ title: '作业管理' })
    }
  }
  
  return breadcrumbs
})
</script>

<style scoped>
.breadcrumb {
  margin: 16px 0 20px 0;
  padding: 0 20px;
}

:deep(.el-breadcrumb) {
  padding: 0;
  transition: all 0.3s ease;
}

:deep(.el-breadcrumb__item) {
  display: flex;
  align-items: center;
}

:deep(.el-breadcrumb__inner) {
  font-size: 14px;
  color: #6c757d;
  transition: color 0.3s ease;
}

:deep(.el-breadcrumb__inner:hover) {
  color: #4a90e2;
}

:deep(.el-breadcrumb__inner.is-link) {
  font-weight: 500;
  color: #4a90e2;
}

:deep(.el-breadcrumb__inner.is-link:hover) {
  text-decoration: underline;
}

/* 自定义箭头分隔符 */
.breadcrumb-separator {
  margin: 0 10px;
  color: #adb5bd;
  font-size: 14px;
  transition: color 0.3s ease;
}

:deep(.el-breadcrumb:hover) .breadcrumb-separator {
  color: #4a90e2;
}

/* 添加箭头图标 */
.breadcrumb-separator::before {
  content: "→";
  font-weight: 500;
}

/* 最后一个面包屑项的样式 */
:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #1a2a3a;
  font-weight: 600;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .breadcrumb {
    padding: 0 12px;
  }
  
  .breadcrumb-separator {
    margin: 0 8px;
  }
  
  :deep(.el-breadcrumb__inner) {
    font-size: 13px;
  }
}
</style>