import { LiveSpecsExtQuery } from 'hooks/useLiveSpecsExt';
import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import create, { GetState } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

export interface SelectableTableStore {
    rows: Map<string, any>;
    setRows: (val: LiveSpecsExtQuery[]) => void;
    removeRows: () => void;

    selected: Map<string, any>;
    setSelected: (
        val: SelectableTableStore['selected'],
        isSelected: boolean
    ) => void;
    setAllSelected: (isSelected: boolean) => void;

    resetState: () => void;
}

export const initialCreateStates = {
    rows: () => {
        return new Map();
    },
    selected: () => {
        return new Map();
    },
};

export const getInitialStateData = (): Pick<
    SelectableTableStore,
    'selected' | 'rows'
> => {
    return {
        selected: initialCreateStates.selected(),
        rows: initialCreateStates.rows(),
    };
};

export const getInitialState = (
    set: NamedSet<SelectableTableStore>,
    get: GetState<SelectableTableStore>
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

        removeRows: () => {
            set(
                produce(({ rows }) => {
                    rows.clear();
                }),
                false,
                'Selected rows reset'
            );
        },

        resetState: () => {
            set(getInitialStateData(), false, 'Resetting State');
        },
    };
};

export const createSelectableTableStore = (key: string) => {
    return create<SelectableTableStore>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};

export const selectableTableStoreSelectors = {
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
};
