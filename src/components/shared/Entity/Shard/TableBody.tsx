import { Box, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import TableLoadingRows from 'components/tables/Loading';
import { shardTableRow } from 'context/Theme';
import { Shard } from 'data-plane-gateway/types/shard_client';
import { FormattedMessage } from 'react-intl';
import { TableColumns } from 'types';
import StatusIndicatorAndLabel from './StatusIndicatorAndLabel';

interface Props {
    columns: TableColumns[];
    page: number;
    rowsPerPage: number;
    shards: Shard[] | null;
}

function InformationTableBody({ columns, page, rowsPerPage, shards }: Props) {
    if (shards === null) {
        return (
            <TableBody>
                <TableLoadingRows columns={columns} singleRow />
            </TableBody>
        );
    }

    if (shards.length === 0) {
        return (
            <TableBody>
                <TableRow
                    sx={{
                        background: (theme) =>
                            shardTableRow[theme.palette.mode],
                    }}
                >
                    <TableCell colSpan={2}>
                        <Box
                            sx={{
                                p: 2,
                                display: 'flex',
                                justifyContent: 'center',
                            }}
                        >
                            <FormattedMessage id="detailsPanel.shardDetails.noStatusFound" />
                        </Box>
                    </TableCell>
                </TableRow>
            </TableBody>
        );
    }

    return (
        <TableBody>
            {shards
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((shard) => (
                    <TableRow
                        key={shard.spec.id}
                        sx={{
                            background: (theme) =>
                                shardTableRow[theme.palette.mode],
                        }}
                    >
                        <StatusIndicatorAndLabel shard={shard} />

                        <TableCell>
                            <Typography>{shard.spec.id}</Typography>
                        </TableCell>
                    </TableRow>
                ))}
        </TableBody>
    );
}

export default InformationTableBody;
