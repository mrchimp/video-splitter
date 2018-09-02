<template>
  <div>
    <div class="tabs is-medium">
      <ul>
        <li :class="{'is-active': tab === 0}"><a @click="showMainTab">Main Bits</a></li>
        <li :class="{'is-active': tab === 1}"><a @click="showFfmpegTab">ffmpeg</a></li>
      </ul>
    </div>
    <div class="container" v-if="tab === 0">
      <div class="columns is-multiline">
        <div class="column is-half">
          <section class="section" v-if="!inProgress">
            <h2 class="title is-3">Input</h2>
            <div class="field">
              <button class="button is-primary" @click="onChooseInput">Choose input file</button>
              <span v-if="inputFile" class="has-text-success">{{ inputFile }}</span>
              <span v-else class="has-text-danger">Choose an input file</span>
              <span v-if="parsingInput" class="has-text-danger">Wait a second. Parsing input file...</span>
            </div>

            <div v-if="audioChannels.length > 0 && videoChannels.length > 0">
              <table class="table" v-if="audioChannels.length > 0">
                <tr><th>Audio Channels</th></tr>
                <tr v-for="audioChannel in audioChannels">
                  <td>{{ audioChannel.tags.title ? audioChannel.tags.title : `Channel ${audioChannel.index}` }}</td>
                </tr>
              </table>
              <table class="table" v-if="videoChannels.length > 0">
                <tr><th>Video Channels</th></tr>
                <tr v-for="videoChannel in videoChannels">
                  <td>Channel {{ videoChannel.index }}</td>
                </tr>
                <tr v-if="videoChannels.length > 1">
                  <td class="has-text-danger">Only the first video channel will be exported.</td>
                </tr>
              </table>
            </div>
            <div class="has-text-danger" v-else-if="inputFile">
              No audio channels or no video channels found.
            </div>
          </section>
        </div>

        <div class="column is-half">
          <section class="section" v-if="!inProgress">
            <h2 class="title is-3">Output</h2>
            <div class="field">
              <button class="button is-primary" @click="onChooseOutput">Choose output filename</button>
              <span v-if="outputFile" class="has-text-success">{{ outputFile }}</span>
              <span v-else class="has-text-danger">Choose an output file</span>
              <div class="help">Exclude file extensions - these will be added automatically. E.g. <code>C:/output</code> would create <code>output.audio.1.mp3</code>, <code>output.audio.2.mp3</code> and <code>output.video.mp4</code>.</div>
            </div>
          </section>
        </div>

        <div class="column is-half">
          <section class="section" v-if="progress !== null">
            <h2 class="title is-3">Running...</h2>
            <div>Progress: {{progress.percent}}%</div>
            <div>FPS: {{progress.currentFps}}</div>
            <div>Kbps: {{progress.currentKbps}}</div>
            <div>Frames: {{progress.frames}}</div>
            <div>Target Size: {{progress.targetSize}}</div>
            <div>Timemark: {{progress.timemark}}</div>
            <progress class="progress is-primary" :value="progress.percent" max="100">{{ progress }}%</progress>
          </section>
        </div>

        <div class="column is-half">
          <section class="section">
            <h1 class="title is-1 has-text-success" v-if="done">Done!</h1>
            <div v-if="endTime">
              That took {{ (endTime - startTime) / 1000 }}s.
            </div>
            <div class="field" v-if="!inProgress">
              <button class="button is-primary" @click="onConvert" :disabled="!canRun">Go!</button>
            </div>
          </section>
        </div>
      </div>
    </div>
    <div v-if="tab === 1">
      <section class="section">
        <div class="field">
          <label for="ffmpegPath" class="label">ffmpeg path</label>
          <div class="control">
            <input type="text" class="input" v-model="ffmpegPath" id="ffmpegPath">
            <div class="help is-danger" v-if="!ffmpegPathExists">ffmpeg can't be found</div>
          </div>
        </div>
        <div class="field">
          <label for="ffprobePath" class="label">ffprobe path</label>
          <div class="control">
            <input type="text" class="input" v-model="ffprobePath" id="ffprobePath">
            <div class="help is-danger" v-if="!ffprobePathExists">ffprobe can't be found</div>
          </div>
        </div>
        <div class="field">
          <button class="button" @click="setFfmpegPaths">Save Paths</button>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
const remote = require('electron').remote;
const dialog = remote.dialog;
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

export default {
  data() {
    return {
      tab: 0,
      ffmpegPath: 'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
      ffprobePath: 'C:\\Program Files\\ffmpeg\\bin\\ffprobe.exe',
      ffmpegPathExists: false,
      ffprobePathExists: false,
      audioChannels: [],
      videoChannels: [],
      inputFile: '',
      outputFile: '',
      progress: null,
      parsingInput: false,
      done: false,
      startTime: null,
      endTime: null,
      inProgress: false,
    };
  },

  created() {
    this.setFfmpegPaths();
  },

  methods: {
    onChooseInput() {
      dialog.showOpenDialog((fileNames) => {
        if (!fileNames) {
          return;
        }

        this.inputFile = fileNames[0];
        this.parsingInput = true;
        this.audioChannels = [];
        this.videoChannels = [];
        ffmpeg.ffprobe(this.inputFile, this.onMetaData);
      });
    },

    onChooseOutput() {
      dialog.showSaveDialog((fileName) => {
        this.outputFile = fileName;
      });
    },

    onMetaData(err, metadata) {
      metadata.streams.forEach((stream) => {
        if (stream.codec_type === 'audio') {
          this.audioChannels.push(stream);
        } else if (stream.codec_type === 'video') {
          this.videoChannels.push(stream);
        }
      });

      this.parsingInput = false;
    },

    setFfmpegPaths() {
      fs.stat(this.ffmpegPath, (err) => {
        if (err) {
          this.ffmpegPathExists = false;
        } else {
          this.ffmpegPathExists = true;
          ffmpeg().setFfmpegPath(this.ffmpegPath);
        }
      });

      fs.stat(this.ffprobePath, (err) => {
        if (err) {
          this.ffprobePathExists = false;
        } else {
          this.ffprobePathExists = true;
          ffmpeg().setFfprobePath(this.ffprobePath);
        }
      });
    },

    onConvert() {
      const options = [];
      this.inProgress = true;
      this.progress = null;
      this.done = false;

      if (this.audioIndexes.length === 0 || this.videoIndexes.length === 0) {
        console.error('No video or audio tracks.');
        return;
      }

      this.audioIndexes.forEach((channel) => {
        options.push('-map', `0:${channel}:0`, `${this.outputFile}.audio.${channel}.mp3`);
      });

      this.startTime = new Date();
      this.endTime = null;

      ffmpeg(this.inputFile)
        .inputOptions(...options)
        .on('error', (err, stdout, stderr) => {
          this.inProgress = false;
          console.error(err, stdout, stderr);
        })
        .on('progress', (progress) => {
          console.log(progress);
          this.progress = progress;
        })
        .on('end', () => {
          this.inProgress = false;
          this.endTime = new Date();
          this.progress = null;
          this.done = true;
        })
        .videoCodec('copy')
        .output(`${this.outputFile}.video.mp4`)
        .run();
    },

    showMainTab() {
      this.tab = 0;
    },

    showFfmpegTab() {
      this.tab = 1;
    },
  },

  computed: {
    audioIndexes() {
      return this.audioChannels.map(channel => channel.index);
    },

    videoIndexes() {
      return this.videoChannels.map(channel => channel.index);
    },

    canRun() {
      return this.ffprobePathExists &&
        this.ffmpegPathExists &&
        !!this.inputFile &&
        !!this.outputFile;
    },
  },
};
</script>
