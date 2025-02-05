import { Typography } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { useMemo } from 'react';
import { useIntl } from 'react-intl';
import {
    useBinding_backfilledBindings,
    useBinding_resourceConfigOfMetaBindingProperty,
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
    const trialOnlyStorage = useBinding_resourceConfigOfMetaBindingProperty(
        bindingUUID,
        'trialOnlyStorage'
    );
    const updatedAt = useBinding_resourceConfigOfMetaBindingProperty(
        bindingUUID,
        'updatedAt'
    );

    const hideBindingLevelAlert = useMemo(
        () =>
            Boolean(
                bindingUUID &&
                    (!trialOnlyStorage ||
                        (trialOnlyStorage &&
                            !isBeforeTrialInterval(
                                typeof updatedAt === 'string'
                                    ? updatedAt
                                    : undefined
                            )))
            ),
        [bindingUUID, trialOnlyStorage, updatedAt]
    );

    if (
        hideBindingLevelAlert ||
        (!bindingUUID &&
            backfilledBindings.every((uuid) => {
                const config = resourceConfigs[uuid];

                return (
                    !config.meta.trialOnlyStorage ||
                    !isBeforeTrialInterval(config.meta.updatedAt)
                );
            })) ||
        !triggered
    ) {
        return null;
    }

    return (
        <AlertBox severity="warning" short>
            <Typography>{intl.formatMessage({ id: messageId })}</Typography>
        </AlertBox>
    );
}
