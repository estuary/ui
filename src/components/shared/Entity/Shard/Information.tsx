import type { ShardEntityTypes } from 'src/stores/ShardDetail/types';
import type { TableColumns } from 'src/types';

import { useState } from 'react';

import {
    Box,
    Grid,
    Stack,
    Table,
    TableContainer,
    Typography,
} from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import AlertBox from 'src/components/shared/AlertBox';
import ShardAlerts from 'src/components/shared/Entity/Shard/Alerts';
import InformationTableBody from 'src/components/shared/Entity/Shard/TableBody';
import InformationTableFooter from 'src/components/shared/Entity/Shard/TableFooter';
import InformationTableHeader from 'src/components/shared/Entity/Shard/TableHeader';
import Message from 'src/components/shared/Error/Message';
import ExternalLink from 'src/components/shared/ExternalLink';
import { cardHeaderSx } from 'src/context/Theme';
import { useShardDetail_error } from 'src/stores/ShardDetail/hooks';

interface Props {
    taskTypes: ShardEntityTypes[];
    taskName: string;
}

const rowsPerPage = 3;

const columns: TableColumns[] = [
    {
        field: 'status',
        headerIntlKey: 'detailsPanel.shardDetails.status.label',
    },
    {
        field: 'id',
        headerIntlKey: 'detailsPanel.shardDetails.id.label',
    },
];

function ShardInformation({ taskName, taskTypes }: Props) {
    const intl = useIntl();

    const [page, setPage] = useState(0);

    const error = useShardDetail_error();

    return (
        <Box style={{ flexGrow: 1 }}>
            <Stack direction="row" spacing={1} style={{ marginBottom: 8 }}>
                <Typography component="div" sx={{ ...cardHeaderSx, mr: 3 }}>
                    {intl.formatMessage({
                        id: 'detailsPanel.shardDetails.title',
                    })}
                </Typography>

                <ExternalLink
                    link={intl.formatMessage({
                        id: 'detailsPanel.shardDetails.docPath',
                    })}
                >
                    <FormattedMessage id="terms.documentation" />
                </ExternalLink>
            </Stack>

            {error ? (
                <AlertBox
                    severity="error"
                    short
                    title={
                        <FormattedMessage id="detailsPanel.shardDetails.fetchError" />
                    }
                >
                    <Message error={error} />
                </AlertBox>
            ) : (
                <>
                    <ShardAlerts taskName={taskName} taskTypes={taskTypes} />

                    <ShardAlerts
                        showWarnings
                        taskName={taskName}
                        taskTypes={taskTypes}
                    />

                    <Grid item xs={12}>
                        <TableContainer>
                            <Table size="small">
                                <InformationTableHeader columns={columns} />

                                <InformationTableBody
                                    taskTypes={taskTypes}
                                    columns={columns}
                                    page={page}
                                    rowsPerPage={rowsPerPage}
                                    taskName={taskName}
                                />

                                <InformationTableFooter
                                    changePage={(_event, newPage) => {
                                        setPage(newPage);
                                    }}
                                    page={page}
                                    rowsPerPage={rowsPerPage}
                                    taskName={taskName}
                                    taskTypes={taskTypes}
                                />
                            </Table>
                        </TableContainer>
                    </Grid>
                </>
            )}
        </Box>
    );
}

export default ShardInformation;
