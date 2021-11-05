import React from 'react';
import PropTypes from 'prop-types';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { NavLink } from 'react-router-dom';

const ListItemLinkTypes = {
    icon: PropTypes.element,
    title: PropTypes.string.isRequired,
    link: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
};

type ListItemLinkProps = PropTypes.InferProps<typeof ListItemLinkTypes>;

const ListItemLink = (props: ListItemLinkProps) => {
    const { icon, title, link, disabled } = props;

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
                        className={function (isActive: boolean) {
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
            <ListItemButton
                component={renderLink}
                sx={{
                    marginLeft: 1,
                    borderRadius: 2,
                    borderRight: 0,
                    whiteSpace: 'nowrap',
                }}
            >
                {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
                <ListItemText primary={title} />
            </ListItemButton>
        </li>
    );
};

ListItemLink.propTypes = ListItemLinkTypes;

export default ListItemLink;
