import type { MouseEvent } from 'react';

import {
    Divider,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    ListItemButton as MuiListItemButton,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import { useShallow } from 'zustand/react/shallow';

import { HalfMoon, Key, LogOut, MoreHoriz, SunLight } from 'iconoir-react';
import { Link } from 'react-router-dom';

import { authenticatedRoutes } from 'src/app/routes';
import { navButtonSx } from 'src/components/navigation/NavItems';
import UserAvatar from 'src/components/shared/UserAvatar';
import { supabaseClient } from 'src/context/GlobalProviders';
import { useColorMode } from 'src/context/Theme';
import { useUserStore } from 'src/context/User/useUserContextStore';

interface UserButtonProps {
    onClick: (event: MouseEvent<HTMLElement>) => void;
    isOpen?: boolean;
}

export const UserButton = ({ onClick, isOpen }: UserButtonProps) => {
    const theme = useTheme();
    const userDetails = useUserStore(useShallow((state) => state.userDetails));

    if (!userDetails) {
        return null;
    }

    return (
        <MuiListItemButton onClick={onClick} sx={navButtonSx}>
            <UserAvatar
                userEmail={userDetails.email}
                userName={userDetails.userName}
                avatarUrl={userDetails.avatar}
                size={20}
            />
            <ListItemText
                primary={userDetails.email}
                slotProps={{
                    primary: {
                        fontSize: 12,
                        fontWeight: 500,
                        lineHeight: 1.3,
                        noWrap: true,
                    },
                }}
            />
            {isOpen ? (
                <MoreHoriz
                    style={{
                        flexShrink: 0,
                        color: theme.palette.text.secondary,
                    }}
                />
            ) : null}
        </MuiListItemButton>
    );
};

interface UserMenuProps {
    anchorEl: HTMLElement | null;
    onClose: () => void;
}

export const UserMenu = ({ anchorEl, onClose }: UserMenuProps) => {
    const theme = useTheme();
    const colorMode = useColorMode();
    const userDetails = useUserStore(useShallow((state) => state.userDetails));

    if (!userDetails) {
        return null;
    }

    return (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={onClose}
            onClick={onClose}
            anchorOrigin={{
                horizontal: 'left',
                vertical: 'top',
            }}
            transformOrigin={{
                horizontal: 'left',
                vertical: 'bottom',
            }}
        >
            <MenuItem disabled sx={{ opacity: '1 !important' }}>
                <Stack spacing={0}>
                    <Typography
                        sx={{
                            fontSize: 13,
                            fontWeight: 500,
                        }}
                    >
                        {userDetails.userName ?? userDetails.email}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{
                            color: 'text.secondary',
                        }}
                    >
                        {userDetails.email}
                    </Typography>
                </Stack>
            </MenuItem>

            <Divider />

            <MenuItem
                component={Link}
                to={authenticatedRoutes.settings.personalTokens.fullPath}
            >
                <ListItemIcon>
                    <Key />
                </ListItemIcon>
                Personal Tokens
            </MenuItem>

            <MenuItem onClick={() => colorMode.toggleColorMode()}>
                <ListItemIcon>
                    {theme.palette.mode === 'dark' ? (
                        <HalfMoon />
                    ) : (
                        <SunLight />
                    )}
                </ListItemIcon>
                {theme.palette.mode === 'dark' ? `Dark Mode` : `Light Mode`}
            </MenuItem>
            <Divider />

            <MenuItem
                onClick={() => {
                    void supabaseClient.auth.signOut();
                }}
            >
                <ListItemIcon>
                    <LogOut />
                </ListItemIcon>
                Logout
            </MenuItem>
        </Menu>
    );
};
