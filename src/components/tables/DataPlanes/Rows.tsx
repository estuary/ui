import { Box, TableCell, TableRow, useTheme } from '@mui/material';

import { BaseDataPlaneQuery } from 'src/api/dataPlanes';
import SingleLineCode from 'src/components/content/SingleLineCode';
import CopyCidrBlocks from 'src/components/shared/CopyCidrBlocks';
import DataPlane from 'src/components/shared/Entity/DataPlane';
import { getEntityTableRowSx } from 'src/context/Theme';
import {
    formatDataPlaneName,
    generateDataPlaneOption,
} from 'src/utils/dataPlane-utils';

interface RowsProps {
    data: BaseDataPlaneQuery[];
}

interface RowProps {
    row: BaseDataPlaneQuery;
}

function Row({ row }: RowProps) {
    const theme = useTheme();

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
                {row.aws_iam_user_arn ? (
                    <SingleLineCode value={row.aws_iam_user_arn} />
                ) : null}
            </TableCell>
            <TableCell>
                {row.gcp_service_account_email ? (
                    <SingleLineCode value={row.gcp_service_account_email} />
                ) : null}
            </TableCell>
            <TableCell>
                <CopyCidrBlocks cidrBlocks={row.cidr_blocks} />
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
