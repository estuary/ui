import { Stack } from '@mui/material';

import { useMount } from 'react-use';

import AlertBox from 'src/components/shared/AlertBox';
import { logRocketEvent } from 'src/services/shared';

export function PreSaveConfirmation() {
    useMount(() => {
        logRocketEvent('Data_Flow_Reset', {
            confirmationShown: true,
        });
    });

    return (
        <Stack spacing={1}>
            <AlertBox
                short
                severity="warning"
                title="Understand the impact of Backfill Mode"
            >
                {
                    'Dataflow reset truncates your collections, which will drop data from any downstream destinations. Selecting "Incremental Backfill" will maintain existing data which may be desirable if delta updates materializations exist downstream.'
                }
            </AlertBox>
        </Stack>
    );
}
