const bindAll = require('lodash.bindall');
const PropTypes = require('prop-types');
const React = require('react');
const VM = require('scratch-vm');

const {connect} = require('react-redux');

const RecordModalComponent = require('../components/record-modal/record-modal.jsx');

const {
    closeSoundRecorder
} = require('../reducers/modals');

class RecordModal extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleRecord',
            'handleStopRecording',
            'handlePlay',
            'handleStopPlaying',
            'handleBack',
            'handleSubmit',
            'handleCancel'
        ]);

        this.state = {
            buffer: null,
            recording: false,
            playing: false
        };
    }
    handleRecord () {
        this.setState({recording: true});
    }
    handleStopRecording (buffer, wavBuffer) {
        this.setState({
            recording: false,
            buffer: buffer,
            wavBuffer: wavBuffer
        });
    }
    handlePlay () {
        this.setState({playing: true});
    }
    handleStopPlaying () {
        this.setState({playing: false});
    }
    handleBack () {
        this.setState({playing: false, buffer: null});
    }
    handleSubmit () {
        const md5 = String(Math.floor(100000 * Math.random()));
        const vmSound = {
            format: '',
            md5: `${md5}.wav`,
            name: `recording ${this.props.vm.editingTarget.sprite.sounds.length}`
        };

        // Load the encoded .wav into the storage cache
        const storage = this.props.vm.runtime.storage;
        storage.builtinHelper.cache(
            storage.AssetType.Sound,
            storage.DataFormat.WAV,
            new Uint8Array(this.state.wavBuffer),
            md5
        );

        this.props.vm.addSound(vmSound);
        this.handleCancel();
    }
    handleCancel () {
        this.setState({
            buffer: null,
            recording: false,
            playing: false
        });
        this.props.onClose();
    }
    render () {
        return (
            <RecordModalComponent
                buffer={this.state.buffer}
                playing={this.state.playing}
                recording={this.state.recording}
                onBack={this.handleBack}
                onCancel={this.handleCancel}
                onPlay={this.handlePlay}
                onRecord={this.handleRecord}
                onStopPlaying={this.handleStopPlaying}
                onStopRecording={this.handleStopRecording}
                onSubmit={this.handleSubmit}
            />
        );
    }
}

RecordModal.propTypes = {
    onClose: PropTypes.func,
    vm: PropTypes.instanceOf(VM)
};

const mapStateToProps = state => ({
    visible: state.modals.soundRecorder,
    vm: state.vm
});

const mapDispatchToProps = dispatch => ({
    onClose: () => {
        dispatch(closeSoundRecorder());
    }
});

module.exports = connect(
    mapStateToProps,
    mapDispatchToProps
)(RecordModal);
