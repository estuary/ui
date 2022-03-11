import {
    Badge,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { forwardRef, ReactNode } from 'react';
import { NavLink, NavLinkProps } from 'react-router-dom';
import { Widths } from '../../AppLayout';

interface ListItemLinkProps {
    badgeContent?: number;
    disabled?: boolean;
    icon: ReactNode;
    isOpen?: boolean;
    link: string;
    menuWidth?: number;
    title: string;
}

const ListItemLink = (props: ListItemLinkProps) => {
    const { icon, title, link, disabled, isOpen, badgeContent, menuWidth } =
        props;

    const theme = useTheme();
    const isBelowMd = useMediaQuery(theme.breakpoints.down('md'));

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

    return (
        <li>
            <Tooltip
                title={!isBelowMd && !isOpen ? title : ''}
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
                        <ListItemText primary={title} />
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
                        <ListItemText primary={title} />
                    </ListItemButton>
                )}
            </Tooltip>
        </li>
    );
};

export default ListItemLink;
