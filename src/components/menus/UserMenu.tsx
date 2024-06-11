/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Stack, SxProps, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import UserAvatar from 'components/shared/UserAvatar';
import { supabaseClient } from 'context/Supabase';
import { useUser } from 'context/UserContext';
import { LogOut, Mail, ProfileCircle } from 'iconoir-react';
import { FormattedMessage, useIntl } from 'react-intl';
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
    const { userDetails } = useUser();

    const handlers = {
        logout: async () => {
            await supabaseClient.auth.signOut();
        },
    };

    if (userDetails) {
        return (
            <IconMenu
                ariaLabel={intl.formatMessage({ id: 'accountMenu.ariaLabel' })}
                icon={
                    <UserAvatar
                        userEmail={userDetails.email}
                        userName={userDetails.userName}
                        avatarUrl={userDetails.avatar}
                    />
                }
                identifier="account-menu"
                tooltip={intl.formatMessage({ id: 'accountMenu.tooltip' })}
            >
                <MenuItem sx={nonInteractiveMenuStyling}>
                    <ListItemIcon>
                        <ProfileCircle style={{ color: iconColor }} />
                    </ListItemIcon>
                    {userDetails.userName}
                </MenuItem>

                <MenuItem sx={nonInteractiveMenuStyling}>
                    <ListItemIcon>
                        <Mail style={{ color: iconColor }} />
                    </ListItemIcon>

                    <Stack spacing={0}>
                        <Typography>{userDetails.email}</Typography>

                        {userDetails.emailVerified ? (
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
