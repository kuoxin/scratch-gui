const PropTypes = require('prop-types');
const React = require('react');
const ReactModal = require('react-modal');
const Box = require('../box/box.jsx');
const styles = require('./record-modal.css');
const classNames = require('classnames');
const CloseButton = require('../close-button/close-button.jsx');

const RecordingStep = require('./recording-step.jsx');
const PlaybackStep = require('./playback-step.jsx');

const RecordModal = props => (
    <ReactModal
        isOpen
        className={styles.modalContent}
        contentLabel={'Record Audio'}
        overlayClassName={styles.modalOverlay}
        onRequestClose={props.onCancel}
    >
        <div className={styles.header}>
            <div className={classNames(styles.headerItem, styles.headerItemFilter)}>
                {/* Nothing here, just for spacing */}
            </div>
            <div className={classNames(styles.headerItem, styles.headerItemTitle)}>
                Record Audio
            </div>
            <div className={classNames(styles.headerItem, styles.headerItemClose)}>
                <CloseButton
                    size={CloseButton.SIZE_LARGE}
                    onClick={props.onCancel}
                />
            </div>
        </div>
        <Box className={styles.body}>
            {props.buffer ? (
                <PlaybackStep
                    buffer={props.buffer}
                    level={props.level}
                    playing={props.playing}
                    onBack={props.onBack}
                    onPlay={props.onPlay}
                    onStopPlaying={props.onStopPlaying}
                    onSubmit={props.onSubmit}
                />
            ) : (
                <RecordingStep
                    level={props.level}
                    recording={props.recording}
                    onRecord={props.onRecord}
                    onStopRecording={props.onStopRecording}
                />
            )}
        </Box>
    </ReactModal>
);

RecordModal.propTypes = {
    buffer: PropTypes.arrayOf(PropTypes.number),
    level: PropTypes.number,
    onBack: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    onPlay: PropTypes.func.isRequired,
    onRecord: PropTypes.func.isRequired,
    onStopPlaying: PropTypes.func.isRequired,
    onStopRecording: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    playing: PropTypes.bool,
    recording: PropTypes.bool
};

module.exports = RecordModal;
