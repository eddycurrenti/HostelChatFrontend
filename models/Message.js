const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  hostel: String,
  user: String,
  message: String,
  imageUrl: String,
  timestamp: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Message', messageSchema)
