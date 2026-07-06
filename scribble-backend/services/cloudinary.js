// this service is used to configure and export the Cloudinary instance for uploading and managing media files in the cloud.

const cloudinary = require("cloudinary").v2;

cloudinary.config({

    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,

    api_key: process.env.CLOUDINARY_API_KEY,

    api_secret: process.env.CLOUDINARY_API_SECRET,

    secure: true

});

module.exports = cloudinary;