if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}
const path = require('path')
const express = require('express')
const app = express()
const Twit = require('twit')
const fs = require('fs')
const screenshot = require('screenshot-stream')
const AWS = require('aws-sdk')
const s3Stream = require('s3-upload-stream')(new AWS.S3())
const mongoose = require('mongoose')

const Tweet = require('./models/Tweet')

mongoose.connect(process.env.MONGODB_URI)

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

    upload.on('uploaded', ({ Location }) => {
      console.log('image successfully uploaded')

      const saveNewTweet = new Tweet({
        text: tweet.text,
        image: Location,
        tweetId: tweet.id_str
      })

      saveNewTweet.save(err => {
        if (err) {
          console.log('Error saving tweet to database', err)
        }
        else {
          console.log('Success saving tweet to database')
        }
      })
    })

    upload.on('error', error => {
      console.log('error uploading', error)
    })

    picture.pipe(upload)
  }
})

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/', require('./routes'))

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log('Watching Trump on port', port)
})
