// service generates a pre-signed URL for downloading a file from Minio, allowing clients to securely access the file without exposing direct access to the Minio server

const minioClient = require("./minio");

async function generateDownloadUrl(objectName) {

  const bucketName = "scribble-videos";

  const expiry = 60 * 60 * 24; 

  const url =
    await minioClient.presignedGetObject(
      bucketName,
      objectName,
      expiry
    );

  return url;
}

module.exports = generateDownloadUrl;