const express = require('express')
const axios = require('axios')
const app = express()

// 基础配置
const BASE_URL = 'https://netease-cloud-music-api-rust-phi.vercel.app'  // 使用稳定的第三方 API
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
    const { keywords, limit = 30, offset = 0 } = req.query
    const response = await request.get('/search', {
      params: {
        keywords,
        limit,
        offset,
        type: 1  // 1: 单曲
      }
    })

    // 检查响应数据
    if (!response.data || response.data.code !== 200) {
      throw new Error('Invalid response from music API')
    }

    // 格式化返回数据
    const songs = response.data.result?.songs || []
    const formattedSongs = songs.map(song => ({
      id: song.id,
      name: song.name,
      artist: song.artists?.[0]?.name || '',
      album: song.album?.name || '',
      cover: song.album?.picUrl || '',
      duration: song.duration ? song.duration / 1000 : 0
    }))

    res.json({
      code: 200,
      result: formattedSongs
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

// 获取歌曲详情
app.get('/song/detail', async (req, res) => {
  try {
    const { id } = req.query
    const response = await request.get('/song/detail', {
      params: {
        ids: id
      }
    })

    const song = response.data?.songs?.[0]
    if (!song) {
      throw new Error('Song not found')
    }

    res.json({
      code: 200,
      result: {
        id: song.id,
        name: song.name,
        artist: song.artists?.[0]?.name || '',
        album: song.album?.name || '',
        cover: song.album?.picUrl || '',
        duration: song.duration ? song.duration / 1000 : 0
      }
    })
  } catch (error) {
    console.error('Get song detail error:', error)
    res.status(500).json({ 
      code: 500,
      msg: 'Failed to get song detail',
      error: error.message
    })
  }
})

// 获取歌曲URL
app.get('/song/url', async (req, res) => {
  try {
    const { id } = req.query
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
      result: {
        id: data.id,
        url: data.url,
        br: data.br,
        size: data.size
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

// 获取歌单
app.get('/playlist', async (req, res) => {
  try {
    const { id } = req.query
    const response = await request.get('/playlist/detail', {
      params: { id }
    })

    const playlist = response.data?.playlist
    if (!playlist) {
      throw new Error('Playlist not found')
    }

    res.json({
      code: 200,
      result: {
        id: playlist.id,
        name: playlist.name,
        cover: playlist.coverImgUrl,
        description: playlist.description,
        tracks: (playlist.tracks || []).map(song => ({
          id: song.id,
          name: song.name,
          artist: song.artists?.[0]?.name || '',
          album: song.album?.name || '',
          cover: song.album?.picUrl || '',
          duration: song.duration ? song.duration / 1000 : 0
        }))
      }
    })
  } catch (error) {
    console.error('Get playlist error:', error)
    res.status(500).json({ 
      code: 500,
      msg: 'Failed to get playlist',
      error: error.message
    })
  }
})

// 获取流派歌曲
app.get('/genre', async (req, res) => {
  try {
    const { type } = req.query
    const response = await request.get('/playlist/highquality', {
      params: {
        cat: type,
        limit: 20
      }
    })

    const playlists = response.data?.playlists
    if (!playlists) {
      throw new Error('No playlists found for this genre')
    }

    res.json({
      code: 200,
      result: playlists.map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        cover: playlist.coverImgUrl,
        description: playlist.description,
        playCount: playlist.playCount
      }))
    })
  } catch (error) {
    console.error('Get genre songs error:', error)
    res.status(500).json({ 
      code: 500,
      msg: 'Failed to get genre songs',
      error: error.message
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
