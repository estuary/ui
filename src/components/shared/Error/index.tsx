import { AlertTitle, Box } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import AlertBox from '../AlertBox';
import Message from './Message';
import { ErrorDetails } from './types';

export interface ErrorProps {
    condensed?: boolean;
    error?: ErrorDetails;
    hideTitle?: boolean;
    noAlertBox?: boolean;
}

function Error({ condensed, error, hideTitle, noAlertBox }: ErrorProps) {
    if (!error) {
        return null;
    }

    if (noAlertBox) {
        return (
            <Box sx={{ p: 1, width: '100%' }}>
                <Message error={error} />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <AlertBox
                severity="error"
                short={condensed}
                title={
                    !hideTitle ? (
                        <AlertTitle>
                            <FormattedMessage id="error.title" />
                        </AlertTitle>
                    ) : null
                }
            >
                <Message error={error} />
            </AlertBox>
        </Box>
    );
}

export default Error;
