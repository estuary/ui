import { Avatar, Box } from '@mui/material';
import { QuestionMark } from 'iconoir-react';

interface Props {
    iconPath?: string | null;
    size?: number;
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
