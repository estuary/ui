import useTrialStorageOnly from 'hooks/useTrialStorageOnly';
import { difference } from 'lodash';
import { useEffect, useMemo } from 'react';
import { useBinding_collections } from 'stores/Binding/hooks';
import { useBindingStore } from 'stores/Binding/Store';
import { useTenantStore } from 'stores/Tenant/Store';
import { BaseComponentProps } from 'types';
import { stripPathing } from 'utils/misc-utils';
import { useShallow } from 'zustand/react/shallow';

export default function TrialOnlyPrefixHydrator({
    children,
}: BaseComponentProps) {
    const bindingsHydrated = useBindingStore((state) => state.hydrated);
    const collections = useBinding_collections();

    const trialOnlyPrefixes = useTenantStore(
        useShallow((state) => state.trialStorageOnly)
    );

    const getTrialOnlyPrefixes = useTrialStorageOnly();

    const newPrefixes = useMemo(
        () =>
            difference(
                collections.map((collection) => stripPathing(collection, true)),
                trialOnlyPrefixes
            ),
        [collections, trialOnlyPrefixes]
    );

    useEffect(() => {
        if (bindingsHydrated) {
            getTrialOnlyPrefixes(newPrefixes).then(
                () => {},
                () => {}
            );
        }
    }, [bindingsHydrated, getTrialOnlyPrefixes, newPrefixes]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}
