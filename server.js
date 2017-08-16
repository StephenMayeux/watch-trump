if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const Twit = require('twit')
const fs = require('fs')
const screenshot = require('screenshot-stream')

const t = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

const stream = t.stream('user', 'eslHipHop')

stream.on('tweet', tweet => {
  const { user } = tweet
  if (user.id_str === '1360915363') {
    const URL = `https://twitter.com/eslHipHop/status/${tweet.id_str}`
    const stream = screenshot(URL, '1024x768')
    stream.pipe(fs.createWriteStream(`${tweet.id_str}.png`))
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log('Watching Trump on port', port)
})
