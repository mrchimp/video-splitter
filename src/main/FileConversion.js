'use trict';

import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

export default class FileConversion {
  constructor(inputFile) {
    this.audioChannels = [];
    this.videoChannels = [];
    this.inputFile = inputFile;
    this.outputFile = '';
    this.parsingInput = true;
    this.inProgress = false;
    this.progress = { percent: 0 };
    this.done = false;
    this.audioChannels = [];
    this.videoChannels = [];
    this.audioIndexes = [];
    this.videoIndexes = [];
    this.outputFiles = [];

    this.makeOutputPath(this.inputFile);

    ffmpeg.ffprobe(this.inputFile, (err, metadata) => {
      metadata.streams.forEach((stream) => {
        if (stream.codec_type === 'audio') {
          this.audioChannels.push(stream);
        } else if (stream.codec_type === 'video') {
          this.videoChannels.push(stream);
        }
      });

      this.audioIndexes = this.audioChannels.map(channel => channel.index);
      this.videoIndexes = this.videoChannels.map(channel => channel.index);

      this.outputFiles.push(`${this.outputFile}.video.mp4`);
      this.audioIndexes.forEach((channel) => {
        this.outputFiles.push(`${this.outputFile}.audio.${channel}.mp3`);
      });

      this.parsingInput = false;
    });
  }

  start() {
    const options = [];

    this.inProgress = true;
    this.progress = null;
    this.done = false;

    if (this.audioIndexes.length === 0 || this.videoIndexes.length === 0) {
      return;
    }

    this.audioIndexes.forEach((channel) => {
      options.push('-map', `0:${channel}:0`, `${this.outputFile}.audio.${channel}.mp3`);
    });

    this.startTime = new Date();
    this.endTime = null;

    ffmpeg(this.inputFile)
      .inputOptions(...options)
      .on('error', () => {
        this.inProgress = false;
        this.onError();
      })
      .on('progress', (progress) => {
        this.progress = progress;
        this.onProgress();
      })
      .on('end', () => {
        this.inProgress = false;
        this.endTime = new Date();
        this.progress = null;
        this.done = true;
        this.onEnd();
      })
      .videoCodec('copy')
      .output(`${this.outputFile}.video.mp4`)
      .run();
  }

  canRun() {
    return !this.parsingInput;
  }

  makeOutputPath(inputPath) {
    let parts = inputPath.split('.');
    parts.splice(-1, 1);
    parts = parts.join('.');
    parts = parts.split(path.sep);
    parts.splice(parts.length - 1, 0, 'conversions');
    this.outputFile = path.join(...parts);
    this.outputFile = inputPath;
  }

  onEnd() {
    this.stupidLinter = true;
  }

  onProgress() {
    this.stupidLinter = true;
  }

  onError() {
    this.stupidLinter = true;
  }
}
