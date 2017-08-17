const moment = require('moment')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TweetSchema = new Schema({
  text: { type: String, default: '' },
  image: { type: String, default: '' },
  tweetId: { type: String, required: true }
}, { timestamps: true })

TweetSchema.virtual('date').get(() => {
  return moment(this.createdAt).format('dddd, MMM Do, YYYY')
})

const ModelClass = mongoose.model('tweet', TweetSchema)
module.exports = ModelClass
