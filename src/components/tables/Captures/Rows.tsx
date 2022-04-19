import { Box, Button, TableCell, TableRow, Tooltip } from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { FormattedDate } from 'react-intl';
import { getDeploymentStatusHexCode, stripPathing } from 'utils/misc-utils';

interface Props {
    data: any[];
}

function Rows({ data }: Props) {
    return (
        <>
            {data.map((publication: any) => (
                <TableRow key={`Entity-${publication.id}`}>
                    <TableCell sx={{ minWidth: 256 }}>
                        <Tooltip
                            title={publication.catalog_name}
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
                                    {stripPathing(publication.catalog_name)}
                                </span>
                            </Box>
                        </Tooltip>
                    </TableCell>

                    <TableCell sx={{ minWidth: 256 }}>
                        {stripPathing(publication.connector_image_name)}
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
                                    value={publication.updated_at}
                                />
                            }
                            placement="bottom-start"
                        >
                            <Box>
                                {formatDistanceToNow(
                                    new Date(publication.updated_at),
                                    {
                                        addSuffix: true,
                                    }
                                )}
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
                                disabled
                                sx={{ mr: 1 }}
                            >
                                Edit
                            </Button>

                            <Button
                                variant="contained"
                                size="small"
                                color="success"
                                disableElevation
                                disabled
                            >
                                Stop
                            </Button>
                        </Box>
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
}

export default Rows;
