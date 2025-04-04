import type { WorkflowState } from 'src/stores/Workflow/types';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';

import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'src/stores/extensions/Hydration';
import { devtoolsOptions } from 'src/utils/store-utils';

const STORE_KEY = 'workflow';

const getInitialStateData = (): Pick<
    WorkflowState,
    'customerId' | 'redirectUrl'
> => ({
    customerId: '',
    redirectUrl: '',
});

const getInitialState = (set: NamedSet<WorkflowState>): WorkflowState => ({
    ...getInitialStateData(),
    ...getStoreWithHydrationSettings(STORE_KEY, set),

    hydrateState: () => Promise.resolve(),

    setCustomerId: (value) => {
        set(
            produce((state: WorkflowState) => {
                state.customerId = value;
            }),
            false,
            'Customer ID set'
        );
    },

    setRedirectUrl: (value) => {
        set(
            produce((state: WorkflowState) => {
                state.redirectUrl = value;
            }),
            false,
            'Redirect URL set'
        );
    },

    resetState: () => {
        set(
            {
                ...getInitialStateData(),
                ...getInitialHydrationData(),
            },
            false,
            'Workflow state reset'
        );
    },
});

export const useWorkflowStore = create<WorkflowState>()(
    devtools((set, _get) => getInitialState(set), devtoolsOptions(STORE_KEY))
);
