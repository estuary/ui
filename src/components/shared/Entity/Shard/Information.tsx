import type { ShardEntityTypes } from 'src/stores/ShardDetail/types';
import type { TableColumns } from 'src/types';

import { useState } from 'react';

import { Grid, Stack, Table, TableContainer, Typography } from '@mui/material';

import { FormattedMessage, useIntl } from 'react-intl';

import CardWrapper from 'src/components/shared/CardWrapper';
import { OVERVIEW_CARD_TITLE_WEIGHT } from 'src/components/shared/Entity/Details/Overview/shared';
import ShardAlerts from 'src/components/shared/Entity/Shard/Alerts';
import HydrationError from 'src/components/shared/Entity/Shard/HydrationError';
import InformationTableBody from 'src/components/shared/Entity/Shard/TableBody';
import InformationTableFooter from 'src/components/shared/Entity/Shard/TableFooter';
import InformationTableHeader from 'src/components/shared/Entity/Shard/TableHeader';
import ExternalLink from 'src/components/shared/ExternalLink';
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
        <CardWrapper
            message={
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'baseline' }}
                >
                    {/* Wrapped in an element rather than left as a bare
                        FormattedMessage: Stack's `spacing` targets child
                        elements, so a text node got no gap and the heading ran
                        straight into the link. */}
                    <Typography
                        component="span"
                        sx={{ fontWeight: OVERVIEW_CARD_TITLE_WEIGHT }}
                    >
                        <FormattedMessage id="detailsPanel.shardDetails.title" />
                    </Typography>

                    {/* Named for the question a confused reader is actually
                        asking, rather than a generic "Docs". This is the one
                        place the word "shard" is load-bearing, so it is also the
                        one place that needs an explainer. */}
                    <ExternalLink
                        link={intl.formatMessage({
                            id: 'detailsPanel.shardDetails.docPath',
                        })}
                    >
                        {intl.formatMessage({
                            id: 'detailsPanel.shardDetails.explainerLink',
                        })}
                    </ExternalLink>
                </Stack>
            }
        >
            {error ? (
                <HydrationError error={error} />
            ) : (
                <>
                    <ShardAlerts taskName={taskName} taskTypes={taskTypes} />

                    <ShardAlerts
                        showWarnings
                        taskName={taskName}
                        taskTypes={taskTypes}
                    />

                    <Grid size={{ xs: 12 }}>
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
