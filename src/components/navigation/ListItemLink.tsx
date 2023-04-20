import {
    Badge,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from '@mui/material';
import RouterLink from 'components/navigation/RouterLink';
import { NavWidths } from 'context/Theme';
import { ReactNode } from 'react';
import { useIntl } from 'react-intl';

interface Props {
    icon: ReactNode;
    link: string | any;
    title: string;
    badgeContent?: number;
    isOpen?: boolean;
    menuWidth?: number;
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
                {menuWidth === NavWidths.FULL ? (
                    <ListItemButton
                        component={typeof link === 'string' ? RouterLink : 'a'}
                        to={typeof link === 'string' ? link : undefined}
                        onClick={typeof link === 'function' ? link : undefined}
                        disableGutters
                        sx={{
                            whiteSpace: 'nowrap',
                            px: 1.5,
                        }}
                    >
                        {icon ? (
                            <ListItemIcon
                                sx={{
                                    minWidth: 36,
                                    color: (theme) =>
                                        theme.palette.text.primary,
                                }}
                            >
                                {icon}
                            </ListItemIcon>
                        ) : null}

                        <ListItemText primary={translatedTitle} />

                        <Badge badgeContent={badgeContent} />
                    </ListItemButton>
                ) : (
                    <ListItemButton
                        component={typeof link === 'string' ? RouterLink : 'a'}
                        to={typeof link === 'string' ? link : undefined}
                        onClick={typeof link === 'function' ? link : undefined}
                        disableGutters
                        sx={{
                            whiteSpace: 'nowrap',
                            px: 1.5,
                        }}
                    >
                        {icon ? (
                            <ListItemIcon
                                sx={{
                                    minWidth: 36,
                                    color: (theme) =>
                                        theme.palette.text.primary,
                                }}
                            >
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
