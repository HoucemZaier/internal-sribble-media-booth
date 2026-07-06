// handle video uploads to Minio object storage server.

const minioClient = require("./minio");
const path = require("path");

async function uploadToMinio(filePath) {

  const bucketName = "scribble-videos";
  
  const objectName = "scribble.mp4"; // the name of the file in Minio will be the same as the local file name

  console.log("Uploading:", objectName);

  await minioClient.fPutObject(
    bucketName,
    objectName,
    filePath
  );

  return objectName;
}

module.exports = uploadToMinio;