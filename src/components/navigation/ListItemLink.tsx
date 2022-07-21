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
    link: string;
    isOpen?: boolean;
    menuWidth?: number;
    badgeContent?: number;
}

const ListItemLink = ({
    icon,
    title,
    link,
    isOpen,
    menuWidth,
    badgeContent,
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
            >
                {menuWidth === Widths.FULL ? (
                    <ListItemButton
                        component={RouterLink}
                        to={link}
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
                        component={RouterLink}
                        to={link}
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
