import type { HydrationErrorProps } from 'src/components/collection/DataPreview/types';

import { Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import Error from 'src/components/shared/Error';

function HydrationError({ readError }: HydrationErrorProps) {
    const intl = useIntl();

    if (readError?.message === 'Server Error') {
        return (
            <AlertBox
                severity="info"
                short
                title={intl.formatMessage({
                    id: 'detailsPanel.dataPreview.suspended.title',
                })}
            >
                <Typography>
                    {intl.formatMessage({
                        id: 'detailsPanel.dataPreview.suspended.message',
                    })}
                </Typography>
            </AlertBox>
        );
    }

    return <Error error={readError} condensed />;
}

export default HydrationError;
