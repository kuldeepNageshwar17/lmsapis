const Queue = require("bull");
const videoQueue = new Queue("video transcoding");
var ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
require('dotenv').config()



const convertVideo = (path  ) => {
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
        console.log("error : "  , error)
    }
};

convertVideo('../public/uploads/CourseContent/5f90078a13df2e0b38e24faf/7b10e01a-8763-48b2-9f34-2b2486ce72994. Real-World SPAs &.mp4').then((Res) => {
    console.log(Res.convertedFilePath)
}).catch((Error) => {
    console.log(Error)
})
