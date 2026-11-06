import type { SpecDef } from 'src/types/schemaModels';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';
import { invert } from 'lodash';

import { devtoolsOptions } from 'src/utils/store-utils';

interface SecretsState {
    secretNames: Record<string, string>;
    secretValues: Record<string, string>;
    serverUpdateRequired: boolean;

    setSecretName: (pointer: string, name: string) => void;
    setSecretValue: (pointer: string, value: string) => void;
    setSecretsSaved: () => void;

    hydrate: (spec: SpecDef | null) => void;
    resetState: () => void;
}

const getInitialStateData = (): Pick<
    SecretsState,
    'secretNames' | 'secretValues' | 'serverUpdateRequired'
> => ({
    secretNames: {},
    secretValues: {},
    serverUpdateRequired: false,
});

const getInitialState = (set: NamedSet<SecretsState>): SecretsState => ({
    ...getInitialStateData(),

    setSecretName: (pointer, name) => {
        set(
            produce((state: SecretsState) => {
                if (state.secretNames[pointer] !== name) {
                    state.secretNames[pointer] = name;
                    state.serverUpdateRequired = true;
                }
            }),
            false,
            'Secret Name Set'
        );
    },

    hydrate: (spec) => {
        set(
            produce((state: SecretsState) => {
                const secrets = spec?.secrets ?? {};
                state.secretNames = invert(secrets);
            }),
            false,
            'Secret Names Hydrated'
        );
    },

    setSecretValue: (pointer, value) => {
        set(
            produce((state: SecretsState) => {
                state.secretValues[pointer] = value;
                state.serverUpdateRequired = true;
            }),
            false,
            'Secret Value Set'
        );
    },

    setSecretsSaved: () => {
        set(
            produce((state: SecretsState) => {
                state.serverUpdateRequired = false;
            }),
            false,
            'Secrets Saved'
        );
    },

    resetState: () => {
        set({ ...getInitialStateData() }, false, 'Secrets State Reset');
    },
});

export const useSecretsStore = create<SecretsState>()(
    devtools((set) => getInitialState(set), devtoolsOptions('secrets'))
);
