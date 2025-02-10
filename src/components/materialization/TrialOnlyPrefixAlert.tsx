import { Typography } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
    useBinding_backfilledBindings,
    useBinding_resourceConfigs,
} from 'stores/Binding/hooks';
import { isBeforeTrialInterval } from './shared';
import { TrialOnlyPrefixAlertProps } from './types';

export default function TrialOnlyPrefixAlert({
    bindingUUID,
    messageId,
    triggered,
}: TrialOnlyPrefixAlertProps) {
    const intl = useIntl();

    const backfilledBindings = useBinding_backfilledBindings();
    const resourceConfigs = useBinding_resourceConfigs();

    const hideTopLevelAlert = useMemo(
        () =>
            !bindingUUID &&
            backfilledBindings.every((uuid) => {
                const config = resourceConfigs[uuid];

                return (
                    !config.meta.trialOnlyStorage ||
                    !isBeforeTrialInterval(config.meta.updatedAt)
                );
            }),
        [backfilledBindings, bindingUUID, resourceConfigs]
    );

    if (hideTopLevelAlert || !triggered) {
        return null;
    }

    return (
        <AlertBox severity="warning" short>
            <Typography>{intl.formatMessage({ id: messageId })}</Typography>
        </AlertBox>
    );
}
