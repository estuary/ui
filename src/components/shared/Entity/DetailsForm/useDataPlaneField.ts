import { getDataPlaneOptions } from 'api/dataPlane';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { useDetailsFormStore } from 'stores/DetailsForm/Store';
import { DataPlaneOption, Details } from 'stores/DetailsForm/types';
import { EntityWithCreateWorkflow } from 'types';
import { hasLength } from 'utils/misc-utils';
import { getDataPlaneScope } from 'utils/workflow-utils';
import useEntityCreateNavigate from '../hooks/useEntityCreateNavigate';

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

    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<DataPlaneOption[]>([]);

    const storedDataPlaneId = useDetailsFormStore(
        (state) => state.details.data.dataPlane?.id
    );
    const setDetails_dataPlane = useDetailsFormStore(
        (state) => state.setDetails_dataPlane
    );
    const setEntityNameChanged = useDetailsFormStore(
        (state) => state.setEntityNameChanged
    );

    useEffect(() => {
        if (dataPlaneOption === 'show_option') {
            setLoading(true);

            getDataPlaneOptions()
                .then(
                    (response) => {
                        if (response.error) {
                            console.log(
                                'data plane option response.error',
                                response.error
                            );

                            return;
                        }

                        if (response.data) {
                            const formattedData = response.data.map(
                                ({ data_plane_name, id }) => ({
                                    dataPlaneName: data_plane_name,
                                    id,
                                    scope: getDataPlaneScope(data_plane_name),
                                })
                            );

                            setOptions(formattedData);
                        }
                    },
                    (error) => {
                        console.log('data plane option error', error);
                    }
                )
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [dataPlaneOption, setLoading, setOptions]);

    const dataPlaneSchema = useMemo(() => {
        const dataPlanesOneOf = [
            {
                const: { dataPlaneName: '', id: '', scope: 'public' },
                title: intl.formatMessage({ id: 'common.default' }),
            },
        ] as { const: Object; title: string }[];

        if (options.length > 0) {
            options.forEach((option) => {
                dataPlanesOneOf.push({
                    const: option,
                    title: option.dataPlaneName,
                });
            });
        }

        return dataPlaneOption === 'show_option' && hasLength(dataPlanesOneOf)
            ? {
                  dataPlane: {
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
                  scope: `#/properties/dataPlane`,
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
        loading,
        evaluateDataPlane,
    };
}
