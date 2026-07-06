// this service is responsible for uploading videos to Cloudinary

const cloudinary = require("./cloudinary");

async function uploadVideoToCloudinary(filePath) {

    const result = await cloudinary.uploader.upload(

        filePath,

        {

            resource_type: "video",

            folder: "scribble-booth"

        }

    );

    return result.secure_url;

}

module.exports = uploadVideoToCloudinary;