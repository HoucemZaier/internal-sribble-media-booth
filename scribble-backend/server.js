// declare variables and import required modules

require("dotenv").config(); // Load environment variables from the .env file

const express = require("express"); // Import the Express framework to create the backend server
const cors = require("cors");
const multer = require("multer"); // Import Multer for handling file uploads
const path = require("path"); // Import the path module to handle file and directory paths
const fs = require("fs");
const processVideo = require("./services/processing"); // Import the video processing service
const ffmpeg = require("fluent-ffmpeg");
const minioClient = require("./services/minio"); // Import the Minio client configuration service
const uploadToMinio = require("./services/minioUpload"); // Import the Minio upload service
const generateDownloadUrl = require("./services/generateDownloadUrl"); // Import the service to generate pre-signed URL for downloading from Minio
const runPythonScript = require("./services/pythonRunner"); // Import the service to run the Python script
const QRService = require("./services/QrCode"); // Import the QR code generation service
const uploadVideoToCloudinary = require("./services/uploadCloudinary"); // Import the Cloudinary upload service
const connectDB = require("./config/db"); // Import the database connection service
const authRoutes = require("./routes/auth"); // Import the authentication routes

const app = express(); // Create an instance of the Express application
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes); // use the authentication routes for handling visitor sessions and user authentication

// save the video in uploads folder

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// save the processed video in outputs folder

const outputDir = path.join(__dirname, "outputs");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// file storage configuration for multer

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;

    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// upload endpoint to receive video files and process them

app.post("/upload", upload.single("video"), async (req, res) => {

  try {

    console.log("=== Upload reçu ===");

    console.log(req.file);

    const inputPath = req.file.path;

    const outputPath = `outputs/final-${Date.now()}.mp4`;

    console.log("Input :", inputPath);

    console.log("Output :", outputPath);

    await processVideo(inputPath, outputPath);

    await runPythonScript(outputPath); // Run the Python script after processing the video

    const brandedVideoPath = path.join(__dirname, "outputs", "scribble.mp4"); // Path to the final branded video

    console.log("Vidéo à envoyer vers MinIO :", brandedVideoPath);

    if (!fs.existsSync(brandedVideoPath)) {

      throw new Error("scribble.mp4 introuvable");

    }

    const objectName = await uploadToMinio(brandedVideoPath); // Upload the final branded video to Minio and get the object name

    console.log("ObjectName MinIO :", objectName);

    const publicVideoUrl = await uploadVideoToCloudinary(brandedVideoPath); // Upload the final branded video to Cloudinary and get the public URL

    console.log("Vidéo envoyée à Cloudinary :", publicVideoUrl);

    //const downloadUrl = await generateDownloadUrl(objectName); // Generate a pre-signed URL for downloading the video from Minio

    const qrCode = await QRService(publicVideoUrl); // Generate a QR code for the public Cloudinary URL

    const fileName = path.basename(outputPath); // Get the file name from the output path

    console.log("Traitement terminé");

    console.log("Vidéo envoyée au client :", objectName); // Log the object name of the uploaded video in Minio

    res.json({
      success: true,
      videoUrl: publicVideoUrl, // Send the public Cloudinary URL to the frontend
      publicVideoUrl: publicVideoUrl, // Send the public Cloudinary URL to the frontend
      qrCode: qrCode, // Send the QR code to the frontend
    });

    console.log("Object envoyé :", objectName); // Log the object name of the uploaded video in Minio

    console.log("URL envoyée au frontend :", publicVideoUrl); // Log the pre-signed URL sent to the frontend

    console.log("QR Code généré :", qrCode); // Log the generated QR code

  } 

  catch (error) {

    console.error("ERREUR :");

    console.error(error);

    res.status(500).json({

      error: error.message,

    });
  }
});

// test check Minio connection and list buckets

app.get("/test-minio", async (req, res) => {

  try {

    const buckets = await minioClient.listBuckets();

    res.json(buckets);
  } 
  
  catch (err) {
    console.error(err);

    res.status(500).json(err);
  }
});

connectDB(); // Connect to the MongoDB database

app.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});
