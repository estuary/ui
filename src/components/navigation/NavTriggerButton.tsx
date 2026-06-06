import type { MouseEvent, ReactNode } from 'react';

import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';

interface NavTriggerButtonProps {
    icon: ReactNode;
    label: ReactNode;
    // Whether the side nav is expanded; hides the label when collapsed.
    open: boolean;
    onClick: (event: MouseEvent<HTMLElement>) => void;
}

// A side-nav list item that opens a menu/popover anchored to itself, rather
// than navigating. Shared by the user and org switcher triggers.
const NavTriggerButton = ({
    icon,
    label,
    open,
    onClick,
}: NavTriggerButtonProps) => (
    <ListItemButton
        onClick={onClick}
        sx={{
            minHeight: 45,
            px: 1.5,
            whiteSpace: 'nowrap',
        }}
    >
        <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>

        <ListItemText
            primary={label}
            primaryTypographyProps={{
                fontSize: 14,
                noWrap: true,
            }}
            sx={{
                display: !open ? 'none' : undefined,
            }}
        />
    </ListItemButton>
);

export default NavTriggerButton;
