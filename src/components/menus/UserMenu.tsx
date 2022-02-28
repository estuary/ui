import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Logout from '@mui/icons-material/Logout';
import { Avatar } from '@mui/material';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import { useAuth } from '../../context/Auth';
import IconMenu from './IconMenu';

const UserMenu = () => {
    const { logout, user } = useAuth();
    const handleClick = () => {
        void logout();
    };

    if (user) {
        return (
            <IconMenu
                ariaLabel="Open account menu"
                icon={<Avatar>{user.charAt(0)}</Avatar>}
                identifier="account-menu"
                tooltip="Account Settings"
            >
                <MenuItem>
                    <ListItemIcon>
                        <AccountCircleIcon fontSize="small" />
                    </ListItemIcon>
                    {user}
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
