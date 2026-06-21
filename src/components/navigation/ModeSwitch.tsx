import {
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    useTheme,
} from '@mui/material';

import { HalfMoon, SunLight } from 'iconoir-react';
import { useIntl } from 'react-intl';

import { useColorMode } from 'src/context/Theme';

function ModeSwitch() {
    const intl = useIntl();
    const theme = useTheme();
    const colorMode = useColorMode();

    return (
        <Tooltip
            title={intl.formatMessage({
                id: 'modeSwitch.label',
            })}
            placement="right-end"
        >
            <ListItemButton
                component="a"
                onClick={colorMode.toggleColorMode}
                sx={{
                    whiteSpace: 'nowrap',
                    px: 1.5,
                }}
            >
                <ListItemIcon
                    sx={{ minWidth: 36, color: theme.palette.text.primary }}
                >
                    {theme.palette.mode === 'dark' ? (
                        <HalfMoon />
                    ) : (
                        <SunLight />
                    )}
                </ListItemIcon>

                <ListItemText>
                    {theme.palette.mode === 'dark'
                        ? intl.formatMessage({ id: 'modeSwitch.label.dark' })
                        : intl.formatMessage({ id: 'modeSwitch.label.light' })}
                </ListItemText>
            </ListItemButton>
        </Tooltip>
    );
}

export default ModeSwitch;
