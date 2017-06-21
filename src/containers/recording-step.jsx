const React = require('react');
const bindAll = require('lodash.bindall');
const RecordingStepComponent = require('../components/record-modal/recording-step.jsx');
const AudioRecorder = require('../lib/audio/audio-recorder.js');

class RecordingStep extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleRecord',
            'handleStopRecording'
        ]);

        this.state = {
            level: 0
        };
    }
    componentDidMount () {
        this.audioRecorder = new AudioRecorder();
        this.audioRecorder.startListening(
            level => this.setState({level}),
            () => alert('Could not start recording') // eslint-disable-line no-alert
        );
    }
    componentWillUnmount () {
        this.audioRecorder.dispose();
    }
    handleRecord () {
        this.audioRecorder.startRecording();
        this.props.onRecord();
    }
    handleStopRecording () {
        const {channelData, sampleRate, levels} = this.audioRecorder.stop();
        this.props.onStopRecording(channelData, sampleRate, levels);
    }
    render () {
        const {
            onRecord, // eslint-disable-line no-unused-vars
            onStopRecording, // eslint-disable-line no-unused-vars
            ...componentProps
        } = this.props;
        return (
            <RecordingStepComponent
                level={this.state.level}
                onRecord={this.handleRecord}
                onStopRecording={this.handleStopRecording}
                {...componentProps}
            />
        );
    }
}

RecordingStep.propTypes = RecordingStepComponent.propTypes;

module.exports = RecordingStep;
