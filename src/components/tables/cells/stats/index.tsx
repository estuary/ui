import { Stack, TableCell, Typography } from '@mui/material';
import { tableBorderSx } from 'context/Theme';
import useCatalogStats from 'hooks/useCatalogStats';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { BaseComponentProps } from 'types';

interface Props extends BaseComponentProps {
    name: string;
    time: string;
}

const Stats = ({ children, name }: Props) => {
    const { stats, error, isValidating } = useCatalogStats(name);

    console.log('stats', stats);

    return (
        <TableCell
            sx={{
                ...tableBorderSx,
                maxWidth: 'min-content',
            }}
        >
            {isValidating ? (
                <>loading...</>
            ) : error ? (
                <>uh oh</>
            ) : stats ? (
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
                            value={stats.ts}
                        />
                    </Typography>
                </Stack>
            ) : null}
        </TableCell>
    );
};

export default Stats;
