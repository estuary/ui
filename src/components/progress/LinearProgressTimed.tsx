import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { useState } from 'react';
import { useInterval } from 'react-use';

interface Props {
    secondsToWait: number;
}

const calculateInterval = (secondsToWait: number) => {
    const interval = secondsToWait / 1000;
    return interval;
};

const LinearProgressTimed = ({ secondsToWait }: Props) => {
    const [progress, setProgress] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(1);

    const interval = calculateInterval(secondsToWait);

    useInterval(() => {
        setProgress((oldProgress) => {
            const progression = (elapsedTime * 100) / interval;
            console.log('progression', progression);
            return oldProgress + 1;
        });
        setElapsedTime(elapsedTime + interval);
    }, interval);

    return (
        <Box sx={{ width: '100%' }}>
            <LinearProgress variant="determinate" value={progress} />
        </Box>
    );
};

export default LinearProgressTimed;
