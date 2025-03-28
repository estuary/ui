import { useMemo } from 'react';

import { useIntl } from 'react-intl';
import { catalogName, ColumnNames } from 'src/components/tables/shared';

function useExportColumns() {
    const intl = useIntl();

    return useMemo(() => {
        const docs = intl.formatMessage({
            id: 'data.docs',
        });

        const bytes = intl.formatMessage({
            id: 'data.data',
        });

        return {
            [ColumnNames.CatalogName]: {
                id: ColumnNames.CatalogName,
                displayName: intl.formatMessage({
                    id: catalogName.headerIntlKey ?? '',
                }),
            },

            [ColumnNames.DataRead]: {
                id: ColumnNames.DataRead,
                displayName: intl.formatMessage(
                    {
                        id: 'data.read',
                    },
                    { type: bytes }
                ),
            },

            [ColumnNames.DataWritten]: {
                id: ColumnNames.DataWritten,
                displayName: intl.formatMessage(
                    {
                        id: 'data.written',
                    },
                    { type: bytes }
                ),
            },

            [ColumnNames.DocsRead]: {
                id: ColumnNames.DocsRead,
                displayName: intl.formatMessage(
                    {
                        id: 'data.read',
                    },
                    { type: docs }
                ),
            },

            [ColumnNames.DocsWritten]: {
                id: ColumnNames.DocsWritten,
                displayName: intl.formatMessage(
                    {
                        id: 'data.written',
                    },
                    { type: docs }
                ),
            },
        };
    }, [intl]);
}

export default useExportColumns;
