import { CollectionQueryWithStats } from 'api/liveSpecsExt';
import { useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { SelectTableStoreNames } from 'stores/names';
import { formatBytes, formatDocs } from '../cells/stats/shared';
import useRowsWithStatsState from '../hooks/useRowsWithStatsState';
import { catalogName, lastPublished } from '../shared';

function useCollectionExport(data: CollectionQueryWithStats[]) {
    const intl = useIntl();

    const { stats } = useRowsWithStatsState(
        SelectTableStoreNames.COLLECTION,
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
            datawritten: intl.formatMessage(
                {
                    id: 'data.written',
                },
                { type: bytes }
            ),
            dataRead: intl.formatMessage(
                {
                    id: 'data.read',
                },
                { type: bytes }
            ),
            docsWritten: intl.formatMessage(
                {
                    id: 'data.written',
                },
                { type: docs }
            ),
            docsRead: intl.formatMessage(
                {
                    id: 'data.read',
                },
                { type: docs }
            ),
            lastPublished: intl.formatMessage({
                id: lastPublished.headerIntlKey ?? '',
            }),
        };
    }, [intl]);

    return useCallback(() => {
        return Promise.resolve(
            data.map((datum) => {
                console.log('stats', stats);
                return {
                    [headers.name]: datum.catalog_name,
                    [headers.datawritten]: formatBytes(
                        stats?.[datum.catalog_name]?.bytes_written_to_me
                    ),
                    [headers.dataRead]: formatBytes(
                        stats?.[datum.catalog_name]?.bytes_read_from_me
                    ),
                    [headers.docsWritten]: formatDocs(
                        stats?.[datum.catalog_name]?.docs_written_to_me ?? 0
                    ),
                    [headers.docsRead]: formatDocs(
                        stats?.[datum.catalog_name]?.docs_read_from_me
                    ),
                    [headers.lastPublished]: datum.updated_at,
                };
            }) as any[]
        );
    }, [data, headers, stats]);
}

export default useCollectionExport;
