import type { CSSProperties } from 'react';
import type { TableColumns } from 'src/types';

import { SelectTableStoreNames } from 'src/stores/names';

export const ACTIONS_TABLE_COLUMN_WIDTH = 80;
export const EXPANDING_TABLE_COLUMN_WIDTH = 250;
export const TABLE_HEADER_HEIGHT = 40;
export const TABLE_ROW_HEIGHT = 50;

export const baseVirtualizedTableCell: CSSProperties = {
    alignItems: 'inherit',
    display: 'inline-flex',
};

// TODO (optimization): The prefix alert table should have a last updated column
//   however the current data model does not provide a means to reliably track
//   when the emails subscribed to alerts under a given prefix were last updated.
//   If the most recently subscribed email for a given prefix is removed,
//   the latest `updated_at` value would be rolling back in time.
export const columns: TableColumns[] = [
    {
        field: 'catalog_prefix',
        flexGrow: true,
        flexShrink: true,
        headerIntlKey: 'entityTable.data.catalogPrefix',
        width: EXPANDING_TABLE_COLUMN_WIDTH,
    },
    {
        field: null,
        flexGrow: true,
        flexShrink: true,
        headerIntlKey: 'entityTable.data.alertTypes',
        width: EXPANDING_TABLE_COLUMN_WIDTH,
    },
    {
        field: null,
        flexGrow: true,
        flexShrink: true,
        headerIntlKey: 'alerts.config.table.label.alertMethod',
        width: EXPANDING_TABLE_COLUMN_WIDTH,
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.actions',
        width: ACTIONS_TABLE_COLUMN_WIDTH,
    },
];

export const selectableTableStoreName = SelectTableStoreNames.PREFIX_ALERTS;
