import { DATA_PLANE_SCOPE } from 'forms/renderers/DataPlanes';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { DataPlaneOption, Details } from 'stores/DetailsForm/types';
import { EntityWithCreateWorkflow } from 'types';
import { formatDataPlaneName } from 'utils/dataPlane-utils';
import { hasLength } from 'utils/misc-utils';
import useEntityCreateNavigate from '../hooks/useEntityCreateNavigate';

interface OneOfElement {
    const: DataPlaneOption;
    title: string;
}

export default function useDataPlaneField(
    entityType: EntityWithCreateWorkflow
) {
    const dataPlaneOption = useGlobalSearchParams(
        GlobalSearchParams.DATA_PLANE
    );
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
        }

        return dataPlaneOption === 'show_option' && hasLength(dataPlanesOneOf)
            ? {
                  [DATA_PLANE_SCOPE]: {
                      description: intl.formatMessage({
                          id: 'workflows.dataPlane.description',
                      }),
                      oneOf: dataPlanesOneOf,
                      type: 'object',
                  },
              }
            : null;
    }, [dataPlaneOption, intl, options]);

    const dataPlaneUISchema = useMemo(() => {
        return dataPlaneOption === 'show_option'
            ? {
                  label: intl.formatMessage({
                      id: 'workflows.dataPlane.label',
                  }),
                  scope: `#/properties/${DATA_PLANE_SCOPE}`,
                  type: 'Control',
              }
            : null;
    }, [dataPlaneOption, intl]);

    const evaluateDataPlane = useCallback(
        (details: Details, selectedDataPlaneId: string | undefined) => {
            if (
                dataPlaneOption === 'show_option' &&
                selectedDataPlaneId !== storedDataPlaneId
            ) {
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
                    navigateToCreate(
                        entityType,
                        details.data.connectorImage.connectorId,
                        true,
                        true,
                        selectedDataPlaneId ?? null
                    );
                }
            }
        },
        [
            dataPlaneIdInURL,
            dataPlaneOption,
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
        dataPlaneUISchema,
        evaluateDataPlane,
    };
}
