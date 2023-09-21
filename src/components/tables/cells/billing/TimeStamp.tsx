import { Box, TableCell } from '@mui/material';
import CustomWidthTooltip from 'components/shared/CustomWidthTooltip';
import { FormattedDate, FormattedMessage, useIntl } from 'react-intl';
import { stripTimeFromDate } from 'utils/billing-utils';

interface Props {
    date: string;
    asLink?: boolean;
    tooltipMessageId: string;
}

function TimeStamp({ date, asLink, tooltipMessageId }: Props) {
    const intl = useIntl();

    const strippedDate = stripTimeFromDate(date);

    return (
        <TableCell>
            <CustomWidthTooltip
                title={
                    <FormattedMessage
                        id={tooltipMessageId}
                        values={{
                            timestamp: intl.formatDate(strippedDate, {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                            }),
                        }}
                    />
                }
                placement="bottom-start"
            >
                <Box
                    sx={
                        asLink
                            ? {
                                  textDecoration: 'underline',
                                  color: (theme) => theme.palette.primary.dark,
                              }
                            : undefined
                    }
                >
                    <FormattedDate dateStyle="medium" value={strippedDate} />
                </Box>
            </CustomWidthTooltip>
        </TableCell>
    );
}

export default TimeStamp;
