import MessageWithLink from 'components/content/MessageWithLink';
import { FormattedMessage } from 'react-intl';
import { Pagination } from 'services/supabase';
import { TableColumns, TableIntlConfig, TableStatuses } from 'types';
import { TableCellBaseProps } from '@mui/material';
import { ElementType } from 'react';

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
    header: any;
    body: any;
    cell: ElementType<TableCellBaseProps>;
    row: any;
} => {
    if (!enableDivRendering) {
        return {
            header: 'theader',
            body: 'tbody',
            cell: 'td',
            row: 'tr',
        };
    }

    return {
        header: 'div',
        body: 'div',
        cell: 'div',
        row: 'div',
    };
};
