import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import Logout from '@mui/icons-material/Logout';
import { Avatar } from '@mui/material';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import { useAuth } from '../../context/Auth';
import IconMenu from './IconMenu';

const UserMenu = () => {
    const { logout, user } = useAuth();
    const userName = user?.ext.displayName;
    const email = user?.ext.email;

    const handleClick = () => {
        void logout();
    };

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
                <Divider />
                <MenuItem
                    onClick={() => {
                        handleClick();
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
