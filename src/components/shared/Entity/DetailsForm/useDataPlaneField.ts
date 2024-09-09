import { DataPlaneOption, getDataPlaneOptions } from 'api/dataPlane';
import useGlobalSearchParams, {
    GlobalSearchParams,
} from 'hooks/searchParams/useGlobalSearchParams';
import { useEffect, useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { hasLength } from 'utils/misc-utils';

export default function useDataPlaneField() {
    const dataPlaneOption = useGlobalSearchParams(
        GlobalSearchParams.DATA_PLANE
    );

    const intl = useIntl();

    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState<DataPlaneOption[]>([]);

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
                            setOptions(response.data);
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
                const: { data_plane_name: '', id: '' },
                title: intl.formatMessage({ id: 'common.default' }),
            },
        ] as { title: string; const: Object }[];

        if (options.length > 0) {
            options.forEach((option) => {
                dataPlanesOneOf.push({
                    const: option,
                    title: option.data_plane_name,
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

    return { dataPlaneSchema, dataPlaneUISchema, loading };
}
