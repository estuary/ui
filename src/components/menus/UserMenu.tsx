/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import Logout from '@mui/icons-material/Logout';
import { Stack, SxProps, Theme, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import { Auth } from '@supabase/ui';
import UserAvatar from 'components/shared/UserAvatar';
import { useClient } from 'hooks/supabase-swr';
import { FormattedMessage, useIntl } from 'react-intl';
import { getUserDetails } from 'services/supabase';
import IconMenu from './IconMenu';

interface Props {
    iconSx: SxProps<Theme>;
}

const nonInteractiveMenuStyling: SxProps = {
    '&:hover': {
        cursor: 'revert',
    },
};

const UserMenu = ({ iconSx }: Props) => {
    const intl = useIntl();
    const supabaseClient = useClient();

    const { user } = Auth.useUser();
    const { userName, email, emailVerified, avatar } = getUserDetails(user);

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
                        <AccountCircleIcon fontSize="small" sx={iconSx} />
                    </ListItemIcon>
                    {userName}
                </MenuItem>

                <MenuItem sx={nonInteractiveMenuStyling}>
                    <ListItemIcon>
                        <EmailIcon fontSize="small" sx={iconSx} />
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
                        <Logout fontSize="small" sx={iconSx} />
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
