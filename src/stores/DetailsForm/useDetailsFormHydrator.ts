import { getConnectors_detailsForm } from 'api/connectors';
import { getDataPlaneOptions } from 'api/dataPlanes';
import { getLiveSpecs_detailsForm } from 'api/liveSpecsExt';
import { useEntityWorkflow } from 'context/Workflow';
import { GlobalSearchParams } from 'hooks/searchParams/useGlobalSearchParams';
import { logRocketEvent } from 'services/shared';
import { CustomEvents } from 'services/types';
import { DATA_PLANE_SETTINGS } from 'settings/dataPlanes';
import { getConnectorMetadata } from 'utils/connector-utils';
import { generateDataPlaneOption } from 'utils/dataPlane-utils';
import { defaultDataPlaneSuffix } from 'utils/env-utils';
import { ConnectorVersionEvaluationOptions } from 'utils/workflow-utils';
import { initialDetails } from './shared';
import { useDetailsFormStore } from './Store';
import { DataPlaneOption, Details, DetailsFormState } from './types';

const getConnectorImage = async (
    connectorId: string,
    existingImageTag?: ConnectorVersionEvaluationOptions['existingImageTag']
): Promise<Details['data']['connectorImage'] | null> => {
    const { data, error } = await getConnectors_detailsForm(connectorId);

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

const evaluateDataPlaneOptions = async (
    setDataPlaneOptions: DetailsFormState['setDataPlaneOptions'],
    setHydrationError: DetailsFormState['setHydrationError']
): Promise<DataPlaneOption[]> => {
    const dataPlaneResponse = await getDataPlaneOptions();

    if (
        dataPlaneResponse.error ||
        !dataPlaneResponse.data ||
        dataPlaneResponse.data.length === 0
    ) {
        setHydrationError(
            dataPlaneResponse.error?.message ??
                'An error was encountered initializing the details form. If the issue persists, please contact support.'
        );

        return [];
    }

    const options = dataPlaneResponse.data.map(generateDataPlaneOption);

    setDataPlaneOptions(options);

    return options;
};

export const useDetailsFormHydrator = () => {
    // Use global search params hook to grab params
    const searchParams = new URLSearchParams(window.location.search);
    const connectorId = searchParams.get(GlobalSearchParams.CONNECTOR_ID);
    const dataPlaneId = searchParams.get(GlobalSearchParams.DATA_PLANE_ID);
    const liveSpecId = searchParams.get(GlobalSearchParams.LIVE_SPEC_ID);

    const workflow = useEntityWorkflow();

    const setActive = useDetailsFormStore((state) => state.setActive);
    const setDataPlaneOptions = useDetailsFormStore(
        (state) => state.setDataPlaneOptions
    );
    const setDetails = useDetailsFormStore((state) => state.setDetails);
    const setDetails_connector = useDetailsFormStore(
        (state) => state.setDetails_connector
    );
    const setHydrated = useDetailsFormStore((state) => state.setHydrated);
    const setHydrationError = useDetailsFormStore(
        (state) => state.setHydrationError
    );
    const setHydrationErrorsExist = useDetailsFormStore(
        (state) => state.setHydrationErrorsExist
    );
    const setPreviousDetails = useDetailsFormStore(
        (state) => state.setPreviousDetails
    );
    const setUnsupportedConnectorVersion = useDetailsFormStore(
        (state) => state.setUnsupportedConnectorVersion
    );

    const hydrateDetailsForm = async (baseEntityName?: string) => {
        setActive(true);

        if (!connectorId) {
            logRocketEvent(CustomEvents.CONNECTOR_VERSION_MISSING);

            // TODO (details hydration) should really show an error here
            // setHydrationError(
            //     'Unable to locate selected connector. If the issue persists, please contact support.'
            // );
            // setHydrationErrorsExist(true);

            return Promise.reject();
        }

        const createWorkflow =
            workflow === 'capture_create' ||
            workflow === 'materialization_create';

        const dataPlaneOptions = await evaluateDataPlaneOptions(
            setDataPlaneOptions,
            setHydrationError
        );

        if (createWorkflow) {
            const connectorImage = await getConnectorImage(connectorId);
            const dataPlane = getDataPlane(dataPlaneOptions, dataPlaneId);

            if (!connectorImage) {
                setHydrationErrorsExist(true);

                return Promise.reject();
            }

            setDetails_connector(connectorImage);

            const { data } = initialDetails;

            const hydratedDetails: Details = {
                data: {
                    entityName: baseEntityName ?? data.entityName,
                    connectorImage,
                    dataPlane: dataPlane ?? undefined,
                },
            };

            setDetails(hydratedDetails);
            setPreviousDetails(hydratedDetails);

            setHydrated(true);

            return Promise.resolve();
        }

        if (liveSpecId) {
            const { data, error } = await getLiveSpecs_detailsForm(liveSpecId);

            if (error || !data || data.length === 0) {
                setHydrationErrorsExist(true);

                return Promise.reject();
            }

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

            const dataPlane = getDataPlane(dataPlaneOptions, data_plane_id);

            if (!connectorImage || dataPlane === null) {
                setHydrationErrorsExist(true);

                return Promise.reject();
            }

            const hydratedDetails: Details = {
                data: {
                    entityName: catalog_name,
                    connectorImage,
                    dataPlane,
                },
            };

            setUnsupportedConnectorVersion(connectorImage.id, connector_tag_id);

            setDetails(hydratedDetails);
            setPreviousDetails(hydratedDetails);

            setHydrated(true);

            return Promise.resolve();
        }

        if (workflow === 'test_json_forms') {
            setDetails_connector({
                id: connectorId,
                iconPath: '',
                imageName: '',
                imagePath: '',
                imageTag: '',
                connectorId,
            });

            setHydrationErrorsExist(true);

            setHydrated(true);

            return Promise.resolve();
        }
    };

    return { hydrateDetailsForm };
};
