import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

import useProgressTimer from 'hooks/useProgressTimer';

// If there is no wait then we'll
interface Props {
    wait?: number;
}

const LinearProgressTimed = ({ wait }: Props) => {
    const progress = useProgressTimer(wait);

    return (
        <Box sx={{ width: '100%' }}>
            <LinearProgress
                variant={wait ? 'determinate' : 'indeterminate'}
                value={progress}
            />
        </Box>
    );
};

export default LinearProgressTimed;
