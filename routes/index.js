const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Tweet = require('../models/Tweet')
const paginate = require('paginate')({
  mongoose: mongoose
})

router.get('/', (req, res) => {
  const { page } = req.query
  const pageNumber = page ? page : '1'

  Tweet.find({}).paginate({ page }, (err, tweets) => {
    if (err) {
      res.render('error', { msg: 'Whoops! Error fetching data. Please try again later.' })
    }
    else {
      const pagination = paginate.page(tweets.length, 5, pageNumber)
      const paginationHTML = pagination.render({ baseUrl: '/' })
      res.render('index', { tweets, paginationHTML })
    }
  })
})

module.exports = router
