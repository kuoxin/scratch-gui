const SharedAudioContext = require('./shared-audio-context.js');

const AudioRecorder = function () {
    this.audioContext = new SharedAudioContext();
    this.bufferLength = 2048;

    this.userMediaStream = null;
    this.mediaStreamSource = null;
    this.sourceNode = null;
    this.scriptProcessorNode = null;

    this.recordedSamples = 0;
    this.recording = false;
    this.leftBuffers = [];
    this.rightBuffers = [];
    this.levels = [];

    this.disposed = false;
};

AudioRecorder.prototype.startListening = function (onUpdate, onError) {
    try {
        navigator.getUserMedia({audio: true}, userMediaStream => {
            this.attachUserMediaStream(userMediaStream, onUpdate);
        }, e => {
            onError(e);
        });
    } catch (e) {
        onError(e);
    }
};

AudioRecorder.prototype.startRecording = function () {
    this.recording = true;
};

AudioRecorder.prototype.calculateRMS = function (samples) {
    // Calculate RMS, adapted from https://github.com/Tonejs/Tone.js/blob/master/Tone/component/Meter.js#L88
    const sum = samples.reduce((acc, v) => acc + Math.pow(v, 2), 0);
    const rms = Math.sqrt(sum / samples.length);
    // Scale it
    const unity = 0.35;
    const val = rms / unity;
    // Scale the output curve
    return Math.sqrt(val);
};

AudioRecorder.prototype.attachUserMediaStream = function (userMediaStream, onUpdate) {
    this.userMediaStream = userMediaStream;
    this.mediaStreamSource = this.audioContext.createMediaStreamSource(userMediaStream);
    this.sourceNode = this.audioContext.createGain();
    this.scriptProcessorNode = this.audioContext.createScriptProcessor(this.bufferLength, 2, 2);


    this.scriptProcessorNode.onaudioprocess = processEvent => {
        if (this.recording) {
            const leftBuffer = new Float32Array(processEvent.inputBuffer.getChannelData(0));
            const rightBuffer = new Float32Array(processEvent.inputBuffer.getChannelData(1));

            this.leftBuffers.push(leftBuffer);
            this.rightBuffers.push(rightBuffer);
            this.recordedSamples += this.bufferLength;
        }
    };

    this.analyserNode = this.audioContext.createAnalyser();

    this.analyserNode.fftSize = 2048;

    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);

    const update = () => {
        if (!this.disposed) {
            requestAnimationFrame(update);
        } else {
            return;
        }

        this.analyserNode.getFloatTimeDomainData(dataArray);
        const rms = this.calculateRMS(dataArray);
        if (this.recording) {
            this.levels.push(rms);
        }
        onUpdate(rms);
    };

    requestAnimationFrame(update);

    // Wire everything together, ending in the destination
    this.mediaStreamSource.connect(this.sourceNode);
    this.sourceNode.connect(this.analyserNode);
    this.analyserNode.connect(this.scriptProcessorNode);
    this.scriptProcessorNode.connect(this.audioContext.destination);
};

AudioRecorder.prototype.stop = function () {
    let offset = 0;

    const buffers = [
        new Float32Array(this.recordedSamples),
        new Float32Array(this.recordedSamples)
    ];

    for (let i = 0; i < this.leftBuffers.length; i++) {
        const leftBufferChunk = this.leftBuffers[i];
        const rightBufferChunk = this.rightBuffers[i];

        buffers[0].set(leftBufferChunk, offset);
        buffers[1].set(rightBufferChunk, offset);
        offset += leftBufferChunk.length;
    }

    return {
        levels: this.levels,
        channelData: buffers,
        sampleRate: this.audioContext.sampleRate
    };
};

AudioRecorder.prototype.dispose = function () {
    this.scriptProcessorNode.onaudioprocess = null;
    this.scriptProcessorNode.disconnect();
    this.sourceNode.disconnect();
    this.mediaStreamSource.disconnect();
    this.userMediaStream.getAudioTracks()[0].stop();
    this.disposed = true;
};

module.exports = AudioRecorder;
