import { Box, TableCell, TableRow, useTheme } from '@mui/material';
import { BaseDataPlaneQuery } from 'api/dataPlanes';
import SingleLineCode from 'components/content/SingleLineCode';
import DataPlane from 'components/shared/Entity/DataPlane';
import { getEntityTableRowSx } from 'context/Theme';
import useCidrBlocks from 'hooks/useCidrBlocks';
import {
    formatDataPlaneName,
    generateDataPlaneOption,
} from 'utils/dataPlane-utils';

interface RowsProps {
    data: BaseDataPlaneQuery[];
}

interface RowProps {
    row: BaseDataPlaneQuery;
}

function Row({ row }: RowProps) {
    const theme = useTheme();

    const cidrBlocks = useCidrBlocks();
    const dataPlaneOption = generateDataPlaneOption(row);

    return (
        <TableRow hover sx={getEntityTableRowSx(theme)}>
            <TableCell>
                {Boolean(dataPlaneOption.dataPlaneName) ? (
                    <Box sx={{ minWidth: 'fit-content', whiteSpace: 'nowrap' }}>
                        <DataPlane
                            dataPlaneName={dataPlaneOption.dataPlaneName}
                            formattedSuffix={formatDataPlaneName(
                                dataPlaneOption.dataPlaneName
                            )}
                            hidePrefix
                            logoSize={30}
                            scope={dataPlaneOption.scope}
                        />
                    </Box>
                ) : null}
            </TableCell>
            <TableCell>
                <SingleLineCode value={dataPlaneOption.reactorAddress} />
            </TableCell>
            <TableCell>
                <SingleLineCode value={cidrBlocks(row.cidr_blocks)} />
            </TableCell>
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
