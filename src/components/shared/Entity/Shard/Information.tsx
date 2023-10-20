import {
    Grid,
    Stack,
    SxProps,
    Table,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Theme,
    Typography,
    useTheme,
} from '@mui/material';
import CardWrapper from 'components/admin/Billing/CardWrapper';
import MessageWithLink from 'components/content/MessageWithLink';
import AlertBox from 'components/shared/AlertBox';
import ExternalLink from 'components/shared/ExternalLink';
import { semiTransparentBackground } from 'context/Theme';
import { MouseEvent, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useShardDetail_error } from 'stores/ShardDetail/hooks';
import { Entity, TableColumns } from 'types';
import ShardAlerts from './Alerts';
import InformationTableBody from './TableBody';
import InformationTableFooter from './TableFooter';

interface Props {
    taskType: Entity;
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

function ShardInformation({ taskName, taskType }: Props) {
    const theme = useTheme();
    const intl = useIntl();

    const [page, setPage] = useState(0);

    const error = useShardDetail_error();

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
                    <ShardAlerts taskName={taskName} taskType={taskType} />

                    <ShardAlerts
                        showWarnings
                        taskName={taskName}
                        taskType={taskType}
                    />

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
                                    taskType={taskType}
                                    columns={columns}
                                    page={page}
                                    rowsPerPage={rowsPerPage}
                                    taskName={taskName}
                                />

                                <InformationTableFooter
                                    changePage={changePage}
                                    page={page}
                                    rowsPerPage={rowsPerPage}
                                    taskName={taskName}
                                    taskType={taskType}
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
