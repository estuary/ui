import { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { getStatsByName } from 'api/stats';
import { LiveSpecsExtQuery } from 'hooks/useLiveSpecsExt';
import produce from 'immer';
import {
    AsyncOperationProps,
    getAsyncDefault,
    getStoreWithHydrationSettings,
    StoreWithHydration,
} from 'stores/Hydration';
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

    setStats: (query: PostgrestFilterBuilder<any>) => void;
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
    'selected' | 'rows' | 'successfulTransformations' | 'query'
> => {
    return {
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
            const { rows } = get();
            const catalogNames = Array.from(rows.keys());

            if (catalogNames.length > 0) {
                const { data, error } = await getStatsByName(catalogNames);

                if (error) {
                    const { setHydrationErrorsExist } = get();
                    setHydrationErrorsExist(true);
                }

                if (data && data.length > 0) {
                    data.forEach((el) => {
                        const currRow = rows.get(el.catalog_name);
                        if (currRow) {
                            rows.set(el.catalog_name, {
                                ...currRow,
                                ...el,
                            });
                        }
                    });

                    set({ rows });
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

            // try {
            //     // setStatsLoaded(false);
            //     const { data: statsData, error: statsError } =
            //         await getStatsByName(
            //             rowData.map((rowDatum) => rowDatum.catalog_name)
            //         );

            //     if (statsError) {
            //         console.error('Uh oh ', statsError);
            //         return setHydrationErrorsExist(true);
            //     }

            //     if (statsData && statsData.length > 0) {
            //         newRows = [];
            //         console.log('statsData', statsData);

            //         rowData.forEach((row) => {
            //             statsData.forEach((stats) => {
            //                 const foo = find(newRows, {
            //                     catalog_name: row.catalog_name,
            //                 });
            //                 if (newRows && !foo?.stats) {
            //                     newRows.push({
            //                         ...row,
            //                         stats:
            //                             stats.catalog_name === row.catalog_name
            //                                 ? stats
            //                                 : undefined,
            //                     });
            //                 }
            //             });
            //         });
            //     }
            // } catch (e: unknown) {
            //     return setHydrationErrorsExist(true);
            // }
        },

        setQuery: async (query) => {
            set(
                produce((state) => {
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
