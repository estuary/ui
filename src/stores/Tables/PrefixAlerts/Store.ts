import produce from 'immer';
import { SelectTableStoreNames } from 'stores/names';
import { PrefixAlertTableState } from 'stores/Tables/PrefixAlerts/types';
import { getInitialState as getInitialSelectTableState } from 'stores/Tables/Store';
import { formatNotificationSubscriptionsByPrefix } from 'utils/notification-utils';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

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

            const response = await fetcher.throwOnError();

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
                    state.hydrated = true;

                    state.query.count = response.count ?? 0;
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
