import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Logout from '@mui/icons-material/Logout';
import { Avatar } from '@mui/material';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import { useAuth } from 'auth/Context';
import { useNavigate } from 'react-router-dom';
import IconMenu from './IconMenu';

type UserMenuProps = {
    userName: string;
};

const UserMenu = (props: UserMenuProps) => {
    const { userName } = props;
    const auth = useAuth();
    const navigate = useNavigate();

    const handleClick = () => {
        auth.signout(() => {
            navigate('/', { replace: true });
        });
    };

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
};

export default UserMenu;
