import { Tooltip, Typography, useTheme } from '@mui/material';
import {
    CheckCircle,
    Circle,
    DeleteCircle,
    InfoEmpty,
    MinusCircle,
    WarningCircle,
} from 'iconoir-react';
import { BaseTypographySx } from './shared';

type Levels = 'error' | 'warn' | 'debug' | 'trace' | 'done' | any;

interface Props {
    level: Levels;
}

// TODO (icons)
// There should be a bug icon coming from icon noir soon
function LevelIcon({ level }: Props) {
    const theme = useTheme();

    const IconComponent =
        level === 'error'
            ? DeleteCircle
            : level === 'warn'
            ? WarningCircle
            : level === 'done'
            ? CheckCircle
            : level === 'debug'
            ? MinusCircle
            : level === 'trace'
            ? Circle
            : InfoEmpty;

    const iconColor =
        level === 'error'
            ? theme.palette.error.main
            : level === 'warn'
            ? theme.palette.warning.main
            : level === 'done'
            ? theme.palette.success.main
            : theme.palette.info.main;

    return (
        <Tooltip title={level} placement="top" enterDelay={500}>
            <Typography
                sx={{ ...BaseTypographySx, color: iconColor, fontSize: 0 }}
            >
                <IconComponent fontSize={12} />
            </Typography>
        </Tooltip>
    );
}

export default LevelIcon;
