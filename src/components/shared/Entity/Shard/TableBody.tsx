import { Box, TableBody, TableCell, TableRow, Typography } from '@mui/material';

import { FormattedMessage } from 'react-intl';

import TableLoadingRows from 'src/components/tables/Loading';
import { semiTransparentBackgroundIntensified } from 'src/context/Theme';
import {
    useShardDetail_dictionaryHydrated,
    useShardDetail_readDictionary,
} from 'src/stores/ShardDetail/hooks';
import type { ShardEntityTypes } from 'src/stores/ShardDetail/types';
import type { TableColumns } from 'src/types';
import { getColumnKeyList } from 'src/utils/table-utils';
import StatusIndicatorAndLabel from 'src/components/shared/Entity/Shard/StatusIndicatorAndLabel';

interface Props {
    page: number;
    rowsPerPage: number;
    columns: TableColumns[];
    taskTypes: ShardEntityTypes[];
    taskName: string;
}

function InformationTableBody({
    columns,
    page,
    rowsPerPage,
    taskTypes,
    taskName,
}: Props) {
    const dictionaryHydrated = useShardDetail_dictionaryHydrated();
    const dictionaryVals = useShardDetail_readDictionary(taskName, taskTypes);

    if (!dictionaryHydrated) {
        return (
            <TableBody>
                <TableLoadingRows
                    columnKeys={getColumnKeyList(columns)}
                    singleRow
                />
            </TableBody>
        );
    }

    if (dictionaryVals.allShards.length === 0) {
        return (
            <TableBody>
                <TableRow
                    sx={{
                        bgcolor: (theme) =>
                            semiTransparentBackgroundIntensified[
                                theme.palette.mode
                            ],
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
            {dictionaryVals.allShards
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((shard) => (
                    <TableRow
                        key={shard.id}
                        sx={{
                            bgcolor: (theme) =>
                                semiTransparentBackgroundIntensified[
                                    theme.palette.mode
                                ],
                        }}
                    >
                        <TableCell width={250}>
                            <StatusIndicatorAndLabel shard={shard} />
                        </TableCell>

                        <TableCell>
                            <Typography>{shard.id}</Typography>
                        </TableCell>
                    </TableRow>
                ))}
        </TableBody>
    );
}

export default InformationTableBody;
