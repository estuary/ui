import { QUERY_PARAM_CONNECTOR_TITLE } from 'services/supabase';
import { ColumnProps } from '../EntityTable/types';

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

export const lastPublished: ColumnProps = {
    field: 'updated_at',
    headerIntlKey: 'entityTable.data.lastPublished',
};
