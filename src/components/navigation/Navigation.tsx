import React from 'react';

import { Box, List, Stack, useTheme } from '@mui/material';

import {
    CloudDownload,
    CloudUpload,
    DatabaseScript,
    FastArrowLeft,
    HelpCircle,
    HomeSimple,
    Settings,
} from 'iconoir-react';

import { authenticatedRoutes } from 'src/app/routes';
import { Pill as AgentSkillsPill } from 'src/components/AgentSkills/Pill';
import CompanyLogo from 'src/components/graphics/CompanyLogo';
import CompanyMark from 'src/components/graphics/CompanyMark';
import { HelpMenu } from 'src/components/menus/HelpMenu';
import NavLink, { NavButton } from 'src/components/navigation/NavItems';
import { UserButton, UserMenu } from 'src/components/navigation/User';
import { UpdateAlert } from 'src/components/UpdateAlert';
import { useNavigationStore } from 'src/stores/useNavigationStore';

const NavWidths = {
    RAIL: 58,
    FULL: 200,
} as const;

export const Navigation = () => {
    const theme = useTheme();

    const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement | null>(
        null
    );

    const [helpAnchor, setHelpAnchor] = React.useState<HTMLElement | null>(
        null
    );

    const open = useNavigationStore((state) => state.open);
    const toggleOpen = useNavigationStore((state) => state.toggleOpen);

    return (
        <Box
            sx={{
                height: '100%',
                width: open ? NavWidths.FULL : NavWidths.RAIL,
                flexShrink: 0,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                background: theme.palette.background.default,
                boxSizing: 'border-box',
                transition: theme.transitions.create('width', {
                    duration: theme.transitions.duration.shortest,
                }),
            }}
        >
            <Stack
                sx={{
                    height: '100%',
                    overflowX: 'hidden',
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        // Left-anchor the brand in both states. The drawer
                        // animates its width on collapse; centering would fling
                        // the mark toward the middle of the still-wide rail and
                        // snap it back as the width settles.
                        justifyContent: 'flex-start',
                        height: 48,
                        px: 2.5,
                    }}
                >
                    {open ? <CompanyLogo /> : <CompanyMark />}
                </Box>

                <List aria-label="Toggle Navigation">
                    <NavLink
                        icon={<HomeSimple />}
                        title={authenticatedRoutes.home.title}
                        link={authenticatedRoutes.home.path}
                        isOpen={open}
                    />
                    <NavLink
                        icon={<CloudUpload />}
                        title={authenticatedRoutes.captures.title}
                        link={authenticatedRoutes.captures.path}
                        isOpen={open}
                    />
                    <NavLink
                        icon={<DatabaseScript />}
                        title={authenticatedRoutes.collections.title}
                        link={authenticatedRoutes.collections.path}
                        isOpen={open}
                    />
                    <NavLink
                        icon={<CloudDownload />}
                        title={authenticatedRoutes.materializations.title}
                        link={authenticatedRoutes.materializations.path}
                        isOpen={open}
                    />
                    <NavLink
                        icon={<Settings />}
                        title={authenticatedRoutes.admin.title}
                        link={authenticatedRoutes.admin.path}
                        isOpen={open}
                    />
                </List>

                <Box sx={{ mt: 'auto', pb: 1 }}>
                    <UpdateAlert isOpen={open} />

                    <Box sx={{ mx: 1, my: 0.25 }}>
                        <AgentSkillsPill />
                    </Box>

                    <NavButton
                        icon={<HelpCircle />}
                        title="Help"
                        onClick={(e) => setHelpAnchor(e.currentTarget)}
                        isOpen={open}
                    />
                    <HelpMenu
                        anchorEl={helpAnchor}
                        onClose={() => setHelpAnchor(null)}
                    />

                    <NavButton
                        icon={
                            <FastArrowLeft
                                style={{
                                    transform: open
                                        ? 'scaleX(1)'
                                        : 'scaleX(-1)',
                                    transition: 'all 50ms ease-in-out',
                                }}
                            />
                        }
                        title="Collapse"
                        onClick={toggleOpen}
                        isOpen={open}
                    />

                    <UserButton
                        onClick={(e) => setMenuAnchor(e.currentTarget)}
                        isOpen={open}
                    />
                    <UserMenu
                        anchorEl={menuAnchor}
                        onClose={() => setMenuAnchor(null)}
                    />
                </Box>
            </Stack>
        </Box>
    );
};
