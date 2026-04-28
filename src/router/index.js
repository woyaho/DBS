import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import ForgetPassword from '../views/ForgetPassword.vue'
import NotFound from '../views/NotFound.vue'
import StudentHome from '../views/student/StudentHome.vue'
import TeacherHome from '../views/teacher/TeacherHome.vue'
import AdminHome from '../views/Admin/AdminHome.vue'
import StudentHomeworkSubmit from '../views/student/StudentHomeworkSubmit.vue'
import StudentHomeworkList from '../views/student/StudentHomeworkList.vue'
import StudentGradeQuery from '../views/student/StudentGradeQuery.vue'
import StudentForum from '../views/student/StudentForum.vue'
import StudentCreatePost from '../views/student/StudentCreatePost.vue'
import StudentPostDetail from '../views/student/StudentPostDetail.vue'
import StudentLearningAid from '../views/student/StudentLearningAid.vue'
import StudentQuiz from '../views/student/StudentQuiz.vue'
import StudentSettings from '../views/student/StudentSettings.vue'
import TeacherHomeworkReview from '../views/teacher/TeacherHomeworkReview.vue'
import TeacherSettings from '../views/teacher/TeacherSettings.vue'
import TeacherHomeworkList from '../views/teacher/TeacherHomeworkList.vue'
import TeacherForum from '../views/teacher/TeacherForum.vue'
import TeacherCreatePost from '../views/teacher/TeacherCreatePost.vue'
import TeacherPostDetail from '../views/teacher/TeacherPostDetail.vue'
import TeacherPrepare from '../views/teacher/TeacherPrepare.vue'
import TeacherGradeManage from '../views/teacher/TeacherGradeManage.vue'
import TeacherStatistics from '../views/teacher/TeacherStatistics.vue'


const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/forget-password',
    name: 'ForgetPassword',
    component: ForgetPassword,
    meta: { requiresAuth: false }
  },

  {
    path: '/404',
    name: 'NotFound',
    component: NotFound,
    meta: { requiresAuth: false }
  },
  {
    path: '/student/dashboard',
    name: 'StudentHome',
    component: StudentHome,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/homework',
    name: 'StudentHomeworkList',
    component: StudentHomeworkList,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/submit',
    name: 'StudentHomeworkSubmit',
    component: StudentHomeworkSubmit,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/grades',
    name: 'StudentGradeQuery',
    component: StudentGradeQuery,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/forum',
    name: 'StudentForum',
    component: StudentForum,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/forum/create',
    name: 'StudentCreatePost',
    component: StudentCreatePost,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/forum/post/:id',
    name: 'StudentPostDetail',
    component: StudentPostDetail,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/learning-aid',
    name: 'StudentLearningAid',
    component: StudentLearningAid,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/quiz',
    name: 'StudentQuiz',
    component: StudentQuiz,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/settings',
    name: 'StudentSettings',
    component: StudentSettings,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/teacher/dashboard',
    name: 'TeacherHome',
    component: TeacherHome,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/homework',
    name: 'TeacherHomeworkList',
    component: TeacherHomeworkList,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/homework/review/:id',
    name: 'TeacherHomeworkReview',
    component: TeacherHomeworkReview,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/forum',
    name: 'TeacherForum',
    component: TeacherForum,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/forum/create',
    name: 'TeacherCreatePost',
    component: TeacherCreatePost,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/forum/post/:id',
    name: 'TeacherPostDetail',
    component: TeacherPostDetail,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/prepare',
    name: 'TeacherPrepare',
    component: TeacherPrepare,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/settings',
    name: 'TeacherSettings',
    component: TeacherSettings,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/grades',
    name: 'TeacherGradeManage',
    component: TeacherGradeManage,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/statistics',
    name: 'TeacherStatistics',
    component: TeacherStatistics,
    meta: { requiresAuth: true, role: 'teacher' }
  },

  {
    path: '/teacher/classes',
    name: 'TeacherClassSelect',
    component: () => import('../views/Teacher/TeacherClassSelect.vue'),
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/admin/dashboard',
    name: 'AdminHome',
    component: AdminHome,
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/users',
    name: 'AdminUserManage',
    component: () => import('../views/Admin/AdminUserManage.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/admin/logs',
    name: 'AdminSystemLog',
    component: () => import('../views/Admin/AdminSystemLog.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
      path: '/admin/classes',
      name: 'AdminClassManage',
      component: () => import('@/views/Admin/AdminClassManage.vue'),
      meta: { requiresAuth: true, role: 'admin' }
    },
    {
      path: '/admin/homework',
      name: 'AdminHomeworkManage',
      component: () => import('@/views/Admin/AdminHomeworkManage.vue'),
      meta: { requiresAuth: true, role: 'admin' }
    },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from) => {
  const user = localStorage.getItem('user')

  if (to.meta.requiresAuth && !user) {
    return '/login'
  } else if (to.path === '/login' && user) {
    // 如果已登录，尝试跳转到对应的首页
    const userData = JSON.parse(user)
    if (userData.role === 'student') {
      return '/student/dashboard'
    } else if (userData.role === 'teacher') {
      return '/teacher/dashboard'
    } else if (userData.role === 'admin') {
      return '/admin/dashboard'
    }
  }
  // 默认允许导航
  return true
})

export default router
