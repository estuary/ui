import { Avatar } from '@mui/material';

interface Props {
    avatarUrl?: string | null;
    userName: string;
    size?: number;
}

const DEFAULT_SIZE = 25;

function UserAvatar({ avatarUrl, size, userName }: Props) {
    const avatarSize = size ?? DEFAULT_SIZE;
    return (
        <Avatar
            src={avatarUrl ?? ''}
            sx={{
                fontSize: avatarSize / 1.5,
                height: avatarSize,
                width: avatarSize,
            }}
        >
            {userName.charAt(0)}
        </Avatar>
    );
}

export default UserAvatar;
