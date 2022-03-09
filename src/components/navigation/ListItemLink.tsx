import {
    Badge,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import PropTypes from 'prop-types';
import { forwardRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Widths } from '../../AppLayout';

const ListItemLinkProps = {
    badgeContent: PropTypes.number,
    disabled: PropTypes.bool,
    icon: PropTypes.element,
    isOpen: PropTypes.bool,
    link: PropTypes.string.isRequired,
    menuWidth: PropTypes.number,
    title: PropTypes.string.isRequired,
};

const ListItemLink = (
    props: PropTypes.InferProps<typeof ListItemLinkProps>
) => {
    const { icon, title, link, disabled, isOpen, badgeContent, menuWidth } =
        props;

    const theme = useTheme();
    const isBelowMd = useMediaQuery(theme.breakpoints.down('md'));

    const RouterLink = forwardRef<JSX.Element>(function NavLinkRef(
        refProps: any,
        ref: any
    ) {
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
    });

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
