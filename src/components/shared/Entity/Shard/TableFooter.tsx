import {
    SxProps,
    TableFooter,
    TablePagination,
    TableRow,
    Theme,
    useTheme,
} from '@mui/material';
import { semiTransparentBackground } from 'context/Theme';
import { useShardDetail_readDictionary } from 'stores/ShardDetail/hooks';
import { Entity } from 'types';

interface Props {
    page: number;
    rowsPerPage: number;
    taskType: Entity;
    taskName: string;
    changePage: (event: any, newPage: number) => void;
}

function InformationTableFooter({
    changePage,
    page,
    rowsPerPage,
    taskType,
    taskName,
}: Props) {
    const theme = useTheme();
    const tableHeaderFooterSx: SxProps<Theme> = {
        bgcolor: semiTransparentBackground[theme.palette.mode],
    };
    const dictionaryVals = useShardDetail_readDictionary(taskName, taskType);
    const count = dictionaryVals.allShards.length;

    return (
        <TableFooter>
            <TableRow sx={{ ...tableHeaderFooterSx }}>
                {count > 0 ? (
                    <TablePagination
                        count={count}
                        rowsPerPageOptions={[rowsPerPage]}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={changePage}
                    />
                ) : null}
            </TableRow>
        </TableFooter>
    );
}

export default InformationTableFooter;
