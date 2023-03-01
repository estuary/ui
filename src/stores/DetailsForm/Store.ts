import produce from 'immer';
import { isEmpty, isEqual } from 'lodash';
import { DetailsFormState } from 'stores/DetailsForm/types';
import { DetailsFormStoreNames } from 'stores/names';
import { devtoolsOptions } from 'utils/store-utils';
import { createStore, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

const getInitialStateData = (): Pick<
    DetailsFormState,
    | 'details'
    | 'detailsFormErrorsExist'
    | 'draftedEntityName'
    | 'entityNameChanged'
    | 'connectors'
> => ({
    details: {
        data: {
            connectorImage: {
                connectorId: '',
                id: '',
                iconPath: '',
                imagePath: '',
            },
            entityName: '',
        },
        errors: [],
    },
    detailsFormErrorsExist: true,

    draftedEntityName: '',
    entityNameChanged: false,

    connectors: [],
});

export const getInitialState = (
    set: NamedSet<DetailsFormState>,
    get: StoreApi<DetailsFormState>['getState']
): DetailsFormState => ({
    ...getInitialStateData(),

    setDetails: (details) => {
        set(
            produce((state: DetailsFormState) => {
                if (details.data.connectorImage.id === '') {
                    state.details.data.connectorImage =
                        getInitialStateData().details.data.connectorImage;
                }

                state.details = details;

                state.detailsFormErrorsExist = !isEmpty(
                    details.errors ?? get().details.errors
                );
            }),
            false,
            'Details Changed'
        );
    },

    setDetails_connector: (connectorImage) => {
        set(
            produce((state: DetailsFormState) => {
                if (connectorImage.id === '') {
                    state.details.data.connectorImage =
                        getInitialStateData().details.data.connectorImage;
                } else {
                    state.details.data.connectorImage = connectorImage;
                }
            }),
            false,
            'Details Connector Changed'
        );
    },

    setConnectors: (val) => {
        set(
            produce((state: DetailsFormState) => {
                state.connectors = val;
            }),
            false,
            'Connector Response Cached'
        );
    },

    setDraftedEntityName: (value) => {
        set(
            produce((state: DetailsFormState) => {
                state.draftedEntityName = value;
                state.entityNameChanged = false;
            }),
            false,
            'Drafted Entity Name Set'
        );
    },

    setEntityNameChanged: (value) => {
        set(
            produce((state: DetailsFormState) => {
                const { draftedEntityName } = state;

                state.entityNameChanged = value !== draftedEntityName;
            }),
            false,
            'Entity Name Change Flag Set'
        );
    },

    stateChanged: () => {
        const { details } = get();
        const { details: initialDetails } = getInitialStateData();

        return !isEqual(details.data, initialDetails.data);
    },

    resetState: () => {
        set(getInitialStateData(), false, 'Details Form State Reset');
    },
});

export const createDetailsFormStore = (key: DetailsFormStoreNames) => {
    return createStore<DetailsFormState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};
