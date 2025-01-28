import { Typography } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import useTrialStorageOnly from 'hooks/useTrialStorageOnly';
import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useBinding_collections } from 'stores/Binding/hooks';
import { useBindingStore } from 'stores/Binding/Store';
import { useTenantStore } from 'stores/Tenant/Store';
import { hasLength, stripPathing } from 'utils/misc-utils';
import { TrialOnlyPrefixAlertProps } from './types';

export default function TrialOnlyPrefixAlert({
    messageId,
}: TrialOnlyPrefixAlertProps) {
    const intl = useIntl();

    const bindingsHydrated = useBindingStore((state) => state.hydrated);
    const collections = useBinding_collections();

    const trialStorageOnlyTenantsExist = useTenantStore((state) =>
        hasLength(state.trialStorageOnly)
    );

    const getTrialOnlyPrefixes = useTrialStorageOnly();

    useEffect(() => {
        if (bindingsHydrated) {
            const prefixes = collections.map((collection) =>
                stripPathing(collection, true)
            );

            getTrialOnlyPrefixes(prefixes).then(
                () => {},
                () => {}
            );
        }
    }, [bindingsHydrated, collections, getTrialOnlyPrefixes]);

    if (!bindingsHydrated || !trialStorageOnlyTenantsExist) {
        return null;
    }

    return (
        <AlertBox severity="warning" short>
            <Typography>{intl.formatMessage({ id: messageId })}</Typography>
        </AlertBox>
    );
}
