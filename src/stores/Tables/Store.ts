import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { getStatsByName, StatsFilter } from 'api/stats';
import { LiveSpecsExtQuery } from 'hooks/useLiveSpecsExt';
import produce from 'immer';
import { flatMap } from 'lodash';
import {
    AsyncOperationProps,
    getAsyncDefault,
    getStoreWithHydrationSettings,
    StoreWithHydration,
} from 'stores/Hydration';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

export interface StatsSchema {
    [k: string]:
        | {
              bytes_written_by_me?: number;
              docs_written_by_me?: number;

              bytes_read_by_me?: number;
              docs_read_by_me?: number;

              bytes_written_to_me?: number;
              docs_written_to_me?: number;
          }
        | undefined;
}

export type StatsResponse = StatsSchema | null;

export interface SelectableTableStore extends StoreWithHydration {
    rows: Map<string, any>;
    setRows: (val: LiveSpecsExtQuery[]) => void;
    removeRows: () => void;

    selected: Map<string, any>;
    setSelected: (
        key: SelectableTableStore['selected'],
        lastPubId: string,
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
    stats: StatsResponse;

    statsFilter: StatsFilter;
    setStatsFilter: (val: SelectableTableStore['statsFilter']) => void;
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
    | 'selected'
    | 'rows'
    | 'successfulTransformations'
    | 'query'
    | 'stats'
    | 'statsFilter'
> => {
    return {
        stats: null,
        statsFilter: 'today',
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

        setSelected: (key, lastPubId, isSelected) => {
            set(
                produce(({ selected }) => {
                    if (isSelected) {
                        selected.set(key, lastPubId);
                    } else {
                        selected.delete(key);
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

                        rows.forEach((_value, key) => {
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

        setStatsFilter: (val) => {
            const { setStats, statsFilter } = get();
            const filterChanged = statsFilter !== val;

            if (filterChanged) {
                set(
                    produce((state) => {
                        // We want to set stats back to null while loading
                        state.stats = null;
                        state.statsFilter = val;
                    }),
                    false,
                    'Setting stats filter'
                );

                // Need to update stats if the filter changed
                setStats();
            }
        },

        setStats: async () => {
            const { query, statsFilter, setHydrationErrorsExist } = get();
            const { response } = query;
            const catalogNames = flatMap(response, (data) => {
                return data.catalog_name;
            });

            if (response && response.length > 0) {
                const { data, error } = await getStatsByName(
                    catalogNames,
                    statsFilter
                );

                if (error) {
                    setHydrationErrorsExist(true);
                } else if (data) {
                    if (data.length > 0) {
                        const statsData: StatsSchema = {};
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

                        set(
                            produce((state) => {
                                state.stats = statsData;
                            }),
                            false,
                            'Table Store Stats Hydration Success'
                        );
                    } else {
                        set(
                            produce((state) => {
                                state.stats = [];
                            }),
                            false,
                            'Table Store Stats Hydration Success : Empty'
                        );
                    }
                }
            } else {
                setHydrationErrorsExist(true);
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
    state: {
        reset: (state: SelectableTableStore) => state.resetState,
    },
    stats: {
        set: (state: SelectableTableStore) => state.setStats,
        get: (state: SelectableTableStore) => state.stats,
    },
    statsFilter: {
        set: (state: SelectableTableStore) => state.setStatsFilter,
        get: (state: SelectableTableStore) => state.statsFilter,
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
