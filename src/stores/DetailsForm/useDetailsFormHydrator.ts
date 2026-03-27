import type { Details } from 'src/stores/DetailsForm/types';

import { useCallback } from 'react';

import { getLiveSpecs_detailsForm } from 'src/api/liveSpecsExt';
import { useConnectorTag } from 'src/context/ConnectorTag';
import { useEntityWorkflow } from 'src/context/Workflow';
import { useEvaluateDataPlaneOptions } from 'src/hooks/dataPlanes/useEvaluateDataPlaneOptions';
import useGetDataPlane from 'src/hooks/dataPlanes/useGetDataPlane';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { initialDetails } from 'src/stores/DetailsForm/shared';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';

const DEKAF_IMAGE_PREFIX = 'ghcr.io/estuary/dekaf-';

const buildConnectorImage = (
    connectorTag: any
): Details['data']['connectorImage'] => {
    const { imageTag, connector } = connectorTag;

    const base = {
        iconPath: connector.logoUrl ?? '',
        imageName: connector.imageName,
        imageTag,
    };

    return connector.imageName.startsWith(DEKAF_IMAGE_PREFIX)
        ? {
              ...base,
              variant: connector.imageName.substring(DEKAF_IMAGE_PREFIX.length),
          }
        : { ...base, imagePath: `${connector.imageName}${imageTag}` };
};

export const useDetailsFormHydrator = () => {
    const connectorTag = useConnectorTag();

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

    const evaluateDataPlaneOptions = useEvaluateDataPlaneOptions();
    const getDataPlane = useGetDataPlane();

    const hydrateDetailsForm = useCallback(
        async (baseEntityName?: string) => {
            setActive(true);

            const createWorkflow =
                workflow === 'capture_create' ||
                workflow === 'materialization_create';

            if (createWorkflow) {
                const connectorImage = buildConnectorImage(connectorTag);
                const dataPlaneOptions =
                    await evaluateDataPlaneOptions(baseEntityName);

                const dataPlane = getDataPlane(dataPlaneOptions, dataPlaneId);

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
                const { data, error } =
                    await getLiveSpecs_detailsForm(liveSpecId);

                if (error || !data || data.length === 0) {
                    setHydrationErrorsExist(true);

                    return Promise.reject();
                }

                const {
                    catalog_name,
                    data_plane_id,
                    data_plane_name,
                    reactor_address,
                } = data[0];

                const connectorImage = buildConnectorImage(connectorTag);

                const dataPlaneOptions = await evaluateDataPlaneOptions(
                    catalog_name,
                    {
                        name: data_plane_name,
                        id: data_plane_id,
                        reactorAddress: reactor_address,
                    }
                );
                const dataPlane = getDataPlane(dataPlaneOptions, data_plane_id);

                const hydratedDetails: Details = {
                    data: {
                        entityName: catalog_name,
                        connectorImage,
                        dataPlane: dataPlane ?? undefined,
                    },
                };

                // TODO (gql:connector) - connector tag UUID not available via GQL;
                //   setUnsupportedConnectorVersion cannot be called accurately.
                //   Previously compared connectorImage.id against connector_tag_id
                //   from live_specs.

                setDetails(hydratedDetails);
                setPreviousDetails(hydratedDetails);

                setHydrated(true);

                return Promise.resolve();
            }

            if (workflow === 'test_json_forms') {
                setDetails_connector({
                    iconPath: '',
                    imageName: '',
                    imagePath: '',
                    imageTag: '',
                });

                setHydrationErrorsExist(true);

                setHydrated(true);

                return Promise.resolve();
            }

            return Promise.resolve();
        },
        [
            connectorTag,
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
            workflow,
        ]
    );

    return { hydrateDetailsForm };
};
