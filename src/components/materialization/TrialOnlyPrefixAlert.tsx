import { Typography } from '@mui/material';

import { TrialOnlyPrefixAlertProps } from './types';
import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { useEntityType } from 'src/context/EntityContext';

export default function TrialOnlyPrefixAlert({
    messageId,
    triggered,
}: TrialOnlyPrefixAlertProps) {
    const intl = useIntl();
    const entityType = useEntityType();

    if (entityType !== 'materialization' || !triggered) {
        return null;
    }

    return (
        <AlertBox severity="warning" short>
            <Typography>{intl.formatMessage({ id: messageId })}</Typography>
        </AlertBox>
    );
}
