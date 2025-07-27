const express = require('express')
const multer = require('multer')
const router = express.Router()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + file.originalname
    cb(null, unique)
  }
})

const upload = multer({ storage })

router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).send('No image uploaded')
  res.json({ imageUrl: `/uploads/${req.file.filename}` })
})

module.exports = router
