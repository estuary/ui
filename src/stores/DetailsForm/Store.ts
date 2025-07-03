import type {
    DataPlaneOption,
    Details,
    DetailsFormState,
} from 'src/stores/DetailsForm/types';
import type { ConnectorVersionEvaluationOptions } from 'src/utils/connector-utils';
import type { StoreApi } from 'zustand';
import type { NamedSet } from 'zustand/middleware';

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import produce from 'immer';
import { isEmpty } from 'lodash';

import { getConnectors_detailsFormTestPage } from 'src/api/connectors';
import { getLiveSpecs_detailsForm } from 'src/api/liveSpecsExt';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { DATA_PLANE_SETTINGS } from 'src/settings/dataPlanes';
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
import { getConnectorMetadata } from 'src/utils/connector-utils';
import { defaultDataPlaneSuffix } from 'src/utils/env-utils';
import { hasLength } from 'src/utils/misc-utils';
import { devtoolsOptions } from 'src/utils/store-utils';
import { NAME_RE } from 'src/validation';

const STORE_KEY = 'Details Form';

const getConnectorImage = async (
    connectorId: string,
    existingImageTag?: ConnectorVersionEvaluationOptions['existingImageTag']
): Promise<Details['data']['connectorImage'] | null> => {
    const { data, error } =
        await getConnectors_detailsFormTestPage(connectorId);

    if (!error && data && data.length > 0) {
        const connector = data[0];

        const options: ConnectorVersionEvaluationOptions | undefined =
            existingImageTag ? { connectorId, existingImageTag } : undefined;

        return getConnectorMetadata(connector, options);
    }

    return null;
};

const getDataPlane = (
    dataPlaneOptions: DataPlaneOption[],
    dataPlaneId: string | null
): Details['data']['dataPlane'] | null => {
    const selectedOption = dataPlaneId
        ? dataPlaneOptions.find(({ id }) => id === dataPlaneId)
        : undefined;

    if (selectedOption) {
        return selectedOption;
    }

    // TODO (private data plane) - we need to add support for allowing tenants to configure their
    //  preferred data plane.

    // If we are not trying to find a specific data plane and there is only one option
    //  and it is private we are pretty safe in prefilling that one.
    if (
        !dataPlaneId &&
        dataPlaneOptions.length === 1 &&
        dataPlaneOptions[0].dataPlaneName.whole.includes(
            DATA_PLANE_SETTINGS.private.prefix
        )
    ) {
        logRocketEvent(CustomEvents.DATA_PLANE_SELECTOR, {
            defaultedPrivate: true,
        });
        return dataPlaneOptions[0];
    }

    // Try to find the default public data plane
    const defaultOption = dataPlaneOptions.find(
        ({ dataPlaneName }) =>
            dataPlaneName.whole ===
            `${DATA_PLANE_SETTINGS.public.prefix}${defaultDataPlaneSuffix}`
    );

    if (dataPlaneId) {
        logRocketEvent(CustomEvents.DATA_PLANE_SELECTOR, {
            targetDataPlaneId: dataPlaneId,
            defaultDataPlaneId: defaultOption?.id,
        });
    }

    return defaultOption ?? null;
};

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
    | 'unsupportedConnectorVersion'
> => ({
    connectors: [],

    dataPlaneOptions: [],
    existingDataPlaneOption: undefined,

    details: initialDetails,
    errorsExist: true,
    unsupportedConnectorVersion: false,

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

    setUnsupportedConnectorVersion: (evaluatedId, existingId) => {
        set(
            produce((state: DetailsFormState) => {
                const unsupported = evaluatedId !== existingId;

                if (unsupported) {
                    logRocketEvent(CustomEvents.CONNECTOR_VERSION_UNSUPPORTED, {
                        evaluatedId,
                        existingId,
                    });
                }

                state.unsupportedConnectorVersion = unsupported;
            }),
            false,
            'Unsupported Connector Version Flag Changed'
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

    hydrateState: async (workflow, dataPlaneOptions): Promise<void> => {
        const searchParams = new URLSearchParams(window.location.search);
        const connectorId = searchParams.get(GlobalSearchParams.CONNECTOR_ID);
        const dataPlaneId = searchParams.get(GlobalSearchParams.DATA_PLANE_ID);
        const liveSpecId = searchParams.get(GlobalSearchParams.LIVE_SPEC_ID);

        const createWorkflow =
            workflow === 'capture_create' ||
            workflow === 'materialization_create';

        if (connectorId) {
            if (createWorkflow) {
                const connectorImage = await getConnectorImage(connectorId);
                const dataPlane = getDataPlane(dataPlaneOptions, dataPlaneId);

                if (connectorImage && dataPlane === null) {
                    get().setDetails_connector(connectorImage);

                    const {
                        data: { entityName },
                        errors,
                    } = initialDetails;

                    get().setPreviousDetails({
                        data: { entityName, connectorImage },
                        errors,
                    });
                } else if (connectorImage && dataPlane !== null) {
                    get().setDetails_connector(connectorImage);

                    const {
                        data: { entityName },
                        errors,
                    } = initialDetails;

                    get().setDetails_dataPlane(dataPlane);
                    get().setPreviousDetails({
                        data: { entityName, connectorImage, dataPlane },
                        errors,
                    });
                } else {
                    get().setHydrationErrorsExist(true);
                }
            } else if (liveSpecId) {
                const { data, error } =
                    await getLiveSpecs_detailsForm(liveSpecId);

                if (!error && data && data.length > 0) {
                    const {
                        catalog_name,
                        connector_image_tag,
                        connector_tag_id,
                        data_plane_id,
                    } = data[0];

                    const connectorImage = await getConnectorImage(
                        connectorId,
                        connector_image_tag
                    );

                    const dataPlane = getDataPlane(
                        dataPlaneOptions,
                        data_plane_id
                    );

                    if (connectorImage && dataPlane !== null) {
                        const hydratedDetails: Details = {
                            data: {
                                entityName: catalog_name,
                                connectorImage,
                                dataPlane,
                            },
                        };

                        get().setUnsupportedConnectorVersion(
                            connectorImage.id,
                            connector_tag_id
                        );

                        get().setDetails(hydratedDetails);
                        get().setPreviousDetails(hydratedDetails);
                    } else {
                        get().setHydrationErrorsExist(true);
                    }
                } else {
                    get().setHydrationErrorsExist(true);
                }
            } else if (workflow === 'test_json_forms') {
                get().setDetails_connector({
                    id: connectorId,
                    iconPath: '',
                    imageName: '',
                    imagePath: '',
                    imageTag: '',
                    connectorId,
                });
                get().setHydrationErrorsExist(true);
            }
        } else {
            logRocketEvent(CustomEvents.CONNECTOR_VERSION_MISSING);
            // TODO (details hydration) should really show an error here
            // get().setHydrationError(
            //     'Unable to locate selected connector. If the issue persists, please contact support.'
            // );
            // get().setHydrationErrorsExist(true);
        }
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

export const useDetailsFormStore = create<DetailsFormState>()(
    devtools(
        (set, get) => getInitialState(set, get),
        devtoolsOptions('details-form-store')
    )
);
