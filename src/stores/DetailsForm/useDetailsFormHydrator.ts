import type { Details } from 'src/stores/DetailsForm/types';
import type { LiveSpec } from 'src/types/schemaModels';

import { useCallback } from 'react';

import { useConnectorTag } from 'src/context/ConnectorTag';
import {
    useEntityWorkflow,
    useEntityWorkflow_Creating,
    useEntityWorkflow_Editing,
} from 'src/context/Workflow';
import { useEvaluateDataPlaneOptions } from 'src/hooks/dataPlanes/useEvaluateDataPlaneOptions';
import useGetDataPlane from 'src/hooks/dataPlanes/useGetDataPlane';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { initialDetails } from 'src/stores/DetailsForm/shared';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { buildConnectorImageFromTag } from 'src/utils/connector-utils';

export const useDetailsFormHydrator = () => {
    const connectorTag = useConnectorTag();

    const dataPlaneId = useGlobalSearchParams(GlobalSearchParams.DATA_PLANE_ID);

    const workflow = useEntityWorkflow();
    const isCreateWorkflow = useEntityWorkflow_Creating();
    const isEditWorkflow = useEntityWorkflow_Editing();

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
        async (baseEntityName?: string, liveSpec?: LiveSpec | null) => {
            setActive(true);

            // a live spec is required if editing
            if (isEditWorkflow && !liveSpec) {
                setHydrated(true);
                setHydrationErrorsExist(true);
                return Promise.reject(new Error('Live spec not found'));
            }

            if (isCreateWorkflow) {
                const connectorImage = buildConnectorImageFromTag(connectorTag);
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

            if (liveSpec) {
                const { catalogName, dataPlane: liveDataPlane } = liveSpec;

                const connectorImage = buildConnectorImageFromTag(connectorTag);

                const dataPlaneOptions = await evaluateDataPlaneOptions(
                    catalogName,
                    liveDataPlane
                );
                const dataPlane = getDataPlane(
                    dataPlaneOptions,
                    liveDataPlane.id
                );

                const hydratedDetails: Details = {
                    data: {
                        entityName: catalogName,
                        connectorImage,
                        dataPlane: dataPlane ?? undefined,
                    },
                };

                setDetails(hydratedDetails);
                setPreviousDetails(hydratedDetails);

                setHydrated(true);

                return Promise.resolve();
            }

            if (workflow === 'test_json_forms') {
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
            isCreateWorkflow,
            isEditWorkflow,
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
