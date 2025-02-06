const express = require('express')
const axios = require('axios')
const app = express()

// 基础配置
const BASE_URL = 'https://music.163.com/api'
const DEFAULT_TIMEOUT = 5000

// 创建 axios 实例
const request = axios.create({
  baseURL: BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://music.163.com'
  }
})

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({
    code: 500,
    message: 'Internal Server Error',
    error: err.message
  })
})

// 搜索接口
app.get('/search', async (req, res) => {
  try {
    const { keywords, limit = 30 } = req.query
    const response = await request.get('/search/suggest', {
      params: { keywords, limit }
    })
    res.json(response.data)
  } catch (error) {
    res.status(500).json({ error: 'Search failed' })
  }
})

// 健康检查
app.get('/status', (req, res) => {
  res.json({ status: 'ok' })
})

module.exports = app
