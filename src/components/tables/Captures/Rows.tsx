import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
    Box,
    Button,
    Collapse,
    TableCell,
    TableRow,
    Tooltip,
} from '@mui/material';
import CaptureDetails from 'components/capture/Details';
import { ZustandProvider } from 'components/editor/Store';
import { LiveSpecsQuery } from 'components/tables/Captures';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { FormattedDate, FormattedMessage } from 'react-intl';
import { getDeploymentStatusHexCode, stripPathing } from 'utils/misc-utils';

interface RowsProps {
    data: LiveSpecsQuery[];
}

interface RowProps {
    data: LiveSpecsQuery;
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
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastUpdated',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.actions',
    },
];

function Row({ data }: RowProps) {
    const [fooBar, setFooBar] = useState(false);

    return (
        <>
            <TableRow>
                <TableCell
                    sx={{
                        'minWidth': 256,
                        '& > *': {
                            borderBottom: 'unset',
                        },
                    }}
                >
                    <Tooltip title={data.catalog_name} placement="bottom-start">
                        <Box>
                            <span
                                style={{
                                    height: 16,
                                    width: 16,
                                    backgroundColor:
                                        getDeploymentStatusHexCode('ACTIVE'),
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
                                {data.catalog_name}
                            </span>
                        </Box>
                    </Tooltip>
                </TableCell>

                <TableCell sx={{ minWidth: 100 }}>
                    {stripPathing(data.connector_image_name)}
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
                                value={data.updated_at}
                            />
                        }
                        placement="bottom-start"
                    >
                        <Box>
                            {formatDistanceToNow(new Date(data.updated_at), {
                                addSuffix: true,
                            })}
                        </Box>
                    </Tooltip>
                </TableCell>

                <TableCell align="right">
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
                                setFooBar(!fooBar);
                            }}
                            endIcon={
                                fooBar ? (
                                    <KeyboardArrowUpIcon />
                                ) : (
                                    <KeyboardArrowDownIcon />
                                )
                            }
                        >
                            <FormattedMessage id="capturesTable.detailsCTA" />
                        </Button>
                    </Box>
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={tableColumns.length}
                >
                    <Collapse in={fooBar} unmountOnExit>
                        <ZustandProvider stateKey="liveSpecEditor">
                            <CaptureDetails lastPubId={data.last_pub_id} />
                        </ZustandProvider>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

function Rows({ data }: RowsProps) {
    return (
        <>
            {data.map((row) => (
                <Row data={row} key={row.id} />
            ))}
        </>
    );
}

export default Rows;
