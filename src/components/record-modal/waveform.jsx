const React = require('react');
const PropTypes = require('prop-types');

const Waveform = props => {
    const {
        width,
        height,
        data
    } = props;

    const amp = height / 2;

    // let step = Math.ceil(data.length / width);
    // const maxStep = 10 * step;
    const nSteps = 40;
    const step = Math.max(Math.floor(data.length / nSteps), 1);

    let i = 0;
    let pathData = `M 0 0`;

    const handleFactor = 3;

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

    return (
        <svg
            height={height}
            width={width}
        >
            <g transform={`scale(1, -1) translate(0, -${height / 2}) `}>
                <path
                    d={pathData}
                    fill="none"
                    stroke="rgb(207, 99, 207)"
                    strokeLinejoin={'round'}
                    strokeWidth={2}
                />
            </g>
        </svg>
    );
};

Waveform.propTypes = {
    data: PropTypes.arrayOf(PropTypes.number),
    height: PropTypes.number,
    width: PropTypes.number
};

module.exports = Waveform;
