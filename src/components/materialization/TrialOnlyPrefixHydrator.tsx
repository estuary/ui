import { getTrialCollections } from 'api/liveSpecsExt';
import useTrialStorageOnly from 'hooks/useTrialStorageOnly';
import { difference } from 'lodash';
import { useEffect, useMemo } from 'react';
import { useBinding_collections } from 'stores/Binding/hooks';
import { useBindingStore } from 'stores/Binding/Store';
import { useTrialMetadataStore } from 'stores/TrialMetadata/Store';
import { BaseComponentProps } from 'types';
import { hasLength, stripPathing } from 'utils/misc-utils';
import { useShallow } from 'zustand/react/shallow';

export default function TrialOnlyPrefixHydrator({
    children,
}: BaseComponentProps) {
    const bindingsHydrated = useBindingStore((state) => state.hydrated);
    const setSourceBackfillRecommended = useBindingStore(
        (state) => state.setSourceBackfillRecommended
    );
    const collections = useBinding_collections();

    const trialOnlyPrefixes = useTrialMetadataStore(
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
                (trialPrefixes) => {
                    if (hasLength(trialPrefixes)) {
                        getTrialCollections(trialPrefixes).then(
                            (response) => {
                                if (response.error) {
                                    return;
                                }

                                setSourceBackfillRecommended(response.data);
                            },
                            () => {}
                        );
                    }
                },
                () => {}
            );
        }
    }, [
        bindingsHydrated,
        getTrialOnlyPrefixes,
        newPrefixes,
        setSourceBackfillRecommended,
    ]);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}
