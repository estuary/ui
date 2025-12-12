import type { DisableEnableConfirmationProps } from 'src/components/tables/RowActions/types';

import { Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';

function DisableEnableConfirmation({
    count,
    enabling,
}: DisableEnableConfirmationProps) {
    const intl = useIntl();

    return (
        <AlertBox severity="info" short>
            <Typography component="div">
                {intl.formatMessage(
                    { id: 'entityTable.disableEnable.confirm' },
                    {
                        count,
                        setting: intl.formatMessage({
                            id: enabling ? 'common.enabled' : 'common.disabled',
                        }),
                    }
                )}
            </Typography>
        </AlertBox>
    );
}

export default DisableEnableConfirmation;
