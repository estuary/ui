import type { MouseEvent, ReactNode } from 'react';

import {
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from '@mui/material';

import RouterLink from 'src/components/navigation/RouterLink';

interface Props {
    icon: ReactNode;
    title: string;
    isOpen?: boolean;
    // Hover tooltip shown when collapsed; defaults to `title`. Set it when the
    // tooltip should differ from the label (e.g. a toggle).
    tooltip?: string;
    // Pass `to` for a route link, or `onClick` for a button (e.g. a menu trigger).
    to?: string;
    onClick?: (event: MouseEvent<HTMLElement>) => void;
}

export const ListItemLink = ({
    icon,
    title,
    isOpen,
    tooltip,
    to,
    onClick,
}: Props) => {
    return (
        <li>
            <Tooltip
                title={!isOpen ? (tooltip ?? title) : ''}
                placement="right-end"
            >
                <ListItemButton
                    component={to ? RouterLink : 'a'}
                    to={to}
                    onClick={onClick}
                    disableGutters
                    sx={{
                        whiteSpace: 'nowrap',
                        px: 1.5,
                    }}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 36,
                            color: (theme) => theme.palette.text.primary,
                        }}
                    >
                        {icon}
                    </ListItemIcon>

                    <ListItemText primary={title} />
                </ListItemButton>
            </Tooltip>
        </li>
    );
};
