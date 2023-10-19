import { Backdrop, CircularProgress } from '@mui/material';
import { zIndexIncrement } from 'context/Theme';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useTimeout } from 'react-use';

function FullPageSpinner() {
    const intl = useIntl();

    // We want to block the page right away but give it a half second before showing
    //  anything. That way if the network calls are quick then the user never sees anything
    const [isReady, cancel] = useTimeout(500);
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
            <CircularProgress
                color="inherit"
                aria-label={intl.formatMessage({
                    id: 'common.loading',
                })}
            />
        </Backdrop>
    );
}

export default FullPageSpinner;
