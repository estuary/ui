import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Box, Button, Collapse, TableCell, TableRow } from '@mui/material';
import { grey } from '@mui/material/colors';
import CaptureDetails from 'components/capture/Details';
import { createEditorStore } from 'components/editor/Store';
import { LiveSpecsQuery } from 'components/tables/Captures';
import ChipList from 'components/tables/cells/ChipList';
import EntityName from 'components/tables/cells/EntityName';
import TimeStamp from 'components/tables/cells/TimeStamp';
import { ZustandProvider } from 'hooks/useZustand';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { stripPathing } from 'utils/misc-utils';

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
        field: 'writes_to',
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

function Row({ data }: RowProps) {
    const intl = useIntl();
    const [detailsExpanded, setDetailsExpanded] = useState(false);

    return (
        <>
            <TableRow
                sx={{
                    background: detailsExpanded ? grey[50] : null,
                }}
            >
                <EntityName name={data.catalog_name} />

                <TableCell sx={{ minWidth: 100 }}>
                    {stripPathing(data.connector_image_name)}
                </TableCell>

                <ChipList strings={data.writes_to} />

                <TimeStamp time={data.updated_at} />

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
                            aria-expanded={detailsExpanded}
                            aria-label={intl.formatMessage({
                                id: detailsExpanded
                                    ? 'aria.closeExpand'
                                    : 'aria.openExpand',
                            })}
                            onClick={() => {
                                setDetailsExpanded(!detailsExpanded);
                            }}
                            endIcon={
                                <KeyboardArrowDownIcon
                                    sx={{
                                        marginRight: 0,
                                        transform: `rotate(${
                                            detailsExpanded ? '180' : '0'
                                        }deg)`,
                                        transition: 'all 250ms ease-in-out',
                                    }}
                                />
                            }
                        >
                            <FormattedMessage id="cta.details" />
                        </Button>
                    </Box>
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell
                    sx={detailsExpanded ? null : { pb: 0, pt: 0 }}
                    colSpan={tableColumns.length}
                >
                    <Collapse in={detailsExpanded} unmountOnExit>
                        <ZustandProvider
                            createStore={createEditorStore}
                            key="liveSpecEditor"
                        >
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
