import { Typography } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { useEntityType } from 'context/EntityContext';
import { useIntl } from 'react-intl';
import { TrialOnlyPrefixAlertProps } from './types';

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
