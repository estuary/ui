import type { MouseEvent, ReactElement } from 'react';

import {
    ListItemIcon,
    ListItemText,
    ListItemButton as MuiListItemButton,
    Tooltip,
} from '@mui/material';

import { useIntl } from 'react-intl';
import { Link, useMatch, useResolvedPath } from 'react-router-dom';

interface LinkProps {
    icon: ReactElement;
    title: string;
    link: string;
    isOpen?: boolean;
}

const NavLink = ({ icon, title, link, isOpen }: LinkProps) => {
    const resolved = useResolvedPath(link);
    const selected = Boolean(useMatch({ path: resolved.pathname, end: false }));

    return (
        <li>
            <Tooltip title={!isOpen ? title : ''} placement="right">
                <MuiListItemButton
                    component={Link}
                    to={link}
                    selected={selected}
                    sx={{ mx: 1, my: 0.25 }}
                >
                    <ListItemIcon>{icon}</ListItemIcon>

                    <ListItemText primary={title} />
                </MuiListItemButton>
            </Tooltip>
        </li>
    );
};

interface ButtonProps {
    icon: ReactElement;
    title: string;
    onClick: (event: MouseEvent<HTMLElement>) => void;
    isOpen?: boolean;
}

export const NavButton = ({
    icon,
    title,
    onClick,
    isOpen,
}: ButtonProps) => {
    return (
        <li>
            <Tooltip title={!isOpen ? title : ''} placement="right">
                <MuiListItemButton onClick={onClick} sx={{ mx: 1, my: 0.25 }}>
                    <ListItemIcon>{icon}</ListItemIcon>

                    <ListItemText primary={title} />
                </MuiListItemButton>
            </Tooltip>
        </li>
    );
};

/** @deprecated Prefer the named `NavLink` export with a pre-translated title */
const NavLinkWrapper = ({ title, ...props }: LinkProps) => {
    const intl = useIntl();

    return <NavLink {...props} title={intl.formatMessage({ id: title })} />;
};

export default NavLinkWrapper;
