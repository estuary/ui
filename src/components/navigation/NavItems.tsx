import type { SxProps, Theme } from '@mui/material';
import type { MouseEvent, ReactElement } from 'react';

import {
    ListItemIcon,
    ListItemText,
    ListItemButton as MuiListItemButton,
    Tooltip,
} from '@mui/material';

import { useIntl } from 'react-intl';
import { Link, useMatch, useResolvedPath } from 'react-router-dom';

// Compact styling for the sidebar's buttons, links, and their contents.
// Scoped here so other List usages across the app keep default styling.
export const navButtonSx: SxProps<Theme> = {
    gap: '8px',
    mx: 1,
    my: 0.25,
    px: '10px',
    py: '6px',
    borderRadius: '8px',
    whiteSpace: 'nowrap',
};

const navIconSx: SxProps<Theme> = {
    minWidth: 'auto',
    color: 'inherit',
};

const navTextSlotProps = {
    primary: {
        sx: {
            fontSize: 13,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
    },
};

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
                    sx={navButtonSx}
                >
                    <ListItemIcon sx={navIconSx}>{icon}</ListItemIcon>

                    <ListItemText
                        primary={title}
                        slotProps={navTextSlotProps}
                    />
                </MuiListItemButton>
            </Tooltip>
        </li>
    );
};

interface ButtonProps {
    icon: ReactElement;
    title: string;
    tooltip?: string;
    onClick: (event: MouseEvent<HTMLElement>) => void;
    isOpen?: boolean;
}

export const NavButton = ({
    icon,
    title,
    tooltip,
    onClick,
    isOpen,
}: ButtonProps) => {
    return (
        <li>
            <Tooltip title={!isOpen ? tooltip || title : ''} placement="right">
                <MuiListItemButton onClick={onClick} sx={navButtonSx}>
                    <ListItemIcon sx={navIconSx}>{icon}</ListItemIcon>

                    <ListItemText
                        primary={title}
                        slotProps={navTextSlotProps}
                    />
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
