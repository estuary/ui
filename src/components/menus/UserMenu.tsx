/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { SxProps } from '@mui/material';

import { Stack, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';

import { useShallow } from 'zustand/react/shallow';

import { Key, LogOut, Mail, ProfileCircle } from 'iconoir-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { authenticatedRoutes } from 'src/app/routes';
import IconMenu from 'src/components/menus/IconMenu';
import UserAvatar from 'src/components/shared/UserAvatar';
import { supabaseClient } from 'src/context/GlobalProviders';
import { useUserStore } from 'src/context/User/useUserContextStore';

interface Props {
    iconColor: string;
}

const nonInteractiveMenuStyling: SxProps = {
    '&:hover': {
        cursor: 'revert',
    },
};

const UserMenu = ({ iconColor }: Props) => {
    const intl = useIntl();
    const userDetails = useUserStore(useShallow((state) => state.userDetails));

    const handlers = {
        logout: async () => {
            await supabaseClient.auth.signOut();
        },
    };

    if (userDetails) {
        const { avatar, email, emailVerified, userName } = userDetails;
        return (
            <IconMenu
                ariaLabel={intl.formatMessage({ id: 'accountMenu.ariaLabel' })}
                icon={
                    <UserAvatar
                        userEmail={email}
                        userName={userName}
                        avatarUrl={avatar}
                    />
                }
                identifier="account-menu"
                tooltip={intl.formatMessage({ id: 'accountMenu.tooltip' })}
            >
                <MenuItem sx={nonInteractiveMenuStyling}>
                    <ListItemIcon>
                        <ProfileCircle style={{ color: iconColor }} />
                    </ListItemIcon>
                    {userName}
                </MenuItem>

                <MenuItem sx={nonInteractiveMenuStyling}>
                    <ListItemIcon>
                        <Mail style={{ color: iconColor }} />
                    </ListItemIcon>

                    <Stack spacing={0}>
                        <Typography>{email}</Typography>

                        {emailVerified ? (
                            <Typography variant="caption">
                                <FormattedMessage id="accountMenu.emailVerified" />
                            </Typography>
                        ) : null}
                    </Stack>
                </MenuItem>

                <Divider />

                <MenuItem
                    component={Link}
                    to={authenticatedRoutes.settings.personalTokens.fullPath}
                >
                    <ListItemIcon>
                        <Key style={{ color: iconColor }} />
                    </ListItemIcon>

                    <FormattedMessage id="accountMenu.personalTokens" />
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        void handlers.logout();
                    }}
                >
                    <ListItemIcon>
                        <LogOut style={{ color: iconColor }} />
                    </ListItemIcon>

                    <FormattedMessage id="cta.logout" />
                </MenuItem>
            </IconMenu>
        );
    } else {
        return null;
    }
};

export default UserMenu;
