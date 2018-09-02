import { dialog } from 'electron';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import FileConversion from './FileConversion';

export default class Converter {
  constructor() {
    this.inputFiles = [];
    this.conversions = [];
    this.ffmpegPath = 'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe';
    this.ffprobePath = 'C:\\Program Files\\ffmpeg\\bin\\ffprobe.exe';
    this.ffmpegPathExists = false;
    this.ffprobePathExists = false;
  }

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
  }

  chooseInputFiles() {
    return new Promise((resolve) => {
      dialog.showOpenDialog({
        properties: ['multiSelections'],
      }, (fileNames) => {
        if (!fileNames) {
          return;
        }

        this.inputFiles = fileNames;
        this.conversions = [];

        this.inputFiles.forEach((inputFile) => {
          const conversion = new FileConversion(inputFile);
          this.conversions.push(conversion);
        });

        resolve();
      });
    });
  }

  reset() {
    this.started = false;
    this.inputFiles = [];
    this.conversions = [];
  }

  startConversions() {
    this.started = true;
    this.conversions.forEach((conversion) => {
      this.runningCount += 1;
      conversion.start();
      conversion.onEnd = () => {
        this.runningCount -= 1;
      };
      conversion.onProgress = () => {
        this.onProgress();
      };
      conversion.onError = () => {
        this.onError();
      };
    });
  }
}
