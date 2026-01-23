import { useIntl } from 'react-intl';
import { useMount } from 'react-use';

import AlertBox from 'src/components/shared/AlertBox';
import { logRocketEvent } from 'src/services/shared';

function PreSaveWarning() {
    const intl = useIntl();

    useMount(() => {
        logRocketEvent('Data_Flow_Reset', {
            confirmationShown: true,
        });
    });

    return (
        <AlertBox
            short
            severity="warning"
            title={intl.formatMessage({
                id: 'workflows.dataFlowBackfill.preSaveWarning.title',
            })}
        >
            {intl.formatMessage({
                id: 'workflows.dataFlowBackfill.preSaveWarning.message',
            })}
        </AlertBox>
    );
}

export default PreSaveWarning;
