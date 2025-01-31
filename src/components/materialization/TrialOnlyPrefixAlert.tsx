import { Typography } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import { useIntl } from 'react-intl';
import {
    useBinding_resourceConfigOfMetaBindingProperty,
    useBinding_resourceConfigs,
} from 'stores/Binding/hooks';
import { TrialOnlyPrefixAlertProps } from './types';

export default function TrialOnlyPrefixAlert({
    bindingUUID,
    messageId,
    triggered,
}: TrialOnlyPrefixAlertProps) {
    const intl = useIntl();

    const resourceConfigs = useBinding_resourceConfigs();
    const trialOnlyStorage = useBinding_resourceConfigOfMetaBindingProperty(
        bindingUUID,
        'trialOnlyStorage'
    );

    if (
        (bindingUUID && !trialOnlyStorage) ||
        (!bindingUUID &&
            Object.values(resourceConfigs).every(
                (config) => !config.meta.trialOnlyStorage
            )) ||
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
