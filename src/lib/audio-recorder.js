const AUDIO_CONTEXT = new AudioContext();

const WavEncoder = require('wav-encoder');

const AudioRecorder = function () {
    this.reset();
};

AudioRecorder.prototype.reset = function () {
    this.bufferLength = 4096;
    this.audioContext = AUDIO_CONTEXT;

    this.userMediaStream = null;
    this.mediaStreamSource = null;
    this.sourceNode = null;
    this.scriptProcessorNode = null;

    this.recordedSamples = 0;
    this.recording = false;
    this.leftBuffers = [];
    this.rightBuffers = [];
};

AudioRecorder.prototype.startListening = function (onUpdate, onError) {
    const context = this;
    try {
        navigator.getUserMedia({audio: true}, userMediaStream => {
            context.attachUserMediaStream(userMediaStream, onUpdate);
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

AudioRecorder.prototype.attachUserMediaStream = function (userMediaStream, onUpdate) {
    this.userMediaStream = userMediaStream;
    this.mediaStreamSource = this.audioContext.createMediaStreamSource(userMediaStream);
    this.sourceNode = this.audioContext.createGain();
    this.scriptProcessorNode = this.audioContext.createScriptProcessor(this.bufferLength, 2, 2);

    const context = this;

    this.scriptProcessorNode.onaudioprocess = processEvent => {
        const leftBuffer = new Float32Array(processEvent.inputBuffer.getChannelData(0));
        const rightBuffer = new Float32Array(processEvent.inputBuffer.getChannelData(1));

        if (context.recording) {
            context.leftBuffers.push(leftBuffer);
            context.rightBuffers.push(rightBuffer);
            context.recordedSamples += context.bufferLength;
        }

        // // Calculate RMS, adapted from https://github.com/Tonejs/Tone.js/blob/master/Tone/component/Meter.js#L88
        // const signal = leftBuffer;
        // const sum = signal.reduce((acc, v) => acc + Math.pow(v, 2), 0);
        // const rms = Math.sqrt(sum / signal.length);
        // const smoothed = Math.max(rms, (context._lastValue || 0) * 0.5);
        // context._lastValue = smoothed;
        // // Scale it
        // const unity = 0.35;
        // const val = smoothed / unity;
        // // Scale the output curve
        // onUpdate(Math.sqrt(val));

        // Simple max calculation
        const max = Math.max.apply(null, leftBuffer);
        const smoothed = Math.max(max, (context._lastValue || 0) * 0.5);
        context._lastValue = smoothed;

        onUpdate(smoothed);
    };

    // Wire everything together, ending in the destination
    this.mediaStreamSource.connect(this.sourceNode);
    this.sourceNode.connect(this.scriptProcessorNode);
    this.scriptProcessorNode.connect(this.audioContext.destination);
};

AudioRecorder.prototype.stop = function (onStopped) {
    if (this.recordedSamples === 0) {
        return;
    }

    let offset = 0;
    let maxRMS = 0;
    const chunkLevels = [];
    for (let i = 0; i < this.leftBuffers.length; i++) {
        const leftBufferChunk = this.leftBuffers[i];
        // Calculate RMS, adapted from https://github.com/Tonejs/Tone.js/blob/master/Tone/component/Meter.js#L88
        const signal = leftBufferChunk;
        const sum = signal.reduce((acc, v) => acc + Math.pow(v, 2), 0);
        const rms = Math.sqrt(sum / signal.length); // Scale it
        const unity = 0.35;
        const val = rms / unity;
        const scaled = Math.sqrt(val); // Scale the output curve
        maxRMS = Math.max(maxRMS, scaled);
        chunkLevels.push(scaled);
    }

    const threshold = maxRMS / 8;

    let firstChunkAboveThreshold = null;
    let chunkIndex = 0;
    while (firstChunkAboveThreshold === null && chunkIndex < chunkLevels.length - 1) {
        if (chunkLevels[chunkIndex] > threshold) {
            firstChunkAboveThreshold = chunkIndex;
        } else {
            chunkIndex += 1;
        }
    }

    let lastChunkAboveThreshold = null;
    chunkIndex = chunkLevels.length - 1;
    while (lastChunkAboveThreshold === null && chunkIndex > 0) {
        if (chunkLevels[chunkIndex] > threshold) {
            lastChunkAboveThreshold = chunkIndex;
        } else {
            chunkIndex -= 1;
        }
    }

    const usedSamples = lastChunkAboveThreshold - firstChunkAboveThreshold + 2;
    const buffers = [
        new Float32Array(usedSamples * this.bufferLength),
        new Float32Array(usedSamples * this.bufferLength)
    ];

    for (let i = 0; i < this.leftBuffers.length; i++) {
        const leftBufferChunk = this.leftBuffers[i];
        const rightBufferChunk = this.rightBuffers[i];

        if (i > firstChunkAboveThreshold - 2 && i < lastChunkAboveThreshold + 1) {
            buffers[0].set(leftBufferChunk, offset);
            buffers[1].set(rightBufferChunk, offset);
            offset += leftBufferChunk.length;
        }
    }

    const audioBuffer = this.audioContext.createBuffer(1, buffers[0].length, AUDIO_CONTEXT.sampleRate);
    audioBuffer.getChannelData(0).set(buffers[0]);

    WavEncoder.encode({
        sampleRate: AUDIO_CONTEXT.sampleRate,
        channelData: buffers
    }).then(wavBuffer =>
        onStopped(audioBuffer, wavBuffer)
    );

    this.scriptProcessorNode.disconnect();
    this.sourceNode.disconnect();
    this.mediaStreamSource.disconnect();
    this.userMediaStream.getAudioTracks()[0].stop();

    this.reset();
};

module.exports = AudioRecorder;
