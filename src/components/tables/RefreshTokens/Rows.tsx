import { TableCell, TableRow, useTheme } from '@mui/material';
import { RefreshTokenQuery } from 'api/tokens';
import { getEntityTableRowSx } from 'context/Theme';
import { FormattedMessage } from 'react-intl';
import TimeStamp from '../cells/TimeStamp';
import RevokeTokenButton from '../cells/refreshTokens/RevokeToken';

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
            <TimeStamp time={row.created_at} enableRelative />

            <TableCell>{row.user_id}</TableCell>

            <TableCell>{row.detail}</TableCell>

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
