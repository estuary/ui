import { Avatar } from '@mui/material';

interface Props {
    avatarUrl?: string | null;
    userName: string;
    size?: number;
}

const DEFAULT_SIZE = 25;

function UserAvatar({ avatarUrl, size, userName }: Props) {
    return (
        <Avatar
            src={avatarUrl ?? ''}
            sx={{
                fontSize: (size ?? DEFAULT_SIZE) / 1.5,
                height: size ?? DEFAULT_SIZE,
                width: size ?? DEFAULT_SIZE,
            }}
        >
            {userName.charAt(0)}
        </Avatar>
    );
}

export default UserAvatar;
