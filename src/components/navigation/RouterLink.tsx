import { forwardRef } from 'react';

import { NavLink as BaseNavLink, NavLinkProps } from 'react-router-dom';

const RouterLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
    function NavLinkRef(refProps, ref) {
        const activeClassName = 'Mui-selected';

        return (
            <BaseNavLink
                ref={ref}
                {...refProps}
                className={({ isActive }) => {
                    const classList = [refProps.className];

                    if (isActive) {
                        classList.push(activeClassName);
                    }

                    return classList.filter(Boolean).join(' ');
                }}
            />
        );
    }
);

export default RouterLink;
