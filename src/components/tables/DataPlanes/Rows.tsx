import type { BaseDataPlaneQuery } from 'src/api/dataPlanes';

import { Stack, TableCell, TableRow, useTheme } from '@mui/material';

import SingleLineCode from 'src/components/content/SingleLineCode';
import CopyToClipboardButton from 'src/components/shared/buttons/CopyToClipboardButton';
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
    rowSx: any;
}

function Row({ row, rowSx }: RowProps) {
    const dataPlaneOption = generateDataPlaneOption(row);

    return (
        <TableRow hover sx={rowSx}>
            <TableCell>
                {Boolean(dataPlaneOption.dataPlaneName) ? (
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{
                            justifyContent: 'space-between',
                            minWidth: 'fit-content',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <DataPlane
                            dataPlaneName={dataPlaneOption.dataPlaneName}
                            formattedSuffix={formatDataPlaneName(
                                dataPlaneOption.dataPlaneName
                            )}
                            hidePrefix
                            logoSize={30}
                            scope={dataPlaneOption.scope}
                        />
                        <CopyToClipboardButton
                            writeValue={dataPlaneOption.dataPlaneName.whole}
                        />
                    </Stack>
                ) : null}
            </TableCell>
            <TableCell>
                {row.aws_iam_user_arn ? (
                    <SingleLineCode compact value={row.aws_iam_user_arn} />
                ) : null}
            </TableCell>
            <TableCell>
                {row.gcp_service_account_email ? (
                    <SingleLineCode
                        compact
                        value={row.gcp_service_account_email}
                    />
                ) : null}
            </TableCell>
            <TableCell>
                <CopyCidrBlocks cidrBlocks={row.cidr_blocks} />
            </TableCell>
            <TableCell>
                {row.data_plane_fqdn ? (
                    <SingleLineCode
                        compact
                        value={`https://openid.estuary.dev/${row.data_plane_fqdn}`}
                    />
                ) : null}
            </TableCell>
        </TableRow>
    );
}

function Rows({ data }: RowsProps) {
    const theme = useTheme();

    return (
        <>
            {data.map((row) => (
                <Row
                    key={row.id}
                    row={row}
                    rowSx={getEntityTableRowSx(theme)}
                />
            ))}
        </>
    );
}

export default Rows;
