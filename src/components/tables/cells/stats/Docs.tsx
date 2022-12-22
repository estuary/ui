import { Box, TableCell, Tooltip, Typography } from '@mui/material';
import {
    semiTransparentBackgroundIntensified,
    tableBorderSx,
} from 'context/Theme';
import { useMemo } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import readable from 'readable-numbers';

interface Props {
    read?: boolean;
    val?: number | null;
}

const Docs = ({ read, val }: Props) => {
    const intl = useIntl();
    const statsLoading = val === null;
    const defaultedVal = val ?? 0;
    const number = useMemo(
        () => readable(defaultedVal, 2, false),
        [defaultedVal]
    );

    return (
        <TableCell
            sx={{
                ...tableBorderSx,
                minWidth: 'min-content',
                maxWidth: 'min-content',
            }}
        >
            <Box sx={{ maxWidth: 'fit-content' }}>
                <Tooltip
                    title={`${defaultedVal} ${intl.formatMessage({
                        id: read
                            ? 'entityTable.stats.docs_read'
                            : 'entityTable.stats.docs_written',
                    })}`}
                >
                    <Typography
                        sx={{
                            transitionDelay: statsLoading ? '800ms' : '0ms',
                            color: (theme) =>
                                statsLoading
                                    ? semiTransparentBackgroundIntensified[
                                          theme.palette.mode
                                      ]
                                    : null,
                        }}
                    >
                        <FormattedMessage
                            id="entityTable.stats.docs"
                            values={{
                                docCount: number,
                            }}
                        />
                    </Typography>
                </Tooltip>
            </Box>
        </TableCell>
    );
};

export default Docs;
