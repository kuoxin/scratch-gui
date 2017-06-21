const AUDIO_CONTEXT = new AudioContext();

const AudioBufferPlayer = function (channelData) {
    this.buffer = AUDIO_CONTEXT.createBuffer(1, channelData[0].length, AUDIO_CONTEXT.sampleRate);
    this.buffer.getChannelData(0).set(channelData[0]);
    this.source = null;
};

AudioBufferPlayer.prototype.play = function (onEnded) {
    // Buffer source nodes are one time use only. Must do this every play.
    this.source = AUDIO_CONTEXT.createBufferSource();
    this.source.onended = onEnded;
    this.source.buffer = this.buffer;
    this.source.connect(AUDIO_CONTEXT.destination);
    this.source.start();
};

AudioBufferPlayer.prototype.stop = function () {
    if (this.source) this.source.stop();
};

module.exports = AudioBufferPlayer;
