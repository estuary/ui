import { Divider, Stack, Toolbar } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import { useTheme } from '@mui/material/styles';

import CompanyLogo from 'src/components/graphics/CompanyLogo';
import HelpMenu from 'src/components/menus/HelpMenu';
import UserMenu from 'src/components/menus/UserMenu';
import PageTitle from 'src/components/navigation/PageTitle';
import SidePanelDocsOpenButton from 'src/components/sidePanelDocs/OpenButton';
import { UpdateAlert } from 'src/components/UpdateAlert';
import { zIndexIncrement } from 'src/context/Theme';

const Topbar = () => {
    const theme = useTheme();

    return (
        <MuiAppBar
            sx={{
                position: 'fixed',
                zIndex: theme.zIndex.drawer + zIndexIncrement,
                boxShadow:
                    'rgb(50 50 93 / 2%) 0px 2px 5px -1px, rgb(0 0 0 / 5%) 0px 1px 3px -1px',
            }}
        >
            <Toolbar
                sx={{
                    px: 1,
                    justifyContent: 'space-between',
                }}
            >
                <Stack
                    direction="row"
                    spacing={3}
                    sx={{ alignItems: 'center' }}
                    divider={<Divider orientation="vertical" flexItem />}
                >
                    <CompanyLogo />

                    <PageTitle />
                </Stack>

                <Stack direction="row" sx={{ alignItems: 'center' }}>
                    <UpdateAlert />

                    <HelpMenu />

                    <UserMenu iconColor={theme.palette.text.primary} />

                    <SidePanelDocsOpenButton />
                </Stack>
            </Toolbar>
        </MuiAppBar>
    );
};

export default Topbar;
