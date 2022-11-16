import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { getStatsByName } from 'api/stats';
import { LiveSpecsExtQuery } from 'hooks/useLiveSpecsExt';
import produce from 'immer';
import { flatMap } from 'lodash';
import {
    AsyncOperationProps,
    getAsyncDefault,
    getStoreWithHydrationSettings,
    StoreWithHydration,
} from 'stores/Hydration';
import { Schema } from 'types';
import { devtoolsOptions } from 'utils/store-utils';
import create, { StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

export interface SelectableTableStore extends StoreWithHydration {
    rows: Map<string, any>;
    setRows: (val: LiveSpecsExtQuery[]) => void;
    removeRows: () => void;

    selected: Map<string, any>;
    setSelected: (
        val: SelectableTableStore['selected'],
        isSelected: boolean
    ) => void;
    setAllSelected: (isSelected: boolean) => void;

    successfulTransformations: number;
    incrementSuccessfulTransformations: () => void;

    resetState: () => void;

    setQuery: (query: PostgrestFilterBuilder<any>) => void;
    query: AsyncOperationProps;
    hydrate: () => void;

    setStats: () => void;
    stats: Schema | null;
}

export const initialCreateStates = {
    rows: () => {
        return new Map();
    },
    selected: () => {
        return new Map();
    },
    successfulTransformations: 0,
};

export const getInitialStateData = (): Pick<
    SelectableTableStore,
    'selected' | 'rows' | 'successfulTransformations' | 'query' | 'stats'
> => {
    return {
        stats: null,
        query: getAsyncDefault(),
        selected: initialCreateStates.selected(),
        rows: initialCreateStates.rows(),
        successfulTransformations:
            initialCreateStates.successfulTransformations,
    };
};

export const getInitialState = (
    set: NamedSet<SelectableTableStore>,
    get: StoreApi<SelectableTableStore>['getState']
): SelectableTableStore => {
    return {
        ...getInitialStateData(),
        ...getStoreWithHydrationSettings('Table Store', set),

        setSelected: (val, isSelected) => {
            set(
                produce(({ selected }) => {
                    if (isSelected) {
                        selected.set(val, null);
                    } else {
                        selected.delete(val);
                    }
                }),
                false,
                'Selected rows changed'
            );
        },

        setAllSelected: (isSelected) => {
            set(
                produce(({ selected }) => {
                    if (isSelected) {
                        const { rows } = get();

                        rows.forEach((value, key) => {
                            selected.set(key, null);
                        });
                    } else {
                        selected.clear();
                    }
                }),
                false,
                'Selected rows changed'
            );
        },

        setRows: (val) => {
            set(
                produce(({ rows }) => {
                    val.forEach((el) => {
                        rows.set(el.id, el);
                    });
                }),
                false,
                'Rows populated'
            );
        },

        setStats: async () => {
            const { response } = get().query;
            const catalogNames = flatMap(response, (data) => {
                return data.catalog_name;
            });

            if (response.length > 0) {
                const { data, error } = await getStatsByName(catalogNames);

                if (error) {
                    const { setHydrationErrorsExist } = get();
                    setHydrationErrorsExist(true);
                }

                if (data && data.length > 0) {
                    const statsData = {};
                    data.forEach((datum) => {
                        const { catalog_name } = datum;
                        const currentStat = statsData[catalog_name];

                        if (currentStat) {
                            Object.entries(currentStat).forEach(
                                ([key, value]) => {
                                    if (typeof value === 'number') {
                                        currentStat[key] =
                                            currentStat[key] || 0;
                                        currentStat[key] += datum[key];
                                    }
                                }
                            );
                        } else {
                            statsData[catalog_name] = datum;
                        }
                        return datum;
                    });

                    console.log('setting stats', statsData);
                    set(
                        produce((state) => {
                            state.stats = statsData;
                        }),
                        false,
                        'Table Store Stats Hydration Success'
                    );
                }
            }
        },

        removeRows: () => {
            set(
                produce(({ rows }) => {
                    rows.clear();
                }),
                false,
                'Selected rows reset'
            );
        },

        incrementSuccessfulTransformations: () => {
            set(
                produce((state) => {
                    state.successfulTransformations += 1;
                }),
                false,
                'Successful Transformations Incremented'
            );
        },

        resetState: () => {
            set(getInitialStateData(), false, 'Resetting State');
        },

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

                    state.query.count = response.count;
                    state.query.response = response.data;
                    state.query.loading = false;
                }),
                false,
                'Table Store Hydration Success'
            );
        },

        setQuery: async (query) => {
            set(
                produce((state) => {
                    state.query.loading = true;
                    state.query.fetcher = query;
                }),
                false,
                'Table Store Query Fetcher Set'
            );
        },
    };
};

export const createSelectableTableStore = (key: string) => {
    return create<SelectableTableStore>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};

export const selectableTableStoreSelectors = {
    stats: {
        set: (state: SelectableTableStore) => state.setStats,
        get: (state: SelectableTableStore) => state.stats,
    },
    query: {
        hydrate: (state: SelectableTableStore) => state.hydrate,
        set: (state: SelectableTableStore) => state.setQuery,
        response: (state: SelectableTableStore) => state.query.response,
        loading: (state: SelectableTableStore) => state.query.loading,
        error: (state: SelectableTableStore) => state.query.error,
        count: (state: SelectableTableStore) => state.query.count,
    },
    rows: {
        get: (state: SelectableTableStore) => state.rows,
        set: (state: SelectableTableStore) => state.setRows,
        reset: (state: SelectableTableStore) => state.removeRows,
    },
    selected: {
        get: (state: SelectableTableStore) => state.selected,
        set: (state: SelectableTableStore) => state.setSelected,
        setAll: (state: SelectableTableStore) => state.setAllSelected,
    },
    successfulTransformations: {
        get: (state: SelectableTableStore) => state.successfulTransformations,
        increment: (state: SelectableTableStore) =>
            state.incrementSuccessfulTransformations,
    },
};
