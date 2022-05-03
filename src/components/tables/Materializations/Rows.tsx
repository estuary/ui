import { Box, Button, TableCell, TableRow, Tooltip } from '@mui/material';
import { LiveSpecsQuery } from 'components/tables/Captures';
import { formatDistanceToNow } from 'date-fns';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { getDeploymentStatusHexCode } from 'utils/misc-utils';

interface Props {
    data: LiveSpecsQuery[];
}

export const tableColumns = [
    {
        field: 'catalog_name',
        headerIntlKey: 'entityTable.data.entity',
    },
    {
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastUpdated',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.actions',
    },
];

function Rows({ data }: Props) {
    return (
        <>
            {data.map((row) => (
                <TableRow key={`Entity-${row.id}`}>
                    <TableCell sx={{ minWidth: 256 }}>
                        <Tooltip
                            title={row.catalog_name}
                            placement="bottom-start"
                        >
                            <Box>
                                <span
                                    style={{
                                        height: 16,
                                        width: 16,
                                        backgroundColor:
                                            getDeploymentStatusHexCode(
                                                'ACTIVE'
                                            ),
                                        borderRadius: 50,
                                        display: 'inline-block',
                                        verticalAlign: 'middle',
                                        marginRight: 12,
                                    }}
                                />
                                <span
                                    style={{
                                        verticalAlign: 'middle',
                                    }}
                                >
                                    {row.catalog_name}
                                </span>
                            </Box>
                        </Tooltip>
                    </TableCell>

                    <TableCell>
                        <Tooltip
                            title={
                                <FormattedDate
                                    day="numeric"
                                    month="long"
                                    year="numeric"
                                    hour="numeric"
                                    minute="numeric"
                                    second="numeric"
                                    timeZoneName="short"
                                    value={row.updated_at}
                                />
                            }
                            placement="bottom-start"
                        >
                            <Box>
                                {formatDistanceToNow(new Date(row.updated_at), {
                                    addSuffix: true,
                                })}
                            </Box>
                        </Tooltip>
                    </TableCell>

                    <TableCell>
                        <Box
                            sx={{
                                display: 'flex',
                            }}
                        >
                            <Button
                                variant="contained"
                                size="small"
                                disableElevation
                                sx={{ mr: 1 }}
                                disabled
                            >
                                <FormattedMessage id="cta.details" />
                            </Button>
                        </Box>
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
}

export default Rows;
