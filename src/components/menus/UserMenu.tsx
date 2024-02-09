/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { Stack, SxProps, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import UserAvatar from 'components/shared/UserAvatar';
import useClient from 'hooks/supabase-swr/hooks/useClient';
import useUserDetails from 'hooks/useUserDetails';
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
    const supabaseClient = useClient();
    const { userName, email, emailVerified, avatar } = useUserDetails();

    console.log('process.env.VITEST', process.env.VITEST);
    console.log('process.env.mode', import.meta.env.PROD);
    console.log('process.env', import.meta.env);
    console.log('supabaseClient', supabaseClient);
    console.log('UserMenu', { userName, email, emailVerified, avatar });

    const handlers = {
        logout: async () => {
            await supabaseClient.auth.signOut();
        },
    };

    if (userName && email) {
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
