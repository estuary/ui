import { getConnectors_detailsForm } from 'api/connectors';
import { getLiveSpecs_detailsForm } from 'api/liveSpecsExt';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import produce from 'immer';
import { isEmpty, isEqual } from 'lodash';
import { Details, DetailsFormState } from 'stores/DetailsForm/types';
import { getStoreWithHydrationSettings } from 'stores/Hydration';
import { DetailsFormStoreNames } from 'stores/names';
import { devtoolsOptions } from 'utils/store-utils';
import { createStore, StoreApi } from 'zustand';
import { devtools, NamedSet } from 'zustand/middleware';

const initialDetails: Details = {
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
};

const getInitialStateData = (): Pick<
    DetailsFormState,
    | 'connectors'
    | 'details'
    | 'detailsFormErrorsExist'
    | 'draftedEntityName'
    | 'entityNameChanged'
    | 'previousDetails'
> => ({
    connectors: [],

    details: initialDetails,
    detailsFormErrorsExist: true,

    draftedEntityName: '',
    entityNameChanged: false,

    previousDetails: initialDetails,
});

export const getInitialState = (
    set: NamedSet<DetailsFormState>,
    get: StoreApi<DetailsFormState>['getState']
): DetailsFormState => ({
    ...getInitialStateData(),
    ...getStoreWithHydrationSettings('Details Form', set),

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
            } else {
                setHydrationErrorsExist(true);
            }
        }
    },

    stateChanged: () => {
        const { details, previousDetails } = get();

        console.log('details', details);
        console.log('prev details', previousDetails);

        return !isEqual(details.data, previousDetails.data);
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
