// helpers/imageHelper.js

const fetch = require('node-fetch');
const fs = require('fs');
const FormData = require('form-data');

// Function to recognize plate number using Plate Recognizer API
exports.processImage = async (imagePath) => {
    const formData = new FormData();
    formData.append('upload', fs.createReadStream(imagePath));
    formData.append('regions', 'in'); // Change to your country
  
    const response = await fetch('https://api.platerecognizer.com/v1/plate-reader/', {
      method: 'POST',
      headers: {
        Authorization: 'Token 0e9f2a5a6cf1a34de6817cc72f6824cf4f265aa5', // Replace with your actual API token
        ...formData.getHeaders(), // Include headers from FormData object
      },
      body: formData,
    });

  const data = await response.json();
  return data.results[0]?.plate || 'Plate not found';
};
