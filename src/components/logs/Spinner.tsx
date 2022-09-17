import { CircularProgress } from '@mui/material';
import { useRef } from 'react';
// import { MutableRefObject, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { useUpdateEffect } from 'react-use';
import { useLogsContext } from './Context';
// import { useInterval } from 'react-use';
import LogLine from './Line';

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
    const { stopped: stop } = useLogsContext();

    const spinnerRef = useRef<HTMLDivElement>(null);

    useUpdateEffect(() => {
        if (spinnerRef.current) {
            spinnerRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'start',
            });
        }
    });

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
        <>
            <LogLine
                line={{
                    log_line: intl.formatMessage({
                        id: stop ? 'logs.paused' : 'logs.default',
                    }),
                }}
                lineNumber={
                    <CircularProgress
                        variant={stop ? 'determinate' : undefined}
                        value={stop ? 100 : undefined}
                        size={10}
                        sx={{
                            color: (theme) =>
                                theme.palette.mode === 'dark'
                                    ? 'white'
                                    : 'black',
                        }}
                    />
                }
            />
            {/*Blank on purpose. This is here so scrolling looks better.*/}
            <LogLine
                line={{
                    log_line: '',
                }}
                lineNumber={<span ref={spinnerRef} />}
            />
        </>
    );
}

export default Spinner;
