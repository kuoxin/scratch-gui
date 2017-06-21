const React = require('react');
const bindAll = require('lodash.bindall');
const PlaybackStepComponent = require('../components/record-modal/playback-step.jsx');
const AudioBufferPlayer = require('../lib/audio-buffer-player.js');

class PlaybackStep extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handlePlay',
            'handleStopPlaying'
        ]);
    }
    componentDidMount () {
        this.audioBufferPlayer = new AudioBufferPlayer(this.props.channelData);
    }
    componentWillUnmount () {
        this.audioBufferPlayer.stop();
    }
    handlePlay () {
        this.audioBufferPlayer.play(this.props.onStopPlaying);
        this.props.onPlay();
    }
    handleStopPlaying () {
        this.audioBufferPlayer.stop();
        this.props.onStopPlaying();
    }
    render () {
        const {
            onPlay, // eslint-disable-line no-unused-vars
            onStopPlaying, // eslint-disable-line no-unused-vars
            ...componentProps
        } = this.props;
        return (
            <PlaybackStepComponent
                onPlay={this.handlePlay}
                onStopPlaying={this.handleStopPlaying}
                {...componentProps}
            />
        );
    }
}

PlaybackStep.propTypes = PlaybackStepComponent.propTypes;

module.exports = PlaybackStep;
