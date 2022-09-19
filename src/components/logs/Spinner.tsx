import { CircularProgress } from '@mui/material';
// import { MutableRefObject, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useLogsContext } from './Context';
// import { useInterval } from 'react-use';
import LogLine, { lineNumberColor } from './Line';

// Spinner from https://github.com/sindresorhus/cli-spinners/blob/main/spinners.json
// const ANIMATION_PROPERTIES = {
//  interval: 150,
//  frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
//  done: '⠿',
// };

// const getFrame = (frame: number) => {
//  return ANIMATION_PROPERTIES.frames[frame];
// };

function Spinner() {
    const intl = useIntl();
    const { stopped } = useLogsContext();

    // const buildLogLine = (newFrame: MutableRefObject<number>) => {
    //  return `${getFrame(newFrame.current)}`;
    // };

    // const frame = useRef(0);
    // const [animationFrame, setAnimationFrame] = useState(buildLogLine(frame));

    // useInterval(
    //  () => {
    //      const newFrame = frame.current + 1;
    //      frame.current =
    //          newFrame === ANIMATION_PROPERTIES.frames.length ? 0 : newFrame;
    //      setAnimationFrame(buildLogLine(frame));
    //      console.log('lineText', animationFrame);
    //  },
    //  stop ? null : ANIMATION_PROPERTIES.interval
    // );

    return (
        <LogLine
            disableSelect
            line={{
                log_line: intl.formatMessage({
                    id: stopped ? 'logs.paused' : 'logs.default',
                }),
            }}
            lineNumber={
                <CircularProgress
                    variant={stopped ? 'determinate' : undefined}
                    value={stopped ? 100 : undefined}
                    size={18}
                    sx={{
                        alignSelf: 'end',
                        color: lineNumberColor,
                    }}
                />
            }
        />
    );
}

export default Spinner;
