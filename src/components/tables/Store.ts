import produce from 'immer';
import { devtoolsOptions } from 'utils/store-utils';
import create from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

export interface SelectableTableStore {
    selected: Map<string, any>;
    setSelected: (val: SelectableTableStore['selected']) => void;
    removeSelected: (val: SelectableTableStore['selected']) => void;

    resetState: () => void;
}

export const initialCreateStates = {
    selected: () => {
        return new Map();
    },
};

export const getInitialStateData = (): Pick<
    SelectableTableStore,
    'selected'
> => {
    return {
        selected: initialCreateStates.selected(),
    };
};

export const getInitialState = (
    set: NamedSet<SelectableTableStore>
): SelectableTableStore => {
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

export const createSelectableTableStore = (key: string) => {
    return create<SelectableTableStore>()(
        devtools((set) => getInitialState(set), devtoolsOptions(key))
    );
};

export const selectableTableStoreSelectors = {
    selected: (state: SelectableTableStore) => state.selected,
    set: (state: SelectableTableStore) => state.setSelected,
    remove: (state: SelectableTableStore) => state.removeSelected,
};
