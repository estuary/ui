import type { ConnectorWithTagQuery } from 'src/api/types';
import type {
    DataPlaneOption,
    Details,
    DetailsFormState,
} from 'src/stores/DetailsForm/types';
import type { ConnectorVersionEvaluationOptions } from 'src/utils/connector-utils';

import { useCallback } from 'react';

import { getDataPlaneOptions } from 'src/api/dataPlanes';
import { getLiveSpecs_detailsForm } from 'src/api/liveSpecsExt';
import { useEntityWorkflow } from 'src/context/Workflow';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
import { DATA_PLANE_SETTINGS } from 'src/settings/dataPlanes';
import { initialDetails } from 'src/stores/DetailsForm/shared';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { getConnectorMetadata } from 'src/utils/connector-utils';
import { generateDataPlaneOption } from 'src/utils/dataPlane-utils';
import { defaultDataPlaneSuffix } from 'src/utils/env-utils';

const getConnectorImage = async (
    connectorId: string,
    connectorMetadata: ConnectorWithTagQuery,
    existingImageTag?: ConnectorVersionEvaluationOptions['existingImageTag']
): Promise<Details['data']['connectorImage'] | null> => {
    const options: ConnectorVersionEvaluationOptions | undefined =
        existingImageTag ? { connectorId, existingImageTag } : undefined;

    return getConnectorMetadata(connectorMetadata, options);
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

// TODO: Determine a means to fetch data-plane options that is not workflow-dependent.
const evaluateDataPlaneOptions = async (
    setDataPlaneOptions: DetailsFormState['setDataPlaneOptions'],
    setHydrationError: DetailsFormState['setHydrationError'],
    existingDataPlane?: {
        name: string | null;
        id: string;
        reactorAddress: string | null;
    }
): Promise<DataPlaneOption[]> => {
    const dataPlaneResponse = await getDataPlaneOptions();

    if (dataPlaneResponse.error) {
        setHydrationError(
            dataPlaneResponse.error?.message ??
                'An error was encountered initializing the data-plane selector in the details form. If the issue persists, please contact support.'
        );
    }

    if (!dataPlaneResponse.data || dataPlaneResponse.data.length === 0) {
        logRocketEvent(CustomEvents.DATA_PLANE_SELECTOR, {
            noOptionsFound: true,
            fallbackExists: Boolean(existingDataPlane),
        });

        const stubOption = existingDataPlane
            ? generateDataPlaneOption({
                  data_plane_name: existingDataPlane.name ?? '',
                  id: existingDataPlane.id,
                  reactor_address: existingDataPlane.reactorAddress ?? '',
                  cidr_blocks: null,
                  gcp_service_account_email: null,
                  aws_iam_user_arn: null,
              })
            : null;

        const fallbackOptions = stubOption ? [stubOption] : [];

        setDataPlaneOptions(fallbackOptions);

        return fallbackOptions;
    }

    const options = dataPlaneResponse.data
        ? dataPlaneResponse.data.map(generateDataPlaneOption)
        : [];

    setDataPlaneOptions(options);

    return options;
};

export const useDetailsFormHydrator = () => {
    const dataPlaneId = useGlobalSearchParams(GlobalSearchParams.DATA_PLANE_ID);
    const liveSpecId = useGlobalSearchParams(GlobalSearchParams.LIVE_SPEC_ID);

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

    const hydrateDetailsForm = useCallback(
        async (
            connectorId: string,
            connectorMetadata: ConnectorWithTagQuery,
            baseEntityName?: string
        ) => {
            setActive(true);

            const createWorkflow =
                workflow === 'capture_create' ||
                workflow === 'materialization_create';

            if (createWorkflow) {
                const connectorImage = await getConnectorImage(
                    connectorId,
                    connectorMetadata
                );
                const dataPlaneOptions = await evaluateDataPlaneOptions(
                    setDataPlaneOptions,
                    setHydrationError
                );
                const dataPlane = getDataPlane(dataPlaneOptions, dataPlaneId);

                if (!connectorImage) {
                    setHydrationErrorsExist(true);

                    return Promise.reject({ connectorTagId: null });
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

                return Promise.resolve({
                    connectorTagId: hydratedDetails.data.connectorImage.id,
                });
            }

            if (liveSpecId) {
                const { data, error } =
                    await getLiveSpecs_detailsForm(liveSpecId);

                if (error || !data || data.length === 0) {
                    setHydrationErrorsExist(true);

                    return Promise.reject({ connectorTagId: null });
                }

                const {
                    catalog_name,
                    connector_image_tag,
                    connector_tag_id,
                    data_plane_id,
                    data_plane_name,
                    reactor_address,
                } = data[0];

                const connectorImage = await getConnectorImage(
                    connectorId,
                    connectorMetadata,
                    connector_image_tag
                );

                const dataPlaneOptions = await evaluateDataPlaneOptions(
                    setDataPlaneOptions,
                    setHydrationError,
                    {
                        name: data_plane_name,
                        id: data_plane_id,
                        reactorAddress: reactor_address,
                    }
                );
                const dataPlane = getDataPlane(dataPlaneOptions, data_plane_id);

                if (!connectorImage) {
                    setHydrationErrorsExist(true);

                    return Promise.reject({ connectorTagId: null });
                }

                const hydratedDetails: Details = {
                    data: {
                        entityName: catalog_name,
                        connectorImage,
                        dataPlane: dataPlane ?? undefined,
                    },
                };

                setUnsupportedConnectorVersion(
                    connectorImage.id,
                    connector_tag_id
                );

                setDetails(hydratedDetails);
                setPreviousDetails(hydratedDetails);

                setHydrated(true);

                return Promise.resolve({
                    connectorTagId: hydratedDetails.data.connectorImage.id,
                });
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

                return Promise.resolve({ connectorTagId: connectorId });
            }

            return Promise.resolve({ connectorTagId: null });
        },
        [
            dataPlaneId,
            liveSpecId,
            setActive,
            setDataPlaneOptions,
            setDetails,
            setDetails_connector,
            setHydrated,
            setHydrationError,
            setHydrationErrorsExist,
            setPreviousDetails,
            setUnsupportedConnectorVersion,
            workflow,
        ]
    );

    return { hydrateDetailsForm };
};
