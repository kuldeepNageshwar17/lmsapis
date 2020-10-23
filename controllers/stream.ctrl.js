const express = require('express')
const fs = require('fs')

GetStream = async (req, res) => {
  try {
    // var path = "movie.mp4";
    var { path,courseId } = req.params
     var finalPath = './public/uploads/CourseContent/'+courseId+"/" + path
    // var finalPath = './public/uploads/CourseContent/test.mp4'
    fs.stat(finalPath, (err, stat) => {
      // Handle file not found
      if (err !== null && err.code === 'ENOENT') {
        res.sendStatus(404)
      }
      const fileSize = stat.size
      // const range = "bytes=0-1000000"
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-')

        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1   
        const chunksize = end - start + 1
        const file = fs.createReadStream(finalPath, { start, end })
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4'
        }

        res.writeHead(206, head)
        file.pipe(res)
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4'
        }

        res.writeHead(200, head)
        fs.createReadStream(finalPath).pipe(res)
      }
    })
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  GetStream
}
