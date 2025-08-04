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
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/DashboardView.vue')
      },
      {
        path: 'assessment/chapters',
        name: 'AssessmentChapters',
        component: () => import('@/views/assessment/ChaptersView.vue')
      },
      {
        path: 'assessment/test/:id',
        name: 'AssessmentTest',
        component: () => import('@/views/assessment/TestView.vue')
      },
      {
        path: 'assessment/result/:id',
        name: 'AssessmentResult',
        component: () => import('@/views/assessment/ResultView.vue')
      },
      {
        path: 'learning/overview',
        name: 'LearningOverview',
        component: () => import('@/views/learning/OverviewView.vue')
      },
      {
        path: 'learning/tasks/:id',
        name: 'LearningTasks',
        component: () => import('@/views/learning/TasksView.vue')
      },
      {
        path: 'practice/questions',
        name: 'PracticeQuestions',
        component: () => import('@/views/practice/QuestionsView.vue')
      },
      {
        path: 'practice/mistakes',
        name: 'PracticeMistakes',
        component: () => import('@/views/practice/MistakesView.vue')
      },
      {
        path: 'progress/overview',
        name: 'ProgressOverview',
        component: () => import('@/views/progress/OverviewView.vue')
      },
      {
        path: 'progress/analysis',
        name: 'ProgressAnalysis',
        component: () => import('@/views/progress/AnalysisView.vue')
      },
      {
        path: 'profile/info',
        name: 'ProfileInfo',
        component: () => import('@/views/profile/InfoView.vue')
      },
      {
        path: 'profile/settings',
        name: 'ProfileSettings',
        component: () => import('@/views/profile/SettingsView.vue')
      },
      {
        path: 'debug/ai',
        name: 'AIDebug',
        component: () => import('@/views/debug/AIDebugView.vue')
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