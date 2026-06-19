import { Box, TableCell } from '@mui/material';

import { format } from 'date-fns';

import CustomWidthTooltip from 'src/components/shared/CustomWidthTooltip';
import { stripTimeFromDate } from 'src/utils/billing-utils';

interface Props {
    date: string;
    asLink?: boolean;
    // Builds the tooltip text from the fully formatted date (e.g.
    // "June 18, 2026"), letting the caller own the surrounding copy.
    getTooltip: (formattedDate: string) => string;
}

function TimeStamp({ date, asLink, getTooltip }: Props) {
    const strippedDate = stripTimeFromDate(date);

    return (
        <TableCell>
            <CustomWidthTooltip
                title={getTooltip(format(strippedDate, 'MMMM d, yyyy'))}
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
                    {/* Keep the month and day together so the year is the only
                        wrap point and drops to the next line in a narrow column. */}
                    <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                        {format(strippedDate, 'MMM d')},
                    </Box>{' '}
                    {format(strippedDate, 'yyyy')}
                </Box>
            </CustomWidthTooltip>
        </TableCell>
    );
}

export default TimeStamp;
