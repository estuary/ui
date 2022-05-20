import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import create from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

export interface TableStore {
    selected: Map<string, Object>;
    setSelected: (val: TableStore['selected']) => void;
    removeSelected: (val: TableStore['selected']) => void;

    resetState: () => void;
}

export const initialCreateStates = {
    selected: () => {
        return new Map();
    },
};

export const getInitialStateData = (): Pick<TableStore, 'selected'> => {
    return {
        selected: initialCreateStates.selected(),
    };
};

export const getInitialState = (set: NamedSet<TableStore>): TableStore => {
    return {
        ...getInitialStateData(),
        setSelected: (val) => {
            set(
                produce(({ selected }) => {
                    selected.set(val, {});
                }),
                false,
                'Selected rows changed'
            );
        },

        removeSelected: (val) => {
            set(
                produce(({ selected }) => {
                    selected.delete(val);
                }),
                false,
                'Selected rows changed'
            );
        },

        resetState: () => {
            set(getInitialStateData(), false, 'Resetting State');
        },
    };
};

export const useSelectableTableStore = create<TableStore>()(
    devtools(getInitialState, devtoolsOptions('selectable-table-state'))
);

export default useSelectableTableStore;

export const selectableTableStoreSelectors = {
    selected: (state: TableStore) => state.selected,
    set: (state: TableStore) => state.setSelected,
    remove: (state: TableStore) => state.removeSelected,
};
