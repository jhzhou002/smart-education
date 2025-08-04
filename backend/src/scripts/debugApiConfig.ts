import { config } from 'dotenv'

config()

console.log('🔧 [CONFIG DEBUG] 环境变量调试:')
console.log('KIMI_API_KEY:', process.env.KIMI_API_KEY ? `${process.env.KIMI_API_KEY.substring(0, 10)}...` : '未设置')
console.log('KIMI_BASE_URL:', process.env.KIMI_BASE_URL)
console.log('NODE_ENV:', process.env.NODE_ENV)

const KIMI_BASE_URL = process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1'
console.log('实际使用的BASE_URL:', KIMI_BASE_URL)

// 测试URL拼接
const testEndpoint = '/v1/chat/completions'
const fullURL = `${KIMI_BASE_URL}${testEndpoint}`
console.log('完整的请求URL:', fullURL)

// 测试axios配置
import axios from 'axios'

const apiClient = axios.create({
  baseURL: KIMI_BASE_URL,
  timeout: 30000
})

console.log('axios baseURL配置:', apiClient.defaults.baseURL)

// 构建测试请求URL
const testUrl = apiClient.getUri({ url: testEndpoint })
console.log('axios生成的完整URL:', testUrl)