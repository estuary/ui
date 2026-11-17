import type { HydrationErrorProps } from 'src/components/collection/DataPreview/types';

import { Typography } from '@mui/material';

import AlertBox from 'src/components/shared/AlertBox';
import Error from 'src/components/shared/Error';

function HydrationError({ readError }: HydrationErrorProps) {
    if (readError?.message === 'SUSPENDED') {
        return (
            <AlertBox
                severity="info"
                short
                title="No data found in collection."
            >
                <Typography>
                    If you are using the Estuary trial storage mapping, data
                    expires after 20 days.
                </Typography>
            </AlertBox>
        );
    }

    return <Error error={readError} condensed />;
}

export default HydrationError;
