import { getStatsByName } from 'api/stats';
import { LiveSpecsExtQuery } from 'hooks/useLiveSpecsExt';
import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import create, { StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

export interface SelectableTableStore {
    rows: Map<string, any>;
    setRows: (val: LiveSpecsExtQuery[]) => void;
    removeRows: () => void;

    setStats: () => void;

    selected: Map<string, any>;
    setSelected: (
        val: SelectableTableStore['selected'],
        isSelected: boolean
    ) => void;
    setAllSelected: (isSelected: boolean) => void;

    successfulTransformations: number;
    incrementSuccessfulTransformations: () => void;

    resetState: () => void;

    hydrated: boolean;
    setHydrated: (value: boolean) => void;

    hydrationErrorsExist: boolean;
    setHydrationErrorsExist: (value: boolean) => void;
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
    | 'hydrated'
    | 'hydrationErrorsExist'
> => {
    return {
        hydrated: false,
        hydrationErrorsExist: false,
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

        setHydrated: (value) => {
            set(
                produce((state) => {
                    state.hydrated = value;
                }),
                false,
                'Table Store Hydrated'
            );
        },

        setHydrationErrorsExist: (value) => {
            set(
                produce((state) => {
                    state.hydrationErrorsExist = value;
                }),
                false,
                'Table Store Hydrated'
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
