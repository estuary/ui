import type { TrialOnlyPrefixAlertProps } from 'src/components/materialization/types';

import { Typography } from '@mui/material';

import { useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import { useEntityType } from 'src/context/EntityContext';

export function TrialOnlyPrefixAlert({
    message,
    triggered,
}: Omit<TrialOnlyPrefixAlertProps, 'messageId'> & { message: string }) {
    const entityType = useEntityType();

    if (entityType !== 'materialization' || !triggered) {
        return null;
    }

    return (
        <AlertBox severity="warning" short>
            <Typography>{message}</Typography>
        </AlertBox>
    );
}

/** @deprecated Prefer the named `TrialOnlyPrefixAlert` export */
export default function TrialOnlyPrefixAlertWrapper({
    messageId,
    ...props
}: TrialOnlyPrefixAlertProps) {
    const intl = useIntl();

    return (
        <TrialOnlyPrefixAlert
            {...props}
            message={intl.formatMessage({ id: messageId })}
        />
    );
}
