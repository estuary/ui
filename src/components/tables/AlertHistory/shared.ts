import type { TableColumns } from 'src/types';

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
        headerIntlKey: 'admin.notifications.table.data.details',
    },
    {
        field: null,
        headerIntlKey: 'admin.notifications.table.data.alertType',
    },
    {
        field: null,
        headerIntlKey: 'admin.notifications.table.data.recipients',
    },
    {
        field: null,
        headerIntlKey: 'admin.notifications.table.data.firedAt',
    },
    {
        field: null,
        headerIntlKey: 'admin.notifications.table.data.resolvedAt',
    },
];
