import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Box, Button, Collapse, TableCell, TableRow } from '@mui/material';
import { grey } from '@mui/material/colors';
import CaptureDetails from 'components/capture/Details';
import { createEditorStore } from 'components/editor/Store';
import { LiveSpecsExtQuery } from 'components/tables/Captures';
import ChipList from 'components/tables/cells/ChipList';
import Connector from 'components/tables/cells/Connector';
import EntityName from 'components/tables/cells/EntityName';
import TimeStamp from 'components/tables/cells/TimeStamp';
import UserName from 'components/tables/cells/UserName';
import { ZustandProvider } from 'hooks/useZustand';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

interface RowsProps {
    data: LiveSpecsExtQuery[];
}

interface RowProps {
    row: LiveSpecsExtQuery;
}

export const tableColumns = [
    {
        field: 'catalog_name',
        headerIntlKey: 'entityTable.data.entity',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.connectorType',
    },
    {
        field: 'writes_to',
        headerIntlKey: 'entityTable.data.writesTo',
    },
    {
        field: 'updated_at',
        headerIntlKey: 'entityTable.data.lastPublished',
    },
    {
        field: 'last_pub_user_full_name',
        headerIntlKey: 'entityTable.data.lastPubUserFullName',
    },
    {
        field: null,
        headerIntlKey: 'entityTable.data.actions',
    },
];

function Row({ row }: RowProps) {
    const intl = useIntl();
    const [detailsExpanded, setDetailsExpanded] = useState(false);

    return (
        <>
            <TableRow
                sx={{
                    background: detailsExpanded ? grey[50] : null,
                }}
            >
                <EntityName name={row.catalog_name} />

                <Connector openGraph={row.connector_open_graph} />

                <ChipList strings={row.writes_to} />

                <TimeStamp time={row.updated_at} />

                <UserName
                    avatar={row.last_pub_user_avatar_url}
                    name={row.last_pub_user_full_name}
                />

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
                                // TODO (duplication) this is copied a few times
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
                            storeName="liveSpecEditor"
                        >
                            <CaptureDetails lastPubId={row.last_pub_id} />
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
                <Row row={row} key={row.id} />
            ))}
        </>
    );
}

export default Rows;
