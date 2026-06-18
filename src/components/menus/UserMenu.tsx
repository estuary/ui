import {
    Divider,
    ListItemIcon,
    Menu,
    MenuItem,
    Stack,
    Typography,
    useTheme,
} from '@mui/material';

import { useShallow } from 'zustand/react/shallow';

import { HalfMoon, LogOut, SunLight } from 'iconoir-react';
import { FormattedMessage } from 'react-intl';

import {
    sideNavMenuAnchorOrigin,
    sideNavMenuTransformOrigin,
} from 'src/components/menus/shared';
import { supabaseClient } from 'src/context/GlobalProviders';
import { useColorMode } from 'src/context/Theme';
import { useUserStore } from 'src/context/User/useUserContextStore';

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
            anchorOrigin={sideNavMenuAnchorOrigin}
            transformOrigin={sideNavMenuTransformOrigin}
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
                onClick={(e) => {
                    e.stopPropagation();
                    colorMode.toggleColorMode();
                }}
            >
                <ListItemIcon>
                    {theme.palette.mode === 'dark' ? (
                        <SunLight />
                    ) : (
                        <HalfMoon />
                    )}
                </ListItemIcon>
                <FormattedMessage
                    id={
                        theme.palette.mode === 'dark'
                            ? 'modeSwitch.label.light'
                            : 'modeSwitch.label.dark'
                    }
                />
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
                <FormattedMessage id="cta.logout" />
            </MenuItem>
        </Menu>
    );
};
