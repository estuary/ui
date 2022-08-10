import MessageWithLink from 'components/content/MessageWithLink';
import { FormattedMessage } from 'react-intl';
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
