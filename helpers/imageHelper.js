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
        Authorization: 'Token 92c33af5234df67ff1737c9f8f9743a271aa5148', // Replace with your actual API token
        ...formData.getHeaders(), // Include headers from FormData object
      },
      body: formData,
    });

  const data = await response.json();
  return data.results[0]?.plate || null;
};
