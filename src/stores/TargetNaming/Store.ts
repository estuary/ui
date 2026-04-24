import type { TargetNamingState } from 'src/stores/TargetNaming/types';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';

import { devtoolsOptions } from 'src/utils/store-utils';

const getInitialStateData = (): Pick<
    TargetNamingState,
    'model' | 'strategy' | 'saving'
> => ({
    model: null,
    strategy: null,
    saving: false,
});

const getInitialState = (
    set: NamedSet<TargetNamingState>
): TargetNamingState => ({
    ...getInitialStateData(),

    setModel: (value) => {
        set(
            produce((state: TargetNamingState) => {
                state.model = value;
            }),
            false,
            'Target Naming Model Set'
        );
    },

    setStrategy: (value) => {
        set(
            produce((state: TargetNamingState) => {
                state.strategy = value;
            }),
            false,
            'Target Naming Strategy Set'
        );
    },

    setSaving: (value) => {
        set(
            produce((state: TargetNamingState) => {
                state.saving = value;
            }),
            false,
            'Target Naming Saving Set'
        );
    },

    resetState: () => {
        set({ ...getInitialStateData() }, false, 'Target Naming Reset');
    },
});

export const useTargetNamingStore = create<TargetNamingState>()(
    devtools((set) => getInitialState(set), devtoolsOptions('target-naming'))
);
