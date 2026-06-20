import type { ReactElement } from 'react';

import {
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from '@mui/material';

import { useIntl } from 'react-intl';
import { Link, useMatch, useResolvedPath } from 'react-router-dom';

interface Props {
    icon: ReactElement;
    title: string;
    link: string;
}

export const ListItemLink = ({ icon, title, link }: Props) => {
    const resolved = useResolvedPath(link);
    const selected = Boolean(
        useMatch({
            path: resolved.pathname,
            end: false, // `end: false` matches nested routes e.g. `/admin/billing`
        })
    );

    return (
        <li>
            <Tooltip title={title} placement="right-end">
                <ListItemButton
                    component={Link}
                    to={link}
                    selected={selected}
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

/**
 * @deprecated Prefer the named `ListItemLink` export, which takes a literal
 * `title` string. This wrapper translates an i18n message ID through
 * `react-intl`; it can be removed once `routes.ts` titles hold English copy.
 */
const ListItemLinkWrapper = ({ title, ...props }: Props) => {
    const intl = useIntl();

    return (
        <ListItemLink {...props} title={intl.formatMessage({ id: title })} />
    );
};

export default ListItemLinkWrapper;
