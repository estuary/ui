import type { DetailsFormState } from 'src/stores/DetailsForm/types';
import type { StoreApi } from 'zustand';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';
import { isEmpty } from 'lodash';

import { initialDetails } from 'src/stores/DetailsForm/shared';
import {
    fetchErrors,
    filterErrors,
    generateCustomError,
    getInitialCustomErrorsData,
    getStoreWithCustomErrorsSettings,
} from 'src/stores/extensions/CustomErrors';
import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'src/stores/extensions/Hydration';
import { hasLength } from 'src/utils/misc-utils';
import { devtoolsOptions } from 'src/utils/store-utils';
import { NAME_RE } from 'src/validation';

const STORE_KEY = 'Details Form';

const getInitialStateData = (): Pick<
    DetailsFormState,
    | 'connectors'
    | 'dataPlaneOptions'
    | 'details'
    | 'errorsExist'
    | 'existingDataPlaneOption'
    | 'draftedEntityName'
    | 'entityNameChanged'
    | 'previousDetails'
> => ({
    connectors: [],

    dataPlaneOptions: [],
    existingDataPlaneOption: undefined,

    details: initialDetails,
    errorsExist: true,

    draftedEntityName: '',
    entityNameChanged: false,

    previousDetails: initialDetails,
});

export const getInitialState = (
    set: NamedSet<DetailsFormState>,
    get: StoreApi<DetailsFormState>['getState']
): DetailsFormState => ({
    ...getInitialStateData(),
    ...getStoreWithHydrationSettings(STORE_KEY, set),
    ...getStoreWithCustomErrorsSettings(STORE_KEY),

    setDetails: (val) => {
        set(
            produce((state: DetailsFormState) => {
                // If we are defaulting the connector need to populate the initial state
                if (val.data.connectorImage.id === '') {
                    state.details.data.connectorImage =
                        getInitialStateData().details.data.connectorImage;
                }

                // Update the details
                state.details = val;

                // Remove data plane-related state entirely when the data plane id is unset.
                if (!hasLength(val.data.dataPlane?.id)) {
                    state.details.data.dataPlane = undefined;
                }

                // Run validation on the name. This is done inside the input but
                //  having the input set custom errors causes issues as we basically
                //  make two near identical calls to the store and that causes problems.
                const nameValidation = NAME_RE.test(
                    state.details.data.entityName
                )
                    ? null
                    : ['invalid'];

                // We only have custom errors to handle name validation so it is okay
                //  to totally clear out customErrors and not intelligently update it
                // As of Q3 2023
                // TODO (intl) need to get a way for this kind of error to be translated
                //  and passed into the store
                if (nameValidation && nameValidation.length > 0) {
                    state.customErrors = [];
                    state.customErrors.push(
                        generateCustomError('entityName', 'Name invalid')
                    );
                } else {
                    state.customErrors = [];
                }

                // Check if there are any errors from the forms
                const endpointConfigErrors = filterErrors(fetchErrors(val)).map(
                    (message) => ({ message })
                );

                // Set the flag for error checking
                state.errorsExist =
                    !isEmpty(endpointConfigErrors) ||
                    !isEmpty(state.customErrors);
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

    setDetails_dataPlane: (value) => {
        if (value === null) {
            return;
        }

        set(
            produce((state: DetailsFormState) => {
                state.details.data.dataPlane = value;
            }),
            false,
            'Details Data Plane Changed'
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

    setDataPlaneOptions: (value) => {
        set(
            produce((state: DetailsFormState) => {
                state.dataPlaneOptions = value;
            }),
            false,
            'Data Plane Options Set'
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

    setExistingDataPlaneOption: (value) => {
        set(
            produce((state: DetailsFormState) => {
                state.existingDataPlaneOption = value;
            }),
            false,
            'Existing Data Plane Option Set'
        );
    },

    setPreviousDetails: (value) => {
        set(
            produce((state: DetailsFormState) => {
                state.previousDetails = value;
            }),
            false,
            'Previous Details Changed'
        );
    },

    // This is blank on purpose - this is handled by useDetailsFormHydrator
    //  this is just here to handling typing and we want the other parts
    //  of the "Hydration" slice.
    hydrateState: async () => {},

    resetState: () => {
        set(
            {
                ...getInitialStateData(),
                ...getInitialHydrationData(),
                ...getInitialCustomErrorsData(),
            },
            false,
            'Details Form State Reset'
        );
    },
});

export const useDetailsFormStore = create<DetailsFormState>()(
    devtools(
        (set, get) => getInitialState(set, get),
        devtoolsOptions('details-form-store')
    )
);
