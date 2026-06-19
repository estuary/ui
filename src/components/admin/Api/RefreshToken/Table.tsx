import type { RefreshTokenInfo } from 'src/gql-types/graphql';

import { useEffect, useState } from 'react';

import {
    Box,
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from '@mui/material';

import { Trash } from 'iconoir-react';
import { FormattedMessage, useIntl } from 'react-intl';

import { useRefreshTokens } from 'src/api/gql/refreshTokens';
import { CreateRefreshTokenDialog } from 'src/components/admin/Api/RefreshToken/CreateDialog';
import { RevokeDialog } from 'src/components/admin/Api/RefreshToken/RevokeDialog';
import TimeStamp from 'src/components/tables/cells/TimeStamp';
import { useCursorPagination } from 'src/hooks/useCursorPagination';

interface RowProps {
    row: Pick<
        RefreshTokenInfo,
        'id' | 'detail' | 'createdAt' | 'uses' | 'expired'
    >;
}

function Row({ row }: RowProps) {
    const intl = useIntl();

    const [revokeOpen, setRevokeOpen] = useState(false);

    return (
        <TableRow
            sx={{
                '&:hover .revoke-action, &:focus-within .revoke-action': {
                    opacity: 1,
                },
            }}
        >
            <TimeStamp
                time={row.createdAt}
                TableCellProps={
                    row.expired ? { sx: { opacity: 0.5 } } : undefined
                }
            />

            <TableCell sx={row.expired ? { opacity: 0.5 } : undefined}>
                <Typography sx={{ textWrap: 'wrap' }}>{row.detail}</Typography>
            </TableCell>

            <TableCell sx={row.expired ? { opacity: 0.5 } : undefined}>
                {`Used ${row.uses} ${row.uses === 1 ? 'time' : 'times'}`}
            </TableCell>

            <TableCell sx={row.expired ? { opacity: 0.5 } : undefined}>
                {row.expired ? <Typography>Expired</Typography> : null}
            </TableCell>

            <TableCell>
                <IconButton
                    aria-label={intl.formatMessage({ id: 'cta.remove' })}
                    className="revoke-action"
                    color="error"
                    onClick={() => setRevokeOpen(true)}
                    size="small"
                    sx={{ opacity: 0, transition: 'opacity 100ms ease-in-out' }}
                >
                    <Trash />
                </IconButton>

                <RevokeDialog
                    open={revokeOpen}
                    onClose={() => setRevokeOpen(false)}
                    id={row.id}
                    detail={row.detail}
                />
            </TableCell>
        </TableRow>
    );
}

export function RefreshTokenTable() {
    const { currentPage, cursor, goToPage, onPageChange } =
        useCursorPagination();

    const { refreshTokens, fetching, error, pageInfo, pageSize } =
        useRefreshTokens(cursor);

    const [dialogOpen, setDialogOpen] = useState(false);

    const handlePageChange = (_event: any, page: number) => {
        onPageChange(_event, page, pageInfo?.endCursor);
    };

    // Revoking the last token on a page empties it, since the list query
    // excludes revoked tokens (a concurrent revoke elsewhere can do the same).
    // Step back so the user lands on a populated page instead of being
    // stranded on a blank one with no Previous control. Mirrors the
    // AccessLinksTable recovery.
    useEffect(() => {
        if (
            !fetching &&
            !error &&
            refreshTokens.length === 0 &&
            currentPage > 0
        ) {
            goToPage(currentPage - 1);
        }
    }, [fetching, error, refreshTokens.length, currentPage, goToPage]);

    return (
        <Box sx={{ mx: 2 }}>
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'flex-end',
                }}
            >
                <Button onClick={() => setDialogOpen(true)} variant="outlined">
                    Create Personal Token
                </Button>

                <CreateRefreshTokenDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    onCreated={() => goToPage(0)}
                />
            </Box>

            {error ? (
                <Typography color="error" sx={{ mb: 2 }}>
                    There was an error loading personal tokens.
                </Typography>
            ) : null}

            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <FormattedMessage id="entityTable.data.created" />
                            </TableCell>
                            <TableCell>Label</TableCell>
                            <TableCell>Uses</TableCell>
                            <TableCell sx={{ width: 100 }} />
                            <TableCell sx={{ width: 125 }} />
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {fetching && refreshTokens.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    sx={{ textAlign: 'center' }}
                                >
                                    <FormattedMessage id="common.loading" />
                                </TableCell>
                            </TableRow>
                        ) : refreshTokens.length === 0 && !error ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    sx={{ textAlign: 'center', p: 4 }}
                                >
                                    <Typography sx={{ py: 1 }}>
                                        No personal tokens found.
                                    </Typography>
                                    <Typography
                                        component="a"
                                        variant="body2"
                                        color="primary"
                                        onClick={() => setDialogOpen(true)}
                                        sx={{
                                            'cursor': 'pointer',
                                            '&:hover': {
                                                textDecoration: 'underline',
                                            },
                                        }}
                                    >
                                        Create one now
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            refreshTokens.map((row) => (
                                <Row key={row.id} row={row} />
                            ))
                        )}
                    </TableBody>

                    {pageInfo && refreshTokens.length > 0 ? (
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    count={-1}
                                    page={currentPage}
                                    rowsPerPage={pageSize}
                                    rowsPerPageOptions={[pageSize]}
                                    onPageChange={handlePageChange}
                                    labelDisplayedRows={({ from }) => {
                                        const to =
                                            from + refreshTokens.length - 1;
                                        return `${from}–${to}`;
                                    }}
                                    slotProps={{
                                        actions: {
                                            previousButton: {
                                                disabled:
                                                    !pageInfo.hasPreviousPage,
                                            },
                                            nextButton: {
                                                disabled: !pageInfo.hasNextPage,
                                            },
                                        },
                                    }}
                                />
                            </TableRow>
                        </TableFooter>
                    ) : null}
                </Table>
            </TableContainer>
        </Box>
    );
}
