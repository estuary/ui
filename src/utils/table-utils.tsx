import MessageWithLink from 'components/content/MessageWithLink';
import { FormattedMessage } from 'react-intl';
import { Pagination } from 'services/supabase';
import { TableIntlConfig, TableStatuses } from 'types';

export const getEmptyTableHeader = (
    tableStatus: TableStatuses,
    intlConfig: TableIntlConfig
): string => {
    switch (tableStatus) {
        case TableStatuses.TECHNICAL_DIFFICULTIES:
            return 'entityTable.technicalDifficulties.header';
        case TableStatuses.UNMATCHED_FILTER:
            return 'entityTable.unmatchedFilter.header';
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
