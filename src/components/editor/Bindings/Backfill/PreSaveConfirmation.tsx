import { Stack } from '@mui/material';

import { useIntl } from 'react-intl';
import { useMount } from 'react-use';

import AlertBox from 'src/components/shared/AlertBox';
import { logRocketEvent } from 'src/services/shared';

function PreSaveConfirmation() {
    const intl = useIntl();

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
                title={intl.formatMessage({
                    id: 'workflows.dataFlowBackfill.preSaveConfirmation.title',
                })}
            >
                {intl.formatMessage({
                    id: 'workflows.dataFlowBackfill.preSaveConfirmation.message',
                })}
            </AlertBox>
        </Stack>
    );
}

export default PreSaveConfirmation;
