import Editor from '@monaco-editor/react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    AlertTitle,
    Box,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
    useTheme,
} from '@mui/material';
import { EditorStoreState } from 'components/editor/Store';
import StatusIndicatorAndLabel from 'components/tables/Details/StatusIndicatorAndLabel';
import { Shard } from 'data-plane-gateway/types/shard_client';
import { PublicationSpecQuery } from 'hooks/usePublicationSpecs';
import { useRouteStore } from 'hooks/useRouteStore';
import { useZustandStore } from 'hooks/useZustand';
import { MouseEvent, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { shardDetailSelectors } from 'stores/ShardDetail';
import { ENTITY } from 'types';
import { getShardDetails } from 'utils/shard-utils';

interface Props {
    entityType?: ENTITY.CAPTURE | ENTITY.MATERIALIZATION;
}

const NEW_LINE = '\r\n';

function ShardInformation({ entityType }: Props) {
    const theme = useTheme();

    const [page, setPage] = useState(0);

    const [taskShards, setTaskShards] = useState<Shard[]>([]);

    const shardDetailStore = useRouteStore();
    const getTaskShards = shardDetailStore(shardDetailSelectors.getTaskShards);

    const specs = useZustandStore<
        EditorStoreState<PublicationSpecQuery>,
        EditorStoreState<PublicationSpecQuery>['specs']
    >((state) => state.specs);

    const columns: {
        field: string | null;
        headerIntlKey: string | null;
    }[] = [
        {
            field: 'status',
            headerIntlKey: 'detailsPanel.shardDetails.status.label',
        },
        {
            field: 'id',
            headerIntlKey: 'detailsPanel.shardDetails.id.label',
        },
    ];

    useEffect(() => {
        if (specs && specs.length > 0) {
            setTaskShards(
                getTaskShards(
                    specs.find(({ spec_type }) => spec_type === entityType)
                        ?.catalog_name
                )
            );
        }
    }, [specs, getTaskShards, setTaskShards, entityType]);

    const changePage = (
        event: MouseEvent<HTMLButtonElement> | null,
        newPage: number
    ) => setPage(newPage);

    const failedShardDetails = getShardDetails(taskShards).filter(
        ({ errors }) => !!errors
    );

    // A shard error component may be needed. If a failed shard is present, an error alert will appear above the shard information table with
    // the ID of the erroring shard(s) as the accordion summary text. The alert will have a title whose text will come from the lang file
    // (i.e., 'detailsPanel.shardDetails.errorTitle').
    return taskShards.length > 0 ? (
        <>
            {failedShardDetails.length > 0 && (
                <Grid item xs={12}>
                    <Alert
                        severity="error"
                        sx={{
                            '& .MuiAlert-message': {
                                width: '100%',
                            },
                        }}
                    >
                        <AlertTitle>
                            <Typography>
                                <FormattedMessage id="detailsPanel.shardDetails.errorTitle" />
                            </Typography>
                        </AlertTitle>

                        {getShardDetails(taskShards).map(
                            (shardErrors) =>
                                shardErrors.id &&
                                shardErrors.errors && (
                                    <Accordion key={shardErrors.id}>
                                        <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                        >
                                            <Typography>
                                                {shardErrors.id}
                                            </Typography>
                                        </AccordionSummary>

                                        <AccordionDetails>
                                            <Box sx={{ height: 250 }}>
                                                <Editor
                                                    defaultLanguage=""
                                                    theme={
                                                        theme.palette.mode ===
                                                        'light'
                                                            ? 'vs'
                                                            : 'vs-dark'
                                                    }
                                                    options={{
                                                        lineNumbers: 'off',
                                                        readOnly: true,
                                                        scrollBeyondLastLine:
                                                            false,
                                                        minimap: {
                                                            enabled: false,
                                                        },
                                                    }}
                                                    value={shardErrors.errors
                                                        .join(NEW_LINE)
                                                        .split(/\\n/)
                                                        .join(NEW_LINE)
                                                        .replaceAll(
                                                            /\\"/g,
                                                            '"'
                                                        )}
                                                />
                                            </Box>
                                        </AccordionDetails>
                                    </Accordion>
                                )
                        )}
                    </Alert>
                </Grid>
            )}

            <Grid item xs={12}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow
                                sx={{
                                    background:
                                        theme.palette.background.default,
                                }}
                            >
                                {columns.map((column, index) => (
                                    <TableCell key={`${column.field}-${index}`}>
                                        <Typography>
                                            {column.headerIntlKey && (
                                                <FormattedMessage
                                                    id={column.headerIntlKey}
                                                />
                                            )}
                                        </Typography>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {taskShards.map((shard) => (
                                <TableRow
                                    key={shard.spec.id}
                                    sx={{
                                        background:
                                            theme.palette.background.paper,
                                    }}
                                >
                                    <StatusIndicatorAndLabel shard={shard} />
                                </TableRow>
                            ))}
                        </TableBody>

                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    count={taskShards.length}
                                    rowsPerPageOptions={[3]}
                                    rowsPerPage={3}
                                    page={page}
                                    onPageChange={changePage}
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </TableContainer>
            </Grid>
        </>
    ) : null;
}

export default ShardInformation;
