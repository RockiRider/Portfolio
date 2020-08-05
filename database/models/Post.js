const mongoose = require('mongoose')
const moment = require('moment-timezone');

//Check this timezone thing out
const now = moment.tz(Date.now(),'Europe/London');


const PostSchema = new mongoose.Schema({
  title: String,
  description: String,
  content: Object,
  subject: String,
  image: String,
  createdAt: {
    type: Date,
    default: now
  }
})
 
const Post = mongoose.model('Post', PostSchema)
 
module.exports = Post