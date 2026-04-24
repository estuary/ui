import type { TargetNamingState } from 'src/stores/TargetNaming/types';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';

import { devtoolsOptions } from 'src/utils/store-utils';

const getInitialStateData = (): Pick<
    TargetNamingState,
    'model' | 'targetNamingStrategy' | 'saving'
> => ({
    model: null,
    targetNamingStrategy: null,
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
            'setModel'
        );
    },

    setTargetNamingStrategy: (value) => {
        set(
            produce((state: TargetNamingState) => {
                state.targetNamingStrategy = value;
            }),
            false,
            'setTargetNamingStrategy'
        );
    },

    setSaving: (value) => {
        set(
            produce((state: TargetNamingState) => {
                state.saving = value;
            }),
            false,
            'setSaving'
        );
    },

    resetState: () => {
        set({ ...getInitialStateData() }, false, 'resetState');
    },
});

export const useTargetNamingStore = create<TargetNamingState>()(
    devtools((set) => getInitialState(set), devtoolsOptions('target-naming'))
);
