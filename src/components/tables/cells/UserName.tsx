import { List, ListItemText, Stack, TableCell } from '@mui/material';

import UserAvatar from 'components/shared/UserAvatar';

interface Props {
    name: string | null;
    avatar: string | null;
    email: string;
}

function UserName({ name, avatar, email }: Props) {
    return (
        <TableCell>
            <Stack direction="row" alignItems="center">
                <UserAvatar
                    userName={name}
                    avatarUrl={avatar}
                    userEmail={email}
                />
                <List sx={{ ml: 1 }} disablePadding>
                    <ListItemText primary={name} secondary={email} />
                </List>
            </Stack>
        </TableCell>
    );
}

export default UserName;
