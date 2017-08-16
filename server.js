if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const Twit = require('twit')
const fs = require('fs')
const screenshot = require('screenshot-stream')
const AWS = require('aws-sdk')
const zlib = require('zlib')
const s3Stream = require('s3-upload-stream')(new AWS.S3())

const compress = zlib.createGzip()

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
    const upload = s3Stream.upload({
      "Bucket": "watch-trump",
      "Key": `${tweet.id_str}.png`
    })
    stream.pipe(upload)
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log('Watching Trump on port', port)
})
