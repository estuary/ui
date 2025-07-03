import type { ConnectorWithTagQuery } from 'src/api/types';
import type { Details } from 'src/stores/DetailsForm/types';
import type { ConnectorVersionEvaluationOptions } from 'src/utils/connector-utils';

import { useCallback } from 'react';

import { getLiveSpecs_detailsForm } from 'src/api/liveSpecsExt';
import { useEntityWorkflow } from 'src/context/Workflow';
import { useEvaluateDataPlaneOptions } from 'src/hooks/dataPlanes/useEvaluateDataPlaneOptions';
import useGetDataPlane from 'src/hooks/dataPlanes/useGetDataPlane';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { initialDetails } from 'src/stores/DetailsForm/shared';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { getConnectorMetadata } from 'src/utils/connector-utils';

const getConnectorImage = async (
    connectorId: string,
    connectorMetadata: ConnectorWithTagQuery,
    existingImageTag?: ConnectorVersionEvaluationOptions['existingImageTag']
): Promise<Details['data']['connectorImage'] | null> => {
    const options: ConnectorVersionEvaluationOptions | undefined =
        existingImageTag ? { connectorId, existingImageTag } : undefined;

    return getConnectorMetadata(connectorMetadata, options);
};

export const useDetailsFormHydrator = () => {
    const dataPlaneId = useGlobalSearchParams(GlobalSearchParams.DATA_PLANE_ID);
    const liveSpecId = useGlobalSearchParams(GlobalSearchParams.LIVE_SPEC_ID);

    const workflow = useEntityWorkflow();

    const setActive = useDetailsFormStore((state) => state.setActive);
    const setDetails = useDetailsFormStore((state) => state.setDetails);
    const setDetails_connector = useDetailsFormStore(
        (state) => state.setDetails_connector
    );
    const setHydrated = useDetailsFormStore((state) => state.setHydrated);
    const setHydrationErrorsExist = useDetailsFormStore(
        (state) => state.setHydrationErrorsExist
    );
    const setPreviousDetails = useDetailsFormStore(
        (state) => state.setPreviousDetails
    );
    const setUnsupportedConnectorVersion = useDetailsFormStore(
        (state) => state.setUnsupportedConnectorVersion
    );

    const evaluateDataPlaneOptions = useEvaluateDataPlaneOptions();
    const getDataPlane = useGetDataPlane();

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
                const dataPlaneOptions =
                    await evaluateDataPlaneOptions(baseEntityName);

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
                    catalog_name,
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
            evaluateDataPlaneOptions,
            getDataPlane,
            liveSpecId,
            setActive,
            setDetails,
            setDetails_connector,
            setHydrated,
            setHydrationErrorsExist,
            setPreviousDetails,
            setUnsupportedConnectorVersion,
            workflow,
        ]
    );

    return { hydrateDetailsForm };
};
