import { Box, TableCell } from '@mui/material';
import CustomWidthTooltip from 'components/shared/CustomWidthTooltip';
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';

interface Props {
    date: string | Date;
}

function TimeStamp({ date }: Props) {
    const intl = useIntl();

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
                    <FormattedDate month="long" year="numeric" value={date} />
                </Box>
            </CustomWidthTooltip>
        </TableCell>
    );
}

export default TimeStamp;
