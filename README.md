# converter

> Convert multichannel mkv videos to separate mp3 audio and mp4 video files.

This whole program is essentially a replacement of these two commands:

    ffprobe -show_entries stream=channels .\test.mkv

    ffmpeg -i %1 /
      -map 0:v /
      -c copy %1.video.mp4 /
      -map 0:a:0 %1.audio1.mp3 /
      -map 0:a:1 %1.audio2.mp3

#### Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build


# lint all JS/Vue component files in `src/`
npm run lint

```

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[1c165f7](https://github.com/SimulatedGREG/electron-vue/tree/1c165f7c5e56edaf48be0fbb70838a1af26bb015) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
