import type { DataPlaneOption, Details } from 'src/stores/DetailsForm/types';
import type { EntityWithCreateWorkflow } from 'src/types';

import { useCallback, useMemo } from 'react';
import { StringParam, useQueryParams } from 'use-query-params';

import { useIntl } from 'react-intl';

import { useEntityWorkflow_Editing } from 'src/context/Workflow';
import { DATA_PLANE_SCOPE } from 'src/forms/renderers/DataPlanes';
import { GlobalSearchParams } from 'src/hooks/searchParams/useGlobalSearchParams';
import { logRocketEvent } from 'src/services/shared';
import { CustomEvents } from 'src/services/types';
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
    const isEdit = useEntityWorkflow_Editing();

    const entityName = useDetailsFormStore(
        (state) => state.details.data.entityName
    );
    const options = useDetailsFormStore((state) => state.dataPlaneOptions);
    const storedDataPlane = useDetailsFormStore(
        (state) => state.details.data.dataPlane
    );
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

            // TODO (data-planes) - this should not really be needed but a solution to triage the prod issues
            //  some users are seeing. Need an actual solution. We potentially do not even really want to make a proper
            //  list of options during edit and rather just use the value from the live_spec_ext view as the ONLY option
            //  since during edit the user should not be changing the data plane if one is already provided.
            // If we're in edit AND we have a stored data plane then it more than likely came from
            //  the live_specs_ext view and we should make sure that it is an option
            if (
                isEdit &&
                storedDataPlane &&
                dataPlanesOneOf.findIndex(
                    (datum) =>
                        datum.const.dataPlaneName.whole ===
                        storedDataPlane.dataPlaneName.whole
                ) === -1
            ) {
                logRocketEvent(CustomEvents.DATA_PLANE_SELECTOR, {
                    forcingStoredDataPlane: true,
                });
                const title = formatDataPlaneName(
                    storedDataPlane.dataPlaneName
                );

                dataPlanesOneOf.push({ const: storedDataPlane, title });
            }
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
    }, [intl, isEdit, options, storedDataPlane]);

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
