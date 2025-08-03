// 用户相关类型
export interface User {
  id: number
  username: string
  email: string
  phone?: string
  name: string
  school?: string
  grade: '高一' | '高二' | '高三'
  avatar_url?: string
  created_at: string
  updated_at: string
  last_login?: string
  status: 'active' | 'inactive' | 'banned'
}

export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  username: string
  email: string
  password: string
  name: string
  phone?: string
  school?: string
  grade: '高一' | '高二' | '高三'
}

// 章节和知识点类型
export interface Topic {
  id: number
  chapter_id: number
  name: string
  description?: string
  difficulty: '基础' | '中等' | '困难'
  order_index: number
  is_active: boolean
  created_at: string
}

export interface Chapter {
  id: number
  name: string
  description?: string
  order_index: number
  grade: '高一' | '高二' | '高三'
  is_active: boolean
  created_at: string
  topics?: Topic[]
}

// 测试相关类型
export interface Assessment {
  id: number
  user_id: number
  chapter_id: number
  total_questions: number
  correct_answers: number
  score: number
  time_spent: number
  completed_at: string
  chapter?: Chapter
}

export interface AssessmentQuestion {
  id: number
  assessment_id: number
  question_text: string
  question_type: '单选' | '多选' | '填空' | '解答'
  options?: any
  correct_answer: string
  user_answer?: string
  is_correct: boolean
  kimi_question_id?: string
  created_at: string
}

// 学习计划类型
export interface LearningPlan {
  id: number
  user_id: number
  title: string
  description?: string
  start_date: string
  end_date: string
  target_score?: number
  status: 'active' | 'completed' | 'paused'
  created_at: string
  updated_at: string
  tasks?: LearningTask[]
}

export interface LearningTask {
  id: number
  plan_id: number
  chapter_id: number
  topic_id?: number
  title: string
  description?: string
  target_date: string
  estimated_time?: number
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  completed_at?: string
  created_at: string
  chapter?: Chapter
  topic?: Topic
}

// 练习题类型
export interface PracticeQuestion {
  id: number
  topic_id: number
  question_text: string
  question_type: '单选' | '多选' | '填空' | '解答'
  difficulty: '基础' | '中等' | '困难'
  options?: any
  correct_answer: string
  solution?: string
  kimi_question_id?: string
  usage_count: number
  correct_rate: number
  created_at: string
  topic?: Topic
}

export interface PracticeRecord {
  id: number
  user_id: number
  question_id: number
  user_answer?: string
  is_correct: boolean
  time_spent?: number
  attempt_count: number
  created_at: string
  question?: PracticeQuestion
}

// 学习进度类型
export interface LearningProgress {
  id: number
  user_id: number
  chapter_id: number
  topic_id?: number
  mastery_level: number
  practice_count: number
  correct_count: number
  last_practice?: string
  weak_points?: any
  updated_at: string
  chapter?: Chapter
  topic?: Topic
}

// API 响应类型
export interface ApiResponse<T = any> {
  message: string
  data?: T
  token?: string
  user?: User
}

// 分页类型
export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: Pagination
}