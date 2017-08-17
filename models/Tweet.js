const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TweetSchema = new Schema({
  text: { type: String, default: '' },
  image: { type: String, default: '' }
}, { timestamps: true })

const ModelClass = mongoose.model('tweet', TweetSchema)
module.exports = ModelClass
