import { Box, Stack, TableCell } from '@mui/material';
import UserAvatar from 'components/shared/UserAvatar';

interface Props {
    name: string;
    avatar: string;
}

function UserName({ name, avatar }: Props) {
    return (
        <TableCell>
            <Stack direction="row" alignItems="center">
                <UserAvatar userName={name} avatarUrl={avatar} />
                <Box sx={{ ml: 1 }}>{name}</Box>
            </Stack>
        </TableCell>
    );
}

export default UserName;
