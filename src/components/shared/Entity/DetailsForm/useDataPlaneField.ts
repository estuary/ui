import type { DataPlaneOption, Details } from 'src/stores/DetailsForm/types';
import type { EntityWithCreateWorkflow } from 'src/types';

import { useCallback, useMemo } from 'react';
import { StringParam, useQueryParams } from 'use-query-params';

import { useIntl } from 'react-intl';

import { DATA_PLANE_SCOPE } from 'src/forms/renderers/DataPlanes';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { useDetailsFormStore } from 'src/stores/DetailsForm/Store';
import { useEntitiesStore_capabilities_adminable } from 'src/stores/Entities/hooks';
import {
    DATA_PLANE_OPTION_TEMPLATE,
    formatDataPlaneName,
} from 'src/utils/dataPlane-utils';

interface OneOfElement {
    const: DataPlaneOption;
    title: string;
}

export default function useDataPlaneField(
    entityType: EntityWithCreateWorkflow
) {
    const [query, setQuery] = useQueryParams({
        [GlobalSearchParams.DATA_PLANE_ID]: StringParam,
    });
    const dataPlaneIdInURL = query[GlobalSearchParams.DATA_PLANE_ID];

    const intl = useIntl();

    const entityName = useDetailsFormStore(
        (state) => state.details.data.entityName
    );
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

    const objectRoles = useEntitiesStore_capabilities_adminable(true);

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

    const dataPlaneUISchema = useMemo(
        () => ({
            label: intl.formatMessage({
                id: 'workflows.dataPlane.label',
            }),
            scope: `#/properties/${DATA_PLANE_SCOPE}`,
            type: 'Control',
            options: {
                readOnly: objectRoles.length > 1 && entityName.length === 0,
            },
        }),
        [entityName.length, intl, objectRoles.length]
    );

    const setDataPlane = useCallback(
        (
            details: Details,
            selectedDataPlaneOption: DataPlaneOption | undefined
        ) => {
            if (selectedDataPlaneOption?.id !== storedDataPlaneId) {
                setDetails_dataPlane(selectedDataPlaneOption);

                if (selectedDataPlaneOption?.id !== dataPlaneIdInURL) {
                    setEntityNameChanged(details.data.entityName);

                    setQuery({
                        [GlobalSearchParams.DATA_PLANE_ID]:
                            selectedDataPlaneOption?.id ?? null,
                    });
                }
            }
        },
        [
            dataPlaneIdInURL,
            setDetails_dataPlane,
            setEntityNameChanged,
            setQuery,
            storedDataPlaneId,
        ]
    );

    return {
        dataPlaneSchema,
        dataPlaneUISchema,
        setDataPlane,
    };
}
