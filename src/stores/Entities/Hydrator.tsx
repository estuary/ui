import FullPageError from 'components/fullPage/Error';
import FullPageSpinner from 'components/fullPage/Spinner';
import { singleCallSettings } from 'context/SWR';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import useSWR from 'swr';
import { BaseComponentProps } from 'types';
import {
    useEntitiesStore_hydrated,
    useEntitiesStore_hydrateState,
    useEntitiesStore_hydrationErrors,
    useEntitiesStore_setCapabilities,
    useEntitiesStore_setHydrated,
    useEntitiesStore_setHydrationErrors,
} from './hooks';

export const EntitiesHydrator = ({ children }: BaseComponentProps) => {
    // Start fetching the prefixes they have access to
    const hydrateState = useEntitiesStore_hydrateState();
    const { data, error, isValidating } = useSWR(
        'entities_hydrator',
        () => {
            return hydrateState();
        },
        singleCallSettings
    );

    // The rest of the stuff we need to handle hydration
    const hydrated = useEntitiesStore_hydrated();
    const hydrationErrors = useEntitiesStore_hydrationErrors();
    const setHydrationErrors = useEntitiesStore_setHydrationErrors();
    const setCapabilities = useEntitiesStore_setCapabilities();
    const setHydrated = useEntitiesStore_setHydrated();

    // Once we are done validating update all the settings
    useEffect(() => {
        if (!isValidating) {
            setHydrationErrors(error);
            setCapabilities(data?.data ?? null);
            setHydrated(true);
        }
    }, [
        data,
        error,
        isValidating,
        setCapabilities,
        setHydrated,
        setHydrationErrors,
    ]);

    if (!hydrated) {
        return <FullPageSpinner />;
    }

    if (hydrationErrors) {
        return (
            <FullPageError
                error={hydrationErrors}
                title={<FormattedMessage id="fullpage.error" />}
            />
        );
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};
