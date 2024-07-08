/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Stack, SxProps, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import UserAvatar from 'components/shared/UserAvatar';
import { supabaseClient } from 'context/Supabase';
import { useUserStore } from 'context/User/useUserContextStore';
import { LogOut, Mail, ProfileCircle } from 'iconoir-react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useShallow } from 'zustand/react/shallow';
import IconMenu from './IconMenu';

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
