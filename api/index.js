const express = require('express')
const axios = require('axios')
const app = express()

// 基础配置
const BASE_URL = 'https://music.163.com/weapi'  // 修改为 weapi
const DEFAULT_TIMEOUT = 5000

// 创建 axios 实例
const request = axios.create({
  baseURL: BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://music.163.com',
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})

// 搜索接口
app.get('/search', async (req, res) => {
  try {
    const { keywords, limit = 30, offset = 0 } = req.query
    const response = await request.post('/cloudsearch', {
      keywords,
      limit,
      offset,
      type: 1
    })

    // 格式化返回数据
    const songs = response.data.result.songs.map(song => ({
      id: song.id,
      name: song.name,
      artist: song.ar[0].name,
      album: song.al.name,
      cover: song.al.picUrl,
      duration: song.dt / 1000
    }))

    res.json({
      code: 200,
      result: songs
    })
  } catch (error) {
    res.status(500).json({ 
      code: 500,
      msg: 'Search failed',
      error: error.message 
    })
  }
})

// 获取歌曲详情
app.get('/song/detail', async (req, res) => {
  try {
    const { id } = req.query
    const response = await request.post('/v3/song/detail', {
      c: JSON.stringify([{ id }])
    })

    const song = response.data.songs[0]
    res.json({
      code: 200,
      result: {
        id: song.id,
        name: song.name,
        artist: song.ar[0].name,
        album: song.al.name,
        cover: song.al.picUrl,
        duration: song.dt / 1000
      }
    })
  } catch (error) {
    res.status(500).json({ 
      code: 500,
      msg: 'Failed to get song detail' 
    })
  }
})

// 获取歌曲URL
app.get('/song/url', async (req, res) => {
  try {
    const { id } = req.query
    const response = await request.post('/song/enhance/player/url', {
      ids: [id],
      br: 320000
    })

    res.json({
      code: 200,
      result: {
        id: response.data.data[0].id,
        url: response.data.data[0].url,
        br: response.data.data[0].br,
        size: response.data.data[0].size
      }
    })
  } catch (error) {
    res.status(500).json({ 
      code: 500,
      msg: 'Failed to get song URL' 
    })
  }
})

// 获取歌单
app.get('/playlist', async (req, res) => {
  try {
    const { id } = req.query
    const response = await request.post('/v3/playlist/detail', {
      id,
      n: 100000,
      s: 8
    })

    const playlist = response.data.playlist
    res.json({
      code: 200,
      result: {
        id: playlist.id,
        name: playlist.name,
        cover: playlist.coverImgUrl,
        description: playlist.description,
        tracks: playlist.tracks.map(song => ({
          id: song.id,
          name: song.name,
          artist: song.ar[0].name,
          album: song.al.name,
          cover: song.al.picUrl,
          duration: song.dt / 1000
        }))
      }
    })
  } catch (error) {
    res.status(500).json({ 
      code: 500,
      msg: 'Failed to get playlist' 
    })
  }
})

// 获取流派歌曲
app.get('/genre', async (req, res) => {
  try {
    const { type } = req.query
    const response = await request.post('/playlist/highquality/list', {
      cat: type,
      limit: 20,
      offset: 0
    })

    res.json({
      code: 200,
      result: response.data.playlists.map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        cover: playlist.coverImgUrl,
        description: playlist.description,
        playCount: playlist.playCount
      }))
    })
  } catch (error) {
    res.status(500).json({ 
      code: 500,
      msg: 'Failed to get genre songs' 
    })
  }
})

// 健康检查
app.get('/status', (req, res) => {
  res.json({ 
    code: 200,
    status: 'ok' 
  })
})

module.exports = app
