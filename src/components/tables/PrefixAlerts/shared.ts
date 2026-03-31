import type { SortDirection, TableColumns } from 'src/types';

import { SelectTableStoreNames } from 'src/stores/names';
import {
    basicSort_string,
    compareInitialCharacterType,
} from 'src/utils/misc-utils';

export const TABLE_HEADER_HEIGHT = 40;
export const TABLE_ROW_HEIGHT = 50;

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

export const sortByAlertType = (
    a: { isSystemAlert: boolean; value: string },
    b: { isSystemAlert: boolean; value: string },
    sortDirection: SortDirection
) => {
    // If a is not a system alert and b is then return <0 to put a first
    if (!a.isSystemAlert && b.isSystemAlert) {
        return -1;
    }

    // If a is a system alert and b is not then return >0 to put b first
    if (a.isSystemAlert && !b.isSystemAlert) {
        return 1;
    }

    const sortResult = compareInitialCharacterType(a.value, b.value);

    if (typeof sortResult === 'number') {
        return sortResult;
    }

    return basicSort_string(a.value, b.value, sortDirection);
};
