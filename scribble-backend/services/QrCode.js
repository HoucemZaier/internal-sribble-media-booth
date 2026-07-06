// qr code generation service to encode the url to base64 image

const QRCode = require("qrcode");

async function generateQRCode(videoUrl) {
    
  const qrCode = await QRCode.toDataURL(videoUrl);

  return qrCode;
}

module.exports = generateQRCode;