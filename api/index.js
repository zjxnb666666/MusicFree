const express = require('express')
const axios = require('axios')
const app = express()

// 基础配置
const BASE_URL = 'https://musicfreepluginshub.2020818.xyz'  // MusicFree 官方 API
const DEFAULT_TIMEOUT = 5000

// 创建 axios 实例
const request = axios.create({
  baseURL: BASE_URL,
  timeout: DEFAULT_TIMEOUT
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
    const { platform = 'netease', keyword, page = 1, pageSize = 30 } = req.query
    
    // 使用 MusicFree 插件 API
    const response = await request.get('/search', {
      params: {
        platform,
        keyword,
        page,
        pageSize
      }
    })

    if (!response.data || response.data.code !== 200) {
      throw new Error('Invalid response from API')
    }

    res.json(response.data)  // 直接返回 MusicFree 格式的数据
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ 
      code: 500,
      msg: 'Search failed',
      error: error.message 
    })
  }
})

// 获取歌曲URL
app.get('/song/url', async (req, res) => {
  try {
    const { platform = 'netease', id } = req.query
    
    const response = await request.get('/song/url', {
      params: {
        platform,
        id
      }
    })

    if (!response.data || response.data.code !== 200) {
      throw new Error('Invalid response from API')
    }

    res.json(response.data)  // 直接返回 MusicFree 格式的数据
  } catch (error) {
    console.error('Get song URL error:', error)
    res.status(500).json({ 
      code: 500,
      msg: 'Failed to get song URL',
      error: error.message
    })
  }
})

// 获取歌单
app.get('/playlist', async (req, res) => {
  try {
    const { platform = 'netease', id } = req.query
    
    const response = await request.get('/playlist', {
      params: {
        platform,
        id
      }
    })

    if (!response.data || response.data.code !== 200) {
      throw new Error('Invalid response from API')
    }

    res.json(response.data)  // 直接返回 MusicFree 格式的数据
  } catch (error) {
    console.error('Get playlist error:', error)
    res.status(500).json({ 
      code: 500,
      msg: 'Failed to get playlist',
      error: error.message
    })
  }
})

// 健康检查
app.get('/status', (req, res) => {
  res.json({ 
    code: 200,
    msg: 'success',
    data: { status: 'ok' }
  })
})

module.exports = app 
