const express = require('express')
const { createWebAPIRequest } = require('../util/util')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// 添加错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    code: 500,
    msg: 'Internal Server Error',
    error: err.message
  })
})

// 添加CORS支持
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  next()
})

// 搜索接口
app.get('/search', (req, res) => {
  const { keywords, limit = 30, offset = 0 } = req.query
  const cookie = req.get('Cookie') ? req.get('Cookie') : ''
  const data = {
    csrf_token: '',
    limit,
    type: 1,
    s: keywords,
    offset
  }

  createWebAPIRequest(
    'music.163.com',
    '/weapi/search/get',
    'POST',
    data,
    cookie,
    (music_req, music_res) => {
      try {
        res.json(JSON.parse(music_res))
      } catch (e) {
        res.status(500).json({ error: 'Parse Error' })
      }
    },
    err => res.status(502).json({ error: 'API Error', message: err.message })
  )
})

// ... 其他接口保持不变

module.exports = app
