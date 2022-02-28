import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
} from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import useChangeSetStore, {
    CaptureState,
    EntityMetadata,
} from '../stores/ChangeSetStore';

const getCapturesSelector = (state: CaptureState) => state.captures;

function ChangeSetTable() {
    const captureState = useChangeSetStore(getCapturesSelector);
    const captures = Object.values(captureState);

    const captureDetails: EntityMetadata[] = captures.map(
        (capture) => capture.metadata
    );

    const intl = useIntl();

    const columns = [
        {
            field: 'entityType',
            headerIntlKey: 'changeSet.data.entityType',
        },
        {
            field: 'name',
            headerIntlKey: 'changeSet.data.entity',
        },
        {
            field: 'user',
            headerIntlKey: 'changeSet.data.user',
        },
        {
            field: 'changeType',
            headerIntlKey: 'changeSet.data.details',
        },
    ];

    return (
        <Box sx={{ mx: 2 }}>
            {captures.length > 0 ? (
                <TableContainer component={Box}>
                    <Table
                        sx={{ minWidth: 350 }}
                        aria-label={intl.formatMessage({
                            id: 'changeSet.title',
                        })}
                    >
                        <TableHead>
                            <TableRow
                                sx={{
                                    background: (theme) =>
                                        theme.palette.background.default,
                                }}
                            >
                                {columns.map((column, index) => {
                                    return (
                                        <TableCell
                                            key={`${column.field}-${index}`}
                                        >
                                            <FormattedMessage
                                                id={column.headerIntlKey}
                                            />
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {captureDetails.map(
                                (
                                    {
                                        name,
                                        entityType,
                                        namespace,
                                        user,
                                        changeType,
                                    },
                                    index
                                ) => (
                                    <TableRow key={`Entity-${name}-${index}`}>
                                        <TableCell>{entityType}</TableCell>
                                        <TableCell>
                                            <Tooltip title={namespace}>
                                                <span>{name}</span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>{user}</TableCell>
                                        <TableCell>{changeType}</TableCell>
                                    </TableRow>
                                )
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : null}
        </Box>
    );
}

export default ChangeSetTable;
