import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { Avatar, Box } from '@mui/material';

interface Props {
    size?: number;
    iconPath: string | undefined;
}

const defaultSize = 20;

function ConnectorIcon({ size = defaultSize, iconPath }: Props) {
    return (
        <Box style={{ height: size, width: size }}>
            {iconPath ? (
                <Avatar
                    variant="rounded"
                    sx={{
                        background: 'white',
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
                <QuestionMarkIcon
                    sx={{
                        height: size,
                        width: size,
                    }}
                />
            )}
        </Box>
    );
}

export default ConnectorIcon;
