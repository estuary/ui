import type {
    PostgrestFilterBuilder,
    PostgrestResponse,
} from '@supabase/postgrest-js';
import type { StatsFilter } from 'src/api/stats';
import type { LiveSpecsExtQuery } from 'src/hooks/useLiveSpecsExt';
import type {
    AsyncOperationProps,
    StoreWithHydration,
} from 'src/stores/extensions/Hydration';
import type { StoreApi } from 'zustand';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';
import { flatMap } from 'lodash';

import { getStatsByName } from 'src/api/stats';
import { EVERYTHING } from 'src/components/collection/Selector/Table/shared';
import { checkErrorMessage, FAILED_TO_FETCH } from 'src/services/shared';
import { supabaseRetry } from 'src/services/supabase';
import {
    getAsyncDefault,
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'src/stores/extensions/Hydration';
import { devtoolsOptions } from 'src/utils/store-utils';

export interface StatsSchema {
    [k: string]:
        | {
              bytes_written_by_me?: number;
              docs_written_by_me?: number;

              bytes_read_by_me?: number;
              docs_read_by_me?: number;

              bytes_written_to_me?: number;
              docs_written_to_me?: number;

              bytes_read_from_me?: number;
              docs_read_from_me?: number;
          }
        | undefined;
}

export type StatsResponse = StatsSchema | null;

export interface TableActionSettings {
    deleteAssociatedCollections?: string[];
}

// TODO (typing) Need to let us pass in a type for the selected value type
export interface SelectableTableStore extends StoreWithHydration {
    rows: Map<string, any>;
    setRows: (val: LiveSpecsExtQuery[]) => void;
    removeRows: () => void;

    selected: Map<string, any>;
    setSelected: (
        key: string | string[],
        value: any,
        isSelected: boolean
    ) => void;
    setAllSelected: (isSelected: boolean, valueProperty?: string) => void;
    resetSelected: () => void;
    disableMultiSelect: boolean;
    setDisableMultiSelect: (
        val: SelectableTableStore['disableMultiSelect']
    ) => void;

    disabledRows: string[];
    setDisabledRows: (val: string | string[]) => void;

    successfulTransformations: number;
    incrementSuccessfulTransformations: () => void;

    resetState: (keepCount: boolean) => void;

    setQuery: (query: PostgrestFilterBuilder<any, any, any>) => void;
    query: AsyncOperationProps;
    hydrate: () => void;

    setStats: () => void;
    stats: StatsResponse;
    statsFailed: boolean;
    setStatsFailed: (val: boolean) => void;

    statsFilter: StatsFilter;
    setStatsFilter: (val: SelectableTableStore['statsFilter']) => void;

    actionSettings: TableActionSettings;
    setActionSettings: (
        setting: keyof SelectableTableStore['actionSettings'],
        values: string[],
        addOperation: boolean
    ) => void;
    resetActionSettings: () => void;
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
    | 'actionSettings'
    | 'disabledRows'
    | 'query'
    | 'rows'
    | 'selected'
    | 'disableMultiSelect'
    | 'stats'
    | 'statsFailed'
    | 'statsFilter'
    | 'successfulTransformations'
> => {
    return {
        actionSettings: {},
        disabledRows: [],
        query: getAsyncDefault(),
        rows: initialCreateStates.rows(),
        selected: initialCreateStates.selected(),
        disableMultiSelect: false,
        stats: null,
        statsFailed: false,
        statsFilter: 'today',
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

        resetSelected: () => {
            set(
                produce(({ selected }: SelectableTableStore) => {
                    selected.clear();
                }),
                false,
                'Selected rows reset'
            );
        },

        setDisableMultiSelect: (value) => {
            set(
                produce((state: SelectableTableStore) => {
                    state.disableMultiSelect = value;
                }),
                false,
                'Single Select set'
            );
        },

        setStatsFailed: (value) => {
            set(
                produce((state: SelectableTableStore) => {
                    state.statsFailed = value;
                }),
                false,
                'Stats Failed set'
            );
        },

        setDisabledRows: (value) => {
            set(
                produce((state: SelectableTableStore) => {
                    if (typeof value === 'string') {
                        state.disabledRows.push(value);
                    } else {
                        state.disabledRows = value;
                    }
                }),
                false,
                'Disabled rows changed'
            );
        },

        setSelected: (keys, value, isSelected) => {
            set(
                produce((state: SelectableTableStore) => {
                    const { selected, disableMultiSelect: singleSelect } =
                        state;
                    const updateValue = (key: string) => {
                        if (isSelected) {
                            if (singleSelect) {
                                state.disabledRows = [];
                                selected.clear();
                            }

                            selected.set(key, value);
                        } else {
                            selected.delete(key);
                        }
                    };

                    if (typeof keys === 'string') {
                        updateValue(keys);
                    } else {
                        keys.forEach((key) => updateValue(key));
                    }
                }),
                false,
                'Selected rows changed'
            );
        },

        setAllSelected: (isSelected, valueProperty) => {
            set(
                produce(
                    ({
                        disabledRows,
                        rows,
                        selected,
                        disableMultiSelect: singleSelect,
                    }: SelectableTableStore) => {
                        // just being safe here. This should not be called when single select so just returning
                        if (singleSelect) {
                            return;
                        }

                        if (isSelected) {
                            rows.forEach((value, key) => {
                                // TODO (setAllSelected) this is not a awesome solution and needs to be made awesome
                                //  We should change the `valueProperty` to be an object that contains settings. That way
                                //  we can easily check what key should be used OR if we should include the entire object OR
                                //  include null. As I think having a default here is not the best idea.... that way we do not have
                                //  this kind of issue in the future.
                                const evaluatedValue = valueProperty
                                    ? valueProperty === EVERYTHING
                                        ? value
                                        : value[valueProperty]
                                    : null;

                                // if the name is disabled then don't add it here
                                if (
                                    !disabledRows.includes(value.catalog_name)
                                ) {
                                    selected.set(key, evaluatedValue);
                                }
                            });
                        } else {
                            selected.clear();
                        }
                    }
                ),
                false,
                'Selected rows changed'
            );
        },

        setRows: (val) => {
            set(
                produce(({ rows }) => {
                    // Reset rows so we start with an empty map
                    rows.clear();

                    // Go through all the rows and add to the map
                    val.forEach((el) => {
                        rows.set(el.id, el);
                    });
                }),
                false,
                'Rows populated'
            );
        },

        setStatsFilter: (val) => {
            const filterChanged = get().statsFilter !== val;

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
                get().setStats();
            }
        },

        setStats: async () => {
            const { response } = get().query;
            const catalogNames = flatMap(response, (data) => {
                return data.catalog_name;
            });

            if (response && response.length > 0) {
                const { data, error } = await getStatsByName(
                    catalogNames,
                    get().statsFilter
                );

                if (error) {
                    get().setHydrationErrorsExist(true);
                    get().setStatsFailed(true);
                    // data is not always returned
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                } else if (data) {
                    if (data.length > 0) {
                        const statsData: StatsSchema = {};
                        data.forEach((datum) => {
                            const { catalog_name } = datum;
                            const currentStat = statsData[catalog_name];

                            if (currentStat) {
                                (
                                    Object.entries(currentStat) as [
                                        keyof typeof currentStat,
                                        number | any,
                                    ][]
                                ).forEach(([key, value]) => {
                                    if (typeof value === 'number') {
                                        currentStat[key] ||= 0;
                                        currentStat[key] += datum[key] ?? 0;
                                    }
                                });
                            } else {
                                statsData[catalog_name] = datum;
                            }
                            return datum;
                        });

                        set(
                            produce((state) => {
                                state.stats = statsData;
                                state.statsFailed = false;
                            }),
                            false,
                            'Table Store Stats Hydration Success'
                        );
                    } else {
                        set(
                            produce((state) => {
                                state.stats = [];
                                state.statsFailed = false;
                            }),
                            false,
                            'Table Store Stats Hydration Success : Empty'
                        );
                    }
                }
            } else {
                get().setHydrationErrorsExist(true);
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

        setActionSettings: (setting, values, addOperation) => {
            set(
                produce((state: SelectableTableStore) => {
                    const existingEl = state.actionSettings[setting] ?? [];

                    if (addOperation) {
                        state.actionSettings[setting] =
                            existingEl.concat(values);
                    } else if (existingEl.length > 0) {
                        state.actionSettings[setting] = existingEl.filter(
                            (el) => !values.includes(el)
                        );
                    }
                }),
                false,
                'Action Settings Set'
            );
        },

        resetActionSettings: () => {
            set(
                produce((state: SelectableTableStore) => {
                    state.actionSettings = {};
                }),
                false,
                'Action Settings Reset'
            );
        },

        resetState: (keepCount) => {
            // Safe to use `set` and `get` together here
            const previousCount = get().query.count;

            set(
                { ...getInitialStateData(), ...getInitialHydrationData() },
                false,
                'Resetting State'
            );

            // We do not always want to reset the `count` because we only fetch count
            //  when a user is on the first page of a table. Keeping `count` around after
            //  reset means they can easily click the back button and come back to a table
            //  that has pagination enabled.
            if (keepCount) {
                set(
                    produce((state: SelectableTableStore) => {
                        state.query.count = previousCount;
                    }),
                    false,
                    'Resetting State - Add Count Again'
                );
            }
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

            const response = await supabaseRetry<PostgrestResponse<any>>(
                () => fetcher,
                'tablesHydrateStore'
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
                        // We have no count and just recieved one so update
                        //  ex: initial load
                        (!state.query.count && hasNewCount) ||
                        // We already have a count, but there is a new one, and it has changed
                        //  ex: user entered a filter or count change since last time they viewed the 1st page
                        (state.query.count !== response.count && hasNewCount)
                    ) {
                        state.query.count = response.count;
                    }

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
                    state.query.networkFailed = false;
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
        failed: (state: SelectableTableStore) => state.statsFailed,
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
        networkFailed: (state: SelectableTableStore) =>
            state.query.networkFailed,
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
        reset: (state: SelectableTableStore) => state.resetSelected,
    },
    disableMultiSelect: {
        get: (state: SelectableTableStore) => state.disableMultiSelect,
        set: (state: SelectableTableStore) => state.setDisableMultiSelect,
    },
    successfulTransformations: {
        get: (state: SelectableTableStore) => state.successfulTransformations,
        increment: (state: SelectableTableStore) =>
            state.incrementSuccessfulTransformations,
    },
    actionSettings: {
        get: (state: SelectableTableStore) => state.actionSettings,
        set: (state: SelectableTableStore) => state.setActionSettings,
        reset: (state: SelectableTableStore) => state.resetActionSettings,
    },
    hydrated: {
        get: (state: SelectableTableStore) => state.hydrated,
        set: (state: SelectableTableStore) => state.setHydrated,
    },
};
