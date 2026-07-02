import type { MouseEvent, ReactNode } from 'react';

import {
    Badge,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from '@mui/material';

import { useIntl } from 'react-intl';
import { Link, useMatch, useResolvedPath } from 'react-router-dom';

interface Props {
    icon: ReactNode;
    title: string;
    link?: string;
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    isOpen?: boolean;
    badgeContent?: number;
    tooltipDelay?: number;
}

export const ListItemLink = ({
    icon,
    title,
    link,
    onClick,
    isOpen,
    badgeContent,
    tooltipDelay,
}: Props) => {
    // Hooks must run unconditionally; for action items (no `link`) the resolved
    // match is ignored because `selected` is gated on `link` being present.
    const resolved = useResolvedPath(link ?? '');
    const match = useMatch({ path: resolved.pathname, end: false });
    const selected = Boolean(link) && Boolean(match);

    return (
        <li>
            <Tooltip
                title={!isOpen ? title : ''}
                placement="right"
                enterDelay={tooltipDelay ? tooltipDelay : undefined}
            >
                <ListItemButton
                    {...(link
                        ? { component: Link, to: link, selected }
                        : { onClick })}
                    sx={{ mx: 1, my: 0.25 }}
                >
                    {icon ? (
                        <ListItemIcon>
                            <Badge badgeContent={badgeContent}>{icon}</Badge>
                        </ListItemIcon>
                    ) : null}

                    <ListItemText primary={title} />
                </ListItemButton>
            </Tooltip>
        </li>
    );
};

/** @deprecated Prefer the named `ListItemLink` export */
const ListItemLinkWrapper = ({ title, ...props }: Props) => {
    const intl = useIntl();

    return (
        <ListItemLink {...props} title={intl.formatMessage({ id: title })} />
    );
};

export default ListItemLinkWrapper;
