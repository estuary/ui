import { Typography } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { useIntl } from 'react-intl';
import { getTrialDuration } from 'utils/env-utils';
import { TrialOnlyPrefixAlertProps } from './types';

const { trialDuration } = getTrialDuration();

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
            <Typography>
                {intl.formatMessage({ id: messageId }, { trialDuration })}
            </Typography>
        </AlertBox>
    );
}
