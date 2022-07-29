import { JsonFormsCore } from '@jsonforms/core';
import { DetailsFormStoreNames } from 'context/Zustand';
import produce from 'immer';
import { isEmpty, isEqual } from 'lodash';
import { devtoolsOptions } from 'utils/store-utils';
import create, { StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

export interface Details extends Pick<JsonFormsCore, 'data' | 'errors'> {
    data: {
        description?: string;
        entityName: string;
        connectorImage?: {
            id: string;
            iconPath: string;
        };
    };
}

export interface DetailsFormState {
    // Form Data
    details: Details;
    setDetails: (details: Details) => void;

    detailsFormErrorsExist: boolean;

    // Connectors
    connectors: { [key: string]: any }[];
    setConnectors: (val: DetailsFormState['connectors']) => void;

    // Misc.
    stateChanged: () => boolean;
    resetState: () => void;
}

const getInitialStateData = (): Pick<
    DetailsFormState,
    'details' | 'detailsFormErrorsExist' | 'connectors'
> => ({
    details: {
        data: {
            connectorImage: {
                id: '',
                iconPath: '',
            },
            entityName: '',
        },
        errors: [],
    },
    detailsFormErrorsExist: true,

    connectors: [],
});

const getInitialState = (
    set: NamedSet<DetailsFormState>,
    get: StoreApi<DetailsFormState>['getState']
): DetailsFormState => ({
    ...getInitialStateData(),

    setDetails: (details) => {
        set(
            produce((state: DetailsFormState) => {
                if (!details.data.connectorImage) {
                    // TODO: Reset the endpoint config form in the effect of the calling component.

                    details.data.connectorImage =
                        getInitialStateData().details.data.connectorImage;
                }

                // else if (
                //     state.details.data.connectorImage?.id !==
                //     details.data.connectorImage.id
                // ) {
                //     const { status } = initialFormState;

                //     state.formState = initialFormState;
                //     state.isIdle = formIdle(status);
                //     state.isActive = formActive(status);
                // }

                state.details = details;

                state.detailsFormErrorsExist = !isEmpty(
                    details.errors ?? get().details.errors
                );
            }),
            false,
            'Details Changed'
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
    return create<DetailsFormState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};
