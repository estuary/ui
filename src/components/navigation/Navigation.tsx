//TODO (UI / UX) - These icons are not final
import {
    Box,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Toolbar,
    Tooltip,
    useTheme,
} from '@mui/material';

import {
    CloudDownload,
    CloudUpload,
    DatabaseScript,
    FastArrowLeft,
    HomeSimple,
    Settings,
} from 'iconoir-react';
import { useIntl } from 'react-intl';
import { useLocalStorage } from 'react-use';

import { authenticatedRoutes } from 'src/app/routes';
import ListItemLink from 'src/components/navigation/ListItemLink';
import ModeSwitch from 'src/components/navigation/ModeSwitch';
import { paperBackground } from 'src/context/Theme';
import { LocalStorageKeys as Keys } from 'src/utils/localStorage-utils';

const NavWidths = {
    RAIL: 48,
    FULL: 200,
} as const;

export const Navigation = () => {
    const intl = useIntl();
    const theme = useTheme();

    const [nav, setNav] = useLocalStorage<{ open: boolean }>(
        Keys.NAVIGATION_SETTINGS
    );
    const open = nav?.open ?? true;

    return (
        <Box
            sx={{
                height: '100%',
                width: open ? NavWidths.FULL : NavWidths.RAIL,
                flexShrink: 0,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                background: paperBackground[theme.palette.mode],
                boxSizing: 'border-box',
                transition: (boxTheme) =>
                    `${boxTheme.transitions.duration.shortest}ms`,
            }}
        >
            <Toolbar />

            <Stack
                sx={{
                    height: '100%',
                    justifyContent: 'space-between',
                    overflowX: 'hidden',
                }}
            >
                <Box>
                    <List
                        aria-label={intl.formatMessage({
                            id: 'navigation.toggle.ariaLabel',
                        })}
                    >
                        <ListItemLink
                            icon={<HomeSimple />}
                            title={authenticatedRoutes.home.title}
                            link={authenticatedRoutes.home.path}
                        />
                        <ListItemLink
                            icon={<CloudUpload />}
                            title={authenticatedRoutes.captures.title}
                            link={authenticatedRoutes.captures.path}
                        />
                        <ListItemLink
                            icon={<DatabaseScript />}
                            title={authenticatedRoutes.collections.title}
                            link={authenticatedRoutes.collections.path}
                        />
                        <ListItemLink
                            icon={<CloudDownload />}
                            title={authenticatedRoutes.materializations.title}
                            link={authenticatedRoutes.materializations.path}
                        />
                        <ListItemLink
                            icon={<Settings />}
                            title={authenticatedRoutes.admin.title}
                            link={authenticatedRoutes.admin.path}
                        />
                    </List>
                </Box>

                <Box>
                    <List
                        aria-label={intl.formatMessage({
                            id: 'navigation.toggle.ariaLabel',
                        })}
                        sx={{
                            py: 1,
                        }}
                    >
                        <ModeSwitch />

                        <Tooltip
                            title={intl.formatMessage({
                                id: 'navigation.toggle.ariaLabel',
                            })}
                            placement="right-end"
                            enterDelay={open ? 1000 : undefined}
                        >
                            <ListItemButton
                                onClick={() => setNav({ open: !open })}
                                sx={{
                                    minHeight: 45,
                                    px: 1.5,
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <FastArrowLeft
                                        style={{
                                            transform: open
                                                ? 'scaleX(1)'
                                                : 'scaleX(-1)',
                                            transition: 'all 50ms ease-in-out',
                                        }}
                                    />
                                </ListItemIcon>

                                <ListItemText
                                    primary={intl.formatMessage({
                                        id: 'navigation.collapse',
                                    })}
                                    sx={{
                                        display: !open ? 'none' : undefined,
                                    }}
                                />
                            </ListItemButton>
                        </Tooltip>
                    </List>
                </Box>
            </Stack>
        </Box>
    );
};
