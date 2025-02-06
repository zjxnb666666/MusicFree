const crypto = require('crypto')
const request = require('request')

function createWebAPIRequest(host, path, method, data, cookie, callback, errorcallback) {
  let music_req = ''
  const cryptoreq = Encrypt(data)
  const http_client = request.defaults({ timeout: 5000 })
  const options = {
    url: `http://${host}${path}`,
    method: method,
    headers: {
      Accept: '*/*',
      'Accept-Language': 'zh-CN,zh;q=0.8,gl;q=0.6,zh-TW;q=0.4',
      Connection: 'keep-alive',
      'Content-Type': 'application/x-www-form-urlencoded',
      Referer: 'http://music.163.com',
      Host: 'music.163.com',
      Cookie: cookie,
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1'
    },
    form: {
      params: cryptoreq.params,
      encSecKey: cryptoreq.encSecKey
    }
  }

  http_client(options, function(error, res, body) {
    if (error) {
      console.error(error)
      errorcallback(error)
    } else {
      callback(res, body)
    }
  })
}

function Encrypt(obj) {
  const key = '0CoJUm6Qyw8W8jud'
  const iv = '0102030405060708'
  const crypted = {}
  
  let text = JSON.stringify(obj)
  let secretKey = randomString(16)
  
  const cipher1 = crypto.createCipheriv('aes-128-cbc', key, iv)
  let enc1 = cipher1.update(text, 'utf8', 'base64')
  enc1 += cipher1.final('base64')
  
  const cipher2 = crypto.createCipheriv('aes-128-cbc', secretKey, iv)
  let enc2 = cipher2.update(enc1, 'utf8', 'base64')
  enc2 += cipher2.final('base64')
  
  crypted.params = enc2
  crypted.encSecKey = aesRsaEncrypt(secretKey)
  
  return crypted
}

function randomString(length) {
  const text = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let result = ''
  for (let i = length; i > 0; --i) 
    result += text[Math.floor(Math.random() * text.length)]
  return result
}

function aesRsaEncrypt(text) {
  const modulus = '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7'
  const pubKey = '010001'
  
  text = text.split('').reverse().join('')
  const biText = BigInt('0x' + Buffer.from(text).toString('hex'))
  const biEx = BigInt('0x' + pubKey)
  const biMod = BigInt('0x' + modulus)
  const biRet = power(biText, biEx, biMod)
  
  return biRet.toString(16).padStart(256, '0')
}

function power(x, y, p) {
  let res = 1n
  x = x % p
  while (y > 0n) {
    if (y & 1n) res = (res * x) % p
    y = y >> 1n
    x = (x * x) % p
  }
  return res
}

module.exports = {
  createWebAPIRequest
}
