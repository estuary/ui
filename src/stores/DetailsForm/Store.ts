import { getConnectors_detailsForm } from 'api/connectors';
import { getDataPlaneById } from 'api/dataPlane';
import { getLiveSpecs_detailsForm } from 'api/liveSpecsExt';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import produce from 'immer';
import { isEmpty, isEqual } from 'lodash';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
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
import { devtoolsOptions } from 'utils/store-utils';
import {
    ConnectorVersionEvaluationOptions,
    evaluateConnectorVersions,
    getDataPlaneScope,
    parseDataPlaneName,
} from 'utils/workflow-utils';
import { NAME_RE } from 'validation';
import { StoreApi, create } from 'zustand';
import { NamedSet, devtools } from 'zustand/middleware';

const STORE_KEY = 'Details Form';

const getConnectorImage = async (
    connectorId: string,
    existingImageTag?: ConnectorVersionEvaluationOptions['existingImageTag']
): Promise<Details['data']['connectorImage'] | null> => {
    const { data, error } = await getConnectors_detailsForm(connectorId);

    if (!error && data && data.length > 0) {
        const connector = data[0];
        const { image_name, logo_url } = connector;

        const options: ConnectorVersionEvaluationOptions | undefined =
            existingImageTag ? { connectorId, existingImageTag } : undefined;

        const connectorTag = evaluateConnectorVersions(connector, options);

        return {
            connectorId,
            id: connectorTag.id,
            imageName: image_name,
            imagePath: `${image_name}${connectorTag.image_tag}`,
            iconPath: logo_url,
        };
    }

    return null;
};

const getDataPlane = async (
    dataPlaneOption: string | null,
    dataPlaneId: string | null
): Promise<Details['data']['dataPlane'] | null> => {
    if (dataPlaneOption === 'show_option') {
        if (dataPlaneId) {
            const { data, error } = await getDataPlaneById(dataPlaneId);

            if (!error && data && data.length > 0) {
                const { data_plane_name, id } = data[0];

                const scope = getDataPlaneScope(data_plane_name);

                const { cluster, prefix, provider, region } =
                    parseDataPlaneName(data_plane_name, scope);

                return {
                    dataPlaneName: {
                        cluster,
                        prefix,
                        provider,
                        region,
                        whole: data_plane_name,
                    },
                    id,
                    scope,
                };
            }

            return null;
        } else {
            return {
                dataPlaneName: {
                    cluster: '',
                    prefix: '',
                    provider: '',
                    region: '',
                    whole: '',
                },
                id: '',
                scope: 'public',
            };
        }
    }

    return undefined;
};

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
    | 'unsupportedConnectorVersion'
> => ({
    connectors: [],

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

    setDetails_dataPlane: (value) => {
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

    hydrateState: async (workflow): Promise<void> => {
        const searchParams = new URLSearchParams(window.location.search);
        const connectorId = searchParams.get(GlobalSearchParams.CONNECTOR_ID);
        const dataPlaneOption = searchParams.get(GlobalSearchParams.DATA_PLANE);
        const dataPlaneId = searchParams.get(GlobalSearchParams.DATA_PLANE_ID);
        const liveSpecId = searchParams.get(GlobalSearchParams.LIVE_SPEC_ID);

        const createWorkflow =
            workflow === 'capture_create' ||
            workflow === 'materialization_create';

        if (connectorId) {
            const { setHydrationErrorsExist } = get();

            if (createWorkflow) {
                const connectorImage = await getConnectorImage(connectorId);
                const dataPlane = await getDataPlane(
                    dataPlaneOption,
                    dataPlaneId
                );

                if (connectorImage && dataPlane !== null) {
                    const {
                        setDetails_connector,
                        setDetails_dataPlane,
                        setPreviousDetails,
                    } = get();

                    setDetails_connector(connectorImage);

                    const {
                        data: { entityName },
                        errors,
                    } = initialDetails;

                    setDetails_dataPlane(dataPlane);
                    setPreviousDetails({
                        data: { entityName, connectorImage, dataPlane },
                        errors,
                    });
                } else {
                    setHydrationErrorsExist(true);
                }
            } else if (liveSpecId) {
                const { data, error } = await getLiveSpecs_detailsForm(
                    liveSpecId
                );

                if (!error && data && data.length > 0) {
                    const {
                        catalog_name,
                        connector_image_tag,
                        connector_tag_id,
                        detail,
                    } = data[0];

                    const connectorImage = await getConnectorImage(
                        connectorId,
                        connector_image_tag
                    );

                    if (connectorImage) {
                        const {
                            setDetails,
                            setPreviousDetails,
                            setUnsupportedConnectorVersion,
                        } = get();

                        const hydratedDetails: Details = {
                            data: {
                                entityName: catalog_name,
                                connectorImage,
                                description: detail ?? '',
                            },
                        };

                        setUnsupportedConnectorVersion(
                            connectorImage.id,
                            connector_tag_id
                        );

                        setDetails(hydratedDetails);
                        setPreviousDetails(hydratedDetails);
                    } else {
                        setHydrationErrorsExist(true);
                    }
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

export const useDetailsFormStore = create<DetailsFormState>()(
    devtools(
        (set, get) => getInitialState(set, get),
        devtoolsOptions('details-form-store')
    )
);
