/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import Logout from '@mui/icons-material/Logout';
import { Avatar, Stack, Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import { Auth } from '@supabase/ui';
import { isEmpty } from 'lodash';
import { useClient } from 'supabase-swr';
import IconMenu from './IconMenu';

const UserMenu = () => {
    const supabaseClient = useClient();
    const { user } = Auth.useUser();

    let userName, email, emailVerified, avatar;

    if (user) {
        if (!isEmpty(user.user_metadata)) {
            userName = user.user_metadata.full_name;
            email = user.user_metadata.email;
            emailVerified = user.user_metadata.email_verified;
            avatar = user.user_metadata.avatar_url;
        } else {
            userName = user.email;
            email = user.email;
            emailVerified = false;
        }
    }

    const handleClick = async () => {
        const { error } = await supabaseClient.auth.signOut();

        console.log('error logging out', error);
    };

    if (userName && email) {
        return (
            <IconMenu
                ariaLabel="Open account menu"
                icon={<Avatar src={avatar ?? ''}>{userName.charAt(0)}</Avatar>}
                identifier="account-menu"
                tooltip="Account Settings"
            >
                <MenuItem>
                    <ListItemIcon>
                        <AccountCircleIcon fontSize="small" />
                    </ListItemIcon>
                    {userName}
                </MenuItem>
                <MenuItem>
                    <ListItemIcon>
                        <EmailIcon fontSize="small" />
                    </ListItemIcon>

                    <Stack spacing={0}>
                        <Typography>{email}</Typography>
                        {emailVerified ? (
                            <Typography variant="caption">verified</Typography>
                        ) : null}
                    </Stack>
                </MenuItem>

                <Divider />
                <MenuItem
                    onClick={() => {
                        void handleClick();
                    }}
                >
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </IconMenu>
        );
    } else {
        return null;
    }
};

export default UserMenu;
