import { CaptureQueryWithStats } from 'api/liveSpecsExt';
import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
import { formatBytes, formatDocs } from '../cells/stats/shared';
import useRowsWithStatsState from '../hooks/useRowsWithStatsState';
import { catalogName, connectorType, lastPublished, writesTo } from './shared';

function useCaptureExport(data: CaptureQueryWithStats[]) {
    const intl = useIntl();

    const { stats } = useRowsWithStatsState(
        SelectTableStoreNames.CAPTURE,
        data
    );

    const headers = useMemo(() => {
        const docs = intl.formatMessage({
            id: 'data.docs',
        });

        const bytes = intl.formatMessage({
            id: 'data.data',
        });

        return {
            name: intl.formatMessage({
                id: catalogName.headerIntlKey ?? '',
            }),
            connector: intl.formatMessage({
                id: connectorType.headerIntlKey ?? '',
            }),
            datawritten: intl.formatMessage(
                {
                    id: 'data.written',
                },
                { type: bytes }
            ),
            docsWritten: intl.formatMessage(
                {
                    id: 'data.written',
                },
                { type: docs }
            ),
            writesTo: intl.formatMessage({
                id: writesTo.headerIntlKey ?? '',
            }),
            lastPublished: intl.formatMessage({
                id: lastPublished.headerIntlKey ?? '',
            }),
        };
    }, [intl]);

    return useCallback(() => {
        return Promise.resolve(
            data.map((datum) => {
                return {
                    [headers.name]: datum.catalog_name,
                    [headers.connector]: `${datum.connector_image_name}${datum.connector_image_tag}`,
                    [headers.datawritten]: formatBytes(
                        stats?.[datum.catalog_name]?.bytes_written_by_me ?? 0
                    ),
                    [headers.docsWritten]: formatDocs(
                        stats
                            ? stats[datum.catalog_name]?.docs_written_by_me
                            : null
                    ),
                    [headers.writesTo]: datum.writes_to,
                    [headers.lastPublished]: datum.updated_at,
                };
            }) as any[]
        );
    }, [data, headers, stats]);
}

export default useCaptureExport;
