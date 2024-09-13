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
import {
    formatDataPlaneName,
    getDataPlaneScope,
    parseDataPlaneName,
} from 'utils/workflow-utils';
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
                                ({ data_plane_name, id }) => {
                                    const scope =
                                        getDataPlaneScope(data_plane_name);

                                    const {
                                        cluster,
                                        prefix,
                                        provider,
                                        region,
                                    } = parseDataPlaneName(
                                        data_plane_name,
                                        scope
                                    );

                                    return {
                                        dataPlaneName: {
                                            cluster,
                                            prefix,
                                            provider,
                                            region,
                                            whole: data_plane_name,
                                        },
                                        id,
                                        scope,
                                    };
                                }
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
        let dataPlanesOneOf: OneOfElement[] = [];

        if (options.length > 0) {
            const privateOptions: OneOfElement[] = [];
            const publicOptions: OneOfElement[] = [
                {
                    const: {
                        dataPlaneName: {
                            cluster: '',
                            prefix: '',
                            provider: '',
                            region: '',
                            whole: '',
                        },
                        id: '',
                        scope: 'public',
                    },
                    title: intl.formatMessage({ id: 'common.default' }),
                },
            ];

            options.forEach((option) => {
                const {
                    cluster,
                    provider,
                    region,
                    whole: wholeName,
                } = option.dataPlaneName;

                const title = formatDataPlaneName(
                    cluster,
                    provider,
                    region,
                    wholeName
                );

                if (option.scope === 'public') {
                    publicOptions.push({ const: option, title });

                    return;
                }

                privateOptions.push({ const: option, title });
            });

            dataPlanesOneOf = privateOptions.concat(publicOptions);
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
