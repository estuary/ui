import { useEntityType } from 'context/EntityContext';
import { useZustandStore } from 'context/Zustand/provider';
import { DetailsFormState } from 'stores/DetailsForm/types';
import { DetailsFormStoreNames } from 'stores/names';
import { Entity } from 'types';

export const getStoreName = (entityType: Entity): DetailsFormStoreNames => {
    switch (entityType) {
        case 'capture':
            return DetailsFormStoreNames.CAPTURE;
        case 'materialization':
            return DetailsFormStoreNames.MATERIALIZATION;
        default: {
            throw new Error('Invalid DetailsForm store name');
        }
    }
};

// Selector hooks
export const useDetailsForm_connectorImage = () => {
    const entityType = useEntityType();
    return useZustandStore<
        DetailsFormState,
        DetailsFormState['details']['data']['connectorImage']
    >(getStoreName(entityType), (state) => state.details.data.connectorImage);
};

export const useDetailsForm_connectorImage_connectorId = () => {
    const entityType = useEntityType();
    return useZustandStore<
        DetailsFormState,
        DetailsFormState['details']['data']['connectorImage']['connectorId']
    >(
        getStoreName(entityType),
        (state) => state.details.data.connectorImage.connectorId
    );
};

export const useDetailsForm_connectorImage_id = () => {
    const entityType = useEntityType();
    return useZustandStore<
        DetailsFormState,
        DetailsFormState['details']['data']['connectorImage']['id']
    >(
        getStoreName(entityType),
        (state) => state.details.data.connectorImage.id
    );
};

export const useDetailsForm_connectorImage_imagePath = () => {
    const entityType = useEntityType();
    return useZustandStore<
        DetailsFormState,
        DetailsFormState['details']['data']['connectorImage']['imagePath']
    >(
        getStoreName(entityType),
        (state) => state.details.data.connectorImage.imagePath
    );
};

export const useDetailsForm_details = () => {
    const entityType = useEntityType();
    return useZustandStore<
        DetailsFormState,
        DetailsFormState['details']['data']
    >(getStoreName(entityType), (state) => state.details.data);
};

export const useDetailsForm_details_description = () => {
    const entityType = useEntityType();
    return useZustandStore<
        DetailsFormState,
        DetailsFormState['details']['data']['description']
    >(getStoreName(entityType), (state) => state.details.data.description);
};

export const useDetailsForm_details_entityName = () => {
    const entityType = useEntityType();
    return useZustandStore<
        DetailsFormState,
        DetailsFormState['details']['data']['entityName']
    >(getStoreName(entityType), (state) => state.details.data.entityName);
};

export const useDetailsForm_setDetails = () => {
    const entityType = useEntityType();
    return useZustandStore<DetailsFormState, DetailsFormState['setDetails']>(
        getStoreName(entityType),
        (state) => state.setDetails
    );
};

export const useDetailsForm_setDetails_connector = () => {
    const entityType = useEntityType();
    return useZustandStore<
        DetailsFormState,
        DetailsFormState['setDetails_connector']
    >(getStoreName(entityType), (state) => state.setDetails_connector);
};

const errorsExistSelector = (state: DetailsFormState) =>
    state.detailsFormErrorsExist;
export const useDetailsForm_errorsExist = () => {
    const entityType = useEntityType();
    return useZustandStore<
        DetailsFormState,
        DetailsFormState['detailsFormErrorsExist']
    >(getStoreName(entityType), errorsExistSelector);
};

export const useDetailsForm_setDraftedEntityName = () => {
    const entityType = useEntityType();

    return useZustandStore<
        DetailsFormState,
        DetailsFormState['setDraftedEntityName']
    >(getStoreName(entityType), (state) => state.setDraftedEntityName);
};

export const useDetailsForm_entityNameChanged = () => {
    const entityType = useEntityType();

    return useZustandStore<
        DetailsFormState,
        DetailsFormState['entityNameChanged']
    >(getStoreName(entityType), (state) => state.entityNameChanged);
};

export const useDetailsForm_setEntityNameChanged = () => {
    const entityType = useEntityType();

    return useZustandStore<
        DetailsFormState,
        DetailsFormState['setEntityNameChanged']
    >(getStoreName(entityType), (state) => state.setEntityNameChanged);
};

export const useDetailsForm_setPreviousDetails = () => {
    const entityType = useEntityType();
    return useZustandStore<
        DetailsFormState,
        DetailsFormState['setPreviousDetails']
    >(getStoreName(entityType), (state) => state.setPreviousDetails);
};

export const useDetailsForm_hydrated = () => {
    const entityType = useEntityType();

    return useZustandStore<DetailsFormState, DetailsFormState['hydrated']>(
        getStoreName(entityType),
        (state) => state.hydrated
    );
};

export const useDetailsForm_setHydrated = () => {
    const entityType = useEntityType();

    return useZustandStore<DetailsFormState, DetailsFormState['setHydrated']>(
        getStoreName(entityType),
        (state) => state.setHydrated
    );
};

export const useDetailsForm_hydrationErrorsExist = () => {
    const entityType = useEntityType();

    return useZustandStore<
        DetailsFormState,
        DetailsFormState['hydrationErrorsExist']
    >(getStoreName(entityType), (state) => state.hydrationErrorsExist);
};

export const useDetailsForm_setHydrationErrorsExist = () => {
    const entityType = useEntityType();

    return useZustandStore<
        DetailsFormState,
        DetailsFormState['setHydrationErrorsExist']
    >(getStoreName(entityType), (state) => state.setHydrationErrorsExist);
};

export const useDetailsForm_hydrateState = () => {
    const entityType = useEntityType();

    return useZustandStore<DetailsFormState, DetailsFormState['hydrateState']>(
        getStoreName(entityType),
        (state) => state.hydrateState
    );
};

export const useDetailsForm_changed = () => {
    const entityType = useEntityType();
    return useZustandStore<DetailsFormState, DetailsFormState['stateChanged']>(
        getStoreName(entityType),
        (state) => state.stateChanged
    );
};

export const useDetailsForm_resetState = () => {
    const entityType = useEntityType();
    return useZustandStore<DetailsFormState, DetailsFormState['resetState']>(
        getStoreName(entityType),
        (state) => state.resetState
    );
};
