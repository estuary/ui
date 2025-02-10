import produce from 'immer';
import { pull, union } from 'lodash';
import { hasLength } from 'utils/misc-utils';
import { devtoolsOptions } from 'utils/store-utils';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

export interface TrialMetadataState {
    addTrialStorageOnly: (value: string | string[]) => void;
    removeTrialStorageOnly: (value?: string) => void;
    trialStorageOnly: string[];
}

const getInitialStateData = (): Pick<
    TrialMetadataState,
    'trialStorageOnly'
> => ({
    trialStorageOnly: [],
});

const getInitialState = (
    set: NamedSet<TrialMetadataState>,
    _get: StoreApi<TrialMetadataState>['getState']
): TrialMetadataState => ({
    ...getInitialStateData(),

    addTrialStorageOnly: (values) => {
        set(
            produce((state: TrialMetadataState) => {
                if (
                    typeof values === 'string' &&
                    !state.trialStorageOnly.includes(values)
                ) {
                    state.trialStorageOnly.push(values);
                }

                if (typeof values !== 'string') {
                    state.trialStorageOnly = hasLength(values)
                        ? union(state.trialStorageOnly, values)
                        : [];
                }
            }),
            false,
            'Prefixes with trial storage only added'
        );
    },

    removeTrialStorageOnly: (value) => {
        set(
            produce((state: TrialMetadataState) => {
                if (value) {
                    state.trialStorageOnly = pull(
                        state.trialStorageOnly,
                        value
                    );

                    return;
                }

                state.trialStorageOnly = [];
            }),
            false,
            'Prefixes with trial storage only removed'
        );
    },
});

export const useTrialMetadataStore = create<TrialMetadataState>()(
    devtools(
        (set, get) => getInitialState(set, get),
        devtoolsOptions('trial-metadata')
    )
);
