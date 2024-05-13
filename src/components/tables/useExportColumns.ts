import { useMemo } from 'react';
import { Columns } from 'react-csv-downloader/dist/esm/lib/csv';
import { useIntl } from 'react-intl';
import { catalogName } from './shared';

function useExportColumns() {
    const intl = useIntl();

    return useMemo<Columns>(() => {
        const docs = intl.formatMessage({
            id: 'data.docs',
        });

        const bytes = intl.formatMessage({
            id: 'data.data',
        });

        return [
            {
                id: 'dataRead',
                displayName: intl.formatMessage(
                    {
                        id: 'data.read',
                    },
                    { type: bytes }
                ),
            },
            {
                id: 'datawritten',
                displayName: intl.formatMessage(
                    {
                        id: 'data.written',
                    },
                    { type: bytes }
                ),
            },
            {
                id: 'docsWritten',
                displayName: intl.formatMessage(
                    {
                        id: 'data.written',
                    },
                    { type: docs }
                ),
            },
            {
                id: 'docsRead',
                displayName: intl.formatMessage(
                    {
                        id: 'data.read',
                    },
                    { type: docs }
                ),
            },
            {
                id: 'name',
                displayName: intl.formatMessage({
                    id: catalogName.headerIntlKey ?? '',
                }),
            },
        ];
    }, [intl]);
}

export default useExportColumns;
