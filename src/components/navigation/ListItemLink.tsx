import {
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import PropTypes from 'prop-types';
import { forwardRef, useMemo } from 'react';
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

    const renderLink = useMemo(() => {
        forwardRef<JSX.Element>(function NavLinkRef(refProps: any, ref: any) {
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
    }, [disabled, link]);

    return (
        <li>
            <Tooltip
                title={!isBelowMd && !isOpen ? title : ''}
                placement="right-end"
            >
                <ListItemButton
                    component={renderLink as any}
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
