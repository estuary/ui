import { MouseEvent, useEffect, useState } from 'react';

import { Entity, TableColumns } from 'types';
import { FormattedMessage, useIntl } from 'react-intl';

import {
    Grid,
    Stack,
    SxProps,
    Table,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    Theme,
    Typography,
    useTheme,
} from '@mui/material';

import CardWrapper from 'components/admin/Billing/CardWrapper';
import MessageWithLink from 'components/content/MessageWithLink';
import { useEditorStore_specs } from 'components/editor/Store/hooks';
import AlertBox from 'components/shared/AlertBox';
import ExternalLink from 'components/shared/ExternalLink';

import { semiTransparentBackground } from 'context/Theme';

import { LiveSpecsQuery_spec } from 'hooks/useLiveSpecs';

import {
    useShardDetail_error,
    useShardDetail_getTaskShards,
    useShardDetail_shards,
} from 'stores/ShardDetail/hooks';

import { Shard } from 'data-plane-gateway/types/shard_client';

import ShardErrors from './Errors';
import InformationTableBody from './TableBody';

interface Props {
    entityType?: Entity;
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

function ShardInformation({ entityType }: Props) {
    const theme = useTheme();
    const intl = useIntl();

    const [page, setPage] = useState(0);
    const [taskShards, setTaskShards] = useState<Shard[] | null>(null);

    const shards = useShardDetail_shards();
    const error = useShardDetail_error();
    const getTaskShards = useShardDetail_getTaskShards();

    const specs = useEditorStore_specs<LiveSpecsQuery_spec>({
        localScope: true,
    });

    useEffect(() => {
        if (specs && specs.length > 0) {
            setTaskShards(
                getTaskShards(
                    specs.find(({ spec_type }) => spec_type === entityType)
                        ?.catalog_name,
                    shards
                )
            );
        }
    }, [setTaskShards, getTaskShards, entityType, specs, shards]);

    const changePage = (
        _event: MouseEvent<HTMLButtonElement> | null,
        newPage: number
    ) => setPage(newPage);

    const tableHeaderFooterSx: SxProps<Theme> = {
        bgcolor: semiTransparentBackground[theme.palette.mode],
    };

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
                    <MessageWithLink messageID="error.message" />
                </AlertBox>
            ) : (
                <>
                    <ShardErrors shards={taskShards} />

                    <Grid item xs={12}>
                        <TableContainer>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ ...tableHeaderFooterSx }}>
                                        {columns.map((column, index) => (
                                            <TableCell
                                                key={`${column.field}-${index}`}
                                            >
                                                <Typography>
                                                    {column.headerIntlKey ? (
                                                        <FormattedMessage
                                                            id={
                                                                column.headerIntlKey
                                                            }
                                                        />
                                                    ) : null}
                                                </Typography>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>

                                <InformationTableBody
                                    shards={taskShards}
                                    page={page}
                                    rowsPerPage={rowsPerPage}
                                    columns={columns}
                                />

                                <TableFooter>
                                    <TableRow sx={{ ...tableHeaderFooterSx }}>
                                        {taskShards && taskShards.length > 0 ? (
                                            <TablePagination
                                                count={taskShards.length}
                                                rowsPerPageOptions={[
                                                    rowsPerPage,
                                                ]}
                                                rowsPerPage={rowsPerPage}
                                                page={page}
                                                onPageChange={changePage}
                                            />
                                        ) : null}
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </TableContainer>
                    </Grid>
                </>
            )}
        </CardWrapper>
    );
}

export default ShardInformation;
