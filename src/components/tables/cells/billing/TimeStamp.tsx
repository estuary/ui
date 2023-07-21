import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';

import { Box, TableCell } from '@mui/material';

import CustomWidthTooltip from 'components/shared/CustomWidthTooltip';

import { stripTimeFromDate } from 'utils/billing-utils';

interface Props {
    date: string;
}

function TimeStamp({ date }: Props) {
    const intl = useIntl();

    const strippedDate = stripTimeFromDate(date);

    return (
        <TableCell>
            <CustomWidthTooltip
                title={
                    <FormattedMessage
                        id="admin.billing.table.history.tooltip.month"
                        values={{
                            timestamp: intl.formatDate(date, {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                                second: 'numeric',
                                timeZoneName: 'short',
                            }),
                        }}
                    />
                }
                placement="bottom-start"
            >
                <Box>
                    <FormattedDate
                        month="long"
                        year="numeric"
                        value={strippedDate}
                    />
                </Box>
            </CustomWidthTooltip>
        </TableCell>
    );
}

export default TimeStamp;
