const React = require('react');
const PropTypes = require('prop-types');

const styles = require('./meter.css');

// const slidingWindow = Array(50).fill(0);

const Meter = props => {
    const level = Math.min(1, Math.max(0, props.level));
    const {
        width,
        height
    } = props;

    const nGreen = 11;
    const nYellow = 5;
    const nRed = 5;

    const nBars = nGreen + nYellow + nRed;

    const barSpacing = 2.5;
    const barRounding = 3;
    const barHeight = (height + barSpacing / 2 - barSpacing * nBars) / nBars;
    const barWidth = width;

    const greenFill = 'rgb(171, 220, 170)';
    const yellowFill = 'rgb(251, 219, 130)';
    const redFill = 'rgb(251, 194, 142)';

    const indexToFill = index => {
        if (index < nGreen) return greenFill;
        if (index < nGreen + nYellow) return yellowFill;
        return redFill;
    };

    const greenStroke = 'rgb(174, 211, 168)';
    const yellowStroke = 'rgb(239, 212, 134)';
    const redStroke = 'rgb(235, 189, 142)';

    const indexToStroke = index => {
        if (index < nGreen) return greenStroke;
        if (index < nGreen + nYellow) return yellowStroke;
        return redStroke;
    };

    // const nBarsForLevel = Math.floor(level * nBars);
    // const bars = Array(nBarsForLevel).fill(0)
    const bars = Array(nBars).fill(0)
        .map((value, index) => (
            <rect
                fill={indexToFill(index)}
                height={barHeight}
                key={index}
                rx={barRounding}
                ry={barRounding}
                stroke={indexToStroke(index)}
                width={barWidth}
                x={0}
                y={height - barHeight - index * (barHeight + barSpacing)}
            />
        ));

    const maskHeight = Math.floor(nBars * (1 - level)) * (barHeight + barSpacing);
    const mask = <rect
        x={-2}
        y={-2}
        width={width + 4}
        height={maskHeight + 2}
        fill="white"
        opacity="0.75"
    />;

    const purpleBar = <rect
        fill="rgb(207, 99, 207)"
        // fill="url(#gradient)"
        x={0}
        y={height / 2 - Math.max(level, 0.05) * height / 2}
        width={width}
        height={Math.max(level, 0.05) * height}
        rx={4}
        ry={4}
        style={{transition: '0.1s'}}
    />;

    return (
        <svg
            height={height}
            style={{overflow: 'visible'}}
            width={width}
        >
            {bars}
            {mask}

            {/* {purpleBar} */}
        </svg>
    );
};

Meter.propTypes = {
    height: PropTypes.number,
    level: PropTypes.number,
    width: PropTypes.number
};

module.exports = Meter;
