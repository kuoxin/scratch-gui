const PropTypes = require('prop-types');
const React = require('react');
const ReactModal = require('react-modal');
const Box = require('../box/box.jsx');
const Waveform = require('../asset-panel/waveform.jsx');
const Meter = require('./meter.jsx');
const styles = require('./record-modal.css');
const classNames = require('classnames');
const CloseButton = require('../close-button/close-button.jsx');

const RecordModal = props => (
    <ReactModal
        className={styles.modalContent}
        contentLabel={'Record Audio'}
        isOpen={props.visible}
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
            <Box className={styles.visualizationContainer}>

                <Box className={styles.meterContainer}>
                    <Meter
                        height={172}
                        level={props.level}
                        width={20}
                    />
                </Box>
                <Box className={styles.waveformContainer}>
                    {props.buffer ? (
                        <Waveform
                            data={props.buffer ? props.buffer.getData() : []}
                            height={150}
                            level={props.level}
                            width={440}
                        />
                    ) : (
                        <span className={styles.helpText}>
                            {props.recording ? (
                                'Recording...'
                            ) : (
                                'Begin recording by clicking the button below'
                            )}
                        </span>
                    )}
                </Box>
            </Box>
            <Box className={styles.mainButtonRow}>
                <button
                    className={styles.mainButton}
                    onClick={props.buffer ? (
                        props.playing ? props.onStopPlaying : props.onPlay
                    ) : (
                        props.recording ? props.onStopRecording : props.onRecord
                    )}
                >
                    <svg
                        height={70}
                        style={{
                            overflow: 'visible'
                        }}
                        width={70}
                    >
                        <g transform="translate(-35,-35) scale(1.5) translate(23, 23)">
                            {props.buffer ? (
                                props.playing ? (
                                    <g>
                                        <rect
                                            fill="#4C97FF"
                                            height={30}
                                            rx={3}
                                            ry={3}
                                            width={30}
                                            x={10}
                                            y={10}
                                        />
                                        <rect
                                            className={styles.pulser}
                                            fill="#4C97FF"
                                            height={30}
                                            rx={3}
                                            ry={3}
                                            width={30}
                                            x={10}
                                            y={10}
                                        />
                                    </g>
                                ) : (
                                    <polygon
                                        fill="#4C97FF"
                                        points="15 15 35 25 15 35"
                                        stroke="#4C97FF"
                                        strokeLinejoin="round"
                                        strokeWidth="5"
                                    />
                                )
                            ) : (
                                props.recording ? (
                                    <g>
                                        <rect
                                            fill="rgb(237, 111, 54)"
                                            height={30}
                                            rx={3}
                                            ry={3}
                                            width={30}
                                            x={10}
                                            y={10}
                                        />
                                        <rect
                                            className={styles.pulser}
                                            fill="rgb(237, 111, 54)"
                                            height={30}
                                            rx={3}
                                            ry={3}
                                            width={30}
                                            x={10}
                                            y={10}
                                        />
                                    </g>
                                ) : (
                                    <g>
                                        <circle
                                            cx={25}
                                            cy={25}
                                            fill="rgb(237, 111, 54)"
                                            r={15}
                                        />
                                        <circle
                                            cx={25}
                                            cy={25}
                                            fill="rgb(237, 111, 54)"
                                            r={18 + props.level * 10}
                                            style={{opacity: 0.15, transition: '0.1s'}}
                                        />
                                    </g>
                                )
                            )}
                        </g>
                    </svg>
                    <div className={styles.helpText}>
                        {props.buffer ? (
                            <span className={styles.playingText}>
                                {props.playing ? 'Stop' : 'Play'}
                            </span>
                        ) : (
                            <span className={styles.recordingText}>
                                {props.recording ? 'Stop recording' : 'Record'}
                            </span>
                        )}
                    </div>
                </button>
            </Box>
            {props.buffer ? (
                <Box className={styles.buttonRow}>
                    <button
                        className={styles.cancelButton}
                        onClick={props.onBack}
                    >
                        Re-record
                    </button>
                    <button
                        className={styles.okButton}
                        onClick={props.onSubmit}
                    >
                        OK
                    </button>
                </Box>
            ) : null}
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
    recording: PropTypes.bool,
    visible: PropTypes.bool.isRequired
};

module.exports = RecordModal;
