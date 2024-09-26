import { getConnectors_detailsForm } from 'api/connectors';
import { getDataPlaneOptions } from 'api/dataPlanes';
import { getLiveSpecs_detailsForm } from 'api/liveSpecsExt';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import produce from 'immer';
import { isEmpty, isEqual } from 'lodash';
import { logRocketEvent } from 'services/shared';
import { BASE_ERROR } from 'services/supabase';
import { CustomEvents } from 'services/types';
import {
    DataPlaneOption,
    Details,
    DetailsFormState,
} from 'stores/DetailsForm/types';
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
import {
    DefaultDataPlaneSuffix,
    getDataPlaneScope,
    parseDataPlaneName,
    PUBLIC_DATA_PLANE_PREFIX,
} from 'utils/dataPlane-utils';
import { isProduction } from 'utils/env-utils';
import { hasLength } from 'utils/misc-utils';
import { devtoolsOptions } from 'utils/store-utils';
import {
    ConnectorVersionEvaluationOptions,
    evaluateConnectorVersions,
} from 'utils/workflow-utils';
import { NAME_RE } from 'validation';
import { create, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

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

const getDataPlane = (
    dataPlaneOptions: DataPlaneOption[],
    dataPlaneId: string | null
): Details['data']['dataPlane'] | null => {
    if (hasLength(dataPlaneOptions)) {
        const selectedOption = dataPlaneId
            ? dataPlaneOptions.find(({ id }) => id === dataPlaneId)
            : undefined;

        if (selectedOption) {
            return selectedOption;
        }

        const defaultDataPlaneSuffix = isProduction
            ? DefaultDataPlaneSuffix.PRODUCTION
            : DefaultDataPlaneSuffix.LOCAL;

        const defaultOption = dataPlaneOptions.find(
            ({ dataPlaneName }) =>
                dataPlaneName.whole ===
                `${PUBLIC_DATA_PLANE_PREFIX}${defaultDataPlaneSuffix}`
        );

        // TODO (data-planes): Narrow the type annotation for Details['data']['dataPlane']
        //   when the data-plane feature flag is removed. A `null` response from this function
        //   indicates that the field _should_ appear but was not defaulted properly, resulting
        //   in a store hydration error.
        return defaultOption ?? null;
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
    | 'dataPlaneOptions'
    | 'details'
    | 'errorsExist'
    | 'draftedEntityName'
    | 'entityNameChanged'
    | 'previousDetails'
    | 'unsupportedConnectorVersion'
> => ({
    connectors: [],

    dataPlaneOptions: [],

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
        const dataPlaneFeatureFlag = searchParams.get(
            GlobalSearchParams.DATA_PLANE
        );
        const dataPlaneId = searchParams.get(GlobalSearchParams.DATA_PLANE_ID);
        const liveSpecId = searchParams.get(GlobalSearchParams.LIVE_SPEC_ID);

        const createWorkflow =
            workflow === 'capture_create' ||
            workflow === 'materialization_create';

        if (connectorId) {
            const { setDataPlaneOptions, setHydrationErrorsExist } = get();

            let dataPlaneOptions: DataPlaneOption[] = [];

            if (dataPlaneFeatureFlag === 'show_option') {
                const dataPlaneResponse = await getDataPlaneOptions();

                if (
                    dataPlaneResponse.error ||
                    dataPlaneResponse.data === null ||
                    dataPlaneResponse.data.length === 0
                ) {
                    const reason = dataPlaneResponse.error ?? {
                        ...BASE_ERROR,
                        message:
                            'No data_planes rows were returned by getDataPlaneOptions',
                    };

                    return Promise.reject(reason);
                }

                dataPlaneOptions = dataPlaneResponse.data.map(
                    ({ data_plane_name, id }) => {
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
                );

                setDataPlaneOptions(dataPlaneOptions);
            }

            if (createWorkflow) {
                const connectorImage = await getConnectorImage(connectorId);
                const dataPlane = getDataPlane(dataPlaneOptions, dataPlaneId);

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
                        const {
                            setDetails,
                            setPreviousDetails,
                            setUnsupportedConnectorVersion,
                        } = get();

                        const hydratedDetails: Details = {
                            data: {
                                entityName: catalog_name,
                                connectorImage,
                                dataPlane,
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
