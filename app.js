const express = require('express')
const http = require('http')
const cors = require('cors')
const socketIo = require('socket.io')
const mongoose = require('mongoose')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const chatRoutes = require('./routes/chat')
const Message = require('./models/Message') // Import the model

const app = express()
const server = http.createServer(app)
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

// Middleware
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))
app.use(express.static('public'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/chat', chatRoutes)

// Socket.IO
io.on('connection', socket => {
  console.log('User connected')

  socket.on('joinRoom', async (hostel) => {
    socket.join(hostel)

    // Send previous 50 messages
    const messages = await Message.find({ hostel }).sort({ timestamp: 1 }).limit(50)
    socket.emit('previousMessages', messages)
  })

  socket.on('chatMessage', async ({ hostel, message, user, imageUrl }) => {
    const newMsg = new Message({ hostel, message, user, imageUrl })
    await newMsg.save()

    io.to(hostel).emit('message', {
      user,
      message,
      imageUrl,
      timestamp: newMsg.timestamp
    })

    // Keep only latest 50 messages
    const count = await Message.countDocuments({ hostel })
    if (count > 50) {
      const extra = count - 50
      const oldMsgs = await Message.find({ hostel }).sort({ timestamp: 1 }).limit(extra)
      const oldIds = oldMsgs.map(msg => msg._id)
      await Message.deleteMany({ _id: { $in: oldIds } })
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected')
  })
})

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))

// Start server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
