<template>
  <div>
    <div class="container">
      <div class="columns is-multiline">
        <div class="column is-half">
          <section class="section">
            <div class="field">
              <button class="button is-primary" @click="onChooseInput">Choose input file(s)</button>
              <table v-if="conversions.length > 0" class="table">
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Progress</th>
                    <th>Audios</th>
                    <th>FPS</th>
                    <th>Kbps</th>
                    <th>Frames</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="conversion in conversions">
                    <template v-if="conversion.done">
                      <tr>
                        <td>{{ conversion.inputFile }}</td>
                        <td colspan="6" class="has-text-success">Done!</td>
                      </tr>
                    </template>
                    <template v-else-if="conversion.progress !== null">
                      <tr v-if="started">
                        <td colspan="7">
                          <progress class="progress is-primary" :value="conversion.progress.percent" max="100">{{ conversion.progress.percent }}</progress>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <strong>{{ conversion.inputFile }}</strong>
                        </td>
                        <td>
                          <span v-if="conversion.done">Done!</span>
                          <span v-else>
                            {{ conversion.progress ? conversion.progress.percent + '%' : '...' }}
                          </span>
                        </td>
                        <td>{{ conversion.audioChannels.length }}</td>
                        <td>{{ conversion.progress.currentFps }}</td>
                        <td>{{ conversion.progress.currentKbps }}</td>
                        <td>{{ conversion.progress.frames }}</td>
                        <td>{{ conversion.progress.timemark }}</td>
                      </tr>
                      <tr v-for="outputFile in conversion.outputFiles" :key="outputFile">
                        <td colspan="7">{{ outputFile }}</td>
                      </tr>
                    </template>
                    <template v-else>
                      <tr>
                        <td colspan="7">Preparing...</td>
                      </tr>
                    </template>
                  </template>
                </tbody>
              </table>
            </div>

            <div class="field">
              <button class="button is-primary" @click="startConversions" :disabled="!canRun">Go!</button>
              <button class="button is-text" @click="reset" v-if="conversions.length !== 0">Reset</button>
            </div>

            <article class="message is-warning">
              <div class="message-body">
                Warning: output files will be overwritten if they already exist!
              </div>
            </article>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const { ipcRenderer, remote } = require('electron');

export default {
  created() {
    ipcRenderer.on('update-converter', this.updateConverter);
  },

  data() {
    return {
      conversions: [],
      inputFiles: '',
      progress: null,
      runningCount: 0,
      started: false,
    };
  },

  methods: {
    updateConverter() {
      const converter = remote.getGlobal('converter');
      this.conversions = converter.conversions;
    },

    onChooseInput() {
      ipcRenderer.send('showFilePicker');
    },

    startConversions() {
      this.started = true;
      ipcRenderer.send('start');
    },

    reset() {
      this.started = false;
      ipcRenderer.send('reset');
    },
  },

  computed: {
    canRun() {
      return this.conversions.length > 0 && !this.started;
    },
  },
};
</script>
