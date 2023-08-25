import { getConnectors_detailsForm } from 'api/connectors';
import { getLiveSpecs_detailsForm } from 'api/liveSpecsExt';
import { validateCatalogName } from 'components/inputs/PrefixedName/shared';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import produce from 'immer';
import { isEmpty, isEqual } from 'lodash';
import { Details, DetailsFormState } from 'stores/DetailsForm/types';
import {
    fetchErrors,
    filterErrors,
    generateCustomError,
    getInitialCustomErrorsData,
    getStoreWithCustomErrorsSettings,
} from 'stores/extensions/CustomErrors';
import {
    getInitialHydrationData,
    getStoreWithHydrationSettings,
} from 'stores/extensions/Hydration';
import { DetailsFormStoreNames } from 'stores/names';
import { devtoolsOptions } from 'utils/store-utils';
import { createStore, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

const STORE_KEY = 'Details Form';

const initialDetails: Details = {
    data: {
        connectorImage: {
            connectorId: '',
            id: '',
            iconPath: '',
            imageName: '',
            imagePath: '',
        },
        entityName: '',
    },
    errors: [],
};

const getInitialStateData = (): Pick<
    DetailsFormState,
    | 'connectors'
    | 'details'
    | 'errorsExist'
    | 'draftedEntityName'
    | 'entityNameChanged'
    | 'previousDetails'
> => ({
    connectors: [],

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

                // Run validation on the name. This is done inside the input but
                //  having the input set custom errors causes issues as we basically
                //  make two near identical calls to the store and that causes problems.
                const nameValidation = validateCatalogName(
                    state.details.data.entityName
                );

                // We only have custom errors to handle name validation so it is okay
                //  to totally clear out customErrors and not inteligently update it
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
                    (message) => ({
                        message,
                    })
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

    setPreviousDetails: (value) => {
        set(
            produce((state: DetailsFormState) => {
                state.previousDetails = value;
            }),
            false,
            'Previous Details Changed'
        );
    },

    hydrateState: async (entityType, workflow): Promise<void> => {
        const searchParams = new URLSearchParams(window.location.search);
        const connectorId = searchParams.get(GlobalSearchParams.CONNECTOR_ID);
        const liveSpecId = searchParams.get(GlobalSearchParams.LIVE_SPEC_ID);

        const createWorkflow =
            workflow === 'capture_create' ||
            workflow === 'materialization_create';

        if (connectorId) {
            const { setHydrationErrorsExist } = get();

            if (createWorkflow) {
                const { data, error } = await getConnectors_detailsForm(
                    connectorId
                );

                if (!error && data && data.length > 0) {
                    const { setDetails_connector, setPreviousDetails } = get();

                    const { image_name, logo_url, connector_tags } = data[0];

                    const connectorImage: Details['data']['connectorImage'] = {
                        connectorId,
                        id: connector_tags[0].id,
                        imageName: image_name,
                        imagePath: `${image_name}${connector_tags[0].image_tag}`,
                        iconPath: logo_url,
                    };

                    setDetails_connector(connectorImage);

                    const {
                        data: { entityName },
                        errors,
                    } = initialDetails;

                    setPreviousDetails({
                        data: { entityName, connectorImage },
                        errors,
                    });
                } else {
                    setHydrationErrorsExist(true);
                }
            } else if (liveSpecId) {
                const { data, error } = await getLiveSpecs_detailsForm(
                    liveSpecId,
                    entityType
                );

                if (!error && data && data.length > 0) {
                    const { setDetails, setPreviousDetails } = get();

                    const {
                        catalog_name,
                        detail,
                        connector_tag_id,
                        connector_image_name,
                        connector_image_tag,
                        connector_logo_url,
                    } = data[0];

                    const hydratedDetails: Details = {
                        data: {
                            entityName: catalog_name,
                            connectorImage: {
                                connectorId,
                                id: connector_tag_id,
                                imageName: connector_image_name,
                                imagePath: `${connector_image_name}${connector_image_tag}`,
                                iconPath: connector_logo_url,
                            },
                            description: detail ?? '',
                        },
                    };

                    setDetails(hydratedDetails);
                    setPreviousDetails(hydratedDetails);
                } else {
                    setHydrationErrorsExist(true);
                }
            } else if (workflow === 'test_json_forms') {
                const { setDetails_connector } = get();
                setDetails_connector({
                    id: connectorId,
                    iconPath: '',
                    imageName: '',
                    imagePath: '',
                    connectorId,
                });
                setHydrationErrorsExist(true);
            }
        }
    },

    stateChanged: () => {
        const { details, previousDetails } = get();

        return !isEqual(details.data, previousDetails.data);
    },

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

const createDetailsFormStore = (key: DetailsFormStoreNames) => {
    return createStore<DetailsFormState>()(
        devtools((set, get) => getInitialState(set, get), devtoolsOptions(key))
    );
};

export const captureDetailsForm = createDetailsFormStore(
    DetailsFormStoreNames.CAPTURE
);
export const collectionDetailsForm = createDetailsFormStore(
    DetailsFormStoreNames.COLLECTION
);
export const materializationDetailsForm = createDetailsFormStore(
    DetailsFormStoreNames.MATERIALIZATION
);
