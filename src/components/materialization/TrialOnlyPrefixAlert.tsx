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
}: TrialOnlyPrefixAlertProps) {
    const intl = useIntl();

    const resourceConfigs = useBinding_resourceConfigs();
    const bindingSourceBackfillRecommended =
        useBinding_resourceConfigOfMetaBindingProperty(
            bindingUUID,
            'sourceBackfillRecommended'
        );

    if (
        (bindingUUID && !bindingSourceBackfillRecommended) ||
        (!bindingUUID &&
            Object.values(resourceConfigs).some(
                (config) => !config.meta.sourceBackfillRecommended
            ))
    ) {
        return null;
    }

    return (
        <AlertBox severity="warning" short>
            <Typography>{intl.formatMessage({ id: messageId })}</Typography>
        </AlertBox>
    );
}
