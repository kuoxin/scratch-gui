const React = require('react');
const PropTypes = require('prop-types');

const styles = require('./waveform.css');

let slidingWindow = Array(30).fill(0);

const Waveform = props => {
    let {
        width,
        height,
        data,
        level,
        playhead
    } = props;

    const amp = height / 2;

    // let step = Math.ceil(data.length / width);
    // const maxStep = 10 * step;
    const nSteps = 40;
    const step = Math.max(Math.floor(data.length / nSteps), 1);

    let i = 0;
    let pathData = `M 0 0`;

    const handleFactor = 3;

    if (data.length === 0) {
        data = slidingWindow;
    }
    while (i < data.length) {
        const d = data.slice(i, i + step);
        const min = Math.max(-1, Math.min.apply(null, d));

        const halfX = (i + step / 2) * (width / data.length);
        const fullX = (i + step) * (width / data.length);

        const topY = -min * amp;
        const bottomY = min * amp;

        pathData += `C ${halfX} ${handleFactor * topY} ${halfX} ${handleFactor * bottomY} ${fullX} 0`;

        i += step;
    }

    slidingWindow = slidingWindow.slice(1).concat([level]);

    return (
        <svg
            height={height}
            width={width}
        >
            {data.length === 0 ? (
                // <g>
                //     <line
                //         stroke="rgb(207, 99, 207)"
                //         strokeLinecap="round"
                //         strokeWidth={Math.max(0.01, level) * amp}
                //         style={{transition: '0.2s'}}
                //         x1={width / 10}
                //         x2={(9 * width) / 10}
                //         y1={height / 1.3}
                //         y2={height / 1.3}
                //     />
                //     <circle cx={width / 4} cy={height / 4} r={20} fill="rgb(207, 99, 207)" />
                //     <circle cx={(3 * width) / 4} cy={height / 4} r={20} fill="rgb(207, 99, 207)" />
                // </g>
                <polyline
                    fill="none"
                    stroke="rgb(207, 99, 207)"
                    points={slidingWindow.map((v, i) => `${i * width / slidingWindow.length} ${v * height}`).join(' ')}
                />
            ) : (
                <g transform={`scale(1, -1) translate(0, -${height / 2}) `}>
                    <path
                        d={pathData}
                        fill="none"
                        stroke="rgb(207, 99, 207)"
                        strokeLinejoin={'round'}
                        strokeWidth={2}
                        style={styles.polygon}
                    />
                    {playhead ? (
                        <line
                            x1={playhead * data.length / 4096}
                            x2={playhead * data.length / 4096}
                            y1={-height / 2}
                            y2={height / 2}
                            stroke="#4C97FF"
                        />
                    ) : null}

                </g>
            )}
        </svg>
    );
};

Waveform.propTypes = {
    data: PropTypes.arrayOf(PropTypes.number),
    height: PropTypes.number,
    level: PropTypes.number,
    width: PropTypes.number
};

module.exports = Waveform;
