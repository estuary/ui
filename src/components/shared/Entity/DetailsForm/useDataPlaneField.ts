import type { DataPlaneOption, Details } from 'src/stores/DetailsForm/types';
import type { EntityWithCreateWorkflow } from 'src/types';

import { useCallback, useMemo } from 'react';

import { useIntl } from 'react-intl';

import useEntityCreateNavigate from 'src/components/shared/Entity/hooks/useEntityCreateNavigate';
import { DATA_PLANE_SCOPE } from 'src/forms/renderers/DataPlanes';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'src/hooks/searchParams/useGlobalSearchParams';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import {
    DATA_PLANE_OPTION_TEMPLATE,
    formatDataPlaneName,
} from 'src/utils/dataPlane-utils';
import { hasLength } from 'src/utils/misc-utils';

interface OneOfElement {
    const: DataPlaneOption;
    title: string;
}

export default function useDataPlaneField(
    entityType: EntityWithCreateWorkflow
) {
    const dataPlaneIdInURL = useGlobalSearchParams(
        GlobalSearchParams.DATA_PLANE_ID
    );

    const intl = useIntl();

    const navigateToCreate = useEntityCreateNavigate();

    const options = useDetailsFormStore((state) => state.dataPlaneOptions);
    const storedDataPlaneId = useDetailsFormStore(
        (state) => state.details.data.dataPlane?.id
    );
    const setDetails_dataPlane = useDetailsFormStore(
        (state) => state.setDetails_dataPlane
    );
    const setEntityNameChanged = useDetailsFormStore(
        (state) => state.setEntityNameChanged
    );

    const dataPlaneSchema = useMemo(() => {
        const dataPlanesOneOf: OneOfElement[] = [];

        if (options.length > 0) {
            options.forEach((option) => {
                const title = formatDataPlaneName(option.dataPlaneName);

                dataPlanesOneOf.push({ const: option, title });
            });
        } else {
            // The details form store hydrator does not fail loudly when no data-plane options are found
            // and the create workflow does not have a fallback data-plane option to use in that scenario.
            dataPlanesOneOf.push({
                const: DATA_PLANE_OPTION_TEMPLATE,
                title: intl.formatMessage({
                    id: 'workflows.dataPlane.label.noOptionsFound',
                }),
            });
        }

        return {
            [DATA_PLANE_SCOPE]: {
                description: intl.formatMessage({
                    id: 'workflows.dataPlane.description',
                }),
                oneOf: dataPlanesOneOf,
                type: 'object',
            },
        };
    }, [intl, options]);

    const evaluateDataPlane = useCallback(
        (details: Details, selectedDataPlaneId: string | undefined) => {
            if (selectedDataPlaneId !== storedDataPlaneId) {
                const selectedOption = options.find(
                    (option) => option.id === (selectedDataPlaneId ?? '')
                );

                setDetails_dataPlane(selectedOption);

                const evaluatedDataPlaneId = hasLength(selectedDataPlaneId)
                    ? selectedDataPlaneId
                    : null;

                if (evaluatedDataPlaneId !== dataPlaneIdInURL) {
                    setEntityNameChanged(details.data.entityName);

                    // TODO (data-plane): Set search param of interest instead of using navigate function.
                    navigateToCreate(entityType, {
                        id: details.data.connectorImage.connectorId,
                        advanceToForm: true,
                        dataPlaneId: selectedDataPlaneId ?? null,
                    });
                }
            }
        },
        [
            dataPlaneIdInURL,
            entityType,
            navigateToCreate,
            options,
            setDetails_dataPlane,
            setEntityNameChanged,
            storedDataPlaneId,
        ]
    );

    return {
        dataPlaneSchema,
        dataPlaneUISchema: {
            label: intl.formatMessage({
                id: 'workflows.dataPlane.label',
            }),
            scope: `#/properties/${DATA_PLANE_SCOPE}`,
            type: 'Control',
        },
        evaluateDataPlane,
    };
}
