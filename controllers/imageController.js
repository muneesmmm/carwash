// controllers/imageController.js

const multer = require('multer');
const fs = require('fs');
const { processImage } = require('../helpers/imageHelper');

// Configure Multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage }).single('upload');

// Handle image upload
exports.uploadImage = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).send('Error uploading file.');
    }
    try {
      const plateNumber = await processImage(req.file.path);
      res.json({ plateNumber });
      fs.unlinkSync(req.file.path); // Delete the uploaded file
    } catch (error) {
      console.error('Error processing image:', error);
      res.status(500).send('Error processing image.');
    }
  });
};
