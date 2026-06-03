import type { RefreshTokenInfo } from 'src/gql-types/graphql';

import { TableCell, TableRow, Typography, useTheme } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import RevokeTokenButton from 'src/components/tables/cells/refreshTokens/RevokeToken';
import TimeStamp from 'src/components/tables/cells/TimeStamp';
import { getEntityTableRowSx } from 'src/context/Theme';

interface RowsProps {
    data: Pick<RefreshTokenInfo, 'id' | 'detail' | 'createdAt' | 'uses'>[];
}

interface RowProps {
    row: RowsProps['data'][number];
}

function Row({ row }: RowProps) {
    const theme = useTheme();

    return (
        <TableRow hover sx={getEntityTableRowSx(theme)}>
            <TimeStamp time={row.createdAt} enableExact />

            <TableCell>
                <Typography sx={{ textWrap: 'wrap' }}>{row.detail}</Typography>
            </TableCell>

            <TableCell>
                <FormattedMessage
                    id="admin.cli_api.refreshToken.table.label.uses"
                    values={{ count: row.uses }}
                />
            </TableCell>

            <RevokeTokenButton id={row.id} detail={row.detail} />
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
