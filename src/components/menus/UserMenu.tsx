import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import Logout from '@mui/icons-material/Logout';
import WorkIcon from '@mui/icons-material/Work';
import { Avatar } from '@mui/material';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import { supaClient } from 'services/supabase';
import IconMenu from './IconMenu';

const UserMenu = () => {
    const session = supaClient.auth.session();
    const userName = JSON.stringify(session?.user?.user_metadata);
    const email = session?.user?.email;
    const orgs: string[] = []; // TODO.

    if (userName && email) {
        return (
            <IconMenu
                ariaLabel="Open account menu"
                icon={<Avatar>{userName.charAt(0)}</Avatar>}
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
                    {email}
                </MenuItem>
                {orgs && orgs.length > 0 ? (
                    <MenuItem>
                        <ListItemIcon>
                            <WorkIcon fontSize="small" />
                        </ListItemIcon>
                        {orgs}
                    </MenuItem>
                ) : null}

                <Divider />
                <MenuItem
                    onClick={async () => {
                        supaClient.auth.signOut();
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
