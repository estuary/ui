import {
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import PropTypes from 'prop-types';
import React from 'react';
import { NavLink } from 'react-router-dom';

const ListItemLinkProps = {
    icon: PropTypes.element,
    title: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    isOpen: PropTypes.bool,
};

const ListItemLink = (
    props: PropTypes.InferProps<typeof ListItemLinkProps>
) => {
    const { icon, title, link, disabled, isOpen } = props;

    const theme = useTheme();
    const isBelowMd = useMediaQuery(theme.breakpoints.down('md'));

    const renderLink = React.useMemo(
        () =>
            React.forwardRef(function (props: any, ref: any) {
                const activeClassName = 'Mui-selected';
                const disabledClassName = 'Mui-disabled';

                return (
                    <NavLink
                        to={link}
                        ref={ref}
                        {...props}
                        className={function ({ isActive }) {
                            const classList = [props.className];

                            if (disabled) {
                                classList.push(disabledClassName);
                            } else if (isActive) {
                                classList.push(activeClassName);
                            }

                            return classList.filter(Boolean).join(' ');
                        }}
                    />
                );
            }),
        [disabled, link]
    );

    return (
        <li>
            <Tooltip
                title={!isBelowMd && !isOpen ? title : ''}
                placement="right-end"
            >
                <ListItemButton
                    component={renderLink}
                    sx={{
                        whiteSpace: 'nowrap',
                    }}
                >
                    {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
                    <ListItemText primary={title} />
                </ListItemButton>
            </Tooltip>
        </li>
    );
};

export default ListItemLink;
