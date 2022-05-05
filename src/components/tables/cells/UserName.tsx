import { Stack, TableCell, Typography } from '@mui/material';
import UserAvatar from 'components/shared/UserAvatar';

interface Props {
    name: string;
    avatar: string;
    email: string;
}

function UserName({ name, avatar, email }: Props) {
    return (
        <TableCell>
            <Stack direction="row" alignItems="center">
                <UserAvatar userName={name} avatarUrl={avatar} />
                <Typography sx={{ ml: 1 }}>{name} </Typography>
                <Typography variant="subtitle2" sx={{ ml: 1 }}>
                    ({email})
                </Typography>
            </Stack>
        </TableCell>
    );
}

export default UserName;
