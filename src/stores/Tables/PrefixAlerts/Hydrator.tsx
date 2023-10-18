import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { useZustandStore } from 'context/Zustand/provider';
import useNotificationPreferences from 'hooks/notifications/useNotificationPreferences';
import { useEffect } from 'react';
import { useUnmount } from 'react-use';
import { SelectTableStoreNames } from 'stores/names';
import { usePrefixAlertTable_hydrateContinuously } from 'stores/Tables/PrefixAlerts/hooks';
import {
    SelectableTableStore,
    selectableTableStoreSelectors,
} from 'stores/Tables/Store';
import { BaseComponentProps, NotificationPreferenceExt } from 'types';

// Hydrator
interface TableHydratorProps extends BaseComponentProps {
    query: PostgrestFilterBuilder<NotificationPreferenceExt>;
}

export const PrefixAlertTableHydrator = ({
    children,
    query,
}: TableHydratorProps) => {
    const setQuery = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['setQuery']
    >(
        SelectTableStoreNames.PREFIX_ALERTS,
        selectableTableStoreSelectors.query.set
    );

    const resetState = useZustandStore<
        SelectableTableStore,
        SelectableTableStore['resetState']
    >(
        SelectTableStoreNames.PREFIX_ALERTS,
        selectableTableStoreSelectors.state.reset
    );

    const hydrateState = usePrefixAlertTable_hydrateContinuously();

    const { data, error, isValidating } = useNotificationPreferences({
        query,
    });

    useEffect(() => {
        setQuery(query);
    }, [setQuery, query]);

    useEffect(() => {
        if (!isValidating) {
            hydrateState(data, error);
        }
    }, [hydrateState, data, error, isValidating]);

    // Reset state when leaving until we work out how we want to cache table stuff
    useUnmount(() => {
        resetState();
    });

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
};

export default PrefixAlertTableHydrator;
