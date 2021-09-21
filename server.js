const express = require("express");
const app = express();

const fs = require("fs");

const port = process.env.PORT || 5555;

app.use(express.static(__dirname + "/src/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/src/public/index.html");
});

// video sending
app.get("/video", (req, res) => {
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires range header");
  }

  //   get video stats
  const videoPath = __dirname + "/videos/SampleVideo_1280x720_1mb.mp4";
  const videoSize = fs.statSync(videoPath).size;

  const CHUNK_SIZE = 10 ** 6;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  //   create headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-range": `bytes ${start}-${end}/${videoSize}`,
    "Content-length": contentLength,
    "Accept-Ranges": "bytes",
    "Content-Type": "video/mp4",
  };

  res.writeHead(206, headers);

  const videoStream = fs.createReadStream(videoPath, { start, end });

  videoStream.pipe(res);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
