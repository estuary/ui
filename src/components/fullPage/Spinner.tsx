import { Backdrop, CircularProgress } from '@mui/material';
import { useIntl } from 'react-intl';

function FullPageSpinner() {
    const intl = useIntl();

    return (
        <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
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
