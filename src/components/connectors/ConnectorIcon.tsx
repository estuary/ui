import { Avatar, Box } from '@mui/material';

import { QuestionMark } from 'iconoir-react';

interface Props {
    size?: number;
    iconPath?: string | null;
}

const defaultSize = 20;

function ConnectorIcon({ size = defaultSize, iconPath }: Props) {
    return (
        <Box style={{ height: size, width: size }}>
            {iconPath ? (
                <Avatar
                    variant="rounded"
                    sx={{
                        background: 'transparent',
                        width: size,
                        height: size,
                    }}
                >
                    <img
                        width={size - 1}
                        height={size - 1}
                        src={iconPath}
                        loading="lazy"
                        alt=""
                        crossOrigin="anonymous"
                    />
                </Avatar>
            ) : (
                <QuestionMark
                    style={{
                        height: size,
                        width: size,
                    }}
                />
            )}
        </Box>
    );
}

export default ConnectorIcon;
