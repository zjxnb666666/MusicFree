const express = require('express')
const axios = require('axios')
const app = express()

// 基础配置
const BASE_URL = 'https://netease-cloud-music-api-rust-phi.vercel.app'  // 使用第三方 API
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
    const response = await request.get('/search', {
      params: {
        keywords: keyword,
        limit: pageSize,
        offset: (page - 1) * pageSize,
        type: 1
      }
    })

    // 检查响应数据
    if (!response.data || response.data.code !== 200) {
      throw new Error('Invalid response from music API')
    }

    // 格式化返回数据为 MusicFree 格式
    const songs = response.data.result?.songs || []
    const formattedSongs = songs.map(song => ({
      id: song.id,
      title: song.name,
      artist: song.artists?.[0]?.name || '',
      artwork: song.album?.picUrl || '',
      album: song.album?.name || '',
      url: '', // URL 需要通过 /song/url 接口获取
      duration: song.duration ? Math.floor(song.duration / 1000) : 0,
      platform: 'netease'
    }))

    res.json({
      code: 200,
      msg: 'success',
      data: formattedSongs
    })
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
        id,
        br: 320000
      }
    })

    const data = response.data?.data?.[0]
    if (!data || !data.url) {
      throw new Error('Song URL not found')
    }

    res.json({
      code: 200,
      msg: 'success',
      data: {
        url: data.url,
        size: data.size,
        br: data.br,
        platform: 'netease'
      }
    })
  } catch (error) {
    console.error('Get song URL error:', error)
    res.status(500).json({ 
      code: 500,
      msg: 'Failed to get song URL',
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
