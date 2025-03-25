import type { LinearProgressProps } from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import useProgressTimer from 'hooks/useProgressTimer';
import { useState } from 'react';
import { useDebounce } from 'react-use';
import { DEFAULT_POLLING_INTERVAL } from 'services/supabase';

// If there is no wait then we'll
interface Props {
    wait?: number;
}

const LinearProgressTimed = ({ wait }: Props) => {
    const progress = useProgressTimer(wait);

    const [variant, setVariant] =
        useState<LinearProgressProps['variant']>('indeterminate');

    // make it so there is less aggressive switching between the states
    // especially for quick discovers during refresh of bindings
    // Using polling interval so that we wait at least one poll before switching
    useDebounce(
        () => setVariant(wait ? 'determinate' : 'indeterminate'),
        DEFAULT_POLLING_INTERVAL,
        [wait]
    );

    return (
        <Box sx={{ width: '100%' }}>
            <LinearProgress variant={variant} value={progress} />
        </Box>
    );
};

export default LinearProgressTimed;
