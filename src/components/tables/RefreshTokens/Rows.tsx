import type { RefreshTokenQuery } from 'src/api/tokens';

import { TableCell, TableRow, Typography, useTheme } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import RevokeTokenButton from 'src/components/tables/cells/refreshTokens/RevokeToken';
import TimeStamp from 'src/components/tables/cells/TimeStamp';
import { getEntityTableRowSx } from 'src/context/Theme';

interface RowsProps {
    data: RefreshTokenQuery[];
}

interface RowProps {
    row: RefreshTokenQuery;
}

function Row({ row }: RowProps) {
    const theme = useTheme();

    return (
        <TableRow hover sx={getEntityTableRowSx(theme)}>
            <TimeStamp time={row.created_at} enableExact />

            <TableCell>
                <Typography sx={{ textWrap: 'wrap' }}>{row.detail}</Typography>
            </TableCell>

            <TableCell>
                <FormattedMessage
                    id="admin.cli_api.refreshToken.table.label.uses"
                    values={{ count: row.uses }}
                />
            </TableCell>

            <RevokeTokenButton id={row.id} />
        </TableRow>
    );
}

function Rows({ data }: RowsProps) {
    return (
        <>
            {data.map((row) => (
                <Row key={row.id} row={row} />
            ))}
        </>
    );
}

export default Rows;
