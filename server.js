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

const stream = t.stream('statuses/filter', { follow: ['25073877'] })

stream.on('tweet', tweet => {

  const { retweeted, retweeted_status, in_reply_to_status_id, in_reply_to_user_id } = tweet

  if (retweeted || retweeted_status || in_reply_to_status_id || in_reply_to_user_id || tweet.delete) {
    return
  }
  else {
    const URL = `https://twitter.com/realDonaldTrump/status/${tweet.id_str}`
    const picture = screenshot(URL, '1024x768', { delay: 10 })
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

    picture.pipe(upload)
  }
})

app.get('/status', (req, res) => {
  res.send({ status: 'OK' })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log('Watching Trump on port', port)
})
