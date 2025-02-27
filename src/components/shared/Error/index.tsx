import { AlertColor, AlertTitle, Box } from '@mui/material';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import AlertBox from '../AlertBox';
import { ExternalLinkOptions } from '../ExternalLink';
import Message from './Message';
import { ErrorDetails } from './types';

export interface ErrorProps {
    condensed?: boolean;
    error?: ErrorDetails;
    hideIcon?: boolean;
    hideTitle?: boolean;
    linkOptions?: ExternalLinkOptions;
    noAlertBox?: boolean;
    severity?: AlertColor;
    cta?: ReactNode;
}

function Error({
    condensed,
    error,
    hideIcon,
    hideTitle,
    linkOptions,
    noAlertBox,
    severity,
    cta,
}: ErrorProps) {
    if (!error) {
        return null;
    }

    if (noAlertBox) {
        return (
            <Box sx={{ p: 1, width: '100%' }}>
                <Message error={error} linkOptions={linkOptions} />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <AlertBox
                severity={severity ?? 'error'}
                short={Boolean(condensed)}
                hideIcon={hideIcon}
                title={
                    !hideTitle ? (
                        <AlertTitle>
                            <FormattedMessage id="error.title" />
                        </AlertTitle>
                    ) : null
                }
            >
                <Message error={error} linkOptions={linkOptions} />
                {cta ? (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'end' }}>
                        {cta}
                    </Box>
                ) : null}
            </AlertBox>
        </Box>
    );
}

export default Error;
