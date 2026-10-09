import type { InviteErrorProps } from 'src/components/tables/AccessGrants/AccessLinks';
import type { InviteLink } from 'src/gql-types/graphql';

import { IconButton, TableCell, TableRow, Typography } from '@mui/material';

import { Trash } from 'iconoir-react';
import { useMutation } from 'urql';

import { DELETE_INVITE_LINK } from 'src/api/gql/inviteLinks';
import { CopyAccessLink } from 'src/components/tables/cells/CopyAccessLink';

export function Row({
    row,
    setError,
}: InviteErrorProps & {
    row: InviteLink;
}) {
    const [{ fetching }, deleteInviteLink] = useMutation(DELETE_INVITE_LINK);

    const handleDelete = async () => {
        const result = await deleteInviteLink({ token: row.token });

        setError(result.error ?? null);
    };

    return (
        <TableRow
            sx={{
                '&:hover .remove-action, &:has(:focus-visible) .remove-action':
                    {
                        opacity: 1,
                    },
            }}
        >
            <TableCell>
                <Typography>{row.catalogPrefix}</Typography>
            </TableCell>

            <TableCell>
                <Typography>{row.capability}</Typography>
            </TableCell>

            <TableCell>
                <Typography>
                    {row.singleUse ? 'Single use' : 'Multi-use'}
                </Typography>
            </TableCell>

            <TableCell sx={{ width: 150 }}>
                <CopyAccessLink
                    token={row.token}
                    ssoProviderId={row.ssoProviderId}
                />
            </TableCell>

            <TableCell sx={{ width: 30 }}>
                <IconButton
                    onClick={handleDelete}
                    disabled={fetching}
                    className="remove-action"
                    color="error"
                    size="small"
                    aria-label="Delete"
                    sx={{ opacity: 0, transition: 'opacity 100ms ease-in-out' }}
                >
                    <Trash />
                </IconButton>
            </TableCell>
        </TableRow>
    );
}
