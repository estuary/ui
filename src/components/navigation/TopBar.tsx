import { Stack, Toolbar } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';

import { HeaderPill } from 'src/components/AgentSkills/HeaderPill';
import CompanyLogo from 'src/components/graphics/CompanyLogo';
import CompanyMark from 'src/components/graphics/CompanyMark';
import SidePanelDocsOpenButton from 'src/components/sidePanelDocs/OpenButton';
import { UpdateAlert } from 'src/components/UpdateAlert';

interface TopbarProps {
    navigationOpen?: boolean;
}

const Topbar = ({ navigationOpen = true }: TopbarProps) => {
    return (
        <MuiAppBar>
            <Toolbar
                variant="dense"
                sx={{
                    pl: '19px !important',
                    minHeight: 48,
                    justifyContent: 'space-between',
                }}
            >
                {navigationOpen ? <CompanyLogo /> : <CompanyMark />}

                <Stack
                    direction="row"
                    spacing={2}
                    sx={{ alignItems: 'center' }}
                >
                    <HeaderPill />
                    <UpdateAlert />
                    <SidePanelDocsOpenButton />
                </Stack>
            </Toolbar>
        </MuiAppBar>
    );
};

export default Topbar;
