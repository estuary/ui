import type { TableColumns } from 'src/types';

import { SelectTableStoreNames } from 'src/stores/names';

// TODO (optimization): The prefix alert table should have a last updated column
//   however the current data model does not provide a means to reliably track
//   when the emails subscribed to alerts under a given prefix were last updated.
//   If the most recently subscribed email for a given prefix is removed,
//   the latest `updated_at` value would be rolling back in time.
export const columns: TableColumns[] = [
    {
        field: 'catalog_prefix',
        headerIntlKey: 'entityTable.data.catalogPrefix',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.alertTypes',
        width: 225,
    },
    {
        field: null,
        headerIntlKey: 'alerts.config.table.label.alertMethod',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.actions',
    },
];

export const selectableTableStoreName = SelectTableStoreNames.PREFIX_ALERTS;
