import { TableCell } from '@mui/material';
import { tableBorderSx } from 'context/Theme';

const Stats = () => {
    return (
        <TableCell
            sx={{
                ...tableBorderSx,
                maxWidth: 'min-content',
            }}
        >
            {/*{isValidating ? (
                <Skeleton />
            ) : stats ? (
                <Tooltip
                    title={<FormattedMessage id="entityTable.stats.error" />}
                >
                    <ErrorOutlineIcon color="error" />
                </Tooltip>
            ) : error ? (
                <Stack direction="row" spacing={1}>
                    <Typography sx={{ fontFamily: 'Monospace' }}>
                        {children}
                    </Typography>
                    <Typography>
                        <FormattedMessage id="entityTable.stats.label" />
                    </Typography>
                    <Typography sx={{ fontFamily: 'Monospace' }}>
                        <FormattedDate
                            hour="numeric"
                            timeZoneName="short"
                            value=""
                        />
                    </Typography>
                </Stack>
            ) : null}*/}
        </TableCell>
    );
};

export default Stats;
