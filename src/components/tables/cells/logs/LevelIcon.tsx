import { Tooltip, Typography, useTheme } from '@mui/material';
import { LogLevels } from 'components/tables/Logs/types';
import {
    CheckCircle,
    Circle,
    InfoCircle,
    MinusCircle,
    WarningCircle,
    XmarkCircle,
} from 'iconoir-react';
import { BaseTypographySx } from './shared';

interface Props {
    level: LogLevels;
}

// TODO (icons)
// There should be a bug icon coming from icon noir soon
function LevelIcon({ level }: Props) {
    const theme = useTheme();

    const IconComponent =
        level === 'error'
            ? XmarkCircle
            : level === 'warn'
            ? WarningCircle
            : level === 'done'
            ? CheckCircle
            : level === 'debug'
            ? MinusCircle
            : level === 'trace'
            ? Circle
            : InfoCircle;

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
