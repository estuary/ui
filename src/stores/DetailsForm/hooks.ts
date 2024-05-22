import { useEntityType } from 'context/EntityContext';
import { useZustandStore } from 'context/Zustand/provider';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { DetailsFormState } from 'stores/DetailsForm/types';
import { DetailsFormStoreNames } from 'stores/names';
import { Entity } from 'types';

export const getStoreName = (entityType: Entity): DetailsFormStoreNames => {
    switch (entityType) {
        case 'capture':
            return DetailsFormStoreNames.CAPTURE;
        case 'materialization':
            return DetailsFormStoreNames.MATERIALIZATION;
        case 'collection':
            return DetailsFormStoreNames.COLLECTION;
        default: {
            throw new Error('Invalid DetailsForm store name');
        }
    }
};

// Selector hooks
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

export const useDetailsForm_draftedEntityName = () => {
    const entityType = useEntityType();

    return useZustandStore<
        DetailsFormState,
        DetailsFormState['draftedEntityName']
    >(getStoreName(entityType), (state) => state.draftedEntityName);
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

export const useDetailsForm_errorsExist = () => {
    const entityType = useEntityType();
    return useZustandStore<DetailsFormState, DetailsFormState['errorsExist']>(
        getStoreName(entityType),
        (state: DetailsFormState) => state.errorsExist
    );
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

export const useDetailsForm_previousConnectorImage_connectorId = () => {
    const entityType = useEntityType();
    return useZustandStore<
        DetailsFormState,
        DetailsFormState['previousDetails']['data']['connectorImage']['connectorId']
    >(
        getStoreName(entityType),
        (state) => state.previousDetails.data.connectorImage.connectorId
    );
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

export const useDetailsForm_setActive = () => {
    const entityType = useEntityType();

    return useZustandStore<DetailsFormState, DetailsFormState['setActive']>(
        getStoreName(entityType),
        (state) => state.setActive
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

export const useDetailsForm_changed_connectorId = () => {
    const connectorId = useGlobalSearchParams(GlobalSearchParams.CONNECTOR_ID);
    const entityType = useEntityType();

    return useZustandStore<DetailsFormState, boolean>(
        getStoreName(entityType),
        (state) =>
            state.details.data.connectorImage.connectorId !==
                state.previousDetails.data.connectorImage.connectorId ||
            Boolean(
                connectorId &&
                    connectorId !==
                        state.details.data.connectorImage.connectorId
            )
    );
};

export const useDetailsForm_customErrors = () => {
    const entityType = useEntityType();

    return useZustandStore<DetailsFormState, DetailsFormState['customErrors']>(
        getStoreName(entityType),
        (state) => state.customErrors
    );
};

export const useDetailsForm_resetState = () => {
    const entityType = useEntityType();
    return useZustandStore<DetailsFormState, DetailsFormState['resetState']>(
        getStoreName(entityType),
        (state) => state.resetState
    );
};
