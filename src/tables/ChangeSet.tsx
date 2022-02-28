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
import useChangeSetStore, { CaptureState } from '../stores/ChangeSetStore';

interface CaptureDetails {
    details: string;
    entity: string;
    entityType: string;
    namespace: string;
    user: string;
}

const getCapturesSelector = (state: CaptureState) => state.captures;

function ChangeSetTable() {
    const captureSchemas = useChangeSetStore(getCapturesSelector);
    const namespaces = Object.keys(captureSchemas);

    // TODO: Get the hard coded capture details from the store.
    const captureDetails: CaptureDetails[] = namespaces.map((namespace) => {
        const entity = namespace.substring(
            namespace.lastIndexOf('/') + 1,
            namespace.length
        );

        return {
            details: 'New Entity',
            entity,
            entityType: 'Capture',
            namespace,
            user: 'cara.mel@gmail.com',
        };
    });

    const intl = useIntl();

    const columns = [
        {
            field: 'entityType',
            headerIntlKey: 'changeSet.data.entityType',
        },
        {
            field: 'entity',
            headerIntlKey: 'changeSet.data.entity',
        },
        {
            field: 'user',
            headerIntlKey: 'changeSet.data.user',
        },
        {
            field: 'details',
            headerIntlKey: 'changeSet.data.details',
        },
    ];

    return (
        <Box sx={{ mx: 2 }}>
            {namespaces.length > 0 ? (
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
                                        entityType,
                                        namespace,
                                        entity,
                                        user,
                                        details,
                                    },
                                    index
                                ) => (
                                    <TableRow key={`Entity-${entity}-${index}`}>
                                        <TableCell>{entityType}</TableCell>
                                        <TableCell>
                                            <Tooltip title={namespace}>
                                                <span>{entity}</span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>{user}</TableCell>
                                        <TableCell>{details}</TableCell>
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
