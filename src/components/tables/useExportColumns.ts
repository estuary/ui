import { useMemo } from 'react';

import { useIntl } from 'react-intl';

import { catalogName, ColumnNames } from 'src/components/tables/shared';

function useExportColumns() {
    const intl = useIntl();

    return useMemo(() => {
        const docs = 'Docs';

        const bytes = 'Data';

        return {
            [ColumnNames.CatalogName]: {
                id: ColumnNames.CatalogName,
                displayName: intl.formatMessage({
                    id: catalogName.headerIntlKey ?? '',
                }),
            },

            [ColumnNames.DataRead]: {
                id: ColumnNames.DataRead,
                displayName: `${bytes} Read`,
            },

            [ColumnNames.DataWritten]: {
                id: ColumnNames.DataWritten,
                displayName: `${bytes} Written`,
            },

            [ColumnNames.DocsRead]: {
                id: ColumnNames.DocsRead,
                displayName: `${docs} Read`,
            },

            [ColumnNames.DocsWritten]: {
                id: ColumnNames.DocsWritten,
                displayName: `${docs} Written`,
            },
        };
    }, [intl]);
}

export default useExportColumns;
