# Video Channel Splitter

Separates audio and video channels from a single file to separate video and audio files.

This whole program is essentially a replacement of these two commands, but slightly more flexible:

    ffprobe -show_entries stream=channels .\test.mkv

    ffmpeg -i %1 /
      -map 0:v /
      -c copy %1.video.mp4 /
      -map 0:a:0 %1.audio1.mp3 /
      -map 0:a:1 %1.audio2.mp3

## Installation & ffmpeg

You will need to install [ffmpeg and ffprobe](https://www.ffmpeg.org/download.html). The following files *must* exist:

    C:\Program Files\ffmpeg\bin\ffmpeg.exe
    C:\Program Files\ffmpeg\bin\ffprobe.exe

## Limits

 1. The video channel will be exported to an mp4 container and maintain the original video codec.
 2. Audio channels will be converted to mp3.

## Todo

* Choosing which channels to export.
* Choose output codecs

## Build Setup for Development

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
