const { createServer } = require('http')
const express = require('express')
const { createWebAPIRequest } = require('../util/util')

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

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
      res.send(music_res)
    },
    err => res.status(502).send('fetch error')
  )
})

// 获取歌曲详情
app.get('/song/detail', (req, res) => {
  const { ids } = req.query
  const cookie = req.get('Cookie') ? req.get('Cookie') : ''
  const data = {
    csrf_token: '',
    ids: [ids]
  }

  createWebAPIRequest(
    'music.163.com',
    '/weapi/v3/song/detail',
    'POST',
    data,
    cookie,
    (music_req, music_res) => {
      res.send(music_res)
    },
    err => res.status(502).send('fetch error')
  )
})

// 获取歌曲URL
app.get('/song/url', (req, res) => {
  const { id } = req.query
  const cookie = req.get('Cookie') ? req.get('Cookie') : ''
  const data = {
    ids: [id],
    br: 320000,
    csrf_token: ''
  }

  createWebAPIRequest(
    'music.163.com',
    '/weapi/song/enhance/player/url',
    'POST',
    data,
    cookie,
    (music_req, music_res) => {
      res.send(music_res)
    },
    err => res.status(502).send('fetch error')
  )
})

module.exports = app
