import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import ForgetPassword from '../views/ForgetPassword.vue'
import NotFound from '../views/NotFound.vue'
import StudentHome from '../views/student/StudentHome.vue'
import TeacherHome from '../views/teacher/TeacherHome.vue'
import AdminHome from '../views/Admin/AdminHome.vue'
import StudentHomeworkSubmit from '../views/student/StudentHomeworkSubmit.vue'
import StudentHomeworkList from '../views/student/StudentHomeworkList.vue'
import StudentForum from '../views/student/StudentForum.vue'
import StudentCreatePost from '../views/student/StudentCreatePost.vue'
import StudentPostDetail from '../views/student/StudentPostDetail.vue'
import StudentLearningAid from '../views/student/StudentLearningAid.vue'
import StudentQuiz from '../views/student/StudentQuiz.vue'
import StudentSettings from '../views/student/StudentSettings.vue'
import StudentFavorites from '../views/student/StudentFavorites.vue'
import StudentSmartPaperGenerate from '../views/student/StudentSmartPaperGenerate.vue'
import StudentSmartPaperList from '../views/student/StudentSmartPaperList.vue'
import StudentSmartPaperAnswer from '../views/student/StudentSmartPaperAnswer.vue'
import StudentSmartPaperResult from '../views/student/StudentSmartPaperResult.vue'
import StudentGradeQuery from '../views/student/StudentGradeQuery.vue'
import TeacherHomeworkReview from '../views/teacher/TeacherHomeworkReview.vue'
import TeacherSettings from '../views/teacher/TeacherSettings.vue'
import TeacherHomeworkList from '../views/teacher/TeacherHomeworkList.vue'
import TeacherForum from '../views/teacher/TeacherForum.vue'
import TeacherCreatePost from '../views/teacher/TeacherCreatePost.vue'
import TeacherPostDetail from '../views/teacher/TeacherPostDetail.vue'
import TeacherPrepare from '../views/teacher/TeacherPrepare.vue'
import TeacherFavorites from '../views/teacher/TeacherFavorites.vue'
import TeacherSmartPaperList from '../views/teacher/TeacherSmartPaperList.vue'
import TeacherSmartPaperGenerate from '../views/teacher/TeacherSmartPaperGenerate.vue'
import TeacherSmartPaperDetail from '../views/teacher/TeacherSmartPaperDetail.vue'


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
    path: '/student/favorites',
    name: 'StudentFavorites',
    component: StudentFavorites,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/smart-paper',
    redirect: '/student/smart-paper/list'
  },
  {
    path: '/student/smart-paper/generate',
    name: 'StudentSmartPaperGenerate',
    component: StudentSmartPaperGenerate,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/smart-paper/list',
    name: 'StudentSmartPaperList',
    component: StudentSmartPaperList,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/smart-paper/answer/:paperId',
    name: 'StudentSmartPaperAnswer',
    component: StudentSmartPaperAnswer,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/smart-paper/result/:paperId',
    name: 'StudentSmartPaperResult',
    component: StudentSmartPaperResult,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/student/grades',
    name: 'StudentGradeQuery',
    component: StudentGradeQuery,
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/teacher/dashboard',
    name: 'TeacherHome',
    component: TeacherHome,
    meta: { requiresAuth: true, role: 'teacher', keepAlive: true }
  },
  {
    path: '/teacher/homework',
    name: 'TeacherHomeworkList',
    component: TeacherHomeworkList,
    meta: { requiresAuth: true, role: 'teacher', keepAlive: true }
  },
  {
    path: '/teacher/homework/review/:id',
    name: 'TeacherHomeworkReview',
    component: TeacherHomeworkReview,
    meta: { requiresAuth: true, role: 'teacher', keepAlive: true }
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
    path: '/teacher/favorites',
    name: 'TeacherFavorites',
    component: TeacherFavorites,
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
    path: '/teacher/smart-paper',
    redirect: '/teacher/smart-paper/list'
  },
  {
    path: '/teacher/smart-paper/list',
    name: 'TeacherSmartPaperList',
    component: TeacherSmartPaperList,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/smart-paper/generate',
    name: 'TeacherSmartPaperGenerate',
    component: TeacherSmartPaperGenerate,
    meta: { requiresAuth: true, role: 'teacher' }
  },
  {
    path: '/teacher/smart-paper/detail/:paperId',
    name: 'TeacherSmartPaperDetail',
    component: TeacherSmartPaperDetail,
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
      path: '/admin/feedback',
      name: 'AdminFeedback',
      component: () => import('@/views/Admin/AdminFeedback.vue'),
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
