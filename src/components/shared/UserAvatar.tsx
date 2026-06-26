import { Avatar } from '@mui/material';

import defaultAvatar from 'src/images/user.png';

interface Props {
    avatarUrl: string | null;
    userName: string | null;
    userEmail: string;
    size?: number;
}

const DEFAULT_SIZE = 25;

function UserAvatar({ avatarUrl, size, userName, userEmail }: Props) {
    const avatarSize = size ?? DEFAULT_SIZE;

    return (
        <Avatar
            src={avatarUrl || defaultAvatar}
            sx={{
                fontSize: avatarSize / 1.5,
                height: avatarSize,
                width: avatarSize,
            }}
        >
            {userName ? userName.charAt(0) : userEmail.charAt(0)}
        </Avatar>
    );
}

export default UserAvatar;
