const ffmpeg = require("fluent-ffmpeg");

function processVideo(inputPath, outputPath) {

  return new Promise((resolve, reject) => {

    console.log("INPUT :", inputPath);
    console.log("OUTPUT :", outputPath);

    ffmpeg(inputPath)

      .videoCodec("libx264")

      .format("mp4")

      .on("start", (commandLine) => {
        console.log("Commande FFmpeg :");
        console.log(commandLine);
      })

      .on("progress", (progress) => {
        console.log("Progress :", progress.percent);
      })

      .on("end", () => {

        console.log("Traitement terminé");

        resolve(outputPath);

      })

      .on("error", (err) => {

        console.error("Erreur FFmpeg :");

        console.error(err);

        reject(err);

      })

      .save(outputPath);

  });

}

module.exports = processVideo;