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
import { useEntitiesStore } from 'src/stores/Entities/Store';
import {
    DATA_PLANE_OPTION_TEMPLATE,
    formatDataPlaneName,
    getDataPlaneNames,
} from 'src/utils/dataPlane-utils';

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

    const storageMappings = useEntitiesStore((state) => state.storageMappings);

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

    const getDataPlaneOption = useCallback(
        (dataPlaneId: string | undefined, catalogName: string | undefined) => {
            let selectedOption = options.find(
                (option) => option.id === (dataPlaneId ?? '')
            );

            if (typeof selectedOption !== 'undefined') {
                return selectedOption;
            }

            if (catalogName) {
                const dataPlaneNames = getDataPlaneNames(
                    storageMappings,
                    catalogName
                );

                return dataPlaneNames.length > 0
                    ? options.find(
                          (option) =>
                              option.dataPlaneName.whole === dataPlaneNames[0]
                      )
                    : undefined;
            }

            return undefined;
        },
        [options, storageMappings]
    );

    const evaluateDataPlane = useCallback(
        (
            details: Details,
            selectedDataPlaneOption: DataPlaneOption | undefined
        ) => {
            if (selectedDataPlaneOption?.id !== storedDataPlaneId) {
                setDetails_dataPlane(selectedDataPlaneOption);

                if (selectedDataPlaneOption?.id !== dataPlaneIdInURL) {
                    setEntityNameChanged(details.data.entityName);

                    // TODO (data-plane): Set search param of interest instead of using navigate function.
                    navigateToCreate(entityType, {
                        id: details.data.connectorImage.connectorId,
                        advanceToForm: true,
                        dataPlaneId: selectedDataPlaneOption?.id ?? null,
                    });
                }
            }
        },
        [
            dataPlaneIdInURL,
            entityType,
            navigateToCreate,
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
        getDataPlaneOption,
        evaluateDataPlane,
    };
}
