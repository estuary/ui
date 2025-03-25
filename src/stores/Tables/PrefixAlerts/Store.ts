import type { PostgrestResponse } from '@supabase/postgrest-js';
import produce from 'immer';
import { checkErrorMessage, FAILED_TO_FETCH } from 'services/shared';
import { supabaseRetry } from 'services/supabase';
import type { SelectTableStoreNames } from 'stores/names';
import type { PrefixAlertTableState } from 'stores/Tables/PrefixAlerts/types';
import { getInitialState as getInitialSelectTableState } from 'stores/Tables/Store';
import { formatNotificationSubscriptionsByPrefix } from 'utils/notification-utils';
import { devtoolsOptions } from 'utils/store-utils';
import type { StoreApi } from 'zustand';
import { create } from 'zustand';
import type { NamedSet } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

export const getInitialState = (
    set: NamedSet<PrefixAlertTableState>,
    get: StoreApi<PrefixAlertTableState>['getState']
): PrefixAlertTableState => {
    return {
        ...getInitialSelectTableState(set, get),

        hydrate: async () => {
            const { fetcher } = get().query;

            if (!fetcher) {
                throw new Error(
                    'You must populate the query before hydrating.'
                );
            }

            set(
                produce((state) => {
                    state.query.loading = true;
                }),
                false,
                'Table Store Hydration Start'
            );

            const response = await supabaseRetry<PostgrestResponse<any>>(
                () => fetcher,
                'prefixAlertTableHydrateStore'
            );

            if (response.error) {
                set(
                    produce((state) => {
                        state.query.response = null;
                        state.query.loading = false;
                        state.query.error = response.error;
                    }),
                    false,
                    'Table Store Hydration Failure'
                );
            }

            set(
                produce((state) => {
                    state.query.networkFailed = checkErrorMessage(
                        FAILED_TO_FETCH,
                        response.error?.message
                    );

                    state.hydrated = true;

                    const hasNewCount = Number.isInteger(response.count);
                    if (
                        // We have no count and just received one so update
                        //  ex: initial load
                        (!state.query.count && hasNewCount) ||
                        // We already have a count, but there is a new one, and it has changed
                        //  ex: user entered a filter or count change since last time they viewed the 1st page
                        (state.query.count !== response.count && hasNewCount)
                    ) {
                        state.query.count = response.count;
                    }

                    state.query.response = Object.entries(
                        formatNotificationSubscriptionsByPrefix(
                            response.data ?? []
                        )
                    );
                    state.query.loading = false;
                }),
                false,
                'Table Store Hydration Success'
            );
        },
    };
};

export const createPrefixAlertTableStore = (
    key: SelectTableStoreNames.PREFIX_ALERTS
) => {
    return create<PrefixAlertTableState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};
