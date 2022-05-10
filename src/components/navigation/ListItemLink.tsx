import {
    Badge,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from '@mui/material';
import { forwardRef, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { NavLink, NavLinkProps } from 'react-router-dom';
import { Widths } from '../../AppLayout';

interface Props {
    icon: ReactNode;
    title: string;
    link: string;
    disabled?: boolean;
    isOpen?: boolean;
    menuWidth?: number;
    badgeContent?: number;
}

const ListItemLink = ({
    icon,
    title,
    link,
    disabled,
    isOpen,
    menuWidth,
    badgeContent,
}: Props) => {
    const intl = useIntl();

    const RouterLink = forwardRef<HTMLAnchorElement, Omit<NavLinkProps, 'to'>>(
        function NavLinkRef(refProps, ref) {
            const activeClassName = 'Mui-selected';
            const disabledClassName = 'Mui-disabled';

            return (
                <NavLink
                    to={link}
                    ref={ref}
                    {...refProps}
                    className={({ isActive }) => {
                        const classList = [refProps.className];

                        if (disabled) {
                            classList.push(disabledClassName);
                        } else if (isActive) {
                            classList.push(activeClassName);
                        }

                        return classList.filter(Boolean).join(' ');
                    }}
                />
            );
        }
    );

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
