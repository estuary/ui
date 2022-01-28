import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import { useAuth } from 'auth/Context';
import { useNavigate } from 'react-router-dom';
import IconMenu from './IconMenu';

const UserMenu = () => {
    const auth = useAuth();
    const navigate = useNavigate();

    const handleClick = () => {
        auth.signout(() => {
            navigate('/', { replace: true });
        });
    };

    return (
        <>
            <IconMenu
                ariaLabel="Open account menu"
                icon={<AccountCircleIcon />}
                identifier="account-menu"
            >
                <>
                    <MenuItem
                        onClick={() => {
                            handleClick();
                        }}
                    >
                        Log Out
                    </MenuItem>
                </>
            </IconMenu>
        </>
    );
};

export default UserMenu;
