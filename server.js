if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const Twit = require('twit')
const fs = require('fs')
const screenshot = require('screenshot-stream')
const AWS = require('aws-sdk')
const s3Stream = require('s3-upload-stream')(new AWS.S3())

const t = new Twit({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

const stream = t.stream('user', 'realDonaldTrump')

stream.on('tweet', tweet => {
  console.log('Tweet activity has happened', { user: tweet.user.id_str })

  const { user } = tweet
  const URL = `https://twitter.com/realDonaldTrump/status/${tweet.id_str}`
  const stream = screenshot(URL, '1024x768', { delay: 3 })
  const upload = s3Stream.upload({
    "Bucket": "watch-trump",
    "Key": `${tweet.id_str}.png`
  })

  upload.on('uploaded', fileMeta => {
    console.log('image successfully uploaded', fileMeta)
  })

  upload.on('error', error => {
    console.log('error uploading', error)
  })

  stream.pipe(upload)

})

app.get('/status', (req, res) => {
  res.send({ status: 'OK' })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log('Watching Trump on port', port)
})
