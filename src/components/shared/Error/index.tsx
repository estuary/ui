import type { AlertColor } from '@mui/material';
import type { ReactNode } from 'react';
import type { ErrorDetails } from 'src/components/shared/Error/types';
import type { ExternalLinkOptions } from 'src/components/shared/ExternalLink';

import { AlertTitle, Box } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import Message from 'src/components/shared/Error/Message';

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
