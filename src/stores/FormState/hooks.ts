import type { EntityFormState } from 'src/stores/FormState/types';
import type { EntityWorkflow } from 'src/types';

import { useEntityWorkflow } from 'src/context/Workflow';
import { useZustandStore } from 'src/context/Zustand/provider';
import { FormStateStoreNames } from 'src/stores/names';

const storeName = (workflow: EntityWorkflow | null): FormStateStoreNames => {
    switch (workflow) {
        case 'capture_create':
            return FormStateStoreNames.CAPTURE_CREATE;
        case 'capture_edit':
            return FormStateStoreNames.CAPTURE_EDIT;
        case 'collection_create':
            return FormStateStoreNames.COLLECTION_CREATE;
        case 'materialization_create':
            return FormStateStoreNames.MATERIALIZATION_CREATE;
        case 'materialization_edit':
            return FormStateStoreNames.MATERIALIZATION_EDIT;
        default: {
            throw new Error('Invalid FormState store name');
        }
    }
};

export const useFormStateStore_displayValidation = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<
        EntityFormState,
        EntityFormState['formState']['displayValidation']
    >(storeName(workflow), (state) => state.formState.displayValidation);
};

export const useFormStateStore_status = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<
        EntityFormState,
        EntityFormState['formState']['status']
    >(storeName(workflow), (state) => state.formState.status);
};

export const useFormStateStore_showLogs = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<
        EntityFormState,
        EntityFormState['formState']['showLogs']
    >(storeName(workflow), (state) => state.formState.showLogs);
};

export const useFormStateStore_exitWhenLogsClose = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<
        EntityFormState,
        EntityFormState['formState']['exitWhenLogsClose']
    >(storeName(workflow), (state) => state.formState.exitWhenLogsClose);
};

export const useFormStateStore_logToken = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<
        EntityFormState,
        EntityFormState['formState']['logToken']
    >(storeName(workflow), (state) => state.formState.logToken);
};

export const useFormStateStore_error = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<
        EntityFormState,
        EntityFormState['formState']['error']
    >(storeName(workflow), (state) => state.formState.error);
};

export const useFormStateStore_message = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<
        EntityFormState,
        EntityFormState['formState']['message']
    >(storeName(workflow), (state) => state.formState.message);
};

export const useFormStateStore_setFormState = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<EntityFormState, EntityFormState['setFormState']>(
        storeName(workflow),
        (state) => state.setFormState
    );
};

export const useFormStateStore_updateStatus = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<EntityFormState, EntityFormState['updateStatus']>(
        storeName(workflow),
        (state) => state.updateStatus
    );
};

export const useFormStateStore_isIdle = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<EntityFormState, EntityFormState['isIdle']>(
        storeName(workflow),
        (state) => state.isIdle
    );
};

export const useFormStateStore_isActive = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<EntityFormState, EntityFormState['isActive']>(
        storeName(workflow),
        (state) => state.isActive
    );
};

export const useFormStateStore_resetState = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<EntityFormState, EntityFormState['resetState']>(
        storeName(workflow),
        (state) => state.resetState
    );
};

export const useFormStateStore_messagePrefix = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<EntityFormState, EntityFormState['messagePrefix']>(
        storeName(workflow),
        (state) => state.messagePrefix
    );
};

export const useFormStateStore_liveSpec = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<EntityFormState, EntityFormState['liveSpec']>(
        storeName(workflow),
        (state) => state.liveSpec
    );
};

export const useFormStateStore_setLiveSpec = () => {
    const workflow = useEntityWorkflow();

    return useZustandStore<EntityFormState, EntityFormState['setLiveSpec']>(
        storeName(workflow),
        (state) => state.setLiveSpec
    );
};
