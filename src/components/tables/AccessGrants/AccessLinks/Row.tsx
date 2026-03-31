import type { InviteErrorProps } from 'src/components/tables/AccessGrants/AccessLinks';
import type { InviteLink } from 'src/gql-types/graphql';

import { Button, TableCell, TableRow, Typography } from '@mui/material';

import { useIntl } from 'react-intl';
import { useMutation } from 'urql';

import { DELETE_INVITE_LINK } from 'src/api/gql/inviteLinks';
import { CopyAccessLink } from 'src/components/tables/cells/CopyAccessLink';
import TimeStamp from 'src/components/tables/cells/TimeStamp';

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

            <CopyAccessLink
                token={row.token}
                ssoProviderId={row.ssoProviderId}
            />

            <TimeStamp time={row.createdAt} />

            <TableCell sx={{ width: 50 }}>
                <Button
                    onClick={handleDelete}
                    disabled={fetching}
                    variant="text"
                    size="small"
                    aria-label={intl.formatMessage({ id: 'cta.delete' })}
                >
                    {intl.formatMessage({ id: 'cta.remove' })}
                </Button>
            </TableCell>
        </TableRow>
    );
}
