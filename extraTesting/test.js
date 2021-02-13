const Queue = require("bull");
const videoQueue = new Queue("video transcoding");
var ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
require('dotenv').config()



const convertVideo = (path) => {
    try {
        const fileName = path.replace(/\.[^/.]+$/, "");
        const convertedFilePath = `${fileName}_${+new Date()}.${"mp3"}`;
        return new Promise((resolve, reject) => {
            ffmpeg(path)
                .setFfmpegPath('../utility/ffmpeg/bin/ffmpeg.exe')
                .setFfprobePath('../utility/ffmpeg/bin/ffprobe.exe')
                .toFormat("mp3")
                .on("start", commandLine => {
                    console.log(`Spawned Ffmpeg with command: ${commandLine}`);
                })
                .on("error", (err, stdout, stderr) => {
                    console.log(err, stdout, stderr);
                    reject(err);
                })
                .on("end", (stdout, stderr) => {
                    console.log(stdout, stderr);
                    resolve({
                        convertedFilePath
                    });
                })
                .saveToFile(`${__dirname}/${convertedFilePath}`);
        });

    } catch (error) {
        console.log(error)
    }

};

convertVideo("./1.mp4").then((res) => {
}).catch((error) => {

    console.log(error)
})


// videoQueue.process(async job => {
//   const { id, path, outputFormat } = job.data;
//   try {
//     const conversions = await models.VideoConversion.findAll({ where: { id } });
//     const conv = conversions[0];
//     if (conv.status == "cancelled") {
//       return Promise.resolve();
//     }
//     const pathObj = await convertVideo(path, outputFormat);
//     const convertedFilePath = pathObj.convertedFilePath;
//     const conversion = await models.VideoConversion.update(
//       { convertedFilePath, status: "done" },
//       {
//         where: { id }
//       }
//     );
//     Promise.resolve(conversion);
//   } catch (error) {
//     Promise.reject(error);
//   }
// });