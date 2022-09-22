import { Backdrop, CircularProgress } from '@mui/material';
import { zIndexIncrement } from 'context/Theme';
import { useIntl } from 'react-intl';

function FullPageSpinner() {
    const intl = useIntl();

    return (
        <Backdrop
            sx={{
                color: '#fff',
                zIndex: (theme) => theme.zIndex.tooltip + zIndexIncrement,
            }}
            open={true}
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
