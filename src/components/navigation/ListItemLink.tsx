import {
    Badge,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from '@mui/material';
import RouterLink from 'components/navigation/RouterLink';
import { ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { Widths } from '../../AppLayout';

interface Props {
    icon: ReactNode;
    title: string;
    link: string | any;
    isOpen?: boolean;
    menuWidth?: number;
    badgeContent?: number;
    tooltipDelay?: number;
}

const ListItemLink = ({
    icon,
    title,
    link,
    isOpen,
    menuWidth,
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
                placement="right-end"
                enterDelay={tooltipDelay ? tooltipDelay : undefined}
            >
                {menuWidth === Widths.FULL ? (
                    <ListItemButton
                        component={typeof link === 'string' ? RouterLink : 'a'}
                        to={typeof link === 'string' ? link : undefined}
                        onClick={typeof link === 'function' ? link : undefined}
                        sx={{
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
                        <ListItemText primary={translatedTitle} />
                        <Badge badgeContent={badgeContent} />
                    </ListItemButton>
                ) : (
                    <ListItemButton
                        component={typeof link === 'string' ? RouterLink : 'a'}
                        to={typeof link === 'string' ? link : undefined}
                        onClick={typeof link === 'function' ? link : undefined}
                        sx={{
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {icon ? (
                            <ListItemIcon>
                                <Badge badgeContent={badgeContent}>
                                    {icon}
                                </Badge>
                            </ListItemIcon>
                        ) : null}
                        <ListItemText primary={translatedTitle} />
                    </ListItemButton>
                )}
            </Tooltip>
        </li>
    );
};

export default ListItemLink;
