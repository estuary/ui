import type { SxProps, Theme } from '@mui/material';
import type { MouseEvent, ReactElement, SyntheticEvent } from 'react';

import { useCallback, useRef, useState } from 'react';

import {
    List,
    ListItemIcon,
    ListItemText,
    MenuItem,
    MenuList,
    ListItemButton as MuiListItemButton,
    Paper,
    Popper,
    Tooltip,
} from '@mui/material';

import { useIntl } from 'react-intl';
import { Link, useMatch, useResolvedPath } from 'react-router-dom';
import { useUnmount } from 'react-use';

// Compact styling for the sidebar's buttons, links, and their contents.
// Scoped here so other List usages across the app keep default styling.
export const navButtonSx: SxProps<Theme> = {
    gap: '8px',
    mx: 1,
    my: 0.25,
    px: '10px',
    py: '6px',
    borderRadius: '8px',
    whiteSpace: 'nowrap',
};

const navIconSx: SxProps<Theme> = {
    minWidth: 'auto',
    color: 'inherit',
};

const navTextSlotProps = {
    primary: {
        sx: {
            fontSize: 13,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
    },
};

const sectionHeaderTextSlotProps = {
    primary: {
        sx: {
            ...navTextSlotProps.primary.sx,
            fontWeight: 500,
        },
    },
};

interface LinkProps {
    icon: ReactElement;
    title: string;
    link: string;
    isOpen?: boolean;
}

interface LinkButtonProps extends LinkProps {
    // A section header labels the sub-items nested beneath it, so it drops the
    // selected background and leans on weight instead. Without this the header
    // and the active sub-item would both read as selected.
    isSectionHeader?: boolean;
}

const NavLinkButton = ({
    icon,
    title,
    link,
    isOpen,
    isSectionHeader,
}: LinkButtonProps) => {
    const resolved = useResolvedPath(link);
    const matched = Boolean(useMatch({ path: resolved.pathname, end: false }));
    const selected = matched && !isSectionHeader;

    return (
        <Tooltip title={!isOpen ? title : ''} placement="right">
            <MuiListItemButton
                component={Link}
                to={link}
                selected={selected}
                sx={navButtonSx}
            >
                <ListItemIcon sx={navIconSx}>{icon}</ListItemIcon>

                <ListItemText
                    primary={title}
                    slotProps={
                        isSectionHeader
                            ? sectionHeaderTextSlotProps
                            : navTextSlotProps
                    }
                />
            </MuiListItemButton>
        </Tooltip>
    );
};

const NavLink = (props: LinkProps) => (
    <li>
        <NavLinkButton {...props} />
    </li>
);

interface SubLinkProps {
    title: string;
    link: string;
}

// Sub-items carry no icon, so their label is indented to line up with the
// labels of the icon-bearing items around them. They also sit tighter than the
// top-level items, whose height is set by their icon.
const subLinkSx: SxProps<Theme> = {
    ...navButtonSx,
    pl: '42px',
    py: '3px',
    my: 0,
};

const NavSubLink = ({ title, link }: SubLinkProps) => {
    const resolved = useResolvedPath(link);
    const selected = Boolean(useMatch({ path: resolved.pathname, end: false }));

    return (
        <li>
            <MuiListItemButton
                component={Link}
                to={link}
                selected={selected}
                sx={subLinkSx}
            >
                <ListItemText primary={title} slotProps={navTextSlotProps} />
            </MuiListItemButton>
        </li>
    );
};

const flyoutSx: SxProps<Theme> = {
    zIndex: 'tooltip',
};

// Nudged off the rail so the pointer crosses no gap on its way to the flyout;
// a gap would trigger the leave handler and close it.
const flyoutModifiers = [{ name: 'offset', options: { offset: [0, 2] } }];

interface SectionMenuItemProps extends SubLinkProps {
    onClick: () => void;
}

const NavSectionMenuItem = ({ title, link, onClick }: SectionMenuItemProps) => {
    const resolved = useResolvedPath(link);
    const selected = Boolean(useMatch({ path: resolved.pathname, end: false }));

    return (
        <MenuItem
            dense
            component={Link}
            to={link}
            selected={selected}
            onClick={onClick}
        >
            {title}
        </MenuItem>
    );
};

interface SectionProps extends LinkProps {
    items: SubLinkProps[];
}

/**
 * A top-level destination with sub-destinations. While the sidebar is expanded
 * the sub-items are listed beneath the active section; on the collapsed rail
 * there is no room for their labels, so hovering or focusing the section opens
 * them in a flyout beside the rail instead.
 */
export const NavSection = ({
    items,
    isOpen,
    ...sectionProps
}: SectionProps) => {
    const resolved = useResolvedPath(sectionProps.link);
    const active = Boolean(useMatch({ path: resolved.pathname, end: false }));

    const [flyoutAnchor, setFlyoutAnchor] = useState<HTMLElement | null>(null);
    // Set when the flyout was opened from the keyboard, which is the only case
    // where focus should jump into it.
    const [focusFlyout, setFocusFlyout] = useState(false);
    const closeTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

    const openFlyout = useCallback((event: SyntheticEvent<HTMLElement>) => {
        clearTimeout(closeTimeout.current);
        setFlyoutAnchor(event.currentTarget);
    }, []);

    const cancelCloseFlyout = useCallback(
        () => clearTimeout(closeTimeout.current),
        []
    );

    const closeFlyout = useCallback(() => {
        clearTimeout(closeTimeout.current);
        setFlyoutAnchor(null);
        setFocusFlyout(false);
    }, []);

    // Closing on a delay leaves room for the pointer to travel from the rail
    // into the flyout without passing through anything that would close it.
    const closeFlyoutSoon = useCallback(() => {
        clearTimeout(closeTimeout.current);
        closeTimeout.current = setTimeout(() => {
            setFlyoutAnchor(null);
            setFocusFlyout(false);
        }, 150);
    }, []);

    useUnmount(() => clearTimeout(closeTimeout.current));

    if (!isOpen) {
        const flyoutOpen = Boolean(flyoutAnchor);

        return (
            <li>
                <Tooltip
                    title={flyoutOpen ? '' : sectionProps.title}
                    placement="right"
                >
                    <MuiListItemButton
                        component={Link}
                        to={sectionProps.link}
                        aria-haspopup="menu"
                        aria-expanded={flyoutOpen}
                        selected={active}
                        sx={navButtonSx}
                        onMouseEnter={openFlyout}
                        onMouseLeave={closeFlyoutSoon}
                        onFocus={openFlyout}
                        onKeyDown={(event) => {
                            if (event.key === 'ArrowRight') {
                                openFlyout(event);
                                setFocusFlyout(true);
                            } else if (event.key === 'Escape') {
                                closeFlyout();
                            }
                        }}
                    >
                        <ListItemIcon sx={navIconSx}>
                            {sectionProps.icon}
                        </ListItemIcon>

                        <ListItemText
                            primary={sectionProps.title}
                            slotProps={navTextSlotProps}
                        />
                    </MuiListItemButton>
                </Tooltip>

                <Popper
                    anchorEl={flyoutAnchor}
                    open={flyoutOpen}
                    placement="right-start"
                    modifiers={flyoutModifiers}
                    sx={flyoutSx}
                >
                    <Paper
                        elevation={8}
                        onMouseEnter={cancelCloseFlyout}
                        onMouseLeave={closeFlyoutSoon}
                    >
                        <MenuList
                            dense
                            autoFocusItem={focusFlyout}
                            aria-label={`${sectionProps.title} navigation`}
                            onKeyDown={(event) => {
                                if (event.key === 'Escape') {
                                    closeFlyout();
                                }
                            }}
                        >
                            {items.map((item) => (
                                <NavSectionMenuItem
                                    key={item.link}
                                    {...item}
                                    onClick={closeFlyout}
                                />
                            ))}
                        </MenuList>
                    </Paper>
                </Popper>
            </li>
        );
    }

    return (
        <li>
            <NavLinkButton
                {...sectionProps}
                isOpen={isOpen}
                isSectionHeader={active}
            />

            {active ? (
                <List
                    aria-label={`${sectionProps.title} navigation`}
                    disablePadding
                >
                    {items.map((item) => (
                        <NavSubLink key={item.link} {...item} />
                    ))}
                </List>
            ) : null}
        </li>
    );
};

interface ButtonProps {
    icon: ReactElement;
    title: string;
    tooltip?: string;
    onClick: (event: MouseEvent<HTMLElement>) => void;
    isOpen?: boolean;
}

export const NavButton = ({
    icon,
    title,
    tooltip,
    onClick,
    isOpen,
}: ButtonProps) => {
    return (
        <li>
            <Tooltip title={!isOpen ? tooltip || title : ''} placement="right">
                <MuiListItemButton onClick={onClick} sx={navButtonSx}>
                    <ListItemIcon sx={navIconSx}>{icon}</ListItemIcon>

                    <ListItemText
                        primary={title}
                        slotProps={navTextSlotProps}
                    />
                </MuiListItemButton>
            </Tooltip>
        </li>
    );
};

/** @deprecated Prefer the named `NavLink` export with a pre-translated title */
const NavLinkWrapper = ({ title, ...props }: LinkProps) => {
    const intl = useIntl();

    return <NavLink {...props} title={intl.formatMessage({ id: title })} />;
};

export default NavLinkWrapper;
