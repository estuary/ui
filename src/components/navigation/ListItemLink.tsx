import type { ReactNode } from 'react';

import {
    Badge,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from '@mui/material';

import { useIntl } from 'react-intl';

import RouterLink from 'src/components/navigation/RouterLink';

interface Props {
    icon: ReactNode;
    title: string;
    link: string | any;
    isOpen?: boolean;
    badgeContent?: number;
    tooltipDelay?: number;
}

const ListItemLink = ({
    icon,
    title,
    link,
    isOpen,
    badgeContent,
    tooltipDelay,
}: Props) => {
    const intl = useIntl();

    const translatedTitle = intl.formatMessage({
        id: title,
    });

    return (
        <li>
            <Tooltip
                title={!isOpen ? translatedTitle : ''}
                placement="right"
                enterDelay={tooltipDelay ? tooltipDelay : undefined}
            >
                <ListItemButton
                    {...(typeof link === 'string'
                        ? { component: RouterLink, to: link }
                        : { onClick: link })}
                    sx={{ mx: 1, my: 0.25 }}
                >
                    {icon ? (
                        <ListItemIcon>
                            <Badge badgeContent={badgeContent}>{icon}</Badge>
                        </ListItemIcon>
                    ) : null}

                    <ListItemText primary={translatedTitle} />
                </ListItemButton>
            </Tooltip>
        </li>
    );
};

export default ListItemLink;
