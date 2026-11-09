import { useEffect } from 'react';

import { Backdrop, CircularProgress } from '@mui/material';

import { useTimeout } from 'react-use';

import { zIndexIncrement } from 'src/context/Theme';

interface Props {
    delay?: number;
}

function FullPageSpinner({ delay }: Props) {
    // We want to block the page right away but give it a half second before showing
    //  anything. That way if the network calls are quick then the user never sees anything
    const [isReady, cancel] = useTimeout(delay ?? 500);
    useEffect(() => {
        return () => {
            cancel();
        };
    }, [cancel]);

    return (
        <Backdrop
            sx={{
                color: '#fff',
                zIndex: (theme) => theme.zIndex.tooltip + zIndexIncrement,
            }}
            open={true}
            invisible={!Boolean(isReady())}
            transitionDuration={75}
        >
            <CircularProgress color="inherit" aria-label="Loading..." />
        </Backdrop>
    );
}

export default FullPageSpinner;
