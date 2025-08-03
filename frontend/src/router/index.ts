import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('@/views/auth/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('@/views/auth/LoginView.vue')
      },
      {
        path: 'register',
        name: 'Register',
        component: () => import('@/views/auth/RegisterView.vue')
      }
    ]
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/assessment',
    name: 'Assessment',
    component: () => import('@/views/assessment/AssessmentLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'chapters',
        name: 'AssessmentChapters',
        component: () => import('@/views/assessment/ChaptersView.vue')
      },
      {
        path: 'test/:id',
        name: 'AssessmentTest',
        component: () => import('@/views/assessment/TestView.vue')
      },
      {
        path: 'result/:id',
        name: 'AssessmentResult',
        component: () => import('@/views/assessment/ResultView.vue')
      }
    ]
  },
  {
    path: '/learning',
    name: 'Learning',
    component: () => import('@/views/learning/LearningLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'overview',
        name: 'LearningOverview',
        component: () => import('@/views/learning/OverviewView.vue')
      },
      {
        path: 'tasks/:id',
        name: 'LearningTasks',
        component: () => import('@/views/learning/TasksView.vue')
      }
    ]
  },
  {
    path: '/practice',
    name: 'Practice',
    component: () => import('@/views/practice/PracticeLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'questions',
        name: 'PracticeQuestions',
        component: () => import('@/views/practice/QuestionsView.vue')
      },
      {
        path: 'mistakes',
        name: 'PracticeMistakes',
        component: () => import('@/views/practice/MistakesView.vue')
      }
    ]
  },
  {
    path: '/progress',
    name: 'Progress',
    component: () => import('@/views/progress/ProgressLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'overview',
        name: 'ProgressOverview',
        component: () => import('@/views/progress/OverviewView.vue')
      },
      {
        path: 'analysis',
        name: 'ProgressAnalysis',
        component: () => import('@/views/progress/AnalysisView.vue')
      }
    ]
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/profile/ProfileLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'info',
        name: 'ProfileInfo',
        component: () => import('@/views/profile/InfoView.vue')
      },
      {
        path: 'settings',
        name: 'ProfileSettings',
        component: () => import('@/views/profile/SettingsView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/auth/login')
  } else if (to.path.startsWith('/auth') && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router