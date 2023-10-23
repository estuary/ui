import { Box, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import TableLoadingRows from 'components/tables/Loading';
import { semiTransparentBackgroundIntensified } from 'context/Theme';
import { FormattedMessage } from 'react-intl';
import {
    useShardDetail_dictionaryHydrated,
    useShardDetail_readDictionary,
} from 'stores/ShardDetail/hooks';
import { Entity, TableColumns } from 'types';
import StatusIndicatorAndLabel from './StatusIndicatorAndLabel';

interface Props {
    page: number;
    rowsPerPage: number;
    columns: TableColumns[];
    taskType: Entity;
    taskName: string;
}

function InformationTableBody({
    columns,
    page,
    rowsPerPage,
    taskType,
    taskName,
}: Props) {
    const dictionaryHydrated = useShardDetail_dictionaryHydrated();
    const dictionaryVals = useShardDetail_readDictionary(taskName, taskType);

    if (!dictionaryHydrated) {
        return (
            <TableBody>
                <TableLoadingRows columns={columns} singleRow />
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
                        <StatusIndicatorAndLabel shard={shard} />

                        <TableCell>
                            <Typography>{shard.id}</Typography>
                        </TableCell>
                    </TableRow>
                ))}
        </TableBody>
    );
}

export default InformationTableBody;
