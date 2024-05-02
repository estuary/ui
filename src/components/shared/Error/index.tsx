import { AlertColor, AlertTitle, Box, SxProps } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import AlertBox from '../AlertBox';
import Message from './Message';
import { ErrorDetails } from './types';

export interface ErrorProps {
    condensed?: boolean;
    error?: ErrorDetails;
    hideIcon?: boolean;
    hideTitle?: boolean;
    linkSx?: SxProps;
    noAlertBox?: boolean;
    severity?: AlertColor;
}

function Error({
    condensed,
    error,
    hideIcon,
    hideTitle,
    linkSx,
    noAlertBox,
    severity,
}: ErrorProps) {
    if (!error) {
        return null;
    }

    if (noAlertBox) {
        return (
            <Box sx={{ p: 1, width: '100%' }}>
                <Message error={error} linkSx={linkSx} />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <AlertBox
                severity={severity ?? 'error'}
                short={condensed}
                hideIcon={hideIcon}
                title={
                    !hideTitle ? (
                        <AlertTitle>
                            <FormattedMessage id="error.title" />
                        </AlertTitle>
                    ) : null
                }
            >
                <Message error={error} linkSx={linkSx} />
            </AlertBox>
        </Box>
    );
}

export default Error;
