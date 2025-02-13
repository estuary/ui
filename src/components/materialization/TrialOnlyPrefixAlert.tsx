import { Typography } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { useIntl } from 'react-intl';
import { TrialOnlyPrefixAlertProps } from './types';

export default function TrialOnlyPrefixAlert({
    messageId,
    triggered,
}: TrialOnlyPrefixAlertProps) {
    const intl = useIntl();

    if (!triggered) {
        return null;
    }

    return (
        <AlertBox severity="warning" short>
            <Typography>{intl.formatMessage({ id: messageId })}</Typography>
        </AlertBox>
    );
}
