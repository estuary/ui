import type { MouseEvent } from 'react';

import {
    Divider,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    MenuList,
    ListItemButton as MuiListItemButton,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import { HalfMoon, LogOut, MoreHoriz, SunLight } from 'iconoir-react';
import { useLeaf, withBranch } from 'react-semantic-tree';

import { navButtonSx } from 'src/components/navigation/NavItems';
import UserAvatar from 'src/components/shared/UserAvatar';
import { useColorMode } from 'src/context/Theme';
import { useUserStore } from 'src/context/User/useUserContextStore';
import { supabaseClient } from 'src/services/supabaseClient';

const UserMenuList = withBranch('User Menu')(MenuList);

interface UserButtonProps {
    onClick: (event: MouseEvent<HTMLElement>) => void;
    isOpen?: boolean;
}

export const UserButton = ({ onClick, isOpen }: UserButtonProps) => {
    const { ref: userMenuRef } = useLeaf('User Button');
    const theme = useTheme();
    const userDetails = useUserStore((state) => state.userDetails);

    if (!userDetails) {
        return null;
    }

    return (
        <MuiListItemButton ref={userMenuRef} onClick={onClick} sx={navButtonSx}>
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
    const userDetails = useUserStore((state) => state.userDetails);
    const themeButton =
        theme.palette.mode === 'dark'
            ? { label: 'Light Mode', icon: <SunLight /> }
            : { label: 'Dark Mode', icon: <HalfMoon /> };
    const { ref: themeRef } = useLeaf('Toggle Color Mode', {
        mode: theme.palette.mode,
    });
    const { ref: logoutRef } = useLeaf('Logout');

    if (!userDetails) {
        return null;
    }

    return (
        <Menu
            slots={{ list: UserMenuList }}
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
                ref={themeRef}
                onClick={() => colorMode.toggleColorMode()}
            >
                <ListItemIcon>{themeButton.icon}</ListItemIcon>
                {themeButton.label}
            </MenuItem>
            <Divider />

            <MenuItem
                ref={logoutRef}
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
