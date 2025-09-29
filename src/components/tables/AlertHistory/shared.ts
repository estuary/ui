import type { TableColumns } from 'src/types';

export const ALERT_HISTORY_LOADING_DELAY = 195;

export const alertHistoryOptionalColumnIntlKeys = {
    entityName: 'entityTable.data.entity',
};

export const optionalColumns = Object.values(
    alertHistoryOptionalColumnIntlKeys
);

export const tableColumns: TableColumns[] = [
    {
        field: null,
        headerIntlKey: alertHistoryOptionalColumnIntlKeys.entityName,
    },
    {
        field: null,
        headerIntlKey: 'alerts.table.data.firedAt',
    },
    {
        field: null,
        headerIntlKey: 'alerts.table.data.resolvedAt',
    },
    {
        field: null,
        headerIntlKey: 'alerts.table.data.alertType',
        collapseHeader: true,
        minWidth: 225,
    },
    {
        field: null,
        headerIntlKey: 'alerts.table.data.recipients',
        width: 460,
    },
    {
        field: null,
        headerIntlKey: 'alerts.table.data.details',
    },
];
