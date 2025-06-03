import type { TableSettingsState } from 'src/context/TableSettings';
import type { Pagination } from 'src/services/supabase';
import type { TablePrefix } from 'src/stores/Tables/hooks';
import type { TableColumns, TableIntlConfig } from 'src/types';

import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import MessageWithLink from 'src/components/content/MessageWithLink';
import { TableStatuses } from 'src/types';

export const getCountSettings = (pagination: any) =>
    pagination.from === 0 ? 'exact' : undefined;

export const getEmptyTableHeader = (
    tableStatus: TableStatuses,
    intlConfig: TableIntlConfig
): string => {
    switch (tableStatus) {
        case TableStatuses.TECHNICAL_DIFFICULTIES:
            return 'entityTable.technicalDifficulties.header';
        case TableStatuses.UNMATCHED_FILTER:
            return 'entityTable.unmatchedFilter.header';
        case TableStatuses.NETWORK_FAILED:
            return 'entityTable.networkFailed.header';
        default:
            return intlConfig.header;
    }
};

export function getEmptyTableMessage(
    tableStatus: TableStatuses,
    intlConfig: TableIntlConfig
): JSX.Element {
    switch (tableStatus) {
        case TableStatuses.TECHNICAL_DIFFICULTIES:
            return (
                <FormattedMessage id="entityTable.technicalDifficulties.message" />
            );
        case TableStatuses.UNMATCHED_FILTER:
            return (
                <FormattedMessage id="entityTable.unmatchedFilter.message" />
            );
        case TableStatuses.NETWORK_FAILED:
            return <FormattedMessage id="entityTable.networkFailed.message" />;
        default: {
            const { disableDoclink, message } = intlConfig;

            if (disableDoclink) {
                return <FormattedMessage id={message} />;
            }

            return <MessageWithLink messageID={message} />;
        }
    }
}

export const getPagination = (currPage: number, size: number) => {
    const limit = size;
    const from = currPage ? currPage * limit : 0;
    const to = (currPage ? from + size : size) - 1;

    return { from, to };
};

export const getStartingPage = (val: Pagination, size: number) => {
    return val.from / size;
};

export const getColumnKeyList = (columns: TableColumns[]) =>
    columns.flatMap((column, index) =>
        [...Array(column.cols ?? 1)].map(
            (_, indexCount) => `${column.field}__${indexCount}-${index}`
        )
    );

// TODO (typing) - how MUI does typing for tables
// seems a bit wonky to me. I think you can override the component
//  in the parent and this alters what type the component prop
//  takes in children.
export const getTableComponents = (
    enableDivRendering?: boolean
): {
    theaderComponent: any;
    tbodyComponent: any;
    tdComponent: any;
    trComponent: any;
} => {
    if (!enableDivRendering) {
        return {
            theaderComponent: TableHead,
            tbodyComponent: TableBody,
            tdComponent: TableCell,
            trComponent: TableRow,
        };
    }

    return {
        theaderComponent: 'div',
        tbodyComponent: 'div',
        tdComponent: 'div',
        trComponent: 'div',
    };
};

export const evaluateColumnsToShow = (
    optionalColumns: string[],
    tableColumns: TableColumns[],
    tablePrefix: TablePrefix,
    tableSettings: TableSettingsState['tableSettings'],
    skipSettingsCheck?: boolean
) => {
    if (
        !skipSettingsCheck &&
        tableSettings &&
        Object.hasOwn(tableSettings, tablePrefix)
    ) {
        const hiddenColumns = optionalColumns.filter(
            (headerIntlKey) =>
                !tableSettings[tablePrefix].shownOptionalColumns.includes(
                    headerIntlKey
                )
        );

        return tableColumns.filter(({ headerIntlKey }) =>
            headerIntlKey ? !hiddenColumns.includes(headerIntlKey) : false
        );
    }

    return tableColumns;
};

export const isColumnVisible = (columns: TableColumns[], intlKey: string) =>
    columns.some((column) => column.headerIntlKey === intlKey);
