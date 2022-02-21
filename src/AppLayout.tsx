import { Box, Skeleton, styled } from '@mui/material';
import Topbar from 'components/header/Topbar';
import { Suspense, useState } from 'react';
import { Outlet } from 'react-router';
import Navigation from './components/navigation/Navigation';

enum Widths {
    RAIL = 63,
    FULL = 225,
}

function AppLayout() {
    const [navigationOpen, setNavigationOpen] = useState(false);
    const [navWidth, setNavigationWidth] = useState<Widths>(Widths.RAIL);

    const toggleNavigationDrawer = () => {
        setNavigationWidth(navigationOpen ? Widths.RAIL : Widths.FULL);
        setNavigationOpen(!navigationOpen);
    };

    const Root = styled(Box)(({ theme }) => ({
        [theme.breakpoints.up('md')]: {
            display: 'grid',
            gridTemplateRows: 'auto 1fr',
            gridTemplateColumns: `${navWidth}px auto`,
            gridTemplateAreas: `"header header"
            "nav main"`,
        },
    }));

    return (
        <Root>
            <Box sx={{ gridArea: 'header' }}>
                <Topbar
                    isNavigationOpen={navigationOpen}
                    onNavigationToggle={toggleNavigationDrawer}
                />
            </Box>
            <Box sx={{ gridArea: 'nav' }}>
                <Navigation
                    open={navigationOpen}
                    onNavigationToggle={toggleNavigationDrawer}
                    width={navWidth}
                />
            </Box>
            <Box sx={{ overflow: 'auto', gridArea: 'main' }}>
                <Suspense fallback={<Skeleton animation="wave" />}>
                    <Outlet />
                </Suspense>
            </Box>
        </Root>
    );
}

export default AppLayout;
