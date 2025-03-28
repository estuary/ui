import { DateTime } from 'luxon';
import { QUERY_PARAM_CONNECTOR_TITLE } from 'src/services/supabase';
import { ColumnProps } from './EntityTable/types';

// This is the property fetched when setting the select row in the store
//   and then passed in the URL as the prefill for materialize
export const selectKeyValueName = 'id';

export const catalogName: ColumnProps = {
    field: 'catalog_name',
    headerIntlKey: 'entityTable.data.entity',
};

export const connectorType: ColumnProps = {
    field: QUERY_PARAM_CONNECTOR_TITLE,
    headerIntlKey: 'entityTable.data.connectorType',
};

export const writesTo: ColumnProps = {
    field: 'writes_to',
    headerIntlKey: 'entityTable.data.writesTo',
};

export const readsFrom: ColumnProps = {
    field: 'reads_from',
    headerIntlKey: 'entityTable.data.readsFrom',
};

export const lastPublished: ColumnProps = {
    field: 'updated_at',
    headerIntlKey: 'entityTable.data.lastPublished',
};

// Export stuff
export const tableExportSeparator = ',';
export const generateFileName = (key: string) => {
    return `estuary_${key}_${DateTime.now().toFormat('yyyy-MM-dd_HH:mm:ss')}`;
};

export enum ColumnNames {
    CatalogName = 'catalogName',
    DataRead = 'dataRead',
    DataWritten = 'dataWritten',
    DocsRead = 'docsRead',
    DocsWritten = 'docsWritten',
}
