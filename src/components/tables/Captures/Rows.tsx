import { Box, Button, TableCell, TableRow, Tooltip } from '@mui/material';
import { routeDetails } from 'app/Authenticated';
import { LiveSpecQuery } from 'components/tables/Captures';
import { formatDistanceToNow } from 'date-fns';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router';
import { getDeploymentStatusHexCode, stripPathing } from 'utils/misc-utils';

interface Props {
    data: LiveSpecQuery[];
}

export const tableColumns = [
    {
        field: 'catalog_name',
        headerIntlKey: 'entityTable.data.entity',
    },
    {
        field: 'connector_image_name',
        headerIntlKey: 'entityTable.data.connectorType',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.writesTo',
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
    const navigate = useNavigate();

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
                                    {stripPathing(row.catalog_name)}
                                </span>
                            </Box>
                        </Tooltip>
                    </TableCell>

                    <TableCell sx={{ minWidth: 100 }}>
                        {stripPathing(row.connector_image_name)}
                    </TableCell>

                    <TableCell>{row.writes_to}</TableCell>

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
                                onClick={() => {
                                    navigate(
                                        `${routeDetails.capture.details.fullPath}?${routeDetails.capture.details.params.pubID}=${row.last_pub_id}`
                                    );
                                }}
                            >
                                <FormattedMessage id="capturesTable.detailsCTA" />
                            </Button>
                        </Box>
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
}

export default Rows;
