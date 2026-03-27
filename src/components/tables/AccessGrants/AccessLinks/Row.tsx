import { IconButton, TableCell, TableRow, Typography } from '@mui/material';

import CopyAccessLink from '../../cells/CopyAccessLink';
import TimeStamp from '../../cells/TimeStamp';
import { InviteErrorProps } from './Dialog';
import { Trash } from 'iconoir-react';
import { useIntl } from 'react-intl';
import { useMutation } from 'urql';

import { DELETE_INVITE_LINK } from 'src/api/gql/inviteLinks';
import { InviteLink } from 'src/gql-types/graphql';

export function Row({
    row,
    setError,
}: InviteErrorProps & {
    row: InviteLink;
}) {
    const intl = useIntl();
    const [{ fetching }, deleteInviteLink] = useMutation(DELETE_INVITE_LINK);

    const handleDelete = async () => {
        const result = await deleteInviteLink({ token: row.token });

        setError(result.error ?? null);
    };

    return (
        <TableRow hover>
            <TableCell>
                <Typography>{row.catalogPrefix}</Typography>
            </TableCell>

            <TableCell>
                <Typography>{row.capability}</Typography>
            </TableCell>

            <TableCell>
                <Typography>
                    {intl.formatMessage({
                        id: row.singleUse
                            ? 'accessGrants.table.accessLinks.label.type.singleUse'
                            : 'accessGrants.table.accessLinks.label.type.multiUse',
                    })}
                </Typography>
            </TableCell>

            <CopyAccessLink token={row.token} />

            <TimeStamp time={row.createdAt} />

            <TableCell sx={{ width: 50 }}>
                <IconButton
                    onClick={handleDelete}
                    disabled={fetching}
                    size="small"
                    sx={{ color: 'error.main' }}
                    aria-label={intl.formatMessage({ id: 'cta.delete' })}
                >
                    <Trash />
                </IconButton>
            </TableCell>
        </TableRow>
    );
}
