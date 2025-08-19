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
        headerIntlKey: 'admin.notifications.table.data.firedAt',
        collapseHeader: true,
    },
    {
        field: null,
        headerIntlKey: 'admin.notifications.table.data.resolvedAt',
        collapseHeader: true,
    },
    {
        field: null,
        headerIntlKey: 'admin.notifications.table.data.duration',
        collapseHeader: true,
    },
    {
        field: null,
        headerIntlKey: 'admin.notifications.table.data.alertType',
        collapseHeader: true,
        minWidth: 225,
    },
    {
        field: null,
        headerIntlKey: 'admin.notifications.table.data.details',
    },
    {
        field: null,
        headerIntlKey: 'admin.notifications.table.data.recipients',
    },
];
