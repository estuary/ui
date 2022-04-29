import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { Box } from '@mui/material';

interface Props {
    size?: number;
    iconPath: string | undefined;
}

const defaultSize = 20;

function ConnectorIcon({ size = defaultSize, iconPath }: Props) {
    return (
        <Box style={{ height: size, width: size }}>
            {iconPath ? (
                <img
                    width={size}
                    height={size}
                    src={iconPath}
                    loading="lazy"
                    alt=""
                />
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
