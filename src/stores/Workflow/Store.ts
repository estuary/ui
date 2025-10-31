import type { WorkflowState } from 'src/stores/Workflow/types';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';

import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'src/stores/extensions/Hydration';
import { getStoreWithCollectionSettings } from 'src/stores/Workflow/slices/Collections';
import {
    getInitialProjectionData,
    getStoreWithProjectionSettings,
} from 'src/stores/Workflow/slices/Projections';
import { devtoolsOptions } from 'src/utils/store-utils';

const STORE_KEY = 'workflow';

const getInitialStateData = (): Pick<
    WorkflowState,
    | 'catalogName'
    | 'connectorMetadata'
    | 'customerId'
    | 'redirectUrl'
    | 'storageMappingPrefix'
> => ({
    catalogName: { root: '', suffix: '', tenant: '', whole: '' },
    connectorMetadata: [],
    customerId: '',
    redirectUrl: '',
    storageMappingPrefix: '',
});

const getInitialState = (set: NamedSet<WorkflowState>): WorkflowState => ({
    ...getInitialStateData(),
    ...getStoreWithHydrationSettings(STORE_KEY, set),
    ...getStoreWithProjectionSettings(set),
    ...getStoreWithCollectionSettings(set),

    resetState: () => {
        set(
            {
                ...getInitialStateData(),
                ...getInitialHydrationData(),
                ...getInitialProjectionData(),
            },
            false,
            'Workflow state reset'
        );
    },

    setCatalogName: (segments) => {
        set(
            produce((state: WorkflowState) => {
                state.catalogName = { ...state.catalogName, ...segments };
                state.catalogName.whole = `${state.catalogName.tenant}${state.catalogName.root}${state.catalogName.suffix}`;
            }),
            false,
            'catalog name set'
        );
    },

    setConnectorMetadata: (value) => {
        set(
            produce((state: WorkflowState) => {
                state.connectorMetadata = value;
            }),
            false,
            'connector metadata set'
        );
    },

    setCustomerId: (value) => {
        set(
            produce((state: WorkflowState) => {
                state.customerId = value;
            }),
            false,
            'customer ID set'
        );
    },

    setRedirectUrl: (value) => {
        set(
            produce((state: WorkflowState) => {
                state.redirectUrl = value;
            }),
            false,
            'redirect URL set'
        );
    },

    setStorageMappingPrefix: (value) => {
        set(
            produce((state: WorkflowState) => {
                state.storageMappingPrefix = value;
            }),
            false,
            'storage mapping prefix set'
        );
    },
});

export const useWorkflowStore = create<WorkflowState>()(
    devtools((set, _get) => getInitialState(set), devtoolsOptions(STORE_KEY))
);
