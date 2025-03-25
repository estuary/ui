import type { ShardEntityTypes } from 'stores/ShardDetail/types';
import type { TableColumns } from 'types';
import { Grid, Stack, Table, TableContainer } from '@mui/material';
import AlertBox from 'components/shared/AlertBox';
import CardWrapper from 'components/shared/CardWrapper';
import Message from 'components/shared/Error/Message';
import ExternalLink from 'components/shared/ExternalLink';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useShardDetail_error } from 'stores/ShardDetail/hooks';
import ShardAlerts from './Alerts';
import InformationTableBody from './TableBody';
import InformationTableFooter from './TableFooter';
import InformationTableHeader from './TableHeader';

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
        <CardWrapper
            message={
                <Stack direction="row" spacing={1}>
                    <FormattedMessage id="detailsPanel.shardDetails.title" />
                    <ExternalLink
                        link={intl.formatMessage({
                            id: 'detailsPanel.shardDetails.docPath',
                        })}
                    >
                        <FormattedMessage id="terms.documentation" />
                    </ExternalLink>
                </Stack>
            }
        >
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
        </CardWrapper>
    );
}

export default ShardInformation;
