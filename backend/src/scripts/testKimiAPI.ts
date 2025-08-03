import axios from 'axios'
import { config } from 'dotenv'

config()

const KIMI_API_KEY = process.env.KIMI_API_KEY
const KIMI_BASE_URL = process.env.KIMI_BASE_URL || 'https://api.moonshot.ai/v1'

console.log('Kimi API Key:', KIMI_API_KEY ? `${KIMI_API_KEY.substring(0, 10)}...` : '未设置')
console.log('Kimi Base URL:', KIMI_BASE_URL)

async function testKimiAPI() {
  try {
    console.log('测试Kimi API连接...')
    
    // 尝试不同的端点配置
    const endpoints = [
      '/chat/completions'
    ]
    
    const models = ['moonshot-v1-8k', 'moonshot-v1-32k']
    
    for (const endpoint of endpoints) {
      for (const model of models) {
        try {
          console.log(`\n尝试端点: ${KIMI_BASE_URL}${endpoint}`)
          console.log(`尝试模型: ${model}`)
          
          const response = await axios.post(`${KIMI_BASE_URL}${endpoint}`, {
            model: model,
            messages: [
              {
                role: 'user',
                content: '你好，请回复"测试成功"'
              }
            ],
            max_tokens: 50
          }, {
            headers: {
              'Authorization': `Bearer ${KIMI_API_KEY}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          })
          
          console.log('✅ 成功！响应:', response.data.choices[0]?.message?.content)
          return { endpoint, model, success: true }
          
        } catch (error: any) {
          console.log('❌ 失败:', error.response?.status, error.response?.statusText)
          if (error.response?.data) {
            console.log('错误详情:', error.response.data)
          }
          if (error.message) {
            console.log('错误消息:', error.message)
          }
        }
      }
    }
    
    console.log('\n❌ 所有配置都失败了')
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testKimiAPI()