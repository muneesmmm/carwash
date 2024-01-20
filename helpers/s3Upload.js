// uploadHelper.js

const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
// Configure the AWS SDK with your access credentials and region
const s3Client = new S3Client({
  region: process.env.YOUR_REGION,
  endpoint: `https://s3.${process.env.YOUR_REGION}.amazonaws.com`,
  credentials: {
    accessKeyId: process.env.YOUR_ACCESS_KEY,
    secretAccessKey: process.env.YOUR_SECRET_ACCESS_KEY,
  },
});

// Configure multer to use S3 storage
const upload = multer({
  storage: multer.memoryStorage(),
});

// Upload file to S3 bucket
async function uploadFileToS3(file) {
  try {
    const bucketName = process.env.YOUR_BUCKET_NAME;
    const key = uuidv4(); // Generate a unique key for the uploaded file
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: "public-read", // Set the appropriate ACL for the uploaded files
    };

    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    const fileUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;
    return fileUrl;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to upload file to S3");
  }
}
// async function uploadFileToS3(file) {
//   const uploadParams = {
//     Bucket: 'your-bucket-name',
//     Key: 'file-key', // Replace with your desired file key
//     Body: fs.createReadStream(file.path),
//     ACL: 'public-read', // Set the ACL to 'public-read' for public access
//   };

//   const result = await s3.upload(uploadParams).promise();
//   return result.Location; // Return the URL of the uploaded file
// }

module.exports = { upload, uploadFileToS3 };
